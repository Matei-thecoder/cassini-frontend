'use client'

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '../../components/AuthGuard'
import Header from '../../components/Header'
import FieldMap from '../../components/FieldMap'
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

  // Bulletproof Total Area Calculation pulling from the AI Payload
  const totalAreaHa = fields.reduce((sum, field) => {
    if (field.latest_analysis?.area?.total_monitored_hectares !== undefined) {
      return sum + (parseFloat(field.latest_analysis.area.total_monitored_hectares) || 0);
    }
    if (field.area !== null && field.area !== undefined) {
      if (typeof field.area === 'object' && field.area.total_monitored_hectares !== undefined) {
        return sum + (parseFloat(field.area.total_monitored_hectares) || 0);
      }
      return sum + (parseFloat(field.area) || 0);
    }
    return sum;
  }, 0);

  const formatAreaDisplay = (hectares) => {
    const isImp = unitPref === 'imperial';
    const num = isImp ? hectares * 2.47105 : hectares;
    const unit = isImp ? 'acres' : 'hectares';
    const formattedNum = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
    return `${formattedNum} monitored ${unit}`;
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
              <FieldOverviewCard field={activeField} analysis={activeAnalysis} unitPreference={unitPref} />
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
                    {analysis.stats && <ModelStatsCard stats={analysis.stats} title="AI Base Models" />}
                    {analysis.risks && <DetailedRisksCard risks={analysis.risks} />}
                    {analysis.weather && <WeatherTelemetryCard weather={analysis.weather} unitPreference={unitPref} title="Local Telemetry" />}
                    {(analysis.terrain || analysis.resources) && <TerrainContextCard terrain={analysis.terrain} resources={analysis.resources} unitPreference={unitPref} />}
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
  let fieldsWithData = 0;
  
  let hasRiskModels = false;
  let maxFloodRiskPct = 0;
  let maxFloodRiskLabel = 'Low';
  let maxDroughtRiskPct = 0;
  let maxDroughtRiskLabel = 'Low';
  
  let maxPrecip = 0;
  let minMoisture = 999;

  fields.forEach(f => {
    const analysis = f.latest_analysis;
    if (!analysis) return;
    fieldsWithData++;

    const rStat = analysis.stats?.find(s => s.id === 'max-risk');
    if (rStat && rStat.value > maxRisk) maxRisk = parseFloat(rStat.value);

    if (analysis.sensors?.online !== undefined) {
      totalSensors += analysis.sensors.online;
    } else {
      const sStat = analysis.stats?.find(s => s.id === 'sensors-online');
      if (sStat) totalSensors += Number(sStat.value);
    }

    if (analysis.risks) {
      hasRiskModels = true;
      const fRisk = analysis.risks.find(r => r.id === 'flood');
      if (fRisk && fRisk.risk_index_percent > maxFloodRiskPct) {
          maxFloodRiskPct = fRisk.risk_index_percent;
          maxFloodRiskLabel = fRisk.risk.charAt(0).toUpperCase() + fRisk.risk.slice(1);
      }
      const dRisk = analysis.risks.find(r => r.id === 'drought');
      if (dRisk && dRisk.risk_index_percent > maxDroughtRiskPct) {
          maxDroughtRiskPct = dRisk.risk_index_percent;
          maxDroughtRiskLabel = dRisk.risk.charAt(0).toUpperCase() + dRisk.risk.slice(1);
      }
    }

    const w = analysis.weather;
    if (w) {
      if (w.precipitation_next_24h_mm > maxPrecip) maxPrecip = w.precipitation_next_24h_mm;
      if (w.soil_moisture_proxy < minMoisture) minMoisture = w.soil_moisture_proxy;
    }
  });

  if (minMoisture === 999) minMoisture = 0;

  const isImp = unitPreference === 'imperial';
  const areaNum = isImp ? (totalAreaHa * 2.47105) : totalAreaHa;
  const areaUnit = isImp ? 'ac' : 'ha';
  const formattedArea = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(areaNum);

  const healthScore = fieldsWithData === 0 ? '--' : Math.max(0, 100 - maxRisk).toFixed(1);
  const healthColor = healthScore >= 80 ? '#52B788' : healthScore >= 50 ? '#F4A261' : '#E07A5F';

  let floodRisk = '--'; let floodColor = '#52B788'; let floodSub = 'Awaiting data';
  let droughtRisk = '--'; let droughtColor = '#52B788'; let droughtSub = 'Awaiting data';

  if (fieldsWithData > 0) {
      if (hasRiskModels) {
          floodRisk = maxFloodRiskLabel;
          floodColor = getRiskColor(maxFloodRiskLabel);
          floodSub = `${maxFloodRiskPct.toFixed(1)}% AI Risk Score`;
          
          droughtRisk = maxDroughtRiskLabel;
          droughtColor = getRiskColor(maxDroughtRiskLabel);
          droughtSub = `${maxDroughtRiskPct.toFixed(1)}% AI Risk Score`;
      } else {
          floodRisk = 'Low';
          if (maxPrecip > 50) { floodRisk = 'High'; floodColor = '#E07A5F'; }
          else if (maxPrecip > 20) { floodRisk = 'Moderate'; floodColor = '#F4A261'; }
          floodSub = `${maxPrecip.toFixed(1)} mm max precip`;

          droughtRisk = 'Low';
          if (minMoisture < 0.2) { droughtRisk = 'High'; droughtColor = '#E07A5F'; }
          else if (minMoisture < 0.4) { droughtRisk = 'Moderate'; droughtColor = '#F4A261'; }
          droughtSub = `Min moisture: ${minMoisture.toFixed(2)}`;
      }
  }

  const avgYield = fieldsWithData === 0 ? '--' : 'Calculating';

  const cards = [
    { icon: '🗺️', label: "Total Surface", value: `${formattedArea} ${areaUnit}`, color: '#E8F5E9', sub: "Actively monitored" },
    { icon: '🌿', label: "Overall Health", value: healthScore !== '--' ? `${healthScore}%` : '--', color: healthColor, sub: "System-wide index" },
    { icon: '🌊', label: "Flood Risk (Max)", value: floodRisk, color: floodColor, sub: floodSub },
    { icon: '☀️', label: "Drought Risk (Max)", value: droughtRisk, color: droughtColor, sub: droughtSub },
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
  const maxRisk = rStat ? parseFloat(rStat.value) : 0;
  
  const healthScore = Math.max(0, 100 - maxRisk).toFixed(1);
  const healthColor = healthScore >= 80 ? '#52B788' : healthScore >= 50 ? '#F4A261' : '#E07A5F';

  let floodRisk = 'Low'; let floodColor = '#52B788';
  let droughtRisk = 'Low'; let droughtColor = '#52B788';

  if (analysis.risks) {
    const fRisk = analysis.risks.find(r => r.id === 'flood');
    if (fRisk) {
      floodRisk = fRisk.risk.charAt(0).toUpperCase() + fRisk.risk.slice(1);
      floodColor = getRiskColor(fRisk.risk);
    }
    const dRisk = analysis.risks.find(r => r.id === 'drought');
    if (dRisk) {
      droughtRisk = dRisk.risk.charAt(0).toUpperCase() + dRisk.risk.slice(1);
      droughtColor = getRiskColor(dRisk.risk);
    }
  } else {
    const w = analysis.weather || {};
    if (w.precipitation_next_24h_mm > 50) { floodRisk = 'High'; floodColor = '#E07A5F'; }
    else if (w.precipitation_next_24h_mm > 20) { floodRisk = 'Moderate'; floodColor = '#F4A261'; }
    
    const minMoisture = w.soil_moisture_proxy !== undefined ? w.soil_moisture_proxy : 0.5;
    if (minMoisture < 0.2) { droughtRisk = 'High'; droughtColor = '#E07A5F'; }
    else if (minMoisture < 0.4) { droughtRisk = 'Moderate'; droughtColor = '#F4A261'; }
  }

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

function FieldOverviewCard({ field, analysis, unitPreference }) {
  if (!field) {
    return (
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(82,183,136,0.2)', borderRadius: '8px', padding: '20px', display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(232,245,233,0.5)' }}>No field selected on map</span>
      </div>
    );
  }

  let fieldArea = 0;
  if (analysis?.area?.total_monitored_hectares !== undefined) {
    fieldArea = parseFloat(analysis.area.total_monitored_hectares);
  } else if (field.area !== null && field.area !== undefined) {
    fieldArea = typeof field.area === 'object' ? parseFloat(field.area.total_monitored_hectares) : parseFloat(field.area);
  }
  
  const isImp = unitPreference === 'imperial';
  const areaNum = isImp ? (fieldArea * 2.47105) : fieldArea;
  const areaUnit = isImp ? 'ac' : 'ha';
  const formattedArea = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(areaNum || 0);

  const rStat = analysis?.stats?.find(s => s.id === 'max-risk');
  const maxRisk = rStat ? parseFloat(rStat.value) : 0;
  const healthScore = analysis ? Math.max(0, 100 - maxRisk).toFixed(1) : '--';
  const healthColor = healthScore !== '--' && healthScore >= 80 ? '#52B788' : healthScore >= 50 ? '#F4A261' : '#E07A5F';
  
  const moisture = analysis?.weather?.soil_moisture_proxy !== undefined 
    ? `${(analysis.weather.soil_moisture_proxy * 100).toFixed(1)}%`
    : '--';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600,
            color: '#E8F5E9', margin: 0, marginBottom: 4
          }}>{field.name || 'Selected Field'}</h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#52B788' }}>
            {analysis?.subtitle || 'Active Monitoring'}
          </span>
        </div>
        
        {(() => {
          let statusText = 'HEALTHY';
          let statusColor = '#2D6A4F'; 
          
          if (!analysis) {
            statusText = 'PENDING';
            statusColor = '#4B5563'; 
          } else if (maxRisk > 50) {
            statusText = 'ALERT';
            statusColor = '#E07A5F'; 
          } else if (analysis.status?.working === false) {
            statusText = 'DEGRADED';
            statusColor = '#F4A261'; 
          }

          return (
            <div style={{ background: statusColor, color: '#FFF', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {statusText}
            </div>
          )
        })()}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82,183,136,0.1)', paddingBottom: '8px', marginTop: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>Crop Type</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#E8F5E9', fontWeight: 500 }}>
          {field?.crop_type || field?.crop || 'Unknown'}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82,183,136,0.1)', paddingBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>Monitored Area</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#E8F5E9', fontWeight: 500 }}>
          {formattedArea} {areaUnit}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82,183,136,0.1)', paddingBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>System Health</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: healthColor, fontWeight: 600 }}>
          {healthScore !== '--' ? `${healthScore}%` : '--'}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82,183,136,0.1)', paddingBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>Soil Moisture</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#52B788', fontWeight: 500 }}>
          {moisture}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82,183,136,0.1)', paddingBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>Engine Status</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: analysis?.status?.working === false ? '#F4A261' : (analysis ? '#52B788' : 'rgba(232,245,233,0.5)') }}>
          {analysis?.status?.working === false ? 'Degraded' : (analysis ? 'Online & Active' : 'Awaiting Data')}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>Notes</span>
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
    { label: "Evapotranspiration", value: weather.evapotranspiration_24h_mm !== undefined ? displayPrecip(weather.evapotranspiration_24h_mm) : null },
    { label: "Relative Humidity", value: `${weather.relative_humidity_percent?.toFixed(1)}%` },
    { label: "Max Wind Gust", value: displayWind(weather.wind_gust_max_ms) },
    { label: "CAPE (Instability)", value: weather.cape_max_jkg !== undefined ? `${weather.cape_max_jkg} J/kg` : null },
    { label: "Soil Moisture Proxy", value: weather.soil_moisture_proxy?.toFixed(4) },
    { label: "Vapor Pressure Def", value: `${weather.vapor_pressure_deficit_kpa?.toFixed(4)} kPa` }
  ].filter(m => m.value !== null);

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

