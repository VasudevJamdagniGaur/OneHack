"""Stub for the real-data download. Intentionally does not fetch anything."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from flood_ai.config import load_config


def main() -> None:
    config = load_config()
    region = config["region"]["name"]
    print("Real-data download is disabled until the region is confirmed.")
    print(f"Current recommendation: {region} / {config['event']['name']}")
    print()
    print("If confirmed, the subset to download is listed in DATASET_PLAN.md:")
    print("  1. CHIRPS v3 daily SAT 2021-07-01 .. 2021-07-15")
    print("  2. One Copernicus DEM GLO-30 tile, clipped to the bbox")
    print("  3. EMSR517 AOI15 delineation vectors only")
    print()
    print("This script will not download files in Phase 1.")
    sys.exit(0)


if __name__ == "__main__":
    main()
