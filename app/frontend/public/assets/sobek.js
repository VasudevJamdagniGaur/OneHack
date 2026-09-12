const SobekAI = (() => {
  const PAGES = [
    ["dashboard", "/", "Dashboard"],
    ["risk-map", "/risk-map", "Risk Map"],
    ["history", "/history", "History"],
    ["alerts", "/alerts", "Alerts"],
    ["learn", "/learn", "Learn"],
    ["methodology", "/methodology", "Data & Methodology"],
  ];

  async function load() {
    const response = await fetch("/api/app");
    if (!response.ok) throw new Error("SobekAI API unavailable");
    return response.json();
  }

  function chrome(active) {
    const links = PAGES.map(([id, href, label]) =>
      `<a class="item${id === active ? " active" : ""}" href="${href}">${label}</a>`
    ).join("");
    return `<header class="nav"><a class="brand" href="/"><img class="logo" src="/assets/sobek-logo.png" alt="SobekAI"><span>Satellite-Powered Flood Intelligence & Early Warning</span></a>${links}</header><div class="waterline" aria-hidden="true"></div>`;
  }

  function banner(state) {
    return `<div class="banner">${state.banner} · ${state.data_label} · ${state.disclaimer}</div>`;
  }

  function kpi(title, item) {
    const value = item.value === null || item.value === undefined ? "—" : item.value;
    return `<article class="card"><span>${title}</span><b>${value}</b><em>${item.label}</em></article>`;
  }

  function layerButton(key, layer) {
    const disabled = layer.enabled ? "" : "disabled";
    const on = layer.enabled && (key === "predicted_risk") ? " on" : "";
    return `<button class="layer${on}" data-layer="${key}" ${disabled} type="button">${labelFor(key)}<br><small>${layer.reason}</small></button>`;
  }

  function labelFor(key) {
    return {
      predicted_risk: "Predicted risk",
      actual_flood: "Actual flood extent",
      satellite: "Satellite",
      rainfall: "Rainfall",
      elevation: "Elevation",
      boundaries: "Administrative boundaries",
    }[key];
  }

  function mountMap(state, elementId) {
    const box = state.region.bbox;
    const bounds = [[box.min_lat, box.min_lon], [box.max_lat, box.max_lon]];
    const map = L.map(elementId).fitBounds(bounds);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 17,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    const overlays = {};
    if (state.layers.predicted_risk.enabled) {
      overlays.predicted_risk = L.imageOverlay("/risk_overlay.png", bounds, { opacity: 0.85 }).addTo(map);
    }
    if (state.layers.actual_flood.enabled) {
      overlays.actual_flood = L.imageOverlay("/flood_overlay.png", bounds, { opacity: 0.8 });
    }
    map.on("click", async (event) => {
      const panel = document.getElementById("inspect");
      if (!panel) return;
      const response = await fetch(`/api/risk-map/inspect?lat=${event.latlng.lat}&lon=${event.latlng.lng}`);
      const cell = await response.json();
      panel.innerHTML = renderInspect(cell);
    });
    document.querySelectorAll("button.layer").forEach((button) => {
      button.onclick = () => {
        const key = button.dataset.layer;
        const overlay = overlays[key];
        if (!overlay) return;
        if (map.hasLayer(overlay)) {
          map.removeLayer(overlay);
          button.classList.remove("on");
        } else {
          overlay.addTo(map);
          button.classList.add("on");
        }
      };
    });
    const slider = document.getElementById("compare-slider");
    if (slider && overlays.predicted_risk && overlays.actual_flood) {
      overlays.actual_flood.addTo(map);
      slider.oninput = () => {
        const mix = Number(slider.value) / 100;
        overlays.predicted_risk.setOpacity(1 - mix);
        overlays.actual_flood.setOpacity(mix);
      };
    }
    setTimeout(() => map.invalidateSize(), 150);
  }

  function renderInspect(cell) {
    if (cell.status !== "demo") {
      return `<h2>Why is this area at risk?</h2><p>Feature attribution unavailable</p>`;
    }
    const features = Object.entries(cell.features).map(([key, value]) => `<div class="bar"><span>${key.replaceAll("_", " ")}</span><b>${Number(value).toFixed(2)}</b></div>`).join("");
    return `<h2>Why is this area at risk?</h2>
      <p>DEMO DATA · synthetic sample cell. Model-estimated flood risk only.</p>
      <p>Coordinates ${cell.latitude.toFixed(4)}, ${cell.longitude.toFixed(4)}</p>
      <p>Risk score ${cell.risk_score.toFixed(3)} · ${cell.risk_level}</p>
      <p>Prediction horizon: ${cell.prediction_horizon}</p>
      ${features}
      <p>Unavailable: ${cell.unavailable.join(", ")}</p>`;
  }

  async function boot(page) {
    const root = document.getElementById("app");
    try {
      const state = await load();
      root.innerHTML = chrome(page) + banner(state) + document.getElementById("page-template").innerHTML;
      const video = document.querySelector(".bg-video");
      if (video && typeof video.play === "function") {
        video.playbackRate = 1 / 3;
        video.play().catch(() => {});
      }
      hydrate(page, state);
    } catch (error) {
      root.innerHTML = `<header class="nav"><a class="brand" href="/"><img class="logo" src="/assets/sobek-logo.png" alt="SobekAI"></a></header><div class="page"><div class="empty">Model unavailable. ${error.message}</div></div>`;
    }
  }

  function hydrate(page, state) {
    document.querySelectorAll("[data-text]").forEach((node) => {
      node.textContent = lookup(state, node.dataset.text) ?? "AWAITING MODEL DATA";
    });
    if (page === "dashboard") hydrateDashboard(state);
    if (page === "risk-map") hydrateRiskMap(state);
    if (page === "history") hydrateHistory(state);
    if (page === "alerts") hydrateAlerts(state);
    if (page === "learn") hydrateLearn();
    if (page === "methodology") hydrateMethod(state);
  }

  function lookup(state, path) {
    return path.split(".").reduce((value, key) => (value == null ? value : value[key]), state);
  }

  function hydrateDashboard(state) {
    const kpis = state.kpis;
    document.getElementById("kpis").innerHTML = [
      kpi("Current risk", kpis.current_risk),
      kpi("High-risk area", kpis.high_risk_area),
      kpi("Critical zones", kpis.critical_zones),
      kpi("Active alerts", { value: "None", label: "AWAITING MODEL DATA" }),
      kpi("Latest observation", kpis.latest_observation),
      kpi("Prediction horizon", kpis.prediction_horizon),
    ].join("");
    document.getElementById("layers").innerHTML = Object.entries(state.layers).map(([key, layer]) => layerButton(key, layer)).join("");
    document.getElementById("distribution").innerHTML = `<p>${state.data_label}. Official area percentages are not calculated.</p>`;
    document.getElementById("inspect").innerHTML = `<h2>Why is this area at risk?</h2><p>Click the map. ${state.attribution.note}</p>`;
    if (window.L) mountMap(state, "map");
  }

  function hydrateRiskMap(state) {
    document.getElementById("layers").innerHTML = Object.entries(state.layers).map(([key, layer]) => layerButton(key, layer)).join("");
    document.getElementById("inspect").innerHTML = `<h2>Risk intelligence</h2><p>${state.attribution.note}</p>`;
    const days = state.timeline.map((point) => {
      const height = point.mean_risk == null ? 0 : Math.round(point.mean_risk * 100);
      return `<div class="day"><i style="height:${height}%"></i><span>${point.label}</span><b>${point.mean_risk ?? "—"}</b></div>`;
    }).join("");
    document.getElementById("timeline").innerHTML = days || `<div class="empty">AWAITING MODEL DATA</div>`;
    if (window.L) mountMap(state, "map");
  }

  function hydrateHistory(state) {
    const event = state.event;
    document.getElementById("events").innerHTML = `<article class="card">
      <span>${event.validation_status}</span>
      <h2>${event.name}</h2>
      <p>${event.region}</p>
      <p>${event.start_date} to ${event.end_date}</p>
      <p>Severity: not scored</p>
      <p>Source: ${event.data_sources.join(", ")}</p>
      <p>Satellite: ${event.satellite_source}</p>
      <p>${event.note}</p>
    </article>`;
    document.getElementById("metrics").textContent = state.metrics.note;
    const timeline = document.getElementById("timeline");
    if (timeline) {
      timeline.innerHTML = state.timeline.map((point) => {
        const height = point.mean_risk == null ? 0 : Math.round(point.mean_risk * 100);
        return `<div class="day"><i style="height:${height}%"></i><span>${point.label}</span><b>${point.mean_risk ?? "—"}</b></div>`;
      }).join("");
    }
  }

  function hydrateAlerts(state) {
    const body = document.getElementById("alerts");
    if (!state.alerts.length) {
      body.innerHTML = `<div class="empty">AWAITING MODEL DATA. No operational alerts have been issued.</div>`;
      return;
    }
    body.innerHTML = `<table><thead><tr><th>ID</th><th>Location</th><th>Level</th><th>Status</th><th>Reason</th></tr></thead><tbody>
      ${state.alerts.map((alert) => `<tr><td>${alert.id}</td><td>${alert.location}</td><td>${alert.risk_level ?? "—"}</td><td>${alert.status}</td><td>${alert.reason}</td></tr>`).join("")}
    </tbody></table><p>Model-estimated flood risk is not a statement that a flood will definitely occur.</p>`;
  }

  async function hydrateLearn() {
    const response = await fetch("/api/learn");
    const payload = await response.json();
    const list = document.getElementById("module-list");
    const view = document.getElementById("module-view");
    function show(module) {
      view.innerHTML = `<h1>${module.title}</h1><p>${module.summary}</p>${module.sections.map((section) => `<h2>${section.heading}</h2><p>${section.body}</p>`).join("")}`;
    }
    list.innerHTML = payload.modules.map((module, index) => `<button class="layer" data-index="${index}" type="button">${module.title}</button>`).join("");
    list.querySelectorAll("button").forEach((button) => {
      button.onclick = () => show(payload.modules[Number(button.dataset.index)]);
    });
    show(payload.modules[0]);
  }

  function hydrateMethod(state) {
    document.getElementById("sources").innerHTML = `<table><thead><tr><th>Role</th><th>Source</th><th>Resolution</th><th>Status</th></tr></thead><tbody>
      ${state.data_sources.map((source) => `<tr><td>${source.role}</td><td>${source.name}</td><td>${source.resolution}</td><td>${source.status}</td></tr>`).join("")}
    </tbody></table>`;
    const model = state.model;
    document.getElementById("model").innerHTML = `<p>Flood segmentation: ${model.segmentation_model}</p><p>${model.segmentation_credit}</p><p>Risk engine: ${model.risk_engine}. Trained: ${model.risk_engine_trained}.</p><p>Version: ${model.version}</p>`;
  }

  return { boot };
})();
