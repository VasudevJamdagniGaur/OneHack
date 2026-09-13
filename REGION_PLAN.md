# Region Plan — One Hazard, One Place

**Hazard:** flood.  
**Active demonstration (updated):** Kosi / Koshi Flood, Bihar, India, August 2008. The Germany section below is an archived candidate, not the running demo.

**Earlier recommended event:** Ahr Valley, Germany, 14–15 July 2021 (Copernicus EMSR517 AOI15).  
**Status:** recommendation only. Confirm before any real download or model training.

Three candidates were compared against hackathon constraints: public ground truth, satellite coverage, compact compute, and a map judges can read in ten seconds.

---

## Candidate A — Ahr Valley, Germany (recommended)

**Region:** Ahr Valley around Bad Neuenahr-Ahrweiler, Rhineland-Palatinate, Germany. Bbox `6.85–7.25°E`, `50.45–50.62°N`.

**Historical flood event:** July 2021 Western Europe floods. Extreme rainfall on 14–15 July turned the Ahr into a flash / river flood that destroyed villages along a narrow valley floor.

**Date:** Peak 14–15 July 2021. CEMS activated 13 July 2021 17:11 UTC because a severe flood was already expected.

**Dataset availability:** High. EMSR517 page is live and serves vector packages. CHIRPS v3 daily SAT for July 2021 is listed on the CHC HTTP server. Copernicus DEM GLO-30 Germany tiles are on AWS Open Data.

**Satellite availability:** High. Europe has dense Sentinel-1/2 coverage. Rainfall can come from CHIRPS v3 SAT (IMERG-disaggregated) without downloading raw SAR/optical scenes.

**Ground truth availability:** High. Official CEMS Rapid Mapping delineation and later grading products for AOI15. This is the strongest “compare with actual flood” layer of the three candidates.

**Difficulty:** Low–medium. The AOI is small. The only data caveat is CHIRPS **v2** stopping at 50°N; **v3** (60°N) is the correct rainfall product.

**Hackathon suitability:** **Best.** Compact valley = readable heatmap. Activation-before-peak = honest early-warning story. Official polygons = no hand labeling. Compute stays tiny.

**Judge story:**  
“On 13 July, satellite-derived rainfall and valley topography already light up the Ahr floodplain. On 14–15 July the river floods those same cells. Here is the official Copernicus flood map.”

---

## Candidate B — Jacobabad / northern Sindh, Pakistan

**Region:** A clipped box inside northern Sindh (not the whole province). Example focus: Jacobabad–Kashmore, roughly `68.9–70.0°E`, `27.8–28.6°N`.

**Historical flood event:** 2022 Pakistan monsoon floods. Abnormal monsoon rainfall from mid-June, catastrophic inundation in Sindh by late August.

**Date:** Broader crisis June–August 2022. A practical validation snapshot is UNOSAT / Sentinel-2 water extent on **31 August 2022**.

**Dataset availability:** High. UNOSAT product 3348 shapefile: https://unosat.org/products/3348 and https://unosat.org/static/unosat_filesystem/3348/FL20220808PAK_SHP.zip. Copernicus EMSR629 also exists. CHIRPS v2 or v3 both cover this latitude.

**Satellite availability:** High. Sentinel-1/2 and CHIRPS are available. The UNOSAT 31 August map is from Sentinel-2.

**Ground truth availability:** High, but coarse-to-large. The Sindh UNOSAT shapefile is listed at **272.6 MB** on HDX. EMSR629 vectors are smaller but cover only a few AOIs. We would have to clip hard.

**Difficulty:** Medium–high. The physical event is a slow, huge inundation of a flat basin. A 25,000 km² map is a poor 8-hour demo unless we cut it to one district. Rainfall-to-flood lag is weeks, which is valid but less punchy than a 48-hour valley flood.

**Hackathon suitability:** Strong backup if we want a Global South / monsoon narrative. Only use a **district-scale clip**, not all of Sindh.

**Judge story:**  
“Monsoon rainfall accumulates for weeks. Low, flat Sindh cells stay red. The UNOSAT water map from 31 August overlaps those cells.”

