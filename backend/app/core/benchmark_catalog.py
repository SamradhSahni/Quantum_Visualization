"""
Curated Empirical Benchmark Catalog Loader
Loads and sanitizes all experimental CSV tables (results/tables/*.csv) and the matched
Qiskit Aer encoding benchmark (results/encoding_benchmark/summary.json & report data) for
interactive visualization on the Benchmark Observatory page.
"""
from __future__ import annotations

import csv
import json
import math
from pathlib import Path
from typing import Any, Dict, List, Optional

ROOT_DIR = Path(__file__).resolve().parents[3]
TABLES_DIR = ROOT_DIR / "results" / "tables"
ENCODING_DIR = ROOT_DIR / "results" / "encoding_benchmark"


def _safe_float(val: Any) -> Optional[float]:
    """Converts string/number cleanly to finite float or None (JSON-safe for inf/nan)."""
    if val is None or val == "":
        return None
    try:
        num = float(val)
        return round(num, 4) if math.isfinite(num) else None
    except (ValueError, TypeError):
        return None


def _safe_int(val: Any, default: int = 0) -> int:
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default


def _read_csv_rows(filename: str) -> List[Dict[str, Any]]:
    path = TABLES_DIR / filename
    if not path.exists():
        return []
    rows: List[Dict[str, Any]] = []
    with path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for raw in reader:
            parsed: Dict[str, Any] = {}
            for k, v in raw.items():
                if k in ("method", "Method", "image", "geometry", "degradation", "noise", "preprocessing", "patch", "patch_name", "category", "failure_mode"):
                    parsed[k] = v
                elif k in ("size", "shots", "n_qubits", "circuit_depth", "cx_count"):
                    parsed[k] = _safe_int(v)
                else:
                    parsed[k] = _safe_float(v)
            rows.append(parsed)
    return rows


