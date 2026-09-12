"""Synthetic Ahr-like valley used only until real rasters are confirmed.

Everything produced here must be labeled SYNTHETIC SAMPLE DATA.
"""

from __future__ import annotations

from typing import Any

import numpy as np


def generate_synthetic_region(config: dict[str, Any]) -> dict[str, Any]:
    """Build a toy valley: high ridges, a west-east river, rising rainfall."""
    seed = int(config["sample"]["seed"])
    rng = np.random.default_rng(seed)

    rows = int(config["grid"]["sample_rows"])
    cols = int(config["grid"]["sample_cols"])
    n_days = int(config["temporal"]["sample_days"])
    bbox = config["region"]["bbox"]

    lats = np.linspace(bbox["max_lat"], bbox["min_lat"], rows)
    lons = np.linspace(bbox["min_lon"], bbox["max_lon"], cols)
    lon_grid, lat_grid = np.meshgrid(lons, lats)

    # Valley corridor along a slightly meandering river near mid-latitude of the box.
    lat_span = bbox["max_lat"] - bbox["min_lat"]
    lon_span = bbox["max_lon"] - bbox["min_lon"]
    river_lat = bbox["min_lat"] + 0.45 * lat_span
    meander = 0.04 * lat_span * np.sin((lon_grid - bbox["min_lon"]) / lon_span * 2 * np.pi)
    river_line = river_lat + meander

    # Approximate metres per degree at ~50.5N for sample distances only.
    metres_per_deg_lat = 111_000.0
    metres_per_deg_lon = 71_000.0
    dist_to_river = np.abs(lat_grid - river_line) * metres_per_deg_lat

    ridge = ((lat_grid - river_line) / (0.5 * lat_span)) ** 2
    elevation = 80.0 + 280.0 * ridge + rng.normal(0.0, 4.0, size=(rows, cols))
    river_elevation = 80.0
    hand = np.clip(elevation - river_elevation, 0.0, None)

    d_elev_y, d_elev_x = np.gradient(elevation)
    cell_m = float(config["grid"]["resolution_m"])
    slope = np.degrees(np.arctan(np.hypot(d_elev_x, d_elev_y) / cell_m))

    # Rain builds for several days, then a pulse on the analog peak eve/day.
    daily_precip = np.zeros((n_days, rows, cols), dtype=float)
    base_field = 0.7 + 0.3 * np.exp(-dist_to_river / 8000.0)
    for day in range(n_days):
        if day < 3:
            amount = 4.0 + 3.0 * day
        elif day < 5:
            amount = 18.0 + 10.0 * (day - 3)
        else:
            amount = 55.0 + 15.0 * (day - 5)
        noise = rng.normal(0.0, 1.5, size=(rows, cols))
        daily_precip[day] = np.clip(amount * base_field + noise, 0.0, None)

    peak_day = int(config["sample"]["analog_peak_day_index"])
    precip_3d = _rolling_sum(daily_precip, 3)
    flooded = (
        (hand < 28.0)
        & (dist_to_river < 1800.0)
        & (precip_3d[peak_day] > 70.0)
    )

    return {
        "synthetic": True,
        "label": config["sample"]["labeled"],
        "rows": rows,
        "cols": cols,
        "n_days": n_days,
        "lats": lats,
        "lons": lons,
        "lat_grid": lat_grid,
        "lon_grid": lon_grid,
        "elevation": elevation,
        "hand": hand,
        "slope": slope,
        "dist_to_river": dist_to_river,
        "daily_precip": daily_precip,
        "actual_flood": flooded.astype(np.uint8),
        "cell_width_m": cell_m,
        "cell_height_m": cell_m,
        "metres_per_deg_lon": metres_per_deg_lon,
        "peak_day_index": peak_day,
    }


def _rolling_sum(daily: np.ndarray, window: int) -> np.ndarray:
    n_days, rows, cols = daily.shape
    out = np.zeros_like(daily)
    for day in range(n_days):
        start = max(0, day - window + 1)
        out[day] = daily[start : day + 1].sum(axis=0)
    return out
