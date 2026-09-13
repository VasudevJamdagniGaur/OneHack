from flood_ai.config import REQUIRED_TOP_LEVEL, load_config, project_root, resolve_path


def test_config_loads_required_keys(config):
    for key in REQUIRED_TOP_LEVEL:
        assert key in config


def test_project_is_historical_replay(config):
    assert config["project"]["mode"] == "historical_replay"
    assert config["project"]["hazard"] == "flood"
    assert config["project"]["data_mode"] == "sample"
    assert config["model"]["trained"] is False


def test_region_and_event_are_kosi_2008(config):
    assert config["region"]["id"] == "kosi_bihar"
    assert config["region"]["country"] == "India"
    assert config["event"]["id"] == "kosi_bihar_2008"
    assert config["event"]["peak_start"] == "2008-08-18"
    assert config["temporal"]["prediction_date"] is None


def test_paths_resolve_inside_repo(config):
    samples = resolve_path(config, "samples_dir")
    assert samples == project_root() / "data" / "samples"
