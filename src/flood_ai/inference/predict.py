"""Expert-weighted spatial flood-risk scores. Not a trained model."""

from __future__ import annotations

from typing import Any

import numpy as np

from flood_ai.features.risk_features import FEATURE_NAMES


def _unit(values: np.ndarray, scale: float) -> np.ndarray:
    return np.clip(values / scale, 0.0, 1.0)


def expert_risk_from_arrays(
    precip_3d: np.ndarray,
    precip_7d: np.ndarray,
    hand: np.ndarray,
    slope: np.ndarray,
    dist_to_river: np.ndarray,
    config: dict[str, Any],
) -> np.ndarray:
    weights = config["model"]["weights"]
    scaling = config["model"]["scaling"]

    p3 = _unit(precip_3d, float(scaling["precip_3d_mm"]))
    p7 = _unit(precip_7d, float(scaling["precip_7d_mm"]))
    low_hand = _unit(float(scaling["hand_m"]) - hand, float(scaling["hand_m"]))
    flat = _unit(float(scaling["slope_deg"]) - slope, float(scaling["slope_deg"]))
    near = _unit(
        float(scaling["dist_to_river_m"]) - dist_to_river,
        float(scaling["dist_to_river_m"]),
    )

    risk = (
        float(weights["precip_3d"]) * p3
        + float(weights["precip_7d"]) * p7
        + float(weights["hand"]) * low_hand
        + float(weights["slope"]) * flat
        + float(weights["dist_to_river"]) * near
    )
    return np.clip(risk, 0.0, 1.0)


def predict_risk_cube(
    features: dict[str, np.ndarray],
    config: dict[str, Any],
) -> np.ndarray:
    missing = [name for name in FEATURE_NAMES if name not in features]
    if missing:
        raise ValueError(f"Missing features for inference: {missing}")

    return expert_risk_from_arrays(
        features["precip_3d"],
        features["precip_7d"],
        features["hand"],
        features["slope"],
        features["dist_to_river"],
        config,
    )


def classify_risk(risk: np.ndarray, config: dict[str, Any]) -> np.ndarray:
    thresholds = config["risk_thresholds"]
    labels = np.full(risk.shape, "low", dtype=object)
    labels[risk >= float(thresholds["low"])] = "moderate"
    labels[risk >= float(thresholds["moderate"])] = "high"
    labels[risk >= float(thresholds["critical"])] = "critical"
    return labels
