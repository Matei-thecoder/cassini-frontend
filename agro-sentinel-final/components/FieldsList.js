/*'use client'
import { FIELDS } from '../lib/data'
import { useRouter } from 'next/navigation'

const STATUS_CONFIG = {
  healthy: { label: 'Optimal', className: 'status-healthy', dot: '#52B788' },
  flood: { label: 'Flood Risk', className: 'status-flood', dot: '#64B5F6' },
  drought: { label: 'Drought', className: 'status-drought', dot: '#FCD34D' },
  alert: { label: 'Warning', className: 'status-alert', dot: '#FCA5A5' },
}

const CROP_ICONS = {
  Wheat: '🌾',
  Corn: '🌽',
  Sunflower: '🌻',
  Soybean: '🫘',
  Barley: '🌿',
}

function MoistureBar({ value, type }) {
  const color = value > 80 ? '#64B5F6' : value < 30 ? '#FCD34D' : '#52B788'
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(232,245,233,0.4)' }}>
          SOIL MOISTURE
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color }}>
          {value}%
        </span>
      </div>
      <div style={{
        height: 4,
        borderRadius: 2,
        background: 'rgba(232,245,233,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 2,
          transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  )
}

export default function FieldsList({ selectedField, setSelectedField }) {
  const router = useRouter()
  return (
    <div className="bento-card" style={{ padding: 24, height: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17,
          fontWeight: 600,
          color: '#E8F5E9',
          letterSpacing: '-0.01em',
        }}>Active Fields</div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'rgba(232,245,233,0.4)',
          marginTop: 2,
        }}>{FIELDS.length} monitored parcels</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {FIELDS.map((field, i) => {
          const status = STATUS_CONFIG[field.status]
          const isSelected = selectedField === field.id

          return (
            <div
              key={field.id}
              onClick={() => setSelectedField(isSelected ? null : field.id)}
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                border: `1px solid ${isSelected ? 'rgba(82,183,136,0.4)' : 'rgba(82,183,136,0.1)'}`,
                background: isSelected
                  ? 'rgba(82,183,136,0.08)'
                  : 'rgba(232,245,233,0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                animation: `slideUp 0.5s ease-out ${0.05 * i + 0.2}s both`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{CROP_ICONS[field.crop] || '🌱'}</span>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      fontSize: 14,
                      color: '#E8F5E9',
                      lineHeight: 1.2,
                    }}>{field.name}</div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'rgba(232,245,233,0.4)',
                      marginTop: 2,
                    }}>{field.crop} · {field.area} ha</div>
                  </div>
                </div>
                <span className={status.className} style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  whiteSpace: 'nowrap',
                }}>
                  <div style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: status.dot,
                    boxShadow: `0 0 4px ${status.dot}`,
                  }} />
                  {status.label}
                </span>
              </div>

              <MoistureBar value={field.soilMoisture} type={field.status} />

              {field.alert && (
                <div style={{
                  marginTop: 10,
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: 'rgba(220,38,38,0.08)',
                  border: '1px solid rgba(220,38,38,0.2)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  color: '#FCA5A5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <span>⚠️</span>
                  {field.alert}
                </div>
              )}

              {isSelected && (
                <div style={{
                  marginTop: 12,
                  display: 'flex',
                  gap: 16,
                  paddingTop: 12,
                  borderTop: '1px solid rgba(82,183,136,0.1)',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(232,245,233,0.4)' }}>NDVI</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#52B788' }}>
                      {field.ndvi}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(232,245,233,0.4)' }}>LAT/LNG</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.6)', marginTop: 4 }}>
                      {field.lat}° · {field.lng}°
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(232,245,233,0.4)' }}>UPDATED</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.6)', marginTop: 4 }}>
                      {field.lastUpdated}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <div style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(82,183,136,0.08)', // Subtle separator
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => router.push('/dashboard/add-field')}
          style={{
            width: '100%', // Full width to act as a clear footer action
            background: 'rgba(82,183,136,0.05)',
            border: '1px solid rgba(82,183,136,0.2)',
            color: '#52B788',
            padding: '12px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(82,183,136,0.15)';
            e.currentTarget.style.borderColor = 'rgba(82,183,136,0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(82,183,136,0.05)';
            e.currentTarget.style.borderColor = 'rgba(82,183,136,0.2)';
          }}
        >
          <span style={{ fontSize: '14px' }}>+</span> ADD NEW FIELD
        </button>
      </div>
    </div>
  )
}*/
'use client'
import { useRouter } from 'next/navigation'

const STATUS_CONFIG = {
  healthy: { label: 'Optimal', className: 'status-healthy', dot: '#52B788' },
  flood: { label: 'Flood Risk', className: 'status-flood', dot: '#64B5F6' },
  drought: { label: 'Drought', className: 'status-drought', dot: '#FCD34D' },
  alert: { label: 'Warning', className: 'status-alert', dot: '#FCA5A5' },
}

const CROP_ICONS = {
  Wheat: '🌾',
  Corn: '🌽',
  Sunflower: '🌻',
  Soybean: '🫘',
  Barley: '🌿',
}

