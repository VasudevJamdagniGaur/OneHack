"""Supervised baseline placeholder.

Do not train on the Ahr Valley EMSR517 labels that will be used for the
demo comparison. A later Random Forest / LightGBM should use a different
AOI or event.
"""

from __future__ import annotations

from typing import Any


def train_baseline(_config: dict[str, Any], _feature_table: Any = None) -> None:
    raise RuntimeError(
        "No model is trained in Phase 1. Inference uses the expert-weighted "
        "score in flood_ai.inference.predict. Do not fit on the validation flood map."
    )
