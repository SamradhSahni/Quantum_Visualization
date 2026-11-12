"""
NASA Artemis & Lunar Lander Touchdown Safety & Slope Hazard Analyzer (Pillar 2.2)
Evaluates spacecraft landing footprint safety, planar-detrended surface roughness,
quantum edge boulder/rim density, and Landing Safety Index (LSI in [0, 100])
across Artemis HLS Starship, Blue Moon MK1, and Chandrayaan Vikram lander footprints.
"""
import math
from typing import Any, Dict, List, Optional
import numpy as np


LANDER_PROFILES: Dict[str, Dict[str, Any]] = {
    "ARTEMIS_HLS_STARSHIP_50M": {
        "display_name": "Artemis HLS Starship 50m Footprint",
        "short_label": "Starship 50m",
        "radius_m": 25.0,
        "beta_crit_deg": 8.5,
        "sigma_crit_m": 0.40,
        "gamma_q": 4.5,
        "gamma_r": 1.5,
    },
    "BLUE_MOON_MK1_15M": {
        "display_name": "Blue Moon MK1 15m Footprint",
        "short_label": "Blue Moon 15m",
        "radius_m": 7.5,
        "beta_crit_deg": 10.0,
        "sigma_crit_m": 0.50,
        "gamma_q": 3.8,
        "gamma_r": 1.2,
    },
    "CHANDRAYAAN_VIKRAM_12M": {
        "display_name": "Chandrayaan Vikram 12m Footprint",
        "short_label": "Vikram 12m",
        "radius_m": 6.0,
        "beta_crit_deg": 12.0,
        "sigma_crit_m": 0.60,
        "gamma_q": 3.2,
        "gamma_r": 1.0,
    },
}

LANDER_ALIASES: Dict[str, str] = {
    "ARTEMIS_HLS": "ARTEMIS_HLS_STARSHIP_50M",
    "ARTEMIS_HLS_STARSHIP_50M": "ARTEMIS_HLS_STARSHIP_50M",
    "STARSHIP": "ARTEMIS_HLS_STARSHIP_50M",
    "BLUE_MOON": "BLUE_MOON_MK1_15M",
    "BLUE_MOON_MK1_15M": "BLUE_MOON_MK1_15M",
    "VIKRAM": "CHANDRAYAAN_VIKRAM_12M",
    "CHANDRAYAAN_VIKRAM_12M": "CHANDRAYAAN_VIKRAM_12M",
}


def resolve_lander_profile_key(lander_profile_key: Optional[str]) -> str:
    """Resolves UI or legacy lander profile identifiers to canonical backend keys."""
    if not lander_profile_key:
        return "ARTEMIS_HLS_STARSHIP_50M"
    normalized = lander_profile_key.strip().upper().replace("-", "_")
    return LANDER_ALIASES.get(normalized, "ARTEMIS_HLS_STARSHIP_50M")


def _detrended_patch_roughness_m(
    footprint_h: np.ndarray,
    footprint_q: np.ndarray,
    gsd_m_px: float,
) -> float:
    """
    Computes regolith surface RMS roughness relative to the local best-fit tilted landing plane.
    Separates broad terrain tilt (already measured by beta_max) from surface undulations and boulders.
    """
    rows, cols = footprint_h.shape
    if rows * cols < 4:
        return 0.0

    yy, xx = np.mgrid[:rows, :cols]
    design = np.column_stack([xx.ravel().astype(np.float64), yy.ravel().astype(np.float64), np.ones(rows * cols)])
    vals = footprint_h.ravel().astype(np.float64)
    coeffs, _, _, _ = np.linalg.lstsq(design, vals, rcond=None)
    plane = design @ coeffs
    residuals = vals - plane
    macro_dev_m = float(np.sqrt(np.mean(residuals ** 2)))

    # Scale macro curvature residuals to sub-meter regolith roughness scale
    # while blending in sub-pixel quantum boulder roughness contribution
    scale_div = max(1.0, gsd_m_px / 0.85)
    q_mean = float(np.mean(footprint_q)) if footprint_q.size > 0 else 0.0
    subpixel_boulder_m = 0.22 * q_mean
    return float(max(0.0, (macro_dev_m / scale_div) + subpixel_boulder_m))


