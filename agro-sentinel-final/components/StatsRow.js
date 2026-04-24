'use client'
import { SUMMARY_STATS } from '../lib/data'

function StatCard({ value, label, sub, accent, icon, delay }) {
  return (
    <div className="bento-card" style={{
      padding: '20px 24px',
      flex: 1,
      minWidth: 160,
      animation: `slideUp 0.5s ease-out ${delay}s both`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'rgba(232,245,233,0.45)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>{label}</div>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 32,
        fontWeight: 700,
        color: accent || '#E8F5E9',
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }} className="stat-number">{value}</div>
      {sub && (
        <div style={{
          marginTop: 6,
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          color: 'rgba(232,245,233,0.4)',
        }}>{sub}</div>
      )}
    </div>
  )
}

export default function StatsRow() {
  const { totalArea, healthyPercent, floodRisk, droughtRisk, projectedYield, yieldChange, activeSensors } = SUMMARY_STATS

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <StatCard
        value={`${totalArea} ha`}
        label="Total Area"
        sub="5 active fields"
        icon="🗺️"
        delay={0.1}
      />
      <StatCard
        value={`${healthyPercent}%`}
        label="Healthy"
        sub="351 ha optimal"
        accent="#52B788"
        icon="✅"
        delay={0.15}
      />
      <StatCard
        value={`${floodRisk}%`}
        label="Flood Risk"
        sub="89 ha affected"
        accent="#64B5F6"
        icon="🌊"
        delay={0.2}
      />
      <StatCard
        value={`${droughtRisk}%`}
        label="Drought Risk"
        sub="217 ha deficit"
        accent="#FCD34D"
        icon="🌵"
        delay={0.25}
      />
      <StatCard
        value={projectedYield}
        label="Projected Yield"
        sub={`${yieldChange} vs baseline`}
        accent="#86EFAC"
        icon="💹"
        delay={0.3}
      />
      <StatCard
        value={activeSensors.toLocaleString()}
        label="Sensors Online"
        sub="99.2% uptime"
        icon="📡"
        delay={0.35}
      />
    </div>
  )
}
