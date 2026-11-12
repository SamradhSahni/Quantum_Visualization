"""
Photorealistic 3D LOLA DEM Terrain, Slope/Aspect, Horizon Ray-Casting & Lommel-Seeliger Shading (Pillar 2.1)
Synthesizes site-distinct elevation matrices (Apollo 16, Shackleton PSR, Tycho, LRO WAC GeoTIFF),
calculates physical slopes in degrees, casts solar horizon shadows (PSR cold-traps), and computes
Lommel-Seeliger photometric reflectance maps for Quantum Edge Detection.
"""
import math
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
import cv2
import numpy as np
import tifffile

ROOT_DIR = Path(__file__).resolve().parents[4]
LRO_WAC_GEOTIFF_PATH = (
    ROOT_DIR
    / "data/sombench/cache/20f800becb64a0c7ad314652a683f97f0281fe67/M1290203799CE_r5872_c1112.tif"
)

SITE_PRESETS: Dict[str, Dict[str, Any]] = {
    "apollo_16": {
        "preset_id": "apollo_16",
        "display_name": "Apollo 16 Descartes Highlands",
        "center_lat": -8.97,
        "center_lon": 15.50,
        "default_sun_el_deg": 24.0,
        "default_sun_az_deg": 135.0,
        "region_class": "Descartes Highlands & Mare Plains",
        "epoch_hint": "Upper Imbrian / Nectarian",
        "crater_radius_ratio": 0.28,
        "rim_height_m": 950.0,
        "floor_depth_m": -1450.0,
        "calibrated_n1": 0.0125,
    },
    "shackleton": {
        "preset_id": "shackleton",
        "display_name": "Shackleton Crater South Pole PSR",
        "center_lat": -89.67,
        "center_lon": 129.78,
        "default_sun_el_deg": 2.0,
        "default_sun_az_deg": 45.0,
        "region_class": "South Pole Permanently Shadowed Basin",
        "epoch_hint": "Lower Imbrian Polar Basin",
        "crater_radius_ratio": 0.37,
        "rim_height_m": 1600.0,
        "floor_depth_m": -2600.0,
        "calibrated_n1": 0.0086,
    },
    "tycho": {
        "preset_id": "tycho",
        "display_name": "Tycho Central Peak Complex",
        "center_lat": -43.31,
        "center_lon": 348.78,
        "default_sun_el_deg": 38.0,
        "default_sun_az_deg": 110.0,
        "region_class": "Copernican Rayed Central Peak",
        "epoch_hint": "Copernican Impact Complex",
        "crater_radius_ratio": 0.40,
        "rim_height_m": 1480.0,
        "floor_depth_m": -2280.0,
        "calibrated_n1": 0.00072,
    },
    "lro_wac_real": {
        "preset_id": "lro_wac_real",
        "display_name": "LRO WAC Orbital GeoTIFF Tile",
        "center_lat": 23.40,
        "center_lon": 47.20,
        "default_sun_el_deg": 28.0,
        "default_sun_az_deg": 125.0,
        "region_class": "NASA LRO Calibrated GeoTIFF",
        "epoch_hint": "Eratosthenian / Mare Crisium",
        "crater_radius_ratio": 0.32,
        "rim_height_m": 920.0,
        "floor_depth_m": -1280.0,
        "calibrated_n1": 0.0038,
    },
}


def resolve_site_preset_id(preset_id: Optional[str]) -> str:
    """Normalizes legacy or alias site IDs onto canonical keys."""
    if not preset_id:
        return "apollo_16"
    pid = preset_id.strip().lower()
    if "shackleton" in pid or "south_pole" in pid:
        return "shackleton"
    if "tycho" in pid:
        return "tycho"
    if "lro" in pid or "geotiff" in pid or "wac" in pid:
        return "lro_wac_real"
    return "apollo_16"


def get_site_preset_config(preset_id: Optional[str]) -> Dict[str, Any]:
    """Returns canonical selenographic configuration for the requested lunar region."""
    canonical = resolve_site_preset_id(preset_id)
    return dict(SITE_PRESETS[canonical])


