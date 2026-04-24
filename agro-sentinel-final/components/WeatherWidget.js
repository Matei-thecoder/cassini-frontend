'use client'
import { WEATHER_FORECAST } from '../lib/data'

export default function WeatherWidget() {
  return (
    <div className="bento-card" style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17,
          fontWeight: 600,
          color: '#E8F5E9',
          letterSpacing: '-0.01em',
        }}>Weather Forecast</div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'rgba(232,245,233,0.4)',
          marginTop: 2,
        }}>Iași, Romania · 5-day outlook</div>
      </div>

      {/* Current conditions */}
      <div style={{
        padding: '16px',
        borderRadius: 10,
        background: 'rgba(21,101,192,0.12)',
        border: '1px solid rgba(100,181,246,0.2)',
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 36 }}>🌧</div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: '#93C5FD',
            marginTop: 4,
          }}>Heavy rain · Wind 22km/h</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            fontWeight: 700,
            color: '#E8F5E9',
            lineHeight: 1,
          }}>14°</div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: '#64B5F6',
            marginTop: 4,
          }}>78% precipitation</div>
        </div>
      </div>

      {/* 5-day forecast */}
      <div style={{ display: 'flex', gap: 8 }}>
        {WEATHER_FORECAST.map((day, i) => (
          <div key={day.day} style={{
            flex: 1,
            textAlign: 'center',
            padding: '10px 4px',
            borderRadius: 8,
            background: i === 0 ? 'rgba(100,181,246,0.1)' : 'rgba(232,245,233,0.03)',
            border: `1px solid ${i === 0 ? 'rgba(100,181,246,0.2)' : 'rgba(82,183,136,0.08)'}`,
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'rgba(232,245,233,0.4)',
              marginBottom: 6,
            }}>{day.day}</div>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{day.icon}</div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 600,
              color: '#E8F5E9',
            }}>{day.temp}°</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: day.precip > 50 ? '#64B5F6' : 'rgba(232,245,233,0.3)',
              marginTop: 4,
            }}>{day.precip}%</div>
          </div>
        ))}
      </div>

      {/* Flood warning */}
      <div style={{
        marginTop: 14,
        padding: '10px 14px',
        borderRadius: 8,
        background: 'rgba(21,101,192,0.12)',
        border: '1px solid rgba(100,181,246,0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>🌊</span>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#93C5FD', fontWeight: 500 }}>
            Flood Risk — Next 48h
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(147,197,253,0.6)', marginTop: 2 }}>
            78mm predicted · East Basin Delta at risk
          </div>
        </div>
      </div>
    </div>
  )
}
