/*'use client'
import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic' // Crucial for Leaflet
import AuthGuard from '../../components/AuthGuard'
import Header from '../../components/Header'

// We load the map dynamically with SSR disabled because Leaflet needs the 'window' object
const CombinedMap = dynamic(() => import('../../components/CombinedMap'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      height: 600, 
      background: 'rgba(232,245,233,0.03)', 
      borderRadius: 24, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: '#52B788',
      fontFamily: 'monospace'
    }}>
      LOADING SATELLITE ENGINE...
    </div>
  )
})

import { 
  getAllFields, 
  onFieldsChange, 
  addField, 
  removeField, 
  hectaresFromPolygon, 
  centroid 
} from '../../lib/fields-store'
import { CROP_OPTIONS } from '../../lib/data'

export default function MapPage() {
  return (
    <AuthGuard>
      <MapScreen />
    </AuthGuard>
  )
}

function MapScreen() {
  const [fields, setFields] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [drawMode, setDrawMode] = useState('none') 
  const [pendingArea, setPendingArea] = useState(null) 
  const [form, setForm] = useState({ name: '', crop: 'Wheat' })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    setFields(getAllFields())
    const off = onFieldsChange(setFields)
    return off
  }, [])

  const stats = useMemo(() => {
    const s = { total: fields.length, healthy: 0, alert: 0, area: 0 }
    fields.forEach(f => {
      if (f.status === 'healthy') s.healthy++
      else s.alert++
      s.area += f.area || 0
    })
    return s
  }, [fields])

  function handleAreaDrawn(points) {
    const area = hectaresFromPolygon(points)
    setPendingArea({ points, area })
    setForm({ 
      name: `Parcel ${fields.length + 1}`, 
      crop: 'Wheat' 
    })
    setDrawMode('none')
  }

  function saveField() {
    if (!pendingArea) return
    const c = centroid(pendingArea.points)
    const newField = {
      id: Math.random().toString(36).substr(2, 9),
      name: form.name.trim() || 'Unnamed Field',
      crop: form.crop,
      status: 'healthy',
      area: parseFloat(pendingArea.area.toFixed(2)),
      soilMoisture: 55,
      ndvi: 0.62,
      lat: c.lat,
      lng: c.lng,
      polygon: pendingArea.points,
      userCreated: true,
    }
    addField(newField)
    setPendingArea(null)
    showToast('Field successfully mapped')
  }

  function handleRemove(id) {
    removeField(id)
    setSelectedField(null)
    showToast('Field removed')
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const selected = fields.find(f => f.id === selectedField)

  return (
    <div style={{ minHeight: '100vh', background: '#0F1E14', color: '#E8F5E9' }}>
      <Header />

      {/* Header Section }
      <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(82,183,136,0.2)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#FFF' }}>Parcels Map</h1>
            <p style={{ fontSize: 14, color: '#52B788', marginTop: 8 }}>
              {stats.total} MONITORED • {stats.area.toFixed(1)} HA TOTAL AREA
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <StatChip color="#52B788" label="Healthy" count={stats.healthy} />
            <StatChip color="#FCA5A5" label="Alerts" count={stats.alert} />
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          
          {/* Map Block }
          <div style={{ background: 'rgba(232,245,233,0.03)', padding: 12, borderRadius: 24, border: '1px solid rgba(82,183,136,0.1)' }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 600, position: 'relative' }}>
              <CombinedMap 
                fields={fields}
                selectedField={selectedField}
                onSelectField={setSelectedField}
                drawMode={drawMode}
                setDrawMode={setDrawMode}
                onAreaDrawn={handleAreaDrawn}
              />
            </div>

            {/* Map Controls }
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 8px' }}>
              <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 12 }}>
                <ControlBtn active={drawMode === 'none'} icon="🖐" label="Pan" onClick={() => setDrawMode('none')} />
                <ControlBtn active={drawMode === 'rect'} icon="▭" label="Square" onClick={() => setDrawMode('rect')} />
                <ControlBtn active={drawMode === 'polygon'} icon="⬡" label="Polygon" onClick={() => setDrawMode('polygon')} />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#52B788', opacity: 0.6 }}>
                {drawMode !== 'none' ? 'DRAWING_ENABLED' : 'VIEW_ONLY'}
              </div>
            </div>
          </div>

          {/* Sidebar }
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {pendingArea ? (
              <div style={{ background: '#1B3224', padding: 24, borderRadius: 24, border: '1px solid #52B788' }}>
                <h3 style={{ fontSize: 20, marginBottom: 4 }}>Initialize Field</h3>
                <p style={{ fontSize: 14, color: '#52B788', marginBottom: 24 }}>Measured Area: {pendingArea.area.toFixed(2)} ha</p>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Field Name</label>
                  <input style={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Crop Type</label>
                  <select style={inputStyle} value={form.crop} onChange={e => setForm({...form, crop: e.target.value})}>
                    {CROP_OPTIONS.map(c => <option key={c} value={c} style={{background: '#0F1E14'}}>{c}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={saveField} style={primaryBtn}>Save Field</button>
                  <button onClick={() => setPendingArea(null)} style={secondaryBtn}>Cancel</button>
                </div>
              </div>
            ) : selected ? (
              <div style={{ background: 'rgba(232,245,233,0.05)', padding: 24, borderRadius: 24, border: '1px solid rgba(82,183,136,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{selected.name}</h3>
                    <span style={{ fontSize: 13, color: '#52B788' }}>{selected.crop}</span>
                  </div>
                  <div style={{ background: selected.status === 'healthy' ? '#2D6A4F' : '#7F1D1D', color: '#FFF', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    {selected.status.toUpperCase()}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <DataRow label="Land Area" value={`${selected.area} ha`} />
                  <DataRow label="NDVI Score" value={selected.ndvi.toFixed(2)} />
                  <DataRow label="Moisture" value={`${selected.soilMoisture}%`} />
                </div>

                {selected.userCreated && (
                  <button onClick={() => handleRemove(selected.id)} style={dangerBtn}>Delete Parcel</button>
                )}
              </div>
            ) : (
              <div style={{ background: '#2D6A4F', padding: 24, borderRadius: 24, color: '#FFF' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Mapping Tools</h3>
                <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.5 }}>Select a field or use the drawing tools to define new boundaries for satellite monitoring.</p>
              </div>
            )}

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 20, borderRadius: 24, flex: 1 }}>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: '#52B788', letterSpacing: '0.1em', marginBottom: 16 }}>FIELD DIRECTORY</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '400px', overflowY: 'auto' }}>
                {fields.map(f => (
                  <button 
                    key={f.id} 
                    onClick={() => setSelectedField(f.id)}
                    style={{ 
                      display: 'flex', justifyContent: 'space-between', padding: '12px', 
                      borderRadius: 12, border: 'none', background: selectedField === f.id ? 'rgba(82,183,136,0.1)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', color: selectedField === f.id ? '#FFF' : '#E8F5E9',
                      transition: '0.2s'
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{f.name}</span>
                    <span style={{ fontSize: 12, opacity: 0.4 }}>{f.area} ha</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <div style={{ position: 'fixed', bottom: 32, right: 32, background: '#2D6A4F', color: '#FFF', padding: '16px 24px', borderRadius: 12, fontSize: 14, border: '1px solid #52B788', zIndex: 1000 }}>
          {toast}
        </div>
      )}
    </div>
  )
}

// ... helper components StatChip, ControlBtn, DataRow remain the same as your code ...
function StatChip({ color, label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, background: 'rgba(232,245,233,0.03)', border: '1px solid rgba(82,183,136,0.1)' }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 13, fontWeight: 700 }}>{count}</span>
      <span style={{ fontSize: 13, color: '#52B788', opacity: 0.7 }}>{label}</span>
    </div>
  )
}

function ControlBtn({ active, icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ 
      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, 
      border: 'none', background: active ? '#2D6A4F' : 'transparent', 
      color: active ? '#FFF' : '#52B788', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: '0.2s'
    }}>
      {icon} {label}
    </button>
  )
}

function DataRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(82,183,136,0.1)' }}>
      <span style={{ fontSize: 14, color: '#52B788' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#52B788', marginBottom: 8, textTransform: 'uppercase' }
const inputStyle = { width: '100%', padding: '12px', borderRadius: 8, border: '1px solid rgba(82,183,136,0.3)', background: 'rgba(0,0,0,0.3)', color: '#FFF', fontSize: 14, outline: 'none' }
const primaryBtn = { flex: 1, padding: '12px', background: '#52B788', color: '#0F1E14', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }
const secondaryBtn = { padding: '12px 16px', background: 'transparent', border: '1px solid rgba(232,245,233,0.2)', color: '#FFF', borderRadius: 8, cursor: 'pointer' }
const dangerBtn = { width: '100%', marginTop: 24, padding: '12px', background: 'transparent', border: '1px solid #FCA5A5', color: '#FCA5A5', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }


*/
'use client'
import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic' // Crucial for Leaflet
import AuthGuard from '../../components/AuthGuard'
import Header from '../../components/Header'

