# Model Design — Spatial Flood Risk, Not Image Classification

Phase 1 implements an **untrained expert-weighted baseline**. No accuracy numbers are claimed. No weights have been fit to the Ahr flood map.

The output is always spatial:

```
latitude, longitude, flood_risk          # table
grid_cell (i, j) → risk in [0, 1]        # raster equivalent
```

---

## What we are not building

- A new CNN trained in this repo
- A live Sentinel downlink
- A randomly split pixel classifier on the same flood map we validate against
- An earthquake detector. Prithvi-EO-2.0-300M-TL-Sen1Floods11 maps flood water, not seismic events.

The published Prithvi model is used for **flood extent on a Sentinel-2 scene** of the historical event. It sees water that is already there. The early-warning score remains the spatial risk map built from rainfall and terrain before the peak.

---

## Baseline (Phase 1, implemented)

For each grid cell and prediction day `t`:

```
p3  = clip(precip_3d / 80 mm,  0, 1)
p7  = clip(precip_7d / 150 mm, 0, 1)
h   = clip(1 - HAND / 40 m,    0, 1)     # low = more exposed
s   = clip(1 - slope / 15 deg, 0, 1)     # flat = more ponding
d   = clip(1 - dist_river / 3 km, 0, 1)  # near the Ahr

risk = 0.35*p3 + 0.15*p7 + 0.25*h + 0.10*s + 0.15*d
```

Weights live in `config.yaml` so they can be changed without code edits.

This is a **hydrology-inspired score**, not a fitted model. It is enough to:

- produce a geographic heatmap
- show risk rising as rainfall accumulates
- compare high-risk cells with a flood mask
- keep the architecture modular for a later tree model

---

## Features we use, and why

| Feature | Why it belongs |
| --- | --- |
| `precip_1d` | Pulse rain on the eve of a flash flood |
| `precip_3d` | Short accumulation that actually drives this event |
| `precip_7d` | Antecedent wetness / catchment priming |
| `elevation` / `HAND` | Water goes to the valley floor, not the ridge |
| `slope` | Flat floodplain cells pond; steep slopes shed |
| `dist_to_river` | This is a confined river-valley flood |

`HAND` here is a **simple prototype**: cell elevation minus the estimated river-line elevation. A full drainage-conditioned HAND can replace it later without changing the inference API.

## Features we do not use in v1

| Feature | Why we skip it now |
| --- | --- |
| NDWI | Needs cloud-free optical data; detects current water |
| NDVI | Vegetation stress is a weak, slow flood precursor here |
| NDBI | Urban fabric matters in cities; this demo is a valley flood |
| Sentinel-1 VV/VH | Excellent for **mapping** the 15–16 July water, poor as a 13 July precursor because of 6-day revisit. Optional overlay later. |

---

## Flood detection model (added)

**ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL-Sen1Floods11**

- Role: detect water/flood pixels on Sentinel-2 (Blue, Green, Red, Narrow NIR, SWIR 1, SWIR 2)
- Not used as the pre-event risk score
- Loader tries `BACKBONE_REGISTRY.build(<huggingface id>)` first. That id is not a TerraTorch backbone key, so detection uses the published fine-tuned checkpoint from the same repo (`LightningInferenceModel.from_config`)
- Output: spatial mask, class 1 = water/flood
- Requires `pip install -r requirements-prithvi.txt` and a Sentinel-2 GeoTIFF in `prithvi.scene`

No published accuracy numbers from this model are copied in as our own scores. We will report overlap with the EMS map only after a real scene is run.

## Next model (only after real data is confirmed)

If the expert map looks sane on real CHIRPS + DEM + EMS polygons:

1. Stay tabular. Each cell-day is one row.
2. Train **Random Forest or LightGBM** to predict `P(flood | features_t)`.
3. Labels come from a **held-out AOI or event**, never from Ahr 16 July pixels used in the test map.
4. Calibrate scores to `[0, 1]`.
5. Only then consider a U-Net, and only if we have time and a small raster stack.

`src/flood_ai/training/baseline.py` is a placeholder for that step. It must not pretend a model is trained.

---

## Alert thresholds

From `config.yaml`:

| Class | Score |
| --- | --- |
| Low | < 0.25 |
| Moderate | 0.25–0.50 |
| High | 0.50–0.75 |
| Critical | ≥ 0.75 / 0.90 band reserved for the top class |

Area summaries use the grid cell size (sample cells are synthetic; real cells will be 250 m).

---

## Validation metrics we will compute later (not claimed now)

On the test event, using 13 July features vs 16 July flood polygons:

- Mean risk inside vs outside the official flood extent
- High-risk area (km²)
- Overlap / precision / recall at a declared threshold
- Daily mean risk curve from 1–15 July

If mean risk inside the flood polygon is not higher than outside, we debug features before adding a fancier model.
