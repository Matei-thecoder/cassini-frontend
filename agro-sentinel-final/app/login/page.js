'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import { signIn, getCurrentUser } from '../../lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getCurrentUser()) router.replace('/dashboard')
  }, [router])

  function handleSubmit() {
    setError('')
    setLoading(true)
    const result = signIn({ email: email.trim(), password })
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    router.push('/dashboard')
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div className="bento-card" style={{
          width: '100%', maxWidth: 440,
          padding: 36,
        }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: '#52B788', letterSpacing: '0.15em', textTransform: 'uppercase',
              marginBottom: 8,
            }}>Welcome back</div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 28, color: '#E8F5E9', letterSpacing: '-0.02em',
              marginBottom: 6,
            }}>Log in to AgroSentinel</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(232,245,233,0.5)' }}>
              Pick up where you left off — your fields are waiting.
            </p>
          </div>

          <FormField label="Email" value={email} onChange={setEmail} type="email" placeholder="you@farm.co" onKeyDown={handleKey} />
          <FormField label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" onKeyDown={handleKey} />

          {error && (
            <div style={{
              marginTop: 12, padding: '10px 12px',
              borderRadius: 8,
              background: 'rgba(220,38,38,0.08)',
              border: '1px solid rgba(220,38,38,0.25)',
              color: '#FCA5A5',
              fontFamily: 'var(--font-body)', fontSize: 13,
            }}>⚠ {error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              marginTop: 20,
              width: '100%',
              padding: '12px 20px', borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
              color: '#051009',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 0 30px rgba(82,183,136,0.25)',
            }}
          >{loading ? 'Signing in…' : 'Log in'}</button>

          <div style={{
            marginTop: 24, paddingTop: 20,
            borderTop: '1px solid rgba(82,183,136,0.1)',
            textAlign: 'center',
            fontFamily: 'var(--font-body)', fontSize: 13,
            color: 'rgba(232,245,233,0.5)',
          }}>
            New here?{' '}
            <Link href="/signup" style={{
              color: '#86EFAC', textDecoration: 'none', fontWeight: 500,
            }}>Create an account →</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

function FormField({ label, value, onChange, type = 'text', placeholder, onKeyDown }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block',
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'rgba(232,245,233,0.5)',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        marginBottom: 6,
      }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 14px', borderRadius: 8,
          background: 'rgba(5,10,7,0.6)',
          border: '1px solid rgba(82,183,136,0.15)',
          color: '#E8F5E9',
          fontFamily: 'var(--font-body)', fontSize: 14,
          outline: 'none',
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(82,183,136,0.4)'}
        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(82,183,136,0.15)'}
      />
    </div>
  )
}
