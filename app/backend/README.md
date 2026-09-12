# Backend placeholder

Planned: a small FastAPI (or static JSON) service that reads `data/processed` risk grids and returns:

- region / event metadata
- prediction date
- high-risk area km²
- class counts
- per-cell `lat, lon, flood_risk`

Not implemented in Phase 1. The console dashboard in `flood_ai.pipeline.format_dashboard_text` is the current stand-in.
