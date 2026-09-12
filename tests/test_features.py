import numpy as np

from flood_ai.features.risk_features import accumulate_precip, build_feature_cube
from flood_ai.data.ingest import load_region_stack


def test_precip_accumulation_matches_manual_window():
    daily = np.arange(12, dtype=float).reshape(3, 2, 2)
    three = accumulate_precip(daily, 3)
    assert three[0].tolist() == daily[0].tolist()
    assert three[2].tolist() == (daily[0] + daily[1] + daily[2]).tolist()


def test_feature_cube_static_layers_repeat(config):
    stack = load_region_stack(config)
    cube = build_feature_cube(stack)
    assert np.allclose(cube["hand"][0], cube["hand"][-1])
    assert cube["precip_1d"].shape[0] == stack["n_days"]
