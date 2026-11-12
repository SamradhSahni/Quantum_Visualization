"""
FastAPI Quantum Circuit Composer & Step-by-Step Statevector Engine
Routes for 1-to-8 qubit circuit simulation, Qiskit Aer statevectors,
partial trace density matrices, OpenQASM 3.0 generation, and lunar patch circuits.
"""
from typing import List, Dict, Any, Optional
import math
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.app.core.dependencies import (
    acquire_user_compute_slot,
    require_researcher,
    verify_hmac_csrf,
)

import qiskit
from qiskit import QuantumCircuit, transpile
from qiskit.quantum_info import Statevector, DensityMatrix, partial_trace, entropy
import qiskit.qasm3

router = APIRouter(prefix="/api/v1/composer", tags=["composer"])


# =========================================================================
# Pydantic Schemas
# =========================================================================

class GateModel(BaseModel):
    gate: str
    targets: List[int] = Field(default_factory=list)
    controls: List[int] = Field(default_factory=list)
    anti_controls: List[int] = Field(default_factory=list)
    params: List[float] = Field(default_factory=list)


class StepModel(BaseModel):
    step_index: int
    gates: List[GateModel] = Field(default_factory=list)


class NoiseModel(BaseModel):
    enabled: bool = False
    single_qubit_depolarizing_error: float = 0.001
    two_qubit_depolarizing_error: float = 0.01


class SimulateRequest(BaseModel):
    num_qubits: int = Field(..., ge=1, le=8)
    initial_states: Optional[List[str]] = Field(default=None, max_length=16)
    shots: int = Field(default=4096, ge=128, le=65536)
    noise_model: Optional[NoiseModel] = None
    steps: List[StepModel] = Field(default_factory=list, max_length=128)


class TranspileRequest(BaseModel):
    num_qubits: int = Field(..., ge=1, le=8)
    steps: List[StepModel] = Field(default_factory=list, max_length=128)
    optimization_level: int = Field(default=3, ge=1, le=3)
    basis_gates: Optional[List[str]] = Field(default=None, max_length=16)


class PatchToCircuitRequest(BaseModel):
    patch_size: str = Field(default="2x2", max_length=8)  # "2x2" or "4x4"
    intensities: List[float] = Field(default_factory=list, max_length=64)
    algorithm: str = Field(default="FRQI", max_length=32)  # "FRQI", "QPIE", "NEQR"


# =========================================================================
# Quantum Circuit Builder Helper
# =========================================================================

