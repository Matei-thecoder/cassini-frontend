'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, onAuthChange } from '../lib/auth'

export default function AuthGuard({ children }) {
  const router = useRouter()
  const [status, setStatus] = useState('guest') // checking | authed | guest

  useEffect(() => {
    const u = getCurrentUser()
    if (u) setStatus('authed')
    else {
      setStatus('guest')//guest
      router.replace('/login')//login*/
    }
    const off = onAuthChange((user) => {
      if (user) setStatus('authed')
      else { setStatus('guest')/*guest*/; router.replace('/login')/*login*/  }
    })
    return off
  }, [router])

  if (status !== 'authed') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'rgba(82,183,136,0.6)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>Verifying session…</div>
      </div>
    )
  }

  return children
}
