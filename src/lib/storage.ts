/**
 * Persistance locale (mode démonstration et file d'attente hors ligne).
 * Aucune donnée sensible : prénom d'affichage, résultats, réglages.
 */

export const STORAGE_KEYS = {
  profiles: 'sidikids.profiles.v1',
  activeProfile: 'sidikids.activeProfile.v1',
  results: 'sidikids.results.v1',
  settings: 'sidikids.settings.v1',
  session: 'sidikids.session.v1',
  demoData: 'sidikids.demoData.v1',
  queue: 'sidikids.syncQueue.v1',
} as const

function hasStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch {
    return false
  }
}

export function readJson<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson<T>(key: string, value: T): void {
  if (!hasStorage()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota plein ou navigation privée : on ne casse pas l'expérience de jeu.
  }
}

export function removeKey(key: string): void {
  if (!hasStorage()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignoré volontairement
  }
}
