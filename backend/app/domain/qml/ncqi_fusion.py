"""
NASA Artemis South Pole Multi-Spectral & SAR Quantum Fusion Mixer (Pillar 1.4)
Vectorized 9-qubit NCQI multi-spectral encoder (6 spatial + 3 color qubits) with barycentric
mixing across Optical Albedo, Diviner Thermal IR, and Mini-RF SAR CPR channels to compute
fused edge maps and Quantum Cryogenic Ice Candidate Scores (QCICS).
"""
import math
from typing import Any, Dict, Tuple
import numpy as np


def fuse_ncqi_multispectral(
    optical_band: np.ndarray,
    thermal_band: np.ndarray,
    sar_band: np.ndarray,
    w_opt: float = 0.20,
    w_therm: float = 0.35,
    w_sar: float = 0.45,
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Simulates 9-qubit NCQI multi-spectral edge detection and evaluates QCICS ice traps.
    P_NCQI(a, b) = sum_b w_b * 2 * sin^2((theta_{b,a} - theta_{b,b}) / 2)
    QCICS(i) = cos^2(theta_opt,i) * cos^2(theta_therm,i) * sin^2(theta_sar,i)
    """
    total_w = max(1e-6, w_opt + w_therm + w_sar)
    wo = w_opt / total_w
    wt = w_therm / total_w
    ws = w_sar / total_w

    th_opt = (optical_band.astype(np.float64) / 255.0) * (math.pi / 2.0)
    th_therm = (thermal_band.astype(np.float64) / 255.0) * (math.pi / 2.0)
    th_sar = (sar_band.astype(np.float64) / 255.0) * (math.pi / 2.0)

    # Vectorized horizontal & vertical phase differences
    d_opt_x = th_opt - np.roll(th_opt, shift=-1, axis=1)
    d_th_x = th_therm - np.roll(th_therm, shift=-1, axis=1)
    d_sar_x = th_sar - np.roll(th_sar, shift=-1, axis=1)

    p_x = (
        wo * 2.0 * (np.sin(d_opt_x / 2.0) ** 2)
        + wt * 2.0 * (np.sin(d_th_x / 2.0) ** 2)
        + ws * 2.0 * (np.sin(d_sar_x / 2.0) ** 2)
    )

    d_opt_y = th_opt - np.roll(th_opt, shift=-1, axis=0)
    d_th_y = th_therm - np.roll(th_therm, shift=-1, axis=0)
    d_sar_y = th_sar - np.roll(th_sar, shift=-1, axis=0)

    p_y = (
        wo * 2.0 * (np.sin(d_opt_y / 2.0) ** 2)
        + wt * 2.0 * (np.sin(d_th_y / 2.0) ** 2)
        + ws * 2.0 * (np.sin(d_sar_y / 2.0) ** 2)
    )

    edge_map = np.clip(np.sqrt(p_x ** 2 + p_y ** 2), 0.0, 1.0)

    # QCICS weighted dynamically by channel reliability
    raw_qcics = (np.cos(th_opt) ** 2) * (np.cos(th_therm) ** 2) * (np.sin(th_sar) ** 2)
    sensor_emphasis = 0.65 + 0.70 * ws + 0.35 * wt
    qcics_map = np.clip(raw_qcics * sensor_emphasis, 0.0, 1.0)
    ice_trap_candidates = int(np.sum(qcics_map > 0.45))

    meta = {
        "status": "success",
        "qubit_allocation": {
            "spatial_position_qubits": int(max(4, round(math.log2(max(16, optical_band.size))))),
            "color_channel_qubits": 3,
            "total_qubits": int(max(4, round(math.log2(max(16, optical_band.size))))) + 3,
        },
        "normalized_weights": {
            "optical": round(wo, 3),
            "thermal": round(wt, 3),
            "sar_cpr": round(ws, 3),
        },
        "mean_multispectral_edge_prob": round(float(np.mean(edge_map)), 4),
        "qcics_ice_traps_found": ice_trap_candidates,
        "max_ice_score": round(float(np.max(qcics_map)), 3),
        "optical_band": np.round(optical_band, 1).tolist(),
        "thermal_band": np.round(thermal_band, 1).tolist(),
        "sar_band": np.round(sar_band, 1).tolist(),
        "fused_edge_map": np.round(edge_map, 3).tolist(),
        "qcics_map": np.round(qcics_map, 3).tolist(),
    }

    return edge_map, meta


def encode_ncqi_patch(
    optical_band: np.ndarray,
    thermal_band: np.ndarray,
    sar_band: np.ndarray,
    w_opt: float = 0.50,
    w_therm: float = 0.25,
    w_sar: float = 0.25,
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """Backwards-compatible wrapper."""
    return fuse_ncqi_multispectral(
        optical_band, thermal_band, sar_band,
        w_opt=w_opt, w_therm=w_therm, w_sar=w_sar,
    )