def _pixel_to_selenographic(
    x_px: int,
    y_px: int,
    width: int,
    height: int,
    center_lat: float,
    center_lon: float,
    gsd_m_px: float,
) -> Dict[str, Any]:
    """Converts terrain pixel coordinates to IAU_2015:30100 selenographic Lat/Lon."""
    m_per_deg_lat = 30320.0
    cos_lat = max(0.08, abs(math.cos(math.radians(center_lat))))
    m_per_deg_lon = m_per_deg_lat * cos_lat

    dx_m = (x_px - width / 2.0) * gsd_m_px
    dy_m = (y_px - height / 2.0) * gsd_m_px
    lon = center_lon + dx_m / m_per_deg_lon
    lat = float(np.clip(center_lat - dy_m / m_per_deg_lat, -89.99, 89.99))

    lat_dir = "N" if lat >= 0 else "S"
    lon_dir = "E" if lon >= 0 else "W"
    return {
        "lat": round(lat, 2),
        "lon": round(lon, 2),
        "label": f"{abs(lat):.2f}° {lat_dir}, {abs(lon):.2f}° {lon_dir}",
    }


def _describe_zone_geology(x_px: int, y_px: int, w: int, h: int, slope_deg: float, elev_m: float) -> str:
    """Assigns a clear geomorphological zone label from position, relief, and slope."""
    nx = (x_px / max(1, w)) - 0.5
    ny = (y_px / max(1, h)) - 0.5
    r = math.sqrt(nx ** 2 + ny ** 2)

    ns = "North" if ny < -0.1 else "South" if ny > 0.1 else "Central"
    ew = "West" if nx < -0.1 else "East" if nx > 0.1 else ""
    compass = f"{ns} {ew}".strip()

    if r < 0.13:
        return "Central Peak Massif" if elev_m > 0 else "Deep Basin Floor"
    if slope_deg >= 12.0:
        return f"{compass} Steep Rim Wall"
    if elev_m > 550.0:
        return f"{compass} Sunlit Ridge Crest"
    if slope_deg <= 5.5:
        return f"{compass} Flat Mare Apron"
    return f"{compass} Terraced Ejecta Bench"


def evaluate_landing_site(
    heights: np.ndarray,
    quantum_edges: np.ndarray,
    x_px: int,
    y_px: int,
    lander_profile_key: str = "ARTEMIS_HLS_STARSHIP_50M",
    gsd_m_px: float = 59.0,
    pad_gsd_m_px: Optional[float] = None,
    center_lat: float = -8.97,
    center_lon: float = 15.50,
    psr_mask: Optional[np.ndarray] = None,
) -> Dict[str, Any]:
    """
    Evaluates a candidate landing site centered at (x_px, y_px) under the given lander profile.
    """
    canon_key = resolve_lander_profile_key(lander_profile_key)
    prof = LANDER_PROFILES[canon_key]
    h, w = heights.shape
    cx = int(np.clip(x_px, 0, w - 1))
    cy = int(np.clip(y_px, 0, h - 1))

    # Effective sampling scale for footprint geometry (supports high-res sub-pad zooming)
    eval_gsd = pad_gsd_m_px if pad_gsd_m_px is not None else gsd_m_px
    rad_px = max(1, int(round(prof["radius_m"] / max(0.5, eval_gsd))))

    r_min = max(0, cy - rad_px)
    r_max = min(h, cy + rad_px + 1)
    c_min = max(0, cx - rad_px)
    c_max = min(w, cx + rad_px + 1)

    footprint_h = heights[r_min:r_max, c_min:c_max]
    footprint_q = quantum_edges[r_min:r_max, c_min:c_max]

    # Physical local slope across full DEM gradient spacing
    dz_dy, dz_dx = np.gradient(footprint_h, gsd_m_px, gsd_m_px)
    local_slopes_deg = np.degrees(np.arctan(np.sqrt(dz_dx ** 2 + dz_dy ** 2)))
    max_slope = float(np.max(local_slopes_deg)) if local_slopes_deg.size > 0 else 0.0

    # Quantum rim / boulder hazard density [0..100%]
    q_hazard_pct = float(np.mean(footprint_q)) * 100.0 if footprint_q.size > 0 else 0.0
    q_hazard_norm = q_hazard_pct / 100.0

    # Planar-detrended RMS roughness (meters)
    rms_roughness = _detrended_patch_roughness_m(footprint_h, footprint_q, gsd_m_px=gsd_m_px)

    # Composite Landing Safety Index (LSI in [0, 100])
    # LSI = 100 * exp(-(beta_max / beta_crit)^2 - gamma_q * H_q - gamma_r * (sigma / sigma_crit))
    slope_penalty = (max_slope / prof["beta_crit_deg"]) ** 2
    hazard_penalty = prof["gamma_q"] * q_hazard_norm
    roughness_penalty = prof["gamma_r"] * (rms_roughness / prof["sigma_crit_m"])

    psr_in_pad = False
    if psr_mask is not None:
        footprint_psr = psr_mask[r_min:r_max, c_min:c_max]
        psr_in_pad = bool(np.mean(footprint_psr) > 0.5)

    total_penalty = slope_penalty + hazard_penalty + roughness_penalty
    lsi = 100.0 * math.exp(-total_penalty)
    lsi = round(float(np.clip(lsi, 0.0, 100.0)), 1)

    if lsi >= 80.0:
        status = "CERTIFIED_SAFE"
        status_label = "Certified Safe"
        status_color = "#39D353"
    elif lsi >= 50.0:
        status = "MARGINAL_CAUTION"
        status_label = "Marginal Caution"
        status_color = "#FFD700"
    else:
        status = "ABORT_HAZARD"
        status_label = "Abort Hazard"
        status_color = "#EF4444"

    elev_center = float(heights[cy, cx])
    seleno = _pixel_to_selenographic(cx, cy, w, h, center_lat, center_lon, gsd_m_px)
    geo_label = _describe_zone_geology(cx, cy, w, h, max_slope, elev_center)

    return {
        "lander_profile": canon_key,
        "lander_display": prof["display_name"],
        "lander_short": prof["short_label"],
        "radius_m": prof["radius_m"],
        "footprint_radius_px": rad_px,
        "pad_gsd_m_px": eval_gsd,
        "beta_crit_deg": prof["beta_crit_deg"],
        "sigma_crit_m": prof["sigma_crit_m"],
        "gamma_q": prof["gamma_q"],
        "gamma_r": prof["gamma_r"],
        "coord": {"x_px": cx, "y_px": cy},
        "selenographic_label": seleno["label"],
        "lat": seleno["lat"],
        "lon": seleno["lon"],
        "elevation_m": round(elev_center, 1),
        "zone_name": geo_label,
        "in_psr_shadow": psr_in_pad,
        "max_slope_deg": round(max_slope, 2),
        "quantum_rim_hazard_pct": round(q_hazard_pct, 1),
        "rms_roughness_m": round(rms_roughness, 3),
        "slope_penalty": round(slope_penalty, 3),
        "hazard_penalty": round(hazard_penalty, 3),
        "roughness_penalty": round(roughness_penalty, 3),
        "total_penalty": round(total_penalty, 3),
        "landing_safety_index": lsi,
        "status": status,
        "status_label": status_label,
        "status_color": status_color,
    }


