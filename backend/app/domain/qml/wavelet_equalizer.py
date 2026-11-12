"""
2D Quantum Haar Wavelet Equalizer & Speckle Suppressor (Pillar 1.1)
Decomposes 2D quantum image registers into LL, LH, HL, and HH sub-bands,
validating unitary Parseval energy conservation and applying user-controlled sub-band gains.
"""
import math
from typing import Any, Dict, Tuple
import numpy as np


def qwt_2d_decompose(patch: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Simulates the 2D Quantum Haar Wavelet Transform U_QHWT^(2D) = U_QHWT^(Y) (x) U_QHWT^(X).
    Decomposes an HxW patch (power of 2) into LL, LH, HL, HH subbands using normalized 1/sqrt(2) factors.
    """
    row_low = (patch[:, 0::2] + patch[:, 1::2]) / math.sqrt(2.0)
    row_high = (patch[:, 0::2] - patch[:, 1::2]) / math.sqrt(2.0)

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

    row_low = np.zeros((h, half_w), dtype=np.float64)
    row_low[0::2, :] = (ll + lh) / math.sqrt(2.0)
    row_low[1::2, :] = (ll - lh) / math.sqrt(2.0)

    row_high = np.zeros((h, half_w), dtype=np.float64)
    row_high[0::2, :] = (hl + hh) / math.sqrt(2.0)
    row_high[1::2, :] = (hl - hh) / math.sqrt(2.0)

    reconstructed = np.zeros((h, w), dtype=np.float64)
    reconstructed[:, 0::2] = (row_low + row_high) / math.sqrt(2.0)
    reconstructed[:, 1::2] = (row_low - row_high) / math.sqrt(2.0)

    return np.clip(reconstructed, 0.0, 255.0)


def equalize_wavelet_subbands(
    patch: np.ndarray,
    lh_gain: float = 1.0,
    hl_gain: float = 1.0,
    hh_cut: float = 0.85,
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Applies user-controlled gain and cut factors to the wavelet subbands:
    - LL (Coarse topography): Preserved at 1.0
    - LH (Horizontal crater rims): Scaled by lh_gain
    - HL (Vertical crater rims): Scaled by hl_gain
    - HH (Diagonal speckle noise): Attenuated by (1.0 - hh_cut)
    """
    patch_f = patch.astype(np.float64)
    ll, lh, hl, hh = qwt_2d_decompose(patch_f)

    e_ll = float(np.sum(ll ** 2))
    e_lh = float(np.sum(lh ** 2))
    e_hl = float(np.sum(hl ** 2))
    e_hh = float(np.sum(hh ** 2))
    total_energy = max(1e-9, e_ll + e_lh + e_hl + e_hh)

    energy_ll_pct = round((e_ll / total_energy) * 100.0, 1)
    energy_lh_pct = round((e_lh / total_energy) * 100.0, 1)
    energy_hl_pct = round((e_hl / total_energy) * 100.0, 1)
    energy_hh_pct = round((e_hh / total_energy) * 100.0, 1)

    lh_mod = lh * float(lh_gain)
    hl_mod = hl * float(hl_gain)
    hh_mod = hh * max(0.02, (1.0 - float(hh_cut)))

    reconstructed = qwt_2d_reconstruct(ll, lh_mod, hl_mod, hh_mod)

    # Structural signal vs HH high-frequency noise SNR + LH/HL directional edge boost
    signal_power = max(1e-9, float(np.mean(ll ** 2)) + 0.15 * float(np.mean(lh_mod ** 2) + np.mean(hl_mod ** 2)))
    noise_power_orig = max(1e-4, float(np.mean(hh ** 2)))
    noise_power_filtered = max(1e-5, float(np.mean(hh_mod ** 2)))

    snr_before = round(float((np.mean(ll ** 2) + 0.15 * (np.mean(lh ** 2) + np.mean(hl ** 2))) / noise_power_orig), 2)
    snr_after = round(float(signal_power / noise_power_filtered), 2)
    ratio = max(1.0, snr_after / max(0.01, snr_before))
    snr_gain_db = round(10.0 * math.log10(ratio), 2)

    edge_energy_orig = max(1e-9, e_lh + e_hl)
    edge_energy_post = float(np.sum(lh_mod ** 2) + np.sum(hl_mod ** 2))
    directional_edge_boost_pct = round(((edge_energy_post - edge_energy_orig) / edge_energy_orig) * 100.0, 1)
    unitarity_residual = abs(total_energy - float(np.sum(patch_f ** 2)))

    telemetry = {
        "energy_ll_pct": energy_ll_pct,
        "energy_lh_pct": energy_lh_pct,
        "energy_hl_pct": energy_hl_pct,
        "energy_hh_speckle_pct": energy_hh_pct,
        "directional_edge_boost_pct": directional_edge_boost_pct,
        "snr_before_qwt": snr_before,
        "snr_after_qwt": snr_after,
        "snr_gain_db": snr_gain_db,
        "is_unitary_conserved": unitarity_residual < 1e-6,
        "unitarity_residual": float(f"{unitarity_residual:.2e}"),
        "original_patch": np.round(patch_f, 1).tolist(),
        "reconstructed_patch": np.round(reconstructed, 1).tolist(),
        "subband_matrices": {
            "ll": np.round(ll, 1).tolist(),
            "lh": np.round(lh_mod, 1).tolist(),
            "hl": np.round(hl_mod, 1).tolist(),
            "hh": np.round(hh_mod, 1).tolist(),
        },
    }

    return reconstructed, telemetry


def apply_wavelet_denoising(
    patch: np.ndarray,
    strength: float = 0.65,
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Backwards-compatible wrapper matching earlier API contract.
    """
    return equalize_wavelet_subbands(patch, lh_gain=1.0, hl_gain=1.0, hh_cut=strength)
