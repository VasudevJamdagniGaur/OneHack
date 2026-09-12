"""Phase 1 sample pipeline: ingest → features → risk → validate → figures."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from flood_ai.config import load_config, resolve_path
from flood_ai.data.ingest import load_region_stack
from flood_ai.evaluation.validate import (
    class_counts,
    compare_with_flood,
    daily_mean_risk,
    high_risk_area_km2,
    risk_increases_before_event,
)
from flood_ai.features.risk_features import build_feature_cube, flatten_day
from flood_ai.inference.predict import classify_risk, predict_risk_cube
from flood_ai.inference.prithvi_flood import detect_flood_scene, detection_status
from flood_ai.preprocessing.align import passthrough_aligned_stack
from flood_ai.visualization.risk_map import save_comparison, save_heatmap, save_timeseries


def run_sample_pipeline(config: dict[str, Any] | None = None) -> dict[str, Any]:
    config = config or load_config()
    if config["project"]["data_mode"] != "sample":
        raise ValueError("run_sample_pipeline requires project.data_mode: sample")

    stack = passthrough_aligned_stack(load_region_stack(config))
    features = build_feature_cube(stack)
    risk_cube = predict_risk_cube(features, config)

    peak_day = int(stack["peak_day_index"])
    prediction_day = max(0, peak_day - 1)
    risk = risk_cube[prediction_day]
    labels = classify_risk(risk, config)
    daily_means = daily_mean_risk(risk_cube)
    rising = risk_increases_before_event(daily_means, peak_day)

    high_threshold = float(config["risk_thresholds"]["moderate"])
    comparison = compare_with_flood(risk, stack["actual_flood"], high_threshold)
    area_km2 = high_risk_area_km2(
        risk,
        high_threshold,
        float(stack["cell_width_m"]),
        float(stack["cell_height_m"]),
    )
    counts = class_counts(labels)

    samples_dir = resolve_path(config, "samples_dir")
    samples_dir.mkdir(parents=True, exist_ok=True)

    table = flatten_day(stack, features, prediction_day)
    frame = pd.DataFrame(table)
    frame["flood_risk"] = risk.ravel()
    frame["risk_class"] = labels.ravel()
    frame["synthetic"] = True
    frame.to_csv(samples_dir / "grid_cells.csv", index=False)

    summary = pd.DataFrame(
        {
            "sample_day": range(1, stack["n_days"] + 1),
            "mean_risk": daily_means,
            "is_prediction_day": [i == prediction_day for i in range(stack["n_days"])],
            "is_analog_peak_day": [i == peak_day for i in range(stack["n_days"])],
        }
    )
    summary.to_csv(samples_dir / "daily_risk_summary.csv", index=False)

    save_timeseries(daily_means, peak_day, samples_dir / "risk_timeseries.png")
    save_heatmap(
        risk,
        stack["lons"],
        stack["lats"],
        samples_dir / "risk_heatmap.png",
        "SYNTHETIC SAMPLE DATA - flood risk on analog 13 July",
    )
    save_comparison(
        risk,
        stack["actual_flood"],
        stack["lons"],
        stack["lats"],
        high_threshold,
        samples_dir / "prediction_vs_actual.png",
    )

    prithvi = detection_status(config)
    if prithvi["ready"]:
        detection = detect_flood_scene(config)
        mask_path = samples_dir / "prithvi_flood_mask.npy"
        np.save(mask_path, detection["mask"])
        prithvi["flood_fraction"] = detection["flood_fraction"]
        prithvi["ran"] = True
    else:
        prithvi["ran"] = False

    return {
        "config": config,
        "stack": stack,
        "risk_cube": risk_cube,
        "prediction_day": prediction_day,
        "daily_means": daily_means,
        "rising": rising,
        "comparison": comparison,
        "high_risk_area_km2": area_km2,
        "class_counts": counts,
        "prithvi": prithvi,
        "outputs": {
            "grid_cells": samples_dir / "grid_cells.csv",
            "daily_summary": samples_dir / "daily_risk_summary.csv",
            "timeseries": samples_dir / "risk_timeseries.png",
            "heatmap": samples_dir / "risk_heatmap.png",
            "comparison": samples_dir / "prediction_vs_actual.png",
        },
    }


def format_dashboard_text(result: dict[str, Any]) -> str:
    config = result["config"]
    counts = result["class_counts"]
    comparison = result["comparison"]
    bar = {
        "critical": "#" * max(1, counts["critical"] // 40),
        "high": "#" * max(1, counts["high"] // 40),
        "moderate": "#" * max(1, counts["moderate"] // 40),
        "low": "#" * max(1, counts["low"] // 40),
    }
    return f"""
============================================================
SATELLITE FLOOD EARLY WARNING
============================================================
DATA: {config['sample']['labeled']}
MODE: {config['project']['mode']}  (not a live satellite feed)
MODEL: {config['model']['type']}  trained={config['model']['trained']}
FLOOD DETECTOR: {result['prithvi']['model_id']}
Detector status: {result['prithvi']['message']}

Region:            {config['region']['name']}, {config['region']['country']}
Historical Event:  {config['event']['name']}
Prediction Date:   {config['temporal']['prediction_date']} (sample analog)
Validation Date:   {config['temporal']['validation_date']} (official map date)

Overall High-Risk Area: {result['high_risk_area_km2']:.2f} km^2  (synthetic cells)

CRITICAL  {bar['critical']}  {counts['critical']} cells
HIGH      {bar['high']}  {counts['high']} cells
MODERATE  {bar['moderate']}  {counts['moderate']} cells
LOW       {bar['low']}  {counts['low']} cells

Mean risk inside flood mask:  {comparison['mean_risk_inside_flood']:.3f}
Mean risk outside flood mask: {comparison['mean_risk_outside_flood']:.3f}
Overlap cells (high AND flood): {int(comparison['n_overlap_cells'])}
Risk rises before analog peak: {result['rising']}

Lag note: CHIRPS final archive is delayed ~3 weeks. A live prototype
would use CHIRPS prelim or IMERG Late (hours to ~2 days). DEM is static.
The EMS flood map is validation, not a model input.
============================================================
""".strip()
