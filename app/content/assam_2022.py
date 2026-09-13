"""Assam 2022 package. Visual maps are references. Rasters are not invented."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from flood_ai.config import project_root


def catalog_path() -> Path:
    return project_root() / "data" / "historical_events" / "assam_2022" / "metadata" / "catalog.json"


def assam_catalog() -> dict[str, Any]:
    return json.loads(catalog_path().read_text(encoding="utf-8"))


def raster_status() -> list[dict[str, Any]]:
    catalog = assam_catalog()
    root = project_root()
    rows = []
    for item in catalog["expected_rasters"]:
        folder = root / item["path"]
        files = [path.name for path in folder.glob("*") if path.is_file()] if folder.exists() else []
        rows.append({**item, "files": files, "status": "available" if files else "unavailable"})
    return rows
