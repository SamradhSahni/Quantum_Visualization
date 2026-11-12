"""
Quantum Image Processing Documentation & Interactive Sandbox API
Provides real-time patch simulation and concrete numerical step-by-step
telemetry traces for FRQI-QHED, QPIE-QHED, and NEQR-Gradient.
Complies with quantum_image_processing_encyclopedia_interactive_documentation_pages_specification.md Section 5.2.
"""
from typing import Optional, List, Dict, Any
import math
import time
import numpy as np
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from backend.app.core.dependencies import (
    acquire_user_compute_slot,
    require_researcher,
    verify_hmac_csrf,
)
from backend.app.quantum.neqr_gradient import _qfs_pair_trace

router = APIRouter(tags=["documentation"])


class InspectCoord(BaseModel):
    row: int = Field(default=3, ge=0, le=7)
    col: int = Field(default=2, ge=0, le=7)


class SimParameters(BaseModel):
    shots: Optional[int] = Field(default=4096, ge=1, le=65536)
    threshold: float = Field(default=0.25, ge=0.0, le=1.0)
    phase_gain: float = Field(default=1.0, ge=0.1, le=4.0)
    bit_depth: int = Field(default=8, ge=2, le=8)
    halo_padding: bool = True
    norm_type: str = Field(default="L2", max_length=16)
    epsilon_floor: float = Field(default=1.0, ge=0.01, le=255.0)


class SimulatePatchRequest(BaseModel):
    algorithm: str = Field(default="FRQI_QHED", max_length=48)
    patch_8x8: List[List[int]] = Field(..., max_length=16)
    inspect_coord: InspectCoord = InspectCoord()
    parameters: SimParameters = SimParameters()


