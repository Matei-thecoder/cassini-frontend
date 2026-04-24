'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import { signUp, getCurrentUser } from '../../lib/auth'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [country, setCountry] = useState('Romania')
  const [accept, setAccept] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getCurrentUser()) router.replace('/dashboard')
  }, [router])

  async function handleSubmit() {
    setError('')
    if (!accept) {
      setError('Please accept the terms to continue.')
      return
    }

    setLoading(true)

    try {
      const result = await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        companyName: companyName.trim(),
        country,
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
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
          width: '100%', maxWidth: 480,
          padding: 36,
        }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: '#52B788', letterSpacing: '0.15em', textTransform: 'uppercase',
              marginBottom: 8,
            }}>Get started</div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 28, color: '#E8F5E9', letterSpacing: '-0.02em',
              marginBottom: 6,
            }}>Create your account</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(232,245,233,0.5)' }}>
              Free during 2025. No credit card required.
            </p>
          </div>

          <FormField label="Full name" value={name} onChange={setName} placeholder="Maria Ionescu" onKeyDown={handleKey} />
          <FormField label="Email" value={email} onChange={setEmail} type="email" placeholder="you@farm.co" onKeyDown={handleKey} />
          <FormField label="Password" value={password} onChange={setPassword} type="password" placeholder="At least 6 characters" onKeyDown={handleKey} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Company Name" onKeyDown={handleKey} />
            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'rgba(232,245,233,0.5)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                marginBottom: 6,
              }}>Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={selectStyle}
              >
                {['Romania', 'Moldova', 'Bulgaria', 'Hungary', 'Poland', 'Germany', 'France', 'Spain', 'Italy', 'Other'].map(c => (
                  <option key={c} value={c} style={{ background: '#0F1E14' }}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            marginTop: 8,
            fontFamily: 'var(--font-body)', fontSize: 13,
            color: 'rgba(232,245,233,0.6)',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={accept}
              onChange={(e) => setAccept(e.target.checked)}
              style={{
                marginTop: 3,
                accentColor: '#52B788',
                cursor: 'pointer',
              }}
            />
            <span>
              I agree to the <a href="#" style={{ color: '#86EFAC', textDecoration: 'none' }}>Terms of Service</a> and{' '}
              <a href="#" style={{ color: '#86EFAC', textDecoration: 'none' }}>Privacy Policy</a>.
            </span>
          </label>

          {error && (
            <div style={{
              marginTop: 14, padding: '10px 12px',
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
          >{loading ? 'Creating account…' : 'Create account'}</button>

          <div style={{
            marginTop: 24, paddingTop: 20,
            borderTop: '1px solid rgba(82,183,136,0.1)',
            textAlign: 'center',
            fontFamily: 'var(--font-body)', fontSize: 13,
            color: 'rgba(232,245,233,0.5)',
          }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#86EFAC', textDecoration: 'none', fontWeight: 500 }}>Log in →</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

const selectStyle = {
  width: '100%',
  padding: '12px 14px', borderRadius: 8,
  background: 'rgba(5,10,7,0.6)',
  border: '1px solid rgba(82,183,136,0.15)',
  color: '#E8F5E9',
  fontFamily: 'var(--font-body)', fontSize: 14,
  outline: 'none',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2352B788' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 36,
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
