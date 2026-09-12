"""Align feature layers onto a common lat/lon grid.

The sample path already shares one grid. This module exists so the real
raster pipeline can replace `passthrough_aligned_stack` without changing callers.
"""

from __future__ import annotations

from typing import Any


REQUIRED_STACK_KEYS = (
    "lat_grid",
    "lon_grid",
    "elevation",
    "hand",
    "slope",
    "dist_to_river",
    "daily_precip",
    "actual_flood",
)


def passthrough_aligned_stack(stack: dict[str, Any]) -> dict[str, Any]:
    missing = [key for key in REQUIRED_STACK_KEYS if key not in stack]
    if missing:
        raise ValueError(f"Region stack missing keys: {missing}")

    rows, cols = stack["lat_grid"].shape
    if stack["daily_precip"].shape[1:] != (rows, cols):
        raise ValueError("Precipitation cube is not on the same grid as lat/lon")
    if stack["actual_flood"].shape != (rows, cols):
        raise ValueError("Flood mask is not on the same grid as lat/lon")

    aligned = dict(stack)
    aligned["aligned"] = True
    return aligned
