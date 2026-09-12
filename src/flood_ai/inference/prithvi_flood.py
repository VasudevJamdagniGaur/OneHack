"""Flood-extent detection with Prithvi-EO-2.0-300M-TL-Sen1Floods11.

This maps water that is already visible on a Sentinel-2 scene. It does not
forecast the flood, and it does not detect earthquakes.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np

from flood_ai.models.prithvi import (
    BANDS,
    MODEL_ID,
    PrithviNotReadyError,
    asset_status,
    load_flood_detector,
)

NO_DATA = -9999
REFLECTANCE_SCALE = 10000.0
# Matches terratorch Sen1Floods11NonGeoDataModule for the six Prithvi bands.
BAND_MEANS = np.array(
    [0.1412956, 0.13795798, 0.12353792, 0.30902815, 0.2044958, 0.11912015],
    dtype=np.float32,
)
BAND_STDS = np.array(
    [0.07406382, 0.07370365, 0.08692279, 0.11798815, 0.09772074, 0.07659938],
    dtype=np.float32,
)


def prepare_sentinel2(image: np.ndarray, band_indices: list[int] | None = None) -> np.ndarray:
    """Return a float32 chip with shape (6, H, W), reflectance in ~[0, 1].

    Accepts (bands, H, W) or (H, W, bands). If more than six bands are present,
    ``band_indices`` selects the Prithvi channels (default: Sentinel-2 L1C).
    """
    array = np.asarray(image)
    if array.ndim != 3:
        raise ValueError(f"Expected a 3D image, got shape {array.shape}")

    if array.shape[-1] in (6, 13) and array.shape[0] not in (6, 13):
        array = np.moveaxis(array, -1, 0)

    if band_indices is not None and array.shape[0] != 6:
        array = array[list(band_indices)]
    if array.shape[0] != 6:
        raise ValueError(
            f"Prithvi flood detection needs 6 bands {BANDS}, got {array.shape[0]}"
        )

    chip = array.astype(np.float32)
    valid = chip != NO_DATA
    if np.nanmean(np.where(valid, chip, np.nan)) > 1.5:
        chip = np.where(valid, chip / REFLECTANCE_SCALE, 0.0)
    else:
        chip = np.where(valid, chip, 0.0)
    return chip


def detect_flood(image: np.ndarray, config: dict[str, Any]) -> dict[str, Any]:
    """Run the published flood segmenter. Class 1 is water/flood."""
    chip = prepare_sentinel2(
        image,
        band_indices=config["prithvi"].get("s2l1c_band_indices"),
    )
    loaded = load_flood_detector(config)
    chip = normalize_sen1floods(chip, loaded["detector"])
    probabilities = _predict_flood_probability(loaded["detector"], chip, config)
    flood_class = int(config["prithvi"].get("flood_class", 1))
    mask = (probabilities >= 0.5).astype(np.uint8)
    return {
        "model_id": loaded["model_id"],
        "source": loaded["source"],
        "registry_error": loaded["registry_error"],
        "flood_class": flood_class,
        "probability": probabilities,
        "mask": mask,
        "flood_fraction": float(mask.mean()),
        "label": "Prithvi flood extent (water present in this scene, not a forecast)",
    }


def detect_flood_scene(config: dict[str, Any]) -> dict[str, Any]:
    """Detect flood water on the configured historical-event Sentinel-2 scene."""
    scene = config["prithvi"].get("scene")
    if not scene or not Path(scene).exists():
        raise PrithviNotReadyError(
            "No Sentinel-2 scene is configured. Set prithvi.scene to a GeoTIFF "
            "from the historical flood event."
        )
    image, _meta = _read_scene(Path(scene))
    result = detect_flood(image, config)
    result["scene"] = str(scene)
    return result


def normalize_sen1floods(chip: np.ndarray, detector: Any | None = None) -> np.ndarray:
    """Apply the Sen1Floods11 mean/std the flood head was trained with."""
    datamodule = getattr(detector, "datamodule", None)
    aug = getattr(datamodule, "aug", None)
    if aug is not None:
        import torch

        try:
            tensor = torch.from_numpy(np.ascontiguousarray(chip)).unsqueeze(0)
            normalized = aug(tensor, data_keys=["input"])
            if isinstance(normalized, dict):
                normalized = normalized.get("image", normalized.get("input"))
            return normalized.squeeze(0).detach().cpu().numpy()
        except (TypeError, ValueError):
            pass

    means = BAND_MEANS[:, None, None]
    stds = BAND_STDS[:, None, None]
    return (chip - means) / stds


def detection_status(config: dict[str, Any]) -> dict[str, Any]:
    status = asset_status(config)
    status["enabled"] = bool(config.get("prithvi", {}).get("enabled", False))
    status["hazard"] = "flood"
    status["not_an_earthquake_model"] = True
    if not status["enabled"]:
        status["message"] = "Prithvi flood detector is disabled in config.yaml"
    elif not status["checkpoint_present"]:
        status["message"] = (
            f"{MODEL_ID} is configured but weights are not downloaded. "
            "Run: python scripts/run_prithvi_flood.py --download"
        )
    elif not status["scene_present"]:
        status["message"] = (
            "Weights ready. Set prithvi.scene to a Sentinel-2 GeoTIFF of the "
            "historical flood to run detection."
        )
    else:
        status["message"] = "Ready to detect flood water on the configured scene."
    return status


def _predict_flood_probability(detector: Any, chip: np.ndarray, config: dict[str, Any]) -> np.ndarray:
    import torch

    tile = int(config["prithvi"].get("tile_size", 224))
    model = getattr(detector, "model", detector)
    model.eval()
    device = next(model.parameters()).device

    height, width = chip.shape[-2:]
    pad_h = (tile - (height % tile)) % tile
    pad_w = (tile - (width % tile)) % tile
    padded = np.pad(chip, ((0, 0), (0, pad_h), (0, pad_w)), mode="reflect")
    votes = np.zeros(padded.shape[-2:], dtype=np.float32)
    counts = np.zeros(padded.shape[-2:], dtype=np.float32)

    with torch.no_grad():
        for row in range(0, padded.shape[1], tile):
            for col in range(0, padded.shape[2], tile):
                window = padded[:, row : row + tile, col : col + tile]
                tensor = torch.from_numpy(window).unsqueeze(0).unsqueeze(2).to(device)
                logits = _forward_logits(model, tensor)
                if logits.shape[-2:] != (tile, tile):
                    logits = torch.nn.functional.interpolate(
                        logits, size=(tile, tile), mode="bilinear", align_corners=False
                    )
                probability = torch.softmax(logits, dim=1)[0, 1].detach().cpu().numpy()
                votes[row : row + tile, col : col + tile] += probability
                counts[row : row + tile, col : col + tile] += 1.0

    averaged = votes / np.maximum(counts, 1.0)
    return averaged[:height, :width]


def _forward_logits(model: Any, tensor):
    try:
        output = model(tensor)
    except TypeError:
        output = model(tensor, temporal_coords=None, location_coords=None)
    if hasattr(output, "output"):
        return output.output
    if isinstance(output, dict) and "output" in output:
        return output["output"]
    return output


def _read_scene(path: Path):
    try:
        import rasterio
    except ImportError as exc:
        raise PrithviNotReadyError(
            "rasterio is required to read a Sentinel-2 GeoTIFF. "
            "Install requirements-prithvi.txt"
        ) from exc

    with rasterio.open(path) as src:
        return src.read(), src.meta
