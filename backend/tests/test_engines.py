import sys
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import numpy as np
from backend.app.quantum.halo_tiler import HaloTiler
from backend.app.quantum.frqi_qhed import execute_frqi_qhed_patch
from backend.app.quantum.qpie_qhed import execute_qpie_qhed_patch
from backend.app.quantum.neqr_gradient import execute_neqr_gradient_patch
from backend.app.core.algorithms import run_sobel, run_canny, run_robinson
from backend.app.core.metrics import compute_intrinsic_quality_metrics

def main():
    print("--- 1. Testing HaloTiler ---")
    tiler = HaloTiler(core_size=6, halo_pad=1)
    img = np.random.randint(0, 255, (256, 256), dtype=np.uint8)
    padded, ny, nx = tiler.pad_image(img)
    patch = tiler.extract_patch(padded, 10, 10)
    assert patch.shape == (8, 8), f"Bad patch shape: {patch.shape}"
    print(f"Padded shape: {padded.shape}, Tiles: ({ny}, {nx}), Patch: {patch.shape}")

    print("--- 2. Testing FRQI Patch Execution & Telemetry ---")
    frqi_res = execute_frqi_qhed_patch(patch, full_qiskit_telemetry=True)
    assert frqi_res["edge_core_6x6"].shape == (6, 6)
    assert frqi_res["gate_telemetry"] is not None
    print("FRQI patch telemetry steps count:", len(frqi_res["gate_telemetry"]["steps"]))

    print("--- 3. Testing QPIE Patch Execution & L2 Scaling ---")
    qpie_res = execute_qpie_qhed_patch(patch, full_qiskit_telemetry=True)
    assert qpie_res["edge_core_6x6"].shape == (6, 6)
    assert qpie_res["gate_telemetry"] is not None
    print("QPIE gamma norm:", qpie_res["gate_telemetry"]["gamma_norm"])

    print("--- 4. Testing NEQR Patch Execution (14 Qubits) ---")
    neqr_res = execute_neqr_gradient_patch(patch, full_qiskit_telemetry=True)
    assert neqr_res["edge_core_6x6"].shape == (6, 6)
    assert neqr_res["gate_telemetry"] is not None
    print("NEQR bitstring sample:", neqr_res["gate_telemetry"]["binary_string"])

    print("--- 5. Testing Classical Algorithms ---")
    s_res = run_sobel(img[:64, :64])
    c_res = run_canny(img[:64, :64])
    r_res = run_robinson(img[:64, :64])
    print(f"Sobel: {s_res['latency_ms']}ms, Canny: {c_res['latency_ms']}ms, Robinson: {r_res['latency_ms']}ms")

    print("--- ALL TEST SUITE ASSERTIONS PASSED! ---")

if __name__ == "__main__":
    main()
