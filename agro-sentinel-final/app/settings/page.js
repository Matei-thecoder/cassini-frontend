'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '../../components/AuthGuard'
import Header from '../../components/Header'
import { getCurrentUser, updateProfile, signOut } from '../../lib/auth'

export default function SettingsPage() {
  return (
    <AuthGuard>
      <Settings />
    </AuthGuard>
  )
}

const SECTIONS = [
  { id: 'profile',       label: 'Profile',       icon: '👤' },
  { id: 'preferences',   label: 'Preferences',   icon: '⚙' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'account',       label: 'Account',       icon: '🔐' },
]

function Settings() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [active, setActive] = useState('profile')
  const [draft, setDraft] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const u = getCurrentUser()
    setUser(u)
    setDraft(u)
  }, [])

  if (!user || !draft) return null

  function save() {
    const result = updateProfile({
      name: draft.name,
      companyName: draft.companyName,
      country: draft.country,
      preferences: draft.preferences,
    })
    if (result.ok) {
      setUser(result.user)
      setDraft(result.user)
      flash('Saved')
    } else {
      flash(result.error || 'Failed to save', true)
    }
  }

  function flash(msg, err = false) {
    setToast({ msg, err })
    setTimeout(() => setToast(null), 2600)
  }

  function setPref(key, value) {
    setDraft(d => ({ ...d, preferences: { ...d.preferences, [key]: value } }))
  }

  function handleLogout() {
    signOut()
    router.push('/')
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(user)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Header />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: '#52B788', letterSpacing: '0.15em', textTransform: 'uppercase',
            marginBottom: 8,
          }}>Account</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
            color: '#E8F5E9', letterSpacing: '-0.03em',
          }}>Settings</h1>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: 24,
          alignItems: 'flex-start',
        }}>
          {/* Side nav */}
          <div className="bento-card" style={{ padding: 10, position: 'sticky', top: 84 }}>
            {SECTIONS.map(s => {
              const isActive = active === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 12px',
                    border: 'none', borderRadius: 8,
                    background: isActive ? 'rgba(82,183,136,0.12)' : 'transparent',
                    color: isActive ? '#86EFAC' : 'rgba(232,245,233,0.65)',
                    fontFamily: 'var(--font-body)', fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                    textAlign: 'left', cursor: 'pointer',
                  }}
                >
                  <span style={{ width: 18 }}>{s.icon}</span>
                  {s.label}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {active === 'profile' && (
              <Card title="Profile" subtitle="Your basic account information.">
                <Row>
                  <Field label="Full name" value={draft.name} onChange={v => setDraft(d => ({ ...d, name: v }))} />
                  <Field label="Email" value={draft.email} disabled hint="Email cannot be changed in demo mode" />
                </Row>
                <Row>
                  <Field label="Company name" value={draft.companyName} onChange={v => setDraft(d => ({ ...d, companyName: v }))} />
                  <FieldSelect
                    label="Country"
                    value={draft.country}
                    onChange={v => setDraft(d => ({ ...d, country: v }))}
                    options={['Romania','Moldova','Bulgaria','Hungary','Poland','Germany','France','Spain','Italy','Other']}
                  />
                </Row>
                <Row>
                  <Field
                    label="Account ID"
                    value={draft.id}
                    disabled mono
                  />
                  <Field
                    label="Created"
                    value={new Date(draft.createdAt).toLocaleDateString()}
                    disabled
                  />
                </Row>
              </Card>
            )}
            {/*}
            {active === 'preferences' && (
              <Card title="Preferences" subtitle="How data shows up across the app.">
                <Row>
                  <FieldSelect
                    label="Units"
                    value={draft.preferences.units}
                    onChange={v => setPref('units', v)}
                    options={[
                      { value: 'metric', label: 'Metric (ha · mm · °C)' },
                      { value: 'imperial', label: 'Imperial (ac · in · °F)' },
                    ]}
                  />
                  <FieldSelect
                    label="Language"
                    value={draft.preferences.language}
                    onChange={v => setPref('language', v)}
                    options={['English', 'Română', 'Français', 'Deutsch', 'Español']}
                  />
                </Row>
                <Row>
                  <FieldSelect
                    label="Theme"
                    value={draft.preferences.theme}
                    onChange={v => setPref('theme', v)}
                    options={[
                      { value: 'dark', label: 'Dark (default)' },
                      { value: 'auto', label: 'Auto (system)' },
                    ]}
                  />
                  <FieldSelect
                    label="Alert threshold"
                    value={draft.preferences.alertThreshold}
                    onChange={v => setPref('alertThreshold', v)}
                    options={[
                      { value: 'lenient', label: 'Lenient — fewer alerts' },
                      { value: 'moderate', label: 'Moderate (recommended)' },
                      { value: 'strict', label: 'Strict — more alerts' },
                    ]}
                  />
                </Row>
              </Card>
            )}

            {active === 'notifications' && (
              <Card title="Notifications" subtitle="Choose what reaches your inbox and phone.">
                <Toggle
                  label="Email alerts"
                  hint="Critical flood, drought, and pest warnings."
                  value={draft.preferences.emailAlerts}
                  onChange={v => setPref('emailAlerts', v)}
                />
                <Toggle
                  label="Push notifications"
                  hint="Mobile push for urgent field events."
                  value={draft.preferences.pushAlerts}
                  onChange={v => setPref('pushAlerts', v)}
                />
                <Toggle
                  label="Weekly digest"
                  hint="Every Monday morning: yield, moisture trends, forecast."
                  value={draft.preferences.weeklyDigest}
                  onChange={v => setPref('weeklyDigest', v)}
                />
              </Card>
            )}
            */}
            {active === 'preferences' && (
            <Card title="Preferences" subtitle="Customize how environmental data is displayed.">
              <Row>
                <FieldSelect
                  label="Measurement Units"
                  value={draft.preferences?.units || 'metric'}
                  onChange={v => setPref('units', v)}
                  options={[
                    { value: 'metric', label: 'Metric (Hectares, mm, °C)' },
                    { value: 'imperial', label: 'Imperial (Acres, in, °F)' },
                  ]}
                />
                <FieldSelect
                  label="Default Map Style"
                  value={draft.preferences?.mapStyle || 'satellite'}
                  onChange={v => setPref('mapStyle', v)}
                  options={[
                    { value: 'satellite', label: 'Satellite Imagery' },
                    { value: 'terrain', label: 'Terrain / Topographic' },
                    { value: 'hybrid', label: 'Hybrid View' },
                  ]}
                />
              </Row>

              <Row>
                <FieldSelect
                  label="Language"
                  value={draft.preferences?.language || 'English'}
                  onChange={v => setPref('language', v)}
                  options={['English', 'Română', 'Deutsch', 'Français']}
                />
                <FieldSelect
                  label="Data Refresh Rate"
                  value={draft.preferences?.refreshRate || '1h'}
                  onChange={v => setPref('refreshRate', v)}
                  options={[
                    { value: '1h', label: 'Every hour' },
                    { value: '6h', label: 'Every 6 hours' },
                  ]}
                />
              </Row>

              <div style={{ marginTop: 8 }}>
                <label style={labelStyle}>Soil Moisture Alert Threshold ({draft.preferences?.moistureThreshold || 20}%)</label>
                <input 
                  type="range" 
                  min="5" max="50" 
                  value={draft.preferences?.moistureThreshold || 20}
                  onChange={(e) => setPref('moistureThreshold', e.target.value)}
                  style={{
                    width: '100%',
                    accentColor: '#52B788',
                    background: 'rgba(82,183,136,0.1)',
                    height: 6,
                    borderRadius: 3,
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: 'rgba(232,245,233,0.3)' }}>Dry (5%)</span>
                  <span style={{ fontSize: 10, color: 'rgba(232,245,233,0.3)' }}>Optimal (50%)</span>
                </div>
              </div>
            </Card>
          )}

            {active === 'notifications' && (
              <Card title="Notifications" subtitle="Choose what reaches your inbox and phone.">
                <div style={{
                  padding: '20px 16px',
                  borderRadius: 10,
                  background: 'rgba(82,183,136,0.04)',
                  border: '1px solid rgba(82,183,136,0.2)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                    color: '#86EFAC',
                  }}>🚧 Not working yet</div>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: 12,
                    color: 'rgba(232,245,233,0.5)', marginTop: 4,
                  }}>Notification settings are coming soon.</div>
                </div>
              </Card>
            )}
            {active === 'account' && (
              <>
                <Card title="Session" subtitle="You're signed in on this device.">
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 16,
                  }}>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                        color: '#E8F5E9',
                      }}>{user.email}</div>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 11,
                        color: 'rgba(232,245,233,0.5)', marginTop: 4,
                      }}>
                        Signed in · session stored locally
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      style={secondaryBtn}
                    >Sign out</button>
                  </div>
                </Card>

                <Card title="Danger zone" subtitle="These actions can't be undone." danger>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: 'rgba(220,38,38,0.04)',
                    border: '1px solid rgba(220,38,38,0.2)',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#FCA5A5', fontWeight: 500 }}>
                        Delete account
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(252,165,165,0.7)', marginTop: 2 }}>
                        Permanently erase this account and all associated field data.
                      </div>
                    </div>
                    <button
                      onClick={() => flash('Demo mode — account deletion disabled', true)}
                      style={dangerBtn}
                    >Delete</button>
                  </div>
                </Card>
              </>
            )}

            {/* Save bar */}
            {dirty && active !== 'account' && (
              <div style={{
                position: 'sticky', bottom: 16, alignSelf: 'stretch',
                padding: '14px 16px',
                borderRadius: 12,
                background: 'rgba(10,18,12,0.95)',
                border: '1px solid rgba(82,183,136,0.25)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: '#86EFAC', letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>● Unsaved changes</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setDraft(user)} style={secondaryBtn}>Discard</button>
                  <button onClick={save} style={primaryBtn}>Save changes</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          padding: '12px 18px', borderRadius: 10,
          background: toast.err ? 'rgba(220,38,38,0.15)' : 'rgba(45,106,79,0.2)',
          border: `1px solid ${toast.err ? 'rgba(220,38,38,0.4)' : 'rgba(82,183,136,0.4)'}`,
          color: toast.err ? '#FCA5A5' : '#86EFAC',
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
          backdropFilter: 'blur(12px)',
          zIndex: 100,
          animation: 'slideUp 0.2s ease-out',
        }}>{toast.err ? '⚠ ' : '✓ '}{toast.msg}</div>
      )}
    </div>
  )
}

