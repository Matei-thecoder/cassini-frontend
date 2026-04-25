/*'use client'
import { useEffect, useRef, useState, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import 'mapbox-gl/dist/mapbox-gl.css'


// Tokens from your styling
const STATUS_FILL = { healthy: 'rgba(45,106,79,0.45)', flood: 'rgba(21,101,192,0.45)', drought: 'rgba(217,119,6,0.45)', alert: 'rgba(220,38,38,0.40)' }
const STATUS_STROKE = { healthy: '#52B788', flood: '#64B5F6', drought: '#FCD34D', alert: '#FCA5A5' }

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN

export default function CombinedMap({ fields = [], onAreaDrawn }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  
  // Interaction State
  const [drawMode, setDrawMode] = useState('none') // 'none' | 'rect' | 'polygon'
  const [polyPoints, setPolyPoints] = useState([]) // Array of {lng, lat}
  const [tempRect, setTempRect] = useState(null)   // {start: {lng, lat}, end: {lng, lat}}

  // 1. Initialize Mapbox
  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-v9', // Agro Space look
      center: [-71.06776, 42.35816],
      zoom: 12,
      attributionControl: false
    })

    mapRef.current.on('load', () => setMapLoaded(true))
    // Force re-render SVG when map moves
    mapRef.current.on('move', () => setMapLoaded(Math.random())) 

    return () => mapRef.current.remove()
  }, [])

  // 2. Coordinate Projection Helper
  // Converts Lng/Lat to Pixel coordinates on the current map view
  const project = (lng, lat) => {
    if (!mapRef.current) return { x: 0, y: 0 }
    const px = mapRef.current.project([lng, lat])
    return { x: px.x, y: px.y }
  }

  // 3. Drawing Logic
  const handleMapClick = (e) => {
    if (drawMode !== 'polygon') return
    const newPoint = { lng: e.lngLat.lng, lat: e.lngLat.lat }
    setPolyPoints(prev => [...prev, newPoint])
  }

  const handleMouseDown = (e) => {
    if (drawMode !== 'rect') return
    mapRef.current.dragPan.disable() // Disable panning while drawing rect
    setTempRect({ start: e.lngLat, end: e.lngLat })
  }

  const handleMouseMove = (e) => {
    if (drawMode === 'rect' && tempRect) {
      setTempRect(prev => ({ ...prev, end: e.lngLat }))
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
      mapRef.current.dragPan.enable()
    }
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-3xl border border-[#FAD4C0]">
      {/* Mapbox Layer }
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0" 
        onClick={handleMapClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {/* SVG Interaction Layer }
      <svg className="absolute inset-0 pointer-events-none w-full h-full">
        {/* Render Saved Fields }
        {mapLoaded && fields.map(field => {
          const pathData = field.polygon.map((p, i) => {
            const { x, y } = project(p.lng, p.lat)
            return `${i === 0 ? 'M' : 'L'}${x},${y}`
          }).join(' ') + ' Z'

          return (
            <path
              key={field.id}
              d={pathData}
              fill={STATUS_FILL[field.status]}
              stroke={STATUS_STROKE[field.status]}
              strokeWidth="2"
              className="transition-all duration-300"
            />
          )
        })}

        {/* Render In-Progress Polygon }
        {polyPoints.length > 0 && (
          <path
            d={polyPoints.map((p, i) => {
              const { x, y } = project(p.lng, p.lat)
              return `${i === 0 ? 'M' : 'L'}${x},${y}`
            }).join(' ')}
            fill="none"
            stroke="#86EFAC"
            strokeDasharray="4 4"
            strokeWidth="2"
          />
        )}

        {/* Render In-Progress Rectangle }
        {tempRect && (
          <rect
            {...(() => {
              const p1 = project(tempRect.start.lng, tempRect.start.lat)
              const p2 = project(tempRect.end.lng, tempRect.end.lat)
              return {
                x: Math.min(p1.x, p2.x),
                y: Math.min(p1.y, p2.y),
                width: Math.abs(p2.x - p1.x),
                height: Math.abs(p2.y - p1.y)
              }
            })()}
            fill="rgba(134,239,172,0.2)"
            stroke="#86EFAC"
            strokeWidth="2"
          />
        )}
      </svg>

      {/* Toolbar (Bento Style) }
      <div className="absolute top-4 left-4 flex gap-2 bg-[#051009]/80 backdrop-blur-md p-2 rounded-xl border border-[#52B788]/20 shadow-2xl">
        <button 
           onClick={() => setDrawMode('none')}
           className={`p-2 rounded-lg ${drawMode === 'none' ? 'bg-[#16A34A] text-white' : 'text-gray-400'}`}>
           🖐
        </button>
        <button 
           onClick={() => setDrawMode('rect')}
           className={`p-2 rounded-lg ${drawMode === 'rect' ? 'bg-[#16A34A] text-white' : 'text-gray-400'}`}>
           ▭
        </button>
        <button 
           onClick={() => setDrawMode('polygon')}
           className={`p-2 rounded-lg ${drawMode === 'polygon' ? 'bg-[#16A34A] text-white' : 'text-gray-400'}`}>
           ⬡
        </button>
        {polyPoints.length >= 3 && (
          <button 
            onClick={() => { onAreaDrawn(polyPoints); setPolyPoints([]); setDrawMode('none') }}
            className="bg-[#16A34A] px-3 py-1 rounded-lg text-white text-xs font-bold">
            Finish
          </button>
        )}
      </div>
    </div>
  )
}*/
'use client'
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
        center={[42.35816, -71.06776]}
        zoom={13}
        ref={setMap}
        zoomControl={false}
        className="z-0 w-full h-full"
      >
        {/* Esri World Imagery (High-res Satellite, No API Key Required) */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; Esri'
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
}