const SobekAI = (() => {
  const PAGES = [
    ["dashboard", "/", "Dashboard", "grid"],
    ["risk-map", "/risk-map", "Risk Map", "map"],
    ["history", "/history", "Flood History", "clock"],
    ["alerts", "/alerts", "Warnings", "alert"],
    ["learn", "/learn", "Flood Academy", "book"],
    ["methodology", "/methodology", "Data & Methodology", "layers"],
  ];

  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    map: '<path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z"/><path d="M9 4v13M15 6.5v13"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>',
    alert: '<path d="M12 4 3 19h18L12 4Z"/><path d="M12 10v4M12 16.5h.01"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M4 5.5A2.5 2.5 0 0 1 6.5 8H20"/>',
    layers: '<path d="m12 3 9 5-9 5L3 8l9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/>',
    user: '<circle cx="12" cy="8" r="3"/><path d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19"/>',
    expand: '<path d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4"/>',
    drop: '<path d="M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10Z"/>',
    zone: '<path d="M4 16 9 6l5 6 2-2 4 6H4Z"/>',
    pin: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z"/><circle cx="12" cy="10" r="2"/>',
    eye: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    trend: '<path d="M4 16 9 11l3 3 8-8"/><path d="M15 6h5v5"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  };

  function icon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
  }

  async function load() {
    const response = await fetch("/api/app");
    if (!response.ok) throw new Error("SobekAI API unavailable");
    return response.json();
  }

  function chrome(active, state) {
    const links = PAGES.map(([id, href, label, glyph]) =>
      `<a class="${id === active ? "active" : ""}" href="${href}">${icon(glyph)}<span>${label}</span></a>`
    ).join("");
    const demo = state.data_label === "DEMO DATA" ? `<span class="demo-chip">${state.data_label}</span>` : "";
    return `<div class="shell">
      <header class="topbar">
        <button class="menu-btn" id="nav-toggle" type="button" aria-label="Open navigation">${icon("grid")}</button>
        <a class="brand" href="/">
          <img src="/assets/sobek-mark.png" alt="">
          <span class="word">SOBEKAI</span>
          <span class="rule"></span>
          <span class="tagline">See the Surge. Predict the Flood. Stay Ahead.</span>
        </a>
        <div class="top-actions">
          <input class="search" id="site-search" type="search" placeholder="Search" aria-label="Search this page">
          <div class="pill" title="${escapeAttr(state.disclaimer)}">
            <span class="dot"></span>
            <b>HISTORICAL MODE</b>
            <small>Satellite-based early-warning prototype</small>
            ${demo}
          </div>
          <div class="profile-wrap">
            <button class="icon-btn" id="profile-btn" type="button" aria-label="Profile">${icon("user")}</button>
            <div class="profile-note" id="profile-note" hidden>No account in this prototype.</div>
          </div>
        </div>
      </header>
      <div class="frame">
        <nav class="sidebar" aria-label="Primary">${links}</nav>
        <div class="workspace" id="workspace"></div>
      </div>
    </div>`;
  }

  function footer(state) {
    return `<footer class="footer">
      <strong>SOBEKAI</strong>
      <p>See the Surge. Predict the Flood. Stay Ahead.</p>
      <p>Water Intelligence for a Safer Tomorrow</p>
      <p>${state.disclaimer}</p>
    </footer>`;
  }

  function kpi(title, item, glyph, extraClass) {
    const value = item.value === null || item.value === undefined || item.value === "" ? "—" : item.value;
    const note = [item.label, item.unit].filter(Boolean).join(" · ");
    return `<article class="kpi ${extraClass || ""}"><span class="ico">${icon(glyph)}</span><span>${title}</span><b>${value}</b><em>${note}</em></article>`;
  }

  function layerButton(key, layer) {
    const disabled = layer.enabled ? "" : "disabled";
    const on = layer.enabled && key === "predicted_risk" ? " on" : "";
    return `<button class="layer${on}" data-layer="${key}" ${disabled} type="button">${labelFor(key)}<small>${layer.reason}</small></button>`;
  }

  function labelFor(key) {
    return {
      predicted_risk: "Predicted risk",
      actual_flood: "Actual flood extent",
      satellite: "Satellite",
      rainfall: "Rainfall",
      elevation: "Elevation",
      boundaries: "Administrative boundaries",
    }[key] || key;
  }

  function riskTone(score) {
    if (score == null || Number.isNaN(Number(score))) return "";
    const value = Number(score);
    if (value >= 0.9) return "critical";
    if (value >= 0.75) return "high";
    if (value >= 0.5) return "moderate";
    if (value >= 0.25) return "low";
    return "low";
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
    const full = document.getElementById("map-full");
    if (full) {
      full.onclick = () => {
        const frame = document.querySelector(".map-frame") || document.getElementById(elementId);
        if (!document.fullscreenElement) frame.requestFullscreen?.();
        else document.exitFullscreen?.();
        setTimeout(() => map.invalidateSize(), 200);
      };
    }
    setTimeout(() => map.invalidateSize(), 150);
  }

  function renderInspect(cell) {
    if (cell.status !== "demo") {
      return `<h2>Zone intelligence</h2><p>Feature attribution unavailable.</p>`;
    }
    const level = String(cell.risk_level || "").toLowerCase();
    const rows = [
      ["Coordinates", `${cell.latitude.toFixed(4)}, ${cell.longitude.toFixed(4)}`],
      ["Risk score", cell.risk_score.toFixed(3)],
      ["Risk level", `<span class="badge ${level}">${cell.risk_level}</span>`],
      ["Elevation", cell.features.elevation_m != null ? `${Number(cell.features.elevation_m).toFixed(1)} m` : "Awaiting model data"],
      ["Recent change", "Feature attribution unavailable"],
      ["Flood probability", "Feature attribution unavailable"],
      ["Observation", cell.observation_date || "Awaiting model data"],
      ["Risk outlook", cell.prediction_horizon || "Awaiting model data"],
    ];
    const factors = [
      ["Recent rainfall", cell.features.recent_rainfall_mm_3d, " mm / 3 d"],
      ["Elevation", cell.features.elevation_m, " m"],
      ["Slope", cell.features.slope_deg, " deg"],
    ].filter(([, value]) => value != null).map(([name, value, unit]) =>
      `<li><span>${name}</span><b>${Number(value).toFixed(2)}${unit}</b></li>`
    ).join("");
    return `<h2>Zone intelligence</h2>
      <p class="meta">DEMO DATA · synthetic sample cell. Model-estimated flood risk only.</p>
      <div class="kv">${rows.map(([label, value]) => `<span>${label}</span><b>${value}</b>`).join("")}</div>
      <h3>Why is this zone at risk?</h3>
      ${factors ? `<ul class="factors">${factors}</ul>` : "<p>Feature attribution unavailable.</p>"}
      <p class="meta">Unavailable: ${cell.unavailable.join(", ").replaceAll("_", " ")}</p>`;
  }

  function renderTimeline(points) {
    if (!points || !points.length) return `<div class="empty">Awaiting model data</div>`;
    return `<div class="timeline">${points.map((point) => {
      const tone = point.mean_risk == null ? "" : riskTone(point.mean_risk);
      const value = point.mean_risk == null ? "—" : point.mean_risk;
      return `<div class="day ${tone}"><i></i><span>${point.label}</span><b>${value}</b></div>`;
    }).join("")}</div>`;
  }

  function bindChrome() {
    const toggle = document.getElementById("nav-toggle");
    if (toggle) toggle.onclick = () => document.body.classList.toggle("nav-open");
    const profile = document.getElementById("profile-btn");
    const note = document.getElementById("profile-note");
    if (profile && note) {
      profile.onclick = () => { note.hidden = !note.hidden; };
    }
    const search = document.getElementById("site-search");
    if (search) {
      search.oninput = () => {
        const query = search.value.trim().toLowerCase();
        document.querySelectorAll(".kpi, .card, .warn article, #module-list button, tbody tr").forEach((node) => {
          node.hidden = query.length > 0 && !node.textContent.toLowerCase().includes(query);
        });
      };
    }
  }

  async function boot(page) {
    const root = document.getElementById("app");
    try {
      const state = await load();
      root.innerHTML = chrome(page, state);
      const workspace = document.getElementById("workspace");
      workspace.innerHTML = document.getElementById("page-template").innerHTML + footer(state);
      const video = document.querySelector(".bg-video");
      if (video && typeof video.play === "function") {
        video.playbackRate = 1 / 3;
        video.play().catch(() => {});
      }
      hydrate(page, state);
      bindChrome();
    } catch (error) {
      root.innerHTML = `<header class="topbar"><a class="brand" href="/"><img src="/assets/sobek-mark.png" alt=""><span class="word">SOBEKAI</span></a></header><div class="page"><div class="empty">Model unavailable. ${error.message}</div></div>`;
    }
  }

  function hydrate(page, state) {
    document.querySelectorAll("[data-text]").forEach((node) => {
      node.textContent = lookup(state, node.dataset.text) ?? "Awaiting model data";
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
      kpi("Flood risk", kpis.current_risk, "drop"),
      kpi("High-risk zones", kpis.high_risk_area, "zone"),
      kpi("Critical zones", kpis.critical_zones, "alert", "risk-critical"),
      kpi("Active warnings", kpis.active_alerts, "alert"),
      kpi("Latest observation", kpis.latest_observation, "calendar"),
      kpi("Risk outlook", kpis.prediction_horizon, "trend", "risk-outlook"),
    ].join("");
    const layers = document.getElementById("layers");
    if (layers) layers.innerHTML = Object.entries(state.layers).map(([key, layer]) => layerButton(key, layer)).join("");
    const event = state.event;
    document.getElementById("event-card").innerHTML = `<p class="label">Selected event</p>
      <div class="event">
        <div class="event-still">No historical image ingested</div>
        <div>
          <h2>${event.name}</h2>
          <p>${event.region}</p>
          <p>${event.start_date} — ${event.end_date}</p>
          <p>Status: not scored</p>
        </div>
        <a class="arrow" href="/history" aria-label="Open flood history">→</a>
      </div>`;
    document.getElementById("distribution").innerHTML = renderDistribution(state.distribution);
    document.getElementById("inspect").innerHTML = `<h2>Zone intelligence</h2><p>Click the map. ${state.attribution.note}</p>`;
    const timeline = document.getElementById("timeline");
    if (timeline) {
      timeline.innerHTML = `<div class="panel-head"><h2>Risk timeline</h2></div>${renderTimeline(state.timeline)}<p class="meta">${timelineNote(state)}</p>`;
    }
    document.getElementById("source-card").innerHTML = renderSources(state);
    document.getElementById("engine-card").innerHTML = renderEngine(state);
    if (window.L) mountMap(state, "map");
  }

  function renderDistribution(distribution) {
    if (!distribution || !distribution.counts || !distribution.total) {
      return `<h2>Risk distribution</h2><p>${distribution?.note || "Official area percentages are not calculated."}</p>`;
    }
    const counts = distribution.counts;
    const bar = ["low", "moderate", "high", "critical"].map((key) =>
      `<i class="${key}" style="flex:${counts[key]}"></i>`
    ).join("");
    const keys = ["low", "moderate", "high", "critical"].map((key) =>
      `<span>${key} ${counts[key]}</span>`
    ).join("");
    return `<h2>Risk distribution</h2><div class="dist">${bar}</div><div class="dist-key">${keys}</div><p class="meta">${distribution.data_label}. ${distribution.note}</p>`;
  }

  function renderSources(state) {
    const items = (state.data_sources || []).map((source) =>
      `<li>${source.name} · ${source.resolution || "Awaiting data metadata"} · ${source.status}</li>`
    ).join("");
    return `<h2>Data source</h2><p>Awaiting data metadata.</p><ul class="source-list">${items}</ul>`;
  }

  function renderEngine(state) {
    const model = state.model || {};
    return `<h2>AI engine</h2>
      <p class="ico">${icon("cpu")}</p>
      <h3 style="margin-top:0">SobekAI Risk Engine</h3>
      <p>Flood risk prediction from satellite & environmental data.</p>
      <p class="meta">${model.risk_engine || "SobekAI risk engine"}. Trained: ${model.risk_engine_trained}. Version: ${model.version || "—"}. No performance claim.</p>`;
  }

  function timelineNote(state) {
    const labeled = (state.timeline || []).some((point) => String(point.label).startsWith("T-"));
    if (!labeled) return "Sample-day means are not assigned to T-48h, T-24h, T-12h, T0, or EVENT. Those stages stay unfilled until the model timeline is connected.";
    return "Lead-time stages are present without scores. Risk progression is not fabricated.";
  }

  function hydrateRiskMap(state) {
    document.getElementById("layers").innerHTML = Object.entries(state.layers).map(([key, layer]) => layerButton(key, layer)).join("");
    document.getElementById("inspect").innerHTML = `<h2>Zone intelligence</h2><p>${state.attribution.note}</p>`;
    document.getElementById("timeline").innerHTML = `${renderTimeline(state.timeline)}<p class="meta">${timelineNote(state)}</p>`;
    if (window.L) mountMap(state, "map");
  }

  function hydrateHistory(state) {
    const event = state.event;
    document.getElementById("events").innerHTML = `<article class="card panel">
      <p class="label">${event.validation_status}</p>
      <h2>${event.name}</h2>
      <p>${event.region}</p>
      <p>${event.start_date} — ${event.end_date}</p>
      <p>Severity: not scored</p>
      <p>Source: ${event.data_sources.join(", ")}</p>
      <p>Satellite: ${event.satellite_source}</p>
      <p>${event.note}</p>
      <p><a class="btn" href="#event-detail">View event →</a></p>
    </article>`;
    document.getElementById("metrics").textContent = state.metrics.note;
    const timeline = document.getElementById("timeline");
    if (timeline) timeline.innerHTML = renderTimeline(state.timeline);
  }

  function hydrateAlerts(state) {
    const body = document.getElementById("alerts");
    if (!state.alerts.length) {
      body.innerHTML = `<div class="empty">Awaiting model data. No operational warnings have been issued.</div>`;
      return;
    }
    body.innerHTML = `<div class="warn">${state.alerts.map((alert) => {
      const level = String(alert.risk_level || "").toLowerCase();
      return `<article class="panel"><div class="panel-head"><span>${alert.id}</span>${level ? `<span class="badge ${level}">${alert.risk_level}</span>` : `<span class="badge">Not scored</span>`}</div>
        <p>${alert.location}</p>
        <div class="kv">
          <span>When</span><b>${alert.timestamp || "—"}</b>
          <span>Risk score</span><b>${alert.risk_score ?? "—"}</b>
          <span>Prediction horizon</span><b>${alert.prediction_horizon || "—"}</b>
          <span>Status</span><b>${alert.status}</b>
        </div>
        <p>${alert.reason}</p>
      </article>`;
    }).join("")}</div>
    <p class="meta">Model-estimated flood risk is not a statement that a flood will definitely occur.</p>`;
  }

  async function hydrateLearn() {
    const response = await fetch("/api/learn");
    const payload = await response.json();
    const list = document.getElementById("module-list");
    const view = document.getElementById("module-view");
    function show(module, button) {
      view.innerHTML = `<h2>${module.title}</h2><p>${module.summary}</p>${module.sections.map((section) => `<h3>${section.heading}</h3><p>${section.body}</p>`).join("")}`;
      list.querySelectorAll("button").forEach((item) => item.classList.remove("on"));
      if (button) button.classList.add("on");
    }
    list.innerHTML = payload.modules.map((module, index) => `<button class="layer" data-index="${index}" type="button">${module.title}</button>`).join("");
    list.querySelectorAll("button").forEach((button) => {
      button.onclick = () => show(payload.modules[Number(button.dataset.index)], button);
    });
    show(payload.modules[0], list.querySelector("button"));
  }

  function hydrateMethod(state) {
    document.getElementById("sources").innerHTML = `<h2>Data sources</h2><table><thead><tr><th>Role</th><th>Source</th><th>Resolution</th><th>Status</th></tr></thead><tbody>
      ${state.data_sources.map((source) => `<tr><td>${source.role}</td><td>${source.name}</td><td>${source.resolution || "Awaiting data metadata"}</td><td>${source.status}</td></tr>`).join("")}
    </tbody></table>`;
    const model = state.model;
    document.getElementById("model").innerHTML = `<h2>Model</h2><p>Flood segmentation: ${model.segmentation_model}</p><p>${model.segmentation_credit}</p><p>Risk engine: ${model.risk_engine}. Trained: ${model.risk_engine_trained}.</p><p>Version: ${model.version}</p><p class="meta">No accuracy, IoU, precision, or recall is shown until evaluation is complete.</p>`;
  }

  function escapeAttr(value) {
    return String(value).replaceAll('"', "&quot;");
  }

  return { boot };
})();
