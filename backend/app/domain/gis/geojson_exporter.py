"""
RFC 7946 GeoJSON Exporter with Selenographic CRS (IAU_2015:30100)
Exports Fitzgibbon-fitted crater ellipse polygons and morphometry metadata for GIS tools
(QGIS, ArcGIS, NASA Moon Trek) aligned dynamically to DEM tile resolution.
"""
import math
from typing import Any, Dict, List


def export_craters_to_geojson(
    craters: List[Dict[str, Any]],
    center_lat: float = -8.97,
    center_lon: float = 15.50,
    gsd_m_px: float = 59.0,
    resolution: int = 256,
    algorithm_name: str = "FRQI-QHED",
) -> Dict[str, Any]:
    """
    Serializes a list of crater morphometry dicts into RFC 7946 GeoJSON
    with Selenographic IAU_2015:30100 coordinates.
    """
    m_per_deg_lat = 30320.0
    cos_lat = max(0.08, abs(math.cos(math.radians(center_lat))))
    m_per_deg_lon = m_per_deg_lat * cos_lat
    half_res = resolution / 2.0

    features = []
    for c in craters:
        cx_px = float(c["center_x_px"]) - half_res
        cy_px = float(c["center_y_px"]) - half_res

        c_lon = center_lon + (cx_px * gsd_m_px) / m_per_deg_lon
        c_lat = center_lat - (cy_px * gsd_m_px) / m_per_deg_lat

        a_px = float(c.get("semi_major_px", (c.get("diameter_km", 2.0) * 1000.0 / gsd_m_px) / 2.0))
        b_px = float(c.get("semi_minor_px", a_px * (1.0 - c.get("ellipticity", 0.0))))
        a_m = a_px * gsd_m_px
        b_m = b_px * gsd_m_px
        phi_rad = math.radians(c.get("orientation_deg", 0.0))

        coords = []
        for step in range(33):
            theta = (2.0 * math.pi * step) / 32.0
            px = a_m * math.cos(theta)
            py = b_m * math.sin(theta)
            rx = px * math.cos(phi_rad) - py * math.sin(phi_rad)
            ry = px * math.sin(phi_rad) + py * math.cos(phi_rad)

            p_lon = c_lon + rx / m_per_deg_lon
            p_lat = c_lat - ry / m_per_deg_lat
            coords.append([round(p_lon, 5), round(p_lat, 5)])

        features.append({
            "type": "Feature",
            "id": c["crater_id"],
            "geometry": {
                "type": "Polygon",
                "coordinates": [coords],
            },
            "properties": {
                "crater_id": c["crater_id"],
                "diameter_km": c["diameter_km"],
                "depth_m": c["depth_m"],
                "depth_to_diameter_ratio": c["depth_to_diameter_ratio"],
                "ellipticity": c["ellipticity"],
                "terrain_class": c["terrain_class"],
                "rim_confidence": c["rim_confidence"],
                "quantum_algorithm": algorithm_name,
            },
        })

    return {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:IAU_2015:30100",
            },
        },
        "features": features,
    }
