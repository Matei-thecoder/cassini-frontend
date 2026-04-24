// Client-side auth store (demo only — replace with real backend auth)
// Uses localStorage + a simple event bus so components can react to login/logout.

const KEY_USER = 'agro.user'
const KEY_USERS = 'agro.users'

function safeStorage() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
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
  const s = safeStorage()
  if (!s) return null
  try {
    const raw = s.getItem(KEY_USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setCurrentUser(user) {
  const s = safeStorage()
  if (!s) return
  if (user) s.setItem(KEY_USER, JSON.stringify(user))
  else s.removeItem(KEY_USER)
  window.dispatchEvent(new CustomEvent('agro:auth', { detail: user }))
}

export function signUp({ name, email, password, farmName, country }) {
  if (!name || !email || !password) {
    return { ok: false, error: 'Please fill in all required fields.' }
  }
  if (password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' }
  }
  const users = readUsers()
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: 'An account with this email already exists.' }
  }
  const user = {
    id: `u_${Date.now().toString(36)}`,
    name,
    email,
    password, // demo only — never store plaintext passwords in production
    farmName: farmName || 'My Farm',
    country: country || 'Romania',
    createdAt: new Date().toISOString(),
    preferences: {
      units: 'metric',
      language: 'English',
      theme: 'dark',
      emailAlerts: true,
      pushAlerts: true,
      weeklyDigest: true,
      alertThreshold: 'moderate',
    },
  }
  users.push(user)
  writeUsers(users)
  const { password: _p, ...publicUser } = user
  setCurrentUser(publicUser)
  return { ok: true, user: publicUser }
}

export function signIn({ email, password }) {
  if (!email || !password) {
    return { ok: false, error: 'Email and password are required.' }
  }
  const users = readUsers()
  const match = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )
  if (!match) {
    return { ok: false, error: 'Invalid email or password.' }
  }
  const { password: _p, ...publicUser } = match
  setCurrentUser(publicUser)
  return { ok: true, user: publicUser }
}

export function signOut() {
  setCurrentUser(null)
}

export function updateProfile(patch) {
  const current = getCurrentUser()
  if (!current) return { ok: false, error: 'Not logged in.' }
  const users = readUsers()
  const idx = users.findIndex(u => u.id === current.id)
  if (idx === -1) return { ok: false, error: 'User not found.' }
  const updated = {
    ...users[idx],
    ...patch,
    preferences: { ...users[idx].preferences, ...(patch.preferences || {}) },
  }
  users[idx] = updated
  writeUsers(users)
  const { password: _p, ...publicUser } = updated
  setCurrentUser(publicUser)
  return { ok: true, user: publicUser }
}

export function onAuthChange(cb) {
  if (typeof window === 'undefined') return () => {}
  const handler = (e) => cb(e.detail)
  window.addEventListener('agro:auth', handler)
  return () => window.removeEventListener('agro:auth', handler)
}
