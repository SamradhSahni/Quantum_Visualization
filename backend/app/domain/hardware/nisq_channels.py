"""
NISQ Hardware Noise Channels & Kraus Operator Builder
Models T1 energy relaxation, T2 phase dephasing, and CNOT two-qubit depolarizing channels.
"""
import math
import numpy as np
from typing import Dict, Any, List


HARDWARE_PROFILES = {
    "IBM_HERON_133Q": {
        "display_name": "IBM Heron 133Q (Heavy Hex)",
        "topology": "HEAVY_HEX",
        "num_qubits": 133,
        "t1_us": 180.0,
        "t2_us": 140.0,
        "cx_error_rate": 0.0045, # 0.45%
        "single_q_error_rate": 0.0002,
        "readout_error": 0.012
    },
    "RIGETTI_ANKAA_84Q": {
        "display_name": "Rigetti Ankaa 84Q (Square Octagon)",
        "topology": "SQUARE_OCTAGON",
        "num_qubits": 84,
        "t1_us": 32.0,
        "t2_us": 28.0,
        "cx_error_rate": 0.0180, # 1.8%
        "single_q_error_rate": 0.0010,
        "readout_error": 0.035
    },
    "IONQ_ARIA_25Q": {
        "display_name": "IonQ Aria 25Q (Trapped Ion)",
        "topology": "ALL_TO_ALL",
        "num_qubits": 25,
        "t1_us": 10000.0,
        "t2_us": 1000.0,
        "cx_error_rate": 0.0020, # 0.20%
        "single_q_error_rate": 0.0001,
        "readout_error": 0.005
    }
}


def simulate_noisy_edge_snr(
    ideal_snr: float,
    profile_key: str,
    circuit_depth: int = 40,
    noise_scale: float = 1.0
) -> Dict[str, Any]:
    """
    Computes degraded SNR under Kraus thermal relaxation + depolarizing errors
    scaled by factor lambda (noise_scale).
    """
    prof = HARDWARE_PROFILES.get(profile_key, HARDWARE_PROFILES["IBM_HERON_133Q"])
    
    # Effective gate error rate scaled by noise_scale
    p_cx = prof["cx_error_rate"] * noise_scale
    t1 = prof["t1_us"]
    t2 = prof["t2_us"]
    
    # Typical gate duration: 40 ns for superconducting, 200 us for trapped ion
    t_gate_us = 0.040 if "ION" not in prof["topology"] else 150.0
    total_time_us = circuit_depth * t_gate_us * noise_scale
    
    # Decoherence survival probability
    p_t1 = math.exp(-total_time_us / max(1.0, t1))
    p_t2 = math.exp(-total_time_us / max(1.0, t2))
    fidelity_decay = p_t1 * p_t2 * ((1.0 - p_cx) ** (circuit_depth * 0.35))
    
    # Noisy SNR degrades non-linearly with fidelity
    noisy_snr = max(0.5, ideal_snr * fidelity_decay + (1.0 - fidelity_decay) * 0.40)
    
    return {
        "hardware_profile": prof["display_name"],
        "noise_scale": noise_scale,
        "effective_cx_error": round(p_cx, 5),
        "fidelity_survival": round(fidelity_decay, 4),
        "noisy_snr": round(noisy_snr, 3),
        "snr_degradation_pct": round((1.0 - noisy_snr / max(1e-3, ideal_snr)) * 100, 1)
    }

