'use client'
import { useEffect, useState } from 'react'
import AuthGuard from '../../components/AuthGuard'
import Header from '../../components/Header'
import StatsRow from '../../components/StatsRow'
import FieldMap from '../../components/FieldMap'
import FieldsList from '../../components/FieldsList'
import EconomicChart from '../../components/EconomicChart'
import MoistureChart from '../../components/MoistureChart'
import WeatherWidget from '../../components/WeatherWidget'
import AlertFeed from '../../components/AlertFeed'
import PredictionPanel from '../../components/PredictionPanel'
import { getCurrentUser } from '../../lib/auth'
import { getAllFields, onFieldsChange } from '../../lib/fields-store'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}

function Dashboard() {
  const [selectedField, setSelectedField] = useState(null)
  const [user, setUser] = useState(null)
  const [fields, setFields] = useState([])

  useEffect(() => {
    setUser(getCurrentUser())
    setFields(getAllFields())
    const off = onFieldsChange(setFields)
    return off
  }, [])

  const totalArea = fields.reduce((s, f) => s + (f.area || 0), 0)

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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28, fontWeight: 700,
              color: '#E8F5E9', letterSpacing: '-0.03em', lineHeight: 1,
            }}>
              {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Field Intelligence Dashboard'}
            </h1>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'rgba(82,183,136,0.6)', letterSpacing: '0.05em',
            }}>Season 2025 · Q2</span>
          </div>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14,
            color: 'rgba(232,245,233,0.45)', maxWidth: 560,
          }}>
            {user?.farmName ? `${user.farmName} · ` : ''}
            Flood & drought detection with AI-driven yield forecasting across {totalArea} monitored hectares.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        <div style={{ marginBottom: 20 }}>
          <StatsRow />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: 16,
        }}>
          <div style={{ gridColumn: '1', gridRow: '1' }}>
            <FieldMap selectedField={selectedField} setSelectedField={setSelectedField} />
          </div>
          <div style={{ gridColumn: '2', gridRow: '1' }}>
            <FieldsList selectedField={selectedField} setSelectedField={setSelectedField} />
          </div>
          <div style={{ gridColumn: '3', gridRow: '1' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
              <WeatherWidget />
              <AlertFeed />
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 16, marginTop: 16,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <EconomicChart />
            <MoistureChart />
          </div>
          <div>
            <PredictionPanel />
          </div>
        </div>

        <div style={{
          marginTop: 32, paddingTop: 20,
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
