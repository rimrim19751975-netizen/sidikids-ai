import { readJson, writeJson, STORAGE_KEYS } from './storage'
import type { SessionResult } from './types'
import { getSupabaseClient } from './supabase'

/**
 * Synchronisation hors ligne → serveur.
 *
 * En mode démonstration il n'y a pas de serveur : la fonction ne « fait semblant »
 * de rien, elle renvoie 0 et laisse les résultats marqués `synced: false`.
 * En mode Supabase, les résultats en attente sont envoyés un par un vers la table
 * `session_results` (protégée par RLS), puis marqués synchronisés localement.
 */

export function countPending(): number {
  return readJson<SessionResult[]>(STORAGE_KEYS.queue, []).length
}

export function enqueueForSync(result: SessionResult): void {
  const queue = readJson<SessionResult[]>(STORAGE_KEYS.queue, [])
  if (queue.some((item) => item.id === result.id)) return
  writeJson(STORAGE_KEYS.queue, [...queue, result])
}

export async function syncPendingResults(): Promise<number> {
  const client = getSupabaseClient()
  if (!client) return 0
  const queue = readJson<SessionResult[]>(STORAGE_KEYS.queue, [])
  if (queue.length === 0) return 0

  const remaining: SessionResult[] = []
  let synced = 0
  for (const result of queue) {
    const { error } = await client.from('session_results').upsert({
      id: result.id,
      learner_id: result.learnerId,
      activity_id: result.activityId,
      category: result.category,
      skill: result.skill,
      started_at: result.startedAt,
      finished_at: result.finishedAt,
      duration_seconds: result.durationSeconds,
      correct: result.correct,
      total: result.total,
      difficulty: result.difficulty,
    })
    if (error) {
      remaining.push(result)
    } else {
      synced += 1
    }
  }
  writeJson(STORAGE_KEYS.queue, remaining)
  return synced
}
