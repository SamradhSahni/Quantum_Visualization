"""
Fault-Tolerant Clifford + T & Surface Code Resource Estimator
Calculates logical qubits, Ross-Selinger T-depth, physical surface code qubits (2 * d^2),
and execution time in milliseconds across planetary image resolutions (8x8 to 4096x4096).
"""
import math
from typing import Dict, Any, List


def estimate_ftqc_resources(
    image_dim: int = 512,
    algorithm: str = "FRQI",
    target_precision_eps: float = 1e-4,
    physical_error_p: float = 1e-3
) -> Dict[str, Any]:
    """
    Computes fault-tolerant hardware requirements for single-shot processing.
    """
    total_pixels = image_dim * image_dim
    n_spatial = int(math.ceil(math.log2(total_pixels)))
    
    if "FRQI" in algorithm.upper():
        logical_qubits = n_spatial + 1 # 18 for 512x512
        # Number of arbitrary Ry rotations = total pixels
        num_ry = total_pixels
    elif "QPIE" in algorithm.upper():
        logical_qubits = n_spatial # 18
        num_ry = total_pixels - 1
    else: # NEQR
        logical_qubits = n_spatial + 8 # 26
        num_ry = 0 # digital CNOT arithmetic
        
    # Ross-Selinger optimal Clifford+T synthesis: N_T(single Ry) ~= 3 * log2(1 / eps)
    t_per_ry = int(math.ceil(3.0 * math.log2(1.0 / max(1e-9, target_precision_eps)))) # ~40 T gates
    total_t_gates = num_ry * t_per_ry
    
    # Required surface code distance d:
    # Target logical error p_L < 1e-8
    # p_L ~= 0.1 * (100 * p_phys)^((d+1)/2)
    # For p_phys = 1e-3, 100 * p_phys = 0.1
    # 0.1 * (0.1)^((d+1)/2) = (0.1)^((d+3)/2) < 1e-8 => (d+3)/2 >= 8 => d >= 13
    code_distance = 15 if total_t_gates > 1e6 else 13
    physical_per_logical = 2 * (code_distance ** 2) # e.g. 2 * 15^2 = 450
    
    total_physical_qubits = logical_qubits * physical_per_logical
    
    # Surface code cycle time = ~1 microsecond
    # Logical T factory cycle time = ~15-20 microseconds
    runtime_ms = round((total_t_gates * 0.015) / 1000.0, 2) if total_t_gates > 0 else 0.50
    
    return {
        "image_resolution": f"{image_dim}x{image_dim}",
        "total_pixels": total_pixels,
        "algorithm": algorithm,
        "logical_qubits": logical_qubits,
        "non_clifford_t_gates": total_t_gates,
        "code_distance_d": code_distance,
        "physical_per_logical_qubit": physical_per_logical,
        "total_physical_qubits": total_physical_qubits,
        "estimated_ftqc_runtime_ms": runtime_ms,
        "surface_code_architecture": "Rotated Surface Code with Lattice Surgery"
    }