function MoistureBar({ value, type }) {
  const safeValue = value || 0;
  const color = safeValue > 80 ? '#64B5F6' : safeValue < 30 ? '#FCD34D' : '#52B788'
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(232,245,233,0.4)' }}>
          SOIL MOISTURE
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color }}>
          {safeValue}%
        </span>
      </div>
      <div style={{
        height: 4,
        borderRadius: 2,
        background: 'rgba(232,245,233,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${safeValue}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 2,
          transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  )
}
function computeArea(bounds)
{
  if (!bounds) return null;
  return (Math.abs((bounds.maxlat - bounds.minlat) * (bounds.maxlon - bounds.minlon)) * 12365).toFixed(2); // Rough conversion to hectares

}
export default function FieldsList({ fields = [], setFields, selectedField, setSelectedField }) {
  const router = useRouter()

  const deleteField = async (e, id) => {
    e.stopPropagation(); // Stops the card from expanding when you click delete
    
    if (!window.confirm("Are you sure you want to delete this field? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem('agro.token');
      const response = await fetch(`http://localhost:2000/api/fields/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setFields(prevFields => prevFields.filter(f => f.id !== id));
        if (selectedField === id) setSelectedField(null);
      } else {
        alert("Failed to delete the field from the server.");
      }
    } catch (err) {
      alert("Error connecting to server. Is your backend running?");
    }
  };

  return (
    <div className="bento-card" style={{ padding: 24, height: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17,
          fontWeight: 600,
          color: '#E8F5E9',
          letterSpacing: '-0.01em',
        }}>Active Fields</div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'rgba(232,245,233,0.4)',
          marginTop: 2,
        }}>
          {fields.length} monitored parcels
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {fields.map((field, i) => {
          const statusKey = field.status || 'healthy' 
          const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.healthy
          const isSelected = selectedField === field.id
          const cropName = field.crop_type || field.crop || 'Unknown'

          return (
            <div
              key={field.id}
              onClick={() => setSelectedField(isSelected ? null : field.id)}
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                border: `1px solid ${isSelected ? 'rgba(82,183,136,0.4)' : 'rgba(82,183,136,0.1)'}`,
                background: isSelected
                  ? 'rgba(82,183,136,0.08)'
                  : 'rgba(232,245,233,0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                animation: `slideUp 0.5s ease-out ${0.05 * i + 0.2}s both`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{CROP_ICONS[cropName] || '🌱'}</span>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      fontSize: 14,
                      color: '#E8F5E9',
                      lineHeight: 1.2,
                    }}>{field.name}</div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'rgba(232,245,233,0.4)',
                      marginTop: 2,
                    }}>{cropName} · {computeArea(field.bounds) || '--'} ha</div>
                  </div>
                </div>
                
                {/* 🔴 MOVED THE OBVIOUS DELETE BUTTON HERE */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span className={status.className} style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    whiteSpace: 'nowrap',
                  }}>
                    <div style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: status.dot,
                      boxShadow: `0 0 4px ${status.dot}`,
                    }} />
                    {status.label}
                  </span>

                  {/* Always-visible styled red button */}
                  <button
                    onClick={(e) => deleteField(e, field.id)}
                    style={{
                      background: 'rgba(220,38,38,0.1)',
                      border: '1px solid rgba(220,38,38,0.3)',
                      color: '#FCA5A5',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(220,38,38,0.2)';
                      e.currentTarget.style.borderColor = '#FCA5A5';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(220,38,38,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)';
                    }}
                    title="Delete Field"
                  >
                    🗑️ DELETE
                  </button>
                </div>
              </div>

              <MoistureBar value={field.soilMoisture || 65} type={statusKey} />

              {field.alert && (
                <div style={{
                  marginTop: 10,
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: 'rgba(220,38,38,0.08)',
                  border: '1px solid rgba(220,38,38,0.2)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  color: '#FCA5A5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <span>⚠️</span>
                  {field.alert}
                </div>
              )}

              {isSelected && (
                <div style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid rgba(82,183,136,0.1)',
                }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(232,245,233,0.4)' }}>NDVI</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#52B788' }}>
                        {field.ndvi || '0.75'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(232,245,233,0.4)' }}>LAT/LNG</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.6)', marginTop: 4 }}>
                        {field.bounds.maxlat || '--'}° · {field.bounds.maxlon || '--'}°
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(232,245,233,0.4)' }}>UPDATED</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(232,245,233,0.6)', marginTop: 4 }}>
                        {field.lastUpdated || 'Just now'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <div style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(82,183,136,0.08)',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => router.push('/dashboard/add-field')}
          style={{
            width: '100%',
            background: 'rgba(82,183,136,0.05)',
            border: '1px solid rgba(82,183,136,0.2)',
            color: '#52B788',
            padding: '12px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(82,183,136,0.15)';
            e.currentTarget.style.borderColor = 'rgba(82,183,136,0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(82,183,136,0.05)';
            e.currentTarget.style.borderColor = 'rgba(82,183,136,0.2)';
          }}
        >
          <span style={{ fontSize: '14px' }}>+</span> ADD NEW FIELD
        </button>
      </div>
    </div>
  )
}