function DetailedRisksCard({ risks, title = "Detailed Risk Breakdown" }) {
  if (!risks || risks.length === 0) return null;

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
        {risks.map((risk, i) => {
          const color = getRiskColor(risk.risk);
          return (
          <div key={i} style={{ 
            display: 'flex', flexDirection: 'column', gap: 6,
            background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '6px',
            borderTop: `3px solid ${color}`
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(232,245,233,0.5)' }}>
              {risk.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#E8F5E9', fontWeight: 600 }}>
                {risk.risk.charAt(0).toUpperCase() + risk.risk.slice(1)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>
                ({risk.risk_index_percent.toFixed(1)}%)
              </span>
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}

function TerrainContextCard({ terrain, resources, unitPreference, title = "Terrain & Resources" }) {
  if (!terrain && !resources) return null;

  const isImp = unitPreference === 'imperial';
  const formatMeters = (m) => isImp ? `${(m * 3.28084).toFixed(0)} ft` : `${m.toFixed(0)} m`;

  const metrics = [];
  if (terrain && terrain.available) {
    metrics.push({ label: "Terrain Class", value: terrain.terrain_class ? terrain.terrain_class.toUpperCase() : 'N/A' });
    metrics.push({ label: "Elevation Range", value: formatMeters(terrain.elevation_range_m) });
    metrics.push({ label: "Center Elev.", value: formatMeters(terrain.center_elevation_m) });
  }
  if (resources && resources.available) {
    metrics.push({ label: "Waterways", value: resources.waterway_features });
    metrics.push({ label: "Forest/Green", value: resources.forest_or_green_features });
    metrics.push({ label: "Agriculture", value: resources.agriculture_features });
  }

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

// ==========================================
// NEWLY INTEGRATED FIELDS LIST
// ==========================================
function FieldsList({ fields, setFields, selectedField, setSelectedField, unitPreference }) {
  const router = useRouter();

  const getCropIcon = (cropName) => {
    if (!cropName) return '🌱';
    const lower = cropName.toLowerCase();
    if (lower.includes('corn') || lower.includes('maize')) return '🌽';
    if (lower.includes('wheat') || lower.includes('barley')) return '🌾';
    if (lower.includes('soy')) return '🌿';
    if (lower.includes('sunflower')) return '🌻';
    return '🌱';
  };

  const handleDelete = async (e, fieldId) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to delete this field?")) return;
    
    try {
      const token = localStorage.getItem('agro.token');
      const response = await fetch(`http://localhost:2000/api/fields/${fieldId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setFields(prev => prev.filter(f => f.id !== fieldId));
        if (selectedField === fieldId) setSelectedField(null);
      } else {
        console.error('Failed to delete field');
      }
    } catch (err) {
      console.error('Server connection failed', err);
    }
  };

  return (
    <div style={{
      background: 'rgba(20, 35, 24, 0.6)', 
      border: '1px solid rgba(82,183,136,0.15)',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      height: '100%',
      minHeight: '500px'
    }}>
      
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#E8F5E9', margin: '0 0 4px 0' }}>
          Active Fields
        </h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>
          {fields.length} monitored parcel{fields.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
        {fields.map(field => {
          const analysis = field.latest_analysis;
          
          let fieldArea = 0;
          if (analysis?.area?.total_monitored_hectares !== undefined) {
            fieldArea = parseFloat(analysis.area.total_monitored_hectares);
          } else if (field.area !== null && field.area !== undefined) {
            fieldArea = typeof field.area === 'object' ? parseFloat(field.area.total_monitored_hectares) : parseFloat(field.area);
          }
          
          const isImp = unitPreference === 'imperial';
          const areaNum = isImp ? (fieldArea * 2.47105) : fieldArea;
          const areaUnit = isImp ? 'ac' : 'ha';
          const formattedArea = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(areaNum || 0);

          const moistureProxy = analysis?.weather?.soil_moisture_proxy;
          const moisturePercent = moistureProxy !== undefined ? Math.round(moistureProxy * 100) : 0;
          const displayMoisture = moistureProxy !== undefined ? `${moisturePercent}%` : '--';

          const rStat = analysis?.stats?.find(s => s.id === 'max-risk');
          const maxRisk = rStat ? parseFloat(rStat.value) : 0;
          
          let statusText = 'Optimal';
          let statusColor = '#52B788'; 
          if (!analysis) {
             statusText = 'Pending';
             statusColor = 'rgba(232,245,233,0.5)'; 
          } else if (maxRisk > 50) {
             statusText = 'Alert';
             statusColor = '#E07A5F'; 
          } else if (analysis.status?.working === false) {
             statusText = 'Degraded';
             statusColor = '#F4A261'; 
          }

          const isSelected = selectedField === field.id;

          return (
            <div 
              key={field.id}
              onClick={() => setSelectedField(field.id)}
              style={{
                background: isSelected ? 'rgba(82,183,136,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? '#52B788' : 'rgba(82,183,136,0.1)'}`,
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '24px' }}>{getCropIcon(field.crop_type)}</span>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 18, color: '#E8F5E9' }}>
                      {field.name}
                    </h3>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>
                      {field.crop_type || 'Unknown'} • {formattedArea} {areaUnit}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px',
                    border: `1px solid ${statusColor}`, 
                    background: 'rgba(0,0,0,0.2)',
                    padding: '4px 8px', borderRadius: '4px' 
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }}></div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: statusColor, fontWeight: 600, textTransform: 'uppercase' }}>
                      {statusText}
                    </span>
                  </div>

                  <button 
                    onClick={(e) => handleDelete(e, field.id)}
                    style={{
                      background: 'rgba(224, 122, 95, 0.1)',
                      border: '1px solid rgba(224, 122, 95, 0.3)',
                      color: '#E07A5F',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    🗑️ DELETE
                  </button>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(232,245,233,0.5)', textTransform: 'uppercase' }}>
                    Soil Moisture
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#52B788', fontWeight: 600 }}>
                    {displayMoisture}
                  </span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${moisturePercent}%`, 
                    height: '100%', 
                    background: '#52B788',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
              </div>
            </div>
          )
        })}
        
        {fields.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(232,245,233,0.4)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            No fields found. Add one to get started.
          </div>
        )}
      </div>

      <button 
        onClick={() => router.push('/dashboard/add-field')}
        style={{
          width: '100%',
          background: 'rgba(82,183,136,0.05)',
          border: '1px solid rgba(82,183,136,0.2)',
          color: '#52B788',
          padding: '16px',
          borderRadius: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginTop: 'auto'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(82,183,136,0.1)';
          e.currentTarget.style.borderColor = '#52B788';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(82,183,136,0.05)';
          e.currentTarget.style.borderColor = 'rgba(82,183,136,0.2)';
        }}
      >
        + ADD NEW FIELD
      </button>

    </div>
  )
}

// Global Risk Color Helper
const getRiskColor = (riskLevel) => {
  if (!riskLevel) return '#52B788';
  const level = riskLevel.toLowerCase().replace(/_/g, ' '); 
  if (['none', 'extremely low', 'very low', 'low'].includes(level)) return '#52B788';
  if (level === 'moderate' || level === 'medium') return '#F4A261';
  return '#E07A5F'; 
};

{/*}
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

  // ⚡ FIXED: Bulletproof Total Area Calculation pulling from the new AI Payload
  const totalAreaHa = fields.reduce((sum, field) => {
    // 1. Prioritize the area returned directly by the new AI model analysis
    if (field.latest_analysis?.area?.total_monitored_hectares !== undefined) {
      return sum + (parseFloat(field.latest_analysis.area.total_monitored_hectares) || 0);
    }
    
    // 2. Fallback to older database formats
    if (field.area !== null && field.area !== undefined) {
      if (typeof field.area === 'object' && field.area.total_monitored_hectares !== undefined) {
        return sum + (parseFloat(field.area.total_monitored_hectares) || 0);
      }
      return sum + (parseFloat(field.area) || 0);
    }
    
    return sum;
  }, 0);

  const formatAreaDisplay = (hectares) => {
    const isImp = unitPref === 'imperial';
    const num = isImp ? hectares * 2.47105 : hectares;
    const unit = isImp ? 'acres' : 'hectares';
    const formattedNum = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
    return `${formattedNum} monitored ${unit}`;
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

      {/* Hero strip }
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
        
        {/* TOP DYNAMIC STATS ROW (Global) }
        <div style={{ marginBottom: 24 }}>
          <GlobalStatsRow fields={fields} unitPreference={unitPref} totalAreaHa={totalAreaHa} />
        </div>

        {/* Top Interactive Area (Map, List, Selected Field Info) }
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
              {/* ✅ Passed unitPreference down to the upgraded Active Field Card }
              <FieldOverviewCard field={activeField} analysis={activeAnalysis} unitPreference={unitPref} />
            </div>
          </div>
        </div>

        {/* PER-FIELD CALAMITY DASHBOARDS }
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

                  {/* Per-Field Quick Health Stats }
                  <FieldHealthRow analysis={analysis} />

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: 16,
                  }}>
                    {analysis.stats && <ModelStatsCard stats={analysis.stats} title="AI Base Models" />}
                    {analysis.risks && <DetailedRisksCard risks={analysis.risks} />}
                    {analysis.weather && <WeatherTelemetryCard weather={analysis.weather} unitPreference={unitPref} title="Local Telemetry" />}
                    {(analysis.terrain || analysis.resources) && <TerrainContextCard terrain={analysis.terrain} resources={analysis.resources} unitPreference={unitPref} />}
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

        {/* FOOTER }
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
  let fieldsWithData = 0;
  
  let hasRiskModels = false;
  let maxFloodRiskPct = 0;
  let maxFloodRiskLabel = 'Low';
  let maxDroughtRiskPct = 0;
  let maxDroughtRiskLabel = 'Low';
  
  // Weather fallbacks
  let maxPrecip = 0;
  let minMoisture = 999;

  fields.forEach(f => {
    const analysis = f.latest_analysis;
    if (!analysis) return;
    fieldsWithData++;

    // 1. Overall System Max Risk
    const rStat = analysis.stats?.find(s => s.id === 'max-risk');
    if (rStat && rStat.value > maxRisk) maxRisk = parseFloat(rStat.value);

    // 2. Active Sensors
    if (analysis.sensors?.online !== undefined) {
      totalSensors += analysis.sensors.online;
    } else {
      const sStat = analysis.stats?.find(s => s.id === 'sensors-online');
      if (sStat) totalSensors += Number(sStat.value);
    }

    // 3. Extrapolate Highest Risks Across All Fields
    if (analysis.risks) {
      hasRiskModels = true;
      const fRisk = analysis.risks.find(r => r.id === 'flood');
      if (fRisk && fRisk.risk_index_percent > maxFloodRiskPct) {
          maxFloodRiskPct = fRisk.risk_index_percent;
          maxFloodRiskLabel = fRisk.risk.charAt(0).toUpperCase() + fRisk.risk.slice(1);
      }
      const dRisk = analysis.risks.find(r => r.id === 'drought');
      if (dRisk && dRisk.risk_index_percent > maxDroughtRiskPct) {
          maxDroughtRiskPct = dRisk.risk_index_percent;
          maxDroughtRiskLabel = dRisk.risk.charAt(0).toUpperCase() + dRisk.risk.slice(1);
      }
    }

    const w = analysis.weather;
    if (w) {
      if (w.precipitation_next_24h_mm > maxPrecip) maxPrecip = w.precipitation_next_24h_mm;
      if (w.soil_moisture_proxy < minMoisture) minMoisture = w.soil_moisture_proxy;
    }
  });

  if (minMoisture === 999) minMoisture = 0;

  // Formatting Total Surface
  const isImp = unitPreference === 'imperial';
  const areaNum = isImp ? (totalAreaHa * 2.47105) : totalAreaHa;
  const areaUnit = isImp ? 'ac' : 'ha';
  const formattedArea = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(areaNum);

  // Formatting Overall Health (100% minus the highest risk found anywhere)
  const healthScore = fieldsWithData === 0 ? '--' : Math.max(0, 100 - maxRisk).toFixed(1);
  const healthColor = healthScore >= 80 ? '#52B788' : healthScore >= 50 ? '#F4A261' : '#E07A5F';

  // Formatting Flood & Drought Risk
  let floodRisk = '--'; let floodColor = '#52B788'; let floodSub = 'Awaiting data';
  let droughtRisk = '--'; let droughtColor = '#52B788'; let droughtSub = 'Awaiting data';

  if (fieldsWithData > 0) {
      if (hasRiskModels) {
          floodRisk = maxFloodRiskLabel;
          floodColor = getRiskColor(maxFloodRiskLabel);
          floodSub = `${maxFloodRiskPct.toFixed(1)}% AI Risk Score`;
          
          droughtRisk = maxDroughtRiskLabel;
          droughtColor = getRiskColor(maxDroughtRiskLabel);
          droughtSub = `${maxDroughtRiskPct.toFixed(1)}% AI Risk Score`;
      } else {
          // Weather Failover if Risk Model is missing
          floodRisk = 'Low';
          if (maxPrecip > 50) { floodRisk = 'High'; floodColor = '#E07A5F'; }
          else if (maxPrecip > 20) { floodRisk = 'Moderate'; floodColor = '#F4A261'; }
          floodSub = `${maxPrecip.toFixed(1)} mm max precip`;

          droughtRisk = 'Low';
          if (minMoisture < 0.2) { droughtRisk = 'High'; droughtColor = '#E07A5F'; }
          else if (minMoisture < 0.4) { droughtRisk = 'Moderate'; droughtColor = '#F4A261'; }
          droughtSub = `Min moisture: ${minMoisture.toFixed(2)}`;
      }
  }

  const avgYield = fieldsWithData === 0 ? '--' : 'Calculating';

  const cards = [
    { icon: '🗺️', label: "Total Surface", value: `${formattedArea} ${areaUnit}`, color: '#E8F5E9', sub: "Actively monitored" },
    { icon: '🌿', label: "Overall Health", value: healthScore !== '--' ? `${healthScore}%` : '--', color: healthColor, sub: "System-wide index" },
    { icon: '🌊', label: "Flood Risk (Max)", value: floodRisk, color: floodColor, sub: floodSub },
    { icon: '☀️', label: "Drought Risk (Max)", value: droughtRisk, color: droughtColor, sub: droughtSub },
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
  const maxRisk = rStat ? parseFloat(rStat.value) : 0;
  
  const healthScore = Math.max(0, 100 - maxRisk).toFixed(1);
  const healthColor = healthScore >= 80 ? '#52B788' : healthScore >= 50 ? '#F4A261' : '#E07A5F';

  // Use explicit AI risks if available, otherwise fallback to weather thresholds
  let floodRisk = 'Low'; let floodColor = '#52B788';
  let droughtRisk = 'Low'; let droughtColor = '#52B788';

  if (analysis.risks) {
    const fRisk = analysis.risks.find(r => r.id === 'flood');
    if (fRisk) {
      floodRisk = fRisk.risk.charAt(0).toUpperCase() + fRisk.risk.slice(1);
      floodColor = getRiskColor(fRisk.risk);
    }
    const dRisk = analysis.risks.find(r => r.id === 'drought');
    if (dRisk) {
      droughtRisk = dRisk.risk.charAt(0).toUpperCase() + dRisk.risk.slice(1);
      droughtColor = getRiskColor(dRisk.risk);
    }
  } else {
    const w = analysis.weather || {};
    if (w.precipitation_next_24h_mm > 50) { floodRisk = 'High'; floodColor = '#E07A5F'; }
    else if (w.precipitation_next_24h_mm > 20) { floodRisk = 'Moderate'; floodColor = '#F4A261'; }
    
    const minMoisture = w.soil_moisture_proxy !== undefined ? w.soil_moisture_proxy : 0.5;
    if (minMoisture < 0.2) { droughtRisk = 'High'; droughtColor = '#E07A5F'; }
    else if (minMoisture < 0.4) { droughtRisk = 'Moderate'; droughtColor = '#F4A261'; }
  }

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

// ⚡ UPGRADED: Active Field Overview Card now dynamically populates AI Area, Health & Moisture
function FieldOverviewCard({ field, analysis, unitPreference }) {
  if (!field) {
    return (
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(82,183,136,0.2)', borderRadius: '8px', padding: '20px', display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(232,245,233,0.5)' }}>No field selected on map</span>
      </div>
    );
  }

  // Calculate Accurate Area for just this field
  let fieldArea = 0;
  if (analysis?.area?.total_monitored_hectares !== undefined) {
    fieldArea = parseFloat(analysis.area.total_monitored_hectares);
  } else if (field.area !== null && field.area !== undefined) {
    fieldArea = typeof field.area === 'object' ? parseFloat(field.area.total_monitored_hectares) : parseFloat(field.area);
  }
  
  const isImp = unitPreference === 'imperial';
  const areaNum = isImp ? (fieldArea * 2.47105) : fieldArea;
  const areaUnit = isImp ? 'ac' : 'ha';
  const formattedArea = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(areaNum || 0);

  // Health Score Calculation
  const rStat = analysis?.stats?.find(s => s.id === 'max-risk');
  const maxRisk = rStat ? parseFloat(rStat.value) : 0;
  const healthScore = analysis ? Math.max(0, 100 - maxRisk).toFixed(1) : '--';
  const healthColor = healthScore !== '--' && healthScore >= 80 ? '#52B788' : healthScore >= 50 ? '#F4A261' : '#E07A5F';
  
  // Moisture Proxy
  const moisture = analysis?.weather?.soil_moisture_proxy !== undefined 
    ? `${(analysis.weather.soil_moisture_proxy * 100).toFixed(1)}%`
    : '--';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600,
            color: '#E8F5E9', margin: 0, marginBottom: 4
          }}>{field.name || 'Selected Field'}</h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#52B788' }}>
            {analysis?.subtitle || 'Active Monitoring'}
          </span>
        </div>
        
        {/* Dynamic Status Pill }
        {(() => {
          let statusText = 'HEALTHY';
          let statusColor = '#2D6A4F'; 
          
          if (!analysis) {
            statusText = 'PENDING';
            statusColor = '#4B5563'; 
          } else if (maxRisk > 50) {
            statusText = 'ALERT';
            statusColor = '#E07A5F'; 
          } else if (analysis.status?.working === false) {
            statusText = 'DEGRADED';
            statusColor = '#F4A261'; 
          }

          return (
            <div style={{ background: statusColor, color: '#FFF', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {statusText}
            </div>
          )
        })()}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82,183,136,0.1)', paddingBottom: '8px', marginTop: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>Crop Type</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#E8F5E9', fontWeight: 500 }}>
          {field?.crop_type || field?.crop || 'Unknown'}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82,183,136,0.1)', paddingBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>Monitored Area</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#E8F5E9', fontWeight: 500 }}>
          {formattedArea} {areaUnit}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82,183,136,0.1)', paddingBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>System Health</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: healthColor, fontWeight: 600 }}>
          {healthScore !== '--' ? `${healthScore}%` : '--'}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82,183,136,0.1)', paddingBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>Soil Moisture</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#52B788', fontWeight: 500 }}>
          {moisture}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82,183,136,0.1)', paddingBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>Engine Status</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: analysis?.status?.working === false ? '#F4A261' : (analysis ? '#52B788' : 'rgba(232,245,233,0.5)') }}>
          {analysis?.status?.working === false ? 'Degraded' : (analysis ? 'Online & Active' : 'Awaiting Data')}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>Notes</span>
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
    { label: "Evapotranspiration", value: weather.evapotranspiration_24h_mm !== undefined ? displayPrecip(weather.evapotranspiration_24h_mm) : null },
    { label: "Relative Humidity", value: `${weather.relative_humidity_percent?.toFixed(1)}%` },
    { label: "Max Wind Gust", value: displayWind(weather.wind_gust_max_ms) },
    { label: "CAPE (Instability)", value: weather.cape_max_jkg !== undefined ? `${weather.cape_max_jkg} J/kg` : null },
    { label: "Soil Moisture Proxy", value: weather.soil_moisture_proxy?.toFixed(4) },
    { label: "Vapor Pressure Def", value: `${weather.vapor_pressure_deficit_kpa?.toFixed(4)} kPa` }
  ].filter(m => m.value !== null);

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

function DetailedRisksCard({ risks, title = "Detailed Risk Breakdown" }) {
  if (!risks || risks.length === 0) return null;

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
        {risks.map((risk, i) => {
          const color = getRiskColor(risk.risk);
          return (
          <div key={i} style={{ 
            display: 'flex', flexDirection: 'column', gap: 6,
            background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '6px',
            borderTop: `3px solid ${color}`
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(232,245,233,0.5)' }}>
              {risk.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#E8F5E9', fontWeight: 600 }}>
                {risk.risk.charAt(0).toUpperCase() + risk.risk.slice(1)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.5)' }}>
                ({risk.risk_index_percent.toFixed(1)}%)
              </span>
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}

function TerrainContextCard({ terrain, resources, unitPreference, title = "Terrain & Resources" }) {
  if (!terrain && !resources) return null;

  const isImp = unitPreference === 'imperial';
  const formatMeters = (m) => isImp ? `${(m * 3.28084).toFixed(0)} ft` : `${m.toFixed(0)} m`;

  const metrics = [];
  if (terrain && terrain.available) {
    metrics.push({ label: "Terrain Class", value: terrain.terrain_class ? terrain.terrain_class.toUpperCase() : 'N/A' });
    metrics.push({ label: "Elevation Range", value: formatMeters(terrain.elevation_range_m) });
    metrics.push({ label: "Center Elev.", value: formatMeters(terrain.center_elevation_m) });
  }
  if (resources && resources.available) {
    metrics.push({ label: "Waterways", value: resources.waterway_features });
    metrics.push({ label: "Forest/Green", value: resources.forest_or_green_features });
    metrics.push({ label: "Agriculture", value: resources.agriculture_features });
  }

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

// Helper function for risk color logic
const getRiskColor = (riskLevel) => {
  const level = riskLevel.toLowerCase().replace(/_/g, ' '); // Normalize underscores to spaces
  if (['none', 'extremely low', 'very low', 'low'].includes(level)) return '#52B788';
  if (level === 'moderate') return '#F4A261';
  return '#E07A5F'; // high, extreme, etc.
};*/}