// ----- small building blocks -----

function Card({ title, subtitle, children, danger }) {
  return (
    <div className="bento-card" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600,
          color: danger ? '#FCA5A5' : '#E8F5E9',
          letterSpacing: '-0.01em',
        }}>{title}</div>
        {subtitle && (
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 13,
            color: 'rgba(232,245,233,0.5)', marginTop: 4,
          }}>{subtitle}</div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  )
}

function Row({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, disabled, hint, mono }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        style={{
          ...inputStyle,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
          fontSize: mono ? 12 : 14,
        }}
        onFocus={(e) => !disabled && (e.currentTarget.style.borderColor = 'rgba(82,183,136,0.4)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(82,183,136,0.15)')}
      />
      {hint && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'rgba(232,245,233,0.35)', marginTop: 4,
        }}>{hint}</div>
      )}
    </div>
  )
}

function FieldSelect({ label, value, onChange, options }) {
  const opts = options.map(o => typeof o === 'string' ? { value: o, label: o } : o)
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
        {opts.map(o => (
          <option key={o.value} value={o.value} style={{ background: '#0F1E14' }}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function Toggle({ label, hint, value, onChange }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 16px',
      borderRadius: 10,
      background: 'rgba(232,245,233,0.02)',
      border: '1px solid rgba(82,183,136,0.1)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
          color: '#E8F5E9',
        }}>{label}</div>
        {hint && (
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 12,
            color: 'rgba(232,245,233,0.5)', marginTop: 3,
          }}>{hint}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          position: 'relative',
          width: 42, height: 24,
          borderRadius: 999,
          border: 'none',
          background: value ? '#52B788' : 'rgba(232,245,233,0.15)',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
          boxShadow: value ? '0 0 12px rgba(82,183,136,0.4)' : 'none',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 2, left: value ? 20 : 2,
          width: 20, height: 20,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-mono)', fontSize: 10,
  color: 'rgba(232,245,233,0.5)',
  letterSpacing: '0.12em', textTransform: 'uppercase',
  marginBottom: 6,
}
const inputStyle = {
  width: '100%',
  padding: '12px 14px', borderRadius: 8,
  background: 'rgba(5,10,7,0.6)',
  border: '1px solid rgba(82,183,136,0.15)',
  color: '#E8F5E9',
  fontFamily: 'var(--font-body)', fontSize: 14,
  outline: 'none',
}
const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2352B788' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 36,
}
const primaryBtn = {
  padding: '10px 18px', borderRadius: 8,
  border: 'none',
  background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
  color: '#051009',
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
  cursor: 'pointer',
}
const secondaryBtn = {
  padding: '10px 18px', borderRadius: 8,
  background: 'rgba(232,245,233,0.04)',
  border: '1px solid rgba(82,183,136,0.2)',
  color: '#E8F5E9',
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
  cursor: 'pointer',
}
const dangerBtn = {
  padding: '10px 18px', borderRadius: 8,
  background: 'rgba(220,38,38,0.12)',
  border: '1px solid rgba(220,38,38,0.3)',
  color: '#FCA5A5',
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
  cursor: 'pointer',
}
