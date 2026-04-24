'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MAP_BOUNDS } from '../lib/data'

// --- Colour tokens per field status ---
const STATUS_FILL = {
  healthy: 'rgba(45,106,79,0.45)',
  flood:   'rgba(21,101,192,0.45)',
  drought: 'rgba(217,119,6,0.45)',
  alert:   'rgba(220,38,38,0.40)',
}
const STATUS_STROKE = {
  healthy: '#52B788',
  flood:   '#64B5F6',
  drought: '#FCD34D',
  alert:   '#FCA5A5',
}
const STATUS_LABEL = {
  healthy: 'Optimal',
  flood:   'Flood Risk',
  drought: 'Drought',
  alert:   'Warning',
}

const VIEW_W = 800
const VIEW_H = 520

function project(lat, lng) {
  const { minLat, maxLat, minLng, maxLng } = MAP_BOUNDS
  const x = ((lng - minLng) / (maxLng - minLng)) * VIEW_W
  const y = (1 - (lat - minLat) / (maxLat - minLat)) * VIEW_H
  return { x, y }
}

function unproject(x, y) {
  const { minLat, maxLat, minLng, maxLng } = MAP_BOUNDS
  const lng = minLng + (x / VIEW_W) * (maxLng - minLng)
  const lat = minLat + (1 - y / VIEW_H) * (maxLat - minLat)
  return { lat, lng }
}

