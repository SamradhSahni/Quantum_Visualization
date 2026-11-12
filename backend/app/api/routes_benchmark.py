"""
Benchmark & Multi-Method Comparison Router
Provides 6-algorithm comparison: FRQI-QHED, QPIE-QHED, NEQR-Gradient, Sobel, Canny, Robinson.
Supports Exact Ground-Truth PFOM / Hausdorff / 1-px F1 (for synthetic targets),
Reference-Free Skeleton Thinness & Perturbation Stability, NISQ resource profiles,
and QuantumLabConfig parameter overrides.
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.app.core.dependencies import (
    acquire_user_compute_slot,
    require_researcher,
    verify_hmac_csrf,
)
from backend.app.schemas.studio import QuantumLabConfig
from backend.app.utils.image_io import load_image_from_source
from backend.app.core.benchmark_runner import run_six_method_benchmark, run_noise_stress_sweep
from backend.app.core.benchmark_catalog import load_curated_research_suites

router = APIRouter(prefix="/api/benchmark", tags=["benchmark"])


class BenchmarkCompareRequest(BaseModel):
    preset_id: Optional[str] = Field(default="synthetic_rim_512", max_length=64)
    image_base64: Optional[str] = Field(default=None, max_length=7_500_000)
    resolution: int = Field(default=128, ge=16, le=512)
    config: Optional[QuantumLabConfig] = None
    include_stability: bool = False


class NoiseCurveRequest(BaseModel):
    preset_id: Optional[str] = Field(default="synthetic_rim_512", max_length=64)
    image_base64: Optional[str] = Field(default=None, max_length=7_500_000)
    resolution: int = Field(default=96, ge=16, le=256)
    config: Optional[QuantumLabConfig] = None


@router.post(
    "/compare",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def compare_all(req: BenchmarkCompareRequest):
    """
    Executes all 6 edge detection methods simultaneously and returns synchronized image overlays,
    Tri-Color Consensus map, quantitative scorecards, NISQ profiles, and diagnostic verdict.
    """
    try:
        img, title = load_image_from_source(
            preset_id=req.preset_id,
            image_base64=req.image_base64,
            target_size=req.resolution,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return run_six_method_benchmark(
        image=img,
        config=req.config,
        preset_id=req.preset_id if not req.image_base64 else None,
        image_title=title,
        include_stability=req.include_stability,
    )


@router.post(
    "/noise-curve",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def noise_degradation_curve(req: NoiseCurveRequest):
    """Computes sigma=0..25 noise stress-test degradation curves for all 6 methods."""
    try:
        img, _ = load_image_from_source(
            preset_id=req.preset_id,
            image_base64=req.image_base64,
            target_size=min(96, req.resolution),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    cfg = req.config or QuantumLabConfig()
    return {
        "status": "success",
        **run_noise_stress_sweep(img, cfg, preset_id=req.preset_id if not req.image_base64 else None),
    }


@router.get("/research-suites")
def get_curated_research_suites():
    """Returns curated Exp 1-10 CSV tables, NASA SomBench metrics, and Qiskit Aer study results."""
    return load_curated_research_suites()
