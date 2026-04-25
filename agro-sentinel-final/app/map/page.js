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

  // ✅ FETCH FIELDS FROM BACKEND ON LOAD (Updated to use the Dashboard route with AI Data)
  const fetchFields = async () => {
    try {
      const token = localStorage.getItem('agro.token');
      const response = await fetch('http://localhost:2000/api/fields/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const json = await response.json();
        console.log("Fetched fields with AI data:", json.data);
        setFields(json.data || []);
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

  // ✅ DYNAMIC STATS COMPUTATION FROM AI PAYLOAD
  const stats = useMemo(() => {
    const s = { total: fields.length, healthy: 0, alert: 0, area: 0 }
    
    fields.forEach(f => {
      const analysis = f.latest_analysis;

      // 1. Calculate Area safely
      let fieldArea = 0;
      if (analysis?.area?.total_monitored_hectares !== undefined) {
        fieldArea = parseFloat(analysis.area.total_monitored_hectares);
      } else if (f.area !== null && f.area !== undefined) {
        fieldArea = typeof f.area === 'object' ? parseFloat(f.area.total_monitored_hectares) : parseFloat(f.area);
      }
      s.area += (fieldArea || 0);

      // 2. Calculate Health Status based on AI Risk Score
      let isAlert = false;
      if (analysis) {
        const rStat = analysis.stats?.find(st => st.id === 'max-risk');
        // If max risk is above 50%, or engine is degraded, trigger an alert
        if (rStat && parseFloat(rStat.value) > 50) isAlert = true;
        if (analysis.status?.working === false) isAlert = true;
      }
      
      if (isAlert) s.alert++;
      else s.healthy++;
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
    
    const newFieldData = {
      name: form.name.trim() || 'Unnamed Field',
      crop_type: form.crop, 
      area: parseFloat(pendingArea.area.toFixed(2)),
      lat: c.lat,
      lng: c.lng,
      geometry: pendingArea.points,
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
        fetchFields() 
      } else {
        showToast('Error saving field to database')
      }
    } catch (err) {
      showToast('Server connection failed')
    }
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

  // Helper to extract area safely for individual fields in rendering
  const getFieldArea = (f) => {
    if (f?.latest_analysis?.area?.total_monitored_hectares !== undefined) {
      return parseFloat(f.latest_analysis.area.total_monitored_hectares).toFixed(2);
    }
    if (f?.area !== undefined && f?.area !== null) {
      return typeof f.area === 'object' ? parseFloat(f.area.total_monitored_hectares).toFixed(2) : parseFloat(f.area).toFixed(2);
    }
    return '--';
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F1E14', color: '#E8F5E9' }}>
      <Header />

      {/* Header Section */}
      <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(82,183,136,0.2)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#FFF' }}>Parcels Map</h1>
            <p style={{ fontSize: 14, color: '#52B788', marginTop: 8 }}>
              {stats.total} MONITORED • {new Intl.NumberFormat('en-US').format(stats.area.toFixed(2))} HA TOTAL AREA
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
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            { selected ? (
              <div style={{ background: 'rgba(232,245,233,0.05)', padding: 24, borderRadius: 24, border: '1px solid rgba(82,183,136,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{selected.name}</h3>
                    <span style={{ fontSize: 13, color: '#52B788' }}>{selected.crop_type || selected.crop || 'Unknown Crop'}</span>
                  </div>
                  
                  {/* Status Pill Calculated from AI Data */}
                  {(() => {
                    const analysis = selected.latest_analysis;
                    let statusText = 'HEALTHY';
                    let statusColor = '#2D6A4F'; // Green
                    
                    if (!analysis) {
                      statusText = 'PENDING';
                      statusColor = '#4B5563'; // Gray
                    } else {
                      const rStat = analysis.stats?.find(st => st.id === 'max-risk');
                      if (rStat && parseFloat(rStat.value) > 50) {
                          statusText = 'ALERT';
                          statusColor = '#7F1D1D'; // Red
                      } else if (analysis.status?.working === false) {
                          statusText = 'DEGRADED';
                          statusColor = '#9A3412'; // Orange
                      }
                    }

                    return (
                      <div style={{ background: statusColor, color: '#FFF', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                        {statusText}
                      </div>
                    )
                  })()}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Land Area extracted dynamically */}
                  <DataRow label="Land Area" value={`${getFieldArea(selected)} ha`} />
                  
                  {/* Moisture extracted dynamically */}
                  <DataRow label="Moisture Proxy" value={
                    selected.latest_analysis?.weather?.soil_moisture_proxy !== undefined 
                      ? `${(selected.latest_analysis.weather.soil_moisture_proxy * 100).toFixed(1)}%` 
                      : '--'
                  } />

                  {/* AI Risk Score extracted dynamically */}
                  <DataRow label="Max AI Risk" value={
                    selected.latest_analysis?.stats?.find(s => s.id === 'max-risk') 
                      ? `${parseFloat(selected.latest_analysis.stats.find(s => s.id === 'max-risk').value).toFixed(1)}%` 
                      : '--'
                  } />
                </div>

                <button onClick={() => handleRemove(selected.id)} style={dangerBtn}>Delete Parcel</button>
              </div>
            ) : (
              <div style={{ background: '#2D6A4F', padding: 24, borderRadius: 24, color: '#FFF' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Parcel Information</h3>
                <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.5 }}>Select a field from the Field Directory below to see more information and active telemetry.</p>
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
                    <span style={{ fontSize: 12, opacity: 0.4 }}>{getFieldArea(f)} ha</span>
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

function DataRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(82,183,136,0.1)' }}>
      <span style={{ fontSize: 14, color: '#52B788' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  )
}

const dangerBtn = { width: '100%', marginTop: 24, padding: '12px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5', borderRadius: 8, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }