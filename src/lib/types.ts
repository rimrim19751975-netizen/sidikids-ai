/**
 * Types du domaine SIDIKIDS AI.
 *
 * Règles de conception :
 * - Les langues d'interface et d'apprentissage sont distinctes (`ui` vs `learning`).
 * - Toute traduction ou audio non validé par un locuteur natif est marqué comme tel.
 *   On ne prétend jamais qu'un contenu a été relu s'il ne l'a pas été.
 * - Aucune donnée identifiante d'enfant ne circule dans les types destinés aux
 *   services IA : `LearnerProfile` ne contient qu'un prénom d'affichage facultatif.
 */

/** Codes de langue supportés par l'application. */
export type LanguageCode = 'fr' | 'ar' | 'hassaniya' | 'pulaar' | 'wolof'

/** Les trois langues qui exigent une validation humaine avant usage scolaire. */
export type LocalLanguageCode = 'hassaniya' | 'pulaar' | 'wolof'

export type Direction = 'ltr' | 'rtl'

export type AgeGroup = '5-7' | '8-10'

/** Statut de qualité linguistique d'un contenu. */
export type ValidationStatus = 'validated' | 'needs-review' | 'missing'

/** États d'un audio : un audio jamais enregistré n'est pas « en chargement ». */
export type AudioStatus = 'validated' | 'pending' | 'missing'

export type CategoryId =
  | 'math'
  | 'alphabet'
  | 'safari'
  | 'detective'
  | 'sciences'
  | 'logique'
  | 'contes'
  | 'missions'

/** Modes d'exercice réellement implémentés par le moteur de jeu. */
export type ActivityMode = 'choice' | 'memory' | 'story'

export interface LocalizedText {
  readonly fr: string
  /** Arabe standard. Absent = traduction manquante (jamais inventée). */
  readonly ar?: string
  readonly hassaniya?: string
  readonly pulaar?: string
  readonly wolof?: string
  /**
   * Langues dont le texte a été relu par un locuteur natif. Une langue absente de
   * cette liste est affichée avec un badge « à valider » dans l'interface enfant.
   */
  readonly validated: readonly LanguageCode[]
}

export interface ActivityOption {
  readonly id: string
  /** Emoji utilisé comme pictogramme : lisible sans savoir lire. */
  readonly emoji: string
  readonly label: LocalizedText
  readonly isCorrect: boolean
}

export interface MemoryPair {
  readonly id: string
  readonly emoji: string
  readonly label: LocalizedText
}

export interface StoryStep {
  readonly id: string
  readonly text: LocalizedText
  readonly emoji: string
  readonly question: LocalizedText
  readonly options: readonly ActivityOption[]
  readonly explanation: LocalizedText
}

export interface Activity {
  readonly id: string
  readonly category: CategoryId
  readonly mode: ActivityMode
  readonly title: LocalizedText
  /** Consigne audio et texte. Un audio manquant affiche la consigne écrite. */
  readonly instruction: LocalizedText
  /** Correction expliquée, toujours affichée après la réponse. */
  readonly explanation: LocalizedText
  /** Objectif pédagogique, visible par l'enseignant (pas par l'enfant). */
  readonly objective: LocalizedText
  readonly ageGroups: readonly AgeGroup[]
  /** Langue dans laquelle la notion est enseignée (l'interface reste indépendante). */
  readonly learningLanguages: readonly LanguageCode[]
  readonly difficulty: 1 | 2 | 3
  /** Durée cible de la partie, en secondes (entre 180 et 420). */
  readonly estimatedSeconds: number
  readonly skill: string
  /** Clé audio (fichier `/audio/<langue>/<audioKey>.mp3`). */
  readonly audioKey: string
  readonly audio: Readonly<Record<LanguageCode, AudioStatus>>
  readonly options?: readonly ActivityOption[]
  readonly pairs?: readonly MemoryPair[]
  readonly story?: readonly StoryStep[]
  readonly validation: Readonly<Record<LanguageCode, ValidationStatus>>
}

export interface Category {
  readonly id: CategoryId
  readonly name: LocalizedText
  readonly emoji: string
  /** Couleur d'accent (jeton Tailwind explicite, jamais une classe dynamique). */
  readonly accent: 'blue' | 'teal' | 'yellow' | 'violet' | 'green' | 'orange' | 'rose' | 'indigo'
  readonly world: string
}

export interface LearnerProfile {
  readonly id: string
  /** Prénom d'affichage facultatif. Pas de nom de famille, pas de localisation. */
  readonly displayName: string
  readonly ageGroup: AgeGroup
  readonly age: number
  readonly avatar: AvatarId
  readonly uiLanguage: LanguageCode
  readonly learningLanguage: LanguageCode
  readonly classId: string
  readonly createdAt: string
  readonly parentalConsent: boolean
}

export type AvatarId = 'sidi' | 'gazelle' | 'fennec' | 'dauphin' | 'aigle' | 'dromadaire'

export interface SessionResult {
  readonly id: string
  readonly learnerId: string
  readonly activityId: string
  readonly category: CategoryId
  readonly skill: string
  readonly startedAt: string
  readonly finishedAt: string
  readonly durationSeconds: number
  readonly correct: number
  readonly total: number
  /** Difficulté effectivement utilisée pendant la partie. */
  readonly difficulty: 1 | 2 | 3
  readonly synced: boolean
}

export interface SkillMastery {
  readonly skill: string
  readonly attempts: number
  readonly correct: number
  /** 0..1 — taux de réussite lissé. */
  readonly score: number
  readonly lastPlayedAt: string
}

export interface Badge {
  readonly id: string
  readonly name: LocalizedText
  readonly description: LocalizedText
  readonly emoji: string
  /** Condition vérifiable sur la progression réelle. */
  readonly condition: { readonly type: 'sessions' | 'skills' | 'category'; readonly count: number; readonly category?: CategoryId }
}

export type Role = 'student' | 'teacher' | 'parent' | 'admin'

export interface DemoUser {
  readonly id: string
  readonly email: string
  readonly role: Role
  readonly displayName: string
  readonly schoolId: string
  readonly classIds: readonly string[]
  readonly childIds: readonly string[]
}

export interface School {
  readonly id: string
  readonly name: string
  readonly city: string
}

export interface Classroom {
  readonly id: string
  readonly schoolId: string
  readonly name: string
  readonly level: string
  readonly ageGroup: AgeGroup
  readonly teacherId: string
  readonly learnerIds: readonly string[]
  readonly learningLanguage: LanguageCode
}

export interface Assignment {
  readonly id: string
  readonly classId: string
  readonly activityIds: readonly string[]
  readonly createdBy: string
  readonly createdAt: string
  readonly dueDate: string
}

export interface ProgressSummary {
  readonly totalSessions: number
  readonly totalMinutes: number
  readonly activitiesCompleted: number
  readonly skills: readonly SkillMastery[]
  readonly badges: readonly string[]
  readonly history: readonly SessionResult[]
}
