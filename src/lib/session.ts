import type { SessionPreferences } from './types'

const SESSION_KEY = 'rasoi_session'

export function saveSession(prefs: SessionPreferences): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(prefs))
}

export function loadSession(): SessionPreferences | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}
