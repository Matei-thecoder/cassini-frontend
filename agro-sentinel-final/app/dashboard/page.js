'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '../../components/AuthGuard'
import Header from '../../components/Header'
import FieldMap from '../../components/FieldMap'
import FieldsList from '../../components/FieldsList'
import { getCurrentUser, onAuthChange } from '../../lib/auth'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}

function Dashboard() {
  const router = useRouter()
  const [selectedField, setSelectedField] = useState(null)
  
  const [fields, setFields] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // 1. Initial User Load
    const initialUser = getCurrentUser()
    setUser(initialUser)

    const unsubscribe = onAuthChange((newUser) => {
      setUser(newUser);
    });

    // 2. Fetch the live dashboard data from Node.js
    const fetchMyFields = async () => {
      const token = localStorage.getItem('agro.token')
      if (!token) return

      try {
        const response = await fetch('http://localhost:2000/api/fields/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const json = await response.json()
          setFields(json.data || [])
        } else {
          console.error("Failed to load dashboard data from server")
        }
      } catch (error) {
        console.error("Error connecting to server:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMyFields()

    return () => unsubscribe();

  }, [])

  // --- UNIT CONVERSION LOGIC ---
  const unitPref = user?.preferences?.units || 'metric';

  // Bulletproof Total Area Calculation
  const totalAreaHa = fields.reduce((sum, field) => {
    if (!field.area) return sum; // Skip if area is null or undefined

    // Check if area is stored as a nested object (e.g. field.area.total_monitored_hectares)
    if (typeof field.area === 'object' && field.area.total_monitored_hectares !== undefined) {
      return sum + (parseFloat(field.area.total_monitored_hectares) || 0);
    }

    // Otherwise, assume it's stored directly as a number or string
    return sum + (parseFloat(field.area) || 0);
  }, 0);

  const formatAreaDisplay = (hectares) => {
    if (unitPref === 'imperial') {
      return `${(hectares * 2.47105).toFixed(2)} monitored acres`;
    }
    return `${hectares.toFixed(2)} monitored hectares`;
  };

  // --- DERIVED STATE ---
  const activeField = selectedField ? fields.find(f => f.id === selectedField) : fields[0];
  const activeAnalysis = activeField?.latest_analysis || null;
  
  // --- DYNAMIC HERO LOGIC ---
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.floor((new Date().getMonth() + 3) / 3);
  const dynamicSeason = `Season ${currentYear} · Q${currentQuarter}`;
  const fieldCount = fields.length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Header />

      {/* Hero strip */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(10,18,12,0.0) 0%, rgba(23,41,24,0.5) 100%)',
        borderBottom: '1px solid rgba(82,183,136,0.08)',
        padding: '20px 0 16px',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28, fontWeight: 700,
                  color: '#E8F5E9', letterSpacing: '-0.03em', lineHeight: 1,
                }}>
                  {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : (activeAnalysis?.title || 'Field Intelligence Dashboard')}
                </h1>
                
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: 'rgba(82,183,136,0.6)', letterSpacing: '0.05em',
                }}>{dynamicSeason}</span>
              </div>
              
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 14,
                color: 'rgba(232,245,233,0.45)', maxWidth: 560,
              }}>
                {user?.companyName ? `${user.companyName} · ` : ''}
                {activeAnalysis?.subtitle 
                  ? `${activeAnalysis.subtitle.charAt(0).toUpperCase() + activeAnalysis.subtitle.slice(1)} covering ${formatAreaDisplay(totalAreaHa)}.`
                  : `Monitoring ${fieldCount} active field${fieldCount !== 1 ? 's' : ''} across ${formatAreaDisplay(totalAreaHa)}.`}
              </p>
            </div>

            <button 
              onClick={() => router.push('/dashboard/add-field')}
              style={{
                background: 'rgba(82,183,136,0.1)',
                border: '1px solid rgba(82,183,136,0.3)',
                color: '#52B788',
                padding: '10px 18px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                marginTop: '4px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(82,183,136,0.2)';
                e.currentTarget.style.borderColor = '#52B788';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(82,183,136,0.1)';
                e.currentTarget.style.borderColor = 'rgba(82,183,136,0.3)';
              }}
            >
              <span>+</span> ADD NEW FIELD
            </button>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        
        {/* TOP DYNAMIC STATS ROW (Global) */}
        <div style={{ marginBottom: 24 }}>
          <GlobalStatsRow fields={fields} unitPreference={unitPref} totalAreaHa={totalAreaHa} />
        </div>

        {/* Top Interactive Area (Map, List, Selected Field Info) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: 16,
        }}>
          <div style={{ gridColumn: '1', gridRow: '1' }}>
            <FieldMap 
              fields={fields} 
              selectedField={selectedField} 
              setSelectedField={setSelectedField} 
            />
          </div>
          <div style={{ gridColumn: '2', gridRow: '1' }}>
            <FieldsList 
              fields={fields} 
              setFields={setFields}
              selectedField={selectedField} 
              setSelectedField={setSelectedField} 
              unitPreference={unitPref} 
            />
          </div>
          <div style={{ gridColumn: '3', gridRow: '1' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
              <FieldOverviewCard field={activeField} analysis={activeAnalysis} />
            </div>
          </div>
        </div>

        {/* PER-FIELD CALAMITY DASHBOARDS */}
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: '#E8F5E9', marginBottom: 24, borderBottom: '1px solid rgba(82,183,136,0.2)', paddingBottom: 12 }}>
            Field Intelligence Reports
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {fields.map(field => {
              const analysis = field.latest_analysis;
              if (!analysis) return null; 
              
              return (
                <div key={field.id} style={{
                  background: 'rgba(0,0,0,0.15)',
                  border: '1px solid rgba(82,183,136,0.15)',
                  borderRadius: '12px',
                  padding: '24px'
                }}>
                  <div style={{ marginBottom: 20, borderBottom: '1px solid rgba(82,183,136,0.1)', paddingBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#52B788', margin: 0 }}>
                        {field.name} <span style={{ color: 'rgba(232,245,233,0.5)', fontSize: 14, fontWeight: 400 }}>({field.crop_type || 'Unknown Crop'})</span>
                      </h3>
                      <span style={{ 
                        fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 8px', borderRadius: '4px',
                        background: analysis.status?.working === false ? 'rgba(244, 162, 97, 0.1)' : 'rgba(82, 183, 136, 0.1)',
                        color: analysis.status?.working === false ? '#F4A261' : '#52B788'
                      }}>
                        STATUS: {analysis.status?.working === false ? 'DEGRADED' : 'ONLINE'}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.4)', margin: '8px 0 0 0' }}>
                      {analysis.title} • {analysis.subtitle || 'Monitoring active'}
                    </p>
                  </div>

                  {/* Per-Field Quick Health Stats */}
                  <FieldHealthRow analysis={analysis} />

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: 16,
                  }}>
                    {analysis.stats && <ModelStatsCard stats={analysis.stats} title="AI Risk Models" />}
                    {analysis.weather && <WeatherTelemetryCard weather={analysis.weather} unitPreference={unitPref} title="Local Telemetry" />}
                  </div>
                </div>
              )
            })}

            {fields.every(f => !f.latest_analysis) && (
              <div style={{ 
                background: 'rgba(255,255,255,0.02)', padding: '32px', 
                borderRadius: '8px', border: '1px dashed rgba(82,183,136,0.2)',
                color: 'rgba(232,245,233,0.5)', fontFamily: 'var(--font-mono)', fontSize: 14,
                textAlign: 'center'
              }}>
                Awaiting initial telemetry data for your fields. The AI engine is analyzing the satellite imagery...
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          marginTop: 40, paddingTop: 20,
          borderTop: '1px solid rgba(82,183,136,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              '🛰 Sentinel-2 Imagery',
              '📡 847 IoT Sensors',
              '🤖 ML Risk Models v2.4',
              '☁️ ECMWF Weather Data',
            ].map(item => (
              <span key={item} style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'rgba(232,245,233,0.3)',
              }}>{item}</span>
            ))}
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'rgba(232,245,233,0.2)',
          }}>AgroSentinel © 2025 · All data refreshes every 2 minutes</span>
        </div>
      </main>
    </div>
  )
}

