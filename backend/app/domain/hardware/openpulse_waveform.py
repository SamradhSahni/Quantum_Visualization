"""
Transmon Microwave Control Pulse Oscilloscope & OpenPulse DRAG Envelopes (Pillar 3.3)
Generates physical radio-frequency microwave drive pulses (5 GHz transmon frequencies),
Derivative Removal by Adiabatic Gate (DRAG) quadrature waveforms, and Echoed Cross-Resonance (ECR) pulses.
"""
import math
from typing import Dict, Any, List
import numpy as np


def generate_drag_pulse(
    duration_ns: float = 40.0,
    amplitude: float = 0.85,
    sigma_ns: float = 10.0,
    beta_drag: float = 0.25,
    anharmonicity_mhz: float = -330.0,
    num_samples: int = 16
) -> Dict[str, Any]:
    """
    Generates in-phase I(t) Gaussian pulse and quadrature Q(t) DRAG derivative pulse:
    Omega_I(t) = A * [exp(-(t - tp/2)^2 / (2*sigma^2)) - exp(-(tp/2)^2 / (2*sigma^2))]
    Omega_Q(t) = -(beta_drag / Delta_anh) * dOmega_I/dt
    """
    t_vals = np.linspace(0.0, duration_ns, num_samples)
    t_mid = duration_ns / 2.0
    
    # In-phase Gaussian envelope
    raw_gauss = np.exp(-((t_vals - t_mid) ** 2) / (2.0 * (sigma_ns ** 2)))
    zero_offset = math.exp(- (t_mid ** 2) / (2.0 * (sigma_ns ** 2)))
    i_samples = amplitude * (raw_gauss - zero_offset) / max(1e-6, 1.0 - zero_offset)
    
    # Quadrature DRAG envelope (proportional to -dI/dt)
    # d/dt exp(-(t - t_mid)^2 / (2*sigma^2)) = -(t - t_mid) / sigma^2 * exp(...)
    d_gauss_dt = - ((t_vals - t_mid) / (sigma_ns ** 2)) * raw_gauss
    delta_rad_per_ns = 2.0 * math.pi * (anharmonicity_mhz / 1000.0)  # rad/ns
    q_samples = - (beta_drag / delta_rad_per_ns) * amplitude * d_gauss_dt
    
    # Verify orthogonality: integral of Q(t) over [0, tp] should be zero
    q_integral = float(np.sum(q_samples))
    is_orthogonal = abs(q_integral) < 1e-4
    
    return {
        "duration_ns": duration_ns,
        "amplitude": round(amplitude, 3),
        "i_samples": [round(float(v), 4) for v in i_samples],
        "q_drag_samples": [round(float(v), 4) for v in q_samples],
        "is_drag_orthogonal": is_orthogonal,
        "q_integral_residual": round(q_integral, 6)
    }


def generate_openpulse_schedule(
    pixel_intensity: int = 218,
    qpu_profile: str = "IBM_HERON_156Q_HEAVY_HEX"
) -> Dict[str, Any]:
    """
    Generates a synchronized OpenPulse schedule for the FRQI circuit on drive and control channels.
    """
    # Map pixel intensity [0, 255] to rotation angle theta and pulse amplitude A
    theta_rad = (pixel_intensity / 255.0) * (math.pi / 2.0)
    pulse_amp = float(np.clip(0.15 + (pixel_intensity / 255.0) * 0.75, 0.1, 1.0))
    
    # Drive channel D6 (|c> Color Qubit) - Ry(2*theta) gate
    d6_pulse = generate_drag_pulse(duration_ns=40.0, amplitude=pulse_amp, sigma_ns=10.0)
    
    # Drive channel D0 (q0 Position LSB) - Hadamard H gate
    d0_pulse = generate_drag_pulse(duration_ns=28.0, amplitude=0.72, sigma_ns=7.0)
    
    # Control channel U0 (Cross-Resonance CX gate tone)
    # ECR flat-top pulse
    u0_samples = [0.0, 0.22, 0.65, 0.88, 0.88, 0.88, 0.88, 0.65, 0.22, 0.0]
    
    channels = [
        {
            "channel": "D6 (|c> Color Qubit Drive)",
            "freq_ghz": 5.12,
            "gate_label": f"Ry({round(2 * theta_rad, 3)} rad)",
            "duration_ns": 40.0,
            "start_time_ns": 120.0,
            "i_samples": d6_pulse["i_samples"],
            "q_drag_samples": d6_pulse["q_drag_samples"]
        },
        {
            "channel": "U0 (CR Control Tone q0 -> |c>)",
            "freq_ghz": 4.98,
            "gate_label": "ECR CX(q0, c)",
            "duration_ns": 160.0,
            "start_time_ns": 200.0,
            "i_samples": u0_samples,
            "q_drag_samples": [0.0] * len(u0_samples)
        },
        {
            "channel": "D0 (q0 Position LSB Drive)",
            "freq_ghz": 4.98,
            "gate_label": "Hadamard H",
            "duration_ns": 28.0,
            "start_time_ns": 420.0,
            "i_samples": d0_pulse["i_samples"],
            "q_drag_samples": d0_pulse["q_drag_samples"]
        }
    ]
    
    total_duration_ns = 540.0
    t1_us = 180.0
    t1_fraction_pct = round((total_duration_ns / (t1_us * 1000.0)) * 100.0, 3)
    
    return {
        "status": "success",
        "total_duration_ns": total_duration_ns,
        "t1_fraction_pct": t1_fraction_pct,
        "anharmonicity_mhz": -330.0,
        "channels": channels
    }

