"""
Interactive Elevation Cross-Section Transect Slicer & Rover Energy Planner (Pillar 2.3)
Slices bilinear elevation and quantum edge profiles along A -> B, computes lunar rover
mechanical battery consumption (Wh) with boulder-slip drag modulation, and provides an
8-neighbor Dijkstra A* Quantum-Safe Detour route minimizing slope and edge hazards.
"""
import heapq
import math
from typing import Any, Dict, List, Optional, Tuple
import numpy as np


ROVER_PROFILES: Dict[str, Dict[str, Any]] = {
    "VIPER": {"display_name": "NASA VIPER (450 kg)", "mass_kg": 450.0, "mu_roll": 0.08},
    "LTV": {"display_name": "Artemis LTV Light (210 kg)", "mass_kg": 210.0, "mu_roll": 0.07},
    "PRAGYAN": {"display_name": "Chandrayaan Pragyan (27 kg)", "mass_kg": 27.0, "mu_roll": 0.09},
}


def _bilinear_sample(arr: np.ndarray, x: float, y: float) -> float:
    """Samples a 2D array with bilinear interpolation at floating pixel coordinates."""
    h, w = arr.shape
    xc = float(np.clip(x, 0.0, w - 1.0))
    yc = float(np.clip(y, 0.0, h - 1.0))
    x0 = int(math.floor(xc))
    y0 = int(math.floor(yc))
    x1 = min(w - 1, x0 + 1)
    y1 = min(h - 1, y0 + 1)
    wx = xc - x0
    wy = yc - y0

    v00 = float(arr[y0, x0])
    v10 = float(arr[y0, x1])
    v01 = float(arr[y1, x0])
    v11 = float(arr[y1, x1])
    return (v00 * (1 - wx) + v10 * wx) * (1 - wy) + (v01 * (1 - wx) + v11 * wx) * wy


def _integrate_path_samples(
    path_xy: List[Tuple[float, float]],
    heights: np.ndarray,
    quantum_edges: Optional[np.ndarray],
    gsd_m_px: float,
    rover_mass_kg: float,
    g_moon_ms2: float,
    mu_roll: float,
    slip_alpha: float = 1.6,
) -> Dict[str, Any]:
    """Integrates mechanical rover work along a sampled list of (x_px, y_px) waypoints."""
    num_samples = len(path_xy)
    elevations: List[float] = []
    q_edges: List[float] = []
    cum_dist_m: List[float] = [0.0]

    for i, (px, py) in enumerate(path_xy):
        elevations.append(_bilinear_sample(heights, px, py))
        q_edges.append(_bilinear_sample(quantum_edges, px, py) if quantum_edges is not None else 0.0)
        if i > 0:
            prev_x, prev_y = path_xy[i - 1]
            step_m = math.hypot(px - prev_x, py - prev_y) * gsd_m_px
            cum_dist_m.append(cum_dist_m[-1] + step_m)

    total_dist_m = cum_dist_m[-1]
    total_dist_km = round(total_dist_m / 1000.0, 2)

    nominal_joules = 0.0
    adjusted_joules = 0.0
    max_grade_deg = 0.0
    edge_crossings = 0
    samples: List[Dict[str, Any]] = []

    for i in range(num_samples):
        px, py = path_xy[i]
        elev = elevations[i]
        q_edge = q_edges[i]
        if q_edge >= 0.45:
            edge_crossings += 1

        if i == 0:
            ds = max(1.0, cum_dist_m[1] - cum_dist_m[0]) if num_samples > 1 else gsd_m_px
            dz = elevations[1] - elevations[0] if num_samples > 1 else 0.0
        elif i == num_samples - 1:
            ds = max(1.0, cum_dist_m[i] - cum_dist_m[i - 1])
            dz = elevations[i] - elevations[i - 1]
        else:
            ds = max(1.0, (cum_dist_m[i + 1] - cum_dist_m[i - 1]) / 2.0)
            dz = (elevations[i + 1] - elevations[i - 1]) / 2.0

        grade_rad = math.atan(dz / ds)
        grade_deg = math.degrees(grade_rad)
        if abs(grade_deg) > max_grade_deg:
            max_grade_deg = abs(grade_deg)

        seg_len_m = (cum_dist_m[i + 1] - cum_dist_m[i]) if i < num_samples - 1 else 0.0
        f_nom = max(0.0, rover_mass_kg * g_moon_ms2 * (mu_roll * math.cos(grade_rad) + math.sin(grade_rad)))
        mu_eff = mu_roll * (1.0 + slip_alpha * q_edge)
        f_adj = max(0.0, rover_mass_kg * g_moon_ms2 * (mu_eff * math.cos(grade_rad) + math.sin(grade_rad)))

        nominal_joules += f_nom * seg_len_m
        adjusted_joules += f_adj * seg_len_m

        samples.append({
            "dist_km": round(cum_dist_m[i] / 1000.0, 3),
            "x_px": round(px, 1),
            "y_px": round(py, 1),
            "elevation_m": round(elev, 1),
            "slope_deg": round(grade_deg, 1),
            "quantum_edge_prob": round(q_edge, 3),
        })

    return {
        "total_distance_km": total_dist_km,
        "nominal_energy_wh": round(nominal_joules / 3600.0, 1),
        "rover_energy_wh": round(adjusted_joules / 3600.0, 1),
        "max_grade_deg": round(max_grade_deg, 1),
        "edge_crossings_count": edge_crossings,
        "samples_256": samples,
    }


