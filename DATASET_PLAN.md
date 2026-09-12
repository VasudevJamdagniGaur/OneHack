# Dataset Plan — Satellite Flood Early Warning

**Status:** Sources verified on 12 September 2026. No large downloads in this phase.  
**Hazard:** Flood only.  
**Recommended region:** Ahr Valley, Rhineland-Palatinate, Germany (July 2021).  
**Mode:** Historical public-data replay. Not a live satellite feed.

This is not one giant image-classification archive. It is a **small, multi-source stack** that can produce a location-specific flood-risk score and be checked against an official historical flood map.

We explicitly **do not** use Sen1Floods11 as the primary dataset. It is a 14 GB chip collection for flood/no-flood segmentation at the moment of flooding, which is the opposite of an early-warning spatial risk map.

---

## 1. Dataset name

**Ahr Valley Flood Early-Warning Stack (composed)**

| Layer | Product |
| --- | --- |
| Pre-event rainfall (temporal driver) | CHIRPS v3.0 daily SAT |
| Terrain vulnerability (static driver) | Copernicus DEM GLO-30 |
| Historical flood extent (validation only) | Copernicus EMS Rapid Mapping **EMSR517** AOI15 |
| Optional later | Sentinel-1 GRD IW (during-event water) |

## 2. Official source

- CHIRPS: UCSB Climate Hazards Center (USGS / FEWS NET collaboration)
- DEM: Copernicus Programme, distributed as AWS Open Data
- Flood extent: Copernicus Emergency Management Service (CEMS) Rapid Mapping
- Optional SAR: ESA Copernicus Sentinel-1

## 3. URL

Verified during this planning pass:

| Product | URL |
| --- | --- |
| CHIRPS v3 overview | https://www.chc.ucsb.edu/data/chirps3 |
| CHIRPS v3 daily SAT 2021 listing | https://data.chc.ucsb.edu/products/CHIRPS/v3.0/daily/final/sat/2021/ |
| CHIRPS v3 daily method note | https://data.chc.ucsb.edu/products/CHIRPS/v3.0/daily/readme.txt |
| Copernicus DEM AWS | https://registry.opendata.aws/copernicus-dem/ |
| EMSR517 activation | https://mapping.emergency.copernicus.eu/activations/EMSR517/ |
| Sentinel-1 access | https://dataspace.copernicus.eu/ |
| Sen1Floods11 (rejected as primary) | https://github.com/cloudtostreet/Sen1Floods11 |

## 4. Satellite / platform

- **CHIRPS v3 SAT:** geostationary thermal infrared rainfall estimates, blended with station data, then **daily-disaggregated with NASA IMERG Late V07** (GPM microwave + IR constellation).
- **Copernicus DEM GLO-30:** radar-derived digital surface model.
- **EMSR517 flood polygons:** analysts delineate flood water from tasked satellite images (optical and/or SAR) after the event.
- **Optional Sentinel-1:** C-band SAR, IW GRD, VV/VH.

CHIRPS v2 was **not** selected for this region. v2 is limited to 50°S–50°N; the Ahr Valley sits at about **50.5°N**. CHIRPS v3 covers **60°N–60°S**.

## 5. Relevant bands / fields

| Product | Fields used |
| --- | --- |
| CHIRPS v3 daily SAT | Precipitation (mm/day) |
| Copernicus DEM | Elevation (m); slope and HAND derived from it |
| EMSR517 | `observedEvent` flood polygons; AOI boundary; hydrography if present |
| Sentinel-1 (later only) | VV, VH backscatter (dB) |

No NDWI / NDVI / NDBI in v1. Those need cloud-free Sentinel-2/Landsat and mainly detect water that is already present.

## 6. Spatial resolution

| Product | Native resolution | Prototype use |
| --- | --- | --- |
| CHIRPS v3 | 0.05° (~5 km) | Upsampled onto the analysis grid |
| Copernicus DEM GLO-30 | 30 m | Downsampled / aggregated |
| Working risk grid | **250 m** | Compromise: fine enough for a heatmap, cheap enough for a hackathon |
| EMSR517 | Event polygons | Rasterized onto the 250 m grid for validation |

## 7. Temporal / revisit information

| Product | Time step | Revisit / latency |
| --- | --- | --- |
| CHIRPS v3 SAT daily | Daily | Final archive: typically the third week of the following month. Prelim: ~2 days after each 5-day pentad. IMERG Late itself is ~14 hours. |
| Copernicus DEM | Static | No revisit |
| EMSR517 | Event product | Activation 13 July 2021 17:11 UTC. Delineation products 15–16 July. |
| Sentinel-1 | Scene | ~6 days over Europe with the two-satellite constellation |

