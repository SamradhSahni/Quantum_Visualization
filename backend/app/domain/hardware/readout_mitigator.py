"""
Readout Assignment Confusion Matrix & Tensored Calibration Inverter (Pillar 3.4)
Constructs single-qubit state-preparation-and-measurement (SPAM) calibration matrices,
computes analytical inverse tensors, and applies simplex projection to mitigate bit-flip readout errors.
"""
from typing import Dict, Any, List, Tuple
import numpy as np


def build_single_qubit_assignment_matrix(
    p_1_given_0: float = 0.015,
    p_0_given_1: float = 0.035
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Constructs the 2x2 SPAM assignment matrix M and its inverse M^-1:
    M = [[1 - eps0, eps1], [eps0, 1 - eps1]]
    """
    eps0 = float(np.clip(p_1_given_0, 0.0, 0.49))
    eps1 = float(np.clip(p_0_given_1, 0.0, 0.49))
    
    m = np.array([
        [1.0 - eps0, eps1],
        [eps0, 1.0 - eps1]
    ], dtype=np.float64)
    
    det = (1.0 - eps0) * (1.0 - eps1) - (eps0 * eps1)
    det = max(1e-6, det)
    
    m_inv = (1.0 / det) * np.array([
        [1.0 - eps1, -eps1],
        [-eps0, 1.0 - eps0]
    ], dtype=np.float64)
    
    return m, m_inv


def mitigate_readout_probabilities(
    raw_probs: np.ndarray,
    p_1_given_0: float = 0.015,
    p_0_given_1: float = 0.035
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Applies the inverted calibration matrix to a 2-element probability vector [p0, p1]
    and projects the result onto the probability simplex (p_i >= 0, sum p_i = 1).
    """
    m, m_inv = build_single_qubit_assignment_matrix(p_1_given_0, p_0_given_1)
    
    p_raw = np.array(raw_probs, dtype=np.float64)
    p_unclipped = np.dot(m_inv, p_raw)
    
    # Simplex projection
    p_mitigated = np.clip(p_unclipped, 0.0, 1.0)
    total = np.sum(p_mitigated)
    if total > 0:
        p_mitigated = p_mitigated / total
        
    meta = {
        "assignment_matrix": m.tolist(),
        "inverse_assignment_matrix": m_inv.tolist(),
        "raw_probabilities": [round(float(v), 4) for v in p_raw],
        "mitigated_probabilities": [round(float(v), 4) for v in p_mitigated],
        "spam_error_p10": p_1_given_0,
        "spam_error_p01": p_0_given_1
    }
    
    return p_mitigated, meta