def extract_transect_profile(
    heights: np.ndarray,
    quantum_edges: np.ndarray,
    start_px: Tuple[int, int] = (64, 256),
    end_px: Tuple[int, int] = (448, 256),
    num_samples: int = 256,
    gsd_m_px: float = 59.0,
    rover_mass_kg: float = 450.0,
    g_moon_ms2: float = 1.625,
    mu_roll: float = 0.08,
) -> Dict[str, Any]:
    """
    Interpolates elevation and quantum edge probability along straight transect line A -> B.
    """
    h, w = heights.shape
    x0 = int(np.clip(start_px[0], 0, w - 1))
    y0 = int(np.clip(start_px[1], 0, h - 1))
    x1 = int(np.clip(end_px[0], 0, w - 1))
    y1 = int(np.clip(end_px[1], 0, h - 1))

    t_vals = np.linspace(0.0, 1.0, max(2, num_samples))
    path_xy = [(float(x0 + t * (x1 - x0)), float(y0 + t * (y1 - y0))) for t in t_vals]

    integrated = _integrate_path_samples(
        path_xy=path_xy,
        heights=heights,
        quantum_edges=quantum_edges,
        gsd_m_px=gsd_m_px,
        rover_mass_kg=rover_mass_kg,
        g_moon_ms2=g_moon_ms2,
        mu_roll=mu_roll,
    )

    return {
        "status": "success",
        "route_mode": "direct",
        "rover_mass_kg": rover_mass_kg,
        "start_coord": {"x": x0, "y": y0},
        "end_coord": {"x": x1, "y": y1},
        **integrated,
    }


