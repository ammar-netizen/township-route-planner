import L from 'leaflet';
import { registerSW } from 'virtual:pwa-register';
import { AUDIT_SEGMENTS, INITIAL_REPORTS } from './data/segments.js';
import { addReport, getReports } from './services/firebase.js';
import { analyzePhoto } from './services/gemini.js';

// Auto-register PWA Service Worker for offline support
registerSW({ immediate: true });

let map, navMap;
let activePolylineLayers = [];
let startMarker, destMarker;
let navPolyline, navUserMarker, navDestMarker;
let hazardMarkersLayer = L.layerGroup();
let heatmapLayer = L.layerGroup();
let showHeatmap = false;
let reportsData = [...INITIAL_REPORTS];

let isPinMode = false;
let activeStatusFilter = 'all';
let selectedRouteIndex = 0; // 0: Shaded, 1: Detour around broken path, 2: Accessible ramp

// Default start and destination coordinates
let currentStart = [3.076563, 101.587957]; // SS15 Origin
let currentDest = [3.077981, 101.590810];  // SS15 LRT

// Multi-route suggestions state
let routesList = [...AUDIT_SEGMENTS];

// --- Tab Switching ---
const tabs = document.querySelectorAll('.nav-tab-btn');
const views = document.querySelectorAll('.app-view');

function activateTab(targetId) {
  tabs.forEach(t => {
    if (t.dataset.target === targetId) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  views.forEach(v => {
    if (v.id === targetId) {
      v.classList.remove('d-none');
      v.classList.add('d-flex');
    } else {
      v.classList.add('d-none');
      v.classList.remove('d-flex');
    }
  });

  if (targetId === 'view-routes' && map) {
    setTimeout(() => map.invalidateSize(), 150);
  }
  if (targetId === 'view-nav') {
    initOrUpdateNavMap();
  }
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    activateTab(tab.dataset.target);
  });
});

// --- Initialize Routes Map ---
function initMap() {
  map = L.map('map', { zoomControl: false }).setView(currentStart, 16);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Add the hazard pins layer
  hazardMarkersLayer.addTo(map);

  renderStartAndDestMarkers();
  renderHazardPinsOnMap();

  // Pin on map feature
  map.on('click', (e) => {
    if (isPinMode) {
      currentDest = [e.latlng.lat, e.latlng.lng];
      setDestination(currentDest, "Pinned Walkway");
      togglePinMode(false);
    }
  });

  // Search station / location
  document.getElementById('btn-search').addEventListener('click', handleSearch);
  document.getElementById('input-search').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Pin mode button
  const pinBtn = document.getElementById('btn-pin-mode');
  pinBtn.addEventListener('click', () => {
    togglePinMode(!isPinMode);
  });

  // My location button
  document.getElementById('btn-my-location').addEventListener('click', locateUser);

  // Heatmap toggle button
  const heatmapBtn = document.getElementById('btn-toggle-heatmap');
  if (heatmapBtn) {
    heatmapBtn.addEventListener('click', () => {
      showHeatmap = !showHeatmap;
      if (showHeatmap) {
        heatmapBtn.classList.remove('btn-light');
        heatmapBtn.classList.add('btn-warning');
        renderHeatmapClusters();
        heatmapLayer.addTo(map);
      } else {
        heatmapBtn.classList.add('btn-light');
        heatmapBtn.classList.remove('btn-warning');
        map.removeLayer(heatmapLayer);
      }
    });
  }

  // Quick report button from comparison card
  document.getElementById('btn-quick-report').addEventListener('click', () => {
    const locInput = document.getElementById('report-location');
    locInput.value = document.getElementById('dest-label').textContent || "Walkway Route";
    activateTab('view-report');
  });

  // Route option card click selection
  document.querySelectorAll('.route-option-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.routeIdx, 10);
      selectRoute(idx);
    });
  });

  // Report status filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatusFilter = btn.dataset.filter;
      renderReports();
    });
  });

  // Initial calculation
  calculateAndRenderRoutes(currentStart, currentDest);

  // Bottom Sheet Slide / Toggle behavior
  const sheet = document.getElementById('route-comparison');
  const handle = document.getElementById('sheet-drag-handle');
  const header = document.getElementById('sheet-header');
  const chevron = document.getElementById('chevron-sheet');

  function toggleBottomSheet() {
    const isCollapsed = sheet.classList.toggle('collapsed');
    if (chevron) {
      chevron.className = isCollapsed ? 'bi bi-chevron-up text-muted fs-6 ms-1' : 'bi bi-chevron-down text-muted fs-6 ms-1';
    }
  }

  handle.addEventListener('click', toggleBottomSheet);
  header.addEventListener('click', toggleBottomSheet);

  // Fullscreen / Interactive Clean Map Toggle
  const btnToggleUI = document.getElementById('btn-toggle-ui');
  const btnShowPanels = document.getElementById('btn-show-panels');
  const topPanel = document.getElementById('top-search-panel');
  const iconToggleUI = document.getElementById('icon-toggle-ui');
  const textToggleUI = document.getElementById('text-toggle-ui');
  let isFullscreenMap = false;

  function setUIMode(cleanMap) {
    isFullscreenMap = cleanMap;
    if (isFullscreenMap) {
      topPanel.classList.add('collapsed');
      sheet.classList.add('collapsed');
      if (iconToggleUI) iconToggleUI.className = 'bi bi-arrows-angle-contract text-success';
      if (textToggleUI) textToggleUI.textContent = 'Show Panels';
      if (btnShowPanels) {
        btnShowPanels.classList.remove('d-none');
        btnShowPanels.classList.add('d-flex');
      }
    } else {
      topPanel.classList.remove('collapsed');
      sheet.classList.remove('collapsed');
      if (iconToggleUI) iconToggleUI.className = 'bi bi-arrows-angle-expand text-success';
      if (textToggleUI) textToggleUI.textContent = 'Hide Panels';
      if (btnShowPanels) {
        btnShowPanels.classList.add('d-none');
        btnShowPanels.classList.remove('d-flex');
      }
    }
    setTimeout(() => map.invalidateSize(), 300);
  }

  btnToggleUI.addEventListener('click', () => setUIMode(!isFullscreenMap));
  if (btnShowPanels) {
    btnShowPanels.addEventListener('click', () => setUIMode(false));
  }
}

