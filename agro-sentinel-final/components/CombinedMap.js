
'use client'

{/*'use client'
import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Internal component to sync Leaflet and your SVG layer
function MapSync({ onMove }) {
  useMapEvents({
    move: () => onMove(),
    zoom: () => onMove(),
  })
  return null
}

export default function CombinedMap({ fields = [], onAreaDrawn, drawMode, setDrawMode }) {
  const [map, setMap] = useState(null)
  const [tick, setTick] = useState(0) // Forces SVG re-render
  const [polyPoints, setPolyPoints] = useState([])
  const [tempRect, setTempRect] = useState(null)

  // Coordinate Projection: LngLat -> Pixels
  const project = (lng, lat) => {
    if (!map) return { x: 0, y: 0 }
    const point = map.latLngToContainerPoint([lat, lng])
    return { x: point.x, y: point.y }
  }

  // Click handler for drawing
  const handleMapClick = (e) => {
    if (drawMode === 'polygon') {
      setPolyPoints(prev => [...prev, { lng: e.latlng.lng, lat: e.latlng.lat }])
    }
  }

  // Rectangle Drawing Logic
  const handleMouseDown = (e) => {
    if (drawMode !== 'rect') return
    map.dragging.disable()
    setTempRect({ start: e.latlng, end: e.latlng })
  }

  const handleMouseMove = (e) => {
    if (drawMode === 'rect' && tempRect) {
      setTempRect(prev => ({ ...prev, end: e.latlng }))
    }
  }

  const handleMouseUp = () => {
    if (drawMode === 'rect' && tempRect) {
      const { start, end } = tempRect
      onAreaDrawn([
        { lat: start.lat, lng: start.lng },
        { lat: start.lat, lng: end.lng },
        { lat: end.lat, lng: end.lng },
        { lat: end.lat, lng: start.lng }
      ])
      setTempRect(null)
      setDrawMode('none')
      map.dragging.enable()
    }
  }

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-[#52B788]/20 shadow-2xl bg-[#051009]">
      <MapContainer
        center={[47.1622, 27.5886]}
        // Oraș	Coordonate
      // Bucharest	[44.4268, 26.1025]
      // Iași	[47.1622, 27.5886]
      // Cluj-Napoca	[46.7712, 23.5556]
      // Timișoara	[45.7472, 21.1921]
      // Constanța	[44.1598, 28.6518]

        zoom={13}
        ref={setMap}
        zoomControl={false}
        className="z-0 w-full h-full"
      >
        {/* Esri World Imagery (High-res Satellite, No API Key Required) }
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; Esri'
        />
        
        <MapSync onMove={() => setTick(t => t + 1)} />

        {/* Capture Mouse Events for Drawing }
        <MapEventsProxy 
          onClick={handleMapClick} 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </MapContainer>

      {/* SVG Layer (Same logic as before, now synced to Leaflet) }
      <svg className="absolute inset-0 pointer-events-none w-full h-full z-10">
        {map && fields.map(field => {
          const pathData = (field.geometry || field.polygon).map((p, i) => {
            const { x, y } = project(p.lng, p.lat)
            return `${i === 0 ? 'M' : 'L'}${x},${y}`
          }).join(' ') + ' Z'
          return (
            <path key={field.id} d={pathData} fill="rgba(82,183,136,0.3)" stroke="#86EFAC" strokeWidth="2" />
          )
        })}

        {/* Current Drawing }
        {polyPoints.length > 0 && (
          <path
            d={polyPoints.map((p, i) => {
              const { x, y } = project(p.lng, p.lat)
              return `${i === 0 ? 'M' : 'L'}${x},${y}`
            }).join(' ')}
            fill="none" stroke="#86EFAC" strokeDasharray="4 4" strokeWidth="2"
          />
        )}

        {tempRect && (
          <rect
            {...(() => {
              const p1 = project(tempRect.start.lng, tempRect.start.lat)
              const p2 = project(tempRect.end.lng, tempRect.end.lat)
              return {
                x: Math.min(p1.x, p2.x), y: Math.min(p1.y, p2.y),
                width: Math.abs(p2.x - p1.x), height: Math.abs(p2.y - p1.y)
              }
            })()}
            fill="rgba(134,239,172,0.2)" stroke="#86EFAC" strokeWidth="2"
          />
        )}
      </svg>

      {/* Toolbar }
      <div className="absolute top-4 left-4 flex gap-2 bg-[#051009]/90 p-2 rounded-xl border border-[#52B788]/30 z-20">
        <button onClick={() => setDrawMode('none')} className={`p-2 rounded ${drawMode === 'none' ? 'bg-[#16A34A]' : ''}`}>🖐</button>
        <button onClick={() => setDrawMode('rect')} className={`p-2 rounded ${drawMode === 'rect' ? 'bg-[#16A34A]' : ''}`}>▭</button>
        <button onClick={() => setDrawMode('polygon')} className={`p-2 rounded ${drawMode === 'polygon' ? 'bg-[#16A34A]' : ''}`}>⬡</button>
        {polyPoints.length >= 3 && (
          <button onClick={() => { onAreaDrawn(polyPoints); setPolyPoints([]); setDrawMode('none') }} className="bg-[#16A34A] px-2 rounded text-xs">Finish</button>
        )}
      </div>
    </div>
  )
}

// Helper to bridge React-Leaflet events to your handlers
function MapEventsProxy({ onClick, onMouseDown, onMouseMove, onMouseUp }) {
  useMapEvents({
    click: onClick,
    mousedown: onMouseDown,
    mousemove: onMouseMove,
    mouseup: onMouseUp,
  })
  return null
}*/}

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Internal component to sync Leaflet and your SVG layer
function MapSync({ onMove }) {
  useMapEvents({
    move: () => onMove(),
    zoom: () => onMove(),
  })
  return null
}

