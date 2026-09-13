from app.api.services import PENDING_METRICS, build_state
from app.content.learn import learning_modules
from flood_ai.config import load_config


def test_app_state_does_not_invent_metrics():
    state = build_state(load_config(), pipeline=None)
    assert state["product"]["name"] == "SobekAI"
    assert state["metrics"]["status"] == "evaluation_pending"
    assert state["metrics"]["iou"] is None
    assert state["kpis"]["current_risk"]["label"] == "AWAITING MODEL DATA"
    assert state["event"]["id"] == "kosi_bihar_2008"
    assert "Germany" not in state["event"]["name"]
    assert state["layers"]["predicted_risk"]["enabled"] is False
    assert state["layers"]["satellite"]["enabled"] is False


def test_demo_state_is_labeled(config=None):
    config = load_config()
    pipeline = {
        "counts": {"low": 1, "moderate": 1, "high": 1, "critical": 0},
        "mean_risk": 0.4,
        "high_risk_area_km2": 1.2,
        "prediction_date": "2021-07-13",
        "inside": 0.8,
        "outside": 0.2,
        "rising": True,
        "daily_means": [0.1, 0.4],
        "region": "Ahr Valley, Germany",
        "detector": "ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL-Sen1Floods11",
    }
    state = build_state(config, pipeline)
    assert state["distribution"]["counts"] == {"low": 1, "moderate": 1, "high": 1, "critical": 0}
    assert state["distribution"]["data_label"] == "DEMO DATA"
    assert state["data_label"] == "DEMO DATA"
    assert state["metrics"] == PENDING_METRICS.to_dict()
    assert state["event"]["severity"] is None
    assert state["event"]["validation_status"] == "pending"


def test_india_scenarios_are_the_active_catalog():
    state = build_state(load_config(), pipeline=None)
    scenarios = state["scenarios"]
    assert [item["id"] for item in scenarios] == [
        "kosi-2008",
        "assam-2022",
        "maharashtra-2021",
        "sikkim-2023",
        "wayanad-2024",
    ]
    assert scenarios[0]["default"] is True
    assert all(item["availability"]["risk_grid"] == "unavailable" for item in scenarios)
    assert "Germany" not in scenarios[0]["region"]


def test_live_monitor_is_fixed_on_delhi():
    state = build_state(load_config(), pipeline=None)
    place = state["live_location"]
    assert place["name"] == "Delhi"
    assert place["district"] == "New Delhi"
    assert place["classification"] == "selected"
    assert state["emergency_contacts"][0]["number"] == "112"
    assert all(item["source_url"].startswith("http") for item in state["emergency_contacts"])


def test_assam_package_does_not_invent_a_risk_grid():
    state = build_state(load_config(), pipeline=None)
    assam = next(item for item in state["scenarios"] if item["id"] == "assam-2022")
    assert assam["availability"]["visual_maps"] == "available"
    assert assam["availability"]["satellite"] == "unavailable"
    assert assam["availability"]["risk_grid"] == "unavailable"
    assert assam["package"]["risk_score"] is None
    assert assam["package"]["metrics"]["iou"] is None
    names = [place["name"] for place in assam["package"]["affected_places"]]
    assert "Hojai" in names and "Silchar" in names and "Imphal" in names
    assert all(place["status"] != "safe" for place in assam["package"]["unmapped_places"])
    assert assam["bbox"]["min_lat"] < 24.9


def test_learn_modules_are_structured():
    modules = learning_modules()
    assert len(modules) == 11
    assert modules[0].id == "floods"
