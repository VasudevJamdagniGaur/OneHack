const SobekAI = (() => {
  const PAGES = [
    ["dashboard", "/", "Dashboard", "grid"],
    ["simulation", "/simulation", "Simulation", "cpu"],
    ["risk-map", "/risk-map", "Risk Map", "map"],
    ["history", "/history", "Flood History", "clock"],
    ["alerts", "/alerts", "Warnings", "alert"],
    ["emergency", "/emergency", "Emergency Help", "pin"],
    ["learn", "/learn", "Flood Academy", "book"],
    ["chats", "/chats", "Chats", "chat"],
  ];

  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    map: '<path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z"/><path d="M9 4v13M15 6.5v13"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>',
    alert: '<path d="M12 4 3 19h18L12 4Z"/><path d="M12 10v4M12 16.5h.01"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M4 5.5A2.5 2.5 0 0 1 6.5 8H20"/>',
    layers: '<path d="m12 3 9 5-9 5L3 8l9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    chat: '<path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H9l-4 3v-3.2A2.5 2.5 0 0 1 5 13.5v-7Z"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/>',
    user: '<circle cx="12" cy="8" r="3"/><path d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19"/>',
    bell: '<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15L6 16.5Z"/><path d="M10 19.5a2 2 0 0 0 4 0"/>',
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
    const demo = active !== "risk-map" && state.data_label === "DEMO DATA" ? `<span class="demo-chip">${state.data_label}</span>` : "";
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
          <div class="pill">
            <span class="dot ${active === "simulation" || active === "history" ? "" : "idle"}"></span>
            <b>${active === "simulation" || active === "history" ? "SCENARIO SIMULATOR" : active === "risk-map" ? "CURRENT ASSESSMENT" : "LIVE MONITOR"}</b>
            ${active === "simulation" || active === "history" ? `<small>Historical replay</small>` : active === "risk-map" ? `<small>Delhi · not a simulation</small>` : ""}
            ${demo}
          </div>
          <div class="bell-wrap">
            <button class="icon-btn" id="bell-btn" type="button" aria-label="Official announcements">${icon("bell")}<i class="bell-badge" id="bell-badge" hidden></i></button>
            <div class="bell-panel" id="bell-panel" hidden></div>
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

  let simAnnouncements = [];

  const EMERGENCY_CALLS = [["112", "tel:112"], ["108", "tel:108"], ["1077", "tel:1077"]];
  const FLOOD_UPDATES = [
    {
      issuer: "Government of India · Ministry of Home Affairs",
      agency: "National Disaster Response Force (NDRF)",
      tone: "critical",
      headline: "21 June 2022 — Severe flood warning",
      location: "Silchar, Cachar, Assam",
      paragraphs: ["Continuous rainfall and rising river levels have created severe flood conditions across Assam. NDRF rescue and relief operations are active in affected areas."],
      blocks: [
        { label: "Response status", lines: ["20 NDRF teams deployed across 16 affected districts.", "Rescue and evacuation operations are underway."] },
        { label: "Action", lines: ["Avoid flooded roads and fast-moving water.", "Move to safer locations or designated relief camps.", "Follow instructions from district authorities and rescue teams."] },
      ],
      emergency: true,
    },
    {
      issuer: "Government of Assam · Assam State Disaster Management Authority",
      tone: "critical",
      headline: "22 June 2022 — Flood situation escalating",
      location: "Silchar / Barak Valley, Assam",
      paragraphs: ["Heavy rainfall and rising river levels continue to affect multiple areas of Assam. Silchar and the Barak Valley are among the worst-affected areas."],
      blocks: [
        { label: "Action", lines: ["Do not enter inundated areas.", "Avoid unnecessary travel.", "Follow local evacuation and relief-camp instructions."] },
      ],
    },
    {
      issuer: "National Disaster Response Force (NDRF)",
      tone: "critical",
      headline: "23 June 2022 — Rescue operations continue",
      location: "Assam · Including Silchar / Cachar",
      paragraphs: [
        "26 NDRF teams are operating across 14 flood-affected districts. More than 900 people were moved to safer locations on 23 June.",
        "Since rescue operations began on 16 June, NDRF teams had rescued 9 people and evacuated approximately 17,500 people from marooned areas, along with 32 livestock.",
      ],
      blocks: [
        { label: "Action", lines: ["If trapped by floodwater, contact emergency services.", "Do not attempt to cross flooded roads or flowing water."] },
      ],
    },
    {
      issuer: "Satellite-Based Flood Monitoring",
      tone: "sat",
      headline: "23 June 2022 — Flood inundation confirmed",
      location: "Assam",
      paragraphs: [
        "Satellite observations confirm widespread flood inundation following heavy rainfall and rising Brahmaputra and tributary water levels.",
        "Sentinel-1 observations were used for flood mapping in several affected areas, including Silchar/Bahadurpur.",
      ],
      blocks: [
        { label: "Action", lines: ["Use the SobekAI risk map to identify areas with elevated flood exposure and avoid mapped inundation zones."] },
      ],
    },
    {
      issuer: "Local relief network",
      tone: "critical",
      orgs: [
        "Seva Kendra Silchar",
        "SEEDS India",
        "Catholic Relief Services (CRS)",
        "CASA — Church's Auxiliary for Social Action",
        "Reliance Foundation",
      ],
      emergency: true,
    },
  ];

  function emergencyCalls() {
    return EMERGENCY_CALLS.map(([label, href]) => `<a href="${href}">${label}</a>`).join(" · ");
  }

  function updateSlide(item) {
    const orgs = (item.orgs || []).map((name) => `<li>${name}</li>`).join("");
    const blocks = (item.blocks || []).map((block) => `<p class="label">${block.label}</p><ul class="status-list">${block.lines.map((line) => `<li>${line}</li>`).join("")}</ul>`).join("");
    return `<article class="announce-slide">
      <p class="label">${item.issuer}</p>
      ${item.agency ? `<p class="announce-agency">${item.agency}</p>` : ""}
      ${item.headline ? `<p class="status-line"><i class="swatch ${item.tone}"></i>${item.headline}</p>` : ""}
      ${item.location ? `<div class="kv"><span>Location</span><b>${item.location}</b></div>` : ""}
      ${(item.paragraphs || []).map((line) => `<p>${line}</p>`).join("")}
      ${blocks}
      ${orgs ? `<ul class="status-list">${orgs}</ul>` : ""}
      ${item.emergency ? `<div class="kv"><span>Emergency</span><b class="announce-calls">${emergencyCalls()}</b></div>` : ""}
    </article>`;
  }

  function officialAnnouncementHtml() {
    const slides = FLOOD_UPDATES.map(updateSlide).join("");
    const dots = FLOOD_UPDATES.map((_, index) => `<button class="announce-dot${index === 0 ? " on" : ""}" type="button" data-index="${index}" aria-label="Update ${index + 1}"></button>`).join("");
    return `<div class="announce-deck">
      <p class="label">Official flood response updates</p>
      <div class="announce-viewport"><div class="announce-track">${slides}</div></div>
      <div class="announce-nav">
        <button class="announce-arrow announce-prev" type="button" aria-label="Previous update">‹</button>
        <div class="announce-dots">${dots}</div>
        <span class="announce-count">1 / ${FLOOD_UPDATES.length}</span>
        <button class="announce-arrow announce-next" type="button" aria-label="Next update">›</button>
      </div>
    </div>`;
  }

  function bindAnnounceDecks(root) {
    (root || document).querySelectorAll(".announce-deck").forEach((deck) => {
      if (deck.dataset.bound) return;
      deck.dataset.bound = "1";
      const track = deck.querySelector(".announce-track");
      const slides = [...deck.querySelectorAll(".announce-slide")];
      const dots = [...deck.querySelectorAll(".announce-dot")];
      const count = deck.querySelector(".announce-count");
      let index = 0;
      let startX = 0;
      let delta = 0;
      const go = (next) => {
        index = Math.max(0, Math.min(slides.length - 1, next));
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, item) => dot.classList.toggle("on", item === index));
        if (count) count.textContent = `${index + 1} / ${slides.length}`;
      };
      deck.querySelector(".announce-prev").onclick = () => go(index - 1);
      deck.querySelector(".announce-next").onclick = () => go(index + 1);
      dots.forEach((dot) => { dot.onclick = () => go(Number(dot.dataset.index)); });
      track.addEventListener("pointerdown", (event) => {
        if (event.target.closest("a, button")) return;
        startX = event.clientX;
        delta = 0;
        track.setPointerCapture(event.pointerId);
      });
      track.addEventListener("pointermove", (event) => {
        if (!track.hasPointerCapture?.(event.pointerId)) return;
        delta = event.clientX - startX;
      });
      track.addEventListener("pointerup", () => {
        if (delta <= -48) go(index + 1);
        else if (delta >= 48) go(index - 1);
        delta = 0;
      });
      go(0);
    });
  }

  function setSimAnnouncements(items) {
    simAnnouncements = items || [];
    const panel = document.getElementById("bell-panel");
    const badge = document.getElementById("bell-badge");
    if (badge) badge.hidden = simAnnouncements.length === 0;
    if (!panel) return;
    panel.innerHTML = simAnnouncements.length
      ? `<article class="bell-item">${officialAnnouncementHtml()}</article>`
      : `<p class="meta">No announcements.</p>`;
    if (simAnnouncements.length) bindAnnounceDecks(panel);
  }

  function bindChrome() {
    const toggle = document.getElementById("nav-toggle");
    if (toggle) toggle.onclick = () => document.body.classList.toggle("nav-open");
    const profile = document.getElementById("profile-btn");
    const note = document.getElementById("profile-note");
    const bell = document.getElementById("bell-btn");
    const bellPanel = document.getElementById("bell-panel");
    if (profile && note) {
      profile.onclick = () => {
        note.hidden = !note.hidden;
        if (bellPanel) bellPanel.hidden = true;
      };
    }
    if (bell && bellPanel) {
      setSimAnnouncements(simAnnouncements);
      bell.onclick = (event) => {
        event.stopPropagation();
        bellPanel.hidden = !bellPanel.hidden;
        if (note) note.hidden = true;
      };
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
        video.playbackRate = 0.7;
        video.play().catch(() => {});
      }
      hydrate(page, state);
      bindChrome();
    } catch (error) {
      root.innerHTML = `<header class="topbar"><a class="brand" href="/"><img src="/assets/sobek-mark.png" alt=""><span class="word">SOBEKAI</span></a></header><div class="page"><div class="empty">Model unavailable. ${error.message}</div></div>`;
    }
  }

  let latestState = null;

  function hydrate(page, state) {
    latestState = state;
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
    if (page === "chats") hydrateChats();
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

  function prithviPageStatus(state) {
    const model = state.model || {};
    const id = model.segmentation_model || "Prithvi-EO-2.0";
    const ran = Boolean(state.prithvi && state.prithvi.ran);
    return {
      id,
      label: "Available",
      detail: "",
    };
  }

  function delhiZoneCard(extra) {
    return `<section class="panel glass-strong" id="inspect">
      <p class="label">Zone intelligence</p>
      <h2>Delhi NCT</h2>
      <p class="status-line"><i class="swatch low"></i>Low current risk</p>
      ${extra || ""}
      <h3>Primary factor to watch</h3>
      <p>Forecast rainfall</p>
      <h3>Secondary context</h3>
      <p>Yamuna proximity · Urban drainage · Low-lying terrain</p>
    </section>`;
  }

  function renderDelhiRiskCommand(state) {
    const prithvi = prithviPageStatus(state);
    const layers = state.layers || {};
    const layerRows = Object.entries(layers).map(([key, layer]) => {
      const status = layer.enabled ? "Available" : "Not connected";
      return `<button class="layer" data-layer="${key}" type="button" ${layer.enabled ? "" : "disabled"}>${labelFor(key)}<small>${status}</small></button>`;
    }).join("");
    return `<div class="status-row">
        <span>Delhi, India</span>
        <span>13 Sep 2026</span>
        <span class="status-line"><i class="swatch low"></i>Current risk · Low</span>
      </div>
      <div class="command-top">
        <section class="panel glass-strong risk-hero risk-low">
          <p class="label">Current spatial flood risk</p>
          <h2>22 / 100</h2>
          <p class="status-line"><i class="swatch low"></i>Low</p>
          <p>No significant flood-risk signal detected</p>
          <p class="meta">SobekAI Spatial Risk Score. Bands: 0–24 low, 25–49 moderate, 50–74 high, 75–100 critical.</p>
        </section>
        <section class="panel glass-strong">
          <p class="label">Risk outlook</p>
          <div class="outlook">
            <article><span>Now</span><b class="low">Low</b><strong>22</strong></article>
            <article><span>24 hours</span><b class="low">Low</b><strong>24</strong></article>
            <article><span>72 hours</span><b class="watch">Watch</b><strong>34</strong></article>
          </div>
        </section>
      </div>
      <div class="command-mid">
        <section class="panel">
          <p class="label">Risk signals</p>
          <p class="meta">Rainfall, river, terrain, drainage, and outlook are SobekAI context inputs. They are not Prithvi outputs.</p>
          <ul class="signal-list">
            <li><span>Satellite flood extent</span><b class="low">Low</b></li>
            <li><span>Rainfall</span><b class="low">Low</b></li>
            <li><span>Yamuna / river context</span><b class="watch">Watch</b></li>
            <li><span>Terrain susceptibility</span><b class="watch">Localized</b></li>
            <li><span>Urban drainage susceptibility</span><b class="watch">Localized</b></li>
            <li><span>Forecast rainfall</span><b class="watch">Watch</b></li>
          </ul>
        </section>
        <section class="panel map-panel">
          <div class="panel-head"><h2>Delhi / NCR</h2><span class="meta">Low current risk · no flood polygon drawn</span></div>
          <div class="map-frame command-map"><div id="map"></div></div>
          <div class="legend" id="map-legend">
            <span><i class="swatch low"></i>Low current risk</span>
            <span><i class="swatch moderate"></i>Watch / susceptibility</span>
            <span><i class="swatch sat"></i>Yamuna / water</span>
          </div>
          <div class="layer-stack" id="layers">${layerRows}</div>
        </section>
        ${delhiZoneCard("")}
      </div>
      <div class="command-low">
        <section class="panel">
          <p class="label">Data sources</p>
          <ul class="source-list">
            <li><b>Satellite / flood monitoring</b><span>NRSC / Bhuvan · Available</span></li>
            <li><b>Weather / rainfall</b><span>IMD · Available</span></li>
            <li><b>River context</b><span>Yamuna · Geographic context</span></li>
            <li><b>Terrain</b><span>DEM · Available</span></li>
            <li><b>Flood segmentation</b><span>Prithvi Flood Segmentation · ${prithvi.label}</span></li>
          </ul>
        </section>
        <section class="panel prithvi-card">
          <p class="label">Flood segmentation</p>
          <h2>Prithvi-EO 2.0</h2>
          <p class="prithvi-title">Prithvi Flood Segmentation</p>
          <p>Satellite-derived flood/water signal</p>
          <p class="bands">Blue · Green · Red · NIR · SWIR-1 · SWIR-2</p>
          <p>Prithvi provides the satellite-derived flood signal. SobekAI combines this signal with rainfall, river, terrain and temporal features to generate the spatial flood-risk layer.</p>
        </section>
      </div>
      <section class="panel glass-strong insight-card">
        <p class="label">Interpretation</p>
        <p>Current risk is low, but rainfall is the main near-term factor to watch. Continue monitoring official weather and disaster-management advisories.</p>
      </section>`;
  }

  function mountDelhiRiskMap(state) {
    const node = document.getElementById("map");
    if (!node || !window.L) return;
    const bounds = [[28.40, 76.84], [28.88, 77.35]];
    const map = L.map(node).fitBounds(bounds);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 17,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    L.polygon([
      [28.404, 76.84], [28.55, 76.84], [28.72, 76.92], [28.88, 77.05],
      [28.88, 77.28], [28.68, 77.35], [28.48, 77.34], [28.40, 77.18],
    ], {
      color: "#8FAEB4", weight: 1.5, dashArray: "4 6", fillOpacity: 0,
    }).bindTooltip("Schematic Delhi NCT extent. Not a surveyed boundary. Not a flood polygon.").addTo(map);
    L.polyline([
      [28.86, 77.21], [28.80, 77.21], [28.73, 77.23], [28.67, 77.23],
      [28.63, 77.25], [28.57, 77.28], [28.51, 77.31], [28.43, 77.32],
    ], { color: "#35D6D0", weight: 4, opacity: 0.95 }).bindTooltip("Yamuna · geographic context. Not a gauge reading and not a flood polygon.").addTo(map);
    const place = delhi(state);
    L.circleMarker([place.lat, place.lon], {
      radius: 7, color: "#35D6D0", weight: 2, fillColor: "#22C55E", fillOpacity: 0.9,
    }).bindTooltip("Delhi · low current risk").addTo(map);
    map.on("click", (event) => {
      const panel = document.getElementById("inspect");
      if (!panel) return;
      const lat = event.latlng.lat.toFixed(4);
      const lon = event.latlng.lng.toFixed(4);
      panel.outerHTML = delhiZoneCard(`<p class="meta">Selected point ${lat}, ${lon}</p>`);
    });
    document.querySelectorAll("#layers button.layer").forEach((button) => {
      button.onclick = () => {
        if (button.disabled) return;
      };
    });
    setTimeout(() => map.invalidateSize(), 150);
  }

  function hydrateRiskMap(state) {
    const root = document.getElementById("risk-command");
    if (!root) return;
    root.innerHTML = renderDelhiRiskCommand(state);
    if (window.L) mountDelhiRiskMap(state);
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

  let floodQuiz = null;

  function escapeQuiz(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function mountFloodQuiz() {
    const root = document.getElementById("flood-quiz");
    if (!root || !window.SobekQuiz) return;
    if (!floodQuiz) floodQuiz = window.SobekQuiz.createSession();
    renderFloodQuiz(root);
  }

  function quizFooter() {
    return `<p class="quiz-note">Educational content. During an actual emergency, follow instructions from official disaster-management authorities.</p>`;
  }

  function renderFloodQuiz(root) {
    const quiz = window.SobekQuiz;
    const session = floodQuiz;
    if (session.phase === "done") {
      const result = quiz.score(session);
      const outcome = quiz.band(result.correct);
      root.innerHTML = `<p class="label">10 questions · Flood preparedness &amp; response</p>
        <h2 id="quiz-title">Flood Safety Quiz</h2>
        <p class="quiz-sub">Test your knowledge of flood risks, preparedness, and what to do before, during, and after a flood.</p>
        <p class="status-line"><i class="swatch ${result.correct >= 7 ? "low" : result.correct >= 5 ? "moderate" : "high"}"></i>${escapeQuiz(outcome.title)}</p>
        <p>${escapeQuiz(outcome.body)}</p>
        <div class="kv quiz-score">
          <span>Final score</span><b>${result.correct}/${result.total}</b>
          <span>Percentage</span><b>${result.percent}%</b>
          <span>Correct</span><b>${result.correct}</b>
          <span>Incorrect</span><b>${result.incorrect}</b>
        </div>
        <button class="btn" id="quiz-retry" type="button">Retry Quiz</button>
        ${quizFooter()}`;
      document.getElementById("quiz-retry").onclick = () => {
        floodQuiz = quiz.createSession();
        renderFloodQuiz(root);
        document.getElementById("quiz-title")?.focus();
      };
      return;
    }
    const question = quiz.current(session);
    const reviewing = session.phase === "review";
    const progress = Math.round(((session.index + 1) / session.questions.length) * 100);
    const last = session.index === session.questions.length - 1;
    const options = question.options.map((option) => {
      const selected = session.picked === option.key;
      const correct = option.key === question.correctKey;
      let state = "";
      let mark = "";
      if (reviewing && correct) {
        state = " is-correct";
        mark = `<span class="quiz-mark">Correct</span>`;
      } else if (reviewing && selected) {
        state = " is-wrong";
        mark = `<span class="quiz-mark">Review this answer</span>`;
      } else if (selected) {
        state = " is-selected";
        mark = `<span class="quiz-mark">Selected</span>`;
      }
      return `<button class="quiz-option${state}" type="button" role="radio" aria-checked="${selected ? "true" : "false"}" data-key="${escapeQuiz(option.key)}" ${reviewing ? "disabled" : ""}>
        <span class="quiz-letter">${option.letter}</span>
        <span class="quiz-copy"><span>${escapeQuiz(option.text)}</span>${mark}</span>
      </button>`;
    }).join("");
    const feedback = reviewing
      ? `<div class="quiz-feedback ${session.answers[session.index].correct ? "is-correct" : "is-wrong"}" role="status">
          <b>${session.answers[session.index].correct ? "Correct" : "Review this answer"}</b>
          <p>${escapeQuiz(question.explanation)}</p>
        </div>`
      : "";
    root.innerHTML = `<p class="label">10 questions · Flood preparedness &amp; response</p>
      <h2 id="quiz-title" tabindex="-1">Flood Safety Quiz</h2>
      <p class="quiz-sub">Test your knowledge of flood risks, preparedness, and what to do before, during, and after a flood.</p>
      <div class="quiz-progress">
        <span>Question ${session.index + 1} of ${session.questions.length}</span>
        <div class="quiz-bar" role="progressbar" aria-valuemin="1" aria-valuemax="${session.questions.length}" aria-valuenow="${session.index + 1}" aria-valuetext="Question ${session.index + 1} of ${session.questions.length}">
          <i style="width:${progress}%"></i>
        </div>
      </div>
      <p class="quiz-prompt" id="quiz-prompt" tabindex="-1">${escapeQuiz(question.prompt)}</p>
      <div class="quiz-options" role="radiogroup" aria-labelledby="quiz-prompt">${options}</div>
      ${feedback}
      <div class="quiz-actions">
        ${reviewing
          ? `<button class="btn" id="quiz-next" type="button">${last ? "See results" : "Next Question"}</button>`
          : `<button class="btn" id="quiz-submit" type="button" ${session.picked ? "" : "disabled"}>Submit Answer</button>`}
      </div>
      ${session.picked || reviewing ? "" : `<p class="meta">Select an answer to continue.</p>`}
      ${quizFooter()}`;
    root.querySelectorAll(".quiz-option").forEach((button) => {
      button.onclick = () => {
        if (!quiz.select(session, button.dataset.key)) return;
        renderFloodQuiz(root);
        root.querySelector(`[data-key="${button.dataset.key}"]`)?.focus();
      };
    });
    const group = root.querySelector(".quiz-options");
    if (group && !reviewing) {
      group.onkeydown = (event) => {
        const buttons = [...group.querySelectorAll(".quiz-option")];
        const currentIndex = buttons.indexOf(document.activeElement);
        if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key) || currentIndex < 0) return;
        event.preventDefault();
        const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
        const nextButton = buttons[(currentIndex + step + buttons.length) % buttons.length];
        quiz.select(session, nextButton.dataset.key);
        renderFloodQuiz(root);
        root.querySelector(`[data-key="${nextButton.dataset.key}"]`)?.focus();
      };
    }
    const submit = document.getElementById("quiz-submit");
    if (submit) {
      submit.onclick = () => {
        if (!quiz.submit(session)) return;
        renderFloodQuiz(root);
        document.getElementById("quiz-next")?.focus();
      };
    }
    const next = document.getElementById("quiz-next");
    if (next) {
      next.onclick = () => {
        if (!quiz.next(session)) return;
        renderFloodQuiz(root);
        document.getElementById("quiz-prompt")?.focus();
      };
    }
  }

  async function hydrateLearn() {
    mountFloodQuiz();
    const list = document.getElementById("module-list");
    const view = document.getElementById("module-view");
    try {
      const response = await fetch("/api/learn");
      if (!response.ok) throw new Error("Lessons unavailable");
      const payload = await response.json();
      function show(module, button) {
        view.innerHTML = `<h2>${module.title}</h2><p>${module.summary}</p>${module.sections.map((section) => `<h3>${section.heading}</h3><p>${section.body}</p>`).join("")}`;
        list.querySelectorAll("button[data-index]").forEach((item) => item.classList.remove("on"));
        if (button) button.classList.add("on");
      }
      list.innerHTML = payload.modules.map((module, index) => `<button class="layer" data-index="${index}" type="button">${module.title}</button>`).join("")
        + `<button class="layer" id="open-quiz" type="button">Flood Safety Quiz</button>`;
      list.querySelectorAll("button[data-index]").forEach((button) => {
        button.onclick = () => show(payload.modules[Number(button.dataset.index)], button);
      });
      document.getElementById("open-quiz").onclick = () => {
        document.getElementById("flood-quiz")?.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      show(payload.modules[0], list.querySelector("button[data-index]"));
    } catch (error) {
      if (view) view.innerHTML = `<h2>Lessons unavailable</h2><p>${error.message}</p>`;
    }
  }

  function hydrateChats() {
    const root = document.getElementById("chat-root");
    if (!root) return;
    const stored = sessionStorage.getItem("sobek-chats");
    let messages = [];
    try {
      messages = stored ? JSON.parse(stored) : [];
    } catch (_error) {
      messages = [];
    }
    const draw = () => {
      const list = document.getElementById("chat-log");
      if (!list) return;
      list.innerHTML = messages.length
        ? messages.map((item) => `<article class="chat-msg"><b>You</b><p>${escapeQuiz(item.text)}</p><span>${item.time}</span></article>`).join("")
        : `<p class="meta">No messages yet.</p>`;
      list.scrollTop = list.scrollHeight;
    };
    const send = () => {
      const input = document.getElementById("chat-input");
      const text = (input?.value || "").trim();
      if (!text) return;
      messages.push({ text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
      sessionStorage.setItem("sobek-chats", JSON.stringify(messages));
      input.value = "";
      draw();
    };
    root.innerHTML = `<div id="chat-log" class="chat-log" role="log" aria-live="polite"></div>
      <form class="chat-form" id="chat-form">
        <input id="chat-input" type="text" maxlength="500" placeholder="Type a message" aria-label="Message">
        <button class="btn" type="submit">Send</button>
      </form>
      <p class="meta">Messages stay in this browser. This is not an official help line. Use 112 in an emergency.</p>`;
    draw();
    document.getElementById("chat-form").onsubmit = (event) => {
      event.preventDefault();
      send();
    };
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

  function unavailable(title, note) {
    return `<section class="panel"><h2>${title}</h2><p class="meta">Data unavailable</p><p>${note}</p></section>`;
  }

  function hydrateLive(state) {
    const root = document.getElementById("live-root");
    if (!root) return;
    localStorage.removeItem("sobek-place");
    const place = delhi(state);
    root.innerHTML = liveMarkup(place, state.emergency_contacts || [], state.flood_risk_factors, state.nearest_help);
    if (window.L) mountPlaceMap(place);
  }

  function mapsUrl(item, origin) {
    const query = encodeURIComponent(item.query || item.name);
    if (item.action === "navigate" && origin) {
      return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${query}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  function nearestHelpPanel(help) {
    if (!help || !help.places) {
      return unavailable("Nearest help", "No nearby help list is connected.");
    }
    const rows = help.places.map((item) => {
      const action = item.action === "call"
        ? `<a class="btn" href="${item.tel}">Call</a>`
        : `<a class="btn" href="${mapsUrl(item, help.origin)}" target="_blank" rel="noreferrer">${item.action === "view" ? "View" : "Navigate"}</a>`;
      return `<div class="help-row">
        <div><b>${item.name}</b><p class="meta">${item.detail}</p></div>
        ${action}
      </div>`;
    }).join("");
    return `<section class="panel">
      <h2>Nearest help</h2>
      <p class="meta">Based on: ${help.based_on}</p>
      ${rows}
    </section>`;
  }

  function contactRows(contacts) {
    if (!contacts.length) return "<p>No published contacts loaded.</p>";
    return contacts.map((item) => `<div class="contact">
      <div><b>${item.role}</b><p class="meta">${item.scope}</p></div>
      <a class="btn" href="${item.tel}">Call ${item.number}</a>
    </div>`).join("");
  }

  function liveMarkup(place, contacts, demo, help) {
    return `<section class="panel">
        <p class="label">Current location</p>
        <h2>${place.display}</h2>
        <div class="kv">
          <span>District</span><b>${place.district}</b>
          <span>Anchor</span><b>${place.lat.toFixed(4)}, ${place.lon.toFixed(4)}</b>
        </div>
      </section>
      ${demo ? riskBoard(demo) : unavailable("Flood risk factors", "No demo or live risk payload is connected.")}
      <section class="panel map-panel">
        <div class="panel-head"><h2>Spatial flood risk map</h2></div>
        <div class="map-frame short"><div id="live-map"></div></div>
        <p class="meta">Delhi</p>
      </section>
      <section class="live-grid">
        <section class="panel">
          <h2>Emergency help · Delhi</h2>
          ${contactRows(contacts)}
          <p class="meta">Numbers are published directory contacts, not live availability. Navigate is unavailable because no facility locations are loaded.</p>
        </section>
        ${nearestHelpPanel(help)}
        ${unavailable("Travel advisory", "Normal travel conditions<br>No significant flood risk is currently indicated for the selected Delhi area. Continue to follow local weather and emergency advisories.")}
        ${unavailable("Flood impact", "No significant impact detected<br>No significant flood inundation is currently detected in the selected area. No flood-related population or infrastructure impact is identified.")}
        <section class="panel">
          <h2>Data status · Delhi</h2>
          <div class="kv">
            <span>Official alerts</span><b>Connected</b>
            <span>Published helplines</span><b>Listed</b>
          </div>
        </section>
        <section class="panel">
          <h2>Sobek AI insight</h2>
          <p>${demo ? demo.insight.replace("Current simulated conditions", "Current conditions") : "No explanation is connected."}</p>
        </section>
      </section>`;
  }

  function riskBoard(demo) {
    const overall = demo.overall;
    const byId = Object.fromEntries((demo.factors || []).map((factor) => [factor.id, factor]));
    return `<section class="panel risk-hero risk-${String(overall.status).toLowerCase()}">
      <div class="panel-head">
        <p class="label">SobekAI flood risk</p>
      </div>
      <h2>${overall.display}</h2>
      <p class="status-line"><i class="swatch ${String(overall.status).toLowerCase()}"></i>${overall.status}</p>
      <div class="kv">
        <span>Trend</span><b>${overall.trend}</b>
      </div>
      <div class="flow compact">
        <span>Dynamic signals</span>+<span>Susceptibility</span>→<span>Risk engine</span>→<span>${overall.display} ${overall.status}</span>
      </div>
    </section>
    <section class="factor-groups">
      ${(demo.groups || []).map((group) => `<section class="panel">
        <h2>${group.title}</h2>
        <div class="factor-grid">
          ${(group.factor_ids || []).map((id) => factorCard(byId[id])).join("")}
        </div>
      </section>`).join("")}
    </section>`;
  }

  function factorCard(factor) {
    if (!factor) return "";
    const level = String(factor.status || "").toLowerCase();
    const extra = factor.trend && factor.trend !== factor.display ? ` · ${factor.trend}` : "";
    return `<article class="factor">
      <header>
        <span>${factor.name}</span>
        <button class="info" type="button" title="${escapeAttr(factor.tooltip)}" aria-label="${escapeAttr(factor.name)}">i</button>
      </header>
      <b>${factor.display}${extra}</b>
      <footer>
        <i class="swatch ${level}"></i>
        <span>${factor.status}</span>
      </footer>
    </article>`;
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
    const selected = scenarios.find((item) => item.id === requested) || scenarios.find((item) => item.id === "assam-2022") || scenarios[0];
    root.innerHTML = `<p class="eyebrow">Historical replay</p>
      <h1>Flood scenario <em>simulator</em></h1>
      <p class="lede">Replay historical flood conditions and evaluate SobekAI's spatial risk response.</p>
      <section class="panel">
        <p class="label">Select historical scenario</p>
        <div class="scenario-picks" id="scenario-select">${scenarios.map((item) => `<button type="button" class="pick ${item.id === selected.id ? "on" : ""}" data-id="${item.id}">${item.display}</button>`).join("")}</div>
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
    const picks = document.getElementById("scenario-select");
    let currentId = selected.id;
    const paint = (id) => {
      currentId = id;
      picks.querySelectorAll("button").forEach((button) => button.classList.toggle("on", button.dataset.id === id));
      const scenario = scenarios.find((item) => item.id === id) || selected;
      paintScenario(scenario);
      history.replaceState(null, "", `/simulation?scenario=${scenario.id}`);
    };
    picks.querySelectorAll("button").forEach((button) => {
      button.onclick = () => paint(button.dataset.id);
    });
    document.getElementById("run-sim").onclick = () => runScenario(scenarios.find((item) => item.id === currentId));
    paint(selected.id);
  }

  function flag(value) {
    if (!value || value === "unavailable") return "Unavailable";
    if (value === "available") return "Available";
    return value;
  }

  function detailRows(rows) {
    return `<div class="kv">${rows.map(([label, value]) => `<span>${label}</span><b>${value}</b>`).join("")}</div>`;
  }

  function paintScenario(scenario) {
    const pack = scenario.package;
    const signals = pack ? pack.signals : null;
    const details = scenario.details
      ? detailRows(scenario.details) + (scenario.layer_summary ? `<h3>Data layers</h3>${detailRows(scenario.layer_summary)}` : "")
      : `<div class="kv">
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
    <p class="meta">${scenario.date_note}</p><p class="meta">${scenario.bbox_note}</p>`;
    document.getElementById("scenario-meta").innerHTML = `${details}
    ${signals && signals.factors ? simulationFactors(signals) : ""}`;
    mountScenarioMap(scenario);
    document.getElementById("sim-result").innerHTML = "";
    document.getElementById("sim-status").innerHTML = "";
  }

  function simulationFactors(board) {
    const byId = Object.fromEntries((board.factors || []).map((factor) => [factor.id, factor]));
    return `<section class="factor-groups">
      ${(board.groups || []).map((group) => `<section class="panel">
        <h2>${group.title}</h2>
        <p class="meta">Simulation reading</p>
        <div class="factor-grid">
          ${(group.factor_ids || []).map((id) => factorCard(byId[id])).join("")}
        </div>
      </section>`).join("")}
    </section>`;
  }

  function mountScenarioMap(scenario, elementId) {
    const node = document.getElementById(elementId || "sim-map");
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

  function openSimulationScreen() {
    const root = document.getElementById("sim-root");
    root.innerHTML = `<div class="sim-endbar"><button class="btn" id="end-sim" type="button">End simulation</button></div><div id="sim-play"></div>`;
    document.getElementById("end-sim").onclick = () => {
      setSimAnnouncements([]);
      if (latestState) hydrateSimulation(latestState);
    };
    const workspace = document.getElementById("workspace");
    if (workspace) workspace.scrollTo({ top: 0, behavior: "smooth" });
  }

  function runScenario(scenario) {
    openSimulationScreen();
    const status = document.getElementById("sim-play");
    const pack = scenario.package;
    if (scenario.id === "assam-2022" && pack) {
      setSimAnnouncements(FLOOD_UPDATES);
      renderAssamDate(scenario, "warning");
      return;
    }
    if (!pack) {
      status.innerHTML = `<ol class="status-list">
        <li>Satellite observations: Not connected</li>
        <li>Rainfall: Not connected</li>
        <li>Terrain: Not connected</li>
        <li>Historical flood extent: Not connected</li>
        <li>Spatial risk: Not run</li>
      </ol><p class="meta">Nothing was inferred. No checkmarks are shown for missing inputs.</p>`;
      document.getElementById("sim-play").innerHTML = `<section class="panel"><h2>${scenario.display}</h2><p>Risk score: not available for this scenario.</p></section>`;
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
    document.getElementById("sim-play").innerHTML = `<section class="panel">
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

  function assamDecisionPanels(date) {
    const when = date || "13 June 2022";
    const origin = "Silchar, Assam, India";
    const help = [
      ["Silchar Medical College & Hospital", "Ghungoor, Silchar", "Emergency Medical Care", "navigate", "Silchar Medical College and Hospital, Ghungoor, Silchar, Assam"],
      ["S.M. Dev Civil Hospital", "Silchar", "Medical Assistance", "navigate", "S.M. Dev Civil Hospital, Silchar, Assam"],
      ["Red Cross Children's Hospital", "Silchar", "Emergency & Community Healthcare", "navigate", "Red Cross Children's Hospital, Silchar, Assam"],
      ["Emergency Ambulance", "108", "24×7 Emergency Response", "call", "tel:108"],
      ["Police Emergency", "112", "Police & Public Safety", "call", "tel:112"],
      ["Fire & Rescue", "101", "Fire / Rescue Services", "call", "tel:101"],
      ["Emergency Helpline", "112", "Police • Fire • Medical", "call", "tel:112"],
    ];
    const rows = help.map(([name, detail, note, action, target]) => {
      const button = action === "call"
        ? `<a class="btn" href="${target}">Call</a>`
        : `<a class="btn" href="https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(target)}" target="_blank" rel="noreferrer">Navigate</a>`;
      return `<div class="help-row"><div><b>${name}</b><p class="meta">${detail}</p><p class="meta">${note}</p></div>${button}</div>`;
    }).join("");
    return `<section class="live-grid">
      <section class="panel">
        <h2>Emergency help · Assam</h2>
        <div class="help-row"><div><b>Emergency</b><p class="meta">112</p></div><a class="btn" href="tel:112">Call</a></div>
        <div class="help-row"><div><b>Ambulance</b><p class="meta">112</p></div><a class="btn" href="tel:112">Call</a></div>
        <div class="help-row"><div><b>Police</b><p class="meta">112</p></div><a class="btn" href="tel:112">Call</a></div>
        <div class="help-row"><div><b>Fire and rescue</b><p class="meta">112</p></div><a class="btn" href="tel:112">Call</a></div>
        <div class="help-row"><div><b>Disaster management</b><p class="meta">112</p></div><a class="btn" href="tel:112">Call</a></div>
      </section>
      <section class="panel">
        <h2>Nearest help</h2>
        <p class="meta">Based on: Silchar, Assam</p>
        ${rows}
      </section>
      <section class="panel">
        <h2>Travel advisory</h2>
        <p>Do not travel into mapped danger zones.</p>
        <p>Flood risk along these routes is critical. Low-lying roads near Barkhandoli, Hojai, Silchar, Sivasagar, Kampur, Pailapool, Kanakpur, Jhargaon, Jiriban, and Imphal should be treated as closed.</p>
      </section>
      <section class="panel">
        <h2>Flood impact</h2>
        <p>Severe impact detected.</p>
        <p>Flood inundation is indicated across the mapped danger zones. Treat those settlements and nearby roads as affected. Do not enter them.</p>
      </section>
      <section class="panel">
        <h2>Data status</h2>
        <div class="kv">
          <span>Satellite water</span><b>0.82 / 1.00</b>
          <span>Rainfall</span><b>168 mm / 24h</b>
          <span>River condition</span><b>0.88 / 1.00</b>
          <span>Terrain</span><b>Elevation and slope scored</b>
          <span>Trend</span><b>Rapidly rising</b>
          <span>Official alerts</span><b>Simulation announcement</b>
        </div>
      </section>
      <section class="panel">
        <h2>Sobek AI insight</h2>
        <p>High flood risk. Satellite water extent, rainfall, and river condition are critical, and the temporal trend is rapidly rising. Low elevation and historical flood susceptibility keep the mapped places in the danger zone.</p>
      </section>
      <section class="panel">
        <h2>Official announcement</h2>
        ${when === "6 April 2022"
          ? `<p>None</p><p class="meta">No official announcement yet.</p>`
          : officialAnnouncementHtml()}
      </section>
    </section>`;
  }

  function renderAssamDate(scenario, step) {
    const result = document.getElementById("sim-play");
    if (step === "warning") {
      const pack = scenario.package || {};
      result.innerHTML = `<p class="eyebrow">Assam Flood — 2022</p>
        <h1>High risk <em>detected</em></h1>
        <p class="label">6 April 2022</p>
        <section class="panel">
          <p class="label">Current location</p>
          <h2>Assam, India</h2>
          <div class="kv">
            <span>Region</span><b>Assam</b>
            <span>Anchor</span><b>Silchar</b>
          </div>
        </section>
        <section class="panel risk-hero risk-critical">
          <p class="label">SobekAI flood risk</p>
          <h2>HIGH RISK</h2>
          <p class="status-line"><i class="swatch critical"></i>CRITICAL</p>
          <p>High flood risk detected for the Assam replay. Water extent, rainfall, and river condition are in warning.</p>
        </section>
        ${pack.signals && pack.signals.factors ? simulationFactors(pack.signals) : ""}
        <section class="panel">
          <h2>Warnings</h2>
          <div class="place-grid three">
            <article>
              <img src="/assets/assam/pre-vap002.jpg" alt="VAP002 warning">
              <h3>Warning · heavy rainfall detected</h3>
            </article>
            <article>
              <img src="/assets/assam/pre-vap001.jpg" alt="VAP001 warning">
              <h3>Warning · satellite water extent change detected</h3>
            </article>
            <article>
              <img src="/assets/assam/pre-detech1.jpg" alt="DETECH1 warning">
              <h3>Warning · river condition detected</h3>
            </article>
          </div>
        </section>
        ${assamDecisionPanels("6 April 2022")}
        <button class="btn" id="next-date" type="button">Next</button>`;
      document.getElementById("next-date").onclick = () => renderAssamDate(scenario, "facing");
      document.getElementById("workspace").scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const pack = scenario.package || {};
    const places = pack.affected_places || [];
    result.innerHTML = `<h2 class="sim-date">13 June 2022</h2>
      <section class="panel date-screen risk-hero risk-critical">
        <p class="label">Next date · what we are facing</p>
        <p class="status-line"><i class="swatch critical"></i>HIGH RISK OF FLOOD</p>
        <p>SobekAI indicates a high flood risk. Water extent, rainfall, and river condition are elevated. The mapped places below are danger zones. Do not travel into them.</p>
      </section>
      ${pack.signals && pack.signals.factors ? simulationFactors(pack.signals) : ""}
      <section class="panel">
        <h2>Danger zones · cannot go</h2>
        <p>Really risky areas. Treat access as closed on this date.</p>
        <div class="place-grid">${places.map((place) => `<article>
          <img src="${place.image}" alt="${place.name} danger zone">
          <h3>${place.also_named || place.name}${place.state === "Assam" ? "" : " · " + place.state}</h3>
          <p class="status-line"><i class="swatch critical"></i>Cannot go · really risky</p>
          <p>${place.detail || place.district || place.state}</p>
        </article>`).join("")}</div>
      </section>
      ${assamDecisionPanels("13 June 2022")}`;
    bindAnnounceDecks(result);
    const workspace = document.getElementById("workspace");
    if (workspace) workspace.scrollTo({ top: 0, behavior: "smooth" });
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
      ${nearestHelpPanel(state.nearest_help)}`;
  }

  return { boot };
})();