---

## Candidate C — Kuttanad / Alappuzha–Kottayam, Kerala, India

**Region:** Kuttanad lowlands and Vembanad backwaters, Kerala. Rough bbox `76.25–76.60°E`, `9.30–9.80°N`.

**Historical flood event:** Kerala floods of August 2018. Statewide rainfall from 1 June–29 August was about 36% above normal; the acute flood pulse is mid-August, with Idukki and other reservoirs releasing water.

**Date:** Acute flooding ~15–17 August 2018. Published Sentinel-1A flood mapping on **21 August 2018** (waters already receding).

**Dataset availability:** Medium. CHIRPS v2/v3 cover Kerala easily. NRSC/ISRO produced operational flood maps; a peer-reviewed Sentinel-1 assessment exists for Thrissur, Ernakulam, Alappuzha, Idukki, and Kottayam. No Copernicus EMS activation with a one-click AOI ZIP was found for this event.

**Satellite availability:** High. Sentinel-1A 21 August 2018 is documented (Alaska Satellite Facility / Copernicus). Pre-flood Sentinel-2 January–February 2018 was used for MNDWI permanent water in the published study.

**Ground truth availability:** Medium. We would likely have to derive flood extent from Sentinel-1 ourselves or hunt NRSC/Bhuvan layers. That is extra hours and a second model (water detection), which the brief told us not to turn into the product.

**Difficulty:** Medium. Hydrology is compelling (below-sea-level paddy, backwaters) but ground truth is the weak link for an 8-hour build.

**Hackathon suitability:** Excellent if this were a longer project or if an official Kerala flood shapefile is already in hand. Not the first pick for tomorrow’s demo.

**Judge story:**  
“Rain piles up over the Western Ghats and the Kuttanad saucer. Risk rises in the lowest paddy cells before 21 August SAR shows water still sitting there.”

---

## Selection

| Criterion | Ahr Valley | Sindh clip | Kuttanad |
| --- | --- | --- | --- |
| Official vector flood map | Yes (EMSR517) | Yes, but large | Weak / DIY |
| Compact, readable map | Yes | Only if clipped hard | Yes |
| Pre-event rainfall signal | 24–48 h pulse | Weeks | Days–weeks |
| Download size | Small | Medium–large | Small–medium if we skip raw S1 |
| Early-warning narrative | Activation on 13 July, flood 14–15 | Valid but slow | Valid, but GT is late (21 Aug) |
| 8-hour risk | Lowest | Medium | Medium |

**Selected region/event:** Candidate A — **Ahr Valley, 14–15 July 2021, EMSR517 AOI15.**

This is a recommendation, not a lock. If you prefer the monsoon story, we can switch `config.yaml` to a Sindh district clip before any real download.

---

## Temporal / early-warning design (selected event)

```
1–12 July 2021     CHIRPS rainfall + static DEM/slope/HAND
        ↓
13 July 2021       Prediction date: spatial flood-risk map
        ↓
14–15 July 2021    Historical flood peak
        ↓
16 July 2021       Official CEMS flood extent (validation, not a model input)
```

The demo must show:

1. Risk maps for several days **before** 14 July
2. Mean / high-risk area increasing toward 13–14 July
3. 13 July risk map vs 16 July actual flood polygons
4. Overlap / miss / false-alarm cells

### Split strategy (no pixel leakage)

| Split | What | Why |
| --- | --- | --- |
| Phase 1 baseline | **No training** on flood labels | Expert-weighted score uses rainfall + terrain only |
| If we add RF/LightGBM later | Train on a **different EMSR517 AOI** or a different event | Same-event pixel splits leak spatial autocorrelation |
| Test | Ahr AOI15, features ending **13 July**, labels from **16 July** | This is the early-warning question |
| Forbidden | Random 80/20 split of pixels from the 16 July flood map | That is a flood detector, not a forecast |

Phase 1 does **not** train a model. The sample pipeline only checks that a rising risk field can be produced and compared to a flood mask.
