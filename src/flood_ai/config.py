"""Load the project YAML config. Paths are resolved from the repo root."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

REQUIRED_TOP_LEVEL = (
    "project",
    "region",
    "event",
    "paths",
    "grid",
    "temporal",
    "model",
    "risk_thresholds",
)


def project_root() -> Path:
    return Path(__file__).resolve().parents[2]


def load_config(path: str | Path | None = None) -> dict[str, Any]:
    config_path = Path(path) if path else project_root() / "config.yaml"
    if not config_path.exists():
        raise FileNotFoundError(f"Config not found: {config_path}")

    with config_path.open(encoding="utf-8") as handle:
        config = yaml.safe_load(handle)

    if not isinstance(config, dict):
        raise ValueError("config.yaml must parse to a mapping")

    missing = [key for key in REQUIRED_TOP_LEVEL if key not in config]
    if missing:
        raise ValueError(f"config.yaml missing keys: {missing}")

    return config


def resolve_path(config: dict[str, Any], key: str) -> Path:
    relative = Path(config["paths"][key])
    if relative.is_absolute():
        return relative
    return project_root() / relative
