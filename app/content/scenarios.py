"""India historical scenarios. Dates and places come from public accounts.

Availability flags are honest. None of these events has an ingested raster
or a SobekAI risk grid.
"""

from __future__ import annotations

from copy import deepcopy
from typing import Any

from app.content.assam_2022 import assam_catalog, raster_status


def flood_scenarios() -> list[dict[str, Any]]:
    unavailable = {
        "satellite": "unavailable",
        "rainfall": "unavailable",
        "river_level": "unavailable",
        "terrain": "unavailable",
        "flood_extent": "unavailable",
        "risk_grid": "unavailable",
        "visual_maps": "unavailable",
    }
    return [
        {
            "id": "kosi-2008",
            "name": "Kosi Flood",
            "display": "Kosi Flood — Bihar — 2008",
            "country": "India",
            "region": "Bihar",
            "river": "Kosi / Koshi",
            "year": 2008,
            "flood_type": "Embankment breach and river avulsion",
            "start_date": "2008-08-18",
            "end_date": None,
            "date_note": "Breach dated 18 August 2008 in public accounts. Global Flood Database start and end dates were not retrieved.",
            "date_source": "GFDRR note on the 18 August 2008 breach; Wikipedia summary of the event.",
            "center": {"lat": 26.5263, "lon": 86.9269, "label": "Koshi Barrage"},
            "bbox": {"min_lon": 86.20, "min_lat": 25.20, "max_lon": 87.60, "max_lat": 26.70},
            "bbox_note": "Viewing frame around the Koshi Barrage and northern Bihar. Not a flood polygon.",
            "extent_source": "Global Flood Database (Terra/Aqua MODIS, 250 m). Raster not ingested.",
            "official_url": "https://developers.google.com/earth-engine/datasets/catalog/GLOBAL_FLOOD_DB_MODIS_EVENTS_V1",
            "default": True,
            "classification": "historical",
            "availability": unavailable,
        },
        {
            "id": "assam-2022",
            "name": "Assam Flood",
            "display": "Assam Flood — 2022",
            "country": "India",
            "region": "Assam",
            "river": "Brahmaputra basin",
            "year": 2022,
            "flood_type": "Monsoon river flood",
            "start_date": "2022-06-13",
            "end_date": None,
            "date_note": "Ministry of Home Affairs situation reports say Assam had been facing flood and landslide from 13 June 2022. No single statewide peak timestamp is stored here.",
            "date_source": "MHA Disaster Management Division situation report, 30 June 2022.",
            "center": {"lat": 26.1445, "lon": 91.7362, "label": "Guwahati viewing anchor"},
            "bbox": {"min_lon": 89.70, "min_lat": 24.40, "max_lon": 95.20, "max_lat": 27.90},
            "bbox_note": "Viewing frame covering Assam plus Imphal and Jiribam, because those Manipur places have supplied maps. Not a flood polygon and not the state boundary.",
            "extent_source": "Supplied place maps are visual references. No georeferenced flood-extent raster is ingested.",
            "official_url": "https://asdma.assam.gov.in/resource/inundation-mapping-nrsc",
            "default": False,
            "classification": "historical",
            "availability": {
                **deepcopy(unavailable),
                "visual_maps": "available",
            },
            "package": _assam_package(),
        },
        {
            "id": "maharashtra-2021",
            "name": "Maharashtra Flood",
            "display": "Maharashtra Flood — 2021",
            "country": "India",
            "region": "Maharashtra",
            "river": "Vashishti and Konkan rivers",
            "year": 2021,
            "flood_type": "Monsoon river and urban flood",
            "start_date": "2021-07-22",
            "end_date": None,
            "date_note": "MHA and contemporary reporting place severe inundation at Chiplun and the Konkan on 22 July 2021. An event end date is not stored.",
            "date_source": "MHA situation report, 22 July 2021; reporting from 22 July 2021.",
            "center": {"lat": 17.533, "lon": 73.517, "label": "Chiplun viewing anchor"},
            "bbox": {"min_lon": 73.10, "min_lat": 16.80, "max_lon": 74.40, "max_lat": 18.30},
            "bbox_note": "Konkan viewing frame around Chiplun. Not a mapped flood extent.",
            "extent_source": "No flood-extent raster is ingested for this event.",
            "official_url": "https://ndmindia.mha.gov.in/",
            "default": False,
            "classification": "historical",
            "availability": unavailable,
        },
        {
            "id": "sikkim-2023",
            "name": "Sikkim / Teesta Flood",
            "display": "Sikkim / Teesta Flood — 2023",
            "country": "India",
            "region": "Sikkim",
            "river": "Teesta",
            "year": 2023,
            "flood_type": "Glacial lake outburst flood",
            "start_date": "2023-10-04",
            "end_date": None,
            "date_note": "NDMA described a South Lhonak glacial-lake outburst and a Teesta surge in the early hours of 4 October 2023.",
            "date_source": "NDMA statement reported 4 October 2023.",
            "center": {"lat": 27.331, "lon": 88.614, "label": "Gangtok viewing anchor"},
            "bbox": {"min_lon": 88.20, "min_lat": 27.05, "max_lon": 88.85, "max_lat": 27.95},
            "bbox_note": "Teesta valley viewing frame. Not a mapped flood extent. The lake coordinate is not stored.",
            "extent_source": "No flood-extent raster is ingested for this event.",
            "official_url": "https://ndma.gov.in/",
            "default": False,
            "classification": "historical",
            "availability": unavailable,
        },
        {
            "id": "wayanad-2024",
            "name": "Kerala / Wayanad",
            "display": "Kerala / Wayanad — 2024",
            "country": "India",
            "region": "Wayanad, Kerala",
            "river": "Iruvanji and Chaliyar catchments",
            "year": 2024,
            "flood_type": "Landslide and flash flood",
            "start_date": "2024-07-30",
            "end_date": None,
            "date_note": "Landslides and flash flooding in Meppadi, Wayanad, in the early hours of 30 July 2024. Casualty figures are not shown because published counts differ.",
            "date_source": "Published accounts of the 30 July 2024 Wayanad landslides, including the village coordinate on Wikipedia.",
            "center": {"lat": 11.78178, "lon": 76.23267, "label": "Meppadi villages"},
            "bbox": {"min_lon": 76.05, "min_lat": 11.55, "max_lon": 76.45, "max_lat": 11.95},
            "bbox_note": "Local viewing frame around the reported villages. Not a mapped flood extent.",
            "extent_source": "No flood-extent raster is ingested for this event.",
            "official_url": "https://en.wikipedia.org/wiki/2024_Wayanad_landslides",
            "default": False,
            "classification": "historical",
            "availability": unavailable,
        },
    ]


def _assam_package() -> dict[str, Any]:
    catalog = assam_catalog()
    return {
        "label": "Supplied visual maps. Not a raw satellite product and not a risk grid.",
        "rasters": raster_status(),
        "visual_references": catalog["visual_references"],
        "affected_places": catalog["affected_places"],
        "unmapped_places": catalog["unmapped_places"],
        "signals": {
            "satellite_water": "unavailable",
            "rainfall": "unavailable",
            "elevation": "unavailable",
            "slope": "unavailable",
            "temporal_change": "unavailable",
            "river": "unavailable",
        },
        "risk_score": None,
        "metrics": {
            "iou": None,
            "precision": None,
            "recall": None,
            "f1": None,
            "lead_time": None,
            "reason": "Insufficient aligned ground-truth data. No risk grid and no georeferenced flood extent.",
        },
    }


def default_scenario() -> dict[str, Any]:
    scenarios = flood_scenarios()
    return next(item for item in scenarios if item["id"] == "kosi-2008")