// We load the map dynamically with SSR disabled because Leaflet needs the 'window' object
const CombinedMap = dynamic(() => import('../../components/CombinedMap'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      height: 600, 
      background: 'rgba(232,245,233,0.03)', 
      borderRadius: 24, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: '#52B788',
      fontFamily: 'monospace'
    }}>
      LOADING SATELLITE ENGINE...
    </div>
  )
})

// ✅ ONLY importing the math/geometry utilities now!
import { 
  hectaresFromPolygon, 
  centroid 
} from '../../lib/fields-store'

import { CROP_OPTIONS } from '../../lib/data'

export default function MapPage() {
  return (
    <AuthGuard>
      <MapScreen />
    </AuthGuard>
  )
}

function MapScreen() {
  const [fields, setFields] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [drawMode, setDrawMode] = useState('none') 
  const [pendingArea, setPendingArea] = useState(null) 
  const [form, setForm] = useState({ name: '', crop: 'Wheat' })
  const [toast, setToast] = useState(null)

  // ✅ FETCH FIELDS FROM BACKEND ON LOAD
  const fetchFields = async () => {
    try {
      const token = localStorage.getItem('agro.token');
      const response = await fetch('http://localhost:2000/api/fields', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched fields:", data);
        setFields(data.fields);
      } else {
        console.error("Failed to fetch fields");
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const stats = useMemo(() => {
    const s = { total: fields.length, healthy: 0, alert: 0, area: 0 }
    fields.forEach(f => {
      // Allow fallbacks in case new DB records lack statuses
      if ((f.status || 'healthy') === 'healthy') s.healthy++
      else s.alert++
      s.area += parseFloat(f.area) || 0
    })
    return s
  }, [fields])

  function handleAreaDrawn(points) {
    const area = hectaresFromPolygon(points)
    setPendingArea({ points, area })
    setForm({ 
      name: `Parcel ${fields.length + 1}`, 
      crop: 'Wheat' 
    })
    setDrawMode('none')
  }

  // ✅ SAVE TO BACKEND
  async function saveField() {
    if (!pendingArea) return
    const c = centroid(pendingArea.points)
    
    // Formatting data for your Postgres/Supabase table
    const newFieldData = {
      name: form.name.trim() || 'Unnamed Field',
      crop_type: form.crop, // Mapped to your DB column name
      area: parseFloat(pendingArea.area.toFixed(2)),
      lat: c.lat,
      lng: c.lng,
      geometry: pendingArea.points, // Adjust if your DB requires GeoJSON format specifically
      status: 'healthy',
      soilMoisture: 55,
      ndvi: 0.62,
    }

    try {
      const token = localStorage.getItem('agro.token');
      const response = await fetch('http://localhost:2000/api/fields', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFieldData)
      });

      if (response.ok) {
        setPendingArea(null)
        showToast('Field successfully mapped')
        fetchFields() // Re-fetch from DB to get the new ID assigned by Postgres!
      } else {
        showToast('Error saving field to database')
      }
    } catch (err) {
      showToast('Server connection failed')
    }
  }
  function computeArea(bounds)
{
  if (!bounds) return null;
  return (Math.abs((bounds.maxlat - bounds.minlat) * (bounds.maxlon - bounds.minlon)) * 12365).toFixed(2); // Rough conversion to hectares

}

  // ✅ DELETE FROM BACKEND
  async function handleRemove(id) {
    if (!window.confirm("Are you sure you want to delete this parcel?")) return;

    try {
      const token = localStorage.getItem('agro.token');
      const response = await fetch(`http://localhost:2000/api/fields/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setFields(prev => prev.filter(f => f.id !== id));
        setSelectedField(null);
        showToast('Field removed');
      } else {
        showToast('Failed to delete field');
      }
    } catch (err) {
      showToast('Server connection failed');
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const selected = fields.find(f => f.id === selectedField)

  return (
    <div style={{ minHeight: '100vh', background: '#0F1E14', color: '#E8F5E9' }}>
      <Header />

      {/* Header Section */}
      <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(82,183,136,0.2)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#FFF' }}>Parcels Map</h1>
            <p style={{ fontSize: 14, color: '#52B788', marginTop: 8 }}>
              {stats.total} MONITORED • {stats.area.toFixed(1)} HA TOTAL AREA
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <StatChip color="#52B788" label="Healthy" count={stats.healthy} />
            <StatChip color="#FCA5A5" label="Alerts" count={stats.alert} />
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          
          {/* Map Block */}
          <div style={{ background: 'rgba(232,245,233,0.03)', padding: 12, borderRadius: 24, border: '1px solid rgba(82,183,136,0.1)' }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 600, position: 'relative' }}>
              <CombinedMap 
                fields={fields}
                selectedField={selectedField}
                onSelectField={setSelectedField}
                drawMode={drawMode}
                setDrawMode={setDrawMode}
                onAreaDrawn={handleAreaDrawn}
              />
            </div>

            {/* Map Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 8px' }}>
              <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 12 }}>
                <ControlBtn active={drawMode === 'none'} icon="🖐" label="Pan" onClick={() => setDrawMode('none')} />
                <ControlBtn active={drawMode === 'rect'} icon="▭" label="Square" onClick={() => setDrawMode('rect')} />
                <ControlBtn active={drawMode === 'polygon'} icon="⬡" label="Polygon" onClick={() => setDrawMode('polygon')} />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#52B788', opacity: 0.6 }}>
                {drawMode !== 'none' ? 'DRAWING_ENABLED' : 'VIEW_ONLY'}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {pendingArea ? (
              <div style={{ background: '#1B3224', padding: 24, borderRadius: 24, border: '1px solid #52B788' }}>
                <h3 style={{ fontSize: 20, marginBottom: 4 }}>Initialize Field</h3>
                <p style={{ fontSize: 14, color: '#52B788', marginBottom: 24 }}>Measured Area: {pendingArea.area.toFixed(2)} ha</p>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Field Name</label>
                  <input style={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Crop Type</label>
                  <select style={inputStyle} value={form.crop_type} onChange={e => setForm({...form, crop: e.target.value})}>
                    {CROP_OPTIONS.map(c => <option key={c} value={c} style={{background: '#0F1E14'}}>{c}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={saveField} style={primaryBtn}>Save Field</button>
                  <button onClick={() => setPendingArea(null)} style={secondaryBtn}>Cancel</button>
                </div>
              </div>
            ) : selected ? (
              <div style={{ background: 'rgba(232,245,233,0.05)', padding: 24, borderRadius: 24, border: '1px solid rgba(82,183,136,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{selected.name}</h3>
                    {/* Fallback to selected.crop if your DB uses crop_type */}
                    <span style={{ fontSize: 13, color: '#52B788' }}>{selected.crop_type || selected.crop}</span>
                  </div>
                  <div style={{ background: (selected.status || 'healthy') === 'healthy' ? '#2D6A4F' : '#7F1D1D', color: '#FFF', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    {(selected.status || 'healthy').toUpperCase()}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <DataRow label="Land Area" value={`${computeArea(selected.bounds) || '--'} ha`} />
                  <DataRow label="NDVI Score" value={selected.ndvi ? selected.ndvi.toFixed(2) : '--'} />
                  <DataRow label="Moisture" value={`${selected.soilMoisture || 65}%`} />
                </div>

                {/* Always show delete button now since ALL fields fetched are the user's fields */}
                <button onClick={() => handleRemove(selected.id)} style={dangerBtn}>Delete Parcel</button>
              </div>
            ) : (
              <div style={{ background: '#2D6A4F', padding: 24, borderRadius: 24, color: '#FFF' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Mapping Tools</h3>
                <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.5 }}>Select a field or use the drawing tools to define new boundaries for satellite monitoring.</p>
              </div>
            )}

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 20, borderRadius: 24, flex: 1 }}>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: '#52B788', letterSpacing: '0.1em', marginBottom: 16 }}>FIELD DIRECTORY</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '400px', overflowY: 'auto' }}>
                {fields.map(f => (
                  <button 
                    key={f.id} 
                    onClick={() => setSelectedField(f.id)}
                    style={{ 
                      display: 'flex', justifyContent: 'space-between', padding: '12px', 
                      borderRadius: 12, border: 'none', background: selectedField === f.id ? 'rgba(82,183,136,0.1)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', color: selectedField === f.id ? '#FFF' : '#E8F5E9',
                      transition: '0.2s'
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{f.name}</span>
                    <span style={{ fontSize: 12, opacity: 0.4 }}>{f.area || '--'} ha</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <div style={{ position: 'fixed', bottom: 32, right: 32, background: '#2D6A4F', color: '#FFF', padding: '16px 24px', borderRadius: 12, fontSize: 14, border: '1px solid #52B788', zIndex: 1000 }}>
          {toast}
        </div>
      )}
    </div>
  )
}

// Helper components unchanged
function StatChip({ color, label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, background: 'rgba(232,245,233,0.03)', border: '1px solid rgba(82,183,136,0.1)' }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 13, fontWeight: 700 }}>{count}</span>
      <span style={{ fontSize: 13, color: '#52B788', opacity: 0.7 }}>{label}</span>
    </div>
  )
}

function ControlBtn({ active, icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ 
      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, 
      border: 'none', background: active ? '#2D6A4F' : 'transparent', 
      color: active ? '#FFF' : '#52B788', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: '0.2s'
    }}>
      {icon} {label}
    </button>
  )
}

function DataRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(82,183,136,0.1)' }}>
      <span style={{ fontSize: 14, color: '#52B788' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#52B788', marginBottom: 8, textTransform: 'uppercase' }
const inputStyle = { width: '100%', padding: '12px', borderRadius: 8, border: '1px solid rgba(82,183,136,0.3)', background: 'rgba(0,0,0,0.3)', color: '#FFF', fontSize: 14, outline: 'none' }
const primaryBtn = { flex: 1, padding: '12px', background: '#52B788', color: '#0F1E14', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }
const secondaryBtn = { padding: '12px 16px', background: 'transparent', border: '1px solid rgba(232,245,233,0.2)', color: '#FFF', borderRadius: 8, cursor: 'pointer' }
const dangerBtn = { width: '100%', marginTop: 24, padding: '12px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5', borderRadius: 8, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }

