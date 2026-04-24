'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import { getCurrentUser, onAuthChange } from '../lib/auth'

const FEATURES = [
  {
    icon: '🛰',
    title: 'Sentinel-2 imagery',
    body: 'Daily multi-spectral passes with 10 m resolution. NDVI composites update every 2 minutes.',
    tag: 'Satellite',
  },
  {
    icon: '💧',
    title: 'Flood & drought detection',
    body: 'Physics-informed ML models flag moisture anomalies 6–14 days before visible stress.',
    tag: 'Risk',
  },
  {
    icon: '💶',
    title: 'Economic forecasting',
    body: 'Projected yield in euros per parcel, benchmarked against five-year baseline and futures prices.',
    tag: 'Yield',
  },
  {
    icon: '📡',
    title: '847 IoT sensors',
    body: 'Ground-truth soil moisture, temperature, and EC sensors correlate with satellite signals.',
    tag: 'Ground',
  },
  {
    icon: '🗺',
    title: 'Draw your own fields',
    body: 'Trace any polygon on the interactive map — we handle projection, area calculation, and monitoring.',
    tag: 'Mapping',
  },
  {
    icon: '🔔',
    title: 'Actionable alerts',
    body: 'Tunable thresholds, weekly digest, and push notifications when conditions demand attention.',
    tag: 'Alerts',
  },
]

const STATS = [
  { number: '729', unit: 'ha', label: 'monitored' },
  { number: '847', unit: '', label: 'live sensors' },
  { number: '2.4', unit: 'v', label: 'ML model' },
  { number: '48', unit: '%', label: 'optimal fields' },
]

