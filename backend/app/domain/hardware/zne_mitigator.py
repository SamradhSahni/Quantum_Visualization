"""
Zero-Noise Extrapolation (ZNE) & Richardson Error Mitigation
Applies unitary folding across scale factors lambda in {1, 3, 5} and
performs Richardson polynomial extrapolation to cancel first- and second-order noise terms.
"""
from typing import List, Dict, Any, Tuple
import numpy as np


def apply_richardson_zne(
    snr_scale_1: float,
    snr_scale_3: float,
    snr_scale_5: float
) -> Tuple[float, Dict[str, Any]]:
    """
    Computes zero-noise estimate using exact analytical Richardson weights for lambda=(1, 3, 5):
    E_hat_ZNE(0) = (15/8)*E(1) - (5/4)*E(3) + (3/8)*E(5)
    """
    w1 = 15.0 / 8.0   # +1.875
    w3 = -5.0 / 4.0   # -1.250
    w5 = 3.0 / 8.0    # +0.375
    
    mitigated_snr = w1 * snr_scale_1 + w3 * snr_scale_3 + w5 * snr_scale_5
    
    # Polynomial curve fit for visualization: E(lambda) = c0 + c1*lambda + c2*lambda^2
    lambdas = np.array([1.0, 3.0, 5.0])
    snrs = np.array([snr_scale_1, snr_scale_3, snr_scale_5])
    poly = np.polyfit(lambdas, snrs, 2)
    # poly[2] is intercept at lambda=0
    
    metadata = {
        "scale_factors": [1, 3, 5],
        "measured_snrs": [round(snr_scale_1, 3), round(snr_scale_3, 3), round(snr_scale_5, 3)],
        "richardson_weights": [w1, w3, w5],
        "mitigated_snr": round(float(mitigated_snr), 3),
        "polynomial_coefficients": [round(float(c), 4) for c in poly],
        "recovered_fidelity_pct": round(min(100.0, (mitigated_snr / max(1e-3, snr_scale_1)) * 100), 1)
    }
    
    return float(mitigated_snr), metadata

