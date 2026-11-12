"""
FastAPI Routes for Suite 2 & Pillar 2: Planetary 3D GIS, Artemis Lander Hazard & Crater Chronology
Provides synchronized LOLA DEM meshes, Lommel-Seeliger + PSR ray-casting, real Quantum Edge Maps
(FRQI-QHED, QPIE-QHED, NEQR-Gradient), Artemis Touchdown LSI, Rover A* Detour Energy,
Fitzgibbon Crater Morphometry, and Temporal Phase Interferometry.
"""
from typing import Annotated, Any, Dict, List, Optional
import numpy as np
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from backend.app.core.dependencies import (
    acquire_user_compute_slot,
    require_researcher,
    verify_hmac_csrf,
)

from backend.app.domain.gis.crater_chronology import analyze_crater_chronology
from backend.app.domain.gis.dem_photometry import (
    SITE_PRESETS,
    compute_lommel_photometry_with_psr,
    generate_crater_dem_mesh,
    get_site_preset_config,
)
from backend.app.domain.gis.geojson_exporter import export_craters_to_geojson
from backend.app.domain.gis.interferometry import compute_temporal_change, synthesize_temporal_scenario
from backend.app.domain.gis.lander_safety import (
    LANDER_PROFILES,
    evaluate_landing_site,
    find_top_safe_landing_zones,
    resolve_lander_profile_key,
)
from backend.app.domain.gis.quantum_edges_bridge import compute_gis_quantum_edges
from backend.app.domain.gis.transect_rover import (
    ROVER_PROFILES,
    compute_safe_detour_transect,
    extract_transect_profile,
)

router = APIRouter(prefix="/api/v1/gis", tags=["gis"])


class MorphometryRequest(BaseModel):
    preset_id: str = Field(default="apollo_16", max_length=64)
    algorithm: str = Field(default="FRQI_QHED", max_length=48)
    gsd_m_px: float = Field(default=59.0, ge=0.5, le=500.0)
    center_lat: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    center_lon: Optional[float] = Field(default=None, ge=-180.0, le=180.0)


class TemporalChangeRequest(BaseModel):
    scenario: str = Field(default="new_impact", max_length=48)
    img_before: Optional[List[List[float]]] = Field(default=None, max_length=256)
    img_after: Optional[List[List[float]]] = Field(default=None, max_length=256)
    change_threshold: float = Field(default=0.15, ge=0.01, le=0.95)
    normalize_illumination: bool = False


class AnalyzeTerrainContractRequest(BaseModel):
    preset_id: str = "apollo_16"
    resolution: int = Field(default=96, ge=32, le=256)
    algorithm: str = "FRQI_QHED"
    edge_threshold: float = Field(default=0.22, ge=0.05, le=0.85)
    lander_profile: str = "ARTEMIS_HLS_STARSHIP_50M"
    pad_gsd_m_px: float = Field(default=5.0, ge=1.0, le=59.0)
    candidate_landing_coord: Optional[Dict[str, int]] = None
    transect_line: Optional[Dict[str, List[int]]] = None
    rover_profile: str = "VIPER"
    route_mode: str = "direct"
    sun_azimuth_deg: Optional[float] = None
    sun_elevation_deg: Optional[float] = None
    gsd_m_px: float = 59.0


def _clamp_coord_to_grid(pt: List[int], res: int) -> tuple[int, int]:
    """Scales legacy 512-space coordinates down to active resolution if oversized."""
    x, y = float(pt[0]), float(pt[1])
    if x >= res or y >= res:
        scale = res / 512.0
        x *= scale
        y *= scale
    return int(np.clip(round(x), 0, res - 1)), int(np.clip(round(y), 0, res - 1))


@router.get("/presets")
def get_gis_presets() -> Dict[str, Any]:
    """Returns canonical lunar region preset metadata."""
    return {
        "presets": list(SITE_PRESETS.values()),
        "landers": LANDER_PROFILES,
        "rovers": ROVER_PROFILES,
    }


