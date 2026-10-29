import type {
  Activity,
  ActivityMode,
  ActivityOption,
  AudioStatus,
  CategoryId,
  LanguageCode,
  LocalizedText,
  MemoryPair,
  StoryStep,
  ValidationStatus,
} from '@/lib/types'

/**
 * Constructeurs typés pour la banque d'activités.
 * Objectif : garantir la cohérence (une bonne réponse et une seule, audio et
 * validation explicitement déclarés) sans réécrire chaque champ à la main.
 */

const LANGUAGES: readonly LanguageCode[] = ['fr', 'ar', 'hassaniya', 'pulaar', 'wolof']

/** Traductions absentes pour hassaniya/pulaar/wolof par défaut → signalées, jamais inventées. */
function tx(fr: string, ar: string, extras: Partial<Record<LanguageCode, string>> = {}): LocalizedText {
  return {
    fr,
    ar,
    ...extras,
    validated: ['fr', 'ar'],
  }
}

function missingAudio(): Record<LanguageCode, AudioStatus> {
  return { fr: 'missing', ar: 'missing', hassaniya: 'missing', pulaar: 'missing', wolof: 'missing' }
}

function missingValidation(): Record<LanguageCode, ValidationStatus> {
  return { fr: 'validated', ar: 'validated', hassaniya: 'needs-review', pulaar: 'needs-review', wolof: 'needs-review' }
}

export interface OptionSeed {
  readonly fr: string
  readonly ar: string
  readonly emoji: string
  readonly correct?: boolean
}

function toOptions(seeds: readonly OptionSeed[], idPrefix: string): ActivityOption[] {
  return seeds.map((seed, index) => ({
    id: `${idPrefix}-o${index + 1}`,
    emoji: seed.emoji,
    label: tx(seed.fr, seed.ar),
    isCorrect: seed.correct === true,
  }))
}

export interface ChoiceSeed {
  readonly id: string
  readonly category: CategoryId
  readonly title: { fr: string; ar: string }
  readonly instruction: { fr: string; ar: string }
  readonly explanation: { fr: string; ar: string }
  readonly objective: { fr: string; ar: string }
  readonly ageGroups: readonly ('5-7' | '8-10')[]
  readonly learningLanguages: readonly LanguageCode[]
  readonly difficulty: 1 | 2 | 3
  readonly seconds: number
  readonly skill: string
  readonly options: readonly OptionSeed[]
}

export function choiceActivity(seed: ChoiceSeed): Activity {
  return {
    id: seed.id,
    category: seed.category,
    mode: 'choice',
    title: tx(seed.title.fr, seed.title.ar),
    instruction: tx(seed.instruction.fr, seed.instruction.ar),
    explanation: tx(seed.explanation.fr, seed.explanation.ar),
    objective: tx(seed.objective.fr, seed.objective.ar),
    ageGroups: seed.ageGroups,
    learningLanguages: seed.learningLanguages,
    difficulty: seed.difficulty,
    estimatedSeconds: seed.seconds,
    skill: seed.skill,
    audioKey: seed.id,
    audio: missingAudio(),
    options: toOptions(seed.options, seed.id),
    validation: missingValidation(),
  }
}

export interface MemorySeed {
  readonly id: string
  readonly category?: CategoryId
  readonly title: { fr: string; ar: string }
  readonly instruction: { fr: string; ar: string }
  readonly explanation: { fr: string; ar: string }
  readonly objective: { fr: string; ar: string }
  readonly ageGroups: readonly ('5-7' | '8-10')[]
  readonly learningLanguages: readonly LanguageCode[]
  readonly difficulty: 1 | 2 | 3
  readonly seconds: number
  readonly skill: string
  readonly pairs: readonly { fr: string; ar: string; emoji: string }[]
}