// ==========================================
// DATA COMPONENTS
// ==========================================

function GlobalStatsRow({ fields, unitPreference, totalAreaHa }) {
  let maxRisk = 0;
  let totalSensors = 0;
  let maxPrecip = 0;
  let minMoisture = 999;
  let fieldsWithData = 0;

  fields.forEach(f => {
    const analysis = f.latest_analysis;
    if (!analysis) return;
    fieldsWithData++;

    const rStat = analysis.stats?.find(s => s.id === 'max-risk');
    if (rStat && rStat.value > maxRisk) maxRisk = rStat.value;

    const sStat = analysis.stats?.find(s => s.id === 'sensors-online');
    if (sStat) totalSensors += Number(sStat.value);

    const w = analysis.weather;
    if (w) {
      if (w.precipitation_next_24h_mm > maxPrecip) maxPrecip = w.precipitation_next_24h_mm;
      if (w.soil_moisture_proxy < minMoisture) minMoisture = w.soil_moisture_proxy;
    }
  });

  if (minMoisture === 999) minMoisture = 0;

  const isImp = unitPreference === 'imperial';
  const areaNum = isImp ? (totalAreaHa * 2.47105).toFixed(2) : totalAreaHa.toFixed(2);
  const areaUnit = isImp ? 'ac' : 'ha';

  const healthScore = fieldsWithData === 0 ? '--' : Math.max(0, 100 - (maxRisk * 15));
  const healthColor = healthScore >= 80 ? '#52B788' : healthScore >= 50 ? '#F4A261' : '#E07A5F';

  let floodRisk = 'Low';
  let floodColor = '#52B788';
  if (maxPrecip > 50) { floodRisk = 'High'; floodColor = '#E07A5F'; }
  else if (maxPrecip > 20) { floodRisk = 'Moderate'; floodColor = '#F4A261'; }
  if (fieldsWithData === 0) floodRisk = '--';

  let droughtRisk = 'Low';
  let droughtColor = '#52B788';
  if (minMoisture < 0.2) { droughtRisk = 'High'; droughtColor = '#E07A5F'; }
  else if (minMoisture < 0.4) { droughtRisk = 'Moderate'; droughtColor = '#F4A261'; }
  if (fieldsWithData === 0) droughtRisk = '--';

  const avgYield = fieldsWithData === 0 ? '--' : 'Calculating';

  const cards = [
    { icon: '🗺️', label: "Total Surface", value: `${areaNum} ${areaUnit}`, color: '#E8F5E9', sub: "Actively monitored" },
    { icon: '🌿', label: "Overall Health", value: healthScore !== '--' ? `${healthScore}%` : '--', color: healthColor, sub: "System-wide index" },
    { icon: '🌊', label: "Flood Risk (Max)", value: floodRisk, color: floodColor, sub: fieldsWithData ? `${maxPrecip.toFixed(1)} mm max precip` : 'Awaiting data' },
    { icon: '☀️', label: "Drought Risk (Max)", value: droughtRisk, color: droughtColor, sub: fieldsWithData ? `Min moisture: ${minMoisture.toFixed(2)}` : 'Awaiting data' },
    { icon: '🌾', label: "Avg Est. Yield", value: avgYield, color: '#E8F5E9', sub: "Awaiting ML predictions" },
    { icon: '📡', label: "Active Sensors", value: totalSensors, color: '#52B788', sub: "Across all fields" }
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: 16 
    }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.02)',
          border: `1px solid rgba(82,183,136,0.15)`,
          borderTop: `3px solid ${c.color === '#E8F5E9' ? 'rgba(82,183,136,0.3)' : c.color}`,
          borderRadius: '8px', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: 8,
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)', textTransform: 'uppercase' }}>
              {c.label}
            </span>
            <span style={{ fontSize: 18 }}>
              {c.icon}
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: c.color, lineHeight: 1 }}>
            {c.value}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(232,245,233,0.3)' }}>
            {c.sub}
          </span>
        </div>
      ))}
    </div>
  )
}

