import sys
import types

import numpy as np
import pytest

from flood_ai.inference.prithvi_flood import detection_status, prepare_sentinel2
from flood_ai.models.prithvi import MODEL_ID, build_requested_backbone


def test_config_points_at_prithvi_flood_model(config):
    assert config["prithvi"]["enabled"] is True
    assert config["prithvi"]["model_id"] == MODEL_ID
    assert config["prithvi"]["role"] == "event_flood_extent"
    assert config["prithvi"]["bands"] == [
        "BLUE",
        "GREEN",
        "RED",
        "NIR_NARROW",
        "SWIR_1",
        "SWIR_2",
    ]


def test_prepare_scales_reflectance_and_selects_s2_bands():
    image = np.zeros((13, 8, 8), dtype=np.float32)
    image[1] = 5000
    image[12] = 2000
    chip = prepare_sentinel2(image, band_indices=[1, 2, 3, 8, 11, 12])
    assert chip.shape == (6, 8, 8)
    assert chip[0, 0, 0] == pytest.approx(0.5)
    assert chip[-1, 0, 0] == pytest.approx(0.2)


def test_sen1floods_normalization_centers_training_means():
    from flood_ai.inference.prithvi_flood import BAND_MEANS, normalize_sen1floods

    chip = np.broadcast_to(BAND_MEANS[:, None, None], (6, 2, 2)).copy()
    normalized = normalize_sen1floods(chip)
    assert normalized.shape == (6, 2, 2)
    assert np.allclose(normalized, 0.0)


def test_prepare_keeps_six_band_chip():
    chip = np.ones((6, 4, 4), dtype=np.float32) * 0.2
    out = prepare_sentinel2(chip)
    assert out.shape == (6, 4, 4)
    assert out.max() == pytest.approx(0.2)


def test_registry_build_uses_the_requested_model_id(monkeypatch):
    calls = []

    class FakeRegistry:
        def build(self, name):
            calls.append(name)
            return {"name": name}

    registry = types.ModuleType("terratorch.registry")
    registry.BACKBONE_REGISTRY = FakeRegistry()
    package = types.ModuleType("terratorch")
    monkeypatch.setitem(sys.modules, "terratorch", package)
    monkeypatch.setitem(sys.modules, "terratorch.registry", registry)

    model = build_requested_backbone(MODEL_ID)
    assert calls == [MODEL_ID]
    assert model["name"] == MODEL_ID


def test_detector_status_does_not_claim_it_ran(config):
    status = detection_status(config)
    assert status["model_id"] == MODEL_ID
    assert status["not_an_earthquake_model"] is True
    assert status["ready"] is False
    assert "not downloaded" in status["message"] or "Sentinel-2" in status["message"]
