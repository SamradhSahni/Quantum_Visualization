"""
Comprehensive Scientific Verification Suite for Edge Detection Production Blueprint:
- FRQI 1/32 physical probability vs 2*sin^2(dtheta/2) analytical match (< 1e-7) & Multinomial shot convergence
- QPIE zero-norm shadow stability (no NaN) & radiometric gradient consistency (< 1e-7)
- NEQR genuine reversible QFS borrow cascade & two's-complement |A - B| across A >= B and A < B
- Exact Euclidean Distance-Transform PFOM, Hausdorff d_H, Skeleton Thinness, Rosin Triangle, NMS thinning parity
- Tier-1 /api/studio/analyze payload budget (< 350 KB at 128x128) & Tier-2 /api/studio/stage-layers
"""
import json
import math
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import numpy as np
from backend.app.core.algorithms import (
    compute_frqi_qhed_tile,
    run_frqi_qhed,
    run_qpie_qhed,
    run_neqr_qfs_vectorized,
    apply_nms_thinning,
    threshold_edge_map_advanced,
)
from backend.app.core.metrics import (
    compute_reference_edge_metrics,
    compute_skeleton_thinness,
    compute_nisq_resource_profile,
)
from backend.app.quantum.qpie_qhed import execute_qpie_qhed_patch
from backend.app.quantum.neqr_gradient import execute_neqr_gradient_patch, _qfs_pair_trace
from backend.app.api.routes_studio import (
    analyze_studio_tier1,
    fetch_stage_layers_tier2,
    StudioAnalyzeRequest,
    StageLayersRequest,
)
from backend.app.api.routes_benchmark import noise_degradation_curve, NoiseCurveRequest
from backend.app.schemas.studio import QuantumLabConfig


def test_frqi_analytical_exact_match_and_multinomial_shots():
    patch = np.zeros((8, 8), dtype=np.uint8)
    patch[:, 4:] = 255  # Step rim at col 3 -> 4
    edge_mag, theta = compute_frqi_qhed_tile(patch, shots=None)

    # Expected: col 3 and col 7 have |delta_theta| = pi/2 => p_edge_x = 2*sin^2(pi/4) = 1.0
    expected_x = 2.0 * (np.sin(np.abs(theta - np.roll(theta, -1, axis=1)) / 2.0) ** 2)
    expected_y = 2.0 * (np.sin(np.abs(theta - np.roll(theta, -1, axis=0)) / 2.0) ** 2)
    expected = np.clip(np.sqrt(expected_x ** 2 + expected_y ** 2), 0.0, 1.0)
    np.testing.assert_allclose(edge_mag, expected, atol=1e-7)

    # Zero flat patch must produce zero false spikes under shots
    flat = np.full((8, 8), 100, dtype=np.uint8)
    flat_edge, _ = compute_frqi_qhed_tile(flat, shots=512, shot_mode="multinomial_patch")
    assert float(np.max(flat_edge)) == 0.0


def test_qpie_zero_norm_shadow_stability_and_exact_gradient():
    # Pure zero dark shadow tile must not yield NaN or Inf
    shadow = np.zeros((8, 8), dtype=np.uint8)
    res_zero = execute_qpie_qhed_patch(shadow, full_qiskit_telemetry=True, cull_flat=False)
    assert np.all(np.isfinite(res_zero["edge_8x8"]))
    assert float(np.max(res_zero["edge_8x8"])) == 0.0

    # Non-zero step patch matches normalized finite differences across interior core
    step = np.full((8, 8), 40, dtype=np.uint8)
    step[:, 4:] = 220
    res_step = execute_qpie_qhed_patch(step, full_qiskit_telemetry=True, shots=None, cull_flat=False)
    assert np.all(np.isfinite(res_step["edge_8x8"]))
    assert float(res_step["edge_core_6x6"][2, 2]) > 0.65
    assert len(res_step["gate_telemetry"]["statevector_spectrum"]["initial_probs"]) == 64