function FieldHealthRow({ analysis }) {
  const rStat = analysis.stats?.find(s => s.id === 'max-risk');
  const maxRisk = rStat ? rStat.value : 0;
  
  const w = analysis.weather || {};
  const maxPrecip = w.precipitation_next_24h_mm || 0;
  const minMoisture = w.soil_moisture_proxy !== undefined ? w.soil_moisture_proxy : 0.5;

  const healthScore = Math.max(0, 100 - (maxRisk * 15));
  const healthColor = healthScore >= 80 ? '#52B788' : healthScore >= 50 ? '#F4A261' : '#E07A5F';

  let floodRisk = 'Low';
  let floodColor = '#52B788';
  if (maxPrecip > 50) { floodRisk = 'High'; floodColor = '#E07A5F'; }
  else if (maxPrecip > 20) { floodRisk = 'Moderate'; floodColor = '#F4A261'; }

  let droughtRisk = 'Low';
  let droughtColor = '#52B788';
  if (minMoisture < 0.2) { droughtRisk = 'High'; droughtColor = '#E07A5F'; }
  else if (minMoisture < 0.4) { droughtRisk = 'Moderate'; droughtColor = '#F4A261'; }

  const cards = [
    { icon: '🌿', label: "Field Health", value: `${healthScore}%`, color: healthColor },
    { icon: '🌊', label: "Flood Risk", value: floodRisk, color: floodColor },
    { icon: '☀️', label: "Drought Risk", value: droughtRisk, color: droughtColor }
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: 16, 
      marginBottom: 16 
    }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.02)',
          border: `1px solid rgba(82,183,136,0.15)`,
          borderLeft: `4px solid ${c.color}`,
          borderRadius: '6px', 
          padding: '16px',
          display: 'flex', 
          alignItems: 'center', 
          gap: 16
        }}>
          <div style={{ fontSize: 24 }}>{c.icon}</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(232,245,233,0.5)', textTransform: 'uppercase' }}>
              {c.label}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: c.color, lineHeight: 1, marginTop: 4 }}>
              {c.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function FieldOverviewCard({ field, analysis }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(82,183,136,0.15)',
      borderRadius: '8px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      flex: 1
    }}>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
        color: '#E8F5E9', margin: 0, marginBottom: 8
      }}>{analysis?.title || 'Selected Field Overview'}</h3>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82,183,136,0.1)', paddingBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>Crop Type</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#52B788', fontWeight: 500 }}>
          {field?.crop_type || 'Unknown'}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82,183,136,0.1)', paddingBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>Analysis Region</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#E8F5E9', textAlign: 'right', maxWidth: '160px' }}>
          {analysis?.subtitle || 'N/A'}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82,183,136,0.1)', paddingBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>System Status</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: analysis?.status?.working === false ? '#F4A261' : '#52B788' }}>
          {analysis?.status?.working === false ? 'Degraded' : 'Online & Active'}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>Engine Notes</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(232,245,233,0.7)', textAlign: 'right', maxWidth: '160px' }}>
          {analysis?.status?.notes || 'No alerts actively reported'}
        </span>
      </div>
    </div>
  )
}

