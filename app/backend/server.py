"""Local demo server for the flood early-warning dashboard.

Not a live satellite feed. The active event is the 2008 Kosi flood in Bihar.
The synthetic sample grid is not painted onto that map.
"""

from __future__ import annotations

import json
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "src"))

from app.api.services import (
    build_state,
    predictions_payload,
    regions_payload,
    risk_map_payload,
)
from app.content.learn import learning_modules
from flood_ai.config import load_config, project_root, resolve_path

HOST = "127.0.0.1"
PORT = 8080
PUBLIC = project_root() / "app" / "frontend" / "public"
SITE = project_root() / "app" / "frontend" / "site"
ROUTES = {
    "/": "index.html",
    "/risk-map": "risk-map.html",
    "/history": "history.html",
    "/alerts": "alerts.html",
    "/emergency": "emergency.html",
    "/simulation": "simulation.html",
    "/learn": "learn.html",
    "/methodology": "methodology.html",
}
STATE: dict = {}


def prepare_public() -> dict:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    config = load_config()
    # The sample pipeline is an Ahr-like synthetic valley. Do not place it on Bihar.
    for name in ("risk_overlay.png", "flood_overlay.png"):
        stale = PUBLIC / name
        if stale.exists():
            stale.unlink()
    state = build_state(config, pipeline=None)
    STATE.clear()
    STATE.update(state)
    (PUBLIC / "app_state.json").write_text(json.dumps(state), encoding="utf-8")
    _save_prithvi_preview(PUBLIC / "prithvi_example.png")
    _copy_site()
    return state


def _pipeline_summary(result: dict, config: dict) -> dict:
    counts = result["class_counts"]
    return {
        "counts": counts,
        "mean_risk": round(float(result["daily_means"][result["prediction_day"]]), 3),
        "high_risk_area_km2": round(result["high_risk_area_km2"], 2),
        "prediction_date": config["temporal"]["prediction_date"],
        "inside": round(result["comparison"]["mean_risk_inside_flood"], 3),
        "outside": round(result["comparison"]["mean_risk_outside_flood"], 3),
        "rising": bool(result["rising"]),
        "daily_means": [round(float(value), 3) for value in result["daily_means"]],
        "region": f"{config['region']['name']}, {config['region']['country']}",
        "detector": result["prithvi"]["model_id"],
    }


def _copy_site() -> None:
    for path in SITE.rglob("*"):
        if not path.is_file():
            continue
        target = PUBLIC / path.relative_to(SITE)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(path.read_bytes())


def _save_rgba(rgba: np.ndarray, path: Path) -> None:
    Image.fromarray(rgba, mode="RGBA").save(path)


def _save_prithvi_preview(path: Path) -> None:
    mask_path = resolve_path(load_config(), "processed_dir") / "prithvi_flood_mask_India_900498_S2Hand.npy"
    if not mask_path.exists():
        return
    mask = np.load(mask_path).astype(bool)
    canvas = np.zeros((*mask.shape, 4), dtype=np.uint8)
    canvas[:] = (22, 28, 34, 255)
    canvas[mask] = (74, 163, 255, 255)
    Image.fromarray(canvas, mode="RGBA").save(path)


def _risk_rgba(risk: np.ndarray) -> np.ndarray:
    """Continuous valley heat so the floodplain reads as a band, not a red block."""
    t = np.clip((risk - 0.18) / 0.72, 0.0, 1.0)
    yellow = np.array([244, 214, 122], dtype=np.float32)
    orange = np.array([239, 122, 50], dtype=np.float32)
    red = np.array([176, 32, 40], dtype=np.float32)
    mid = np.clip(t * 2.0, 0.0, 1.0)[..., None]
    hot = np.clip((t - 0.45) / 0.55, 0.0, 1.0)[..., None]
    rgb = yellow * (1.0 - mid) + orange * mid
    rgb = rgb * (1.0 - hot) + red * hot
    alpha = np.clip((risk - 0.22) * 230.0, 18.0, 200.0)
    colors = np.dstack([rgb, alpha]).astype(np.uint8)
    return colors


def _flood_rgba(mask: np.ndarray) -> np.ndarray:
    colors = np.zeros((*mask.shape, 4), dtype=np.uint8)
    colors[mask.astype(bool)] = (74, 163, 255, 180)
    return colors


def _dashboard_payload(result: dict, config: dict) -> dict:
    counts = result["class_counts"]
    return {
        "title": "Satellite Flood Early Warning",
        "mode": config["project"]["mode"],
        "data_label": config["sample"]["labeled"],
        "region": f"{config['region']['name']}, {config['region']['country']}",
        "event": config["event"]["name"],
        "prediction_date": config["temporal"]["prediction_date"],
        "validation_date": config["temporal"]["validation_date"],
        "high_risk_km2": round(result["high_risk_area_km2"], 2),
        "counts": counts,
        "inside": round(result["comparison"]["mean_risk_inside_flood"], 3),
        "outside": round(result["comparison"]["mean_risk_outside_flood"], 3),
        "overlap": int(result["comparison"]["n_overlap_cells"]),
        "rising": bool(result["rising"]),
        "daily_means": [round(float(v), 3) for v in result["daily_means"]],
        "risk_model": config["model"]["type"],
        "trained": bool(config["model"]["trained"]),
        "detector": result["prithvi"]["model_id"],
        "detector_status": result["prithvi"]["message"],
        "bbox": config["region"]["bbox"],
        "disclaimer": "Historical replay. Risk map is synthetic sample data. Not a live satellite feed.",
        "cache": str(int(Path(__file__).stat().st_mtime)),
    }


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self) -> None:
        path = self.path.split("?", 1)[0]
        if path in ROUTES:
            self.path = "/" + ROUTES[path]
            return super().do_GET()
        if path.startswith("/api/"):
            return self._api(path)
        return super().do_GET()

    def _api(self, path: str) -> None:
        state = STATE or json.loads((PUBLIC / "app_state.json").read_text(encoding="utf-8"))
        if path == "/api/app":
            body = state
        elif path == "/api/regions":
            body = regions_payload(state)
        elif path == "/api/predictions":
            body = predictions_payload(state)
        elif path == "/api/risk-map":
            body = risk_map_payload(state)
        elif path == "/api/history":
            body = {"events": [state["event"]], "archived_events": state.get("archived_events", [])}
        elif path == f"/api/history/{state['event']['id']}":
            body = state["event"]
        elif path == "/api/alerts":
            body = {"alerts": state["alerts"], "note": "No operational alerts."}
        elif path == "/api/metrics":
            body = state["metrics"]
        elif path == "/api/data-sources":
            body = {"sources": state["data_sources"]}
        elif path == "/api/scenarios":
            body = {"scenarios": state.get("scenarios", []), "default": "kosi-2008"}
        elif path == "/api/learn":
            body = {"modules": [module.to_dict() for module in learning_modules()]}
        elif path == "/api/risk-map/inspect":
            query = self.path.split("?", 1)[1] if "?" in self.path else ""
            params = dict(part.split("=", 1) for part in query.split("&") if "=" in part)
            body = {
                "status": "awaiting_model_data",
                "note": "Feature attribution unavailable. No Kosi risk grid has been produced.",
            }
        else:
            self.send_error(404, "Unknown SobekAI endpoint")
            return
        encoded = json.dumps(body).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


def main() -> None:
    print("Loading Kosi / Bihar historical configuration. No synthetic risk overlay.", flush=True)
    prepare_public()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Dashboard: http://{HOST}:{PORT}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