def _load_encoding_benchmark_summary() -> Dict[str, Any]:
    summary_path = ENCODING_DIR / "summary.json"
    rows_8crop: List[Dict[str, Any]] = []
    if summary_path.exists():
        try:
            with summary_path.open("r", encoding="utf-8") as f:
                data = json.load(f)
            for item in data.get("summary", []):
                rows_8crop.append({
                    "method": item.get("method"),
                    "shots": int(item.get("shots", 0)),
                    "images": int(item.get("images", 8)),
                    "runs": int(item.get("runs", 8)),
                    "f1_exact": _safe_float(item.get("f1_exact")),
                    "f1_1px": _safe_float(item.get("f1_1px")),
                    "f1_2px": _safe_float(item.get("f1_2px")),
                    "pr_auc": _safe_float(item.get("pr_auc")),
                    "iou": _safe_float(item.get("iou")),
                    "coverage": _safe_float(item.get("coverage")),
                    "operator_rmse": _safe_float(item.get("operator_rmse")),
                    "elapsed_seconds": _safe_float(item.get("elapsed_seconds")),
                })
        except Exception:
            rows_8crop = []

    # Exact curated 6-crop non-overlapping subset and 10,000-resample bootstrap intervals from report.md
    rows_6crop = [
        {"method": "Canny", "shots": 0, "f1_exact": 0.0502, "f1_2px": 0.2672, "ap": 0.0332},
        {"method": "Exact-NEQR-inequality", "shots": 0, "f1_exact": 0.0686, "f1_2px": 0.2829, "ap": 0.0365},
        {"method": "Exact-gradient", "shots": 0, "f1_exact": 0.0733, "f1_2px": 0.3052, "ap": 0.0447},
        {"method": "FRQI", "shots": 1024, "f1_exact": 0.0177, "f1_2px": 0.1969, "ap": 0.0326},
        {"method": "FRQI", "shots": 8192, "f1_exact": 0.0557, "f1_2px": 0.2936, "ap": 0.0340},
        {"method": "NEQR", "shots": 1024, "f1_exact": 0.0683, "f1_2px": 0.2834, "ap": 0.0367},
        {"method": "NEQR", "shots": 8192, "f1_exact": 0.0686, "f1_2px": 0.2829, "ap": 0.0373},
        {"method": "QPIE", "shots": 1024, "f1_exact": 0.0309, "f1_2px": 0.2426, "ap": 0.0337},
        {"method": "QPIE", "shots": 8192, "f1_exact": 0.0633, "f1_2px": 0.3032, "ap": 0.0359},
        {"method": "Robinson", "shots": 0, "f1_exact": 0.0793, "f1_2px": 0.3077, "ap": 0.0464},
        {"method": "Sobel", "shots": 0, "f1_exact": 0.0796, "f1_2px": 0.3098, "ap": 0.0463},
    ]

    bootstrap_intervals = [
        {"a": "QPIE:8192", "b": "FRQI:8192", "diff": 0.0017, "ci_lo": 0.0008, "ci_hi": 0.0027},
        {"a": "QPIE:1024", "b": "FRQI:1024", "diff": 0.0021, "ci_lo": 0.0003, "ci_hi": 0.0047},
        {"a": "QPIE:8192", "b": "NEQR:8192", "diff": 0.0024, "ci_lo": -0.0029, "ci_hi": 0.0104},
        {"a": "FRQI:8192", "b": "NEQR:8192", "diff": 0.0007, "ci_lo": -0.0047, "ci_hi": 0.0083},
        {"a": "QPIE:8192", "b": "QPIE:1024", "diff": 0.0032, "ci_lo": 0.0007, "ci_hi": 0.0062},
        {"a": "FRQI:8192", "b": "FRQI:1024", "diff": 0.0036, "ci_lo": 0.0005, "ci_hi": 0.0086},
        {"a": "NEQR:8192", "b": "NEQR:1024", "diff": 0.0005, "ci_lo": 0.0000, "ci_hi": 0.0010},
        {"a": "QPIE:8192", "b": "Robinson:0", "diff": -0.0079, "ci_lo": -0.0162, "ci_hi": -0.0014},
        {"a": "FRQI:8192", "b": "Robinson:0", "diff": -0.0096, "ci_lo": -0.0183, "ci_hi": -0.0025},
        {"a": "NEQR:8192", "b": "Robinson:0", "diff": -0.0103, "ci_lo": -0.0180, "ci_hi": -0.0033},
    ]

    return {
        "protocol_totals": {
            "total_metric_records": 184,
            "quantum_runs": 144,
            "classical_control_runs": 40,
            "total_circuits": 57600,
            "total_shots": 265420800,
            "bootstrap_resamples": 10000,
            "crop_resolution": "128x128",
            "max_replay_discrepancy": "5.68e-14",
        },
        "primary_8crop": rows_8crop,
        "subset_6crop": rows_6crop,
        "bootstrap_intervals": bootstrap_intervals,
    }


