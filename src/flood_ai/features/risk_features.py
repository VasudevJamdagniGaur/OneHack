"""Build per-cell, per-day feature cubes for the risk model."""

from __future__ import annotations

from typing import Any

import numpy as np


FEATURE_NAMES = (
    "precip_1d",
    "precip_3d",
    "precip_7d",
    "elevation",
    "slope",
    "hand",
    "dist_to_river",
)


def accumulate_precip(daily_precip: np.ndarray, window: int) -> np.ndarray:
    n_days = daily_precip.shape[0]
    out = np.zeros_like(daily_precip)
    for day in range(n_days):
        start = max(0, day - window + 1)
        out[day] = daily_precip[start : day + 1].sum(axis=0)
    return out


def build_feature_cube(stack: dict[str, Any]) -> dict[str, np.ndarray]:
    daily = stack["daily_precip"]
    n_days, rows, cols = daily.shape
    ones = np.ones((n_days, rows, cols), dtype=float)

    return {
        "precip_1d": daily,
        "precip_3d": accumulate_precip(daily, 3),
        "precip_7d": accumulate_precip(daily, 7),
        "elevation": ones * stack["elevation"],
        "slope": ones * stack["slope"],
        "hand": ones * stack["hand"],
        "dist_to_river": ones * stack["dist_to_river"],
    }


def flatten_day(
    stack: dict[str, Any],
    features: dict[str, np.ndarray],
    day_index: int,
) -> dict[str, np.ndarray]:
    return {
        "lat": stack["lat_grid"].ravel(),
        "lon": stack["lon_grid"].ravel(),
        **{name: features[name][day_index].ravel() for name in FEATURE_NAMES},
        "actual_flood": stack["actual_flood"].ravel(),
    }
