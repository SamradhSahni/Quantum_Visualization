"""
Quantum Haar Wavelet Transform (QWT) Pre-Edge Denoiser
Decomposes 2D quantum image registers into LL, LH, HL, and HH sub-bands,
applying soft attenuation to high-frequency speckle noise before QHED edge extraction.
"""
import math
import numpy as np
from typing import Tuple, Dict, Any


def qwt_2d_decompose(patch: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Simulates the 2D Quantum Haar Wavelet Transform U_QHWT^(2D) = U_QHWT^(Y) (x) U_QHWT^(X).
    Decomposes an HxW patch (power of 2) into LL, LH, HL, HH subbands.
    """
    h, w = patch.shape
    half_h, half_w = h // 2, w // 2
    
    # 1D Horizontal Haar pass on rows
    row_low = (patch[:, 0::2] + patch[:, 1::2]) / math.sqrt(2.0)
    row_high = (patch[:, 0::2] - patch[:, 1::2]) / math.sqrt(2.0)
    
    # 1D Vertical Haar pass on columns
    ll = (row_low[0::2, :] + row_low[1::2, :]) / math.sqrt(2.0)
    lh = (row_low[0::2, :] - row_low[1::2, :]) / math.sqrt(2.0)
    hl = (row_high[0::2, :] + row_high[1::2, :]) / math.sqrt(2.0)
    hh = (row_high[0::2, :] - row_high[1::2, :]) / math.sqrt(2.0)
    
    return ll, lh, hl, hh


def qwt_2d_reconstruct(ll: np.ndarray, lh: np.ndarray, hl: np.ndarray, hh: np.ndarray) -> np.ndarray:
    """
    Inverse 2D Quantum Haar Wavelet Transform (U_QHWT^(2D))^dagger.
    """
    half_h, half_w = ll.shape
    h, w = half_h * 2, half_w * 2
    
    # Invert vertical passes
    row_low = np.zeros((h, half_w), dtype=np.float64)
    row_low[0::2, :] = (ll + lh) / math.sqrt(2.0)
    row_low[1::2, :] = (ll - lh) / math.sqrt(2.0)
    
    row_high = np.zeros((h, half_w), dtype=np.float64)
    row_high[0::2, :] = (hl + hh) / math.sqrt(2.0)
    row_high[1::2, :] = (hl - hh) / math.sqrt(2.0)
    
    # Invert horizontal passes
    reconstructed = np.zeros((h, w), dtype=np.float64)
    reconstructed[:, 0::2] = (row_low + row_high) / math.sqrt(2.0)
    reconstructed[:, 1::2] = (row_low - row_high) / math.sqrt(2.0)
    
    return np.clip(reconstructed, 0.0, 255.0)


def apply_wavelet_denoising(
    patch: np.ndarray,
    strength: float = 0.65
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Applies controlled soft-attenuation C^2 Ry(-2 theta_denoise) conditioned on the HH speckle subband.
    strength eta in [0, 1].
    """
    patch_f = patch.astype(np.float64)
    ll, lh, hl, hh = qwt_2d_decompose(patch_f)
    
    # Measure speckle power in HH before and after
    orig_hh_energy = float(np.sum(hh ** 2))
    
    # Soft attenuation on HH: hh_attenuated = hh * (1.0 - strength * 0.90)
    attenuation_factor = max(0.05, 1.0 - strength * 0.90)
    hh_clean = hh * attenuation_factor
    
    clean_hh_energy = float(np.sum(hh_clean ** 2))
    denoised_patch = qwt_2d_reconstruct(ll, lh, hl, hh_clean)
    
    # Compute metrics
    snr_improvement_db = 10.0 * math.log10(max(1e-6, orig_hh_energy) / max(1e-6, clean_hh_energy)) if clean_hh_energy > 0 else 12.0
    
    metadata = {
        "wavelet_subbands": {
            "ll_energy": float(np.sum(ll ** 2)),
            "lh_energy": float(np.sum(lh ** 2)),
            "hl_energy": float(np.sum(hl ** 2)),
            "hh_energy_before": orig_hh_energy,
            "hh_energy_after": clean_hh_energy,
        },
        "denoising_strength": strength,
        "snr_gain_db": round(snr_improvement_db, 2),
        "qubits_wavelet_depth": int(math.log2(patch.shape[0])) * 2
    }
    
    return denoised_patch, metadata

