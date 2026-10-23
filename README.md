# Township Route Planner (PWA)
> **Theme:** People (Mobility, Healthy Lifestyles) — Sime Darby Hackathon 2026  
> **Platform:** Mobile-First Progressive Web Application (PWA)  
> **Target Problem:** Solving Malaysia's First-and-Last Mile Pedestrian Connectivity Gap to Public Transit

---

## Executive Summary

Despite multi-billion ringgit investments in Malaysia's rail infrastructure (LRT, MRT, and Komuter), transit stations remain underutilized. The weakest link is the **first-and-last mile walk**: pedestrian corridors are frequently exposed to scorching midday heat, lack tree shade, feature broken kerbs, or feel unsafe after dark.

Conventional navigation apps (Google Maps, Waze) strictly optimize for the **shortest distance for cars**, leading commuters down unshaded, hazardous arterial roads.

**TeduhWay** is a climate-smart, human-centric route planner that optimizes pedestrian trips based on **thermal comfort (tree shade & covered awnings), pavement accessibility, and closed-loop community hazard reporting**.

---

## Key Features

1. **3 Smart Human-Centric Route Suggestions:**
   - **Route 1 (Shaded Tree Canopy):** Maximizes tree shade and shop awnings (+85% coverage) to prevent midday heat exhaustion.
   - **Route 2 (Safe Detour):** Automatically bypasses reported broken pavements, open drains, or construction hazards.
   - **Route 3 (100% Step-Free Accessible):** Ramp-only access, tactile paving, and signalized crossings designed for senior citizens, parents with strollers, and wheelchair users.

2. **Smart Walk Advisor:**
   - Real-time advice explaining the trade-offs of each route based on tropical temperatures, solar radiation, and accessibility needs.

3. **AI-Powered Photo Hazard Reporting:**
   - Residents snap photos of broken kerbs, missing tactile paths, or dark alleyways.
   - Integrated with computer vision AI to automatically assess and describe the defect.

4. **Interactive Map Hazard Pins with Photos:**
   - Community-reported issues appear directly on the map with color-coded severity and photo popups.

5. **Township Defect & Heat Stress Heatmap:**
   - One-tap heatmap overlay allowing township facilities managers (Sime Darby / Local Councils) to visualize walkability bottlenecks and prioritize where to plant shade trees or repair walkways.

6. **Healthy Lifestyle & ESG Impact Metrics:**
   - Real-time tracking of calories burned, active cardio minutes, and grams of CO₂ offset compared to taking a car or e-hailing for the first-mile trip.

7. **Closed-Loop Community Feed with Upvoting:**
   - Track reports from `🟡 New` ➔ `🔵 Seen by Council` ➔ `🟢 Fixed`.
   - Neighbors can upvote issues (**"Confirmed"**) to help councils prioritize high-traffic walkways.

8. **Progressive Web Application (PWA):**
   - Installable directly to phone home screens (iOS & Android) with zero app store download needed. Full offline caching support.

---

## Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES Modules), Bootstrap 5, Bootstrap Icons
* **Mapping & GIS:** Leaflet.js, OpenStreetMap Tiles, OSRM Foot Routing Engine, Nominatim Geocoding API
* **PWA & Offline:** Vite, `vite-plugin-pwa`, Workbox Service Worker, Web App Manifest
* **AI & Intelligence:** Google AI Studio API for photo hazard detection
* **Backend & Database:** Firebase Firestore (Cloud database) with instant offline local fallback

---

## Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/township-route-planner.git
cd township-route-planner
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```
Fill in your Firebase and AI Studio API keys:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 5. Build for Production
```bash
npm run build
npm run preview
```

---

## Alignment with Sime Darby Hackathon Theme: People (Mobility, Healthy Lifestyles)

* **Encouraging Active Commuting:** Making the walk to LRT/MRT comfortable and cool removes the #1 barrier to daily walking.
* **Senior & OKU Mobility:** Dedicated barrier-free routing guarantees seniors and mobility-impaired residents safe access to healthcare and public transit.
* **Actionable ESG Data:** Gives Sime Darby Property facilities management actionable citizen data on where to invest in shaded linkways and tree planting.

---

## Hackathon Team & Project Info
* **Project Name:** TeduhWay (Township Route Planner)
* **Theme:** People (Mobility, Healthy Lifestyles)
* **Event:** Sime Darby Hackathon 2026
* **License:** MIT
