"""
Shared 6-Method Orchestrator & Tier-2 Analytical Stage Runner
Used across routes_studio.py and routes_benchmark.py without logic duplication.
"""
from __future__ import annotations
from typing import Optional
import numpy as np

from backend.app.schemas.studio import QuantumLabConfig
from backend.app.core.algorithms import (
    apply_gaussian_regolith_noise,
    run_frqi_qhed,
    run_qpie_qhed,
    run_neqr_gradient,
    run_sobel,
    run_canny,
    run_robinson,
    extract_sobel_stages,
    extract_canny_stages,
    extract_robinson_stages,
)
from backend.app.core.metrics import (
    compute_intrinsic_quality_metrics,
    compute_comparative_rankings,
    generate_diagnostic_verdict,
    get_preset_ground_truth,
    compute_perturbation_stability,
    compute_nisq_resource_profile,
    create_consensus_overlay,
    create_error_comparison_overlay,
)
from backend.app.utils.image_io import to_base64_png, create_color_overlay


ALGO_COLORS = {
    "FRQI-QHED": [255, 121, 198],         # Electric Magenta (#FF79C6)
    "QPIE-QHED": [0, 240, 255],           # Neon Cyan (#00F0FF)
    "NEQR-Gradient": [189, 147, 249],     # Laser Purple (#BD93F9)
    "Sobel 3×3 Operator": [56, 189, 248], # Sky Blue (#38BDF8)
    "Canny 5-Stage": [255, 230, 0],       # Vivid Yellow (#FFE600)
    "Robinson 8-Compass": [57, 211, 83],  # Emerald Green (#39D353)
}


def _build_executors(cfg: QuantumLabConfig):
    """Returns parameterized callable pairs (name, fn) honoring QuantumLabConfig."""
    th_override = cfg.manual_threshold if cfg.threshold_mode == "manual" else None
    shots = None if (cfg.shots is None or cfg.shots >= 99999) else int(cfg.shots)

    return [
        (
            "FRQI-QHED",
            lambda im: run_frqi_qhed(
                im,
                shots=shots,
                shot_mode=cfg.shot_mode,
                halo_padding_enabled=cfg.halo_padding_enabled,
                variance_cull_threshold=cfg.variance_cull_threshold,
                threshold=th_override,
                threshold_mode=cfg.threshold_mode,
                post_nms_thinning=cfg.post_nms_thinning,
            ),
        ),
        (
            "QPIE-QHED",
            lambda im: run_qpie_qhed(
                im,
                shots=shots,
                shot_mode=cfg.shot_mode,
                halo_padding_enabled=cfg.halo_padding_enabled,
                variance_cull_threshold=cfg.variance_cull_threshold,
                threshold=th_override,
                threshold_mode=cfg.threshold_mode,
                post_nms_thinning=cfg.post_nms_thinning,
            ),
        ),
        (
            "NEQR-Gradient",
            lambda im: run_neqr_gradient(
                im,
                shots=shots,
                intensity_bits=cfg.neqr_bit_depth,
                bitflip_prob=cfg.neqr_bitflip_prob,
                halo_padding_enabled=cfg.halo_padding_enabled,
                variance_cull_threshold=cfg.variance_cull_threshold,
                threshold=th_override,
                threshold_mode=cfg.threshold_mode,
                post_nms_thinning=cfg.post_nms_thinning,
            ),
        ),
        (
            "Sobel 3×3 Operator",
            lambda im: run_sobel(
                im,
                threshold=th_override,
                threshold_mode=cfg.threshold_mode,
                post_nms_thinning=cfg.post_nms_thinning,
            ),
        ),
        (
            "Canny 5-Stage",
            lambda im: run_canny(
                im,
                low_th=cfg.canny_low,
                high_th=cfg.canny_high,
                sigma=cfg.canny_sigma,
                post_nms_thinning=True,
            ),
        ),
        (
            "Robinson 8-Compass",
            lambda im: run_robinson(
                im,
                threshold=th_override,
                threshold_mode=cfg.threshold_mode,
                post_nms_thinning=cfg.post_nms_thinning,
            ),
        ),
    ]


