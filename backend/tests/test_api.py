import sys
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.api.routes_presets import list_presets, get_preset_image
from backend.app.api.routes_studio import inspect_patch, PatchInspectRequest, instant_sweep, SweepRequest
from backend.app.api.routes_benchmark import compare_all, BenchmarkCompareRequest
from backend.app.api.routes_docs import simulate_patch_docs, SimulatePatchRequest

def main():
    print("--- 1. Testing Presets API ---")
    presets = list_presets()
    assert len(presets) >= 3
    print("Preset count:", len(presets))
    p_img = get_preset_image("synthetic_rim_512", size=64)
    assert p_img["image_base64"] is not None
    print("Fetched synthetic preset image successfully.")

    print("--- 2. Testing Studio Inspect Patch API ---")
    req = PatchInspectRequest(preset_id="synthetic_rim_512", tile_y=5, tile_x=5, algorithm="FRQI-QHED", step_index=2)
    patch_data = inspect_patch(req)
    assert patch_data["status"] == "success"
    assert patch_data["gate_telemetry"] is not None
    print("Inspected patch algorithm:", patch_data["algorithm"], "Qubits:", patch_data["qubits"])

    print("--- 3. Testing Benchmark Compare API ---")
    b_req = BenchmarkCompareRequest(preset_id="synthetic_rim_512", resolution=64)
    bench_data = compare_all(b_req)
    assert bench_data["status"] == "success"
    assert len(bench_data["cards"]) == 6
    print("Benchmark cards successfully generated:", [c["name"] for c in bench_data["cards"]])
    print("Verdict:", bench_data["verdict"][:60], "...")

    print("--- 4. Testing Docs Interactive Simulation API ---")
    doc_req = SimulatePatchRequest(algorithm="frqi", preset="crater_rim", patch_8x8=[[120]*8 for _ in range(8)])
    doc_res = simulate_patch_docs(doc_req)
    assert doc_res["status"] == "success"
    assert doc_res["qubits_used"] == 7
    print("Docs patch simulation succeeded:", doc_res["algorithm_display"], "qubits:", doc_res["qubits_used"])

    print("--- ALL DIRECT ROUTER TESTS PASSED! ---")

if __name__ == "__main__":
    main()
