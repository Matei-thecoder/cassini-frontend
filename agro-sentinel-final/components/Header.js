'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentUser, onAuthChange, signOut } from '../lib/auth'

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/map',       label: 'Map' },
  { href: '/settings',  label: 'Settings' },
]

export default function Header() {
  const [time, setTime] = useState('')
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setUser(getCurrentUser())
    const off = onAuthChange(setUser)
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => { clearInterval(id); off() }
  }, [])

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  function handleLogout() {
    signOut()
    setMenuOpen(false)
    router.push('/')
  }

  return (
    <header style={{
      background: 'linear-gradient(180deg, rgba(10,18,12,0.98) 0%, rgba(10,18,12,0.85) 100%)',
      borderBottom: '1px solid rgba(82,183,136,0.12)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
                boxShadow: '0 0 20px rgba(82,183,136,0.3)',
              }}>🌾</div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em',
                  color: '#E8F5E9', lineHeight: 1,
                }}>AgroSentinel</div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10, color: 'rgba(82,183,136,0.7)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>Field Intelligence Platform</div>
              </div>
            </div>
          </Link>

          {/* Nav — only when logged in */}
          {user && (
            <nav style={{ display: 'flex', gap: 4 }}>
              {NAV.map(tab => {
                const active = pathname?.startsWith(tab.href)
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 8,
                      background: active ? 'rgba(82,183,136,0.15)' : 'transparent',
                      color: active ? '#86EFAC' : 'rgba(232,245,233,0.5)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                      fontWeight: active ? 500 : 400,
                      textDecoration: 'none',
                      borderBottom: active ? '2px solid #52B788' : '2px solid transparent',
                      transition: 'all 0.2s ease',
                    }}
                  >{tab.label}</Link>
                )
              })}
            </nav>
          )}

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative', width: 8, height: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#52B788', boxShadow: '0 0 8px #52B788' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#52B788', animation: 'pulse-ring 2s ease-out infinite', opacity: 0.4 }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#52B788' }}>LIVE</span>
            </div>

            {/* Time */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13, color: 'rgba(232,245,233,0.4)',
              letterSpacing: '0.05em',
            }}>{mounted ? time : '--:--:--'}</div>

            {/* Auth area */}
            {!user ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/login" style={{
                  padding: '6px 14px', borderRadius: 8,
                  color: 'rgba(232,245,233,0.7)',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                  textDecoration: 'none',
                }}>Log in</Link>
                <Link href="/signup" style={{
                  padding: '6px 14px', borderRadius: 8,
                  background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
                  color: '#051009',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 0 20px rgba(82,183,136,0.25)',
                }}>Sign up</Link>
              </div>
            ) : (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2D6A4F, #1A3D2B)',
                    border: '1px solid rgba(82,183,136,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, color: '#86EFAC',
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}
                >{initials}</button>

                {menuOpen && (
                  <div style={{
                    position: 'absolute', top: 42, right: 0,
                    minWidth: 220,
                    background: 'rgba(10,18,12,0.98)',
                    border: '1px solid rgba(82,183,136,0.18)',
                    borderRadius: 12,
                    padding: 6,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(20px)',
                  }}>
                    <div style={{
                      padding: '10px 12px 12px',
                      borderBottom: '1px solid rgba(82,183,136,0.1)',
                      marginBottom: 4,
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                        color: '#E8F5E9',
                      }}>{user.name}</div>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 11,
                        color: 'rgba(232,245,233,0.5)', marginTop: 2,
                      }}>{user.email}</div>
                    </div>
                    <MenuLink href="/settings" icon="⚙" label="Settings" onClick={() => setMenuOpen(false)} />
                    <MenuLink href="/map" icon="🗺" label="All fields map" onClick={() => setMenuOpen(false)} />
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%',
                        padding: '8px 12px',
                        border: 'none', background: 'transparent',
                        color: '#FCA5A5',
                        fontFamily: 'var(--font-body)', fontSize: 13,
                        textAlign: 'left',
                        borderRadius: 8, cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ width: 16 }}>↩</span>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
    </header>
  )
}

function MenuLink({ href, icon, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', borderRadius: 8,
        color: 'rgba(232,245,233,0.75)',
        fontFamily: 'var(--font-body)', fontSize: 13,
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(82,183,136,0.08)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ width: 16 }}>{icon}</span>{label}
    </Link>
  )
}
