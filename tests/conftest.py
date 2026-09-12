from pathlib import Path

import pytest

from flood_ai.config import load_config


@pytest.fixture
def config():
    return load_config()


@pytest.fixture
def repo_root() -> Path:
    return Path(__file__).resolve().parents[1]