function polygonPath(points) {
  if (!points || points.length === 0) return ''
  return points
    .map((p, i) => {
      const { x, y } = project(p.lat, p.lng)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ') + ' Z'
}

/**
 * InteractiveMap
 * Props:
 *  - fields: array of fields with { polygon, status, ... }
 *  - selectedField: id of selected field
 *  - onSelectField: (id) => void
 *  - drawMode: 'none' | 'rect' | 'polygon'
 *  - onAreaDrawn: (points: [{lat,lng}...]) => void
 *  - showControls: bool — show the Draw / Clear toolbar on top
 *  - highlight: optional preview polygon {points: [...]}
 *  - height: custom height (default 520)
 */
export default function InteractiveMap({
  fields = [],
  selectedField = null,
  onSelectField = () => {},
  drawMode: externalDrawMode,
  onAreaDrawn = () => {},
  showControls = true,
  highlight = null,
  height = VIEW_H,
}) {
  const svgRef = useRef(null)
  const [internalDrawMode, setInternalDrawMode] = useState('none')
  const drawMode = externalDrawMode ?? internalDrawMode

  const [rectStart, setRectStart] = useState(null)   // {x,y} svg coords
  const [rectEnd, setRectEnd] = useState(null)
  const [polyPoints, setPolyPoints] = useState([])   // svg coords
  const [mouse, setMouse] = useState(null)

  // reset in-progress drawing when mode changes
  useEffect(() => {
    setRectStart(null); setRectEnd(null); setPolyPoints([])
  }, [drawMode])

  function toSvgCoords(evt) {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = evt.clientX; pt.y = evt.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const p = pt.matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  function handleMouseDown(evt) {
    if (drawMode === 'none') return
    const { x, y } = toSvgCoords(evt)
    if (drawMode === 'rect') {
      setRectStart({ x, y })
      setRectEnd({ x, y })
    }
  }

  function handleMouseMove(evt) {
    const { x, y } = toSvgCoords(evt)
    setMouse({ x, y })
    if (drawMode === 'rect' && rectStart) {
      setRectEnd({ x, y })
    }
  }

  function handleMouseUp() {
    if (drawMode === 'rect' && rectStart && rectEnd) {
      const x1 = Math.min(rectStart.x, rectEnd.x)
      const x2 = Math.max(rectStart.x, rectEnd.x)
      const y1 = Math.min(rectStart.y, rectEnd.y)
      const y2 = Math.max(rectStart.y, rectEnd.y)
      if (Math.abs(x2 - x1) > 5 && Math.abs(y2 - y1) > 5) {
        const pts = [
          unproject(x1, y1),
          unproject(x2, y1),
          unproject(x2, y2),
          unproject(x1, y2),
        ]
        onAreaDrawn(pts)
      }
      setRectStart(null); setRectEnd(null)
    }
  }

  function handleClick(evt) {
    if (drawMode !== 'polygon') return
    const { x, y } = toSvgCoords(evt)
    const next = [...polyPoints, { x, y }]
    // double-click closes
    if (evt.detail === 2 && next.length >= 3) {
      onAreaDrawn(next.map(p => unproject(p.x, p.y)))
      setPolyPoints([])
      return
    }
    setPolyPoints(next)
  }

  function finishPolygon() {
    if (polyPoints.length >= 3) {
      onAreaDrawn(polyPoints.map(p => unproject(p.x, p.y)))
      setPolyPoints([])
    }
  }

  function setMode(m) {
    if (externalDrawMode == null) setInternalDrawMode(m)
  }

  const rectBox = useMemo(() => {
    if (!rectStart || !rectEnd) return null
    const x = Math.min(rectStart.x, rectEnd.x)
    const y = Math.min(rectStart.y, rectEnd.y)
    const w = Math.abs(rectEnd.x - rectStart.x)
    const h = Math.abs(rectEnd.y - rectStart.y)
    return { x, y, w, h }
  }, [rectStart, rectEnd])

  const polyPath = useMemo(() => {
    if (polyPoints.length === 0) return ''
    const base = polyPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    return base
  }, [polyPoints])

  const highlightPath = useMemo(() => polygonPath(highlight?.points), [highlight])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {showControls && (
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 5,
          display: 'flex', gap: 6, padding: 4,
          background: 'rgba(5,10,7,0.75)',
          border: '1px solid rgba(82,183,136,0.18)',
          borderRadius: 10,
          backdropFilter: 'blur(8px)',
        }}>
          <MapToolButton active={drawMode === 'none'} onClick={() => setMode('none')} icon="🖐" label="Pan" />
          <MapToolButton active={drawMode === 'rect'} onClick={() => setMode('rect')} icon="▭" label="Rectangle" />
          <MapToolButton active={drawMode === 'polygon'} onClick={() => setMode('polygon')} icon="⬡" label="Polygon" />
          {drawMode === 'polygon' && polyPoints.length >= 3 && (
            <button onClick={finishPolygon} style={toolBtnStyle(true, '#86EFAC')}>
              ✓ Finish
            </button>
          )}
          {drawMode === 'polygon' && polyPoints.length > 0 && (
            <button onClick={() => setPolyPoints([])} style={toolBtnStyle(false)}>✕ Clear</button>
          )}
        </div>
      )}

      {drawMode !== 'none' && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 5,
          padding: '6px 10px',
          background: 'rgba(5,10,7,0.75)',
          border: '1px solid rgba(82,183,136,0.18)',
          borderRadius: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#86EFAC',
          backdropFilter: 'blur(8px)',
        }}>
          {drawMode === 'rect'
            ? 'Click & drag to select an area'
            : `Click to add points · double-click to close (${polyPoints.length})`}
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height,
          display: 'block',
          borderRadius: 10,
          background: 'linear-gradient(180deg, #0a1a0f 0%, #051009 100%)',
          border: '1px solid rgba(82,183,136,0.12)',
          cursor: drawMode === 'rect'
            ? 'crosshair'
            : drawMode === 'polygon'
              ? 'crosshair'
              : 'default',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setMouse(null); setRectStart(null); setRectEnd(null) }}
        onClick={handleClick}
      >
        <defs>
          <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(82,183,136,0.06)" strokeWidth="1" />
          </pattern>
          <pattern id="topoGrid" width="160" height="160" patternUnits="userSpaceOnUse">
            <path d="M 160 0 L 0 0 0 160" fill="none" stroke="rgba(82,183,136,0.1)" strokeWidth="1" />
          </pattern>
          <radialGradient id="bgGlow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="rgba(82,183,136,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        <rect width={VIEW_W} height={VIEW_H} fill="url(#mapGrid)" />
        <rect width={VIEW_W} height={VIEW_H} fill="url(#topoGrid)" />
        <rect width={VIEW_W} height={VIEW_H} fill="url(#bgGlow)" />

        {/* Decorative topo curves */}
        <path d={`M 0 ${VIEW_H * 0.3} Q ${VIEW_W * 0.3} ${VIEW_H * 0.25} ${VIEW_W * 0.6} ${VIEW_H * 0.35} T ${VIEW_W} ${VIEW_H * 0.32}`}
              fill="none" stroke="rgba(82,183,136,0.08)" strokeWidth="1" />
        <path d={`M 0 ${VIEW_H * 0.6} Q ${VIEW_W * 0.4} ${VIEW_H * 0.55} ${VIEW_W * 0.7} ${VIEW_H * 0.65} T ${VIEW_W} ${VIEW_H * 0.62}`}
              fill="none" stroke="rgba(82,183,136,0.08)" strokeWidth="1" />

        {/* Render every field polygon */}
        {fields.map((field) => {
          if (!field.polygon || field.polygon.length < 3) return null
          const isSelected = selectedField === field.id
          const fill = STATUS_FILL[field.status] || STATUS_FILL.healthy
          const stroke = STATUS_STROKE[field.status] || STATUS_STROKE.healthy
          const d = polygonPath(field.polygon)
          const { x: cx, y: cy } = project(
            field.polygon.reduce((s, p) => s + p.lat, 0) / field.polygon.length,
            field.polygon.reduce((s, p) => s + p.lng, 0) / field.polygon.length
          )

          return (
            <g
              key={field.id}
              onClick={(e) => {
                if (drawMode !== 'none') return
                e.stopPropagation()
                onSelectField(isSelected ? null : field.id)
              }}
              style={{ cursor: drawMode === 'none' ? 'pointer' : 'inherit' }}
            >
              <path
                d={d}
                fill={fill}
                stroke={stroke}
                strokeWidth={isSelected ? 3 : 1.5}
                strokeLinejoin="round"
                style={{
                  filter: isSelected ? `drop-shadow(0 0 12px ${stroke})` : 'none',
                  transition: 'stroke-width 0.2s ease, filter 0.2s ease',
                }}
              />
              <text
                x={cx}
                y={cy - 6}
                textAnchor="middle"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  fontSize: 11,
                  fill: '#E8F5E9',
                  pointerEvents: 'none',
                }}
              >{field.name}</text>
              <text
                x={cx}
                y={cy + 8}
                textAnchor="middle"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  fill: stroke,
                  pointerEvents: 'none',
                }}
              >{field.area} ha · {STATUS_LABEL[field.status]}</text>
            </g>
          )
        })}

        {/* Highlight preview (for drawn area before it's saved) */}
        {highlight && highlightPath && (
          <path
            d={highlightPath}
            fill="rgba(82,183,136,0.18)"
            stroke="#86EFAC"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        )}

        {/* Active rectangle selection */}
        {rectBox && (
          <rect
            x={rectBox.x}
            y={rectBox.y}
            width={rectBox.w}
            height={rectBox.h}
            fill="rgba(134,239,172,0.12)"
            stroke="#86EFAC"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        )}

        {/* In-progress polygon */}
        {polyPoints.length > 0 && (
          <g>
            <path
              d={polyPath + (mouse ? ` L${mouse.x.toFixed(1)},${mouse.y.toFixed(1)}` : '')}
              fill="rgba(134,239,172,0.08)"
              stroke="#86EFAC"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            {polyPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="4" fill="#86EFAC" stroke="#051009" strokeWidth="1.5" />
            ))}
          </g>
        )}

        {/* Coordinates cursor readout */}
        {mouse && (
          <g>
            <rect
              x={VIEW_W - 120}
              y={VIEW_H - 28}
              width={112}
              height={20}
              rx="4"
              fill="rgba(5,10,7,0.8)"
              stroke="rgba(82,183,136,0.2)"
            />
            <text
              x={VIEW_W - 64}
              y={VIEW_H - 14}
              textAnchor="middle"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fill: 'rgba(232,245,233,0.6)',
              }}
            >
              {(() => {
                const { lat, lng } = unproject(mouse.x, mouse.y)
                return `${lat.toFixed(3)}°N  ${lng.toFixed(3)}°E`
              })()}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

function MapToolButton({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={toolBtnStyle(active)} title={label}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function toolBtnStyle(active, accent = '#86EFAC') {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 6,
    border: active ? '1px solid rgba(134,239,172,0.4)' : '1px solid transparent',
    background: active ? 'rgba(82,183,136,0.15)' : 'transparent',
    color: active ? accent : 'rgba(232,245,233,0.6)',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  }
}
