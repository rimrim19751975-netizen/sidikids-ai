import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { DemoUser, Role } from '@/lib/types'
import { DEMO_ACCOUNTS, DEMO_PARENTS, DEMO_TEACHERS } from '@/data/demo'
import { readJson, removeKey, writeJson, STORAGE_KEYS } from '@/lib/storage'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

/**
 * Session des adultes (enseignant / parent).
 *
 * - Si Supabase est configuré, `signIn` passe par `supabase.auth.signInWithPassword`.
 * - Sinon, mode démonstration : deux comptes fictifs (voir `DEMO_ACCOUNTS`).
 * Le rôle vient de la table `profiles` côté serveur en mode réel ; en démo il vient
 * de la liste ci-dessous, et les pages protégées vérifient quand même le rôle.
 */

export type AuthMode = 'supabase' | 'demo'

export interface SessionUser extends DemoUser {
  readonly authMode: AuthMode
}

interface SessionValue {
  readonly user: SessionUser | null
  readonly role: Role | null
  readonly isAuthenticated: boolean
  readonly authMode: AuthMode
  readonly configuredWithSupabase: boolean
  readonly error: string | null
  readonly loading: boolean
  readonly signIn: (email: string, password: string) => Promise<void>
  readonly signOut: () => Promise<void>
}

const SessionContext = createContext<SessionValue | null>(null)

const DEMO_USERS: readonly DemoUser[] = [...DEMO_TEACHERS, ...DEMO_PARENTS]

function findDemoUser(email: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function SessionProvider({ children }: { readonly children: ReactNode }) {
  const configuredWithSupabase = isSupabaseConfigured()
  const [user, setUser] = useState<SessionUser | null>(() =>
    readJson<SessionUser | null>(STORAGE_KEYS.session, null),
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!configuredWithSupabase) return
    const client = getSupabaseClient()
    if (!client) return
    let cancelled = false
    void client.auth.getSession().then(({ data }) => {
      if (cancelled || !data.session) return
      const email = data.session.user.email ?? ''
      const demo = findDemoUser(email)
      setUser({
        id: data.session.user.id,
        email,
        role: demo?.role ?? 'teacher',
        displayName: demo?.displayName ?? email,
        schoolId: demo?.schoolId ?? 'school-1',
        classIds: demo?.classIds ?? [],
        childIds: demo?.childIds ?? [],
        authMode: 'supabase',
      })
    })
    return () => {
      cancelled = true
    }
  }, [configuredWithSupabase])

  useEffect(() => {
    if (user) writeJson(STORAGE_KEYS.session, user)
    else removeKey(STORAGE_KEYS.session)
  }, [user])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null)
      setLoading(true)
      try {
        if (configuredWithSupabase) {
          const client = getSupabaseClient()
          if (!client) throw new Error('supabase-unavailable')
          const { data, error: authError } = await client.auth.signInWithPassword({ email, password })
          if (authError || !data.user) {
            setError(authError?.message ?? 'invalid')
            return
          }
          const demo = findDemoUser(email)
          setUser({
            id: data.user.id,
            email,
            role: demo?.role ?? 'teacher',
            displayName: demo?.displayName ?? email,
            schoolId: demo?.schoolId ?? 'school-1',
            classIds: demo?.classIds ?? [],
            childIds: demo?.childIds ?? [],
            authMode: 'supabase',
          })
          return
        }
        const expected = DEMO_ACCOUNTS[email.toLowerCase()]
        const demo = findDemoUser(email)
        if (!expected || !demo || expected !== password) {
          setError('wrong-credentials')
          return
        }
        setUser({ ...demo, authMode: 'demo' })
      } finally {
        setLoading(false)
      }
    },
    [configuredWithSupabase],
  )

  const signOut = useCallback(async () => {
    if (configuredWithSupabase) {
      await getSupabaseClient()?.auth.signOut()
    }
    setUser(null)
  }, [configuredWithSupabase])

  const value = useMemo<SessionValue>(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: user !== null,
      authMode: configuredWithSupabase ? 'supabase' : 'demo',
      configuredWithSupabase,
      error,
      loading,
      signIn,
      signOut,
    }),
    [user, configuredWithSupabase, error, loading, signIn, signOut],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession doit être utilisé dans <SessionProvider>')
  return ctx
}

export function useAccessSubject() {
  const { user } = useSession()
  if (!user) return null
  return { id: user.id, role: user.role, classIds: user.classIds, childIds: user.childIds }
}
