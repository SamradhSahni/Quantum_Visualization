"""
LOLA Digital Elevation Model (DEM) Heightmap Wrapper
Delegates cleanly to dem_photometry.generate_crater_dem_mesh to eliminate duplicate synthesis logic.
"""
from typing import Any, Dict, Optional, Tuple
import numpy as np

from backend.app.domain.gis.dem_photometry import generate_crater_dem_mesh as _canonical_dem


def generate_crater_dem_mesh(
    resolution: int = 256,
    crater_radius_ratio: float = 0.35,
    rim_height_m: float = 1200.0,
    floor_depth_m: float = -1800.0,
    preset_id: Optional[str] = None,
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """Generates co-registered elevation matrices, normals, and metadata via canonical DEM builder."""
    heights, normals, meta = _canonical_dem(
        resolution=resolution,
        crater_radius_ratio=crater_radius_ratio,
        rim_height_m=rim_height_m,
        floor_depth_m=floor_depth_m,
        preset_id=preset_id,
    )
    return heights, normals, {
        "elevation_min_m": meta["min_elevation_m"],
        "elevation_max_m": meta["max_elevation_m"],
        "crater_depth_m": round(rim_height_m - floor_depth_m, 1),
        "ground_sample_distance_m": meta["gsd_m_px"],
        "selenographic_crs": meta["crs"],
    }
