"""
Sub-Pixel Temporal Phase Interferometry Change Detector
Loads two co-registered temporal lunar passes (t1 Before and t2 After) into a quantum circuit.
Subtracts optical rotation angles Ry(2 theta_t2) Ry(-2 theta_t1) on the color qubit,
cancelling static craters and lighting up new meteoroid impacts, boulder rolls, or lander blasts.
"""
import math
from typing import Any, Dict, Tuple
import numpy as np


def _normalize_solar_drift(b1: np.ndarray, b2: np.ndarray) -> np.ndarray:
    """Radiometrically aligns t2 mean & std to t1 to cancel uniform illumination shifts."""
    m1, s1 = float(np.mean(b1)), float(np.std(b1))
    m2, s2 = float(np.mean(b2)), float(np.std(b2))
    if s2 < 1e-6:
        return np.full_like(b2, m1)
    aligned = (b2 - m2) * (s1 / s2) + m1
    return np.clip(aligned, 0.0, 255.0)


def synthesize_temporal_scenario(scenario: str = "new_impact", size: int = 64) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Synthesizes realistic co-registered orbital temporal pass pairs (t1 Before, t2 After)
    for testing quantum phase cancellation.
    """
    y, x = np.mgrid[:size, :size].astype(np.float64)
    # Static background with a legacy primary crater & mare texture
    r_main = np.sqrt((x - size * 0.35) ** 2 + (y - size * 0.38) ** 2)
    bg = 105.0 + 38.0 * np.exp(-((r_main - size * 0.22) / 3.0) ** 2) - 42.0 * (r_main < size * 0.20)
    bg += np.sin(x * 0.25) * np.cos(y * 0.25) * 6.0
    arr1 = np.clip(bg, 15.0, 240.0)
    arr2 = arr1.copy()

    sc = (scenario or "new_impact").strip().lower()
    if sc == "boulder_roll":
        # Detached boulder rolling downslope leaving a bright regolith scour track + dark boulder at end
        for step in range(28):
            bx = size * 0.42 + step * 0.85
            by = size * 0.36 + step * 0.90 + math.sin(step * 0.4) * 1.2
            d = np.sqrt((x - bx) ** 2 + (y - by) ** 2)
            arr2[d < 1.6] = np.clip(arr2[d < 1.6] + 68.0, 0.0, 255.0)
        d_boulder = np.sqrt((x - (size * 0.42 + 28 * 0.85)) ** 2 + (y - (size * 0.36 + 28 * 0.90)) ** 2)
        arr2[d_boulder < 2.8] = 245.0
        meta_sc = {"title": "Wall Boulder Roll Track (65 m Scour)", "baseline_years": 2.4}
    elif sc == "plume_scour":
        # Artemis engine exhaust regolith blast clearing halo at touchdown zone
        d_blast = np.sqrt((x - size * 0.65) ** 2 + (y - size * 0.64) ** 2)
        halo = np.exp(-((d_blast - size * 0.14) / 3.2) ** 2) * 85.0 + (d_blast < size * 0.10) * 110.0
        arr2 = np.clip(arr2 + halo, 0.0, 255.0)
        meta_sc = {"title": "Artemis Plume Regolith Blast Scour", "baseline_years": 0.4}
    elif sc == "solar_shift_control":
        # Pure solar incidence brightening without topological change (tests false alarm rejection)
        arr2 = np.clip(arr1 * 1.18 + 18.0, 0.0, 255.0)
        meta_sc = {"title": "Illumination Drift Only (Zero Surface Change)", "baseline_years": 1.1}
    else:
        # Fresh meteoroid crater + radial rays at (0.64, 0.62)
        d_imp = np.sqrt((x - size * 0.64) ** 2 + (y - size * 0.62) ** 2)
        ang = np.arctan2(y - size * 0.62, x - size * 0.64)
        rays = np.exp(-d_imp / 12.0) * (35.0 * np.maximum(0.0, np.cos(6.0 * ang)))
        arr2[d_imp < size * 0.10] = 235.0
        arr2[d_imp < size * 0.04] = 35.0
        arr2 = np.clip(arr2 + rays, 0.0, 255.0)
        meta_sc = {"title": "Fresh Bolide Impact Crater & Rays (180 m)", "baseline_years": 1.8}

    return arr1, arr2, meta_sc


def compute_temporal_change(
    img_before: np.ndarray,
    img_after: np.ndarray,
    threshold: float = 0.15,
    normalize_illumination: bool = False,
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Computes quantum temporal phase change probability:
    P_change(Y, X) = sin^2( (pi / 2) * (|I_t1 - I_t2| / 255) )
    """
    b1 = img_before.astype(np.float64)
    b2 = img_after.astype(np.float64)
    if normalize_illumination:
        b2 = _normalize_solar_drift(b1, b2)

    delta = np.abs(b1 - b2)
    delta_norm = np.clip(delta / 255.0, 0.0, 1.0)

    # Color qubit rotation angle delta_theta = (pi / 2) * (|I_t1 - I_t2| / 255)
    delta_theta = (math.pi / 2.0) * delta_norm

    # Born measurement probability on |1>_c
    p_change = np.sin(delta_theta) ** 2

    eff_thresh = float(np.clip(threshold, 0.01, 0.95))
    sig_mask = p_change > eff_thresh
    changed_pixels_count = int(np.sum(sig_mask))
    change_area_pct = round((changed_pixels_count / max(1, p_change.size)) * 100.0, 2)

    # Empirical SNR & residual false alarm floor estimate
    bg_noise = p_change[~sig_mask]
    false_alarm_est = round(float(np.mean(bg_noise > eff_thresh * 0.6)) if bg_noise.size > 0 else 0.001, 4)

    change_uint8 = np.clip(p_change * 255.0, 0.0, 255.0).astype(np.uint8)

    metadata = {
        "changed_pixels_count": changed_pixels_count,
        "changed_surface_pct": change_area_pct,
        "mean_change_probability": round(float(np.mean(p_change)), 4),
        "max_phase_shift_rad": round(float(np.max(delta_theta)), 3),
        "threshold_used": round(eff_thresh, 3),
        "illumination_normalized": bool(normalize_illumination),
        "estimated_false_alarm": max(0.0005, false_alarm_est),
        "status": "IMPACT_DETECTED" if change_area_pct > 0.5 else "SURFACE_STABLE",
    }

    return change_uint8, metadata
