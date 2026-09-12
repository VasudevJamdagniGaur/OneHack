from app.api.services import PENDING_METRICS, build_state
from app.content.learn import learning_modules
from flood_ai.config import load_config


def test_app_state_does_not_invent_metrics():
    state = build_state(load_config(), pipeline=None)
    assert state["product"]["name"] == "SobekAI"
    assert state["metrics"]["status"] == "evaluation_pending"
    assert state["metrics"]["iou"] is None
    assert state["kpis"]["current_risk"]["label"] == "AWAITING MODEL DATA"
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


def test_learn_modules_are_structured():
    modules = learning_modules()
    assert len(modules) == 10
    assert modules[0].id == "floods"
