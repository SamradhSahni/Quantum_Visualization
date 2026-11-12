"""
Direct Unit Tests for Quantum Circuit Composer & Statevector Engine API
"""
import sys
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.api.routes_composer import (
    simulate_circuit,
    transpile_circuit,
    from_image_patch,
    SimulateRequest,
    StepModel,
    GateModel,
    TranspileRequest,
    PatchToCircuitRequest
)


def test_composer_simulate_bell_state():
    """
    Simulate a 2-qubit Bell state: H on q0, CX from q0 to q1.
    Verify that P(|00>) = 0.5, P(|11>) = 0.5,
    and Bloch vectors have length 0 with entropy 1.0 bit (maximal entanglement).
    """
    req = SimulateRequest(
        num_qubits=2,
        initial_states=["|0>", "|0>"],
        shots=2048,
        steps=[
            StepModel(
                step_index=1,
                gates=[GateModel(gate="H", targets=[0], controls=[], params=[])]
            ),
            StepModel(
                step_index=2,
                gates=[GateModel(gate="X", targets=[1], controls=[0], params=[])]
            )
        ]
    )
    data = simulate_circuit(req)

    assert data["num_qubits"] == 2
    assert data["hilbert_dimension"] == 4
    assert len(data["timeline"]) == 3  # step 0 (init), step 1 (H), step 2 (CX)

    final_step = data["timeline"][-1]
    sv = {entry["ket"]: entry for entry in final_step["statevector"]}

    # Unitarity: sum of probabilities == 1.0
    total_prob = sum(entry["prob"] for entry in final_step["statevector"])
    assert abs(total_prob - 1.0) < 1e-5

    # Bell state amplitudes: |00> and |11> should be ~0.5 probability
    assert abs(sv["00"]["prob"] - 0.5) < 1e-4
    assert abs(sv["11"]["prob"] - 0.5) < 1e-4
    assert abs(sv["01"]["prob"]) < 1e-5
    assert abs(sv["10"]["prob"]) < 1e-5

    # Entanglement test: individual qubit Bloch vectors must contract to ~0
    bloch0 = final_step["bloch_vectors"][0]
    bloch1 = final_step["bloch_vectors"][1]
    r0_norm = (bloch0["rx"] ** 2 + bloch0["ry"] ** 2 + bloch0["rz"] ** 2) ** 0.5
    r1_norm = (bloch1["rx"] ** 2 + bloch1["ry"] ** 2 + bloch1["rz"] ** 2) ** 0.5
    assert r0_norm < 1e-3
    assert r1_norm < 1e-3
    assert abs(bloch0["entropy_bits"] - 1.0) < 1e-3
    assert abs(bloch1["entropy_bits"] - 1.0) < 1e-3


def test_composer_transpile():
    """
    Test Qiskit transpilation endpoint for a Toffoli circuit.
    """
    req = TranspileRequest(
        num_qubits=3,
        steps=[
            StepModel(
                step_index=1,
                gates=[GateModel(gate="CCX", targets=[2], controls=[0, 1], params=[])]
            )
        ],
        optimization_level=3
    )
    data = transpile_circuit(req)
    assert "transpiled_ops" in data
    assert "cx" in data["transpiled_ops"]
    assert data["transpiled_ops"]["cx"] == 6


def test_composer_from_image_patch():
    """
    Test converting a 2x2 lunar crater patch into FRQI and QPIE circuit steps.
    """
    req = PatchToCircuitRequest(
        patch_size="2x2",
        intensities=[38.0, 218.0, 42.0, 224.0],
        algorithm="FRQI"
    )
    data = from_image_patch(req)
    assert data["num_qubits"] == 3
    assert len(data["steps"]) >= 5


if __name__ == "__main__":
    test_composer_simulate_bell_state()
    print("test_composer_simulate_bell_state PASSED")
    test_composer_transpile()
    print("test_composer_transpile PASSED")
    test_composer_from_image_patch()
    print("test_composer_from_image_patch PASSED")
