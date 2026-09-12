# SobekAI backend

Python stdlib server. It does not replace the `flood_ai` pipeline.

On startup it runs the sample pipeline, writes overlays, and serves:

- `GET /api/regions`
- `GET /api/predictions`
- `GET /api/risk-map`
- `GET /api/risk-map/inspect`
- `GET /api/history`
- `GET /api/history/emsr517_aoi15`
- `GET /api/alerts`
- `GET /api/metrics`
- `GET /api/data-sources`
- `GET /api/learn`

Metrics stay `evaluation_pending` until an official flood extent is ingested.
