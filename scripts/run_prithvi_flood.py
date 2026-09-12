"""Download and run Prithvi-EO-2.0-300M-TL-Sen1Floods11 flood detection.

This detects water on a Sentinel-2 scene from the historical flood.
It does not detect earthquakes and it is not a live satellite feed.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from flood_ai.config import load_config, resolve_path
from flood_ai.inference.prithvi_flood import detect_flood_scene, detection_status
from flood_ai.models.prithvi import MODEL_ID, PrithviNotReadyError, ensure_assets


def main() -> None:
    parser = argparse.ArgumentParser(description="Prithvi flood-extent detection")
    parser.add_argument("--download", action="store_true", help="Download config and checkpoint")
    parser.add_argument("--scene", type=str, default=None, help="Sentinel-2 GeoTIFF to classify")
    parser.add_argument(
        "--config-only",
        action="store_true",
        help="With --download, fetch only the small model config.yaml",
    )
    args = parser.parse_args()

    config = load_config()
    if args.scene:
        config["prithvi"]["scene"] = args.scene

    print(f"Model: {MODEL_ID}")
    print("Task: flood extent on Sentinel-2 (not earthquake detection)")
    if args.download:
        paths = ensure_assets(config, download_checkpoint=not args.config_only)
        print(f"Config: {paths['config']}")
        if not args.config_only:
            print(f"Checkpoint: {paths['checkpoint']}")

    status = detection_status(config)
    print(status["message"])
    if not status["ready"]:
        if args.download and not args.scene:
            return
        raise SystemExit(1)

    result = detect_flood_scene(config)
    out_dir = resolve_path(config, "processed_dir")
    out_dir.mkdir(parents=True, exist_ok=True)
    scene_name = Path(config["prithvi"]["scene"]).stem
    mask_path = out_dir / f"prithvi_flood_mask_{scene_name}.npy"
    np.save(mask_path, result["mask"])
    print(f"Flood fraction: {result['flood_fraction']:.3f}")
    print(f"Load path: {result['source']}")
    if result["registry_error"]:
        print("BACKBONE_REGISTRY.build(model_id) is not a registry key.")
        print("Used the fine-tuned checkpoint from the same Hugging Face repo.")
    print(f"Wrote: {mask_path}")


if __name__ == "__main__":
    try:
        main()
    except PrithviNotReadyError as exc:
        print(exc)
        raise SystemExit(1)
