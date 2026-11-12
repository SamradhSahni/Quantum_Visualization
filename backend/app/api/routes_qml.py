"""
FastAPI Routes for Suite 1 & Pillar 1: Interactive QML & Multi-Modal Vision Lab
Executes a synchronized 5-stage QML pipeline on 16x16 multi-spectral lunar imagery:
  1. 2D Quantum Haar Wavelet Equalizer (QWT) with speckle suppression
  2. 9-Qubit NCQI Optical + Diviner Thermal + Mini-RF SAR Fusion & QCICS Ice Trap Map
  3. 4-Qubit (16-amplitude) QCNN Classification + 3D Hilbert Projection + Fidelity Gram Matrix
  4. Barren Plateau Loss Landscape, Optimizer Trajectory & QFIM Spectrum Diagnostics
  5. Grover Subspace Amplitude Oscilloscope & Spatial Edge Amplifier
"""
import math
from typing import Any, Dict, List, Optional
import numpy as np
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from backend.app.core.dependencies import (
    acquire_user_compute_slot,
    require_researcher,
    verify_hmac_csrf,
)

from backend.app.domain.qml.barren_plateau import compute_loss_surface
from backend.app.domain.qml.grover_compass import analyze_grover_subspace, apply_grover_amplification
from backend.app.domain.qml.ncqi_fusion import fuse_ncqi_multispectral
from backend.app.domain.qml.qcnn_hilbert import classify_patch_qcnn
from backend.app.domain.qml.wavelet_equalizer import apply_wavelet_denoising, equalize_wavelet_subbands

router = APIRouter(prefix="/api/v1/qml", tags=["qml"])


class QmlProcessRequest(BaseModel):
    patch: List[List[float]] = Field(default_factory=list)
    denoise_strength: float = Field(default=0.65, ge=0.0, le=1.0)
    grover_iterations: int = Field(default=1, ge=0, le=4)
    enable_qcnn: bool = True
    enable_multispectral: bool = False
    spectral_weights: Optional[Dict[str, float]] = None


class QmlPipelineContractRequest(BaseModel):
    preset_id: str = "shackleton_south_pole_multispectral"
    wavelet_attenuation: Optional[Dict[str, float]] = Field(
        default_factory=lambda: {"lh_gain": 1.0, "hl_gain": 1.0, "hh_cut": 0.85}
    )
    speckle_noise: float = Field(default=0.08, ge=0.0, le=0.40)
    spectral_weights: Optional[Dict[str, float]] = Field(
        default_factory=lambda: {"optical": 0.20, "thermal": 0.35, "sar_cpr": 0.45}
    )
    qcnn_ansatz: str = "STRONGLY_ENTANGLING_RING"
    cost_function_type: str = "LOCAL_PAULI_Z"
    num_qubits: int = Field(default=6, ge=2, le=12)
    circuit_depth: int = Field(default=4, ge=1, le=8)
    grover_iterations: int = Field(default=1, ge=0, le=6)


def _build_mission_multimodal_tile(
    preset_id: str,
    speckle_noise: float = 0.08,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, str]:
    """Synthesizes co-registered 16x16 Optical, Thermal IR, and SAR CPR mission bands."""
    pid = (preset_id or "shackleton").strip().lower()
    size = 16
    y, x = np.mgrid[:size, :size].astype(np.float64)

    if "rille" in pid or "aristarchus" in pid:
        # Sinuous volcanic lava trench winding diagonally across dark mare plains
        center_x = 7.5 + 2.2 * np.sin(y * 0.45)
        dist = np.abs(x - center_x)
        in_trench = dist < 1.85
        on_wall = (dist >= 1.85) & (dist < 3.1)
        opt = np.where(in_trench, 40.0, np.where(on_wall, 198.0, 56.0))
        therm = np.where(in_trench, 205.0, np.where(on_wall, 168.0, 74.0))
        sar = np.where(in_trench, 175.0, np.where(on_wall, 138.0, 52.0))
        canon = "rille"
    elif "apollo" in pid:
        # Sunlit highlands impact crater rim with radial ejecta rays & flat mare apron
        r = np.sqrt((x - 7.5) ** 2 + (y - 7.5) ** 2)
        ang = np.arctan2(y - 7.5, x - 7.5)
        rim = np.exp(-((r - 4.3) / 1.1) ** 2)
        rays = np.where(r > 4.3, np.exp(-(r - 4.3) / 4.0) * np.maximum(0.0, np.cos(4.0 * ang)), 0.0)
        opt = np.clip(54.0 + 178.0 * rim + 115.0 * rays, 28.0, 245.0)
        therm = np.clip(opt * 0.72 + 10.0, 35.0, 225.0)
        sar = np.clip(48.0 + 135.0 * rim + 42.0 * rays, 35.0, 205.0)
        canon = "apollo16"
    else:
        # Shackleton South Pole PSR: sunlit northern rim ridge vs dark cryogenic PSR ice basin
        r_psr = np.sqrt((x - 7.2) ** 2 + (y - 9.8) ** 2)
        in_psr = r_psr < 4.4
        rim_ridge = np.exp(-((y - 2.6) / 1.5) ** 2)
        opt = np.where(in_psr, 24.0, np.clip(64.0 + 168.0 * rim_ridge, 35.0, 240.0))
        therm = np.where(in_psr, 16.0, np.clip(78.0 + 148.0 * rim_ridge, 45.0, 232.0))
        sar = np.where(in_psr, 228.0 - 8.0 * r_psr, np.clip(52.0 + 55.0 * rim_ridge, 35.0, 140.0))
        canon = "shackleton"

    if speckle_noise > 0.0:
        # Deterministic checkerboard + high-frequency HH speckle artifact pattern
        checker = (((x.astype(int) + y.astype(int)) % 2) * 2.0 - 1.0)
        hf_wave = np.sin(x * 2.3 + y * 1.7)
        noise_amp = speckle_noise * 140.0
        opt = np.clip(opt + (0.65 * checker + 0.35 * hf_wave) * noise_amp, 5.0, 250.0)

    return opt.astype(np.float64), therm.astype(np.float64), sar.astype(np.float64), canon