@router.get("/dem/{preset_id}")
def get_dem_heightmap(
    preset_id: str,
    resolution: Annotated[int, Query(ge=32, le=256)] = 128,
) -> Dict[str, Any]:
    """
    Returns 3D elevation mesh heights, surface normals, and selenographic bounding metadata.
    """
    res = max(32, min(256, resolution))
    heights, normals, meta = generate_crater_dem_mesh(resolution=res, preset_id=preset_id)
    meta.pop("_albedo_norm", None)
    return {
        "preset_id": meta["preset_id"],
        "resolution": res,
        "metadata": meta,
        "heights_grid": np.round(heights, 1).tolist(),
        "normals_grid": np.round(normals, 4).tolist(),
    }


@router.post(
    "/morphometry",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def compute_crater_morphometry(req: MorphometryRequest) -> Dict[str, Any]:
    """
    Fits Fitzgibbon ellipses to quantum-extracted crater rims, calculates diameter (km),
    depth (m), Neukum model age (Ga), and generates an RFC 7946 GeoJSON collection.
    """
    cfg = get_site_preset_config(req.preset_id)
    res = 128
    heights, normals, meta = generate_crater_dem_mesh(resolution=res, preset_id=cfg["preset_id"], gsd_m_px=req.gsd_m_px)
    albedo_norm = meta.pop("_albedo_norm", None)

    _, _, _, orbital_u8, _ = compute_lommel_photometry_with_psr(
        heights,
        normals,
        gsd_m_px=req.gsd_m_px,
        sun_azimuth_deg=cfg["default_sun_az_deg"],
        sun_elevation_deg=cfg["default_sun_el_deg"],
        albedo_norm=albedo_norm,
    )
    quantum_edges, _, edge_stats = compute_gis_quantum_edges(orbital_u8, algorithm=req.algorithm, threshold=0.22)
    chronology = analyze_crater_chronology(
        quantum_edges,
        heights,
        gsd_m_px=req.gsd_m_px,
        preset_id=cfg["preset_id"],
        calibrated_n1_base=cfg["calibrated_n1"],
    )

    lat = req.center_lat if req.center_lat is not None else cfg["center_lat"]
    lon = req.center_lon if req.center_lon is not None else cfg["center_lon"]
    geojson_data = export_craters_to_geojson(
        chronology["craters"],
        center_lat=lat,
        center_lon=lon,
        gsd_m_px=req.gsd_m_px,
        resolution=res,
        algorithm_name=edge_stats["algorithm_display"],
    )

    craters = chronology["craters"]
    mean_diam = float(np.mean([c["diameter_km"] for c in craters])) if craters else 0.0

    return {
        "status": "success",
        "preset_id": cfg["preset_id"],
        "craters_detected": len(craters),
        "mean_diameter_km": round(mean_diam, 2),
        "neukum_model_age_ga": chronology["neukum_model_age_ga"],
        "geological_epoch": chronology["geological_epoch"],
        "craters_list": craters,
        "geojson": geojson_data,
    }


@router.post(
    "/interferometry",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def detect_temporal_interferometry(req: TemporalChangeRequest) -> Dict[str, Any]:
    """
    Bi-temporal change detection executing adjoint quantum phase difference Ry(2*theta_t2) Ry(-2*theta_t1).
    """
    if req.img_before and req.img_after:
        arr1 = np.array(req.img_before, dtype=np.float64)
        arr2 = np.array(req.img_after, dtype=np.float64)
        meta_sc = {"title": "Custom Temporal Orbital Pair", "baseline_years": 1.0}
    else:
        arr1, arr2, meta_sc = synthesize_temporal_scenario(req.scenario, size=64)

    change_map, meta = compute_temporal_change(
        arr1,
        arr2,
        threshold=req.change_threshold,
        normalize_illumination=req.normalize_illumination,
    )
    meta["scenario"] = req.scenario
    meta["scenario_title"] = meta_sc["title"]
    meta["baseline_years"] = meta_sc["baseline_years"]

    return {
        "status": "success",
        "metadata": meta,
        "before_grid": np.round(arr1, 0).astype(int).tolist(),
        "after_grid": np.round(arr2, 0).astype(int).tolist(),
        "change_probability_map": change_map.tolist(),
    }


@router.post(
    "/analyze-terrain",
    dependencies=[
        Depends(require_researcher),
        Depends(verify_hmac_csrf),
        Depends(acquire_user_compute_slot),
    ],
)
def analyze_terrain(req: AnalyzeTerrainContractRequest) -> Dict[str, Any]:
    """
    Unified 3D DEM + Lommel-Seeliger Photometry + Real Quantum Edge Map + Artemis LSI Safety +
    Direct vs A* Quantum-Safe Rover Transect + Fitzgibbon Crater Chronology endpoint.
    """
    cfg = get_site_preset_config(req.preset_id)
    # Snap resolution to multiple of 8 so tiled 8x8 quantum registers match cleanly
    res = max(32, min(256, (req.resolution // 8) * 8))

    sun_az = req.sun_azimuth_deg if req.sun_azimuth_deg is not None else cfg["default_sun_az_deg"]
    sun_el = req.sun_elevation_deg if req.sun_elevation_deg is not None else cfg["default_sun_el_deg"]

    heights, normals, dem_meta = generate_crater_dem_mesh(
        resolution=res,
        preset_id=cfg["preset_id"],
        gsd_m_px=req.gsd_m_px,
    )
    albedo_norm = dem_meta.pop("_albedo_norm", None)

    # 1. Lommel-Seeliger Photometry + Ray-Marched Horizon PSR Mask
    slope_deg, lommel_refl, psr_mask, orbital_u8, phot_meta = compute_lommel_photometry_with_psr(
        heights,
        normals,
        gsd_m_px=req.gsd_m_px,
        sun_azimuth_deg=sun_az,
        sun_elevation_deg=sun_el,
        albedo_norm=albedo_norm,
    )

    # 2. Authentic Quantum Edge Detection on Co-Registered Orbital Radiance
    quantum_edges, _, edge_stats = compute_gis_quantum_edges(
        orbital_u8,
        algorithm=req.algorithm,
        threshold=req.edge_threshold,
    )

    # 3. Artemis Landing Safety Analysis
    canon_lander = resolve_lander_profile_key(req.lander_profile)
    top_zones = find_top_safe_landing_zones(
        heights,
        quantum_edges,
        lander_profile_key=canon_lander,
        top_k=5,
        gsd_m_px=req.gsd_m_px,
        pad_gsd_m_px=req.pad_gsd_m_px,
        center_lat=cfg["center_lat"],
        center_lon=cfg["center_lon"],
        psr_mask=psr_mask,
    )

    if req.candidate_landing_coord is not None:
        cx_px, cy_px = _clamp_coord_to_grid(
            [
                req.candidate_landing_coord.get("x_px", res // 2),
                req.candidate_landing_coord.get("y_px", res // 2),
            ],
            res,
        )
    elif top_zones:
        cx_px = top_zones[0]["coord"]["x_px"]
        cy_px = top_zones[0]["coord"]["y_px"]
    else:
        cx_px, cy_px = res // 2, res // 2

    landing_eval = evaluate_landing_site(
        heights,
        quantum_edges,
        x_px=cx_px,
        y_px=cy_px,
        lander_profile_key=canon_lander,
        gsd_m_px=req.gsd_m_px,
        pad_gsd_m_px=req.pad_gsd_m_px,
        center_lat=cfg["center_lat"],
        center_lon=cfg["center_lon"],
        psr_mask=psr_mask,
    )
    landing_eval["top_5_safe_zones"] = top_zones

    # Cross-lander comparison for the exact active touchdown pad
    lander_comparison = []
    for l_key in ("ARTEMIS_HLS_STARSHIP_50M", "BLUE_MOON_MK1_15M", "CHANDRAYAAN_VIKRAM_12M"):
        comp = evaluate_landing_site(
            heights,
            quantum_edges,
            x_px=cx_px,
            y_px=cy_px,
            lander_profile_key=l_key,
            gsd_m_px=req.gsd_m_px,
            pad_gsd_m_px=req.pad_gsd_m_px,
            center_lat=cfg["center_lat"],
            center_lon=cfg["center_lon"],
            psr_mask=psr_mask,
        )
        lander_comparison.append({
            "lander_profile": l_key,
            "lander_short": comp["lander_short"],
            "radius_m": comp["radius_m"],
            "beta_crit_deg": comp["beta_crit_deg"],
            "landing_safety_index": comp["landing_safety_index"],
            "status_label": comp["status_label"],
            "status_color": comp["status_color"],
        })
    landing_eval["lander_comparison"] = lander_comparison

    # 4. Transect Profile & Rover Energy (Direct + A* Quantum-Safe Detour)
    if req.transect_line is not None:
        s_raw = req.transect_line.get("start_px", [int(res * 0.14), int(res * 0.50)])
        e_raw = req.transect_line.get("end_px", [int(res * 0.86), int(res * 0.50)])
        s_pt = _clamp_coord_to_grid(s_raw, res)
        e_pt = _clamp_coord_to_grid(e_raw, res)
    else:
        s_pt = (int(res * 0.14), int(res * 0.52))
        e_pt = (int(res * 0.86), int(res * 0.48))

    r_prof = ROVER_PROFILES.get((req.rover_profile or "VIPER").upper(), ROVER_PROFILES["VIPER"])
    direct_transect = extract_transect_profile(
        heights,
        quantum_edges,
        start_px=s_pt,
        end_px=e_pt,
        num_samples=96,
        gsd_m_px=req.gsd_m_px,
        rover_mass_kg=r_prof["mass_kg"],
        mu_roll=r_prof["mu_roll"],
    )
    detour_transect = compute_safe_detour_transect(
        heights,
        quantum_edges,
        start_px=s_pt,
        end_px=e_pt,
        num_samples=96,
        gsd_m_px=req.gsd_m_px,
        rover_mass_kg=r_prof["mass_kg"],
        mu_roll=r_prof["mu_roll"],
    )
    active_transect = detour_transect if req.route_mode == "safe_detour" else direct_transect

    # 5. Fitzgibbon Crater Chronology & Neukum Age Dating
    chronology = analyze_crater_chronology(
        quantum_edges,
        heights,
        gsd_m_px=req.gsd_m_px,
        preset_id=cfg["preset_id"],
        calibrated_n1_base=cfg["calibrated_n1"],
    )
    chronology["geojson"] = export_craters_to_geojson(
        chronology["craters"],
        center_lat=cfg["center_lat"],
        center_lon=cfg["center_lon"],
        gsd_m_px=req.gsd_m_px,
        resolution=res,
        algorithm_name=edge_stats["algorithm_display"],
    )

    return {
        "status": "success",
        "preset_id": cfg["preset_id"],
        "resolution": res,
        "site_metadata": dem_meta,
        "quantum_edge_stats": edge_stats,
        "photometry_meta": phot_meta,
        "landing_safety_analysis": landing_eval,
        "transect_profile": active_transect,
        "transect_comparison": {
            "direct": {
                "total_distance_km": direct_transect["total_distance_km"],
                "rover_energy_wh": direct_transect["rover_energy_wh"],
                "max_grade_deg": direct_transect["max_grade_deg"],
                "edge_crossings_count": direct_transect["edge_crossings_count"],
            },
            "safe_detour": {
                "total_distance_km": detour_transect["total_distance_km"],
                "rover_energy_wh": detour_transect["rover_energy_wh"],
                "max_grade_deg": detour_transect["max_grade_deg"],
                "edge_crossings_count": detour_transect["edge_crossings_count"],
            },
            "rover_display": r_prof["display_name"],
            "rover_mass_kg": r_prof["mass_kg"],
            "mu_roll": r_prof["mu_roll"],
        },
        "crater_chronology": chronology,
        "heights_grid": np.round(heights, 1).tolist(),
        "lommel_grid": np.round(lommel_refl, 3).tolist(),
        "slope_grid": np.round(slope_deg, 1).tolist(),
        "psr_grid": psr_mask.astype(int).tolist(),
        "quantum_edges_grid": np.round(quantum_edges, 3).tolist(),
    }
