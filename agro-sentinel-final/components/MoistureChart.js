'use client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { MOISTURE_TIMELINE } from '../lib/data'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(15,30,20,0.97)',
      border: '1px solid rgba(82,183,136,0.25)',
      borderRadius: 10,
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{ fontSize: 10, color: 'rgba(232,245,233,0.4)', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, marginTop: 4 }} />
          <span style={{ fontSize: 11, color: 'rgba(232,245,233,0.5)' }}>{p.name}:</span>
          <span style={{ fontSize: 11, color: '#E8F5E9' }}>{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

export default function MoistureChart() {
  return (
    <div className="bento-card" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17,
          fontWeight: 600,
          color: '#E8F5E9',
          letterSpacing: '-0.01em',
        }}>Soil Moisture Trends</div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'rgba(232,245,233,0.4)',
          marginTop: 2,
        }}>7-day rolling · All sectors</div>
      </div>

      {/* Threshold indicators */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Flood threshold', value: '> 85%', color: '#64B5F6' },
          { label: 'Drought threshold', value: '< 25%', color: '#FCD34D' },
          { label: 'Optimal range', value: '40–75%', color: '#52B788' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding: '4px 10px',
            borderRadius: 6,
            background: `${color}12`,
            border: `1px solid ${color}30`,
            display: 'flex',
            gap: 6,
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: `${color}` }}>{value}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(232,245,233,0.35)' }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MOISTURE_TIMELINE} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(82,183,136,0.07)" />
            <XAxis
              dataKey="day"
              tick={{ fill: 'rgba(232,245,233,0.4)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={v => `${v}%`}
              tick={{ fill: 'rgba(232,245,233,0.4)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              width={38}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={85} stroke="rgba(100,181,246,0.3)" strokeDasharray="3 3" />
            <ReferenceLine y={25} stroke="rgba(253,211,77,0.3)" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="alpha" name="Alpha" stroke="#52B788" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
            <Line type="monotone" dataKey="delta" name="Delta" stroke="#64B5F6" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
            <Line type="monotone" dataKey="gamma" name="Gamma" stroke="#FCD34D" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
            <Line type="monotone" dataKey="beta" name="Beta" stroke="#C084FC" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