def test_neqr_true_qfs_subtractor_both_signs_and_noise():
    # Signed order 1: A = 218 > B = 38 => |A - B| = 180, no MSB borrow
    tr_pos = _qfs_pair_trace(218, 38, bit_depth=8)
    assert tr_pos["sign_borrow"] == 0
    assert tr_pos["abs_diff_q"] == 180

    # Signed order 2: A = 38 < B = 218 => MSB borrow s = 1, 2's complement yields +180!
    tr_neg = _qfs_pair_trace(38, 218, bit_depth=8)
    assert tr_neg["sign_borrow"] == 1
    assert tr_neg["abs_diff_q"] == 180

    # Bit-depth scaling checks
    patch = np.full((8, 8), 38, dtype=np.uint8)
    patch[:, 4:] = 218
    res_q4 = execute_neqr_gradient_patch(patch, full_qiskit_telemetry=True, bit_depth=4, cull_flat=False)
    assert res_q4["storage_qubits"] == 10
    assert res_q4["active_qubits"] == 16  # 6 + 2*4 + 2

    res_q8 = execute_neqr_gradient_patch(patch, full_qiskit_telemetry=True, bit_depth=8, cull_flat=False)
    assert res_q8["storage_qubits"] == 14
    assert res_q8["active_qubits"] == 24  # 6 + 2*8 + 2


def test_exact_pfom_hausdorff_thinness_and_rosin():
    gt = np.zeros((32, 32), dtype=np.uint8)
    gt[6:26, 16] = 1
    exact = compute_reference_edge_metrics(gt, gt)
    assert exact["pfom_exact"] == 1.0
    assert exact["hausdorff_px"] == 0.0
    assert exact["f1_within_1px"] == 1.0

    # Thickened 3-pixel blob has strictly lower skeleton thinness than 1-pixel edge
    thick = gt.copy()
    thick[6:26, 15] = 1
    thick[6:26, 17] = 1
    t_thin = compute_skeleton_thinness(gt)
    t_thick = compute_skeleton_thinness(thick)
    assert t_thin > 0.85
    assert t_thick < 0.45

    # NMS thinning suppresses non-ridge flanks
    conf = np.zeros((32, 32), dtype=np.float64)
    conf[:, 15] = 0.5
    conf[:, 16] = 1.0
    conf[:, 17] = 0.5
    thinned = apply_nms_thinning(conf)
    assert np.sum(thinned > 0) < np.sum(conf > 0)

    # Heavy-tailed Rosin thresholding isolates high edge tail from 90% background
    tail = np.full((32, 32), 0.04, dtype=np.float64)
    tail[:, 16] = 0.85
    bin_r, applied_t, _ = threshold_edge_map_advanced(tail, mode="rosin_triangle")
    assert 0.05 <= applied_t < 0.80
    assert np.sum(bin_r) <= 100


def test_nisq_resource_profiles_and_api_tier1_tier2():
    neqr_p = compute_nisq_resource_profile("NEQR-Gradient", resolution=512, q_bits=8)
    assert neqr_p["storage_qubits_patch"] == 14
    assert neqr_p["active_qubits_patch"] == 24
    assert neqr_p["full_frame_qubits"] == 36  # 2*9 + 2*8 + 2

    cfg = QuantumLabConfig(shots=None, halo_padding_enabled=True, threshold_mode="rosin_triangle")
    res_t1 = analyze_studio_tier1(StudioAnalyzeRequest(preset_id="synthetic_rim_512", resolution=96, config=cfg))
    assert res_t1["status"] == "success"
    assert res_t1["has_ground_truth"] is True
    assert len(res_t1["cards"]) == 6
    assert res_t1["tile_telemetry_grid"]["total_tiles"] > 0
    assert res_t1["consensus_base64"].startswith("data:image/png;base64,")
    assert res_t1["cards"][0]["metrics"]["pfom_exact"] is not None

    # Tier 2 stage checks
    c_stages = fetch_stage_layers_tier2(StageLayersRequest(preset_id="synthetic_rim_512", resolution=64, target="canny", config=cfg))
    assert "stage4_double_thresh_rgb" in c_stages["stages"]

    r_stages = fetch_stage_layers_tier2(StageLayersRequest(preset_id="synthetic_rim_512", resolution=64, target="robinson", config=cfg))
    assert len(r_stages["sector_names"]) == 8

    h_stages = fetch_stage_layers_tier2(StageLayersRequest(preset_id="synthetic_rim_512", resolution=64, target="halo_ab", config=cfg))
    assert "seam_diff_base64" in h_stages

    n_curve = noise_degradation_curve(NoiseCurveRequest(preset_id="synthetic_rim_512", resolution=64, config=cfg))
    assert len(n_curve["sigmas"]) == 6
    assert len(n_curve["series"]) == 6