def _add_secondary_crater(
    heights: np.ndarray,
    x_grid: np.ndarray,
    y_grid: np.ndarray,
    cx_norm: float,
    cy_norm: float,
    radius_norm: float,
    depth_m: float,
    rim_m: float,
    res: int,
) -> None:
    """Superimposes a secondary bowl crater onto an existing height matrix."""
    cx = cx_norm * res
    cy = cy_norm * res
    r_px = np.sqrt((x_grid - cx) ** 2 + (y_grid - cy) ** 2) / (res / 2.0)
    in_bowl = r_px < radius_norm
    norm_r = np.zeros_like(r_px)
    norm_r[in_bowl] = r_px[in_bowl] / max(1e-6, radius_norm)
    heights[in_bowl] += -depth_m * (1.0 - norm_r[in_bowl] ** 2.0) + rim_m * (norm_r[in_bowl] ** 3.0)

    in_ejecta = (r_px >= radius_norm) & (r_px < radius_norm * 2.2)
    heights[in_ejecta] += rim_m * np.exp(-((r_px[in_ejecta] - radius_norm) / (0.35 * radius_norm)) ** 1.4)


def _compute_normals(heights: np.ndarray, gsd_m_px: float) -> np.ndarray:
    """Computes outward surface normal vectors [nx, ny, nz] across the height grid."""
    dz_dy, dz_dx = np.gradient(heights, gsd_m_px, gsd_m_px)
    normals = np.zeros((heights.shape[0], heights.shape[1], 3), dtype=np.float64)
    normals[:, :, 0] = -dz_dx
    normals[:, :, 1] = -dz_dy
    normals[:, :, 2] = 1.0
    norm_len = np.sqrt(np.sum(normals ** 2, axis=2, keepdims=True))
    return normals / np.maximum(1e-9, norm_len)


def _load_real_lro_dem(resolution: int) -> Tuple[np.ndarray, Optional[np.ndarray]]:
    """Loads calibrated LRO WAC GeoTIFF and estimates photoclinometric elevation relief."""
    albedo_norm: Optional[np.ndarray] = None
    if LRO_WAC_GEOTIFF_PATH.exists():
        raw = tifffile.imread(str(LRO_WAC_GEOTIFF_PATH))
        band = raw[:, :, 0].astype(np.float64) if raw.ndim == 3 else raw.astype(np.float64)
        b_min, b_max = float(band.min()), float(band.max())
        norm = (band - b_min) / max(1e-9, b_max - b_min)
        albedo_norm = cv2.resize(norm, (resolution, resolution), interpolation=cv2.INTER_AREA)

        # Photoclinometric elevation proxy scaled to realistic lunar mare/highland relief slopes (~2..22 deg)
        low_freq = cv2.GaussianBlur(albedo_norm, (0, 0), sigmaX=max(4.0, resolution * 0.10))
        mid_freq = cv2.GaussianBlur(albedo_norm, (0, 0), sigmaX=max(2.2, resolution * 0.035))
        dx_shift = np.roll(mid_freq, -1, axis=1) - np.roll(mid_freq, 1, axis=1)
        heights = (low_freq - 0.5) * 620.0 + (mid_freq - 0.5) * 240.0 + dx_shift * 90.0
        heights = cv2.GaussianBlur(heights, (0, 0), sigmaX=1.4)
        return heights.astype(np.float64), albedo_norm

    # Fallback deterministic synthesis if cache GeoTIFF absent
    y_g, x_g = np.mgrid[:resolution, :resolution]
    heights = (
        np.sin(x_g * 0.07) * np.cos(y_g * 0.06) * 420.0
        + np.sin((x_g + y_g) * 0.14) * 110.0
    )
    _add_secondary_crater(heights, x_g, y_g, 0.52, 0.48, 0.24, 920.0, 260.0, resolution)
    _add_secondary_crater(heights, x_g, y_g, 0.25, 0.28, 0.12, 410.0, 120.0, resolution)
    return heights.astype(np.float64), None


