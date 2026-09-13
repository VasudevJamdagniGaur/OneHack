"""Build SobekAI API payloads from config and optional pipeline output."""

from __future__ import annotations

import csv
from pathlib import Path
from typing import Any

from app.content.learn import learning_modules
from app.content.live_location import emergency_contacts, live_location
from app.content.scenarios import flood_scenarios
from app.shared.models import (
    Alert,
    DataSource,
    HistoricalEvent,
    ModelMetrics,
    RiskPrediction,
    TimelinePoint,
)

PENDING_METRICS = ModelMetrics(
    iou=None,
    precision=None,
    recall=None,
    f1=None,
    auroc=None,
    status="evaluation_pending",
    note="Evaluation pending. The Global Flood Database extent for this event is not ingested.",
)


def build_state(config: dict[str, Any], pipeline: dict[str, Any] | None = None) -> dict[str, Any]:
    product = config.get("product", {})
    demo = pipeline is not None and config["project"].get("data_mode") == "sample"
    quality = "demo" if demo else "awaiting_model_data"
    return {
        "product": {
            "name": product.get("name", "SobekAI"),
            "subtitle": product.get("subtitle", "Satellite-Powered Flood Intelligence & Early Warning"),
            "version": product.get("version", "0.1.0-demo"),
        },
        "banner": "HISTORICAL DATA / DEMONSTRATION",
        "mode": config["project"]["mode"],
        "data_quality": quality,
        "data_label": "DEMO DATA" if demo else "AWAITING MODEL DATA",
        "disclaimer": (
            "Satellite-powered flood early-warning prototype. "
            "Historical satellite-based flood risk prediction. Not a live satellite feed."
        ),
        "region": _region(config),
        "event": _event(config),
        "archived_events": _archived_events(config),
        "scenarios": flood_scenarios(),
        "live_location": live_location(),
        "emergency_contacts": emergency_contacts(),
        "mode": {
            "live": "Live monitor. Not a live satellite feed. No real-time hazard feed is connected.",
            "simulator": "Scenario simulator. Historical replay. Not live.",
        },
        "header": _header(config, pipeline, quality),
        "kpis": _kpis(pipeline, quality),
        "distribution": _distribution(pipeline),
        "layers": _layers(demo),
        "prediction": _prediction(config, pipeline, quality).to_dict(),
        "timeline": [point.to_dict() for point in _timeline(pipeline, quality, config)],
        "alerts": [item.to_dict() for item in _alerts(pipeline, quality)],
        "metrics": PENDING_METRICS.to_dict(),
        "diagnostics": _diagnostics(pipeline),
        "data_sources": [item.to_dict() for item in _sources(config)],
        "model": _model_card(config, pipeline),
        "attribution": {
            "status": "feature_attribution_unavailable" if pipeline is None else "demo_features_from_sample_grid",
            "note": (
                "Feature attribution unavailable"
                if pipeline is None
                else "Click values come from the synthetic sample grid, not a fitted explainer."
            ),
        },
    }


def regions_payload(state: dict[str, Any]) -> dict[str, Any]:
    return {"regions": [state["region"]]}


def predictions_payload(state: dict[str, Any]) -> dict[str, Any]:
    return {"data_quality": state["data_quality"], "predictions": [state["prediction"]]}


def risk_map_payload(state: dict[str, Any]) -> dict[str, Any]:
    return {
        "region": state["region"],
        "layers": state["layers"],
        "legend": ["low", "moderate", "high", "critical"],
        "overlays": {
            "predicted_risk": "/risk_overlay.png" if state["layers"]["predicted_risk"]["enabled"] else None,
            "actual_flood": "/flood_overlay.png" if state["layers"]["actual_flood"]["enabled"] else None,
        },
        "attribution": state["attribution"],
    }