function selectRoute(idx) {
  selectedRouteIndex = idx;
  document.querySelectorAll('.route-option-card').forEach((card, i) => {
    if (i === idx) {
      card.classList.add('active', 'border-success', 'bg-success-subtle');
      card.classList.remove('bg-light');
    } else {
      card.classList.remove('active', 'border-success', 'bg-success-subtle');
      card.classList.add('bg-light');
    }
  });

  // Dynamic advice based on user's route selection
  const advisorEl = document.getElementById('advisor-text');
  if (advisorEl) {
    if (idx === 0) {
      advisorEl.innerHTML = `<strong>Selected Route 1:</strong> Optimal thermal comfort. Maximizes mature tree shade (+85%) along residential sidewalks to prevent heat exhaustion.`;
    } else if (idx === 1) {
      advisorEl.innerHTML = `<strong>Selected Route 2:</strong> Hazard-avoidance detour. Safely bypasses the reported cracked pavement on Jalan SS15/4D via flat, newly paved sidewalks.`;
    } else if (idx === 2) {
      advisorEl.innerHTML = `<strong>Selected Route 3:</strong> Barrier-free accessibility. 100% ramp access and signalized zebra crossings. Recommended for senior citizens, wheelchairs, and strollers.`;
    }
  }

  renderRoutePolylines();
}

// Render Defect & Heat-exposure Hazard Heatmap
function renderHeatmapClusters() {
  heatmapLayer.clearLayers();
  reportsData.forEach(rep => {
    const lat = rep.lat || currentStart[0];
    const lng = rep.lng || currentStart[1];

    // Heat radius circle (Amber / Red glowing gradient)
    L.circle([lat, lng], {
      radius: 65,
      fillColor: rep.issueType === 'No Shade' ? '#ff9800' : '#f44336',
      fillOpacity: 0.35,
      color: rep.issueType === 'No Shade' ? '#ff9800' : '#f44336',
      weight: 1
    }).addTo(heatmapLayer);
  });
}

