"""Compare predicted risk with a flood mask. No accuracy theatre."""

from __future__ import annotations

from typing import Any

import numpy as np


def daily_mean_risk(risk_cube: np.ndarray) -> np.ndarray:
    return risk_cube.reshape(risk_cube.shape[0], -1).mean(axis=1)


def risk_increases_before_event(
    daily_means: np.ndarray,
    peak_day_index: int,
    min_days: int = 3,
) -> bool:
    if peak_day_index < min_days:
        raise ValueError("Need at least three pre-peak days to test a rising curve")
    early = daily_means[: min_days - 1].mean()
    late = daily_means[peak_day_index - 1]
    return bool(late > early)


def compare_with_flood(
    risk: np.ndarray,
    flood_mask: np.ndarray,
    high_threshold: float,
) -> dict[str, float]:
    flood = flood_mask.astype(bool)
    high = risk >= high_threshold
    inside = risk[flood]
    outside = risk[~flood]

    overlap = np.logical_and(high, flood).sum()
    return {
        "n_flood_cells": float(flood.sum()),
        "n_high_risk_cells": float(high.sum()),
        "n_overlap_cells": float(overlap),
        "mean_risk_inside_flood": float(inside.mean()) if inside.size else 0.0,
        "mean_risk_outside_flood": float(outside.mean()) if outside.size else 0.0,
    }


def high_risk_area_km2(
    risk: np.ndarray,
    high_threshold: float,
    cell_width_m: float,
    cell_height_m: float,
) -> float:
    cell_km2 = (cell_width_m * cell_height_m) / 1_000_000.0
    return float((risk >= high_threshold).sum() * cell_km2)


def class_counts(labels: np.ndarray) -> dict[str, int]:
    counts = {"low": 0, "moderate": 0, "high": 0, "critical": 0}
    unique, freqs = np.unique(labels.astype(str), return_counts=True)
    for name, freq in zip(unique, freqs):
        counts[name] = int(freq)
    return counts
