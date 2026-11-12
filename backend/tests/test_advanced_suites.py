"""
Direct Unit Tests for the 5 Advanced Expansion Suites & 4 Gate Invariants
QML Pipeline, 3D Lunar GIS, NISQ Hardware Lab, Publication Suite, and Algorithm Arena.
"""
import sys
import math
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import numpy as np

# QML Domain
from backend.app.domain.qml.wavelet_equalizer import equalize_wavelet_subbands, qwt_2d_decompose, apply_wavelet_denoising
from backend.app.domain.qml.qcnn_hilbert import classify_patch_qcnn, TERRAIN_CLASSES_5
from backend.app.domain.qml.grover_compass import analyze_grover_subspace, apply_grover_amplification
from backend.app.domain.qml.ncqi_fusion import fuse_ncqi_multispectral
from backend.app.domain.qml.barren_plateau import compute_loss_surface

# GIS Domain
from backend.app.domain.gis.dem_photometry import generate_crater_dem_mesh, compute_slope_and_photometry
from backend.app.domain.gis.lander_safety import evaluate_landing_site, find_top_safe_landing_zones
from backend.app.domain.gis.transect_rover import extract_transect_profile
from backend.app.domain.gis.crater_chronology import analyze_crater_chronology, extract_crater_morphometry
from backend.app.domain.gis.geojson_exporter import export_craters_to_geojson
from backend.app.domain.gis.interferometry import compute_temporal_change

# Hardware Domain
from backend.app.domain.hardware.nisq_channels import simulate_noisy_edge_snr
from backend.app.domain.hardware.zne_pauli_twirl import compute_4way_mitigation_comparison, apply_richardson_zne
from backend.app.domain.hardware.topology_sabre import route_circuit_sabre
from backend.app.domain.hardware.openpulse_waveform import generate_drag_pulse, generate_openpulse_schedule
from backend.app.domain.hardware.readout_mitigator import mitigate_readout_probabilities
from backend.app.domain.hardware.ftqc_surface_code import estimate_ftqc_surface_code, estimate_ftqc_resources

# Publish & Arena Domain
from backend.app.domain.publish.quantikz_generator import generate_quantikz_circuit_latex, generate_booktabs_scorecard_latex
from backend.app.domain.publish.polyglot_transpiler import transpile_circuit_polyglot
from backend.app.api.routes_arena import evaluate_custom_algorithm, CustomArenaEvaluateRequest


def test_qwt_wavelet_denoising():
    patch = np.ones((8, 8), dtype=np.float64) * 100.0
    patch[3:5, 3:5] = 240.0
    denoised, meta = apply_wavelet_denoising(patch, strength=0.70)
    assert denoised.shape == (8, 8)
    assert meta["snr_gain_db"] >= 0.0
    assert "subband_matrices" in meta


def test_qwt_energy_conservation_gate():
    """Gate 2 Invariant: Unitarity of U_QHWT^(2D) preserves statevector norm within 10^-12."""
    raw = np.random.uniform(10.0, 250.0, size=(8, 8))
    # Normalize statevector to norm 1.0
    norm_factor = np.linalg.norm(raw)
    state = raw / norm_factor
    
    ll, lh, hl, hh = qwt_2d_decompose(state)
    subband_norm_sum = np.sum(ll**2) + np.sum(lh**2) + np.sum(hl**2) + np.sum(hh**2)
    assert abs(subband_norm_sum - 1.0) < 1e-11


def test_qcnn_classifier():
    patch = np.ones((8, 8), dtype=np.float64) * 50.0
    patch[:, 4:] = 220.0
    res = classify_patch_qcnn(patch)
    assert len(res["class_fractions"]) == 5
    assert sum(res["class_fractions"].values()) >= 0.98
    assert res["kernel_silhouette_score"] > 0.70
    assert len(res["hilbert_umap_3d_points"]) == 16


def test_grover_amplification():
    p_edge = np.array([0.08])
    p_amp, meta = apply_grover_amplification(p_edge, r_iterations=1)
    assert p_amp[0] > 0.40
    assert meta["amplification_gain"] > 3.0