export default function LandingPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const u = getCurrentUser()
    setUser(u)
    if (u) router.replace('/dashboard')
    const off = onAuthChange((next) => {
      setUser(next)
      if (next) router.replace('/dashboard')
    })
    return off
  }, [router])

  // Don't flash the landing page to a logged-in user
  if (user) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Header />

      {/* HERO */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 24px 120px',
        borderBottom: '1px solid rgba(82,183,136,0.08)',
      }}>
        {/* Decorative gradients */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 20% 30%, rgba(82,183,136,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(21,101,192,0.12) 0%, transparent 50%)',
        }} />
        <div style={{
          position: 'absolute', left: '50%', top: 40, transform: 'translateX(-50%)',
          width: 2, height: 2, pointerEvents: 'none',
        }}>
          <ScanSatellite />
        </div>

        <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', marginBottom: 24,
            borderRadius: 999,
            background: 'rgba(82,183,136,0.08)',
            border: '1px solid rgba(82,183,136,0.2)',
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: '#86EFAC', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#52B788', boxShadow: '0 0 6px #52B788' }} />
            Season 2025 · Q2 live
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 7vw, 76px)',
            fontWeight: 700,
            color: '#E8F5E9',
            letterSpacing: '-0.04em',
            lineHeight: 1.02,
            margin: '0 0 20px',
          }}>
            See your fields<br />
            <span style={{
              background: 'linear-gradient(135deg, #86EFAC 0%, #52B788 40%, #64B5F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>from orbit.</span>
          </h1>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 18,
            lineHeight: 1.6,
            color: 'rgba(232,245,233,0.6)',
            maxWidth: 640,
            margin: '0 auto 40px',
          }}>
            AgroSentinel fuses Sentinel-2 imagery, 847 ground sensors, and ML risk models
            into one clean dashboard — so floods, droughts, and yield drops never surprise you.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              padding: '14px 28px', borderRadius: 10,
              background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
              color: '#051009',
              fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 0 40px rgba(82,183,136,0.35)',
              transition: 'transform 0.15s ease',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              Start monitoring free
              <span>→</span>
            </Link>
            <Link href="/login" style={{
              padding: '14px 28px', borderRadius: 10,
              background: 'rgba(232,245,233,0.04)',
              border: '1px solid rgba(82,183,136,0.2)',
              color: '#E8F5E9',
              fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500,
              textDecoration: 'none',
            }}>Log in</Link>
          </div>

          {/* Stats strip */}
          <div style={{
            marginTop: 72,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            background: 'rgba(82,183,136,0.1)',
            border: '1px solid rgba(82,183,136,0.1)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {STATS.map(s => (
              <div key={s.label} style={{
                padding: '24px 16px',
                background: 'rgba(15,30,20,0.9)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 36, fontWeight: 700,
                  color: '#E8F5E9',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {s.number}<span style={{ fontSize: 18, color: 'rgba(82,183,136,0.7)', marginLeft: 2 }}>{s.unit}</span>
                </div>
                <div style={{
                  marginTop: 6,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'rgba(232,245,233,0.45)',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '96px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: '#52B788', letterSpacing: '0.15em', textTransform: 'uppercase',
            marginBottom: 12,
          }}>What you get</div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 'clamp(28px, 4vw, 44px)',
            color: '#E8F5E9', letterSpacing: '-0.03em',
          }}>Every signal, one dashboard.</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="bento-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(82,183,136,0.1)',
                  border: '1px solid rgba(82,183,136,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>{f.icon}</div>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  padding: '3px 8px', borderRadius: 4,
                  background: 'rgba(82,183,136,0.08)',
                  color: 'rgba(134,239,172,0.7)',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>{f.tag}</span>
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontWeight: 600,
                fontSize: 18, color: '#E8F5E9',
                letterSpacing: '-0.01em', marginBottom: 8,
              }}>{f.title}</h3>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 14,
                color: 'rgba(232,245,233,0.55)', lineHeight: 1.55,
              }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BIG CTA */}
      <section style={{ padding: '0 24px 120px' }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          position: 'relative', overflow: 'hidden',
          padding: '64px 40px',
          borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(45,106,79,0.35) 0%, rgba(26,61,43,0.5) 40%, rgba(21,101,192,0.25) 100%)',
          border: '1px solid rgba(82,183,136,0.2)',
          textAlign: 'center',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at top, rgba(82,183,136,0.2) 0%, transparent 60%)',
          }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'clamp(26px, 4vw, 40px)',
              color: '#E8F5E9', letterSpacing: '-0.03em',
              marginBottom: 12,
            }}>Start with a single field.</h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16, color: 'rgba(232,245,233,0.6)',
              maxWidth: 520, margin: '0 auto 32px',
            }}>
              Free during the 2025 season. Draw a polygon, we handle the rest.
              Upgrade only when you want alerts on more than three fields.
            </p>
            <Link href="/signup" style={{
              padding: '14px 32px', borderRadius: 10,
              background: '#E8F5E9',
              color: '#0F1E14',
              fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
            }}>Create free account</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '24px',
        borderTop: '1px solid rgba(82,183,136,0.08)',
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {['🛰 Sentinel-2', '📡 847 Sensors', '🤖 ML v2.4', '☁️ ECMWF'].map(i => (
              <span key={i} style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'rgba(232,245,233,0.3)',
              }}>{i}</span>
            ))}
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'rgba(232,245,233,0.2)',
          }}>AgroSentinel © 2025</span>
        </div>
      </footer>
    </div>
  )
}

function ScanSatellite() {
  return (
    <div style={{
      position: 'relative',
      width: 400,
      height: 400,
      transform: 'translate(-50%, -20%)',
      opacity: 0.4,
    }}>
      {[1, 2, 3].map((n) => (
        <div key={n} style={{
          position: 'absolute',
          inset: `${n * 40}px`,
          borderRadius: '50%',
          border: '1px solid rgba(82,183,136,0.15)',
          animation: `pulse-ring ${2 + n * 0.5}s ease-out infinite`,
          animationDelay: `${n * 0.3}s`,
        }} />
      ))}
    </div>
  )
}
