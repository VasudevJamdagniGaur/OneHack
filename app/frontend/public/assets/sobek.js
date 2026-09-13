const SobekAI = (() => {
  const PAGES = [
    ["dashboard", "/", "Dashboard", "grid"],
    ["risk-map", "/risk-map", "Risk Map", "map"],
    ["history", "/history", "Flood History", "clock"],
    ["alerts", "/alerts", "Warnings", "alert"],
    ["emergency", "/emergency", "Emergency Help", "pin"],
    ["simulation", "/simulation", "Simulation", "cpu"],
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
            <span class="dot ${active === "simulation" || active === "history" || active === "risk-map" ? "" : "idle"}"></span>
            <b>${active === "simulation" || active === "history" || active === "risk-map" ? "SCENARIO SIMULATOR" : "LIVE MONITOR"}</b>
            <small>${active === "simulation" || active === "history" || active === "risk-map" ? "Historical replay · not live" : "Delhi, India · no live satellite feed"}</small>
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
      rivers: "Rivers",
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
    const anchor = state.region.anchor;
    if (anchor && anchor.lat != null && anchor.lon != null) {
      L.circleMarker([anchor.lat, anchor.lon], {
        radius: 6, color: "#35D6D0", weight: 2, fillColor: "#35D6D0", fillOpacity: 0.85,
      }).bindTooltip(anchor.name || "Koshi Barrage").addTo(map);
    }
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
      root.classList.remove("boot");
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
    if (page === "dashboard") hydrateLive(state);
    if (page === "simulation") hydrateSimulation(state);
    if (page === "emergency") hydrateEmergency(state);
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
    const dateLine = event.end_date ? `${event.start_date} — ${event.end_date}` : `${event.start_date || "Date not retrieved"}`;
    document.getElementById("event-card").innerHTML = `<p class="label">Selected event</p>
      <div class="event">
        <div class="event-still">No historical image ingested</div>
        <div>
          <h2>Kosi flood — Bihar, India</h2>
          <p>Event: ${event.name}</p>
          <p>Region: ${event.region}</p>
          <p>River: ${event.river || "Kosi / Koshi"}</p>
          <p>Date: ${dateLine}</p>
          <p>Status: ${event.status_label || "Historical event"}</p>
          <p>Severity: ${event.severity_label || "Not scored"}</p>
        </div>
        <a class="arrow" href="/history" aria-label="Open flood history">→</a>
      </div>
      <p class="meta">${event.note || ""}</p>`;
    document.getElementById("distribution").innerHTML = renderDistribution(state.distribution);
    document.getElementById("inspect").innerHTML = `<h2>Zone intelligence</h2><p>Click the map. ${state.attribution.note}</p>`;
    const timeline = document.getElementById("timeline");
    if (timeline) {
      timeline.innerHTML = `<div class="panel-head"><h2>Kosi flood timeline</h2></div>${renderTimeline(state.timeline)}<p class="meta">${timelineNote(state)}</p>`;
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
    if (!labeled) return "Only dated public facts are shown. Pre-event risk build-up is not shown because no observation series has been ingested.";
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
    const archived = (state.archived_events || []).map((item) => `<article class="card panel">
      <p class="label">${item.status}</p>
      <h2>${item.name}</h2>
      <p>${item.region}</p>
      <p>Not the active demonstration.</p>
      <p>${item.note}</p>
    </article>`).join("");
    const links = (event.supporting_sources || []).map((source) =>
      `<li><a href="${source.url}">${source.name}</a></li>`
    ).join("");
    const scenarios = state.scenarios || [];
    const scenarioCards = scenarios.map((item) => `<article class="card panel">
      <p class="label">India · historical</p>
      <h2>${item.display}</h2>
      <p>${item.region}</p>
      <p>${item.start_date || "Date not retrieved"}</p>
      <p>${item.flood_type}</p>
      <p>Satellite: ${item.availability.satellite}</p>
      <p>Flood extent: ${item.availability.flood_extent}</p>
      <p><a class="btn" href="/simulation?scenario=${item.id}">Open scenario →</a></p>
    </article>`).join("");
    document.getElementById("events").innerHTML = scenarioCards + archived;
    const sources = document.getElementById("event-sources");
    if (sources) {
      sources.innerHTML = `<h2>Data sources</h2><p><a href="${event.official_url}">${event.data_sources[0]}</a></p><ul class="source-list">${links}</ul><p class="meta">A source is listed here only when it is configured. Extent rasters, rainfall, and the DEM are not ingested.</p>`;
    }
    const prediction = document.getElementById("prediction-vs-actual");
    if (prediction) {
      prediction.innerHTML = `<div class="empty">SobekAI predicted risk: awaiting model data. No risk grid has been produced for this event.</div><div class="empty">Actual Kosi flood extent: historical flood extent ingestion pending.</div>`;
    }
    document.getElementById("metrics").textContent = state.metrics.note;
    const timeline = document.getElementById("timeline");
    if (timeline) timeline.innerHTML = renderTimeline(state.timeline);
  }

  function hydrateAlerts(state) {
    const body = document.getElementById("alerts");
    if (!state.alerts.length) {
      body.innerHTML = `<div class="empty">No live official alert data connected. SobekAI is not issuing a warning.</div>`;
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

  function delhi(state) {
    return state.live_location || {
      display: "Delhi, India",
      district: "New Delhi",
      lat: 28.6139,
      lon: 77.2090,
      source: "Fixed product location. Not browser geolocation.",
      river_context: "Delhi flood operations track the Yamuna. No live gauge reading is connected.",
    };
  }

  function modeSwitch(active) {
    return `<div class="modes" role="tablist">
      <a class="${active === "live" ? "on" : ""}" href="/">Live monitor</a>
      <a class="${active === "sim" ? "on" : ""}" href="/simulation">Scenario simulator</a>
    </div>
    <p class="meta">${active === "live" ? "This is not a live satellite feed." : "Historical replay. Not live."}</p>`;
  }

  function unavailable(title, note) {
    return `<section class="panel"><h2>${title}</h2><p class="meta">Data unavailable</p><p>${note}</p></section>`;
  }

  function hydrateLive(state) {
    const root = document.getElementById("live-root");
    if (!root) return;
    localStorage.removeItem("sobek-place");
    const place = delhi(state);
    root.innerHTML = liveMarkup(place, state.emergency_contacts || []);
    if (window.L) mountPlaceMap(place);
  }

  function contactRows(contacts) {
    if (!contacts.length) return "<p>No published contacts loaded.</p>";
    return contacts.map((item) => `<div class="contact">
      <div><b>${item.role}</b><p class="meta">${item.scope}</p></div>
      <a class="btn" href="${item.tel}">Call ${item.number}</a>
    </div>`).join("");
  }

  function liveMarkup(place, contacts) {
    return `${modeSwitch("live")}
      <section class="panel">
        <p class="label">Current location</p>
        <h2>${place.display}</h2>
        <div class="kv">
          <span>District</span><b>${place.district}</b>
          <span>Anchor</span><b>${place.lat.toFixed(4)}, ${place.lon.toFixed(4)}</b>
        </div>
        <p class="meta">${place.source} ${place.anchor || ""}</p>
      </section>
      <section class="live-grid">
        <section class="panel risk-hero">
          <p class="label">Current flood risk · Delhi</p>
          <h2>Data unavailable</h2>
          <p>No live risk score is connected for Delhi.</p>
          <div class="kv">
            <span>Next 6 hours</span><b>Data unavailable</b>
            <span>Next 24 hours</span><b>Data unavailable</b>
            <span>Next 72 hours</span><b>Data unavailable</b>
            <span>Trend</span><b>Data unavailable</b>
          </div>
        </section>
        ${unavailable("Risk contributors", "Rainfall, Yamuna level, satellite water extent, terrain, and historical susceptibility are not connected for Delhi.")}
        ${unavailable("Active warnings", "No live official alert feed is connected for Delhi. Published helplines are listed under Emergency help.")}
        ${unavailable("Flood risk trend", "No Delhi time series is connected. A simulated trend is not drawn.")}
      </section>
      <section class="panel map-panel">
        <div class="panel-head"><h2>Delhi</h2></div>
        <div class="map-frame short"><div id="live-map"></div></div>
        <p class="meta">Fixed on Delhi. Flood-risk, flood-extent, shelter, hospital, and road layers are not connected.</p>
      </section>
      <section class="live-grid">
        <section class="panel">
          <h2>Emergency help · Delhi</h2>
          ${contactRows(contacts)}
          <p class="meta">Numbers are published directory contacts, not live availability. Navigate is unavailable because no facility locations are loaded.</p>
        </section>
        ${unavailable("Nearest help", "No Delhi hospital, shelter, relief-camp, police-station, or fire-station dataset is connected.")}
        ${unavailable("Travel advisory", "Destination is within Delhi. No road-flood dataset is connected, so route risk is not estimated.")}
        ${unavailable("Flood impact", "Delhi affected-area, population, and infrastructure counts are not available.")}
        <section class="panel">
          <h2>Data status · Delhi</h2>
          <div class="kv">
            <span>Satellite</span><b>Not connected</b>
            <span>Rainfall</span><b>Not connected</b>
            <span>Yamuna level</span><b>Not connected</b>
            <span>Terrain</span><b>Not connected</b>
            <span>Official alerts</span><b>Not connected</b>
            <span>Published helplines</span><b>Listed</b>
            <span>Last updated</span><b>No observation timestamp</b>
          </div>
        </section>
        <section class="panel">
          <h2>Sobek AI insight</h2>
          <p>No explanation is generated for Delhi. ${place.river_context}</p>
          <p class="meta">${place.river_source_name ? `<a href="${place.river_source_url}">${place.river_source_name}</a>` : ""}</p>
        </section>
      </section>`;
  }

  function mountPlaceMap(place) {
    const node = document.getElementById("live-map");
    if (!node || node.dataset.ready) return;
    const map = L.map(node).setView([place.lat, place.lon], 11);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 17, attribution: "&copy; OpenStreetMap" }).addTo(map);
    L.circleMarker([place.lat, place.lon], { radius: 7, color: "#35D6D0", fillOpacity: 0.9 })
      .bindTooltip("Delhi").addTo(map);
    node.dataset.ready = "1";
    setTimeout(() => map.invalidateSize(), 150);
  }

  function hydrateSimulation(state) {
    const root = document.getElementById("sim-root");
    if (!root) return;
    const scenarios = state.scenarios || [];
    const requested = new URLSearchParams(location.search).get("scenario");
    const selected = scenarios.find((item) => item.id === requested) || scenarios.find((item) => item.default) || scenarios[0];
    root.innerHTML = `${modeSwitch("sim")}
      <p class="eyebrow">Historical replay</p>
      <h1>Flood scenario <em>simulator</em></h1>
      <p class="lede">Replay historical flood conditions and evaluate SobekAI's spatial risk response.</p>
      <section class="panel">
        <label>Select historical scenario
          <select id="scenario-select">${scenarios.map((item) => `<option value="${item.id}" ${item.id === selected.id ? "selected" : ""}>${item.display}</option>`).join("")}</select>
        </label>
        <div id="scenario-meta"></div>
        <button class="btn" id="run-sim" type="button">Run SobekAI simulation</button>
        <div id="sim-status"></div>
      </section>
      <section class="panel map-panel">
        <div class="panel-head"><h2>Scenario map</h2></div>
        <div class="map-frame"><div id="sim-map"></div></div>
        <div class="legend" id="sim-legend"></div>
      </section>
      <section id="sim-result"></section>`;
    const select = document.getElementById("scenario-select");
    const paint = (id) => {
      const scenario = scenarios.find((item) => item.id === id) || selected;
      paintScenario(scenario);
      history.replaceState(null, "", `/simulation?scenario=${scenario.id}`);
    };
    select.onchange = () => paint(select.value);
    document.getElementById("run-sim").onclick = () => runScenario(scenarios.find((item) => item.id === select.value));
    paint(selected.id);
  }

  function flag(value) {
    if (!value || value === "unavailable") return "Unavailable";
    if (value === "available") return "Available";
    return value;
  }

  function paintScenario(scenario) {
    const pack = scenario.package;
    const signals = pack ? pack.signals : null;
    document.getElementById("scenario-meta").innerHTML = `<div class="kv">
      <span>Event</span><b>${scenario.name}</b>
      <span>Country</span><b>${scenario.country}</b>
      <span>Region</span><b>${scenario.region}</b>
      <span>Year</span><b>${scenario.year || "—"}</b>
      <span>Hazard</span><b>Flood</b>
      <span>Mode</span><b>Historical simulation</b>
      <span>Date</span><b>${scenario.start_date || "Not retrieved"}</b>
      <span>Sentinel-1</span><b>${flag(scenario.availability.satellite)}</b>
      <span>Rainfall</span><b>${flag(scenario.availability.rainfall)}</b>
      <span>DEM</span><b>${flag(scenario.availability.terrain)}</b>
      <span>Flood-extent raster</span><b>${flag(scenario.availability.flood_extent)}</b>
      <span>Visual maps</span><b>${flag(scenario.availability.visual_maps)}</b>
      <span>Parameter mode</span><b>Historical. No user-simulated values.</b>
    </div>
    ${signals ? `<h3>Environmental signals</h3><div class="kv">
      <span>Satellite water</span><b>Data unavailable</b>
      <span>Rainfall</span><b>Data unavailable</b>
      <span>Elevation</span><b>Data unavailable</b>
      <span>Slope</span><b>Data unavailable</b>
      <span>Temporal change</span><b>Data unavailable</b>
      <span>River</span><b>Unavailable</b>
    </div>` : ""}
    <p class="meta">${scenario.date_note}</p><p class="meta">${scenario.bbox_note}</p>`;
    mountScenarioMap(scenario);
    document.getElementById("sim-result").innerHTML = "";
    document.getElementById("sim-status").innerHTML = "";
  }

  function mountScenarioMap(scenario) {
    const node = document.getElementById("sim-map");
    if (!node || !window.L) return;
    if (node._sobekMap) node._sobekMap.remove();
    const pack = scenario.package || {};
    const places = [...(pack.affected_places || []), ...(pack.unmapped_places || [])];
    const map = L.map(node);
    node._sobekMap = map;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 17, attribution: "&copy; OpenStreetMap" }).addTo(map);
    const affected = L.layerGroup();
    const unmapped = L.layerGroup();
    (pack.affected_places || []).forEach((place) => {
      const marker = L.circleMarker([place.lat, place.lon], { radius: 8, color: "#EF4444", fillColor: "#EF4444", fillOpacity: 0.9 });
      marker.bindPopup(placePopup(place));
      marker.addTo(affected);
    });
    (pack.unmapped_places || []).forEach((place) => {
      L.circleMarker([place.lat, place.lon], { radius: 6, color: "#94B1B6", fillColor: "#66858B", fillOpacity: 0.85 })
        .bindTooltip(`${place.name}: not in the supplied maps. Not certified safe.`)
        .addTo(unmapped);
    });
    affected.addTo(map);
    unmapped.addTo(map);
    if (places.length) {
      map.fitBounds(places.map((place) => [place.lat, place.lon]), { padding: [28, 28] });
    } else {
      const box = scenario.bbox;
      map.fitBounds([[box.min_lat, box.min_lon], [box.max_lat, box.max_lon]]);
      if (scenario.center) {
        L.circleMarker([scenario.center.lat, scenario.center.lon], { radius: 6, color: "#35D6D0", fillOpacity: 0.9 })
          .bindTooltip(scenario.center.label).addTo(map);
      }
    }
    const legend = document.getElementById("sim-legend");
    if (legend) {
      legend.innerHTML = places.length
        ? `<span><i class="swatch" style="background:#EF4444"></i>Supplied map: affected, access constrained</span>
           <span><i class="swatch" style="background:#66858B"></i>Not in the supplied maps. Not certified safe.</span>`
        : `<span>No place layer for this scenario.</span>`;
    }
    setTimeout(() => map.invalidateSize(), 150);
  }

  function placePopup(place) {
    return `<strong>${place.name}</strong><br>${place.district || ""}, ${place.state}<br>Affected on the supplied visual map. Access constrained.<br><span>Not an official closure. Not a flood polygon.</span>`;
  }

  function runScenario(scenario) {
    const status = document.getElementById("sim-status");
    const pack = scenario.package;
    if (!pack) {
      status.innerHTML = `<ol class="status-list">
        <li>Satellite observations: Not connected</li>
        <li>Rainfall: Not connected</li>
        <li>Terrain: Not connected</li>
        <li>Historical flood extent: Not connected</li>
        <li>Spatial risk: Not run</li>
      </ol><p class="meta">Nothing was inferred. No checkmarks are shown for missing inputs.</p>`;
      document.getElementById("sim-result").innerHTML = `<section class="panel"><h2>${scenario.display}</h2><p>Risk score: not available for this scenario.</p></section>`;
      return;
    }
    const rasters = pack.rasters || [];
    status.innerHTML = `<p class="label">Pipeline status</p><ol class="status-list">
      <li>Loading supplied visual maps: loaded. These are visual references, not raw satellite products.</li>
      ${rasters.map((item) => `<li>${item.id.replaceAll("_", " ")}: ${item.status === "available" ? "file present" : "not connected"}</li>`).join("")}
      <li>Spatial risk model: not run. Required rasters are missing.</li>
      <li>Model versus actual: not calculated.</li>
    </ol><p class="meta">This is not a live inference and not a precomputed risk analysis. Missing steps were not marked complete.</p>`;
    const affected = pack.affected_places || [];
    const unmapped = pack.unmapped_places || [];
    const visuals = pack.visual_references || [];
    document.getElementById("sim-result").innerHTML = `<section class="panel">
      <p class="label">Simulation result · historical</p>
      <h2>${scenario.display}</h2>
      <div class="kv">
        <span>Risk score</span><b>Not available</b>
        <span>Risk level</span><b>Not available</b>
        <span>IoU / precision / recall / F1</span><b>Not available</b>
        <span>Reason</span><b>${pack.metrics.reason}</b>
        <span>Lead time</span><b>Lead time unavailable for this dataset.</b>
      </div>
    </section>
    <section class="panel">
      <h2>Supplied affected places</h2>
      <p class="meta">Red places have a supplied inundation map. Gray places are not on those maps. Gray is not a safe-area certificate, and it is not drawn in the low-risk green.</p>
      <div class="place-grid">${affected.map((place) => `<article>
        <img src="${place.image}" alt="${place.name} visual map">
        <h3>${place.name}${place.state === "Assam" ? "" : " · " + place.state}</h3>
        <p>Affected on the supplied map. Access constrained.</p>
        <p class="meta">${place.access_note}</p>
        <p class="meta">${place.anchor_source}</p>
      </article>`).join("")}</div>
    </section>
    <section class="panel">
      <h2>Not in the supplied maps</h2>
      <div class="kv">${unmapped.map((place) => `<span>${place.name}</span><b>Not certified safe</b>`).join("")}</div>
    </section>
    <section class="panel">
      <h2>Before-flood visuals</h2>
      <p class="meta">Dates, sensors, and bounds were not readable from these files. They are not shown as Sentinel-1 products.</p>
      <div class="place-grid">${visuals.map((item) => `<article>
        <img src="${item.file}" alt="${item.original_name}">
        <h3>${item.original_name}</h3>
        <p class="meta">${item.note}</p>
      </article>`).join("")}</div>
    </section>
    <section class="panel">
      <h2>Why is the risk high?</h2>
      <p>A risk explanation is not generated. Satellite water, rainfall, terrain, and temporal change are not connected, so the risk engine did not score these cells.</p>
      <p class="meta">The supplied maps show inundation at the named places. That is a visual observation, not a causal claim from the model.</p>
    </section>`;
  }

  function hydrateEmergency(state) {
    const root = document.getElementById("help-root");
    if (!root) return;
    const place = delhi(state);
    const contacts = state.emergency_contacts || [];
    root.innerHTML = `<p class="eyebrow">Decision support · ${place.display}</p>
      <h1>Emergency <em>help</em></h1>
      <p class="lede">Published numbers for the fixed Delhi location. Facility locations are not connected, so View and Navigate are not offered.</p>
      <section class="panel">
        ${contacts.map((item) => `<article class="contact-card">
          <h2>${item.role}</h2>
          <div class="kv">
            <span>Number</span><b>${item.number}</b>
            <span>Scope</span><b>${item.scope}</b>
            <span>Source</span><b><a href="${item.source_url}">${item.source_name}</a></b>
          </div>
          <p><a class="btn" href="${item.tel}">Call</a></p>
        </article>`).join("")}
        <p class="meta">These are directory contacts. They are not a live status of ambulances, stations, or control rooms.</p>
      </section>
      <section class="panel">
        <h2>Nearest help in Delhi</h2>
        <p>No hospital, shelter, relief-camp, police-station, or fire-station dataset is connected.</p>
        <p class="meta">Show on map is unavailable until a location layer exists.</p>
      </section>`;
  }

  return { boot };
})();