def test_grover_souffle_guard_gate():
    """Gate 2 Invariant: Over-rotation warning triggers if and only if (2r+1)*theta > pi/2."""
    p_edge = np.array([0.08])
    # r=1: (2*1 + 1)*arcsin(sqrt(0.08)) = 3 * 0.2868 = 0.860 rad <= pi/2 (no warning)
    _, meta1 = analyze_grover_subspace(p_edge, r_iterations=1)
    assert not meta1["over_rotation_warning"]
    
    # r=6: (2*6 + 1)*0.2868 = 13 * 0.2868 = 3.728 rad > pi/2 (over-rotated soufflé collapse)
    _, meta6 = analyze_grover_subspace(p_edge, r_iterations=6)
    assert meta6["over_rotation_warning"]


def test_artemis_lander_safety_index_gate():
    """Gate 2 Invariant: Flat mare yields LSI > 90, steep rim yields LSI < 25."""
    # Flat mare terrain (flat elevation, zero edges)
    flat_h = np.full((32, 32), 100.0, dtype=np.float64)
    flat_q = np.zeros((32, 32), dtype=np.float64)
    safe_eval = evaluate_landing_site(flat_h, flat_q, 16, 16, lander_profile_key="ARTEMIS_HLS_STARSHIP_50M")
    assert safe_eval["landing_safety_index"] > 90.0
    assert safe_eval["status"] == "CERTIFIED_SAFE"
    
    # Steep crater rim wall (high elevation gradient, high edge probability)
    y, x = np.ogrid[:32, :32]
    steep_h = (x * 40.0) + (y * 40.0)  # very steep > 25 degrees
    steep_q = np.full((32, 32), 0.85, dtype=np.float64)
    hazard_eval = evaluate_landing_site(steep_h, steep_q, 16, 16, lander_profile_key="ARTEMIS_HLS_STARSHIP_50M")
    assert hazard_eval["landing_safety_index"] < 25.0
    assert hazard_eval["status"] == "ABORT_HAZARD"


def test_openpulse_drag_orthogonality_gate():
    """Gate 2 Invariant: DRAG quadrature envelope Omega_Q(t) integrates to zero."""
    pulse = generate_drag_pulse(duration_ns=40.0, amplitude=0.85, sigma_ns=10.0, num_samples=32)
    assert pulse["is_drag_orthogonal"]
    assert abs(pulse["q_integral_residual"]) < 1e-4


def test_gis_crater_morphometry_and_geojson():
    heights, normals, meta = generate_crater_dem_mesh(resolution=64)
    assert heights.shape == (64, 64)
    assert meta["max_elevation_m"] > meta["min_elevation_m"]

    edge_dummy = np.zeros((64, 64), dtype=np.uint8)
    craters = extract_crater_morphometry(edge_dummy, heights)
    assert len(craters) >= 2
    assert craters[0]["diameter_km"] > 0

    geojson = export_craters_to_geojson(craters)
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) == len(craters)
    assert "IAU_2015:30100" in geojson["crs"]["properties"]["name"]


def test_hardware_richardson_zne():
    s1, s3, s5 = 1.42, 1.11, 0.94
    mitigated_snr, meta = apply_richardson_zne(s1, s3, s5)
    assert mitigated_snr > s1
    assert len(meta["richardson_weights"]) == 3


def test_ftqc_resource_estimator():
    res = estimate_ftqc_resources(image_dim=512, algorithm="FRQI")
    assert res["logical_qubits"] == 19
    assert res["total_physical_qubits"] > 1000
    assert "scaling_curve" in res


def test_publish_latex_and_polyglot():
    circuit_tex = generate_quantikz_circuit_latex(num_qubits=7)
    assert "\\begin{quantikz}" in circuit_tex
    assert "\\end{quantikz}" in circuit_tex

    table_tex = generate_booktabs_scorecard_latex()
    assert "\\begin{tabular}" in table_tex
    assert "\\toprule" in table_tex

    poly = transpile_circuit_polyglot(num_qubits=7)
    assert "QuantumCircuit(7, 7)" in poly["qiskit"]
    assert "qml.device('default.qubit'" in poly["pennylane"]
    assert "Circuit()" in poly["braket"]
    assert "cirq.Circuit(" in poly["cirq"]
    assert "OPENQASM 3.0;" in poly["openqasm3"]