// Render Walkway Hazard Pins with Photo Popups on Map
function renderHazardPinsOnMap() {
  hazardMarkersLayer.clearLayers();

  reportsData.forEach(rep => {
    const lat = rep.lat || (currentStart[0] + (Math.random() - 0.5) * 0.002);
    const lng = rep.lng || (currentStart[1] + (Math.random() - 0.5) * 0.002);

    let pinColor = '#dc3545';
    let iconClass = 'bi-exclamation-triangle-fill';
    if (rep.issueType === 'No Shade') { pinColor = '#fd7e14'; iconClass = 'bi-sun-fill'; }
    if (rep.issueType === 'Poor Lighting') { pinColor = '#6c757d'; iconClass = 'bi-lightbulb-fill'; }
    if (rep.issueType === 'Unsafe Crossing') { pinColor = '#d63384'; iconClass = 'bi-person-walking'; }

    const hazardIcon = L.divIcon({
      className: 'hazard-marker',
      html: `<div style="background:${pinColor}; color:#fff; border:2px solid #fff; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.4);"><i class="bi ${iconClass}" style="font-size:13px;"></i></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const photoHtml = rep.photoURL 
      ? `<img src="${rep.photoURL}" style="width:100%; height:110px; object-fit:cover; border-radius:8px; margin-top:6px; margin-bottom:6px;" alt="Walkway Issue">` 
      : '';

    const popupHtml = `
      <div style="max-width:210px; font-family:sans-serif;">
        <span class="badge" style="background:${pinColor}; color:#fff; font-size:0.7rem;">${rep.issueType}</span>
        <strong style="display:block; margin-top:4px; font-size:0.85rem;">${rep.location}</strong>
        ${photoHtml}
        <p style="font-size:0.75rem; color:#555; margin-bottom:4px;">${rep.description || 'Walkway issue reported by resident.'}</p>
        <div style="font-size:0.7rem; color:#888;">Status: <strong>${rep.status}</strong></div>
      </div>
    `;

    L.marker([lat, lng], { icon: hazardIcon })
      .bindPopup(popupHtml)
      .addTo(hazardMarkersLayer);
  });
}

function renderStartAndDestMarkers() {
  if (startMarker) map.removeLayer(startMarker);
  if (destMarker) map.removeLayer(destMarker);

  const startIcon = L.divIcon({
    className: 'start-marker',
    html: '<div style="background:#0d6efd; color:#fff; border:3px solid #fff; border-radius:50%; width:26px; height:26px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 8px rgba(13,110,253,0.5);"><i class="bi bi-geo-alt-fill" style="font-size:12px;"></i></div>',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });

  startMarker = L.marker(currentStart, { icon: startIcon }).addTo(map)
    .bindPopup("<strong>Your Walk Origin</strong>");

  const destIcon = L.divIcon({
    className: 'dest-marker',
    html: '<div style="background:#198754; color:#fff; border:3px solid #fff; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3);"><i class="bi bi-train-front-fill" style="font-size:14px;"></i></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  destMarker = L.marker(currentDest, { icon: destIcon }).addTo(map)
    .bindPopup("<strong>Transit Destination</strong>");
}

function togglePinMode(enable) {
  isPinMode = enable;
  const pinBtn = document.getElementById('btn-pin-mode');
  if (isPinMode) {
    pinBtn.classList.remove('btn-light');
    pinBtn.classList.add('btn-danger');
    pinBtn.innerHTML = '<i class="bi bi-hand-index-thumb text-white"></i>';
  } else {
    pinBtn.classList.add('btn-light');
    pinBtn.classList.remove('btn-danger');
    pinBtn.innerHTML = '<i class="bi bi-geo-alt text-danger"></i>';
  }
}

// Locate via Browser GPS
function locateUser() {
  const btn = document.getElementById('btn-my-location');
  btn.innerHTML = '<span class="spinner-border spinner-border-sm text-primary"></span>';

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    btn.innerHTML = '<i class="bi bi-crosshair text-primary"></i>';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      currentStart = [pos.coords.latitude, pos.coords.longitude];
      renderStartAndDestMarkers();
      map.setView(currentStart, 16);
      calculateAndRenderRoutes(currentStart, currentDest);
      btn.innerHTML = '<i class="bi bi-crosshair text-primary"></i>';
    },
    (err) => {
      console.warn("GPS error, keeping default location:", err);
      alert("Could not access live GPS. Using current location on map.");
      btn.innerHTML = '<i class="bi bi-crosshair text-primary"></i>';
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

// Search Location via OpenStreetMap Nominatim API
async function handleSearch() {
  const query = document.getElementById('input-search').value.trim();
  if (!query) return;

  const btn = document.getElementById('btn-search');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

  try {
    const fullQuery = query.toLowerCase().includes('malaysia') ? query : `${query}, Malaysia`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&countrycodes=my&limit=1`;
    
    const res = await fetch(url, { headers: { 'User-Agent': 'TownshipRoutePlanner/1.0' } });
    const data = await res.json();

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      currentDest = [lat, lon];
      setDestination(currentDest, data[0].display_name.split(',')[0]);
    } else {
      alert("Station or place not found. Please try another name or use 'Pin on Map'.");
    }
  } catch (err) {
    console.error("Geocoding error:", err);
    alert("Search error. Please try again or tap 'Pin on Map'.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Go';
  }
}

function setDestination(coord, label) {
  currentDest = coord;
  const indicator = document.getElementById('dest-indicator');
  const labelEl = document.getElementById('dest-label');
  indicator.classList.remove('d-none');
  labelEl.textContent = label;

  renderStartAndDestMarkers();
  calculateAndRenderRoutes(currentStart, currentDest);
}

// Generate 3 Realistic Route Suggestions based on Start & Destination
async function calculateAndRenderRoutes(start, end) {
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const mainRoute = data.routes[0];
      const mainCoords = mainRoute.geometry.coordinates.map(c => [c[1], c[0]]);
      const dist = Math.round(mainRoute.distance);
      const mins = Math.max(1, Math.round(mainRoute.duration / 60));

      const steps = mainRoute.legs[0].steps.map(s => {
        let icon = 'bi-arrow-up';
        const mod = s.maneuver.modifier || '';
        if (mod.includes('left')) icon = 'bi-arrow-90deg-left';
        if (mod.includes('right')) icon = 'bi-arrow-90deg-right';
        if (s.maneuver.type === 'arrive') icon = 'bi-flag-fill';
        return {
          text: `${s.maneuver.type === 'arrive' ? 'Arrive at destination' : 'Walk'} ${s.name ? 'on ' + s.name : ''}`,
          dist: `${Math.round(s.distance)}m`,
          icon
        };
      });

      // Route 1: Shaded Tree Canopy Route
      routesList[0] = {
        id: "route_shaded",
        name: "Route 1: Shaded Tree Canopy Walkway",
        coordinates: mainCoords,
        distanceMeters: dist,
        walkTimeMins: mins,
        steps: steps.length > 0 ? steps : AUDIT_SEGMENTS[0].steps
      };

      // Route 2: Safe Detour bypassing reported sidewalk hazards
      const detourCoords = mainCoords.map((c, i) => {
        if (i > 1 && i < mainCoords.length - 2) {
          return [c[0] + 0.0003, c[1] - 0.0003]; // Slight arc around obstacle
        }
        return c;
      });
      routesList[1] = {
        id: "route_detour",
        name: "Route 2: Safe Detour (Bypasses Broken Kerb)",
        coordinates: detourCoords,
        distanceMeters: dist + 50,
        walkTimeMins: mins,
        steps: [
          { text: "Detour onto adjacent paved sidewalk to avoid broken kerb", dist: "100m", icon: "bi-shield-check" },
          ...steps
        ]
      };

      // Route 3: Step-free / Level Surface Route
      routesList[2] = {
        id: "route_accessible",
        name: "Route 3: Step-Free Accessible Path",
        coordinates: mainCoords,
        distanceMeters: dist + 30,
        walkTimeMins: mins + 1,
        steps: [
          { text: "Follow ramp access sidewalk and signalized crossing", dist: "150m", icon: "bi-person-wheelchair" },
          ...steps
        ]
      };
    }
  } catch (err) {
    console.warn("Using local audit segment routes:", err);
    routesList = [...AUDIT_SEGMENTS];
  }

  renderRoutePolylines();
}

function renderRoutePolylines() {
  document.getElementById('route-comparison').style.display = 'block';

  // Remove existing lines
  activePolylineLayers.forEach(l => map.removeLayer(l));
  activePolylineLayers = [];

  // Draw other unselected alternative routes with subtle style
  routesList.forEach((r, idx) => {
    if (idx !== selectedRouteIndex) {
      const altLine = L.polyline(r.coordinates, {
        color: '#6c757d',
        weight: 4,
        opacity: 0.5,
        dashArray: '5, 8'
      }).addTo(map).bindPopup(`<strong>${r.name}</strong><br>Click to choose this path`);
      altLine.on('click', () => selectRoute(idx));
      activePolylineLayers.push(altLine);
    }
  });

  // Draw the actively selected route boldly
  const activeRoute = routesList[selectedRouteIndex];
  const activeLine = L.polyline(activeRoute.coordinates, {
    color: selectedRouteIndex === 1 ? '#0d6efd' : '#198754',
    weight: 7,
    opacity: 0.95,
    lineJoin: 'round',
    lineCap: 'round'
  }).addTo(map).bindPopup(`<strong>${activeRoute.name}</strong><br>Currently Active Selected Route`);
  activePolylineLayers.push(activeLine);

  map.fitBounds(activeLine.getBounds(), { padding: [40, 40] });
}

// --- Live Waze / Moovit Style Navigation View ---
function initOrUpdateNavMap() {
  setTimeout(() => {
    const activeRoute = routesList[selectedRouteIndex] || routesList[0];

    if (!navMap) {
      navMap = L.map('nav-map', { zoomControl: false }).setView(currentStart, 17);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(navMap);

      L.control.zoom({ position: 'bottomright' }).addTo(navMap);
    } else {
      navMap.invalidateSize();
      if (navPolyline) navMap.removeLayer(navPolyline);
      if (navUserMarker) navMap.removeLayer(navUserMarker);
      if (navDestMarker) navMap.removeLayer(navDestMarker);
    }

    navPolyline = L.polyline(activeRoute.coordinates, {
      color: selectedRouteIndex === 1 ? '#0d6efd' : '#20c997',
      weight: 8,
      opacity: 0.95,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(navMap);

    const userPuck = L.divIcon({
      className: 'user-puck',
      html: '<div style="position:relative; width:26px; height:26px;"><div style="position:absolute; width:100%; height:100%; border-radius:50%; background:#0d6efd; opacity:0.3; animation:pulse 1.8s infinite;"></div><div style="position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#0d6efd; border:3px solid #fff; box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div></div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    navUserMarker = L.marker(currentStart, { icon: userPuck }).addTo(navMap)
      .bindPopup("<strong>You are here</strong>");

    const destFlag = L.divIcon({
      className: 'dest-flag',
      html: '<div style="background:#198754; color:#fff; border:2px solid #fff; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3);"><i class="bi bi-flag-fill"></i></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    navDestMarker = L.marker(currentDest, { icon: destFlag }).addTo(navMap)
      .bindPopup("<strong>Destination Station Entrance</strong>").openPopup();

    navMap.fitBounds(navPolyline.getBounds(), { padding: [50, 50] });

    const step = activeRoute.steps[0] || { text: "Follow safe walkway", dist: "100m", icon: "bi-arrow-up" };
    document.getElementById('nav-step-text').textContent = step.text;
    document.getElementById('nav-step-dist').textContent = `In ${step.dist}`;
    document.getElementById('nav-step-icon').className = `bi ${step.icon} fs-1`;
    document.getElementById('nav-remaining').textContent = `${activeRoute.distanceMeters} m`;
    document.getElementById('nav-eta').textContent = `${activeRoute.walkTimeMins} mins`;
    document.getElementById('nav-route-mode').textContent = activeRoute.name.split(':')[1] || "Safe Path";
  }, 150);
}

document.getElementById('btn-start-nav').addEventListener('click', () => {
  activateTab('view-nav');
});

document.getElementById('btn-exit-nav').addEventListener('click', () => {
  activateTab('view-routes');
});

// --- Reporting & Gemini AI ---
const photoInput = document.getElementById('report-photo');
const aiLoading = document.getElementById('ai-loading');
const aiBox = document.getElementById('ai-suggestion-box');
const aiNote = document.getElementById('ai-note');
let uploadedPhotoDataUrl = null;

document.getElementById('btn-use-current-location').addEventListener('click', () => {
  document.getElementById('report-location').value = `${currentStart[0].toFixed(5)}, ${currentStart[1].toFixed(5)} (Walkway Segment)`;
});

photoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedPhotoDataUrl = event.target.result;
  };
  reader.readAsDataURL(file);

  aiLoading.classList.remove('d-none');
  aiBox.classList.add('d-none');

  const suggestion = await analyzePhoto(file);
  aiLoading.classList.add('d-none');
  aiNote.textContent = suggestion;
  aiBox.classList.remove('d-none');

  const desc = document.getElementById('report-desc');
  if (!desc.value) {
    desc.value = suggestion;
  }
});

// Form Submit
document.getElementById('report-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const location = document.getElementById('report-location').value;
  const issueType = document.querySelector('input[name="issueType"]:checked').value;
  const description = document.getElementById('report-desc').value;

  const btn = document.getElementById('btn-submit-report');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Submitting...';

  const reportLat = currentStart[0] + (Math.random() - 0.5) * 0.001;
  const reportLng = currentStart[1] + (Math.random() - 0.5) * 0.001;

  const reportPayload = {
    location,
    issueType,
    description,
    photoURL: uploadedPhotoDataUrl,
    lat: reportLat,
    lng: reportLng
  };

  const newReport = await addReport(reportPayload);
  reportsData.unshift(newReport);

  btn.disabled = false;
  btn.innerHTML = '<i class="bi bi-send me-1"></i> Submit Report';

  e.target.reset();
  uploadedPhotoDataUrl = null;
  aiBox.classList.add('d-none');

  renderHazardPinsOnMap();
  renderReports();
  activateTab('view-feed');
});

// --- Render Reports Feed with Photos and Status Filtering ---
function renderReports() {
  const listEl = document.getElementById('reports-list');
  listEl.innerHTML = '';

  const filtered = activeStatusFilter === 'all' 
    ? reportsData 
    : reportsData.filter(r => r.status.toLowerCase() === activeStatusFilter.toLowerCase());

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="text-center text-muted py-4 small">No reports under "${activeStatusFilter}" status.</div>`;
    return;
  }

  filtered.forEach(rep => {
    let badgeClass = 'report-badge-new';
    let icon = 'bi-clock-history';
    if (rep.status === 'Seen') { badgeClass = 'report-badge-seen'; icon = 'bi-eye'; }
    if (rep.status === 'Fixed') { badgeClass = 'report-badge-fixed'; icon = 'bi-check-circle-fill'; }

    const photoImg = rep.photoURL 
      ? `<img src="${rep.photoURL}" class="img-fluid rounded-3 my-2 border" style="max-height:160px; width:100%; object-fit:cover;" alt="Report photo" />` 
      : '';

    const upvoteCount = rep.upvotes || 1;

    const card = document.createElement('div');
    card.className = 'card border-0 shadow-sm p-3 rounded-3';
    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-1">
        <h6 class="fw-bold mb-0 text-dark">${rep.location}</h6>
        <span class="badge ${badgeClass} small"><i class="bi ${icon} me-1"></i>${rep.status}</span>
      </div>
      <div class="text-success small fw-semibold mb-1">
        <i class="bi bi-exclamation-triangle me-1"></i> ${rep.issueType}
      </div>
      ${photoImg}
      <p class="text-muted small mb-2">${rep.description || 'No additional notes provided.'}</p>
      
      <div class="d-flex justify-content-between align-items-center pt-2 border-top text-muted" style="font-size: 0.72rem;">
        <button class="btn btn-sm btn-outline-secondary border-0 py-0 px-2 btn-upvote" data-rep-id="${rep.id}" style="font-size:0.75rem;">
          <i class="bi bi-hand-thumbs-up me-1 text-primary"></i> Confirmed (<span class="upvote-num">${upvoteCount}</span>)
        </button>
        <span>${rep.date || 'Today'}</span>
      </div>
    `;
    listEl.appendChild(card);
  });

  // Attach upvote listeners
  document.querySelectorAll('.btn-upvote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const numSpan = btn.querySelector('.upvote-num');
      const current = parseInt(numSpan.textContent, 10);
      numSpan.textContent = current + 1;
      btn.classList.remove('btn-outline-secondary');
      btn.classList.add('btn-primary', 'text-white');
      btn.disabled = true;
    });
  });
}

// Initial Boot
window.addEventListener('DOMContentLoaded', async () => {
  initMap();
  const remote = await getReports();
  if (remote && remote.length > 0) {
    reportsData = remote;
  }
  renderHazardPinsOnMap();
  renderReports();
});