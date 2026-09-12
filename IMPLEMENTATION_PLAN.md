# Implementation Plan — Components A–K

Phase 1 status is marked for each component. Nothing below trains a model or downloads large archives.

## A. Data ingestion

**Now:** `src/flood_ai/data/ingest.py` loads the synthetic stack when `data_mode: sample`. Real loaders raise `RealDataNotAvailableError`. `scripts/download_real_data.py` is a no-op stub.

**Next (after region confirmation):** clipped CHIRPS v3 daily SAT, one DEM tile, EMSR517 AOI15 vectors only.

## B. Satellite preprocessing

**Now:** Sample arrays are already on one grid. `preprocessing/align.py` checks shapes.

**Next:** clip, warp, and resample real GeoTIFFs / shapefiles onto the 250 m grid in `config.yaml`.

## C. Feature engineering

**Now:** 1/3/7-day rainfall, elevation, slope, HAND-like height above river, distance to river.

**Next:** replace the toy HAND with a drainage-conditioned version if time allows. Do not add NDWI/NDVI unless we explicitly decide we need them.

## D. Spatial grid / raster generation

**Now:** 48×64 synthetic grid over the Ahr bbox.

**Next:** real 250 m grid, write GeoTIFF + `lat, lon, flood_risk` CSV.

## E. Model training

**Now:** `training/baseline.py` refuses to train. This is intentional.

**Next:** optional Random Forest / LightGBM on a **different** EMSR517 AOI or event. Never fit on the Ahr test flood map.

## F. Model inference

**Now:** expert-weighted score → `flood_risk ∈ [0, 1]` for every cell.

**Next:** same API, swap in a fitted model artifact under `models/` if we train one.

## G. Historical event validation

**Now:** synthetic flood mask vs prediction-day risk; rising mean-risk check.

**Next:** rasterize EMSR517 AOI15 and compare the 13 July 2021 risk map to the 16 July official extent.

## H. Risk-map generation

**Now:** `data/samples/grid_cells.csv` and PNG heatmaps.

**Next:** GeoTIFF + web tiles for the dashboard.

## I. Interactive map visualization

**Now:** static matplotlib maps. Folium/Leaflet is not wired yet.

**Next:** `app/frontend` heatmap with low/moderate/high/critical colors and a toggle for the official flood layer.

## J. Alert / threshold logic

**Now:** thresholds in `config.yaml`; class counts and high-risk area in the console dashboard.

**Next:** persist daily alert summaries and expose them through the backend.

## K. Demo dashboard

**Now:** console layout in `format_dashboard_text()` matching the requested judge view.

**Next:** FastAPI or static HTML + Folium map. Keep the same fields: region, event, prediction date, high-risk km², class bars, compare-with-actual toggle.

---

Do not start E or real A until the region in `REGION_PLAN.md` is confirmed.
