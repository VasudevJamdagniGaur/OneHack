"""Flood Academy modules. Educational text, not model scores."""

from __future__ import annotations

from app.shared.models import LearningModule


def learning_modules() -> list[LearningModule]:
    return [
        LearningModule(
            "floods",
            "What is a flood?",
            "A flood is water covering land that is usually dry.",
            [
                {"heading": "River floods", "body": "A river rises out of its channel after prolonged rain or snowmelt. Water spreads across the floodplain."},
                {"heading": "Flash floods", "body": "Intense rain, often in steep terrain, produces a fast rise. The Ahr Valley 2021 event is this kind of valley flood."},
                {"heading": "Urban floods", "body": "Drainage cannot carry rain away, so streets and basements flood even away from a major river."},
                {"heading": "Coastal floods", "body": "Storm surge, high tide, or a tsunami pushes sea water inland. SobekAI is not configured for coastal surge."},
            ],
        ),
        LearningModule(
            "satellites",
            "How satellites see floods",
            "Satellites do not stream a live video of a river. They revisit on a schedule.",
            [
                {"heading": "Satellite imagery", "body": "Each pass records a grid of measurements. A later pass is a new observation, not a continuous feed."},
                {"heading": "Sentinel-1", "body": "C-band radar. It can see through clouds, which matters during storms. Revisit over Europe is about 6 days with two satellites."},
                {"heading": "Sentinel-2", "body": "Optical imaging. Useful for water indices when the sky is clear. Clouds hide the ground."},
                {"heading": "Resolution and revisit", "body": "Resolution is the size of one pixel. Revisit is how often a new pixel is acquired. Neither is instant."},
            ],
        ),
        LearningModule(
            "bands",
            "Understanding satellite bands",
            "A band is one wavelength range, not a color filter for decoration.",
            [
                {"heading": "Blue, green, red", "body": "Visible light. Useful for a photo-like view. Weak through cloud."},
                {"heading": "NIR", "body": "Near infrared. Vegetation reflects it strongly. Open water absorbs it."},
                {"heading": "SWIR", "body": "Shortwave infrared. Sensitive to moisture and helps separate water from wet soil or shadow."},
                {"heading": "SAR VV/VH", "body": "Radar polarizations. Smooth water is often dark in backscatter. SobekAI's Prithvi detector uses optical bands, not VV/VH."},
            ],
        ),
        LearningModule(
            "ndwi",
            "NDWI",
            "An index is a formula. It is not an AI prediction.",
            [
                {"heading": "Formula", "body": "NDWI = (Green - NIR) / (Green + NIR). Higher values often mean more open water."},
                {"heading": "What it is not", "body": "NDWI does not forecast a flood. It describes a single optical observation, and clouds or built surfaces can confuse it."},
            ],
        ),
        LearningModule(
            "pipeline",
            "How SobekAI works",
            "SobekAI is the early-warning layer. Prithvi is a third-party detector.",
            [
                {"heading": "Pipeline", "body": "Satellite observation, preprocessing, flood segmentation, temporal features plus rainfall, elevation, and slope, then the SobekAI risk engine, a spatial risk map, and alerts."},
                {"heading": "Who does what", "body": "IBM/NASA Prithvi-EO-2.0-300M-TL-Sen1Floods11 maps water already visible in Sentinel-2. SobekAI's own layer turns rainfall and terrain into a location-specific risk score before the peak."},
            ],
        ),
        LearningModule(
            "detection-vs-prediction",
            "Detection vs prediction",
            "Seeing water now is not the same as warning that risk is rising.",
            [
                {"heading": "Flood detection", "body": "Satellite image, then a model, then an answer to: where is flooding visible now?"},
                {"heading": "Flood prediction", "body": "Earlier observations plus environmental features, then a risk model, then an answer to: where is model-estimated flood risk increasing?"},
                {"heading": "SobekAI", "body": "The product is intended as early-warning intelligence. It is not only a map of water that is already there."},
            ],
        ),
        LearningModule(
            "validation",
            "How we validate SobekAI",
            "A historical event is the test, not a random split of the same pixels.",
            [
                {"heading": "Steps", "body": "Take observations from before the peak. Produce a risk map. Retrieve the later official flood extent. Compare. Metrics are computed only after that comparison exists."},
                {"heading": "Status", "body": "IoU, precision, recall, F1, and AUROC are evaluation pending until the official EMS extent is ingested. The current sample comparison is synthetic."},
            ],
        ),
        LearningModule(
            "risk-map",
            "Understanding the risk map",
            "Each cell has a score from 0 to 1.",
            [
                {"heading": "Levels", "body": "Low, moderate, high, and critical are bins of that score. Thresholds live in config.yaml and can change."},
                {"heading": "Meaning", "body": "A high cell means model-estimated flood risk is high for that location and time. It does not mean a flood will definitely occur."},
            ],
        ),
        LearningModule(
            "limitations",
            "Limitations",
            "A serious system states what it cannot see.",
            [
                {"heading": "Revisit", "body": "A satellite that has not passed yet cannot update the map."},
                {"heading": "Clouds", "body": "Optical scenes, including the inputs Prithvi uses, fail under cloud. Radar is the usual workaround and is not in the v1 risk engine."},
                {"heading": "Resolution and history", "body": "Rainfall grids are coarser than a street. A model fit or scored on one valley may not transfer."},
                {"heading": "Uncertainty", "body": "Scores are estimates. The current SobekAI risk engine is an expert-weighted baseline and has not been trained."},
            ],
        ),
        LearningModule(
            "preparedness",
            "Flood preparedness",
            "SobekAI does not replace official emergency authorities.",
            [
                {"heading": "General guidance", "body": "Know the local warning service, avoid flooded roads, and move to higher ground if officials say so. This page is education, not an evacuation order."},
                {"heading": "Authority", "body": "For the Ahr Valley event, official mapping came from Copernicus EMS. Follow the competent civil-protection authority, not this prototype."},
            ],
        ),
    ]
