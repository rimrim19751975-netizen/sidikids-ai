import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Client Supabase unique, créé uniquement si les deux variables d'environnement
 * sont présentes. Aucune clé n'est écrite en dur : voir `.env.example`.
 */
let client: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  const mode = (import.meta.env.VITE_APP_MODE as string | undefined) ?? 'auto'
  if (mode === 'demo') return false
  return Boolean(url && key)
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (client) return client
  client = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    { auth: { persistSession: true, autoRefreshToken: true } },
  )
  return client
}

export const APP_MODE: 'demo' | 'supabase' = isSupabaseConfigured() ? 'supabase' : 'demo'
