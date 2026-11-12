"""
Fault-Tolerant Quantum Computing (FTQC) Surface Code & Magic State Planner (Pillar 3.5)
Calculates Ross-Selinger Clifford+T gate counts, rotated surface code distance d,
physical qubit overhead with 15-to-1 magic state factories, and execution runtimes.
"""
import math
from typing import Dict, Any, List


def estimate_ftqc_surface_code(
    image_dim: int = 512,
    algorithm: str = "FRQI",
    target_precision_eps: float = 1e-4,
    physical_error_p: float = 1e-3
) -> Dict[str, Any]:
    """
    Computes fault-tolerant hardware requirements and surface code scaling.
    """
    total_pixels = image_dim * image_dim
    n_spatial = int(math.ceil(math.log2(total_pixels)))
    
    algo_up = algorithm.upper()
    if "FRQI" in algo_up:
        logical_qubits = n_spatial + 1  # 19 for 512x512
        num_ry = total_pixels
    elif "QPIE" in algo_up:
        logical_qubits = n_spatial       # 18
        num_ry = total_pixels - 1
    else:  # NEQR
        logical_qubits = n_spatial + 8   # 26
        num_ry = 0
        
    t_per_ry = int(math.ceil(3.0 * math.log2(1.0 / max(1e-9, target_precision_eps))))
    total_t_gates = num_ry * t_per_ry
    
    code_distance = 15 if total_t_gates > 1e6 else 13
    physical_per_logical = 2 * (code_distance ** 2)
    
    # 15-to-1 magic state distillation factory overhead (~1200 physical qubits)
    factory_qubits = 1200 if total_t_gates > 0 else 0
    total_physical_qubits = logical_qubits * physical_per_logical + factory_qubits
    
    runtime_ms = round((total_t_gates * 0.015) / 1000.0, 2) if total_t_gates > 0 else 0.50
    
    # Resolution scaling points
    resolutions = [64, 128, 256, 512, 1024, 2048]
    scaling_curve = []
    for r in resolutions:
        pix = r * r
        log_q = int(math.ceil(math.log2(pix))) + (1 if "FRQI" in algo_up else 0)
        t_g = pix * t_per_ry if "NEQR" not in algo_up else 0
        phys_q = log_q * physical_per_logical + factory_qubits
        scaling_curve.append({
            "resolution": f"{r}x{r}",
            "logical_qubits": log_q,
            "physical_qubits": phys_q,
            "t_gates": t_g
        })
        
    return {
        "image_resolution": f"{image_dim}x{image_dim}",
        "algorithm": algorithm,
        "logical_qubits": logical_qubits,
        "surface_code_distance": code_distance,
        "physical_qubits_per_logical": physical_per_logical,
        "magic_state_factory_qubits": factory_qubits,
        "total_physical_qubits": total_physical_qubits,
        "total_t_gates": total_t_gates,
        "estimated_runtime_ms": runtime_ms,
        "physical_error_threshold": physical_error_p,
        "scaling_curve": scaling_curve
    }


def estimate_ftqc_resources(
    image_dim: int = 512,
    algorithm: str = "FRQI",
    target_precision_eps: float = 1e-4,
    physical_error_p: float = 1e-3
) -> Dict[str, Any]:
    """Backwards-compatible wrapper."""
    return estimate_ftqc_surface_code(
        image_dim=image_dim,
        algorithm=algorithm,
        target_precision_eps=target_precision_eps,
        physical_error_p=physical_error_p
    )

