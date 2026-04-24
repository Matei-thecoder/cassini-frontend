// Fields store — merges the seed data from data.js with user-drawn fields
// saved in localStorage. Emits events so all views refresh together.

import { FIELDS as SEED_FIELDS } from './data'

const KEY_FIELDS = 'agro.fields'
const EVENT = 'agro:fields'

function safeStorage() {
  if (typeof window === 'undefined') return null
  try { return window.localStorage } catch { return null }
}

function readUserFields() {
  const s = safeStorage()
  if (!s) return []
  try {
    return JSON.parse(s.getItem(KEY_FIELDS) || '[]')
  } catch {
    return []
  }
}

function writeUserFields(fields) {
  const s = safeStorage()
  if (!s) return
  s.setItem(KEY_FIELDS, JSON.stringify(fields))
  window.dispatchEvent(new CustomEvent(EVENT))
}

export function getAllFields() {
  // Seeds first (immutable), then user-drawn fields
  return [...SEED_FIELDS, ...readUserFields()]
}

export function addField(field) {
  const userFields = readUserFields()
  const next = [...userFields, {
    ...field,
    id: field.id || `f_${Date.now().toString(36)}`,
    userCreated: true,
    lastUpdated: 'just now',
  }]
  writeUserFields(next)
  return next[next.length - 1]
}

export function removeField(id) {
  const next = readUserFields().filter(f => f.id !== id)
  writeUserFields(next)
}

export function onFieldsChange(cb) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => cb(getAllFields())
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}

// ---------- helpers for drawn polygons ----------

// Area of a polygon on a flat lat/lng projection → approximate hectares.
// Good enough for a demo; for precision use Turf or the haversine shoelace.
export function hectaresFromPolygon(points) {
  if (!points || points.length < 3) return 0
  const metersPerDegLat = 111_320
  const avgLat = points.reduce((s, p) => s + p.lat, 0) / points.length
  const metersPerDegLng = 111_320 * Math.cos((avgLat * Math.PI) / 180)

  let area = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    const ax = a.lng * metersPerDegLng
    const ay = a.lat * metersPerDegLat
    const bx = b.lng * metersPerDegLng
    const by = b.lat * metersPerDegLat
    area += ax * by - bx * ay
  }
  const sqMeters = Math.abs(area) / 2
  return Math.round(sqMeters / 10_000) // 1 ha = 10,000 m²
}

export function centroid(points) {
  if (!points || points.length === 0) return { lat: 0, lng: 0 }
  const sum = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 }
  )
  return {
    lat: +(sum.lat / points.length).toFixed(4),
    lng: +(sum.lng / points.length).toFixed(4),
  }
}