function WeatherTelemetryCard({ weather, unitPreference, title = "Weather Telemetry" }) {
  const isImp = unitPreference === 'imperial';
  const displayTemp = (c) => isImp ? ((c * 9/5) + 32).toFixed(1) + '°F' : c.toFixed(1) + '°C';
  const displayWind = (ms) => isImp ? (ms * 2.237).toFixed(1) + ' mph' : ms.toFixed(1) + ' m/s';
  const displayPrecip = (mm) => isImp ? (mm / 25.4).toFixed(2) + ' in' : mm.toFixed(1) + ' mm';

  const metrics = [
    { label: "Current Temp", value: displayTemp(weather.temperature_current_c) },
    { label: "24h Max Temp", value: displayTemp(weather.temperature_max_last_24h_c) },
    { label: "Forecast Max (24h)", value: displayTemp(weather.temperature_forecast_max_next_24h_c) },
    { label: "Precipitation (24h)", value: displayPrecip(weather.precipitation_next_24h_mm) },
    { label: "Relative Humidity", value: `${weather.relative_humidity_percent.toFixed(1)}%` },
    { label: "Max Wind Gust", value: displayWind(weather.wind_gust_max_ms) },
    { label: "Soil Moisture Proxy", value: weather.soil_moisture_proxy.toFixed(6) },
    { label: "Vapor Pressure Deficit", value: `${weather.vapor_pressure_deficit_kpa.toFixed(6)} kPa` }
  ];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(82,183,136,0.15)',
      borderRadius: '8px',
      padding: '20px',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
        color: '#E8F5E9', marginBottom: 16, marginTop: 0
      }}>{title}</h3>
      
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16
      }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(232,245,233,0.5)' }}>
              {m.label}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#52B788', fontWeight: 600 }}>
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ModelStatsCard({ stats, title = "AI Risk Statistics" }) {
  if (!stats || stats.length === 0) return null;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(82,183,136,0.15)',
      borderRadius: '8px',
      padding: '20px',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
        color: '#E8F5E9', marginBottom: 16, marginTop: 0
      }}>{title}</h3>
      
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16
      }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ 
            display: 'flex', flexDirection: 'column', gap: 6,
            background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '6px'
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(232,245,233,0.5)' }}>
              {stat.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: '#E8F5E9', fontWeight: 600 }}>
                {stat.value}
              </span>
              {stat.unit && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>
                {stat.unit}
              </span>}
            </div>
            <span style={{ 
              fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
              color: stat.status === 'clear' ? '#52B788' : stat.status === 'degraded' ? '#F4A261' : 'rgba(232,245,233,0.3)'
            }}>
              STATUS: {stat.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}