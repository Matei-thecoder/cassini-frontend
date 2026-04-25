// Client-side auth store (demo only — replace with real backend auth)
// Uses localStorage + a simple event bus so components can react to login/logout.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:2000'
const KEY_USER = 'agro.user'
const KEY_TOKEN = 'agro.token'

function safeStorage() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function getToken() {
  const storage = safeStorage()
  return storage?.getItem(KEY_TOKEN) || null
}

function setToken(token) {
  const storage = safeStorage()
  if (!storage) return
  storage.setItem(KEY_TOKEN, token)
}

function removeToken() {
  const storage = safeStorage()
  if (!storage) return
  storage.removeItem(KEY_TOKEN)
}

function readUsers() {
  const s = safeStorage()
  if (!s) return []
  try {
    return JSON.parse(s.getItem(KEY_USERS) || '[]')
  } catch {
    return []
  }
}

function writeUsers(users) {
  const s = safeStorage()
  if (!s) return
  s.setItem(KEY_USERS, JSON.stringify(users))
}

export function getCurrentUser() {
  const storage = safeStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(KEY_USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setCurrentUser(user) {
  const storage = safeStorage()
  if (!storage) return
  if (user) {
    storage.setItem(KEY_USER, JSON.stringify(user))
  } else {
    storage.removeItem(KEY_USER)
  }
  // ✅ Această linie este critică: anunță toate componentele că userul s-a schimbat
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('agro:auth', { detail: user }))
  }
}

export async function signUp({ name, email, password, companyName, country }) {
  if (!name || !email || !password) {
    return { ok: false, error: 'Please fill in all required fields.' }
  }
  if (password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' }
  }

  try {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, companyName, country }),
    })

    if (data.token) setToken(data.token)
    if (data.user) setCurrentUser(data.user)

    return { ok: true, user: data.user, token: data.token }
  } catch (err) {
    return { ok: false, error: err.message || 'Unable to create account.' }
  }
}

export async function signIn({ email, password }) {
  if (!email || !password) {
    return { ok: false, error: 'Email and password are required.' }
  }

  try {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (data.token) setToken(data.token)
    if (data.user) setCurrentUser(data.user)

    return { ok: true, user: data.user, token: data.token }
  } catch (err) {
    return { ok: false, error: err.message || 'Unable to sign in.' }
  }
}

export function signOut() {
  removeToken()
  setCurrentUser(null)
}

export function updateProfile(patch) {
  const current = getCurrentUser()
  if (!current) return { ok: false, error: 'Not logged in.' }

  // Facem merge între datele vechi și cele noi (patch)
  const updated = { 
    ...current, 
    ...patch,
    preferences: {
      ...(current.preferences || {}),
      ...(patch.preferences || {})
    }
  }
  
  setCurrentUser(updated) // Salvează și declanșează evenimentul agro:auth
  return { ok: true, user: updated }
}

export function onAuthChange(cb) {
  if (typeof window === 'undefined') return () => {}
  const handler = (e) => cb(e.detail)
  window.addEventListener('agro:auth', handler)
  return () => window.removeEventListener('agro:auth', handler)
}

async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const error = data?.error || data?.message || 'Request failed.'
    throw new Error(error)
  }

  return data
}