def inspect_cell(samples_csv: Path, latitude: float, longitude: float) -> dict[str, Any]:
    if not samples_csv.exists():
        return {
            "status": "awaiting_model_data",
            "note": "Feature attribution unavailable",
        }
    nearest = None
    nearest_distance = None
    with samples_csv.open(encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            lat = float(row["lat"])
            lon = float(row["lon"])
            distance = (lat - latitude) ** 2 + (lon - longitude) ** 2
            if nearest_distance is None or distance < nearest_distance:
                nearest = row
                nearest_distance = distance
    if nearest is None:
        return {"status": "awaiting_model_data", "note": "Feature attribution unavailable"}
    return {
        "status": "demo",
        "data_label": "DEMO DATA",
        "latitude": float(nearest["lat"]),
        "longitude": float(nearest["lon"]),
        "risk_score": float(nearest["flood_risk"]),
        "risk_level": nearest["risk_class"],
        "observation_date": None,
        "prediction_horizon": "sample analog, not a calibrated lead time",
        "features": {
            "recent_rainfall_mm_3d": float(nearest["precip_3d"]),
            "elevation_m": float(nearest["elevation"]),
            "slope_deg": float(nearest["slope"]),
            "height_above_river_m": float(nearest["hand"]),
            "distance_to_river_m": float(nearest["dist_to_river"]),
        },
        "unavailable": ["flood_probability_calibrated", "water_expansion", "historical_exposure"],
        "note": "Synthetic sample cell. Not a live observation and not an official alert.",
    }


def _region(config: dict[str, Any]) -> dict[str, Any]:
    region = config["region"]
    return {
        "id": region["id"],
        "name": region["name"],
        "country": region["country"],
        "state": region.get("state"),
        "admin": region.get("admin"),
        "river": region.get("river"),
        "bbox": region["bbox"],
        "center": region["center"],
        "anchor": region.get("anchor"),
        "bbox_note": region.get("bbox_note"),
    }


def _event(config: dict[str, Any]) -> dict[str, Any]:
    event = config["event"]
    region = config["region"]
    record = HistoricalEvent(
        id=event["id"],
        name=event["name"],
        region=f"{event.get('state', region.get('state', ''))}, {event.get('country', region['country'])}",
        start_date=event.get("peak_start") or "",
        end_date=event.get("peak_end") or "",
        severity=None,
        data_sources=[event["official_source"]],
        satellite_source=(
            "Terra and Aqua MODIS, 250 m, via the Global Flood Database. "
            "Not ingested. Sentinel-1 and Sentinel-2 are not used for this event."
        ),
        validation_status="pending",
        official_url=event["official_url"],
        note=event.get("date_note") or "Historical flood extent ingestion pending.",
    )
    payload = record.to_dict()
    payload.update({
        "country": event.get("country", region["country"]),
        "state": event.get("state", region.get("state")),
        "river": event.get("river", region.get("river")),
        "year": event.get("year"),
        "status_label": event.get("status_label", "Historical event"),
        "severity_label": "Not scored",
        "extent_status": "Historical flood extent ingestion pending.",
        "supporting_sources": event.get("supporting_sources", []),
        "active": True,
    })
    return payload


def _header(config: dict[str, Any], pipeline: dict[str, Any] | None, quality: str) -> dict[str, Any]:
    prithvi = config.get("prithvi", {})
    detector = "Third-party pretrained model present" if pipeline and pipeline.get("detector") else "Not run on this region"
    return {
        "selected_region": f"{config['region'].get('state', config['region']['name'])}, {config['region']['country']}",
        "place": "India · Bihar",
        "observation_date": config["temporal"].get("prediction_date") if quality == "demo" else None,
        "observation_note": "AWAITING MODEL DATA" if quality != "demo" else "Configured analog date. Not a satellite acquisition timestamp.",
        "prediction_horizon": None if quality != "demo" else "sample analog, not a calibrated lead time",
        "satellite_source": config["datasets"]["precipitation"]["name"],
        "satellite_status": "planned, not ingested",
        "model_status": f"SobekAI risk engine: untrained expert-weighted baseline. Prithvi-EO: {detector}.",
        "prithvi_id": prithvi.get("model_id"),
        "data_quality": quality,
    }


def _kpis(pipeline: dict[str, Any] | None, quality: str) -> dict[str, Any]:
    if pipeline is None:
        return {key: _awaiting() for key in (
            "current_risk", "high_risk_area", "critical_zones", "active_alerts", "latest_observation", "prediction_horizon"
        )}
    counts = pipeline["counts"]
    return {
        "current_risk": _demo(pipeline.get("mean_risk"), "mean sample-grid score"),
        "high_risk_area": _demo(pipeline.get("high_risk_area_km2"), "km^2 on synthetic cells"),
        "critical_zones": _demo(counts.get("critical"), "synthetic cells"),
        "active_alerts": _demo(None, "no official alerts"),
        "latest_observation": _demo(pipeline.get("prediction_date"), "configured analog, not an acquisition"),
        "prediction_horizon": _demo("eve of peak analog", "not a calibrated lead time"),
    }


def _distribution(pipeline: dict[str, Any] | None) -> dict[str, Any]:
    if pipeline is None or not pipeline.get("counts"):
        return {
            "status": "awaiting_model_data",
            "counts": None,
            "note": "Official area percentages are not calculated.",
        }
    keys = ("low", "moderate", "high", "critical")
    counts = {key: int(pipeline["counts"].get(key, 0)) for key in keys}
    return {
        "status": "demo",
        "data_label": "DEMO DATA",
        "counts": counts,
        "total": sum(counts.values()),
        "note": "Synthetic sample-grid cell counts. Not official flooded-area percentages.",
    }


def _layers(demo: bool) -> dict[str, Any]:
    def layer(enabled: bool, reason: str) -> dict[str, Any]:
        return {"enabled": enabled, "reason": reason, "data_quality": "demo" if enabled else "unavailable"}

    return {
        "predicted_risk": layer(demo, "Synthetic sample overlay" if demo else "No SobekAI risk grid has been produced for this event."),
        "actual_flood": layer(
            demo,
            "Synthetic flood mask, not an official extent" if demo else "Historical flood extent ingestion pending.",
        ),
        "satellite": layer(False, "No satellite scene has been ingested for this event."),
        "rainfall": layer(False, "CHIRPS not ingested."),
        "elevation": layer(False, "DEM not ingested."),
        "boundaries": layer(False, "Administrative boundaries not loaded."),
        "rivers": layer(False, "No river geometry file has been loaded. The base map may still label the Kosi."),
    }


def _prediction(config: dict[str, Any], pipeline: dict[str, Any] | None, quality: str) -> RiskPrediction:
    return RiskPrediction(
        id="sobekai-demo-ahr" if quality == "demo" else "sobekai-pending",
        region_id=config["region"]["id"],
        observation_date=config["temporal"]["prediction_date"] if quality == "demo" else "",
        prediction_horizon="sample analog before the configured peak" if quality == "demo" else "",
        risk_score=pipeline.get("mean_risk") if pipeline else None,
        risk_level=None,
        high_risk_area_km2=pipeline.get("high_risk_area_km2") if pipeline else None,
        data_quality=quality,  # type: ignore[arg-type]
        source="synthetic sample pipeline" if quality == "demo" else "not run",
    )


def _timeline(pipeline: dict[str, Any] | None, quality: str, config: dict[str, Any] | None = None) -> list[TimelinePoint]:
    if pipeline is None:
        start = (config or {}).get("event", {}).get("peak_start") or "2008-08-18"
        return [
            TimelinePoint(
                "breach",
                "Flood event",
                start,
                None,
                None,
                "awaiting_model_data",
                "Embankment breach dated 18 August 2008 in public accounts. This is not a model score.",
            ),
            TimelinePoint(
                "extent",
                "Observed flood extent",
                None,
                None,
                None,
                "awaiting_model_data",
                "Historical flood extent ingestion pending. No Global Flood Database raster is in the repository.",
            ),
        ]
    points = []
    for index, value in enumerate(pipeline.get("daily_means", []), start=1):
        points.append(
            TimelinePoint(
                id=f"sample-day-{index}",
                label=f"Sample day {index}",
                timestamp=None,
                risk_level=None,
                mean_risk=value,
                data_quality="demo",
                note="Synthetic analog day. Not a satellite timestamp and not a factual T-minus label.",
            )
        )
    return points


def _alerts(pipeline: dict[str, Any] | None, quality: str) -> list[Alert]:
    if quality != "demo" or pipeline is None:
        return []
    return [
        Alert(
            id="DEMO-NO-OFFICIAL-ALERT",
            location=pipeline.get("region", "configured region"),
            timestamp=pipeline.get("prediction_date", ""),
            risk_score=None,
            risk_level=None,
            prediction_horizon="not calibrated",
            reason="No official alert has been issued. The sample grid is not an operational warning.",
            status="resolved",
            data_quality="demo",
        )
    ]


def _diagnostics(pipeline: dict[str, Any] | None) -> dict[str, Any]:
    if pipeline is None:
        return {"status": "awaiting_model_data"}
    return {
        "status": "demo",
        "data_label": "DEMO DATA",
        "mean_risk_inside_synthetic_mask": pipeline.get("inside"),
        "mean_risk_outside_synthetic_mask": pipeline.get("outside"),
        "rising_before_analog_peak": pipeline.get("rising"),
        "note": "These diagnostics use the synthetic flood mask. They are not IoU or official skill scores.",
    }


def _archived_events(config: dict[str, Any]) -> list[dict[str, Any]]:
    items = []
    for event in config.get("archived_events", []):
        items.append({
            "id": event["id"],
            "name": event["name"],
            "region": event.get("region"),
            "official_source": event.get("official_source"),
            "official_url": event.get("official_url"),
            "status": event.get("status", "archived"),
            "active": False,
            "note": event.get("note", "Not the active demonstration."),
        })
    return items


def _sources(config: dict[str, Any]) -> list[DataSource]:
    datasets = config["datasets"]
    rain = datasets["precipitation"]
    dem = datasets["dem"]
    truth = datasets["ground_truth"]
    return [
        DataSource(
            "gfd-modis",
            "historical flood extent",
            truth["name"],
            truth["url"],
            truth["spatial_resolution"],
            "event product",
            "awaiting_model_data",
            "Preferred validation source. Raster not ingested. DFO event id not retrieved.",
        ),
        DataSource(
            "modis",
            "satellite for that flood extent",
            truth.get("satellite", "Terra and Aqua MODIS"),
            truth["url"],
            truth["spatial_resolution"],
            "event windows, not a live feed",
            "awaiting_model_data",
            "Configured satellite for the planned extent. Not ingested. Sentinel-1/2 are not used for this event.",
        ),
        DataSource("chirps-v3-sat", "rainfall", rain["name"], rain["info_url"], rain["spatial_resolution"], rain["temporal_resolution"], "awaiting_model_data", "Planned source. Not downloaded."),
        DataSource("cop-dem-glo30", "elevation", dem["name"], dem["url"], dem["spatial_resolution"], dem["temporal_resolution"], "awaiting_model_data", "Planned source. Not downloaded."),
        DataSource(
            "boundaries",
            "administrative boundaries",
            "Not configured",
            "",
            "not loaded",
            "not loaded",
            "unavailable",
            "No boundary dataset has been loaded.",
        ),
        DataSource(
            "prithvi-input",
            "flood segmentation input",
            "Sentinel-2 bands for Prithvi-EO-2.0-300M-TL-Sen1Floods11",
            config["prithvi"]["url"],
            "model expects six optical bands",
            "not a live feed",
            "unavailable",
            "Third-party IBM/NASA model. Not run on the selected region. Not a 2008 data source.",
        ),
    ]


def _model_card(config: dict[str, Any], pipeline: dict[str, Any] | None) -> dict[str, Any]:
    return {
        "segmentation_model": config["prithvi"]["model_id"],
        "segmentation_credit": "IBM/NASA Prithvi-EO, third-party pretrained model. Not trained by SobekAI.",
        "risk_engine": "SobekAI expert-weighted baseline",
        "risk_engine_trained": bool(config["model"]["trained"]),
        "version": config.get("product", {}).get("version", "0.1.0-demo"),
        "pipeline_ran": pipeline is not None,
    }


def _awaiting() -> dict[str, Any]:
    return {"value": None, "label": "AWAITING MODEL DATA", "unit": None}


def _demo(value: Any, unit: str) -> dict[str, Any]:
    return {"value": value, "label": "DEMO DATA", "unit": unit}
