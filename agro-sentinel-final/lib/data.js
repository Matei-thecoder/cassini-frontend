// Mock data — replace with real API calls to your backend

// Map canvas bounds (all field polygons live inside this lat/lng window)
export const MAP_BOUNDS = {
  minLat: 47.12,
  maxLat: 47.23,
  minLng: 27.48,
  maxLng: 27.66,
}

export const FIELDS = [
  {
    id: 'f001',
    name: 'North Sector Alpha',
    area: 142,
    crop: 'Wheat',
    status: 'healthy',
    soilMoisture: 68,
    ndvi: 0.72,
    lat: 47.19,
    lng: 27.55,
    lastUpdated: '2 min ago',
    alert: null,
    polygon: [
      { lat: 47.215, lng: 27.515 },
      { lat: 47.220, lng: 27.565 },
      { lat: 47.200, lng: 27.585 },
      { lat: 47.190, lng: 27.545 },
      { lat: 47.198, lng: 27.510 },
    ],
  },
  {
    id: 'f002',
    name: 'East Basin Delta',
    area: 89,
    crop: 'Corn',
    status: 'flood',
    soilMoisture: 94,
    ndvi: 0.41,
    lat: 47.18,
    lng: 27.63,
    lastUpdated: '5 min ago',
    alert: 'Excess water detected — 94% soil saturation',
    polygon: [
      { lat: 47.195, lng: 27.605 },
      { lat: 47.200, lng: 27.650 },
      { lat: 47.175, lng: 27.655 },
      { lat: 47.165, lng: 27.620 },
      { lat: 47.180, lng: 27.598 },
    ],
  },
  {
    id: 'f003',
    name: 'South Plains Gamma',
    area: 217,
    crop: 'Sunflower',
    status: 'drought',
    soilMoisture: 18,
    ndvi: 0.29,
    lat: 47.14,
    lng: 27.54,
    lastUpdated: '8 min ago',
    alert: 'Critical moisture deficit — irrigation required',
    polygon: [
      { lat: 47.155, lng: 27.495 },
      { lat: 47.160, lng: 27.560 },
      { lat: 47.130, lng: 27.580 },
      { lat: 47.125, lng: 27.520 },
      { lat: 47.135, lng: 27.490 },
    ],
  },
  {
    id: 'f004',
    name: 'West Ridge Beta',
    area: 103,
    crop: 'Soybean',
    status: 'healthy',
    soilMoisture: 61,
    ndvi: 0.68,
    lat: 47.19,
    lng: 27.49,
    lastUpdated: '1 min ago',
    alert: null,
    polygon: [
      { lat: 47.205, lng: 27.485 },
      { lat: 47.195, lng: 27.505 },
      { lat: 47.175, lng: 27.500 },
      { lat: 47.170, lng: 27.485 },
      { lat: 47.185, lng: 27.475 },
    ],
  },
  {
    id: 'f005',
    name: 'Central Plateau',
    area: 178,
    crop: 'Barley',
    status: 'alert',
    soilMoisture: 34,
    ndvi: 0.48,
    lat: 47.17,
    lng: 27.58,
    lastUpdated: '12 min ago',
    alert: 'Moisture trending down — monitor closely',
    polygon: [
      { lat: 47.185, lng: 27.565 },
      { lat: 47.185, lng: 27.605 },
      { lat: 47.160, lng: 27.605 },
      { lat: 47.155, lng: 27.570 },
      { lat: 47.170, lng: 27.555 },
    ],
  },
]

export const ECONOMIC_DATA = [
  { month: 'Jan', projected: 180000, actual: 172000, baseline: 165000 },
  { month: 'Feb', projected: 195000, actual: 188000, baseline: 165000 },
  { month: 'Mar', projected: 210000, actual: 205000, baseline: 165000 },
  { month: 'Apr', projected: 225000, actual: 218000, baseline: 165000 },
  { month: 'May', projected: 245000, actual: 229000, baseline: 165000 },
  { month: 'Jun', projected: 280000, actual: null, baseline: 165000 },
  { month: 'Jul', projected: 310000, actual: null, baseline: 165000 },
  { month: 'Aug', projected: 340000, actual: null, baseline: 165000 },
  { month: 'Sep', projected: 295000, actual: null, baseline: 165000 },
  { month: 'Oct', projected: 260000, actual: null, baseline: 165000 },
  { month: 'Nov', projected: 210000, actual: null, baseline: 165000 },
  { month: 'Dec', projected: 185000, actual: null, baseline: 165000 },
]

export const MOISTURE_TIMELINE = [
  { day: 'D-6', alpha: 71, delta: 88, gamma: 24, beta: 63 },
  { day: 'D-5', alpha: 69, delta: 89, gamma: 22, beta: 64 },
  { day: 'D-4', alpha: 70, delta: 91, gamma: 20, beta: 62 },
  { day: 'D-3', alpha: 72, delta: 93, gamma: 19, beta: 61 },
  { day: 'D-2', alpha: 68, delta: 92, gamma: 18, beta: 60 },
  { day: 'D-1', alpha: 67, delta: 94, gamma: 17, beta: 62 },
  { day: 'Now', alpha: 68, delta: 94, gamma: 18, beta: 61 },
]

export const SATELLITE_CELLS = Array.from({ length: 48 }, (_, i) => {
  const row = Math.floor(i / 8)
  const col = i % 8
  if (col >= 5 && row >= 2 && row <= 4) return { type: 'flood', intensity: 0.7 + Math.random() * 0.3 }
  if (col <= 2 && row >= 3) return { type: 'drought', intensity: 0.5 + Math.random() * 0.4 }
  if (row === 0 || row === 5) return { type: 'boundary', intensity: 0.3 }
  return { type: 'healthy', intensity: 0.4 + Math.random() * 0.5 }
})

export const WEATHER_FORECAST = [
  { day: 'Today', icon: '🌧', temp: 14, precip: 78 },
  { day: 'Fri', icon: '⛅', temp: 17, precip: 30 },
  { day: 'Sat', icon: '☀️', temp: 21, precip: 5 },
  { day: 'Sun', icon: '☀️', temp: 23, precip: 2 },
  { day: 'Mon', icon: '🌥', temp: 19, precip: 20 },
]

export const SUMMARY_STATS = {
  totalArea: 729,
  healthyPercent: 48,
  floodRisk: 12,
  droughtRisk: 30,
  alertZones: 10,
  projectedYield: '€1.24M',
  yieldChange: '+8.3%',
  activeSensors: 847,
}

export const CROP_OPTIONS = [
  'Wheat', 'Corn', 'Sunflower', 'Soybean', 'Barley',
  'Rapeseed', 'Sugar Beet', 'Rice', 'Oats', 'Alfalfa',
]
