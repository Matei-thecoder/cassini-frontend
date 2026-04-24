'use client'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { ECONOMIC_DATA } from '../lib/data'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(15,30,20,0.97)',
      border: '1px solid rgba(82,183,136,0.25)',
      borderRadius: 10,
      padding: '12px 16px',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{ fontSize: 11, color: 'rgba(232,245,233,0.5)', marginBottom: 8 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          <span style={{ fontSize: 11, color: 'rgba(232,245,233,0.6)', textTransform: 'capitalize' }}>
            {p.name}:
          </span>
          <span style={{ fontSize: 12, color: '#E8F5E9', fontWeight: 500 }}>
            €{(p.value / 1000).toFixed(0)}k
          </span>
        </div>
      ))}
    </div>
  )
}

export default function EconomicChart() {
  const currentMonth = 5 // June is current

  return (
    <div className="bento-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            fontWeight: 600,
            color: '#E8F5E9',
            letterSpacing: '-0.01em',
          }}>Economic Output Forecast</div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'rgba(232,245,233,0.4)',
            marginTop: 2,
          }}>Projected yield value · All fields combined</div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 700,
            color: '#86EFAC',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>€1.24M</div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#52B788',
            marginTop: 3,
          }}>+8.3% vs baseline ↑</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ECONOMIC_DATA} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#52B788" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#52B788" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64B5F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#64B5F6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FCD34D" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#FCD34D" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(82,183,136,0.07)" />
            <XAxis
              dataKey="month"
              tick={{ fill: 'rgba(232,245,233,0.4)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => `€${v / 1000}k`}
              tick={{ fill: 'rgba(232,245,233,0.4)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x="May" stroke="rgba(82,183,136,0.3)" strokeDasharray="3 3" label="" />
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="#FCD34D"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="url(#baselineGrad)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="projected"
              stroke="#52B788"
              strokeWidth={2}
              fill="url(#projectedGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#52B788', stroke: 'rgba(82,183,136,0.4)', strokeWidth: 4 }}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#64B5F6"
              strokeWidth={2.5}
              fill="url(#actualGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#64B5F6', stroke: 'rgba(100,181,246,0.4)', strokeWidth: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
        {[
          { color: '#52B788', label: 'Projected', dash: false },
          { color: '#64B5F6', label: 'Actual', dash: false },
          { color: '#FCD34D', label: 'Baseline', dash: true },
        ].map(({ color, label, dash }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 20,
              height: 2,
              background: dash
                ? `repeating-linear-gradient(90deg, ${color} 0px, ${color} 4px, transparent 4px, transparent 8px)`
                : color,
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(232,245,233,0.5)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
