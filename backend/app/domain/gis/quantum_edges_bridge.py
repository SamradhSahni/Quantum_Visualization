"""
Quantum Edge Detection Bridge for Planetary 3D GIS
Executes genuine FRQI-QHED, QPIE-QHED, NEQR-Gradient, or Classical Sobel edge detection on
co-registered Lommel-Seeliger orbital radiance imagery so quantum boundary maps directly drive
Artemis lander hazard evaluation, rover trafficability, and Fitzgibbon crater extraction.
"""
from typing import Any, Dict, Tuple
import numpy as np

from backend.app.core.algorithms import (
    run_frqi_qhed,
    run_neqr_gradient,
    run_qpie_qhed,
    run_sobel,
)

GIS_EDGE_BACKBONES = {
    "FRQI_QHED": "FRQI QHED (7 Qubit Phase)",
    "QPIE_QHED": "QPIE QHED (6 Qubit Amplitude)",
    "NEQR_GRADIENT": "NEQR Reversible Subtractor",
    "SOBEL_CLASSICAL": "Classical Sobel Baseline",
}


def resolve_edge_algorithm_key(algo: str) -> str:
    """Normalizes algorithm key strings onto canonical GIS edge backbone IDs."""
    key = (algo or "FRQI_QHED").strip().upper().replace("-", "_")
    if "QPIE" in key:
        return "QPIE_QHED"
    if "NEQR" in key:
        return "NEQR_GRADIENT"
    if "SOBEL" in key or "CLASSICAL" in key:
        return "SOBEL_CLASSICAL"
    return "FRQI_QHED"


def compute_gis_quantum_edges(
    orbital_u8: np.ndarray,
    algorithm: str = "FRQI_QHED",
    threshold: float = 0.22,
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Runs real quantum (or classical baseline) edge detection on an orbital radiance uint8 matrix.
    Returns (confidence_map [0..1], binary_edges [0|1], telemetry_dict).
    """
    canon = resolve_edge_algorithm_key(algorithm)
    t_val = float(np.clip(threshold, 0.05, 0.85))

    if canon == "QPIE_QHED":
        res = run_qpie_qhed(
            orbital_u8,
            shots=None,
            halo_padding_enabled=True,
            radiometric_restore=True,
            threshold=t_val,
        )
    elif canon == "NEQR_GRADIENT":
        res = run_neqr_gradient(
            orbital_u8,
            shots=None,
            intensity_bits=8,
            halo_padding_enabled=True,
            threshold=t_val,
        )
    elif canon == "SOBEL_CLASSICAL":
        res = run_sobel(
            orbital_u8,
            threshold=t_val,
        )
    else:
        res = run_frqi_qhed(
            orbital_u8,
            shots=None,
            halo_padding_enabled=True,
            threshold=t_val,
        )

    conf = np.asarray(res["confidence_map"], dtype=np.float64)
    # Normalize detector dynamic range gently onto [0..1] while preserving each circuit's nonlinear response
    hi_ref = float(np.percentile(conf, 99.2))
    if hi_ref > 1e-6:
        conf = np.clip(conf / max(0.28, hi_ref), 0.0, 1.0)

    binary = (conf >= t_val).astype(np.float64)

    stats = {
        "algorithm": canon,
        "algorithm_display": GIS_EDGE_BACKBONES[canon],
        "edge_density_pct": round(float(np.mean(binary)) * 100.0, 2),
        "mean_edge_prob": round(float(np.mean(conf)), 4),
        "threshold_used": round(t_val, 3),
        "latency_ms": round(float(res.get("latency_ms", 0.0)), 2),
        "qubits": int(res.get("qubits", 0)),
        "storage_qubits": int(res.get("storage_qubits", res.get("qubits", 0))),
        "active_qubits": int(res.get("active_qubits", res.get("qubits", 0))),
        "cnot_depth_per_tile": int(res.get("cnot_depth_per_tile", 0)),
    }
    return conf, binary, stats