def run_six_method_benchmark(
    image: np.ndarray,
    config: Optional[QuantumLabConfig] = None,
    preset_id: Optional[str] = None,
    image_title: str = "Evaluated Target",
    include_stability: bool = False,
) -> dict:
    """
    Runs all 6 quantum & classical edge detection pipelines using a single QuantumLabConfig,
    returning compact image cards, exact/intrinsic metrics, NISQ resource profiles,
    Tri-Color Consensus map, and diagnostic verdict.
    """
    cfg = config or QuantumLabConfig()
    eval_img = apply_gaussian_regolith_noise(image, sigma=cfg.noise_gaussian_sigma, seed=42)
    gt_mask = get_preset_ground_truth(preset_id, size=eval_img.shape[0])

    executors = _build_executors(cfg)
    cards = []
    quantum_binaries = []
    classical_binaries = []
    tile_telemetry_grid = None

    for name, fn in executors:
        res = fn(eval_img)
        if tile_telemetry_grid is None and res.get("tile_telemetry_grid") is not None:
            tile_telemetry_grid = res["tile_telemetry_grid"]

        m = compute_intrinsic_quality_metrics(res["binary"], res["confidence_map"], gt_binary=gt_mask)
        nisq = compute_nisq_resource_profile(name, resolution=eval_img.shape[0], q_bits=cfg.neqr_bit_depth)

        stab = None
        if include_stability:
            stab = compute_perturbation_stability(eval_img, fn, res["binary"], sigma=8.0)

        m["active_qubits"] = nisq["active_qubits_patch"]
        m["storage_qubits"] = nisq["storage_qubits_patch"]
        m["cnot_depth_per_tile"] = nisq["cnot_depth_per_tile"]
        m["estimated_nisq_fidelity"] = nisq["estimated_nisq_fidelity"]
        m["otsu_threshold"] = res.get("otsu_threshold", res["threshold"])
        m["applied_threshold"] = res["threshold"]
        m["execution_ms"] = res["latency_ms"]
        m["histogram_bins"] = res.get("histogram_bins", [])
        m["stability_sigma"] = stab

        color = ALGO_COLORS.get(name, [255, 255, 255])
        overlay_b64 = create_color_overlay(eval_img, res["binary"], color)
        error_overlay_b64 = (
            create_error_comparison_overlay(eval_img, res["binary"], gt_mask)
            if gt_mask is not None
            else None
        )

        if res["type"] == "quantum":
            quantum_binaries.append(res["binary"])
        else:
            classical_binaries.append(res["binary"])

        cards.append(
            {
                "name": name,
                "type": res["type"],
                "qubits": nisq["storage_qubits_patch"],
                "active_qubits": nisq["active_qubits_patch"],
                "storage_qubits": nisq["storage_qubits_patch"],
                "cnot_depth_per_tile": nisq["cnot_depth_per_tile"],
                "estimated_nisq_fidelity": nisq["estimated_nisq_fidelity"],
                "latency_ms": res["latency_ms"],
                "threshold": res["threshold"],
                "otsu_threshold": res.get("otsu_threshold", res["threshold"]),
                "metrics": m,
                "edge_base64": to_base64_png((res["confidence_map"] * 255.0).astype(np.uint8)),
                "binary_base64": to_base64_png((res["binary"] * 255).astype(np.uint8)),
                "overlay_base64": overlay_b64,
                "error_overlay_base64": error_overlay_b64,
                "color_hex": "#{:02x}{:02x}{:02x}".format(*color),
            }
        )

    metrics_dict = {c["name"]: c["metrics"] for c in cards}
    rankings = compute_comparative_rankings(metrics_dict)
    champion_name = rankings[0][0] if rankings else "FRQI-QHED"
    champion_metrics = metrics_dict.get(champion_name, {})
    verdict_obj = generate_diagnostic_verdict(champion_name, champion_metrics, image_title)

    consensus_b64 = create_consensus_overlay(eval_img, quantum_binaries, classical_binaries)
    nisq_scaling = {
        "resolution": eval_img.shape[0],
        "profiles": [
            {
                "algorithm": name,
                **compute_nisq_resource_profile(name, resolution=eval_img.shape[0], q_bits=cfg.neqr_bit_depth),
            }
            for name in ["FRQI-QHED", "QPIE-QHED", "NEQR-Gradient"]
        ],
    }

    return {
        "status": "success",
        "resolution": f"{eval_img.shape[1]}x{eval_img.shape[0]}",
        "has_ground_truth": gt_mask is not None,
        "original_base64": to_base64_png(eval_img),
        "consensus_base64": consensus_b64,
        "cards": cards,
        "rankings": rankings,
        "verdict": verdict_obj.get("verdict_text", ""),
        "tile_telemetry_grid": tile_telemetry_grid,
        "nisq_scaling": nisq_scaling,
        "applied_config": cfg.model_dump(),
    }


def run_noise_stress_sweep(image: np.ndarray, config: QuantumLabConfig, preset_id: Optional[str] = None) -> dict:
    """
    Runs all 6 algorithms across Gaussian noise levels sigma = [0, 5, 10, 15, 20, 25]
    to return PFOM / SNR degradation curves for Benchmark plotting.
    """
    sigmas = [0, 5, 10, 15, 20, 25]
    # Use small size (<=96px) for fast synchronous curve evaluation
    small = image if image.shape[0] <= 96 else image[::2, ::2]
    gt_small = get_preset_ground_truth(preset_id, size=small.shape[0])

    # Baseline clean binary maps for reference-free stability curve if no GT
    executors = _build_executors(config)
    clean_bins = {}
    for name, fn in executors:
        clean_bins[name] = fn(small)["binary"] > 0

    series = {name: [] for name, _ in executors}
    for s in sigmas:
        noisy = apply_gaussian_regolith_noise(small, sigma=float(s), seed=100 + s)
        for name, fn in executors:
            res = fn(noisy)
            m = compute_intrinsic_quality_metrics(res["binary"], res["confidence_map"], gt_binary=gt_small)
            if gt_small is not None and m.get("pfom_exact") is not None:
                score = m["pfom_exact"]
            else:
                b_noisy = res["binary"] > 0
                b_clean = clean_bins[name]
                denom = int(np.sum(b_clean)) + int(np.sum(b_noisy))
                score = round(float((2.0 * int(np.sum(b_clean & b_noisy))) / max(1, denom)), 4)
            series[name].append({"sigma": s, "score": score, "snr": m["snr"]})

    return {"sigmas": sigmas, "series": series, "metric_label": "Exact PFOM" if gt_small is not None else "Noise Stability (Dice)"}

