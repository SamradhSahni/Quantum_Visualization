"""
Adaptive Grover Amplitude Amplification Thresholding Oracle
Applies r in {1, 2} Grover diffusion reflections to physically rotate probability mass
away from flat background and into candidate edge states, amplifying weak crater rims.
"""
import math
import numpy as np
from typing import Dict, Any, Tuple


def apply_grover_amplification(
    edge_probabilities: np.ndarray,
    r_iterations: int = 1
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Applies r Grover iterations: P_amplified = sin^2((2r + 1) * arcsin(sqrt(P_edge)))
    """
    r = max(0, min(2, r_iterations))
    if r == 0:
        return edge_probabilities, {
            "grover_iterations": 0,
            "amplification_gain": 1.0,
            "mean_edge_prob_before": float(np.mean(edge_probabilities)),
            "mean_edge_prob_after": float(np.mean(edge_probabilities))
        }
        
    p_in = np.clip(edge_probabilities.astype(np.float64), 0.0, 1.0)
    
    # Initial angle theta = arcsin(sqrt(P))
    # Grover rotation: theta_r = (2r + 1) * theta
    theta = np.arcsin(np.sqrt(p_in))
    theta_r = (2 * r + 1) * theta
    
    # Amplified probability
    p_amplified = np.sin(theta_r) ** 2
    
    # Clip and calculate gain on non-zero regions
    p_amplified = np.clip(p_amplified, 0.0, 1.0)
    
    non_zero_mask = p_in > 0.02
    gain = float(np.mean(p_amplified[non_zero_mask]) / max(1e-5, np.mean(p_in[non_zero_mask]))) if np.any(non_zero_mask) else 1.0
    
    metadata = {
        "grover_iterations": r,
        "amplification_gain": round(gain, 2),
        "mean_edge_prob_before": round(float(np.mean(p_in)), 4),
        "mean_edge_prob_after": round(float(np.mean(p_amplified)), 4),
        "oracle_type": "CZ Phase Reflection on QHED Difference Qubit"
    }
    
    return p_amplified, metadata

