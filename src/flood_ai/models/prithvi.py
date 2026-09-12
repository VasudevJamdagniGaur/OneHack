"""Load the published Prithvi Sen1Floods11 flood segmenter.

The requested call is:

    from terratorch.registry import BACKBONE_REGISTRY
    model = BACKBONE_REGISTRY.build("ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL-Sen1Floods11")

That Hugging Face id is the fine-tuned flood model, not a TerraTorch backbone
key. BACKBONE_REGISTRY only knows names such as ``prithvi_eo_v2_300_tl``.
We still try the requested id first. Flood detection then uses the published
segmentation checkpoint from the same repository.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from flood_ai.config import project_root

MODEL_ID = "ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL-Sen1Floods11"
BACKBONE_NAME = "prithvi_eo_v2_300_tl"
BANDS = ("BLUE", "GREEN", "RED", "NIR_NARROW", "SWIR_1", "SWIR_2")
HF_BASE = f"https://huggingface.co/{MODEL_ID}/resolve/main"


class PrithviNotReadyError(RuntimeError):
    """Raised when the flood detector cannot be loaded or run."""


def model_id(config: dict[str, Any] | None = None) -> str:
    if config and "prithvi" in config:
        return str(config["prithvi"]["model_id"])
    return MODEL_ID


def weights_dir(config: dict[str, Any]) -> Path:
    relative = Path(config["prithvi"]["weights_dir"])
    path = relative if relative.is_absolute() else project_root() / relative
    path.mkdir(parents=True, exist_ok=True)
    return path


def build_requested_backbone(model_name: str | None = None):
    """Call TerraTorch with the requested Hugging Face id.

    TerraTorch 1.2 rejects a bare ``org/name`` id and tells you to prefix
    ``hf-hub:``. That prefix is routed to timm, which cannot load this
    TerraTorch flood checkpoint. Both attempts are recorded by
    ``load_flood_detector``.
    """
    from terratorch.registry import BACKBONE_REGISTRY

    return BACKBONE_REGISTRY.build(model_name or MODEL_ID)


def build_prithvi_backbone():
    """Build the Prithvi-EO-2.0-300M-TL backbone the flood head sits on."""
    from terratorch.registry import BACKBONE_REGISTRY

    return BACKBONE_REGISTRY.build(
        BACKBONE_NAME,
        pretrained=False,
        bands=list(BANDS),
        num_frames=1,
    )


def load_flood_detector(config: dict[str, Any]):
    """Load the Sen1Floods11 flood segmenter for event imagery.

    Returns a dict with the requested registry result (if any), the detection
    model, and how it was loaded. Detection always uses the fine-tuned task
    when the Hugging Face id is not itself a segmentation model.
    """
    requested_id = model_id(config)
    registry_model, registry_name, registry_errors = _try_registry(requested_id)
    checkpoint, model_config = _require_local_assets(config)
    detector = _load_finetuned_task(model_config, checkpoint)
    return {
        "model_id": requested_id,
        "registry_model": registry_model,
        "registry_name": registry_name,
        "registry_error": None if not registry_errors else " | ".join(registry_errors),
        "detector": detector,
        "source": "finetuned_checkpoint" if registry_model is None else registry_name,
        "checkpoint": checkpoint,
    }


def ensure_assets(config: dict[str, Any], download_checkpoint: bool = True) -> dict[str, Path]:
    """Download config.yaml and, optionally, the ~1 GB flood checkpoint."""
    folder = weights_dir(config)
    config_path = folder / config["prithvi"]["model_config"]
    checkpoint_path = folder / config["prithvi"]["checkpoint"]
    _download(f"{HF_BASE}/config.yaml", config_path)
    if download_checkpoint:
        _download(f"{HF_BASE}/{config['prithvi']['checkpoint']}", checkpoint_path)
    return {"config": config_path, "checkpoint": checkpoint_path}


def asset_status(config: dict[str, Any]) -> dict[str, Any]:
    folder = weights_dir(config)
    checkpoint = folder / config["prithvi"]["checkpoint"]
    model_config = folder / config["prithvi"]["model_config"]
    scene = config["prithvi"].get("scene")
    return {
        "model_id": model_id(config),
        "backbone": config["prithvi"].get("backbone", BACKBONE_NAME),
        "role": config["prithvi"].get("role", "event_flood_extent"),
        "config_present": model_config.exists(),
        "checkpoint_present": checkpoint.exists(),
        "scene": scene,
        "scene_present": bool(scene) and Path(scene).exists(),
        "ready": checkpoint.exists() and model_config.exists() and bool(scene) and Path(scene).exists(),
    }


def _require_local_assets(config: dict[str, Any]) -> tuple[Path, Path]:
    status = asset_status(config)
    folder = weights_dir(config)
    if not status["checkpoint_present"] or not status["config_present"]:
        raise PrithviNotReadyError(
            "Prithvi flood weights are not downloaded. Run: "
            "python scripts/run_prithvi_flood.py --download"
        )
    return folder / config["prithvi"]["checkpoint"], folder / config["prithvi"]["model_config"]


def _try_registry(requested_id: str):
    errors: list[str] = []
    for name in (requested_id, f"hf-hub:{requested_id}"):
        try:
            return build_requested_backbone(name), name, errors
        except Exception as exc:
            errors.append(f"{name}: {type(exc).__name__}: {exc}")
    return None, None, errors


def _load_finetuned_task(config_path: Path, checkpoint: Path):
    try:
        from terratorch.cli_tools import LightningInferenceModel
    except ImportError as exc:
        raise PrithviNotReadyError(
            "terratorch is not installed. Run: pip install -r requirements-prithvi.txt"
        ) from exc

    local_config = _config_with_local_data_root(config_path)
    return LightningInferenceModel.from_config(str(local_config), str(checkpoint))


def _config_with_local_data_root(config_path: Path) -> Path:
    """Point the published IBM cluster data path at a local folder."""
    import yaml

    with config_path.open(encoding="utf-8") as handle:
        payload = yaml.safe_load(handle)
    data_root = config_path.parent / "sen1floods11"
    data_root.mkdir(parents=True, exist_ok=True)
    try:
        payload["data"]["init_args"]["data_root"] = str(data_root)
    except (KeyError, TypeError):
        return config_path
    local = config_path.with_name("config.local.yaml")
    with local.open("w", encoding="utf-8") as handle:
        yaml.safe_dump(payload, handle)
    return local


def _download(url: str, destination: Path) -> None:
    if destination.exists() and destination.stat().st_size > 0:
        return
    destination.parent.mkdir(parents=True, exist_ok=True)
    try:
        from huggingface_hub import hf_hub_download
    except ImportError:
        _download_urllib(url, destination)
        return

    import shutil

    filename = destination.name
    cached = Path(hf_hub_download(repo_id=MODEL_ID, filename=filename))
    if cached.resolve() != destination.resolve():
        shutil.copy2(cached, destination)


def _download_urllib(url: str, destination: Path) -> None:
    import urllib.request

    tmp = destination.with_suffix(destination.suffix + ".partial")
    urllib.request.urlretrieve(url, tmp)
    tmp.replace(destination)
