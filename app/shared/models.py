"""SobekAI records. Values are only filled from config or pipeline output."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Literal

RiskLevel = Literal["low", "moderate", "high", "critical"]
AlertStatus = Literal["active", "acknowledged", "resolved"]
DataQuality = Literal["demo", "awaiting_model_data", "unavailable"]
ValidationStatus = Literal["pending", "partial", "validated"]


def record(value: Any) -> dict[str, Any]:
    if hasattr(value, "to_dict"):
        return value.to_dict()
    if isinstance(value, list):
        return [record(item) for item in value]
    return asdict(value) if hasattr(value, "__dataclass_fields__") else value


@dataclass
class RiskCell:
    id: str
    latitude: float
    longitude: float
    risk_score: float
    risk_level: RiskLevel
    timestamp: str
    data_quality: DataQuality = "demo"
    features: dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class RiskPrediction:
    id: str
    region_id: str
    observation_date: str
    prediction_horizon: str
    risk_score: float | None
    risk_level: RiskLevel | None
    high_risk_area_km2: float | None
    data_quality: DataQuality
    source: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class SatelliteObservation:
    id: str
    source: str
    acquired_at: str | None
    bands: list[str]
    resolution: str
    revisit: str
    status: DataQuality
    note: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class HistoricalEvent:
    id: str
    name: str
    region: str
    start_date: str
    end_date: str
    severity: str | None
    data_sources: list[str]
    satellite_source: str
    validation_status: ValidationStatus
    official_url: str
    note: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class FloodExtent:
    id: str
    event_id: str
    source: str
    observed_at: str | None
    available: bool
    note: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class Alert:
    id: str
    location: str
    timestamp: str
    risk_score: float | None
    risk_level: RiskLevel | None
    prediction_horizon: str
    reason: str
    status: AlertStatus
    data_quality: DataQuality

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class ModelMetrics:
    iou: float | None
    precision: float | None
    recall: float | None
    f1: float | None
    auroc: float | None
    status: Literal["evaluation_pending", "available"]
    note: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class DataSource:
    id: str
    role: str
    name: str
    url: str
    resolution: str
    revisit: str
    status: DataQuality
    note: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class TimelinePoint:
    id: str
    label: str
    timestamp: str | None
    risk_level: RiskLevel | None
    mean_risk: float | None
    data_quality: DataQuality
    note: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class LearningModule:
    id: str
    title: str
    summary: str
    sections: list[dict[str, str]]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
