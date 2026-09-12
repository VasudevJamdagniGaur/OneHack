import numpy as np
import pytest

from flood_ai.data.ingest import RealDataNotAvailableError, load_flood_extent, load_region_stack
from flood_ai.evaluation.validate import daily_mean_risk, risk_increases_before_event
from flood_ai.features.risk_features import FEATURE_NAMES, build_feature_cube
from flood_ai.inference.predict import predict_risk_cube
from flood_ai.pipeline import run_sample_pipeline
from flood_ai.preprocessing.align import passthrough_aligned_stack
from flood_ai.training.baseline import train_baseline


def test_sample_stack_has_expected_shapes(config):
    stack = load_region_stack(config)
    rows, cols = config["grid"]["sample_rows"], config["grid"]["sample_cols"]
    days = config["temporal"]["sample_days"]

    assert stack["synthetic"] is True
    assert stack["elevation"].shape == (rows, cols)
    assert stack["daily_precip"].shape == (days, rows, cols)
    assert stack["actual_flood"].shape == (rows, cols)
    assert stack["actual_flood"].sum() > 0


def test_alignment_rejects_broken_stack(config):
    stack = load_region_stack(config)
    stack["daily_precip"] = stack["daily_precip"][:, :10, :10]
    with pytest.raises(ValueError, match="Precipitation cube"):
        passthrough_aligned_stack(stack)


def test_real_ingest_is_explicitly_unavailable(config):
    with pytest.raises(RealDataNotAvailableError):
        load_flood_extent(config)


def test_training_is_blocked(config):
    with pytest.raises(RuntimeError, match="No model is trained"):
        train_baseline(config)


def test_risk_scores_are_in_unit_interval(config):
    stack = passthrough_aligned_stack(load_region_stack(config))
    risk = predict_risk_cube(build_feature_cube(stack), config)
    assert set(build_feature_cube(stack)).issuperset(FEATURE_NAMES)
    assert risk.min() >= 0.0
    assert risk.max() <= 1.0


def test_mean_risk_rises_before_analog_peak(config):
    stack = passthrough_aligned_stack(load_region_stack(config))
    risk = predict_risk_cube(build_feature_cube(stack), config)
    daily = daily_mean_risk(risk)
    assert risk_increases_before_event(daily, stack["peak_day_index"])


def test_pipeline_writes_outputs(config):
    result = run_sample_pipeline(config)
    assert result["rising"] is True
    assert result["comparison"]["mean_risk_inside_flood"] > result["comparison"][
        "mean_risk_outside_flood"
    ]
    for path in result["outputs"].values():
        assert path.exists()
    grid_header = result["outputs"]["grid_cells"].read_text(encoding="utf-8").splitlines()[0]
    assert "flood_risk" in grid_header
    assert "lat" in grid_header
    assert "lon" in grid_header
