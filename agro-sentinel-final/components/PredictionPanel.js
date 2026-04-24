'use client'

const PREDICTIONS = [
  {
    field: 'East Basin Delta',
    crop: 'Corn',
    icon: '🌽',
    floodProb: 89,
    droughtProb: 3,
    yieldImpact: -34,
    confidence: 91,
    horizon: '7 days',
  },
  {
    field: 'South Plains Gamma',
    crop: 'Sunflower',
    icon: '🌻',
    floodProb: 5,
    droughtProb: 76,
    yieldImpact: -22,
    confidence: 85,
    horizon: '14 days',
  },
  {
    field: 'North Sector Alpha',
    crop: 'Wheat',
    icon: '🌾',
    floodProb: 12,
    droughtProb: 8,
    yieldImpact: +11,
    confidence: 78,
    horizon: '30 days',
  },
]

function RiskGauge({ value, type }) {
  const color = type === 'flood' ? '#64B5F6' : '#FCD34D'
  const segments = 10
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: segments }, (_, i) => (
        <div key={i} style={{
          width: 12,
          height: 6,
          borderRadius: 2,
          background: i < Math.round(value / 10) ? color : 'rgba(232,245,233,0.07)',
          transition: 'background 0.3s ease',
        }} />
      ))}
    </div>
  )
}

export default function PredictionPanel() {
  return (
    <div className="bento-card" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17,
          fontWeight: 600,
          color: '#E8F5E9',
          letterSpacing: '-0.01em',
        }}>AI Risk Predictions</div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'rgba(232,245,233,0.4)',
          marginTop: 2,
        }}>ML model · Updated every 15 min</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PREDICTIONS.map((pred, i) => (
          <div key={pred.field} style={{
            padding: '16px',
            borderRadius: 10,
            border: '1px solid rgba(82,183,136,0.1)',
            background: 'rgba(232,245,233,0.02)',
            animation: `slideUp 0.5s ease-out ${i * 0.1 + 0.1}s both`,
          }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{pred.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: '#E8F5E9' }}>
                    {pred.field}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(232,245,233,0.4)' }}>
                    {pred.crop} · Horizon: {pred.horizon}
                  </div>
                </div>
              </div>
              {/* Yield impact */}
              <div style={{
                padding: '4px 10px',
                borderRadius: 6,
                background: pred.yieldImpact > 0 ? 'rgba(82,183,136,0.12)' : 'rgba(220,38,38,0.12)',
                border: `1px solid ${pred.yieldImpact > 0 ? 'rgba(82,183,136,0.3)' : 'rgba(220,38,38,0.3)'}`,
                fontFamily: 'var(--font-display)',
                fontSize: 15,
                fontWeight: 700,
                color: pred.yieldImpact > 0 ? '#86EFAC' : '#FCA5A5',
              }}>
                {pred.yieldImpact > 0 ? '+' : ''}{pred.yieldImpact}% yield
              </div>
            </div>

            {/* Risk bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(100,181,246,0.7)' }}>
                    Flood probability
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#64B5F6' }}>
                    {pred.floodProb}%
                  </span>
                </div>
                <RiskGauge value={pred.floodProb} type="flood" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(253,211,77,0.7)' }}>
                    Drought probability
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#FCD34D' }}>
                    {pred.droughtProb}%
                  </span>
                </div>
                <RiskGauge value={pred.droughtProb} type="drought" />
              </div>
            </div>

            <div style={{
              marginTop: 10,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'rgba(232,245,233,0.3)',
            }}>
              Model confidence: {pred.confidence}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
