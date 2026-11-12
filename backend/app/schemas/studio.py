"""
Pydantic v2 Schemas for Live Quantum Edge Detection Studio,
Multi-Method Scientific Benchmarking, and Two-Tier Telemetry.
"""
from __future__ import annotations
from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class QuantumLabConfig(BaseModel):
    shots: Optional[int] = Field(
        default=None,
        ge=64,
        le=100_000,
        description="None = exact statevector; integer (64..8192) = finite-shot sampling",
    )
    shot_mode: Literal["multinomial_patch", "binomial_local"] = "multinomial_patch"
    neqr_bit_depth: int = Field(default=8, ge=2, le=8)
    neqr_bitflip_prob: float = Field(default=0.0, ge=0.0, le=0.25)
    halo_padding_enabled: bool = True
    variance_cull_threshold: float = Field(
        default=1.5e-4,
        ge=0.0,
        description="Values < 0.05 treated as normalized variance; values >= 0.05 treated as gray-level std^2/255^2 or std cutoff",
    )
    post_nms_thinning: bool = False
    threshold_mode: Literal["otsu", "rosin_triangle", "manual"] = "otsu"
    manual_threshold: float = Field(default=0.25, ge=0.01, le=0.99)
    noise_gaussian_sigma: float = Field(default=0.0, ge=0.0, le=35.0)
    canny_sigma: float = Field(default=1.4, ge=0.5, le=4.0)
    canny_low: float = Field(default=50.0, ge=5.0, le=200.0)
    canny_high: float = Field(default=150.0, ge=15.0, le=250.0)


class TileTelemetryGrid(BaseModel):
    grid_rows: int
    grid_cols: int
    core_stride: int = 6
    patch_size: int = 8
    total_tiles: int
    culled_tiles: int
    executed_tiles: int
    compute_saved_pct: float
    culled_mask: List[int]
    tile_means: List[float]
    tile_stds: List[float]
    tile_gamma_p: List[float]
    tile_max_delta_i: List[int]


class MethodMetricBundle(BaseModel):
    pfom_exact: Optional[float] = None
    f1_within_1px: Optional[float] = None
    hausdorff_px: Optional[float] = None
    thinness_ratio: float
    cnr: float
    otsu_threshold: float
    applied_threshold: float
    execution_ms: float
    active_qubits: int
    storage_qubits: int
    cnot_depth_per_tile: int
    histogram_bins: List[float]
    coverage_pct: float
    snr: float
    entropy: float
    pratt_fom: float
    ssim: float
    psnr: float
    thinness_pct: float
    stability_sigma: Optional[float] = None

