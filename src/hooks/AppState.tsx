import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { LanguageCode, LearnerProfile } from '@/lib/types'
import type { AvatarId, AgeGroup } from '@/lib/types'
import { readJson, removeKey, writeJson, STORAGE_KEYS } from '@/lib/storage'
import { buildProgress } from '@/lib/progress'
import type { ProgressSummary, SessionResult } from '@/lib/types'

export interface AppSettings {
  readonly soundEnabled: boolean
  readonly slowAudio: boolean
}

const DEFAULT_SETTINGS: AppSettings = { soundEnabled: true, slowAudio: false }

export interface NewProfileInput {
  readonly displayName: string
  readonly age: number
  readonly avatar: AvatarId
  readonly uiLanguage: LanguageCode
  readonly learningLanguage: LanguageCode
  readonly parentalConsent: boolean
}

interface AppStateValue {
  readonly profiles: readonly LearnerProfile[]
  readonly activeProfile: LearnerProfile | null
  readonly results: readonly SessionResult[]
  readonly progress: ProgressSummary
  readonly settings: AppSettings
  readonly createProfile: (input: NewProfileInput) => LearnerProfile
  readonly updateProfile: (id: string, patch: Partial<LearnerProfile>) => void
  readonly selectProfile: (id: string) => void
  readonly clearActiveProfile: () => void
  readonly addResult: (result: SessionResult) => void
  readonly deleteProfile: (id: string) => void
  readonly setSettings: (patch: Partial<AppSettings>) => void
  readonly resultsForActive: readonly SessionResult[]
}

const AppStateContext = createContext<AppStateValue | null>(null)

function ageGroupOf(age: number): AgeGroup {
  return age <= 7 ? '5-7' : '8-10'
}

export function AppStateProvider({ children }: { readonly children: ReactNode }) {
  const [profiles, setProfiles] = useState<LearnerProfile[]>(() => readJson<LearnerProfile[]>(STORAGE_KEYS.profiles, []))
  const [activeId, setActiveId] = useState<string | null>(() => readJson<string | null>(STORAGE_KEYS.activeProfile, null))
  const [results, setResults] = useState<SessionResult[]>(() => readJson<SessionResult[]>(STORAGE_KEYS.results, []))
  const [settings, setSettingsState] = useState<AppSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...readJson<Partial<AppSettings>>(STORAGE_KEYS.settings, {}),
  }))

  useEffect(() => writeJson(STORAGE_KEYS.profiles, profiles), [profiles])
  useEffect(() => writeJson(STORAGE_KEYS.activeProfile, activeId), [activeId])
  useEffect(() => writeJson(STORAGE_KEYS.results, results), [results])
  useEffect(() => writeJson(STORAGE_KEYS.settings, settings), [settings])

  const createProfile = useCallback((input: NewProfileInput): LearnerProfile => {
    const profile: LearnerProfile = {
      id: `local-${Date.now().toString(36)}`,
      displayName: input.displayName.trim(),
      age: input.age,
      ageGroup: ageGroupOf(input.age),
      avatar: input.avatar,
      uiLanguage: input.uiLanguage,
      learningLanguage: input.learningLanguage,
      classId: 'demo-local',
      createdAt: new Date().toISOString(),
      parentalConsent: input.parentalConsent,
    }
    setProfiles((prev) => [...prev, profile])
    setActiveId(profile.id)
    return profile
  }, [])

  const updateProfile = useCallback((id: string, patch: Partial<LearnerProfile>) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const merged = { ...p, ...patch }
        return { ...merged, ageGroup: ageGroupOf(merged.age) }
      }),
    )
  }, [])

  const selectProfile = useCallback((id: string) => setActiveId(id), [])
  const clearActiveProfile = useCallback(() => setActiveId(null), [])

  const addResult = useCallback((result: SessionResult) => {
    setResults((prev) => [...prev, result])
  }, [])

  const deleteProfile = useCallback((id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    setResults((prev) => prev.filter((r) => r.learnerId !== id))
    setActiveId((current) => (current === id ? null : current))
  }, [])

  const setSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...patch }))
  }, [])

  const activeProfile = useMemo(() => profiles.find((p) => p.id === activeId) ?? null, [profiles, activeId])
  const resultsForActive = useMemo(
    () => (activeProfile ? results.filter((r) => r.learnerId === activeProfile.id) : []),
    [results, activeProfile],
  )
  const progress = useMemo(() => buildProgress(resultsForActive), [resultsForActive])

  const value = useMemo<AppStateValue>(
    () => ({
      profiles,
      activeProfile,
      results,
      progress,
      settings,
      resultsForActive,
      createProfile,
      updateProfile,
      selectProfile,
      clearActiveProfile,
      addResult,
      deleteProfile,
      setSettings,
    }),
    [
      profiles,
      activeProfile,
      results,
      progress,
      settings,
      resultsForActive,
      createProfile,
      updateProfile,
      selectProfile,
      clearActiveProfile,
      addResult,
      deleteProfile,
      setSettings,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState doit être utilisé dans <AppStateProvider>')
  return ctx
}

export { removeKey }
