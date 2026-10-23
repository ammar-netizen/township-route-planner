// Multi-Route Walkway Suggestions (Avoiding reported broken roads & construction hazards)

export const AUDIT_SEGMENTS = [
  {
    id: "route_shaded",
    name: "Shaded Tree & Awning Path",
    badge: "Most Shaded & Comfortable",
    badgeClass: "bg-success-subtle text-success border border-success-subtle",
    icon: "bi-tree-fill",
    color: "#198754",
    distanceMeters: 720,
    walkTimeMins: 9,
    shadePercent: 85,
    tag: "Avoids heat & open asphalt",
    coordinates: [
      [3.076563, 101.587957],
      [3.076819, 101.588210],
      [3.077053, 101.588441],
      [3.077497, 101.588439],
      [3.078074, 101.588438],
      [3.078411, 101.588435],
      [3.078632, 101.588434],
      [3.078633, 101.589032],
      [3.078634, 101.589139],
      [3.078635, 101.589766],
      [3.078635, 101.589793],
      [3.078636, 101.590072],
      [3.078636, 101.590169],
      [3.078284, 101.590174],
      [3.077341, 101.590188],
      [3.077346, 101.590466],
      [3.077344, 101.590744],
      [3.077888, 101.590743],
      [3.077981, 101.590810]
    ],
    steps: [
      { text: "Walk northeast on Jalan SS 15/4C shaded sidewalk", dist: "250m", icon: "bi-arrow-up" },
      { text: "Turn right onto covered shop awning walkway on Jalan SS 15/3B", dist: "180m", icon: "bi-arrow-90deg-right" },
      { text: "Turn right onto Jalan SS 15/4 tree-lined pedestrian path", dist: "150m", icon: "bi-arrow-90deg-right" },
      { text: "Turn left onto Jalan SS 15/6 towards LRT entrance", dist: "60m", icon: "bi-arrow-90deg-left" },
      { text: "Arrive safely at SS15 LRT Station", dist: "80m", icon: "bi-flag-fill" }
    ]
  },
  {
    id: "route_detour",
    name: "Safe Detour (Avoids Broken Path)",
    badge: "Recommended: Bypasses Hazard",
    badgeClass: "bg-primary-subtle text-primary border border-primary-subtle",
    icon: "bi-shield-check",
    color: "#0d6efd",
    distanceMeters: 760,
    walkTimeMins: 9,
    shadePercent: 75,
    tag: "Smooth paved sidewalk, 0 broken kerbs",
    coordinates: [
      [3.076563, 101.587957],
      [3.076580, 101.587400],
      [3.077500, 101.587410],
      [3.078630, 101.587420],
      [3.078632, 101.588434],
      [3.078635, 101.589766],
      [3.078636, 101.590169],
      [3.077346, 101.590466],
      [3.077981, 101.590810]
    ],
    steps: [
      { text: "Detour west to bypass damaged pavement at SS15/4D", dist: "120m", icon: "bi-arrow-left" },
      { text: "Continue along newly paved, flat residential sidewalk", dist: "280m", icon: "bi-arrow-up" },
      { text: "Turn right towards SS15 town centre commercial walkway", dist: "230m", icon: "bi-arrow-90deg-right" },
      { text: "Arrive safely at SS15 LRT Station", dist: "130m", icon: "bi-flag-fill" }
    ]
  },
  {
    id: "route_accessible",
    name: "Step-Free Accessible Path",
    badge: "Senior & Wheelchair Friendly",
    badgeClass: "bg-info-subtle text-dark border border-info-subtle",
    icon: "bi-person-wheelchair",
    color: "#0dcaf0",
    distanceMeters: 740,
    walkTimeMins: 10,
    shadePercent: 70,
    tag: "100% Ramp access, no stairs or high kerbs",
    coordinates: [
      [3.076563, 101.587957],
      [3.076819, 101.588210],
      [3.077053, 101.588441],
      [3.077497, 101.588439],
      [3.077500, 101.589300],
      [3.077510, 101.590200],
      [3.077346, 101.590466],
      [3.077981, 101.590810]
    ],
    steps: [
      { text: "Follow ramp access sidewalk on Jalan SS 15/4C", dist: "200m", icon: "bi-arrow-up" },
      { text: "Cross pedestrian zebra crossing with audible signal", dist: "90m", icon: "bi-person-walking" },
      { text: "Follow level surface direct to LRT lift / escalator", dist: "450m", icon: "bi-arrow-up" },
      { text: "Arrive at LRT Station Accessible Entrance", dist: "0m", icon: "bi-flag-fill" }
    ]
  }
];

export const INITIAL_REPORTS = [
  {
    id: "rep-101",
    location: "Jalan SS15/4D curb",
    issueType: "Broken Path",
    description: "Deep cracks, missing tactile tiles, and exposed rebar. Route 2 detours around this safely.",
    status: "New",
    date: "20 Oct 2026",
    lat: 3.0768,
    lng: 101.5882,
    upvotes: 14,
    photoURL: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "rep-102",
    location: "Jalan SS15/4 Near Subang Square",
    issueType: "No Shade",
    description: "Zero canopy or tree cover. Walkers exposed to direct midday sun.",
    status: "Seen",
    date: "21 Oct 2026",
    lat: 3.0773,
    lng: 101.5898,
    upvotes: 9,
    photoURL: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "rep-103",
    location: "Alleyway connection to SS15 LRT",
    issueType: "Poor Lighting",
    description: "Street lamp out of order. Dark and feels unsafe after 7:30 PM.",
    status: "Fixed",
    date: "22 Oct 2026",
    lat: 3.0776,
    lng: 101.5905,
    upvotes: 21,
    photoURL: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80"
  }
];