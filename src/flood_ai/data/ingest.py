"""Ingest interfaces for precipitation, DEM, and flood-extent layers.

Phase 1 only implements the sample-data path. Real loaders stay explicit stubs
so we do not silently pretend archived rasters are in the repo.
"""

from __future__ import annotations

from typing import Any

from flood_ai.data.sample_data import generate_synthetic_region


class RealDataNotAvailableError(RuntimeError):
    """Raised when a real satellite product is requested before download."""


def load_region_stack(config: dict[str, Any]) -> dict[str, Any]:
    mode = config["project"]["data_mode"]
    if mode == "sample":
        return generate_synthetic_region(config)
    if mode == "real":
        raise RealDataNotAvailableError(
            "Real rasters are not in the repo yet. Keep data_mode: sample "
            "or implement the clipped CHIRPS/DEM/EMS loaders after download."
        )
    raise ValueError(f"Unknown project.data_mode: {mode}")


def load_precipitation(_config: dict[str, Any]) -> None:
    raise RealDataNotAvailableError(
        "CHIRPS v3 daily SAT has not been downloaded. See DATASET_PLAN.md."
    )


def load_dem(_config: dict[str, Any]) -> None:
    raise RealDataNotAvailableError(
        "Copernicus DEM GLO-30 has not been downloaded. See DATASET_PLAN.md."
    )


def load_flood_extent(_config: dict[str, Any]) -> None:
    raise RealDataNotAvailableError(
        "EMSR517 flood-extent vectors have not been downloaded. See DATASET_PLAN.md."
    )
