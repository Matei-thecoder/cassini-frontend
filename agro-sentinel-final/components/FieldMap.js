'use client'
import { useState } from 'react'
import { SATELLITE_CELLS, FIELDS } from '../lib/data'

const CELL_COLORS = {
  flood: (i) => `rgba(21, 101, 192, ${0.4 + i * 0.5})`,
  drought: (i) => `rgba(217, 119, 6, ${0.35 + i * 0.55})`,
  healthy: (i) => `rgba(45, 106, 79, ${0.2 + i * 0.6})`,
  boundary: () => 'rgba(232, 245, 233, 0.04)',
}

export default function FieldMap({ selectedField, setSelectedField }) {
  const [hoveredCell, setHoveredCell] = useState(null)

  return (
    <div className="bento-card" style={{ padding: 24, height: '100%', minHeight: 380 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            fontWeight: 600,
            color: '#E8F5E9',
            letterSpacing: '-0.01em',
          }}>Satellite View</div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'rgba(232,245,233,0.4)',
            marginTop: 2,
          }}>NDVI composite · Updated 2 min ago</div>
        </div>
        <div style={{
          padding: '4px 10px',
          borderRadius: 6,
          background: 'rgba(82,183,136,0.1)',
          border: '1px solid rgba(82,183,136,0.2)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#52B788',
        }}>Sentinel-2</div>
      </div>

      {/* Satellite grid visualization */}
      <div style={{
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid rgba(82,183,136,0.12)',
        marginBottom: 16,
      }}>
        {/* Scan line effect */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(82,183,136,0.6), transparent)',
          animation: 'scanline 3s linear infinite',
          zIndex: 10,
          pointerEvents: 'none',
        }} />

        <div className="field-grid" style={{ padding: 4, background: 'rgba(5,10,7,0.8)' }}>
          {SATELLITE_CELLS.map((cell, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredCell(i)}
              onMouseLeave={() => setHoveredCell(null)}
              style={{
                height: 28,
                borderRadius: 2,
                background: CELL_COLORS[cell.type](cell.intensity),
                transition: 'all 0.15s ease',
                cursor: 'pointer',
                transform: hoveredCell === i ? 'scale(1.15)' : 'scale(1)',
                boxShadow: hoveredCell === i ? `0 0 8px ${
                  cell.type === 'flood' ? 'rgba(100,181,246,0.6)' :
                  cell.type === 'drought' ? 'rgba(253,211,77,0.6)' :
                  'rgba(82,183,136,0.4)'
                }` : 'none',
                zIndex: hoveredCell === i ? 5 : 1,
                position: 'relative',
              }}
            />
          ))}
        </div>

        {/* Coordinates overlay */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'rgba(232,245,233,0.4)',
          background: 'rgba(5,10,7,0.7)',
          padding: '2px 6px',
          borderRadius: 4,
        }}>47.17°N · 27.57°E</div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { color: 'rgba(45, 106, 79, 0.7)', label: 'Healthy' },
          { color: 'rgba(21, 101, 192, 0.7)', label: 'Flood Zone' },
          { color: 'rgba(217, 119, 6, 0.7)', label: 'Drought Zone' },
          { color: 'rgba(220, 38, 38, 0.5)', label: 'Critical' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(232,245,233,0.5)' }}>{label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  )
}
