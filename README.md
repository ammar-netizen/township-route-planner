# Full Report: Township Route Planner

**Theme:** People (Mobility, Healthy Lifestyles)  
**Status:** Completed Prototype & Proposal  
**Submission Deadline:** 23 October 2026, 11:59 PM  

---

## 1. Introduction

Many township residents can reach a public transport station only if the walk to it is safe and shaded. Malaysia’s first-and-last mile connectivity remains the weakest part of its public transport system, despite heavy rail transit investments (LRT, MRT, and Komuter). 

This project delivers **TeduhWay (Township Route Planner)**, a Progressive Web Application (PWA) that recommends the shadiest, safest walking routes from home to the nearest LRT, MRT, or bus stop, paired with a closed-loop reporting mechanism for residents to flag broken or unsafe pedestrian infrastructure.

---

## 2. Problem Statement

Residents can use public transport only if they can walk or cycle to it safely, but many township walkways are not built for that. Commuters frequently struggle with the first and last miles due to incomplete walkways, unsafe road crossings, and lack of protection from intense solar heat and tropical flash floods.

Older residents and individuals with mobility difficulties are hit hardest. Transportation and walkway constraints represent a major barrier to seniors' access to healthcare, social amenities, and daily transit.

### Our Evidence:
* **Resident Survey & Interviews:** Surveyed and interviewed **42 township residents and daily transit commuters** around the pilot station corridor (ages 19 to 68).
  * **78% of residents** drive or take e-hailing for first-mile trips under 1 km strictly due to extreme heat exposure and broken footpaths.
  * **86%** confirmed they would walk to the LRT/bus stop regularly if continuous tree shade or covered walkway awnings were available.
  * **64% of elderly respondents** cited missing kerb ramps, broken tactile tiles, and unprotected road crossings as their primary deterrent to walking.
* **Route Walk Audit Observations:**
  1. *Jalan SS15/4B (12:45 PM):* Midday solar radiation caused asphalt ground temperature to exceed 42°C; lack of canopy forced pedestrians onto the vehicular road shoulder.
  2. *Commercial Arcade Linkway to LRT (5:30 PM):* High-quality overhead shelter, but uneven pavement joints and missing drop-kerbs created trip hazards for senior citizens.
  3. *Alleyway connecting Block C to LRT (8:00 PM):* Non-functional street lighting across a 50-meter stretch, causing commuters to take an unlit, unsafe shortcut.

---

## 3. Target User and Scope

* **Who:** Residents of transit-adjacent townships near an LRT, MRT, or bus stop, specifically including older residents, families with strollers, and persons with mobility needs.
* **Where:** Walking corridors connecting residential homes and the nearest public transit station or bus stop in one pilot township (SS15 Subang Jaya Pilot, scalable to any Malaysian township via universal geocoding).
* **What:** A mobile-first route planner that recommends the shadiest and safest walking paths, turn-by-turn walking guidance, an automated hazard scan, and a report button for broken, unshaded, or unsafe segments.
* **Out of Scope:** Building physical footpaths, operating feeder bus fleets, modifying municipal traffic light cycles, and direct municipal council back-office system replacement. The solution works within existing infrastructure and highlights actionable gaps for township management and local councils.

---

## 4. Objectives

1. **Audit Walking Routes:** Score pedestrian segments on shade, lighting, pedestrian crossings, and footpath conditions, incorporating ground-truth data from resident route walks.
2. **Build a Human-Centric Route Planner:** Rank and present 3 distinct route suggestions:
   - *Route 1:* Shaded Tree Canopy Path (Thermal comfort & heat protection).
   - *Route 2:* Safe Detour (Bypasses verified broken pavements and hazards).
   - *Route 3:* 100% Step-Free Accessible Path (Senior and OKU/wheelchair friendly).
3. **Smart Walk Advisor:** Dynamically advise pedestrians on real-time route selection based on weather conditions (UV index, midday sun vs. rain) and accessibility needs.
4. **Launch Closed-Loop Reporting with AI:** Enable residents to flag hazards with photos, automated defect assessment, and an interactive status tracker (`New` ➔ `Seen by Council` ➔ `Fixed`) with community upvoting.
5. **Township Defect Heatmap:** Provide an interactive heatmap (`🔥`) allowing township management (Sime Darby Property / Local Councils) to visualize defect clusters and prioritize infrastructure maintenance.
6. **Quantify Health & ESG Impact:** Measure active calories burned and carbon emissions (CO₂) saved vs. driving for every first-mile walking commute.

---

## 5. Solution

The solution comprises three core pillars:

### 1. Route Audit & Dynamic Walkway Engine
Volunteers and residents walk feeder corridors to record ground-level scores (1 to 5) across shade, surface quality, and safety. The routing algorithm factors pedestrian comfort and physical barriers rather than raw vehicle distance:
$$\text{Segment Cost} = \text{Distance} \times \left(1 + \frac{5 - \text{Shade Score}}{2} + \frac{5 - \text{Safety Score}}{2}\right)$$

### 2. Route Planner & Turn-by-Turn Navigation
A mobile-first Progressive Web Application (PWA) that accepts user location (via GPS or map pin) and transit destinations (via live geocoding search). The app displays 3 selectable walking paths on real street geometry with turn-by-turn navigation instructions.

### 3. Closed-Loop Community Report Loop
Residents drop a pin, capture a photo, and submit reports. Automated image analysis evaluates the hazard severity, placing a photo pin on the map and populating a public status queue (`New`, `Seen`, `Fixed`) with neighbor upvoting support.

### Prototype Status:
* Working PWA with offline caching and home screen install capability.
* Live OpenStreetMap and OSRM pedestrian routing engine.
* Automated hazard detection and photo modal popups.
* Fullscreen map toggle and sliding bottom sheet for optimal usability.

---

## 6. Innovation

Most navigation applications (Google Maps, Waze) strictly optimize for vehicle speed or the shortest distance, directing pedestrians down blistering, dangerous arterial roads. 

**TeduhWay** innovates by:
1. Optimizing for **thermal comfort, tree shade, and human health**.
2. Providing **dynamic hazard-avoidance detours** around verified broken pavements.
3. Enabling **two-way civic accountability** through a public resolution tracker with community verification upvotes.
4. Supplying township developers like **Sime Darby Property** with actionable ESG data and sidewalk maintenance heatmaps.

---

## 7. Tech Stack & Architecture

* **Frontend:** HTML5, CSS3, JavaScript (ES Modules), Bootstrap 5, Bootstrap Icons
* **Mapping Engine:** Leaflet.js, OpenStreetMap Tiles, OSRM Foot Routing Engine, Nominatim Geocoding API
* **PWA & Offline:** Vite, `vite-plugin-pwa`, Workbox Service Worker, Web App Manifest
* **Cloud & Database:** Firebase Firestore with instant local memory fallback
* **AI Hazard Scan:** Computer vision analysis API for automated walkway defect summaries

---

## 8. Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Run
```bash
# 1. Clone repository
git clone https://github.com/ammar-netizen/township-route-planner.git
cd township-route-planner

# 2. Install dependencies
npm install

# 3. Configure .env file
copy .env.example .env
# Fill in your Firebase & AI configuration keys

# 4. Start local development server
npm run dev

# 5. Build for production PWA
npm run build
npm run preview
```
