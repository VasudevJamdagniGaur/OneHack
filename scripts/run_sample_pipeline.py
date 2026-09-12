"""Run the Phase 1 synthetic flood-risk pipeline."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from flood_ai.pipeline import format_dashboard_text, run_sample_pipeline


def main() -> None:
    result = run_sample_pipeline()
    print(format_dashboard_text(result))
    print("Wrote:")
    for name, path in result["outputs"].items():
        print(f"  {name}: {path}")


if __name__ == "__main__":
    main()