def test_arena_custom_evaluation():
    req = CustomArenaEvaluateRequest(
        custom_algorithm_name="Hadamard-Ising-Kernel",
        num_qubits=7,
        qasm3_code="""OPENQASM 3.0;
include "stdgates.inc";
qubit[7] q;
bit[7] c;
h q[0];
cx q[0], q[6];
h q[0];
c = measure q;""",
        shots=4096
    )
    res = evaluate_custom_algorithm(req)
    assert res["status"] == "success"
    assert res["custom_result"]["metrics"]["pratt_fom"] >= 0.70
    assert len(res["leaderboard"]) >= 5


def test_gis_preset_differentiation_and_quantum_backbones():
    from backend.app.api.routes_gis import (
        AnalyzeTerrainContractRequest,
        TemporalChangeRequest,
        analyze_terrain,
        compute_crater_morphometry,
        detect_temporal_interferometry,
        MorphometryRequest,
    )

    ap = analyze_terrain(AnalyzeTerrainContractRequest(preset_id="apollo_16", resolution=96, pad_gsd_m_px=5.0))
    sh = analyze_terrain(AnalyzeTerrainContractRequest(preset_id="shackleton", resolution=96, pad_gsd_m_px=5.0))
    ty = analyze_terrain(AnalyzeTerrainContractRequest(preset_id="tycho", resolution=96, pad_gsd_m_px=5.0))
    lro = analyze_terrain(AnalyzeTerrainContractRequest(preset_id="lro_wac_real", resolution=96, pad_gsd_m_px=5.0))

    assert ap["site_metadata"]["relief_m"] != sh["site_metadata"]["relief_m"]
    assert sh["photometry_meta"]["psr_fraction_pct"] > ap["photometry_meta"]["psr_fraction_pct"]
    assert ty["crater_chronology"]["neukum_model_age_ga"] < ap["crater_chronology"]["neukum_model_age_ga"]
    assert len(lro["heights_grid"]) == 96 and len(lro["heights_grid"][0]) == 96

    # Check lander footprint differentiation on Shackleton narrow ridge bench
    comps = {c["lander_profile"]: c["landing_safety_index"] for c in sh["landing_safety_analysis"]["lander_comparison"]}
    assert comps["CHANDRAYAAN_VIKRAM_12M"] > comps["ARTEMIS_HLS_STARSHIP_50M"]

    # Check quantum edge backbone sensitivity
    qpie = analyze_terrain(
        AnalyzeTerrainContractRequest(preset_id="apollo_16", algorithm="QPIE_QHED", resolution=96, pad_gsd_m_px=5.0)
    )
    assert qpie["quantum_edge_stats"]["algorithm"] == "QPIE_QHED"
    assert qpie["quantum_edge_stats"]["edge_density_pct"] != ap["quantum_edge_stats"]["edge_density_pct"]

    # Check direct vs A* safe detour comparison
    assert ap["transect_comparison"]["safe_detour"]["rover_energy_wh"] <= ap["transect_comparison"]["direct"]["rover_energy_wh"]

    # Check /morphometry endpoint
    morph = compute_crater_morphometry(MorphometryRequest(preset_id="tycho"))
    assert morph["craters_detected"] >= 2
    assert len(morph["geojson"]["features"]) == morph["craters_detected"]

    # Check /interferometry endpoint with threshold & normalization (regression for TypeError bug)
    imp = detect_temporal_interferometry(TemporalChangeRequest(scenario="new_impact", change_threshold=0.15))
    assert imp["metadata"]["status"] == "IMPACT_DETECTED"
    assert imp["metadata"]["changed_surface_pct"] > 0.5

    stable = detect_temporal_interferometry(
        TemporalChangeRequest(scenario="solar_shift_control", change_threshold=0.15, normalize_illumination=True)
    )
    assert stable["metadata"]["status"] == "SURFACE_STABLE"


