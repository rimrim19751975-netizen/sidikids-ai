import type {
  Activity,
  AgeGroup,
  CategoryId,
  LearnerProfile,
  ProgressSummary,
  SessionResult,
  SkillMastery,
} from './types'
import { BADGES } from '@/data/badges'

/**
 * Moteur de progression — PUR, sans stockage ni réseau, donc testable.
 * Principe pédagogique : on mesure, on n'étiquette jamais négativement un enfant.
 */

/** Seuils de difficulté, appliqués sur une fenêtre glissante de résultats. */
export const DIFFICULTY_WINDOW = 5
const UP_THRESHOLD = 0.8
const DOWN_THRESHOLD = 0.4

export function ratio(correct: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(1, Math.max(0, correct / total))
}

/** Moyenne mobile simple sur les `size` derniers résultats. */
export function recentRatio(results: readonly SessionResult[], size = DIFFICULTY_WINDOW): number {
  if (results.length === 0) return 0
  const window = results.slice(-size)
  const total = window.reduce((sum, r) => sum + r.total, 0)
  const correct = window.reduce((sum, r) => sum + r.correct, 0)
  return ratio(correct, total)
}

/**
 * Ajuste la difficulté à partir des derniers résultats d'une compétence.
 * - Bonne réussite répétée → on monte d'un cran.
 * - Réussite faible répétée → on redescend d'un cran (sans message négatif).
 * - Sinon on garde la difficulté actuelle.
 */
export function nextDifficulty(
  current: 1 | 2 | 3,
  recentResults: readonly SessionResult[],
): 1 | 2 | 3 {
  if (recentResults.length < 2) return current
  const score = recentRatio(recentResults)
  if (score >= UP_THRESHOLD && current < 3) return (current + 1) as 1 | 2 | 3
  if (score <= DOWN_THRESHOLD && current > 1) return (current - 1) as 1 | 2 | 3
  return current
}

/** Difficulté de départ d'un enfant selon son âge. */
export function startingDifficulty(ageGroup: AgeGroup): 1 | 2 | 3 {
  return ageGroup === '5-7' ? 1 : 2
}

/**
 * Agrège les résultats en compétences. Le score est pondéré par le nombre
 * d'essais (lissage de Laplace) : une seule bonne réponse ne fait pas 100 %.
 */
export function computeSkills(results: readonly SessionResult[]): SkillMastery[] {
  const bySkill = new Map<string, { attempts: number; correct: number; last: string }>()
  for (const result of results) {
    const entry = bySkill.get(result.skill) ?? { attempts: 0, correct: 0, last: result.finishedAt }
    entry.attempts += result.total
    entry.correct += result.correct
    if (result.finishedAt > entry.last) entry.last = result.finishedAt
    bySkill.set(result.skill, entry)
  }
  return [...bySkill.entries()]
    .map(([skill, entry]) => ({
      skill,
      attempts: entry.attempts,
      correct: entry.correct,
      score: (entry.correct + 1) / (entry.attempts + 2),
      lastPlayedAt: entry.last,
    }))
    .sort((a, b) => a.score - b.score)
}

export function countCompletedActivities(results: readonly SessionResult[]): number {
  return new Set(results.map((r) => r.activityId)).size
}

export function totalMinutes(results: readonly SessionResult[]): number {
  const seconds = results.reduce((sum, r) => sum + r.durationSeconds, 0)
  return Math.round(seconds / 60)
}

/** Badges réellement obtenus, vérifiés sur les résultats mesurés. */
export function earnedBadges(results: readonly SessionResult[]): string[] {
  const skills = computeSkills(results)
  return BADGES.filter((badge) => {
    switch (badge.condition.type) {
      case 'sessions':
        return results.length >= badge.condition.count
      case 'skills':
        return skills.filter((s) => s.attempts >= 5).length >= badge.condition.count
      case 'category': {
        const cat = badge.condition.category
        if (!cat) return false
        return new Set(results.filter((r) => r.category === cat).map((r) => r.activityId)).size >= badge.condition.count
      }
    }
  }).map((badge) => badge.id)
}

export function buildProgress(results: readonly SessionResult[]): ProgressSummary {
  const sorted = [...results].sort((a, b) => a.finishedAt.localeCompare(b.finishedAt))
  return {
    totalSessions: sorted.length,
    totalMinutes: totalMinutes(sorted),
    activitiesCompleted: countCompletedActivities(sorted),
    skills: computeSkills(sorted),
    badges: earnedBadges(sorted),
    history: [...sorted].reverse(),
  }
}

/** Progression par catégorie : nombre d'activités terminées / total disponible. */
export function categoryProgress(
  results: readonly SessionResult[],
  activities: readonly Activity[],
  category: CategoryId,
): { done: number; total: number; percent: number } {
  const total = activities.filter((a) => a.category === category).length
  const done = new Set(
    results.filter((r) => r.category === category).map((r) => r.activityId),
  ).size
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
}

/**
 * Recommandation d'activités. Deux sources clairement séparées dans l'interface :
 * - `measured` : activités non encore jouées dans les compétences les plus fragiles.
 * - `heuristic` : simple priorité par âge/difficulté, présentée comme une suggestion.
 * Aucun appel à un service d'IA externe n'est fait ici.
 */
export function recommendActivities(
  profile: LearnerProfile,
  results: readonly SessionResult[],
  activities: readonly Activity[],
  limit = 3,
): { activity: Activity; reason: 'weak-skill' | 'new-content' }[] {
  const eligible = activities.filter(
    (a) => a.ageGroups.includes(profile.ageGroup) && a.learningLanguages.includes(profile.learningLanguage),
  )
  const played = new Set(results.map((r) => r.activityId))
  const skills = computeSkills(results)
  const weakest = skills.slice(0, 2).map((s) => s.skill)

  const scored = eligible.map((activity) => {
    let score = 0
    if (!played.has(activity.id)) score += 2
    if (weakest.includes(activity.skill)) score += 3
    score -= activity.difficulty
    return { activity, score, reason: (weakest.includes(activity.skill) ? 'weak-skill' : 'new-content') as
      | 'weak-skill'
      | 'new-content' }
  })
  return scored
    .sort((a, b) => b.score - a.score || a.activity.id.localeCompare(b.activity.id))
    .slice(0, limit)
    .map(({ activity, reason }) => ({ activity, reason }))
}

export interface SessionAnswers {
  readonly correct: number
  readonly total: number
  readonly durationSeconds: number
}

/** Construit un résultat de session horodaté, prêt à être persisté. */
export function buildSessionResult(
  profile: LearnerProfile,
  activity: Activity,
  answers: SessionAnswers,
  difficulty: 1 | 2 | 3,
  now: Date = new Date(),
): SessionResult {
  const finishedAt = now.toISOString()
  const startedAt = new Date(now.getTime() - answers.durationSeconds * 1000).toISOString()
  return {
    id: `${profile.id}-${activity.id}-${now.getTime()}`,
    learnerId: profile.id,
    activityId: activity.id,
    category: activity.category,
    skill: activity.skill,
    startedAt,
    finishedAt,
    durationSeconds: Math.max(1, Math.round(answers.durationSeconds)),
    correct: answers.correct,
    total: answers.total,
    difficulty,
    synced: false,
  }
}