export function memoryActivity(seed: MemorySeed): Activity {
  const pairs: MemoryPair[] = seed.pairs.map((pair, index) => ({
    id: `${seed.id}-p${index + 1}`,
    emoji: pair.emoji,
    label: tx(pair.fr, pair.ar),
  }))
  return {
    id: seed.id,
    category: seed.category ?? 'logique',
    mode: 'memory',
    title: tx(seed.title.fr, seed.title.ar),
    instruction: tx(seed.instruction.fr, seed.instruction.ar),
    explanation: tx(seed.explanation.fr, seed.explanation.ar),
    objective: tx(seed.objective.fr, seed.objective.ar),
    ageGroups: seed.ageGroups,
    learningLanguages: seed.learningLanguages,
    difficulty: seed.difficulty,
    estimatedSeconds: seed.seconds,
    skill: seed.skill,
    audioKey: seed.id,
    audio: missingAudio(),
    pairs,
    validation: missingValidation(),
  }
}

export interface StorySeed {
  readonly id: string
  readonly title: { fr: string; ar: string }
  readonly instruction: { fr: string; ar: string }
  readonly explanation: { fr: string; ar: string }
  readonly objective: { fr: string; ar: string }
  readonly ageGroups: readonly ('5-7' | '8-10')[]
  readonly learningLanguages: readonly LanguageCode[]
  readonly difficulty: 1 | 2 | 3
  readonly seconds: number
  readonly skill: string
  readonly steps: readonly {
    fr: string
    ar: string
    emoji: string
    question: { fr: string; ar: string }
    options: readonly OptionSeed[]
    explanation: { fr: string; ar: string }
  }[]
}

export function storyActivity(seed: StorySeed): Activity {
  const story: StoryStep[] = seed.steps.map((step, index) => ({
    id: `${seed.id}-s${index + 1}`,
    text: tx(step.fr, step.ar),
    emoji: step.emoji,
    question: tx(step.question.fr, step.question.ar),
    options: toOptions(step.options, `${seed.id}-s${index + 1}`),
    explanation: tx(step.explanation.fr, step.explanation.ar),
  }))
  return {
    id: seed.id,
    category: 'contes',
    mode: 'story',
    title: tx(seed.title.fr, seed.title.ar),
    instruction: tx(seed.instruction.fr, seed.instruction.ar),
    explanation: tx(seed.explanation.fr, seed.explanation.ar),
    objective: tx(seed.objective.fr, seed.objective.ar),
    ageGroups: seed.ageGroups,
    learningLanguages: seed.learningLanguages,
    difficulty: seed.difficulty,
    estimatedSeconds: seed.seconds,
    skill: seed.skill,
    audioKey: seed.id,
    audio: missingAudio(),
    story,
    validation: missingValidation(),
  }
}

/** Utilitaire de vérification utilisé par les tests et par le module de validation. */
export function activityIssues(activity: Activity): string[] {
  const issues: string[] = []
  const modes: ActivityMode[] = ['choice', 'memory', 'story']
  if (!modes.includes(activity.mode)) issues.push('mode inconnu')
  if (activity.mode === 'choice') {
    const correct = activity.options?.filter((o) => o.isCorrect) ?? []
    if (correct.length !== 1) issues.push('il faut exactement une bonne réponse')
    if ((activity.options?.length ?? 0) < 3) issues.push('au moins 3 options requises')
  }
  if (activity.mode === 'memory' && (activity.pairs?.length ?? 0) < 3) {
    issues.push('au moins 3 paires requises')
  }
  if (activity.mode === 'story') {
    if ((activity.story?.length ?? 0) < 2) issues.push('au moins 2 étapes requises')
    for (const step of activity.story ?? []) {
      if (step.options.filter((o) => o.isCorrect).length !== 1) {
        issues.push(`étape ${step.id} : une seule bonne réponse attendue`)
      }
    }
  }
  if (activity.estimatedSeconds < 120 || activity.estimatedSeconds > 420) {
    issues.push('durée hors cible 2-7 min')
  }
  if (activity.ageGroups.length === 0) issues.push('aucun groupe d’âge')
  if (activity.learningLanguages.length === 0) issues.push('aucune langue d’apprentissage')
  const langs = Object.keys(activity.validation) as LanguageCode[]
  if (langs.length !== LANGUAGES.length) issues.push('validation incomplète')
  return issues
}

export { LANGUAGES as SUPPORTED_LANGUAGES }