@router.post(
    "/api/v1/docs/simulate-patch",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
@router.post(
    "/api/docs/simulate-patch",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def simulate_patch_docs(req: SimulatePatchRequest) -> Dict[str, Any]:
    t0 = time.perf_counter()
    algo = req.algorithm.upper().replace("-", "_")

    # Ingest 8x8 patch
    img = np.array(req.patch_8x8, dtype=np.float32)
    if img.shape != (8, 8):
        img = np.resize(img, (8, 8))

    r_insp = max(0, min(req.inspect_coord.row, 7))
    c_insp = max(0, min(req.inspect_coord.col, 7))
    c_next = (c_insp + 1) % 8
    r_next = (r_insp + 1) % 8

    p = req.parameters
    thresh = float(p.threshold)

    # -------------------------------------------------------------
    # 1. FRQI + QHED Simulation
    # -------------------------------------------------------------
    if "FRQI" in algo:
        qubits = 7
        depth = 14
        display_name = "FRQI QHED"

        # Apply phase gain
        gain = float(p.phase_gain)
        theta_grid = np.clip((img / 255.0) * (math.pi / 2.0) * gain, 0.0, math.pi / 2.0)

        # Horizontal Even Pass: (2k, 2k+1)
        horiz_even = np.zeros((8, 8), dtype=np.float32)
        for r in range(8):
            for k in range(4):
                c0 = 2 * k
                c1 = 2 * k + 1
                diff = abs(theta_grid[r, c0] - theta_grid[r, c1])
                prob = 2.0 * (math.sin(diff / 2.0) ** 2)
                horiz_even[r, c0] = prob
                horiz_even[r, c1] = prob

        # Horizontal Odd Pass (via D8 shift): (2k+1, 2k+2)
        horiz_odd = np.zeros((8, 8), dtype=np.float32)
        for r in range(8):
            for k in range(4):
                c0 = 2 * k + 1
                c1 = (2 * k + 2) % 8
                diff = abs(theta_grid[r, c0] - theta_grid[r, c1])
                prob = 2.0 * (math.sin(diff / 2.0) ** 2)
                horiz_odd[r, c0] = prob

        # Combined Horizontal Pass
        horiz_combined = np.maximum(horiz_even, horiz_odd)

        # Vertical Combined Pass
        vert_combined = np.zeros((8, 8), dtype=np.float32)
        for c in range(8):
            for r in range(8):
                r_n = (r + 1) % 8
                diff = abs(theta_grid[r, c] - theta_grid[r_n, c])
                prob = 2.0 * (math.sin(diff / 2.0) ** 2)
                vert_combined[r, c] = prob

        # Shot-noise sampling simulation if finite shots requested
        if p.shots and p.shots > 0 and p.shots < 100000:
            s_eff = p.shots / 64.0
            noise_h = np.random.normal(0, np.sqrt(np.clip(horiz_combined * (1.0 - horiz_combined), 0, 1) / max(1.0, s_eff)))
            noise_v = np.random.normal(0, np.sqrt(np.clip(vert_combined * (1.0 - vert_combined), 0, 1) / max(1.0, s_eff)))
            horiz_combined = np.clip(horiz_combined + noise_h * 0.15, 0.0, 1.0)
            vert_combined = np.clip(vert_combined + noise_v * 0.15, 0.0, 1.0)

        # 2D Euclidean fusion
        fused = np.clip(np.sqrt(horiz_combined ** 2 + vert_combined ** 2), 0.0, 1.0)
        binary_map = (fused >= thresh).astype(int)

        # Inspect Pair Trace
        val_a = float(img[r_insp, c_insp])
        val_b = float(img[r_insp, c_next])
        th_a = float(theta_grid[r_insp, c_insp])
        th_b = float(theta_grid[r_insp, c_next])
        cos_a, sin_a = math.cos(th_a), math.sin(th_a)
        cos_b, sin_b = math.cos(th_b), math.sin(th_b)

        d_cos = (cos_a - cos_b) / math.sqrt(2.0)
        d_sin = (sin_a - sin_b) / math.sqrt(2.0)
        p_circ = float((1.0 / 32.0) * (math.sin(abs(th_a - th_b) / 2.0) ** 2))
        bloch_chord = float(2.0 * math.sin(abs(th_a - th_b) / 2.0))
        h_prob = float(horiz_combined[r_insp, c_insp])
        v_prob = float(vert_combined[r_insp, c_insp])
        f_conf = float(fused[r_insp, c_insp])

        trace = {
            "coord_a": [r_insp, c_insp],
            "coord_b": [r_insp, c_next],
            "intensity_a": int(val_a),
            "intensity_b": int(val_b),
            "theta_a": round(th_a, 4),
            "theta_b": round(th_b, 4),
            "p_circuit": round(p_circ, 6),
            "bloch_chord": round(bloch_chord, 4),
            "encoded_a": f"theta_a = {th_a:.4f} rad (cos={cos_a:.4f}, sin={sin_a:.4f})",
            "encoded_b": f"theta_b = {th_b:.4f} rad (cos={cos_b:.4f}, sin={sin_b:.4f})",
            "hadamard_sum_amplitude": round(float((cos_a + cos_b) / math.sqrt(2.0)), 4),
            "hadamard_diff_amplitude": round(float(math.sqrt(d_cos**2 + d_sin**2)), 4),
            "horiz_edge_prob": round(h_prob, 4),
            "vert_edge_prob": round(v_prob, 4),
            "fused_confidence": round(f_conf, 4),
            "is_edge": bool(f_conf >= thresh)
        }

    # -------------------------------------------------------------
    # 2. QPIE + QHED Simulation
    # -------------------------------------------------------------
    elif "QPIE" in algo:
        qubits = 6
        depth = 12
        display_name = "QPIE QHED"

        # L2 norm regularization
        eps = float(p.epsilon_floor or 1.0)
        l2_norm = float(np.sqrt(np.sum(img ** 2) + eps ** 2))
        amp_grid = img / l2_norm

        # Horizontal passes
        horiz_even = np.zeros((8, 8), dtype=np.float32)
        for r in range(8):
            for k in range(4):
                c0 = 2 * k
                c1 = 2 * k + 1
                diff = abs(img[r, c0] - img[r, c1]) / 255.0
                horiz_even[r, c0] = diff
                horiz_even[r, c1] = diff

        horiz_odd = np.zeros((8, 8), dtype=np.float32)
        for r in range(8):
            for k in range(4):
                c0 = 2 * k + 1
                c1 = (2 * k + 2) % 8
                diff = abs(img[r, c0] - img[r, c1]) / 255.0
                horiz_odd[r, c0] = diff

        horiz_combined = np.maximum(horiz_even, horiz_odd)

        vert_combined = np.zeros((8, 8), dtype=np.float32)
        for c in range(8):
            for r in range(8):
                r_n = (r + 1) % 8
                diff = abs(img[r, c] - img[r_n, c]) / 255.0
                vert_combined[r, c] = diff

        fused = np.clip(np.sqrt(horiz_combined ** 2 + vert_combined ** 2), 0.0, 1.0)
        binary_map = (fused >= thresh).astype(int)

        val_a = float(img[r_insp, c_insp])
        val_b = float(img[r_insp, c_next])
        a_a = float(amp_grid[r_insp, c_insp])
        a_b = float(amp_grid[r_insp, c_next])
        diff_amp = abs(a_a - a_b) / math.sqrt(2.0)

        h_prob = float(horiz_combined[r_insp, c_insp])
        v_prob = float(vert_combined[r_insp, c_insp])
        f_conf = float(fused[r_insp, c_insp])
        raw_born_prob = float(((val_a - val_b) ** 2) / (2.0 * max(1e-12, l2_norm ** 2)))
        shot_sigma = float(l2_norm / (255.0 * math.sqrt(max(1, p.shots or 4096))))
        flat_amp = amp_grid.ravel()
        init_probs = (flat_amp ** 2).round(6).tolist()
        even_h_probs = []
        odd_h_probs = []
        for k in range(32):
            a0, a1 = float(flat_amp[2 * k]), float(flat_amp[2 * k + 1])
            even_h_probs.extend([round(((a0 + a1) ** 2) / 2.0, 6), round(((a0 - a1) ** 2) / 2.0, 6)])
            b0, b1 = float(flat_amp[(2 * k + 1) % 64]), float(flat_amp[(2 * k + 2) % 64])
            odd_h_probs.extend([round(((b0 + b1) ** 2) / 2.0, 6), round(((b0 - b1) ** 2) / 2.0, 6)])

        trace = {
            "coord_a": [r_insp, c_insp],
            "coord_b": [r_insp, c_next],
            "intensity_a": int(val_a),
            "intensity_b": int(val_b),
            "gamma_norm": round(l2_norm, 3),
            "alpha_a": round(a_a, 5),
            "alpha_b": round(a_b, 5),
            "raw_born_prob": round(raw_born_prob, 6),
            "shot_amplification_sigma": round(shot_sigma, 5),
            "statevector_spectrum": {
                "initial_probs": init_probs,
                "even_post_h_probs": even_h_probs,
                "odd_post_h_probs": odd_h_probs,
            },
            "encoded_a": f"alpha_a = {a_a:.5f} (||I||_2 = {l2_norm:.1f})",
            "encoded_b": f"alpha_b = {a_b:.5f} (||I||_2 = {l2_norm:.1f})",
            "hadamard_sum_amplitude": round(float((a_a + a_b) / math.sqrt(2.0)), 5),
            "hadamard_diff_amplitude": round(float(diff_amp), 5),
            "horiz_edge_prob": round(h_prob, 4),
            "vert_edge_prob": round(v_prob, 4),
            "fused_confidence": round(f_conf, 4),
            "is_edge": bool(f_conf >= thresh)
        }

    # -------------------------------------------------------------
    # 3. NEQR + Quantum Gradient Simulation
    # -------------------------------------------------------------
    else:
        q_bits = int(p.bit_depth or 8)
        qubits = 6 + q_bits
        depth = 36
        display_name = "NEQR Gradient"

        # Truncate to bit depth
        shift = 8 - q_bits
        quant_img = ((img.astype(int) >> shift) << shift).astype(np.float32)

        horiz_even = np.zeros((8, 8), dtype=np.float32)
        for r in range(8):
            for k in range(4):
                c0 = 2 * k
                c1 = 2 * k + 1
                diff = abs(quant_img[r, c0] - quant_img[r, c1]) / 255.0
                horiz_even[r, c0] = diff
                horiz_even[r, c1] = diff

        horiz_odd = np.zeros((8, 8), dtype=np.float32)
        for r in range(8):
            for k in range(4):
                c0 = 2 * k + 1
                c1 = (2 * k + 2) % 8
                diff = abs(quant_img[r, c0] - quant_img[r, c1]) / 255.0
                horiz_odd[r, c0] = diff

        horiz_combined = np.maximum(horiz_even, horiz_odd)

        vert_combined = np.zeros((8, 8), dtype=np.float32)
        for c in range(8):
            for r in range(8):
                r_n = (r + 1) % 8
                diff = abs(quant_img[r, c] - quant_img[r_n, c]) / 255.0
                vert_combined[r, c] = diff

        # Metric norm: L1, L2, or Linf
        norm_type = p.norm_type.upper()
        if "L1" in norm_type:
            fused = np.clip(horiz_combined + vert_combined, 0.0, 1.0)
        elif "LINF" in norm_type or "MAX" in norm_type:
            fused = np.maximum(horiz_combined, vert_combined)
        else:
            fused = np.clip(np.sqrt(horiz_combined ** 2 + vert_combined ** 2), 0.0, 1.0)

        binary_map = (fused >= thresh).astype(int)

        val_a = int(quant_img[r_insp, c_insp])
        val_b = int(quant_img[r_insp, c_next])
        bin_a = f"{val_a:08b}"
        bin_b = f"{val_b:08b}"
        diff_int = abs(val_a - val_b)

        h_prob = float(horiz_combined[r_insp, c_insp])
        v_prob = float(vert_combined[r_insp, c_insp])
        f_conf = float(fused[r_insp, c_insp])

        val_a_q = int(img[r_insp, c_insp]) >> shift
        val_b_q = int(img[r_insp, c_next]) >> shift
        qfs_trace = _qfs_pair_trace(val_a_q, val_b_q, q_bits)
        bitplanes = [((np.clip(np.round(img), 0, 255).astype(np.uint8) >> k) & 1).tolist() for k in range(7, -1, -1)]

        trace = {
            "coord_a": [r_insp, c_insp],
            "coord_b": [r_insp, c_next],
            "intensity_a": val_a,
            "intensity_b": val_b,
            "storage_qubits": qubits,
            "active_qfs_qubits": 6 + 2 * q_bits + 2,
            "qfs_waterfall": qfs_trace["rows"],
            "sign_borrow": qfs_trace["sign_borrow"],
            "bitplanes": bitplanes,
            "encoded_a": f"|{bin_a}>_c (Basis State integer {val_a})",
            "encoded_b": f"|{bin_b}>_c (Basis State integer {val_b})",
            "hadamard_sum_amplitude": round(float((val_a + val_b) / 255.0), 4),
            "hadamard_diff_amplitude": round(float(diff_int / 255.0), 4),
            "horiz_edge_prob": round(h_prob, 4),
            "vert_edge_prob": round(v_prob, 4),
            "fused_confidence": round(f_conf, 4),
            "is_edge": bool(f_conf >= thresh)
        }

    exec_ms = round((time.perf_counter() - t0) * 1000.0, 2)

    return {
        "status": "success",
        "algorithm": algo,
        "algorithm_display": display_name,
        "qubits_used": qubits,
        "circuit_depth": depth,
        "execution_time_ms": exec_ms,
        "horizontal_even_map": horiz_even.round(4).tolist(),
        "horizontal_odd_map": horiz_odd.round(4).tolist(),
        "horizontal_combined_map": horiz_combined.round(4).tolist(),
        "vertical_combined_map": vert_combined.round(4).tolist(),
        "fused_confidence_map": fused.round(4).tolist(),
        "binary_edge_map": binary_map.tolist(),
        "inspected_pair_trace": trace
    }

