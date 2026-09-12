"""Matplotlib figures for the Phase 1 sample demo. Folium comes later."""

from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np


def save_timeseries(daily_means: np.ndarray, peak_day_index: int, path: Path) -> None:
    days = np.arange(1, daily_means.size + 1)
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.plot(days, daily_means, marker="o", color="#b45309")
    ax.axvline(peak_day_index + 1, color="#991b1b", linestyle="--", label="Analog peak")
    ax.set_xlabel("Sample day (synthetic analog of early July 2021)")
    ax.set_ylabel("Mean flood risk")
    ax.set_ylim(0, 1)
    ax.set_title("SYNTHETIC SAMPLE DATA - rising mean risk")
    ax.legend()
    fig.tight_layout()
    fig.savefig(path, dpi=140)
    plt.close(fig)


def save_heatmap(
    risk: np.ndarray,
    lons: np.ndarray,
    lats: np.ndarray,
    path: Path,
    title: str,
) -> None:
    fig, ax = plt.subplots(figsize=(8, 5))
    image = ax.imshow(
        risk,
        extent=(lons.min(), lons.max(), lats.min(), lats.max()),
        origin="upper",
        cmap="YlOrRd",
        vmin=0.0,
        vmax=1.0,
        aspect="auto",
    )
    fig.colorbar(image, ax=ax, label="Flood risk")
    ax.set_xlabel("Longitude")
    ax.set_ylabel("Latitude")
    ax.set_title(title)
    fig.tight_layout()
    fig.savefig(path, dpi=140)
    plt.close(fig)


def save_comparison(
    risk: np.ndarray,
    flood_mask: np.ndarray,
    lons: np.ndarray,
    lats: np.ndarray,
    high_threshold: float,
    path: Path,
) -> None:
    extent = (lons.min(), lons.max(), lats.min(), lats.max())
    overlap = (risk >= high_threshold) & flood_mask.astype(bool)

    fig, axes = plt.subplots(1, 3, figsize=(12, 4))
    panels = [
        (risk, "YlOrRd", "Predicted risk", 0.0, 1.0),
        (flood_mask, "Blues", "Actual flood (synthetic)", 0.0, 1.0),
        (overlap.astype(float), "Greens", "High-risk AND flood", 0.0, 1.0),
    ]
    for ax, (data, cmap, title, vmin, vmax) in zip(axes, panels):
        image = ax.imshow(
            data,
            extent=extent,
            origin="upper",
            cmap=cmap,
            vmin=vmin,
            vmax=vmax,
            aspect="auto",
        )
        ax.set_title(title)
        ax.set_xlabel("Lon")
        ax.set_ylabel("Lat")
        fig.colorbar(image, ax=ax, fraction=0.046, pad=0.04)

    fig.suptitle("SYNTHETIC SAMPLE DATA - prediction vs actual")
    fig.tight_layout()
    fig.savefig(path, dpi=140)
    plt.close(fig)
