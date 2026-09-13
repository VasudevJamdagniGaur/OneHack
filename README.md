# SobekAI — Satellite-Powered Flood Intelligence & Early Warning

![SobekAI](app/frontend/site/assets/sobek-logo.png)

Satellite-powered flood early-warning prototype for **AI-1. Satellite-Based Real-Time Natural Disaster Prediction**, scoped to **flood only**.

This is **historical satellite-based flood risk prediction**. It is not a live satellite feed.

This is a **historical replay** of public satellite-derived products. It is not a live satellite feed and not a generic flood/no-flood image classifier.

**Judge story**

> Here is satellite-derived rainfall and terrain from before a historical flood.
> The system turns that into a location-specific flood-risk map.
> Risk rises in the valley cells that later flood.
> Here is the official historical flood extent.
> Here is the overlap.

---

## Product surface

SobekAI pages, served by the existing Python app:

- `/` Dashboard
- `/risk-map` Risk Map
- `/history` History
- `/alerts` Alerts
- `/learn` Learn
- `/methodology` Data & Methodology

The Python package remains `flood_ai`. IBM/NASA Prithvi-EO is a third-party segmentation model. The SobekAI contribution is the risk engine, validation path, and product.

Run: `python app/backend/server.py` then open http://127.0.0.1:8080

## Current milestone (Phase 1)

```
repository
 → dataset plan
 → region selected (pending your confirmation)
 → configuration
 → project skeleton
 → synthetic sample pipeline runs
```

No model has been trained. No real satellite tiles have been downloaded. Sample outputs are labeled **SYNTHETIC SAMPLE DATA**.

---

## Active event

**Kosi / Koshi Flood — Bihar, India — August 2008**

The embankment breach is dated 18 August 2008 in public accounts. The planned validation source is the Global Flood Database (Terra/Aqua MODIS, 250 m). That raster is not ingested. Dashboard risk scores are awaiting model data. The earlier synthetic Ahr Valley grid is not shown on this map.

Germany remains an archived event only. Details of the earlier candidate: [REGION_PLAN.md](REGION_PLAN.md).

---

## Architecture

The repo is the project root (this workspace was empty). Modules live under `src/flood_ai/` so imports stay clean.

```
OneHack/
├── data/raw|processed|samples
├── models/
├── src/flood_ai/
│   ├── data/            # ingest + synthetic sample generator
│   ├── preprocessing/   # grid alignment
│   ├── features/        # rainfall accumulations + terrain scores
│   ├── training/        # placeholder; not trained
│   ├── inference/       # expert-weighted spatial risk
│   ├── evaluation/      # risk vs flood mask + time curve
│   └── visualization/   # heatmaps and summary figure
├── app/backend|frontend # dashboard placeholders
├── notebooks/
├── scripts/
├── tests/
├── config.yaml
├── requirements.txt
└── README.md
```

Data flow:

```
config.yaml
    → ingest (sample now, real rasters later)
    → preprocess onto one grid
    → features per cell-day
    → inference → flood_risk ∈ [0, 1]
    → evaluate against flood mask
    → visualize heatmap / overlap / rising-risk curve
```

---

## What Phase 1 actually computes

An **expert-weighted** score from:

- 1 / 3 / 7-day satellite-style rainfall
- height above the river (HAND-like)
- slope
- distance to the river

Random Forest / LightGBM is the next early-warning baseline **after** you confirm the region and we pull the real CHIRPS + DEM + EMS subset.

Flood **extent** detection uses the published model `ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL-Sen1Floods11` (Sentinel-2 water mask). It is not an earthquake model and it is not the pre-event risk score. Install with `pip install -r requirements-prithvi.txt`, then `python scripts/run_prithvi_flood.py --download`. Set `prithvi.scene` to a Sentinel-2 GeoTIFF before expecting a mask.

---

## Setup and run

Python **3.13.7** is available on this machine. There was no virtual environment when Phase 1 started.

```powershell
cd C:\CURSOR\OneHack
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -U pip
pip install -r requirements.txt
pytest
python scripts\run_sample_pipeline.py
```

### Expected test output

```
...  (pytest -q)
X passed
```

### Expected pipeline output

- Console banner: `SYNTHETIC SAMPLE DATA` and `historical_replay`
- Region / event / prediction date from `config.yaml`
- High-risk area in km² (sample cells are synthetic)
- Risk-class counts
- A line showing mean risk rising toward the analog peak
- Files under `data/samples/`:
  - `grid_cells.csv`
  - `daily_risk_summary.csv`
  - `risk_timeseries.png`
  - `risk_heatmap.png`
  - `prediction_vs_actual.png`

If `data_mode` is `sample`, nothing talks to a satellite API.

---

## Decisions that need you

1. **Confirm or change the region.** Default recommendation is Ahr Valley 2021. Sindh 2022 and Kerala 2018 are documented backups.
2. **Do not download real data until (1) is confirmed.** The download script is a stub on purpose.
3. **Do not train a supervised model** on the same flood map we will show as ground truth.
4. Geospatial libraries (`rasterio`, `geopandas`) are listed in `requirements.txt` but commented out until real rasters exist. Python 3.13 + Windows wheels can be painful.

---

## Lag (must be said in the demo)

| Layer | Lag |
| --- | --- |
| CHIRPS v3 final SAT (what a replay would use) | About three weeks after the month ends |
| CHIRPS prelim / IMERG Late (what a live prototype would use) | ~14 hours to ~2 days |
| Copernicus DEM | Static |
| EMS flood map | Validation product from 15–16 July imagery, delivered 16 July. Not a forecast input. |
| Sentinel-1 (optional later) | ~6-day revisit over Europe |

---

## Next phases (not done)

1. You confirm the region
2. Download only the subset in `DATASET_PLAN.md`
3. Swap `data_mode: sample` → `real`
4. Re-run inference on real grids
5. Validate 13 July risk vs EMSR517 AOI15
6. Folium / Leaflet dashboard in `app/`
