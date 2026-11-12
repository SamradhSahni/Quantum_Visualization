"""
Multi-Spectral & SAR Quantum Image Encoding (NCQI)
Encodes 3 co-registered spectral bands (Optical Albedo, Thermal IR, Mini-RF SAR)
into a 9-qubit quantum state (6 spatial position + 3 color qubits) with a ternary mixer.
"""
import math
import numpy as np
from typing import Dict, Any, Tuple


def encode_ncqi_patch(
    optical_band: np.ndarray,
    thermal_band: np.ndarray,
    sar_band: np.ndarray,
    w_opt: float = 0.50,
    w_therm: float = 0.25,
    w_sar: float = 0.25
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Simulates 9-qubit NCQI multi-spectral edge detection.
    Interferes all three channels with user-defined ternary weights:
    P_multi(a, b) = sum_b w_b * 2 * sin^2((theta_{b,a} - theta_{b,b}) / 2)
    """
    # Normalize weights to sum to 1.0
    total_w = max(1e-6, w_opt + w_therm + w_sar)
    wo = w_opt / total_w
    wt = w_therm / total_w
    ws = w_sar / total_w
    
    # Angles for each band in [0, pi/2]
    th_opt = (optical_band.astype(np.float64) / 255.0) * (math.pi / 2.0)
    th_therm = (thermal_band.astype(np.float64) / 255.0) * (math.pi / 2.0)
    th_sar = (sar_band.astype(np.float64) / 255.0) * (math.pi / 2.0)
    
    h, w = optical_band.shape
    edge_map = np.zeros((h, w), dtype=np.float64)
    
    # Calculate horizontal and vertical multi-spectral quantum interference
    for r in range(h):
        for c in range(w):
            c_next = (c + 1) % w
            r_next = (r + 1) % h
            
            # Horizontal pass (Column interferometer)
            d_opt_x = th_opt[r, c] - th_opt[r, c_next]
            d_therm_x = th_therm[r, c] - th_therm[r, c_next]
            d_sar_x = th_sar[r, c] - th_sar[r, c_next]
            
            p_x = (
                wo * 2.0 * (math.sin(d_opt_x / 2.0) ** 2) +
                wt * 2.0 * (math.sin(d_therm_x / 2.0) ** 2) +
                ws * 2.0 * (math.sin(d_sar_x / 2.0) ** 2)
            )
            
            # Vertical pass (Row interferometer)
            d_opt_y = th_opt[r, c] - th_opt[r_next, c]
            d_therm_y = th_therm[r, c] - th_therm[r_next, c]
            d_sar_y = th_sar[r, c] - th_sar[r_next, c]
            
            p_y = (
                wo * 2.0 * (math.sin(d_opt_y / 2.0) ** 2) +
                wt * 2.0 * (math.sin(d_therm_y / 2.0) ** 2) +
                ws * 2.0 * (math.sin(d_sar_y / 2.0) ** 2)
            )
            
            edge_map[r, c] = math.sqrt(p_x ** 2 + p_y ** 2)
            
    # Normalize to [0, 255]
    max_val = np.max(edge_map)
    if max_val > 1e-6:
        edge_map_scaled = (edge_map / max_val * 255.0).astype(np.uint8)
    else:
        edge_map_scaled = np.zeros_like(edge_map, dtype=np.uint8)
        
    metadata = {
        "num_qubits": 9,
        "spatial_qubits": 6,
        "spectral_qubits": 3,
        "weights": {"optical": round(wo, 3), "thermal": round(wt, 3), "sar": round(ws, 3)},
        "shadow_rim_revealed_pct": round(float(np.mean(edge_map_scaled[optical_band < 40] > 60) * 100), 1)
    }
    
    return edge_map_scaled, metadata