def generate_crater_dem_mesh(
    resolution: int = 256,
    crater_radius_ratio: float = 0.35,
    rim_height_m: float = 1200.0,
    floor_depth_m: float = -1800.0,
    preset_id: Optional[str] = None,
    gsd_m_px: float = 59.0,
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Synthesizes a Lunar LOLA DEM heightmap tailored to a planetary region preset
    with distinct geological morphology (mare landing pads, PSR ridge, central peak terraces,
    or real LRO WAC GeoTIFF photoclinometry).
    """
    canonical = resolve_site_preset_id(preset_id)
    cfg = SITE_PRESETS[canonical]

    # Respect explicit caller ratios when preset_id is omitted
    if preset_id is not None:
        crater_radius_ratio = cfg["crater_radius_ratio"]
        rim_height_m = cfg["rim_height_m"]
        floor_depth_m = cfg["floor_depth_m"]

    y_g, x_g = np.mgrid[:resolution, :resolution]
    heights = np.zeros((resolution, resolution), dtype=np.float64)
    albedo_norm: Optional[np.ndarray] = None

    if canonical == "lro_wac_real" and preset_id is not None:
        heights, albedo_norm = _load_real_lro_dem(resolution)
    else:
        cx_frac, cy_frac = (0.45, 0.43) if canonical == "apollo_16" else (0.50, 0.47) if canonical == "shackleton" else (0.50, 0.50)
        cx, cy = resolution * cx_frac, resolution * cy_frac
        dx = x_g - cx
        dy = y_g - cy
        r = np.sqrt(dx ** 2 + dy ** 2) / (resolution / 2.0)
        theta = np.arctan2(dy, dx)

        r_rim = crater_radius_ratio
        outer_mask = r >= r_rim
        exponent_outer = np.power((r[outer_mask] - r_rim) / 0.25, 1.5)
        heights[outer_mask] = rim_height_m * np.exp(-exponent_outer)

        inner_mask = r < r_rim
        norm_inner_r = r[inner_mask] / r_rim

        if canonical == "shackleton":
            # Steep U/flat-floor polar bowl + illuminated southern massif ridge bench
            bowl = floor_depth_m + (rim_height_m - floor_depth_m) * (norm_inner_r ** 2.6)
            heights[inner_mask] = bowl
            noise = np.sin(x_g * 0.16) * np.cos(y_g * 0.16) * 28.0 + np.sin(x_g * 0.06 - y_g * 0.08) * 45.0
            heights += noise
            ridge_band = np.exp(-((y_g / resolution - 0.88) / 0.10) ** 2)
            heights = heights * (1.0 - 0.88 * ridge_band) + 1280.0 * ridge_band
            # Local smooth "Peak of Eternal Light" landing bench
            bench = np.exp(-(((x_g / resolution - 0.64) / 0.16) ** 2 + ((y_g / resolution - 0.87) / 0.11) ** 2))
            heights = heights * (1.0 - 0.98 * bench) + 1295.0 * bench
            _add_secondary_crater(heights, x_g, y_g, 0.22, 0.22, 0.10, 460.0, 125.0, resolution)
            _add_secondary_crater(heights, x_g, y_g, 0.78, 0.24, 0.08, 340.0, 95.0, resolution)

        elif canonical == "tycho":
            # Terraced walls + giant central peak massif + radial ejecta rays
            terrace = 175.0 * np.sin(norm_inner_r * 5.0 * math.pi) * np.exp(-((norm_inner_r - 0.72) / 0.25) ** 2)
            bowl = floor_depth_m + (rim_height_m - floor_depth_m) * (norm_inner_r ** 2.0) + terrace
            central_peak = 1880.0 * np.exp(-np.power(r[inner_mask] / 0.11, 2)) * (
                1.0 + 0.16 * np.cos(3.0 * theta[inner_mask])
            )
            heights[inner_mask] = bowl + central_peak
            rays = np.exp(-((r[outer_mask] - r_rim) / 0.55) ** 1.2) * (145.0 * np.cos(5.0 * theta[outer_mask]))
            heights[outer_mask] += rays
            noise = np.sin(x_g * 0.16) * np.cos(y_g * 0.16) * 26.0 + np.sin(x_g * 0.06 + y_g * 0.08) * 42.0
            heights += noise
            _add_secondary_crater(heights, x_g, y_g, 0.20, 0.76, 0.09, 410.0, 130.0, resolution)
            _add_secondary_crater(heights, x_g, y_g, 0.81, 0.78, 0.07, 290.0, 85.0, resolution)
            # Smooth outer flat ejecta pond in NW & SW quadrants for safe vs lander-sensitive landing tests
            pond = np.exp(-(((x_g / resolution - 0.16) / 0.12) ** 2 + ((y_g / resolution - 0.16) / 0.12) ** 2))
            heights = heights * (1.0 - 0.95 * pond) + 180.0 * pond

        else:
            # Apollo 16 Descartes Highlands + Smooth SE Mare Landing Apron + secondary craters
            bowl = floor_depth_m + (rim_height_m - floor_depth_m) * (norm_inner_r ** 2.2)
            central_peak = 650.0 * np.exp(-np.power(r[inner_mask] / 0.08, 2))
            heights[inner_mask] = bowl + central_peak
            noise = np.sin(x_g * 0.16) * np.cos(y_g * 0.16) * 20.0 + np.sin(x_g * 0.05 + y_g * 0.07) * 38.0
            heights += noise
            _add_secondary_crater(heights, x_g, y_g, 0.22, 0.76, 0.11, 440.0, 115.0, resolution)
            _add_secondary_crater(heights, x_g, y_g, 0.79, 0.22, 0.09, 340.0, 90.0, resolution)
            _add_secondary_crater(heights, x_g, y_g, 0.19, 0.31, 0.07, 210.0, 55.0, resolution)

            if preset_id is not None:
                # Smooth Mare basin apron in South-East + gentle northern shelf so LSI spans Certified -> Marginal
                apron = np.exp(-(((x_g / resolution - 0.76) / 0.18) ** 2 + ((y_g / resolution - 0.76) / 0.18) ** 2))
                heights = heights * (1.0 - 0.96 * apron) - 180.0 * apron

    normals = _compute_normals(heights, gsd_m_px=gsd_m_px)

    meta = {
        "preset_id": canonical,
        "display_name": cfg["display_name"],
        "center_lat": cfg["center_lat"],
        "center_lon": cfg["center_lon"],
        "region_class": cfg["region_class"],
        "epoch_hint": cfg["epoch_hint"],
        "resolution": resolution,
        "min_elevation_m": round(float(np.min(heights)), 1),
        "max_elevation_m": round(float(np.max(heights)), 1),
        "relief_m": round(float(np.max(heights) - np.min(heights)), 1),
        "crs": "IAU_2015:30100",
        "gsd_m_px": gsd_m_px,
        "has_real_albedo": albedo_norm is not None,
    }
    if albedo_norm is not None:
        meta["_albedo_norm"] = albedo_norm

    return heights, normals, meta


def compute_horizon_shadow_mask(
    heights: np.ndarray,
    gsd_m_px: float = 59.0,
    sun_azimuth_deg: float = 135.0,
    sun_elevation_deg: float = 24.0,
    ray_steps: int = 28,
) -> np.ndarray:
    """
    Vectorized horizon ray-marching shadow test along sun azimuth vector.
    Returns boolean array where True = Illuminated, False = Terrain-occluded shadow (PSR candidate).
    """
    h, w = heights.shape
    az_rad = math.radians(sun_azimuth_deg)
    el_rad = math.radians(max(0.5, min(89.0, sun_elevation_deg)))
    tan_el = math.tan(el_rad)

    # March toward the sun direction (col = +sin(az), row = +cos(az))
    step_x = math.sin(az_rad)
    step_y = math.cos(az_rad)

    max_dist_px = max(8, int(min(h, w) * 0.45))
    distances = np.linspace(1.5, float(max_dist_px), ray_steps)

    yy, xx = np.mgrid[:h, :w].astype(np.float64)
    lit_mask = np.ones((h, w), dtype=bool)

    for d_px in distances:
        sx = np.clip(np.rint(xx + d_px * step_x).astype(int), 0, w - 1)
        sy = np.clip(np.rint(yy + d_px * step_y).astype(int), 0, h - 1)
        ray_h = heights[sy, sx]
        horizon_h = heights + (d_px * gsd_m_px) * tan_el
        occluded = ray_h > horizon_h + 1.0
        lit_mask &= ~occluded

    return lit_mask


def radiance_to_orbital_uint8(
    lommel_seeliger: np.ndarray,
    heights: np.ndarray,
    albedo_norm: Optional[np.ndarray] = None,
) -> np.ndarray:
    """
    Synthesizes an 8-bit co-registered orbital grayscale image from Lommel-Seeliger reflectance
    plus high-frequency crater rim & regolith boulder scatter contrast suitable for Quantum Edge Detection.
    """
    h, w = heights.shape
    if albedo_norm is not None:
        base = 0.65 * albedo_norm + 0.35 * lommel_seeliger
    else:
        dy, dx = np.gradient(heights.astype(np.float64))
        grad_mag = np.sqrt(dx ** 2 + dy ** 2)
        grad_norm = grad_mag / max(1e-6, float(np.percentile(grad_mag, 97)))
        lap = cv2.Laplacian(heights.astype(np.float64), cv2.CV_64F, ksize=3)
        lap_norm = np.clip(lap / max(1.0, float(np.percentile(np.abs(lap), 97))), -0.45, 0.45)

        # Deterministic rocky boulder & fracture micro-contrast concentrated on steeper walls & rim crests
        yy, xx = np.mgrid[:h, :w].astype(np.float64)
        boulder_scatter = (
            np.sin(xx * 1.9 + yy * 0.7) * np.cos(xx * 0.8 - yy * 2.1)
            + 0.5 * np.sin((xx ** 1.05) * 2.7 - yy * 1.4)
        )
        boulder_amp = np.clip(grad_norm - 0.18, 0.0, 1.0) * 0.22
        base = np.clip(
            0.72 * lommel_seeliger + 0.20 * (0.5 + lap_norm) + boulder_amp * boulder_scatter,
            0.0,
            1.0,
        )

    lo, hi = float(np.min(base)), float(np.max(base))
    if hi > lo + 1e-6:
        scaled = (base - lo) / (hi - lo)
    else:
        scaled = base
    return np.clip(scaled * 255.0, 0, 255).astype(np.uint8)


def compute_lommel_photometry_with_psr(
    heights: np.ndarray,
    normals: np.ndarray,
    gsd_m_px: float = 59.0,
    sun_azimuth_deg: float = 135.0,
    sun_elevation_deg: float = 14.0,
    albedo_norm: Optional[np.ndarray] = None,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Calculates topographic slope in degrees, Lommel-Seeliger photometric reflectance with horizon
    ray-cast shadows, PSR cold-trap mask, and uint8 orbital radiance image.
    """
    dz_dy, dz_dx = np.gradient(heights, gsd_m_px, gsd_m_px)
    slope_rad = np.arctan(np.sqrt(dz_dx ** 2 + dz_dy ** 2))
    slope_deg = np.degrees(slope_rad)

    az_rad = math.radians(sun_azimuth_deg)
    el_rad = math.radians(sun_elevation_deg)
    s_vec = np.array([
        math.cos(el_rad) * math.sin(az_rad),
        math.cos(el_rad) * math.cos(az_rad),
        math.sin(el_rad),
    ])

    lit_mask = compute_horizon_shadow_mask(
        heights,
        gsd_m_px=gsd_m_px,
        sun_azimuth_deg=sun_azimuth_deg,
        sun_elevation_deg=sun_elevation_deg,
    )
    mu_0_raw = np.maximum(0.0, np.sum(normals * s_vec, axis=2))
    mu_0 = np.where(lit_mask, mu_0_raw, 0.0)
    mu = np.maximum(0.01, normals[:, :, 2])

    # Lommel-Seeliger law: R = mu_0 / (mu_0 + mu + epsilon)
    lommel_seeliger = mu_0 / (mu_0 + mu + 1e-4)
    lommel_seeliger = np.clip(np.where(lit_mask & (mu_0_raw > 0.0), np.maximum(0.08, lommel_seeliger), 0.03), 0.03, 1.0)
    psr_mask = (~lit_mask) | (mu_0_raw <= 0.02)

    psr_fraction_pct = round(float(np.mean(psr_mask)) * 100.0, 1)
    orbital_u8 = radiance_to_orbital_uint8(lommel_seeliger, heights, albedo_norm=albedo_norm)

    meta = {
        "mean_slope_deg": round(float(np.mean(slope_deg)), 2),
        "max_slope_deg": round(float(np.max(slope_deg)), 2),
        "sun_azimuth_deg": round(float(sun_azimuth_deg), 1),
        "sun_elevation_deg": round(float(sun_elevation_deg), 1),
        "psr_fraction_pct": psr_fraction_pct,
        "mean_reflectance": round(float(np.mean(lommel_seeliger)), 3),
    }

    return slope_deg, lommel_seeliger, psr_mask, orbital_u8, meta


def compute_slope_and_photometry(
    heights: np.ndarray,
    normals: np.ndarray,
    gsd_m_px: float = 59.0,
    sun_azimuth_deg: float = 135.0,
    sun_elevation_deg: float = 14.0,
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Backwards-compatible wrapper returning (slope_deg, lommel_seeliger, meta).
    """
    slope_deg, lommel_seeliger, _, _, meta = compute_lommel_photometry_with_psr(
        heights,
        normals,
        gsd_m_px=gsd_m_px,
        sun_azimuth_deg=sun_azimuth_deg,
        sun_elevation_deg=sun_elevation_deg,
    )
    return slope_deg, lommel_seeliger, meta
