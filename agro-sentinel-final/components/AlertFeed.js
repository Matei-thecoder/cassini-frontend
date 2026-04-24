'use client'

const ALERTS = [
  {
    id: 1,
    type: 'flood',
    severity: 'critical',
    field: 'East Basin Delta',
    message: 'Soil saturation reached 94% — immediate drainage required',
    time: '2 min ago',
    icon: '🌊',
  },
  {
    id: 2,
    type: 'drought',
    severity: 'high',
    field: 'South Plains Gamma',
    message: 'Moisture deficit at 82% of critical threshold',
    time: '8 min ago',
    icon: '🌡️',
  },
  {
    id: 3,
    type: 'drought',
    severity: 'medium',
    field: 'Central Plateau',
    message: 'Downward moisture trend detected over 72h',
    time: '12 min ago',
    icon: '⚠️',
  },
  {
    id: 4,
    type: 'info',
    severity: 'low',
    field: 'North Sector Alpha',
    message: 'NDVI increased +0.04 — positive growth signal',
    time: '1h ago',
    icon: '📈',
  },
  {
    id: 5,
    type: 'info',
    severity: 'low',
    field: 'West Ridge Beta',
    message: 'Sensor cluster WB-07 reconnected after network gap',
    time: '2h ago',
    icon: '📡',
  },
]

const SEVERITY_STYLES = {
  critical: { border: 'rgba(220,38,38,0.3)', bg: 'rgba(220,38,38,0.06)', dot: '#FCA5A5', label: 'CRITICAL', labelColor: '#FCA5A5' },
  high: { border: 'rgba(217,119,6,0.3)', bg: 'rgba(217,119,6,0.06)', dot: '#FCD34D', label: 'HIGH', labelColor: '#FCD34D' },
  medium: { border: 'rgba(217,119,6,0.2)', bg: 'rgba(217,119,6,0.04)', dot: '#FDE68A', label: 'MED', labelColor: '#FDE68A' },
  low: { border: 'rgba(82,183,136,0.15)', bg: 'rgba(82,183,136,0.03)', dot: '#52B788', label: 'INFO', labelColor: '#52B788' },
}

export default function AlertFeed() {
  return (
    <div className="bento-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            fontWeight: 600,
            color: '#E8F5E9',
            letterSpacing: '-0.01em',
          }}>Alert Feed</div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'rgba(232,245,233,0.4)',
            marginTop: 2,
          }}>Real-time event stream</div>
        </div>
        <div style={{
          padding: '3px 10px',
          borderRadius: 6,
          background: 'rgba(220,38,38,0.12)',
          border: '1px solid rgba(220,38,38,0.25)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#FCA5A5',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}>
          <div style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#EF4444',
            boxShadow: '0 0 4px #EF4444',
          }} />
          2 Critical
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ALERTS.map((alert, i) => {
          const style = SEVERITY_STYLES[alert.severity]
          return (
            <div
              key={alert.id}
              style={{
                padding: '12px 14px',
                borderRadius: 8,
                border: `1px solid ${style.border}`,
                background: style.bg,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                animation: `slideUp 0.4s ease-out ${i * 0.06}s both`,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{alert.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: style.labelColor,
                    letterSpacing: '0.06em',
                  }}>{style.label} · {alert.field}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'rgba(232,245,233,0.3)',
                    flexShrink: 0,
                  }}>{alert.time}</span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'rgba(232,245,233,0.75)',
                  lineHeight: 1.4,
                }}>{alert.message}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