def load_curated_research_suites() -> Dict[str, Any]:
    """
    Aggregates all 11 experimental tables and the Qiskit Aer encoding study into a unified
    JSON-safe research observatory payload with scientific interpretations.
    """
    grand_summary = _read_csv_rows("grand_summary.csv")
    exp1 = _read_csv_rows("exp1_representation_ablation.csv")
    exp2 = _read_csv_rows("exp2_shot_sensitivity.csv")
    exp3 = _read_csv_rows("exp3_resolution_scaling.csv")
    exp4 = _read_csv_rows("exp4_image_degradation.csv")
    exp5 = _read_csv_rows("exp5_noise_simulation.csv")
    exp6 = _read_csv_rows("exp6_geometry_ablation.csv")
    exp7 = _read_csv_rows("exp7_preprocessing.csv")
    exp8 = _read_csv_rows("exp8_sombench_benchmark.csv")
    exp9 = _read_csv_rows("exp9_resource_scaling.csv")
    exp10 = _read_csv_rows("exp10_failure_taxonomy.csv")
    timing = _read_csv_rows("timing_analysis.csv")
    classical_baselines = _read_csv_rows("classical_baseline_results.csv")
    matched_aer = _load_encoding_benchmark_summary()

    # Aggregate SomBench category stats by method across all patches
    category_map: Dict[str, str] = {}
    for row in classical_baselines:
        if row.get("patch_name") and row.get("category"):
            category_map[row["patch_name"]] = row["category"]

    for row in exp8:
        row["category"] = category_map.get(row.get("patch", ""), "lunar_patch")

    suite_interpretations = {
        "grand_summary": {
            "title": "Grand Multi Benchmark Summary",
            "what_it_tests": "Aggregates macro average Exact F1 and boundary precision across Representation Ablation, Geometry Ablation, and NASA SomBench orbital imagery.",
            "what_it_shows": "Classical Sobel (0.874 synthetic, 0.285 SomBench) and Robinson lead raw Exact F1 while NEQR Gradient closes the SomBench gap (0.262 vs 0.285) using deterministic quantum bitplane subtraction.",
        },
        "matched_aer": {
            "title": "Matched IBM Qiskit Aer Encoding Study",
            "what_it_tests": "57,600 real Qiskit Aer circuits and 265,420,800 measurement shots across 8 held out 128x128 NASA LRO WAC crater crops at 1024 and 8192 shots.",
            "what_it_shows": "Increasing shots from 1024 to 8192 cuts operator RMSE (~18.3 to ~12.9 for FRQI) and boosts Mean AP (QPIE reaches 0.0328 on 8 crops; NEQR reaches 0.0373 on the 6 non overlapping subset).",
        },
        "exp1_6_10": {
            "title": "Exp 1, 6 & 10: Geometry Ablation & Failure Taxonomy",
            "what_it_tests": "Stress tests 5 operators across 8 primitive shapes (circle, ellipse, multiple circles, 45 deg diagonal, horizontal, vertical, corner junction, irregular curve) and classifies failure modes.",
            "what_it_shows": "QPIE exhibits 1 px D64 shift DISPLACEMENT on circles (Exact F1 0.239 vs 1 px F1 0.815 and 2 px F1 0.989) and COMPLETE MISS on sparse axis aligned lines; NEQR hits 0.800 Exact F1 on 45 deg diagonals.",
        },
        "exp2": {
            "title": "Exp 2: Finite Shot Convergence Sweep",
            "what_it_tests": "Evaluates projective sampling stability across 256 to 16,384 shots for QPIE QHED and NEQR Gradient.",
            "what_it_shows": "NEQR converges deterministically above 512 shots (1.000 1 px F1 on circle), whereas QPIE amplitude sampling maintains 0.03 to 0.06 shot variance even at 16,384 shots.",
        },
        "exp3_9_timing": {
            "title": "Exp 3, 9 & Timing: Qubit Width, Circuit Depth & Latency",
            "what_it_tests": "Compares quantum register width, transpiled depth, and simulator execution latency on 4x4 and 8x8 tiles.",
            "what_it_shows": "QPIE compresses 8x8 pixels into 6 qubits with constant depth 3, while basis encoded NEQR grows to 10 qubits and depth 177 at 4 bit depth.",
        },
        "exp4_5_7": {
            "title": "Exp 4, 5 & 7: Degradation, NISQ Noise & Preprocessing",
            "what_it_tests": "Measures resilience across image noise (sigma up to 50), Gaussian blur, low contrast, illumination gradients, Aer depolarizing/readout/gate errors, and 7 preprocessors.",
            "what_it_shows": "L2 state normalization makes QPIE naturally invariant to contrast reduction and illumination gradients; Gaussian sigma=1 smoothing nearly doubles QPIE Exact F1 on circles (0.233 to 0.454).",
        },
        "exp8_sombench": {
            "title": "Exp 8: NASA LRO WAC SomBench Crater Evaluation",
            "what_it_tests": "Benchmarks real 8x8 and 16x16 NASA Lunar Reconnaissance Orbiter imagery across low angle sun, low contrast, large craters, and complex regolith.",
            "what_it_shows": "On severe low angle illumination (M1174122932CE 8x8), all 3 classical filters score 0.000 Exact F1 while QPIE QHED recovers rims (0.084 Exact F1, 0.487 2 px F1). On highland craters, NEQR beats Canny cleanly.",
        },
    }

    return {
        "status": "success",
        "suite_interpretations": suite_interpretations,
        "grand_summary": grand_summary,
        "matched_aer": matched_aer,
        "exp1_geometry": exp1,
        "exp2_shots": exp2,
        "exp3_resolution": exp3,
        "exp4_degradation": exp4,
        "exp5_nisq_noise": exp5,
        "exp6_ablation": exp6,
        "exp7_preprocessing": exp7,
        "exp8_sombench": exp8,
        "exp9_resources": exp9,
        "exp10_failure_taxonomy": exp10,
        "timing_analysis": timing,
    }