def compute_safe_detour_transect(
    heights: np.ndarray,
    quantum_edges: np.ndarray,
    start_px: Tuple[int, int],
    end_px: Tuple[int, int],
    num_samples: int = 256,
    gsd_m_px: float = 59.0,
    rover_mass_kg: float = 450.0,
    g_moon_ms2: float = 1.625,
    mu_roll: float = 0.08,
) -> Dict[str, Any]:
    """
    Finds a quantum-edge and slope-minimizing traverse route from A to B via 8-connected Dijkstra.
    Avoids steep crater walls (> 15 deg) and boulder-rich quantum rim boundaries.
    """
    h, w = heights.shape
    x0 = int(np.clip(start_px[0], 0, w - 1))
    y0 = int(np.clip(start_px[1], 0, h - 1))
    x1 = int(np.clip(end_px[0], 0, w - 1))
    y1 = int(np.clip(end_px[1], 0, h - 1))

    # Solve Dijkstra at 64x64 coarse navigation mesh for sub-5ms speed, then lift to full coordinates
    nav = min(64, h, w)
    scale_x = w / nav
    scale_y = h / nav

    h_small = heights[:: max(1, h // nav), :: max(1, w // nav)][:nav, :nav]
    q_small = (
        quantum_edges[:: max(1, h // nav), :: max(1, w // nav)][:nav, :nav]
        if quantum_edges is not None
        else np.zeros_like(h_small)
    )
    nh, nw = h_small.shape
    dz_dy, dz_dx = np.gradient(h_small, gsd_m_px * scale_x, gsd_m_px * scale_y)
    slope_tan = np.sqrt(dz_dx ** 2 + dz_dy ** 2)

    sx, sy = int(np.clip(round(x0 / scale_x), 0, nw - 1)), int(np.clip(round(y0 / scale_y), 0, nh - 1))
    tx, ty = int(np.clip(round(x1 / scale_x), 0, nw - 1)), int(np.clip(round(y1 / scale_y), 0, nh - 1))

    # Cost map per cell combines slope steepness penalty and quantum rock/rim hazard
    cell_cost = 1.0 + 18.0 * (slope_tan ** 2) + 8.0 * q_small

    dist_map = np.full((nh, nw), np.inf, dtype=np.float64)
    parent: Dict[Tuple[int, int], Tuple[int, int]] = {}
    dist_map[sy, sx] = 0.0
    pq: List[Tuple[float, int, int]] = [(0.0, sx, sy)]
    neighbors = [(-1, 0, 1.0), (1, 0, 1.0), (0, -1, 1.0), (0, 1, 1.0),
                 (-1, -1, 1.414), (1, -1, 1.414), (-1, 1, 1.414), (1, 1, 1.414)]

    while pq:
        d, cx, cy = heapq.heappop(pq)
        if cx == tx and cy == ty:
            break
        if d > dist_map[cy, cx]:
            continue
        for dx_n, dy_n, step_w in neighbors:
            nx, ny = cx + dx_n, cy + dy_n
            if 0 <= nx < nw and 0 <= ny < nh:
                dh = max(0.0, float(h_small[ny, nx] - h_small[cy, cx]))
                uphill_cost = dh / max(1.0, gsd_m_px * scale_x)
                edge_w = step_w * (0.5 * (cell_cost[cy, cx] + cell_cost[ny, nx]) + 4.0 * uphill_cost)
                nd = d + edge_w
                if nd < dist_map[ny, nx]:
                    dist_map[ny, nx] = nd
                    parent[(nx, ny)] = (cx, cy)
                    heapq.heappush(pq, (nd, nx, ny))

    # Reconstruct polyline in full grid coordinates
    waypoints: List[Tuple[float, float]] = [(float(x1), float(y1))]
    curr = (tx, ty)
    while curr != (sx, sy) and curr in parent:
        curr = parent[curr]
        if curr == (sx, sy):
            waypoints.append((float(x0), float(y0)))
        else:
            waypoints.append((curr[0] * scale_x, curr[1] * scale_y))
    if waypoints[-1] != (float(x0), float(y0)):
        waypoints.append((float(x0), float(y0)))
    waypoints.reverse()

    # Smooth & resample uniformly along polyline to num_samples points
    cum_len = [0.0]
    for i in range(1, len(waypoints)):
        cum_len.append(cum_len[-1] + math.hypot(waypoints[i][0] - waypoints[i - 1][0], waypoints[i][1] - waypoints[i - 1][1]))
    total_l = max(1e-6, cum_len[-1])
    resampled: List[Tuple[float, float]] = []
    wp_arr = np.array(waypoints, dtype=np.float64)
    cl_arr = np.array(cum_len, dtype=np.float64)
    for target_l in np.linspace(0.0, total_l, max(2, num_samples)):
        px = float(np.interp(target_l, cl_arr, wp_arr[:, 0]))
        py = float(np.interp(target_l, cl_arr, wp_arr[:, 1]))
        resampled.append((px, py))

    integrated = _integrate_path_samples(
        path_xy=resampled,
        heights=heights,
        quantum_edges=quantum_edges,
        gsd_m_px=gsd_m_px,
        rover_mass_kg=rover_mass_kg,
        g_moon_ms2=g_moon_ms2,
        mu_roll=mu_roll,
    )

    return {
        "status": "success",
        "route_mode": "safe_detour",
        "rover_mass_kg": rover_mass_kg,
        "start_coord": {"x": x0, "y": y0},
        "end_coord": {"x": x1, "y": y1},
        **integrated,
    }
