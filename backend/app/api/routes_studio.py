"""
Live Quantum Studio Workspace Router
Endpoints for:
- /api/studio/inspect-patch: Gate-by-gate patch simulation (FRQI, QPIE, NEQR)
- /api/studio/instant-sweep: Progressive/instant halo-padded sweep with TileTelemetryGrid
- /api/studio/analyze: Two-Tier macro sweep + compact TileTelemetryGrid (< 250 KB)
- /api/studio/stage-layers: Tier-2 lazy on-demand Canny/Sobel/Robinson/HaloAB/NoiseSweeps
"""
from __future__ import annotations
from typing import Literal, Optional
import time
import numpy as np
import cv2
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.app.core.dependencies import (
    acquire_user_compute_slot,
    require_researcher,
    verify_hmac_csrf,
)

from backend.app.schemas.studio import QuantumLabConfig
from backend.app.quantum.halo_tiler import HaloTiler
from backend.app.quantum.frqi_qhed import execute_frqi_qhed_patch
from backend.app.quantum.qpie_qhed import execute_qpie_qhed_patch
from backend.app.quantum.neqr_gradient import execute_neqr_gradient_patch
from backend.app.core.algorithms import (
    apply_gaussian_regolith_noise,
    extract_tiled_patches_with_telemetry,
    run_frqi_qhed,
    run_qpie_qhed,
    run_neqr_gradient,
    extract_sobel_stages,
    extract_canny_stages,
    extract_robinson_stages,
)
from backend.app.core.benchmark_runner import run_six_method_benchmark, run_noise_stress_sweep
from backend.app.core.metrics import compute_intrinsic_quality_metrics
from backend.app.utils.image_io import to_base64_png, load_image_from_source

router = APIRouter(prefix="/api/studio", tags=["studio"])
_TILER = HaloTiler(core_size=6, halo_pad=1, variance_threshold=1.5e-4)


class PatchInspectRequest(BaseModel):
    preset_id: Optional[str] = Field(default="synthetic_rim_512", max_length=64)
    image_base64: Optional[str] = Field(default=None, max_length=7_500_000)
    tile_y: int = Field(default=15, ge=0, le=255)
    tile_x: int = Field(default=15, ge=0, le=255)
    algorithm: str = Field(default="FRQI-QHED", max_length=48)
    step_index: int = Field(default=0, ge=0, le=12)
    resolution: int = Field(default=256, ge=16, le=512)
    config: Optional[QuantumLabConfig] = None


class SweepRequest(BaseModel):
    preset_id: Optional[str] = Field(default="synthetic_rim_512", max_length=64)
    image_base64: Optional[str] = Field(default=None, max_length=7_500_000)
    algorithm: str = Field(default="FRQI-QHED", max_length=48)
    resolution: int = Field(default=256, ge=16, le=512)
    halo_protection: bool = True
    cull_flat_patches: bool = True
    config: Optional[QuantumLabConfig] = None


class StudioAnalyzeRequest(BaseModel):
    preset_id: Optional[str] = Field(default="synthetic_rim_512", max_length=64)
    image_base64: Optional[str] = Field(default=None, max_length=7_500_000)
    algorithm: str = Field(default="FRQI-QHED", max_length=48)
    resolution: int = Field(default=128, ge=16, le=512)
    config: Optional[QuantumLabConfig] = None


class StageLayersRequest(BaseModel):
    preset_id: Optional[str] = Field(default="synthetic_rim_512", max_length=64)
    image_base64: Optional[str] = Field(default=None, max_length=7_500_000)
    resolution: int = Field(default=128, ge=16, le=512)
    target: Literal["canny", "sobel", "robinson", "halo_ab", "noise_sweep"] = "canny"
    config: Optional[QuantumLabConfig] = None


_CANONICAL_SHOWCASE_PRESETS = {
    "synthetic_rim_512",
    "concentric_craters",
    "lunar_geotiff_512",
    "apollo_crater_32",
    "diagonal_ray",
}


@router.get("/precomputed/{preset_id}")
def get_precomputed_showcase(preset_id: str):
    """Tier-0 anonymous read-only canonical preset preview with zero custom simulation cost."""
    pid = (preset_id or "").strip().lower()
    if pid not in _CANONICAL_SHOWCASE_PRESETS:
        raise HTTPException(status_code=404, detail="Canonical preset not found.")
    img, title = load_image_from_source(preset_id=pid, image_base64=None, target_size=64)
    return {
        "status": "success",
        "preset_id": pid,
        "title": title,
        "resolution": "64x64",
        "preview_base64": to_base64_png(img),
    }


