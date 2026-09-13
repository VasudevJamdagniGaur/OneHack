"""Delhi Live Monitor demo readings. Not a live feed and not model output."""

from __future__ import annotations

from typing import Any


def delhi_demo_risk() -> dict[str, Any]:
    """Single source for the illustrative Delhi low-risk dashboard."""
    simulated = {
        "source_type": "SIMULATED",
        "timestamp": None,
        "timestamp_note": "No observation time. Illustrative demo value.",
    }
    factors = [
        {
            **simulated,
            "id": "satellite_water_extent",
            "name": "Satellite Water Extent",
            "group": "dynamic",
            "display": "0.12 / 1.00",
            "value": 0.12,
            "unit": "normalized",
            "normalized_risk": 0.12,
            "status": "LOW",
            "tooltip": "Illustrative share of the view treated as water. Not a satellite measurement.",
        },
        {
            **simulated,
            "id": "water_extent_change",
            "name": "Water Extent Change",
            "group": "dynamic",
            "display": "+3.8%",
            "value": 3.8,
            "unit": "percent",
            "normalized_risk": 0.038,
            "status": "LOW",
            "trend": "STABLE",
            "tooltip": "Illustrative change in surface water. Not computed from two satellite scenes.",
        },
        {
            **simulated,
            "id": "rainfall",
            "name": "Rainfall",
            "group": "dynamic",
            "display": "18 mm / 24h",
            "value": 18,
            "unit": "mm/24h",
            "normalized_risk": 0.18,
            "status": "LOW",
            "tooltip": "Illustrative 24-hour rainfall. Not a gauge or CHIRPS reading.",
        },
        {
            **simulated,
            "id": "river_condition",
            "name": "River Condition",
            "group": "dynamic",
            "display": "0.21 / 1.00",
            "value": 0.21,
            "unit": "normalized",
            "normalized_risk": 0.21,
            "status": "LOW",
            "tooltip": "Illustrative river-condition index. Not a Yamuna gauge.",
        },
        {
            **simulated,
            "id": "temporal_trend",
            "name": "Temporal Risk Trend",
            "group": "dynamic",
            "display": "STABLE",
            "value": None,
            "unit": "trend",
            "normalized_risk": None,
            "status": "LOW",
            "trend": "STABLE",
            "tooltip": "Illustrative trend label. No Delhi time series is connected.",
        },
        {
            **simulated,
            "id": "elevation",
            "name": "Elevation Susceptibility",
            "group": "susceptibility",
            "display": "0.28 / 1.00",
            "value": 0.28,
            "unit": "normalized",
            "normalized_risk": 0.28,
            "status": "LOW",
            "tooltip": "Illustrative low-lying-terrain contribution. Not derived from a DEM.",
        },
        {
            **simulated,
            "id": "slope",
            "name": "Slope Susceptibility",
            "group": "susceptibility",
            "display": "0.19 / 1.00",
            "value": 0.19,
            "unit": "normalized",
            "normalized_risk": 0.19,
            "status": "LOW",
            "tooltip": "Illustrative slope contribution. Not derived from a DEM.",
        },
        {
            **simulated,
            "id": "land_cover",
            "name": "Land-Cover Susceptibility",
            "group": "susceptibility",
            "display": "0.31 / 1.00",
            "value": 0.31,
            "unit": "normalized",
            "normalized_risk": 0.31,
            "status": "LOW",
            "tooltip": "Illustrative land-cover contribution. No land-cover map is connected.",
        },
        {
            **simulated,
            "id": "historical_flood",
            "name": "Historical Flood Susceptibility",
            "group": "susceptibility",
            "display": "0.24 / 1.00",
            "value": 0.24,
            "unit": "normalized",
            "normalized_risk": 0.24,
            "status": "LOW",
            "tooltip": "Illustrative historical exposure. Not computed from a flood archive.",
        },
    ]
    return {
        "id": "delhi-low-demo",
        "location_id": "delhi",
        "source_type": "SIMULATED",
        "live_connected": False,
        "banner": "AI-SIMULATED READINGS",
        "disclaimer": "Values are illustrative until connected to verified public/live data sources.",
        "groups": [
            {
                "id": "dynamic",
                "title": "Dynamic flood signals",
                "factor_ids": [
                    "satellite_water_extent",
                    "water_extent_change",
                    "rainfall",
                    "river_condition",
                    "temporal_trend",
                ],
            },
            {
                "id": "susceptibility",
                "title": "Flood susceptibility",
                "factor_ids": ["elevation", "slope", "land_cover", "historical_flood"],
            },
        ],
        "factors": factors,
        "overall": {
            **simulated,
            "score": 18,
            "scale": 100,
            "display": "18 / 100",
            "normalized_risk": 0.18,
            "status": "LOW",
            "trend": "STABLE",
        },
        "insight": (
            "Current simulated conditions indicate low flood risk. "
            "Rainfall and surface-water indicators remain relatively low, "
            "while terrain susceptibility and historical flood exposure do not indicate an immediate escalation."
        ),
        "map_note": "No spatial risk grid is connected. This map shows the Delhi anchor only. The score is a regional demo value, not a cell map.",
    }
