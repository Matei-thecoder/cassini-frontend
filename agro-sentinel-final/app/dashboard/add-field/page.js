'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import AuthGuard from '../../../components/AuthGuard'
import Header from '../../../components/Header'

// Dynamically import CombinedMap to prevent Leaflet SSR "window is not defined" errors
const CombinedMap = dynamic(() => import('../../../components/CombinedMap'), { 
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

export default function AddFieldPage() {
  return (
    <AuthGuard>
      <AddField />
    </AuthGuard>
  )
}

function AddField() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [drawMode, setDrawMode] = useState('none')
  
  const [formData, setFormData] = useState({
    fieldName: '',
    cropType: 'Corn',
    geometry: null,
  })

  // Captured when the user finishes drawing on the map
  const handleAreaDrawn = (points) => {
    setFormData(prev => ({ ...prev, geometry: points }))
  }

  // Clear the drawn polygon
  const handleClearPolygon = () => {
    setFormData(prev => ({ ...prev, geometry: null }))
  }

  // Submit to the Node.js backend
 const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.geometry) return alert("Please draw the field boundary on the map.")

    setLoading(true)
    const token = localStorage.getItem('agro.token')

    try {
      // Cleaned-up, flat payload matching your simplified database!
      const payload = {
        id: Date.now(),
        name: formData.fieldName.trim(),
        cropType: formData.cropType,
        geometry: formData.geometry,
        bounds: calculateBounds(formData.geometry)
      }

      const response = await fetch('http://localhost:2000/api/fields/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        router.push('/dashboard') // Redirect back to fleet view on success
      } else {
        const errorData = await response.json()
        alert(`Failed to save field: ${errorData.error || 'Unknown error'}`)
      }
    } catch (err) {
      alert("Server connection error. Please ensure your backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', color: '#E8F5E9' }}>
      <Header />
      
      {/* Hero Strip matching Dashboard */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(10,18,12,0.0) 0%, rgba(23,41,24,0.5) 100%)',
        borderBottom: '1px solid rgba(82,183,136,0.08)',
        padding: '20px 0 16px',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
              Register New Field
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(232,245,233,0.45)', margin: '4px 0 0 0' }}>
              Define spatial boundaries for AI-driven yield and moisture forecasting.
            </p>
          </div>
          <button 
            onClick={() => router.back()}
            style={{ 
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(82,183,136,0.6)', 
                background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.05em' 
            }}
          >
            ← CANCEL & RETURN
          </button>
        </div>
      </div>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          
          {/* Map Container */}
          <div style={{ gridColumn: '1', position: 'relative' }}>
            {/* The Map Controls overlay (so users know what to do) */}
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000, background: 'rgba(5, 16, 9, 0.8)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(82,183,136,0.3)' }}>
               <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#86EFAC' }}>
                 {drawMode === 'none' ? 'SELECT A DRAWING TOOL TO START' : 'CLICK ON MAP TO DRAW POINTS'}
               </span>
            </div>

            <CombinedMap 
              // Passing the drawn polygon back as a 'field' keeps it rendered on the screen
              fields={formData.geometry ? [{ id: 'preview', polygon: formData.geometry }] : []} 
              onAreaDrawn={handleAreaDrawn} 
              drawMode={drawMode} 
              setDrawMode={setDrawMode} 
            />
          </div>

          {/* Form Panel - Matching AlertFeed/PredictionPanel style */}
          <div style={{ 
            background: 'rgba(23,41,24,0.3)', 
            border: '1px solid rgba(82,183,136,0.08)', 
            borderRadius: '24px', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: 24
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#E8F5E9', margin: 0 }}>Field Metadata</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={labelStyle}>IDENTIFIER (NAME)</label>
              <input 
                style={inputStyle}
                placeholder="e.g. Sector 7G"
                value={formData.fieldName}
                onChange={e => setFormData({...formData, fieldName: e.target.value})}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={labelStyle}>CROP CATEGORY</label>
              <select 
                style={inputStyle}
                value={formData.cropType}
                onChange={e => setFormData({...formData, cropType: e.target.value})}
              >
                <option value="Corn">Corn</option>
                <option value="Wheat">Wheat</option>
                <option value="Soybeans">Soybeans</option>
                <option value="Barley">Barley</option>
                <option value="Sunflower">Sunflower</option>
              </select>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <div style={{ 
                padding: '12px', borderRadius: '8px', background: 'rgba(82,183,136,0.03)', 
                border: '1px solid rgba(82,183,136,0.1)', marginBottom: '16px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ ...labelStyle, marginBottom: 0 }}>SPATIAL STATUS</div>
                  
                  {/* --- NEW CLEAR BUTTON --- */}
                  {formData.geometry && (
                    <button 
                      onClick={handleClearPolygon}
                      style={{ 
                        background: 'transparent', border: 'none', color: '#FCA5A5', 
                        fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer',
                        padding: 0, transition: 'opacity 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.opacity = 0.7}
                      onMouseOut={(e) => e.target.style.opacity = 1}
                    >
                      [ CLEAR ]
                    </button>
                  )}
                </div>
                
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: formData.geometry ? '#52B788' : '#D97706' }}>
                    {formData.geometry ? '✓ POLYGON CAPTURED' : '⚠ WAITING FOR BOUNDARY'}
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading || !formData.geometry || !formData.fieldName.trim()}
                style={{
                  width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                  background: (loading || !formData.geometry || !formData.fieldName.trim()) ? 'rgba(82,183,136,0.1)' : '#52B788',
                  color: (loading || !formData.geometry || !formData.fieldName.trim()) ? 'rgba(232,245,233,0.2)' : '#081C15',
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {loading ? 'INITIALIZING...' : 'CONFIRM REGISTRATION'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer info matching Dashboard */}
        <div style={{ marginTop: 32, borderTop: '1px solid rgba(82,183,136,0.08)', paddingTop: 20 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(232,245,233,0.2)' }}>
                System: Latency 42ms · Coordinates: WGS84 Standard · Database Port: 2000
            </span>
        </div>
      </main>
    </div>
  )
}

// Helper function to calculate Bounding Box from drawn polygon
function calculateBounds(coords) {
  if (!coords || coords.length === 0) return null
  const lats = coords.map(c => c.lat)
  const lngs = coords.map(c => c.lng)
  return { 
    minlat: Math.min(...lats), 
    maxlat: Math.max(...lats), 
    minlon: Math.min(...lngs), 
    maxlon: Math.max(...lngs) 
  }
}

// Reusable Styles
const labelStyle = { 
  fontFamily: 'var(--font-mono)', 
  fontSize: 10, 
  color: 'rgba(82,183,136,0.5)', 
  letterSpacing: '0.1em' 
}

const inputStyle = {
  background: 'rgba(10,18,12,0.5)', 
  border: '1px solid rgba(82,183,136,0.2)', 
  borderRadius: '8px',
  padding: '12px', 
  color: '#E8F5E9', 
  fontFamily: 'var(--font-body)', 
  fontSize: 14, 
  outline: 'none',
  transition: 'border 0.2s ease'
}