export default function CombinedMap({ fields = [], onAreaDrawn, drawMode, setDrawMode }) {
  const [map, setMap] = useState(null)
  const [tick, setTick] = useState(0) // Forces SVG re-render
  const [polyPoints, setPolyPoints] = useState([])
  const [tempRect, setTempRect] = useState(null)

  // Coordinate Projection: LngLat -> Pixels
  const project = (lng, lat) => {
    if (!map) return { x: 0, y: 0 }
    const point = map.latLngToContainerPoint([lat, lng])
    return { x: point.x, y: point.y }
  }

  // Click handler for drawing
  const handleMapClick = (e) => {
    if (drawMode === 'polygon') {
      setPolyPoints(prev => [...prev, { lng: e.latlng.lng, lat: e.latlng.lat }])
    }
  }

  // Rectangle Drawing Logic
  const handleMouseDown = (e) => {
    if (drawMode !== 'rect') return
    map.dragging.disable()
    setTempRect({ start: e.latlng, end: e.latlng })
  }

  const handleMouseMove = (e) => {
    if (drawMode === 'rect' && tempRect) {
      setTempRect(prev => ({ ...prev, end: e.latlng }))
    }
  }

  const handleMouseUp = () => {
    if (drawMode === 'rect' && tempRect) {
      const { start, end } = tempRect
      onAreaDrawn([
        { lat: start.lat, lng: start.lng },
        { lat: start.lat, lng: end.lng },
        { lat: end.lat, lng: end.lng },
        { lat: end.lat, lng: start.lng }
      ])
      setTempRect(null)
      setDrawMode('none')
      map.dragging.enable()
    }
  }

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-[#52B788]/20 shadow-2xl bg-[#051009]">
      <MapContainer
        center={[47.1622, 27.5886]}
        // Oraș Coordonate
      // Bucharest  [44.4268, 26.1025]
      // Iași [47.1622, 27.5886]
      // Cluj-Napoca  [46.7712, 23.5556]
      // Timișoara  [45.7472, 21.1921]
      // Constanța  [44.1598, 28.6518]

        zoom={13}
        ref={setMap}
        zoomControl={false}
        className="z-0 w-full h-full"
      >
        {/* Base Layer: Esri World Imagery (High-res Satellite) */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; Esri'
        />
        
        {/* Overlay Layer: Esri Labels (Cities, Villages, Boundaries) */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        />
        
        <MapSync onMove={() => setTick(t => t + 1)} />

        {/* Capture Mouse Events for Drawing */}
        <MapEventsProxy 
          onClick={handleMapClick} 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </MapContainer>

      {/* SVG Layer (Same logic as before, now synced to Leaflet) */}
      <svg className="absolute inset-0 pointer-events-none w-full h-full z-10">
        {map && fields.map(field => {
          const pathData = (field.geometry || field.polygon).map((p, i) => {
            const { x, y } = project(p.lng, p.lat)
            return `${i === 0 ? 'M' : 'L'}${x},${y}`
          }).join(' ') + ' Z'
          return (
            <path key={field.id} d={pathData} fill="rgba(82,183,136,0.3)" stroke="#86EFAC" strokeWidth="2" />
          )
        })}

        {/* Current Drawing */}
        {polyPoints.length > 0 && (
          <path
            d={polyPoints.map((p, i) => {
              const { x, y } = project(p.lng, p.lat)
              return `${i === 0 ? 'M' : 'L'}${x},${y}`
            }).join(' ')}
            fill="none" stroke="#86EFAC" strokeDasharray="4 4" strokeWidth="2"
          />
        )}

        {tempRect && (
          <rect
            {...(() => {
              const p1 = project(tempRect.start.lng, tempRect.start.lat)
              const p2 = project(tempRect.end.lng, tempRect.end.lat)
              return {
                x: Math.min(p1.x, p2.x), y: Math.min(p1.y, p2.y),
                width: Math.abs(p2.x - p1.x), height: Math.abs(p2.y - p1.y)
              }
            })()}
            fill="rgba(134,239,172,0.2)" stroke="#86EFAC" strokeWidth="2"
          />
        )}
      </svg>

      {/* Toolbar */}
      <div className="absolute top-4 left-4 flex gap-2 bg-[#051009]/90 p-2 rounded-xl border border-[#52B788]/30 z-20 pointer-events-auto">
        <button onClick={() => setDrawMode('none')} className={`p-2 rounded ${drawMode === 'none' ? 'bg-[#16A34A]' : ''}`}>🖐</button>
        <button onClick={() => setDrawMode('rect')} className={`p-2 rounded ${drawMode === 'rect' ? 'bg-[#16A34A]' : ''}`}>▭</button>
        <button onClick={() => setDrawMode('polygon')} className={`p-2 rounded ${drawMode === 'polygon' ? 'bg-[#16A34A]' : ''}`}>⬡</button>
        {polyPoints.length >= 3 && (
          <button onClick={() => { onAreaDrawn(polyPoints); setPolyPoints([]); setDrawMode('none') }} className="bg-[#16A34A] px-2 rounded text-xs">Finish</button>
        )}
      </div>
    </div>
  )
}

// Helper to bridge React-Leaflet events to your handlers
function MapEventsProxy({ onClick, onMouseDown, onMouseMove, onMouseUp }) {
  useMapEvents({
    click: onClick,
    mousedown: onMouseDown,
    mousemove: onMouseMove,
    mouseup: onMouseUp,
  })
  return null
}