**Prototype lag statement:** this demo replays archived CHIRPS final daily rainfall. A deployed early-warning system would substitute CHIRPS prelim or IMERG Late/Early. That substitution changes latency, not the model idea. The dashboard must label this.

## 8. Geographic coverage

- CHIRPS v3: land, 60°N–60°S, all longitudes
- Copernicus DEM GLO-30 Public: Germany tiles are public on AWS
- EMSR517: Western Germany, 21 AOIs. We use **AOI15 Bad Neuenahr-Ahrweiler** only
- Analysis bbox in `config.yaml`: `6.85–7.25°E`, `50.45–50.62°N` (~28 km × 19 km)

## 9. Historical time period

- Rainfall features: **1–15 July 2021**
- Prediction timestamp for the demo: **13 July 2021** (activation day / eve of peak)
- Event peak: **14–15 July 2021**
- Ground-truth map: **16 July 2021** EMS delineation

## 10. Flood labels / ground truth

Official CEMS Rapid Mapping flood extent for EMSR517 AOI15.

- Used **only for validation and the “compare with actual flood” view**
- Not used to train the Phase 1 expert-weighted score
- If a supervised model is added later, train on a **different EMSR517 AOI** (for example Erftstadt) or a different event. Do not randomly split Ahr pixels from the same map.

## 11. Approximate dataset size

| Item | Size | Notes |
| --- | --- | --- |
| CHIRPS v3 daily SAT global GeoTIFF | ~11.5 MiB / day | Verified listing for 2021 |
| 15 days of rainfall | ~170 MiB | Download, clip to bbox, delete globals |
| One Copernicus DEM 1° tile | tens of MB | Clip immediately |
| EMSR517 AOI vector ZIP | typically 1–5 MB | Do not download all 21 AOIs |
| **Planned real-data budget** | **under 250 MB** | Well inside hackathon limits |
| Sen1Floods11 full dump | ~14 GB | Rejected |

## 12. Why this is feasible in an 8-hour hackathon

- No 10 m image-classification training set
- No multi-GB Sentinel scene unless we later add one clipped chip
- HTTP downloads, no Earthdata login required for CHIRPS or EMS vectors
- AWS DEM tiles can be fetched with `--no-sign-request`
- The working grid is ~48×64 in the sample and ~100×80 at 250 m for the real bbox
- The first baseline is a transparent score, not a neural net
- Official flood polygons already exist, so we do not have to label water by hand

## 13. Exact subset we should use

When (and only when) the region is confirmed:

1. CHIRPS v3 daily SAT: `chirps-v3.0.sat.2021.07.01.tif` through `chirps-v3.0.sat.2021.07.15.tif`
2. Clip each file to the Ahr bbox, then discard the global GeoTIFFs
3. Copernicus DEM tile covering `N50 E007` (GLO-30 COG), clipped to the same bbox
4. EMSR517 **AOI15 Bad Neuenahr-Ahrweiler** delineation vector package only
5. Optional later: one Sentinel-1 GRD scene on/near 15–16 July 2021, clipped to the bbox

Do **not** download CHIRPS for the whole year, all EMSR517 AOIs, or Sen1Floods11.

## 14. Expected preprocessing steps

1. Download the 15 daily rainfall tiles and one DEM tile
2. Clip / warp everything to the bbox and `EPSG:4326` (or a local UTM for area stats)
3. Build a 250 m analysis grid
4. Aggregate DEM to that grid; compute slope and a simple HAND / height-above-river
5. Sample CHIRPS onto the same grid (nearest or bilinear)
6. Compute 1-day, 3-day, and 7-day rainfall accumulation ending on each prediction day
7. Rasterize EMS flood polygons onto the grid as `{0,1}` labels
8. Save a tidy table: `lat, lon, features..., flood_risk, actual_flood`

The Phase 1 sample pipeline does steps 3–8 on **synthetic** arrays that mimic this stack.

## 15. Licensing / access considerations

| Product | Access | License / use |
| --- | --- | --- |
| CHIRPS v3 | Public HTTP, no login | Public domain / CC BY 4.0. Cite CHC. |
| Copernicus DEM GLO-30 Public | AWS Open Data, no account required | Copernicus license; attribution required. |
| EMSR517 maps and vectors | Public CEMS portal | © European Union / Copernicus EMS. Free with attribution. Validation use is appropriate. |
| Sentinel-1 | Copernicus Data Space (free account) | Copernicus open data. Only if we add a clipped scene later. |
| NASA SRTM (backup DEM) | Earthdata login | U.S. Government work / public domain. Cite DOI. |

**Demo wording:** always say “historical public satellite products” and “official CEMS flood extent.” Never say “live satellite feed.”