@router.post(
    "/process",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def process_qml_pipeline(req: QmlProcessRequest) -> Dict[str, Any]:
    """
    Executes combined QWT Denoising -> Grover Amplification -> QCNN Geological Classification.
    """
    if req.patch and len(req.patch) >= 4 and len(req.patch[0]) >= 4:
        patch_arr = np.array(req.patch, dtype=np.float64)
    else:
        patch_arr, _, _, _ = _build_mission_multimodal_tile("apollo16", speckle_noise=0.06)

    denoised_patch, qwt_meta = apply_wavelet_denoising(patch_arr, strength=req.denoise_strength)
    qcnn_res = classify_patch_qcnn(denoised_patch) if req.enable_qcnn else {}

    dx = np.abs(np.diff(denoised_patch, axis=1, append=denoised_patch[:, :1]))
    dy = np.abs(np.diff(denoised_patch, axis=0, append=denoised_patch[:1, :]))
    grad = np.sqrt(dx ** 2 + dy ** 2) / 255.0

    amplified_grad, grover_meta = apply_grover_amplification(grad, r_iterations=req.grover_iterations)

    return {
        "status": "success",
        "wavelet_denoising": qwt_meta,
        "qcnn_classification": qcnn_res,
        "grover_amplification": grover_meta,
        "processed_patch": denoised_patch.tolist(),
        "amplified_edge_map": amplified_grad.tolist(),
    }


@router.post(
    "/pipeline",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def full_qml_pipeline(req: QmlPipelineContractRequest) -> Dict[str, Any]:
    """
    Unified 5-stage QML pipeline coupling Wavelet Equalizer, NCQI Multi-Spectral Fusion,
    4-Qubit QCNN 3D Hilbert Classifier, Barren Plateau QFIM Diagnostics, and Grover Oscilloscope.
    """
    optical_noisy, thermal_b, sar_b, canon_preset = _build_mission_multimodal_tile(
        req.preset_id, speckle_noise=req.speckle_noise
    )

    # 1. 2D Quantum Haar Wavelet Equalizer
    w_att = req.wavelet_attenuation or {"lh_gain": 1.0, "hl_gain": 1.0, "hh_cut": 0.85}
    denoised_patch, qwt_telemetry = equalize_wavelet_subbands(
        optical_noisy,
        lh_gain=w_att.get("lh_gain", 1.0),
        hl_gain=w_att.get("hl_gain", 1.0),
        hh_cut=w_att.get("hh_cut", 0.85),
    )

    # 2. 9-Qubit NCQI Multi-Spectral Fusion
    s_weights = req.spectral_weights or {"optical": 0.20, "thermal": 0.35, "sar_cpr": 0.45}
    fused_edge, ncqi_meta = fuse_ncqi_multispectral(
        denoised_patch,
        thermal_b,
        sar_b,
        w_opt=s_weights.get("optical", 0.20),
        w_therm=s_weights.get("thermal", 0.35),
        w_sar=s_weights.get("sar_cpr", 0.45),
    )

    # 3. 4-Qubit QCNN Statevector Classification & 3D Hilbert Embedding
    qcnn_res = classify_patch_qcnn(
        denoised_patch,
        ansatz=req.qcnn_ansatz,
        thermal_patch=thermal_b,
        sar_patch=sar_b,
    )

    # 4. Barren Plateau & QFIM Diagnostics
    bp_diag = compute_loss_surface(
        cost_type=req.cost_function_type,
        grid_res=21,
        num_qubits=req.num_qubits,
        circuit_depth=req.circuit_depth,
    )

    # 5. Grover Subspace Amplitude Oscilloscope
    _, grover_meta = analyze_grover_subspace(fused_edge, r_iterations=req.grover_iterations)

    return {
        "status": "success",
        "preset_id": canon_preset,
        "tile_resolution": 16,
        "wavelet_telemetry": qwt_telemetry,
        "multi_spectral_fusion": ncqi_meta,
        "qcnn_classification": qcnn_res,
        "barren_plateau_diagnostics": bp_diag,
        "grover_oscilloscope": grover_meta,
    }