@router.post(
    "/inspect-patch",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def inspect_patch(req: PatchInspectRequest):
    """
    Extracts an 8x8 patch at (tile_y, tile_x) and executes gate-by-gate quantum simulation.
    Returns 6-step wire states, Bloch/QPIE/QFS telemetry, and pixel arrays.
    """
    try:
        img, _ = load_image_from_source(req.preset_id, req.image_base64, target_size=req.resolution)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    cfg = req.config or QuantumLabConfig()
    if cfg.noise_gaussian_sigma > 0:
        img = apply_gaussian_regolith_noise(img, cfg.noise_gaussian_sigma, seed=42)

    padded, num_ty, num_tx = _TILER.pad_image(img)
    ty = max(0, min(req.tile_y, num_ty - 1))
    tx = max(0, min(req.tile_x, num_tx - 1))
    patch_8x8 = _TILER.extract_patch(padded, ty, tx)
    is_flat = _TILER.is_flat_patch(patch_8x8)

    algo = req.algorithm.upper()
    t0 = time.perf_counter()

    if "QPIE" in algo:
        res = execute_qpie_qhed_patch(
            patch_8x8,
            full_qiskit_telemetry=True,
            shots=cfg.shots,
            cull_flat=False,
        )
        algo_name = "QPIE-QHED"
        qubits = 6
    elif "NEQR" in algo:
        res = execute_neqr_gradient_patch(
            patch_8x8,
            full_qiskit_telemetry=True,
            bit_depth=cfg.neqr_bit_depth,
            bitflip_prob=cfg.neqr_bitflip_prob,
            cull_flat=False,
        )
        algo_name = "NEQR-Gradient"
        qubits = 6 + cfg.neqr_bit_depth
    else:
        res = execute_frqi_qhed_patch(
            patch_8x8,
            full_qiskit_telemetry=True,
            shots=cfg.shots,
            shot_mode=cfg.shot_mode,
            cull_flat=False,
        )
        algo_name = "FRQI-QHED"
        qubits = 7

    latency_ms = (time.perf_counter() - t0) * 1000.0
    edge_8x8 = res.get("edge_8x8", np.zeros((8, 8), dtype=np.float32))
    patch_u8 = patch_8x8.astype(np.uint8)
    edge_u8 = (np.clip(edge_8x8, 0.0, 1.0) * 255.0).astype(np.uint8)

    return {
        "status": "success",
        "algorithm": algo_name,
        "qubits": qubits,
        "tile_y": ty,
        "tile_x": tx,
        "total_tiles_y": num_ty,
        "total_tiles_x": num_tx,
        "is_flat": is_flat,
        "culled": res.get("culled", False),
        "latency_ms": round(latency_ms, 2),
        "patch_pixels": patch_u8.tolist(),
        "edge_pixels": edge_u8.tolist(),
        "patch_base64": to_base64_png(patch_u8),
        "edge_base64": to_base64_png(edge_u8),
        "gate_telemetry": res.get("gate_telemetry"),
        "step_index": req.step_index,
    }


@router.post(
    "/instant-sweep",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def instant_sweep(req: SweepRequest):
    """
    Executes vectorized halo-padded quantum edge sweep across the entire image,
    returning full edge output AND compact TileTelemetryGrid for real per-tile HUD tracking.
    """
    try:
        img, _ = load_image_from_source(req.preset_id, req.image_base64, target_size=req.resolution)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    cfg = req.config or QuantumLabConfig(
        halo_padding_enabled=req.halo_protection,
        variance_cull_threshold=1.5e-4 if req.cull_flat_patches else 0.0,
    )
    if cfg.noise_gaussian_sigma > 0:
        img = apply_gaussian_regolith_noise(img, cfg.noise_gaussian_sigma, seed=42)

    var_thresh = cfg.variance_cull_threshold if req.cull_flat_patches else 0.0
    algo = req.algorithm.upper()
    shots = None if (cfg.shots is None or cfg.shots >= 99999) else int(cfg.shots)

    if "QPIE" in algo:
        res = run_qpie_qhed(
            img,
            shots=shots,
            shot_mode=cfg.shot_mode,
            halo_padding_enabled=req.halo_protection,
            variance_cull_threshold=var_thresh,
            threshold_mode=cfg.threshold_mode,
            post_nms_thinning=cfg.post_nms_thinning,
        )
        grid = extract_tiled_patches_with_telemetry(img, req.halo_protection, var_thresh)["telemetry_grid"]
    elif "NEQR" in algo:
        res = run_neqr_gradient(
            img,
            shots=shots,
            intensity_bits=cfg.neqr_bit_depth,
            bitflip_prob=cfg.neqr_bitflip_prob,
            halo_padding_enabled=req.halo_protection,
            variance_cull_threshold=var_thresh,
            threshold_mode=cfg.threshold_mode,
            post_nms_thinning=cfg.post_nms_thinning,
        )
        grid = extract_tiled_patches_with_telemetry(img, req.halo_protection, var_thresh)["telemetry_grid"]
    else:
        res = run_frqi_qhed(
            img,
            shots=shots,
            shot_mode=cfg.shot_mode,
            halo_padding_enabled=req.halo_protection,
            variance_cull_threshold=var_thresh,
            threshold_mode=cfg.threshold_mode,
            post_nms_thinning=cfg.post_nms_thinning,
        )
        grid = res["tile_telemetry_grid"]

    edge_canvas = res["confidence_map"]
    binary = res["binary"]
    edge_u8 = (np.clip(edge_canvas, 0.0, 1.0) * 255.0).astype(np.uint8)
    metrics = compute_intrinsic_quality_metrics(binary, edge_canvas)

    return {
        "status": "completed",
        "algorithm": req.algorithm,
        "resolution": f"{img.shape[1]}x{img.shape[0]}",
        "total_patches": grid["total_tiles"],
        "culled_patches": grid["culled_tiles"],
        "executed_patches": grid["executed_tiles"],
        "latency_ms": res["latency_ms"],
        "metrics": metrics,
        "tile_telemetry_grid": grid,
        "original_base64": to_base64_png(img),
        "edge_base64": to_base64_png(edge_u8),
        "binary_base64": to_base64_png(binary * 255),
    }


@router.post(
    "/analyze",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def analyze_studio_tier1(req: StudioAnalyzeRequest):
    """
    Tier-1 Macro Sweep Payload (< 250 KB):
    Executes all 6 methods with QuantumLabConfig and returns compact TileTelemetryGrid,
    consensus overlay, NISQ scaling profile, and quantitative scorecard.
    """
    try:
        img, title = load_image_from_source(req.preset_id, req.image_base64, target_size=req.resolution)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return run_six_method_benchmark(
        image=img,
        config=req.config,
        preset_id=req.preset_id if not req.image_base64 else None,
        image_title=title,
        include_stability=False,
    )


@router.post(
    "/stage-layers",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def fetch_stage_layers_tier2(req: StageLayersRequest):
    """
    Tier-2 Lazy On-Demand Dissector Endpoint:
    Generates rich intermediate visualizations (Canny 5-stage masks, Sobel Gx/Gy/Orientation,
    Robinson 8-compass polar rose energies, Halo ON vs OFF artifact map, or Noise Stress curve)
    only when specifically inspected by the user.
    """
    try:
        img, _ = load_image_from_source(req.preset_id, req.image_base64, target_size=req.resolution)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    cfg = req.config or QuantumLabConfig()
    eval_img = apply_gaussian_regolith_noise(img, sigma=cfg.noise_gaussian_sigma, seed=42)

    if req.target == "canny":
        stages = extract_canny_stages(eval_img, sigma=cfg.canny_sigma, low_th=cfg.canny_low, high_th=cfg.canny_high)
        return {
            "status": "success",
            "target": "canny",
            "counts": stages["counts"],
            "stages": {
                "stage1_smoothed": to_base64_png(stages["stage1_smoothed"]),
                "stage2_gradient": to_base64_png(stages["stage2_gradient"]),
                "stage2_direction_rgb": to_base64_png(stages["stage2_direction_rgb"]),
                "stage3_nms": to_base64_png(stages["stage3_nms"]),
                "stage4_double_thresh_rgb": to_base64_png(stages["stage4_double_thresh_rgb"]),
                "stage5_hysteresis": to_base64_png(stages["stage5_hysteresis"]),
            },
        }

    if req.target == "sobel":
        stages = extract_sobel_stages(eval_img)
        return {
            "status": "success",
            "target": "sobel",
            "stages": {k: to_base64_png(v) for k, v in stages.items()},
        }

    if req.target == "robinson":
        stages = extract_robinson_stages(eval_img)
        return {
            "status": "success",
            "target": "robinson",
            "sector_names": stages["sector_names"],
            "sector_energies": stages["sector_energies"],
            "sector_maps": {k: to_base64_png(v) for k, v in stages["sector_maps"].items()},
            "azimuth_rgb": to_base64_png(stages["azimuth_rgb"]),
        }

    if req.target == "halo_ab":
        on_res = run_frqi_qhed(eval_img, shots=None, halo_padding_enabled=True, variance_cull_threshold=0.0)
        off_res = run_frqi_qhed(eval_img, shots=None, halo_padding_enabled=False, variance_cull_threshold=0.0)
        diff_u8 = (np.clip(np.abs(off_res["confidence_map"] - on_res["confidence_map"]) * 4.0, 0.0, 1.0) * 255.0).astype(np.uint8)
        seam_heat = cv2.applyColorMap(diff_u8, cv2.COLORMAP_INFERNO)
        seam_heat_rgb = cv2.cvtColor(seam_heat, cv2.COLOR_BGR2RGB)
        return {
            "status": "success",
            "target": "halo_ab",
            "halo_on_base64": to_base64_png((on_res["confidence_map"] * 255.0).astype(np.uint8)),
            "halo_off_base64": to_base64_png((off_res["confidence_map"] * 255.0).astype(np.uint8)),
            "seam_diff_base64": to_base64_png(seam_heat_rgb),
            "max_seam_error": round(float(np.max(np.abs(off_res["confidence_map"] - on_res["confidence_map"]))), 4),
        }

    # noise_sweep
    return {
        "status": "success",
        "target": "noise_sweep",
        **run_noise_stress_sweep(img, cfg, preset_id=req.preset_id if not req.image_base64 else None),
    }