def test_qml_pipeline_5_stage_coupling_and_ansatzes():
    from backend.app.api.routes_qml import QmlPipelineContractRequest, full_qml_pipeline

    sh = full_qml_pipeline(QmlPipelineContractRequest(preset_id="shackleton", qcnn_ansatz="STRONGLY_ENTANGLING_RING"))
    ap = full_qml_pipeline(QmlPipelineContractRequest(preset_id="apollo16", qcnn_ansatz="STRONGLY_ENTANGLING_RING"))
    ri = full_qml_pipeline(QmlPipelineContractRequest(preset_id="rille", qcnn_ansatz="STRONGLY_ENTANGLING_RING"))
    ri_iqp = full_qml_pipeline(QmlPipelineContractRequest(preset_id="rille", qcnn_ansatz="ISWAP_IQP_KERNEL"))

    # Distinct mission target geology & normalized probabilities
    for res in (sh, ap, ri):
        assert res["tile_resolution"] == 16
        assert abs(sum(res["qcnn_classification"]["class_fractions"].values()) - 1.0) <= 0.02
        assert len(res["qcnn_classification"]["hilbert_umap_3d_points"]) == 64
        assert len(res["wavelet_telemetry"]["subband_matrices"]["ll"]) == 8
        assert res["wavelet_telemetry"]["is_unitary_conserved"]
        assert len(res["barren_plateau_diagnostics"]["optimizer_trajectory"]) == 22
        assert len(res["grover_oscilloscope"]["oscillation_curve"]) == 7

    assert sh["multi_spectral_fusion"]["qcics_ice_traps_found"] > ap["multi_spectral_fusion"]["qcics_ice_traps_found"]
    assert sh["qcnn_classification"]["class_fractions"]["Polar Ice Cold Trap"] > 0.05
    assert ri["qcnn_classification"]["class_fractions"]["Sinuous Lunar Rille"] > ap["qcnn_classification"]["class_fractions"]["Sinuous Lunar Rille"]
    assert ri["qcnn_classification"]["sample_quantum_kernel_gram"] != ri_iqp["qcnn_classification"]["sample_quantum_kernel_gram"]

    # Barren plateau comparison across local vs global cost
    bp_local = full_qml_pipeline(QmlPipelineContractRequest(cost_function_type="LOCAL_PAULI_Z", num_qubits=8))
    bp_global = full_qml_pipeline(QmlPipelineContractRequest(cost_function_type="GLOBAL_PROJECTOR", num_qubits=8))
    assert not bp_local["barren_plateau_diagnostics"]["is_barren_plateau"]
    assert bp_global["barren_plateau_diagnostics"]["is_barren_plateau"]
    assert bp_local["barren_plateau_diagnostics"]["gradient_variance"] > bp_global["barren_plateau_diagnostics"]["gradient_variance"]


def test_benchmark_research_suites_catalog():
    import json
    from backend.app.api.routes_benchmark import get_curated_research_suites

    payload = get_curated_research_suites()
    # Must serialize as strict RFC 8259 JSON without NaN or Infinity
    dumped = json.dumps(payload, allow_nan=False)
    assert len(dumped) > 50_000

    assert len(payload["grand_summary"]) == 5
    assert payload["matched_aer"]["protocol_totals"]["total_circuits"] == 57600
    assert len(payload["matched_aer"]["primary_8crop"]) >= 6
    assert len(payload["matched_aer"]["subset_6crop"]) == 11
    assert len(payload["matched_aer"]["bootstrap_intervals"]) >= 3

    assert len(payload["exp1_geometry"]) == 40
    assert len(payload["exp2_shots"]) == 42
    assert len(payload["exp4_degradation"]) == 108
    assert len(payload["exp5_nisq_noise"]) == 40
    assert len(payload["exp7_preprocessing"]) == 84
    assert len(payload["exp8_sombench"]) == 120
    assert len(payload["exp10_failure_taxonomy"]) == 16
    assert len(payload["timing_analysis"]) >= 1
    assert "matched_aer" in payload["suite_interpretations"]
    assert "what_it_tests" in payload["suite_interpretations"]["matched_aer"]
    assert "what_it_shows" in payload["suite_interpretations"]["matched_aer"]