def apply_gate_to_circuit(qc: QuantumCircuit, g: GateModel, n_qubits: int):
    name = g.gate.upper()
    targets = [t for t in g.targets if 0 <= t < n_qubits]
    controls = [c for c in g.controls if 0 <= c < n_qubits]
    anti_controls = [ac for ac in g.anti_controls if 0 <= ac < n_qubits]
    params = g.params

    if not targets and not controls:
        return

    # Handle anti-controls by wrapping with X gates
    for ac in anti_controls:
        qc.x(ac)

    effective_controls = controls + anti_controls

    if name == "I" and targets:
        qc.id(targets[0])
    elif name == "X" and targets:
        if effective_controls:
            if len(effective_controls) == 1:
                qc.cx(effective_controls[0], targets[0])
            elif len(effective_controls) == 2:
                qc.ccx(effective_controls[0], effective_controls[1], targets[0])
            else:
                qc.mcx(effective_controls, targets[0])
        else:
            qc.x(targets[0])
    elif name == "Y" and targets:
        if effective_controls:
            qc.cy(effective_controls[0], targets[0])
        else:
            qc.y(targets[0])
    elif name == "Z" and targets:
        if effective_controls:
            qc.cz(effective_controls[0], targets[0])
        else:
            qc.z(targets[0])
    elif name == "H" and targets:
        if effective_controls:
            qc.ch(effective_controls[0], targets[0])
        else:
            qc.h(targets[0])
    elif name == "S" and targets:
        qc.s(targets[0])
    elif name == "SDG" and targets:
        qc.sdg(targets[0])
    elif name == "T" and targets:
        qc.t(targets[0])
    elif name == "TDG" and targets:
        qc.tdg(targets[0])
    elif name == "SX" and targets:
        qc.sx(targets[0])
    elif name == "RX" and targets:
        th = params[0] if params else math.pi / 2
        if effective_controls:
            qc.crx(th, effective_controls[0], targets[0])
        else:
            qc.rx(th, targets[0])
    elif name == "RY" and targets:
        th = params[0] if params else math.pi / 2
        if effective_controls:
            qc.cry(th, effective_controls[0], targets[0])
        else:
            qc.ry(th, targets[0])
    elif name == "RZ" and targets:
        ph = params[0] if params else math.pi / 2
        if effective_controls:
            qc.crz(ph, effective_controls[0], targets[0])
        else:
            qc.rz(ph, targets[0])
    elif name == "P" and targets:
        lam = params[0] if params else math.pi / 2
        if effective_controls:
            qc.cp(lam, effective_controls[0], targets[0])
        else:
            qc.p(lam, targets[0])
    elif name == "U3" and targets:
        th = params[0] if len(params) > 0 else math.pi / 2
        ph = params[1] if len(params) > 1 else 0.0
        lam = params[2] if len(params) > 2 else 0.0
        qc.u(th, ph, lam, targets[0])
    elif name == "CX" and len(targets) >= 1 and controls:
        qc.cx(controls[0], targets[0])
    elif name == "CY" and len(targets) >= 1 and controls:
        qc.cy(controls[0], targets[0])
    elif name == "CZ" and len(targets) >= 1 and controls:
        qc.cz(controls[0], targets[0])
    elif name == "CRX" and len(targets) >= 1 and controls:
        th = params[0] if params else math.pi / 2
        qc.crx(th, controls[0], targets[0])
    elif name == "CRY" and len(targets) >= 1 and controls:
        th = params[0] if params else math.pi / 2
        qc.cry(th, controls[0], targets[0])
    elif name == "CP" and len(targets) >= 1 and controls:
        lam = params[0] if params else math.pi / 2
        qc.cp(lam, controls[0], targets[0])
    elif name == "SWAP" and len(targets) >= 2:
        qc.swap(targets[0], targets[1])
    elif name == "ISWAP" and len(targets) >= 2:
        qc.iswap(targets[0], targets[1])
    elif name == "CCX" and len(targets) >= 1 and len(controls) >= 2:
        qc.ccx(controls[0], controls[1], targets[0])
    elif name == "MCX" and len(targets) >= 1 and len(controls) >= 1:
        qc.mcx(controls, targets[0])
    elif name.startswith("D_") and targets:
        # Cyclic Decrement macro
        t0 = targets[0]
        qc.x(t0)
        for i in range(1, len(targets)):
            qc.mcx(targets[:i], targets[i])
    elif name.startswith("I_") and targets:
        # Cyclic Increment macro
        for i in range(len(targets) - 1, 0, -1):
            qc.mcx(targets[:i], targets[i])
        qc.x(targets[0])
    elif name == "QFT" and targets:
        # Quantum Fourier Transform on targets
        k = len(targets)
        for i in range(k):
            qc.h(targets[i])
            for j in range(i + 1, k):
                lam = math.pi / (2 ** (j - i))
                qc.cp(lam, targets[j], targets[i])
        for i in range(k // 2):
            qc.swap(targets[i], targets[k - 1 - i])
    elif name == "M" and targets:
        # Measurement barrier representation (statevector stays pure)
        qc.barrier(targets)

    # Undo anti-controls
    for ac in anti_controls:
        qc.x(ac)


def generate_qiskit_python_code(num_qubits: int, steps: List[StepModel]) -> str:
    lines = [
        "from qiskit import QuantumCircuit",
        "import numpy as np",
        "",
        f"qc = QuantumCircuit({num_qubits})",
    ]
    for step in steps:
        lines.append(f"# Step {step.step_index}")
        for g in step.gates:
            name = g.gate.upper()
            t = g.targets[0] if g.targets else 0
            ctrl = g.controls[0] if g.controls else 0
            params = g.params

            if name == "H":
                lines.append(f"qc.h({t})")
            elif name == "X":
                if g.controls:
                    lines.append(f"qc.cx({ctrl}, {t})")
                else:
                    lines.append(f"qc.x({t})")
            elif name == "Y":
                lines.append(f"qc.y({t})")
            elif name == "Z":
                lines.append(f"qc.z({t})")
            elif name == "S":
                lines.append(f"qc.s({t})")
            elif name == "T":
                lines.append(f"qc.t({t})")
            elif name == "P":
                p = params[0] if params else 1.5708
                lines.append(f"qc.p({p:.4f}, {t})")
            elif name == "RY":
                p = params[0] if params else 1.5708
                if g.controls:
                    lines.append(f"qc.cry({p:.4f}, {ctrl}, {t})")
                else:
                    lines.append(f"qc.ry({p:.4f}, {t})")
            elif name == "RX":
                p = params[0] if params else 1.5708
                lines.append(f"qc.rx({p:.4f}, {t})")
            elif name == "RZ":
                p = params[0] if params else 1.5708
                lines.append(f"qc.rz({p:.4f}, {t})")
            elif name == "CX":
                lines.append(f"qc.cx({ctrl}, {t})")
            elif name == "CCX" and len(g.controls) >= 2:
                lines.append(f"qc.ccx({g.controls[0]}, {g.controls[1]}, {t})")
            elif name == "SWAP" and len(g.targets) >= 2:
                lines.append(f"qc.swap({g.targets[0]}, {g.targets[1]})")
            else:
                lines.append(f"# {name} on {g.targets}")
    return "\n".join(lines)


# =========================================================================
# API Endpoints
# =========================================================================

@router.post(
    "/simulate",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def simulate_circuit(req: SimulateRequest) -> Dict[str, Any]:
    """
    Executes step-by-step statevector simulation, partial trace density matrices,
    Bloch sphere vector coordinates, butterfly equations, and shot sampling.
    """
    n = req.num_qubits
    dim = 2 ** n

    # Initialize circuit
    running_qc = QuantumCircuit(n)

    # Initialize specific states if provided
    if req.initial_states:
        for q, st in enumerate(req.initial_states[:n]):
            if st == "|1>":
                running_qc.x(q)
            elif st == "|+>":
                running_qc.h(q)
            elif st == "|->":
                running_qc.x(q)
                running_qc.h(q)

    # Step 0 ground state telemetry
    timeline: List[Dict[str, Any]] = []

    def extract_telemetry(qc_snap: QuantumCircuit, step_idx: int, desc: str, prev_sv_data: Optional[np.ndarray] = None) -> Dict[str, Any]:
        sv = Statevector(qc_snap)
        data = sv.data  # shape (2^n,) complex

        # 1. Statevector entries
        sv_entries = []
        for idx in range(dim):
            val = data[idx]
            re_val = float(val.real)
            im_val = float(val.imag)
            mag = float(np.abs(val))
            prob = float(mag ** 2)
            phase = float(math.atan2(im_val, re_val)) if mag > 1e-9 else 0.0
            ket_str = format(idx, f"0{n}b")

            sv_entries.append({
                "index": idx,
                "ket": ket_str,
                "re": round(re_val, 6),
                "im": round(im_val, 6),
                "mag": round(mag, 6),
                "prob": round(prob, 6),
                "phase_rad": round(phase, 4)
            })

        # 2. Reduced density matrices & Bloch vectors per qubit
        bloch_vectors = []
        for q in range(n):
            trace_qubits = [i for i in range(n) if i != q]
            if trace_qubits:
                rho = partial_trace(sv, trace_qubits).data
            else:
                rho = DensityMatrix(sv).data

            rho_00 = float(rho[0, 0].real)
            rho_11 = float(rho[1, 1].real)
            rho_01 = rho[0, 1]

            rx = float(2.0 * rho_01.real)
            ry = float(-2.0 * rho_01.imag)
            rz = float(rho_00 - rho_11)
            norm_r = math.sqrt(rx ** 2 + ry ** 2 + rz ** 2)
            purity = (1.0 + norm_r ** 2) / 2.0

            # Von Neumann entropy
            try:
                dm = DensityMatrix(rho)
                ent = float(entropy(dm, base=2))
            except Exception:
                ent = 0.0

            bloch_vectors.append({
                "qubit": q,
                "rx": round(rx, 4),
                "ry": round(ry, 4),
                "rz": round(rz, 4),
                "purity": round(purity, 4),
                "entropy_bits": round(ent, 4)
            })

        # 3. Butterfly transitions from prev_sv_data
        butterflies = []
        if prev_sv_data is not None:
            diff_indices = [k for k in range(dim) if abs(data[k] - prev_sv_data[k]) > 1e-5]
            if diff_indices:
                pair_limit = min(6, len(diff_indices))
                for i in range(0, pair_limit, 2):
                    idx_a = diff_indices[i]
                    idx_b = diff_indices[i + 1] if i + 1 < len(diff_indices) else idx_a
                    ka = format(idx_a, f"0{n}b")
                    kb = format(idx_b, f"0{n}b")

                    effect = "PHASE_ROTATION"
                    if abs(abs(data[idx_a]) - abs(prev_sv_data[idx_a])) > 1e-4:
                        if abs(data[idx_a]) > abs(prev_sv_data[idx_a]):
                            effect = "CONSTRUCTIVE_INTERFERENCE"
                        else:
                            effect = "DESTRUCTIVE_CANCELLATION"

                    butterflies.append({
                        "pair_kets": [ka, kb],
                        "gate_applied": desc,
                        "equation_latex": f"\\alpha_{{{ka}}}^{(step_idx)} = {data[idx_a].real:.3f} + {data[idx_a].imag:.3f}i",
                        "effect_type": effect
                    })

        return {
            "step_index": step_idx,
            "active_latex_summary": desc,
            "statevector": sv_entries,
            "bloch_vectors": bloch_vectors,
            "butterfly_transitions": butterflies
        }

    # Step 0
    t0_data = extract_telemetry(running_qc, 0, "Initial State |0⟩^n")
    timeline.append(t0_data)

    prev_data = Statevector(running_qc).data

    # Step through gates
    total_gates = 0
    single_q_gates = 0
    multi_q_gates = 0

    for step in req.steps:
        gate_names = []
        for g in step.gates:
            total_gates += 1
            if g.controls or len(g.targets) > 1:
                multi_q_gates += 1
            else:
                single_q_gates += 1

            apply_gate_to_circuit(running_qc, g, n)
            gate_names.append(f"{g.gate.upper()} on q{g.targets}")

        desc_str = ", ".join(gate_names) if gate_names else f"Step {step.step_index}"
        step_telemetry = extract_telemetry(running_qc, step.step_index, desc_str, prev_data)
        timeline.append(step_telemetry)
        prev_data = Statevector(running_qc).data

    # Generate OpenQASM 3.0
    try:
        qasm_str = qiskit.qasm3.dumps(running_qc)
    except Exception:
        qasm_str = f"OPENQASM 3.0;\ninclude \"stdgates.inc\";\nqubit[{n}] q;\n"

    # Generate Python Qiskit code
    py_code = generate_qiskit_python_code(n, req.steps)

    # Transpile check
    try:
        tqc = transpile(running_qc, basis_gates=["cx", "sx", "x", "rz"], optimization_level=1)
        cx_count = tqc.count_ops().get("cx", 0)
    except Exception:
        cx_count = multi_q_gates

    # Finite shot sampling based on final statevector
    final_probs = [entry["prob"] for entry in timeline[-1]["statevector"]]
    shots = req.shots
    counts: Dict[str, int] = {}
    try:
        sample_indices = np.random.choice(dim, size=shots, p=final_probs)
        for s_idx in sample_indices:
            ket = format(s_idx, f"0{n}b")
            counts[ket] = counts.get(ket, 0) + 1
    except Exception:
        counts = {format(0, f"0{n}b"): shots}

    return {
        "num_qubits": n,
        "hilbert_dimension": dim,
        "circuit_metrics": {
            "total_steps": len(req.steps),
            "total_gates": total_gates,
            "single_qubit_gates": single_q_gates,
            "multi_qubit_gates": multi_q_gates,
            "transpiled_cx_count": cx_count
        },
        "qasm3_code": qasm_str,
        "qiskit_python_code": py_code,
        "timeline": timeline,
        "shot_counts": counts
    }


@router.post(
    "/transpile",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def transpile_circuit(req: TranspileRequest) -> Dict[str, Any]:
    """
    Transpiles the circuit into hardware basis gates, optimizing circuit depth
    and calculating exact CNOT reduction.
    """
    n = req.num_qubits
    qc = QuantumCircuit(n)
    for step in req.steps:
        for g in step.gates:
            apply_gate_to_circuit(qc, g, n)

    orig_depth = qc.depth()
    orig_ops = dict(qc.count_ops())

    basis = req.basis_gates or ["cx", "sx", "x", "rz"]
    try:
        tqc = transpile(qc, basis_gates=basis, optimization_level=req.optimization_level)
        transpiled_depth = tqc.depth()
        transpiled_ops = dict(tqc.count_ops())
        qasm_transpiled = qiskit.qasm3.dumps(tqc)
    except Exception as e:
        transpiled_depth = orig_depth
        transpiled_ops = orig_ops
        qasm_transpiled = qiskit.qasm3.dumps(qc)

    return {
        "original_depth": orig_depth,
        "transpiled_depth": transpiled_depth,
        "original_ops": orig_ops,
        "transpiled_ops": transpiled_ops,
        "cnot_reduction_pct": round(
            max(0.0, 1.0 - (transpiled_ops.get("cx", 0) / max(1, orig_ops.get("cx", 1)))) * 100, 1
        ),
        "transpiled_qasm3": qasm_transpiled
    }


@router.post(
    "/from-image-patch",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def from_image_patch(req: PatchToCircuitRequest) -> Dict[str, Any]:
    """
    Converts a 2x2 or 4x4 lunar patch into step-by-step gates for FRQI, QPIE, or NEQR.
    """
    algo = req.algorithm.upper()
    size = req.patch_size

    # Defaults for 2x2: 4 intensities
    raw_vals = req.intensities if req.intensities else [38.0, 218.0, 42.0, 224.0]
    if size == "2x2":
        pixels = (raw_vals + [0.0] * 4)[:4]
    else:
        pixels = (raw_vals + [0.0] * 16)[:16]

    steps: List[Dict[str, Any]] = []

    if "FRQI" in algo:
        # 2x2 requires 3 qubits (q0=col, q1=row, q2=color)
        num_qubits = 3
        # Step 1: Superposition on spatial qubits
        steps.append({
            "step_index": 1,
            "gates": [
                {"gate": "H", "targets": [0], "controls": [], "params": []},
                {"gate": "H", "targets": [1], "controls": [], "params": []}
            ]
        })
        # Steps 2-5: Multi-controlled RY rotation for each pixel
        for i, val in enumerate(pixels[:4]):
            theta = (val / 255.0) * (math.pi / 2.0)
            c0 = (i % 2)
            c1 = (i // 2)
            # control conditions
            ctrls = []
            anti_ctrls = []
            if c0 == 1: ctrls.append(0)
            else: anti_ctrls.append(0)
            if c1 == 1: ctrls.append(1)
            else: anti_ctrls.append(1)

            steps.append({
                "step_index": len(steps) + 1,
                "gates": [
                    {
                        "gate": "RY",
                        "targets": [2],
                        "controls": ctrls,
                        "anti_controls": anti_ctrls,
                        "params": [round(2 * theta, 4)]
                    }
                ]
            })

        # Step 6: QHED Hadamard on column coordinate (q0)
        steps.append({
            "step_index": len(steps) + 1,
            "gates": [
                {"gate": "H", "targets": [0], "controls": [], "params": []}
            ]
        })

    elif "QPIE" in algo:
        # 2x2 requires 2 qubits
        num_qubits = 2
        # Amplitude encoding tree approximation
        steps.append({
            "step_index": 1,
            "gates": [
                {"gate": "H", "targets": [0], "controls": [], "params": []},
                {"gate": "H", "targets": [1], "controls": [], "params": []}
            ]
        })
        # Continuous phase / amplitude shifts
        v0, v1 = pixels[0], pixels[1]
        th = math.atan2(v1, max(1.0, v0))
        steps.append({
            "step_index": 2,
            "gates": [
                {"gate": "RY", "targets": [0], "controls": [], "params": [round(th, 4)]}
            ]
        })
        # QHED Hadamard
        steps.append({
            "step_index": 3,
            "gates": [
                {"gate": "H", "targets": [0], "controls": [], "params": []}
            ]
        })

    else:
        # NEQR 4-qubit micro cell
        num_qubits = 4
        steps.append({
            "step_index": 1,
            "gates": [
                {"gate": "H", "targets": [0], "controls": [], "params": []},
                {"gate": "H", "targets": [1], "controls": [], "params": []}
            ]
        })
        steps.append({
            "step_index": 2,
            "gates": [
                {"gate": "CX", "targets": [2], "controls": [0], "params": []},
                {"gate": "CX", "targets": [3], "controls": [1], "params": []}
            ]
        })
        steps.append({
            "step_index": 3,
            "gates": [
                {"gate": "CCX", "targets": [3], "controls": [0, 2], "params": []}
            ]
        })

    return {
        "algorithm": algo,
        "patch_size": size,
        "num_qubits": num_qubits,
        "input_pixels": pixels,
        "steps": steps
    }

