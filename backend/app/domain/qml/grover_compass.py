"""
Grover Amplitude Amplification Statevector Oscilloscope & Over-Rotation Guard (Pillar 1.5)
Performs 2D geometric subspace amplitude amplification, plots full oscillation curve P(r),
outputs spatial before/after amplified edge probability maps, and detects the Souffle collapse.
"""
import math
from typing import Any, Dict, List, Tuple
import numpy as np


def analyze_grover_subspace(
    edge_probabilities: np.ndarray,
    r_iterations: int = 1,
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Applies r Grover iterations on the post-QHED statevector and monitors the 2D Subspace Compass.
    P_amplified = sin^2((2r + 1) * theta)
    Warns if (2r + 1) * theta > pi / 2 (Over-Rotation).
    """
    r = max(0, r_iterations)
    p_in = np.clip(edge_probabilities.astype(np.float64), 0.0, 1.0)

    candidate_mask = p_in > 0.02
    base_prob = float(np.mean(p_in[candidate_mask])) if np.any(candidate_mask) else 0.08
    base_prob = max(1e-4, min(0.99, base_prob))

    initial_theta = math.asin(math.sqrt(base_prob))
    r_opt = max(1, int(math.floor((math.pi / (4.0 * initial_theta)) - 0.5)))

    theta_r = (2 * r + 1) * initial_theta
    amplified_prob = math.sin(theta_r) ** 2
    over_rotated = theta_r > (math.pi / 2.0)

    theta_spatial = np.arcsin(np.sqrt(p_in))
    theta_r_spatial = (2 * r + 1) * theta_spatial
    p_amplified_arr = np.clip(np.sin(theta_r_spatial) ** 2, 0.0, 1.0)

    gain = (
        float(np.mean(p_amplified_arr[candidate_mask]) / max(1e-5, base_prob))
        if np.any(candidate_mask)
        else 1.0
    )

    # Generate full sine curve sweep r = 0..6 for interactive Oscilloscope Chart
    oscillation_curve: List[Dict[str, Any]] = []
    for k in range(7):
        th_k = (2 * k + 1) * initial_theta
        oscillation_curve.append({
            "r": k,
            "prob": round(math.sin(th_k) ** 2, 4),
            "angle_deg": round(math.degrees(th_k), 1),
            "over_rotated": th_k > (math.pi / 2.0),
        })

    compass_x = round(math.cos(theta_r), 3)
    compass_y = round(math.sin(theta_r), 3)

    meta = {
        "status": "success",
        "grover_iterations": r,
        "initial_theta_rad": round(initial_theta, 4),
        "initial_prob": round(base_prob, 4),
        "amplified_prob": round(amplified_prob, 4),
        "optimal_iterations": r_opt,
        "over_rotation_warning": over_rotated,
        "amplification_gain": round(gain, 2),
        "subspace_compass": {
            "x_non_edge": compass_x,
            "y_edge": compass_y,
            "angle_rad": round(theta_r, 4),
            "angle_deg": round(math.degrees(theta_r), 1),
        },
        "oscillation_curve": oscillation_curve,
        "input_edge_map": np.round(p_in, 3).tolist(),
        "amplified_edge_map": np.round(p_amplified_arr, 3).tolist(),
    }

    return p_amplified_arr, meta


def apply_grover_amplification(
    edge_probabilities: np.ndarray,
    r_iterations: int = 1,
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """Backwards-compatible wrapper."""
    return analyze_grover_subspace(edge_probabilities, r_iterations=r_iterations)