def find_top_safe_landing_zones(
    heights: np.ndarray,
    quantum_edges: np.ndarray,
    lander_profile_key: str = "ARTEMIS_HLS_STARSHIP_50M",
    top_k: int = 5,
    gsd_m_px: float = 59.0,
    pad_gsd_m_px: Optional[float] = None,
    center_lat: float = -8.97,
    center_lon: float = 15.50,
    psr_mask: Optional[np.ndarray] = None,
) -> List[Dict[str, Any]]:
    """
    Scans the terrain on a coarse grid to identify spatially diverse candidate touchdown sites,
    ensuring top safe pads and an illustrative high-slope hazard site appear for clear comparison.
    """
    h, w = heights.shape
    candidates: List[Dict[str, Any]] = []

    step = max(3, min(h, w) // 24)
    margin = max(4, step)
    min_sep = max(12.0, min(h, w) * 0.16)

    for y in range(margin, h - margin, step):
        for x in range(margin, w - margin, step):
            eval_res = evaluate_landing_site(
                heights,
                quantum_edges,
                x,
                y,
                lander_profile_key=lander_profile_key,
                gsd_m_px=gsd_m_px,
                pad_gsd_m_px=pad_gsd_m_px,
                center_lat=center_lat,
                center_lon=center_lon,
                psr_mask=psr_mask,
            )
            candidates.append(eval_res)

    candidates.sort(key=lambda item: item["landing_safety_index"], reverse=True)

    top_zones: List[Dict[str, Any]] = []
    for c in candidates:
        too_close = any(
            math.hypot(c["coord"]["x_px"] - tz["coord"]["x_px"], c["coord"]["y_px"] - tz["coord"]["y_px"]) < min_sep
            for tz in top_zones
        )
        if not too_close:
            top_zones.append(c)
            if len(top_zones) >= max(1, top_k - 1):
                break

    # Include 1 contrasting hazard zone (steep rim / central peak) from the lower quartile for comparison
    if len(top_zones) < top_k and len(candidates) > 4:
        for c in reversed(candidates):
            too_close = any(
                math.hypot(c["coord"]["x_px"] - tz["coord"]["x_px"], c["coord"]["y_px"] - tz["coord"]["y_px"]) < min_sep
                for tz in top_zones
            )
            if not too_close:
                top_zones.append(c)
                if len(top_zones) >= top_k:
                    break

    for rank, zone in enumerate(top_zones, 1):
        zone["rank"] = rank

    return top_zones
