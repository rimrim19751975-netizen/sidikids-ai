import type { Assignment, Classroom, DemoUser, LearnerProfile, School, SessionResult } from '@/lib/types'

/**
 * Données de démonstration. Elles sont fictives, entièrement locales et ne
 * contiennent aucun nom de famille (minimisation des données des mineurs).
 */

export const DEMO_SCHOOLS: readonly School[] = [
  { id: 'school-1', name: 'École privée El Wafa (démo)', city: 'Nouakchott' },
]

export const DEMO_TEACHERS: readonly DemoUser[] = [
  {
    id: 'teacher-1',
    email: 'enseignant@sidikids.demo',
    role: 'teacher',
    displayName: 'Mme Aïcha (démo)',
    schoolId: 'school-1',
    classIds: ['class-1', 'class-2'],
    childIds: [],
  },
]

export const DEMO_PARENTS: readonly DemoUser[] = [
  {
    id: 'parent-1',
    email: 'parent@sidikids.demo',
    role: 'parent',
    displayName: 'Parent démo',
    schoolId: 'school-1',
    classIds: [],
    childIds: ['learner-1', 'learner-2'],
  },
]

/**
 * Comptes de démonstration — mot de passe partagé : `demo1234`.
 * Ce n'est PAS un secret : il n'y a pas de serveur en mode démonstration.
 */
export const DEMO_ACCOUNTS: Readonly<Record<string, string>> = {
  'enseignant@sidikids.demo': 'demo1234',
  'parent@sidikids.demo': 'demo1234',
}

export const DEMO_LEARNERS: readonly LearnerProfile[] = [
  {
    id: 'learner-1',
    displayName: 'Fatimetou',
    ageGroup: '5-7',
    age: 6,
    avatar: 'gazelle',
    uiLanguage: 'fr',
    learningLanguage: 'fr',
    classId: 'class-1',
    createdAt: '2026-09-10T08:00:00.000Z',
    parentalConsent: true,
  },
  {
    id: 'learner-2',
    displayName: 'Mohamed',
    ageGroup: '8-10',
    age: 9,
    avatar: 'dromadaire',
    uiLanguage: 'ar',
    learningLanguage: 'ar',
    classId: 'class-1',
    createdAt: '2026-09-10T08:05:00.000Z',
    parentalConsent: true,
  },
  {
    id: 'learner-3',
    displayName: 'Mariem',
    ageGroup: '5-7',
    age: 7,
    avatar: 'fennec',
    uiLanguage: 'fr',
    learningLanguage: 'ar',
    classId: 'class-1',
    createdAt: '2026-09-11T08:00:00.000Z',
    parentalConsent: true,
  },
  {
    id: 'learner-4',
    displayName: 'Cheikh',
    ageGroup: '8-10',
    age: 10,
    avatar: 'aigle',
    uiLanguage: 'ar',
    learningLanguage: 'fr',
    classId: 'class-2',
    createdAt: '2026-09-12T08:00:00.000Z',
    parentalConsent: true,
  },
  {
    id: 'learner-5',
    displayName: 'Aminata',
    ageGroup: '8-10',
    age: 9,
    avatar: 'dauphin',
    uiLanguage: 'wolof',
    learningLanguage: 'fr',
    classId: 'class-2',
    createdAt: '2026-09-12T08:10:00.000Z',
    parentalConsent: true,
  },
]

export const DEMO_CLASSES: readonly Classroom[] = [
  {
    id: 'class-1',
    schoolId: 'school-1',
    name: 'CP-A',
    level: 'CP',
    ageGroup: '5-7',
    teacherId: 'teacher-1',
    learnerIds: ['learner-1', 'learner-2', 'learner-3'],
    learningLanguage: 'fr',
  },
  {
    id: 'class-2',
    schoolId: 'school-1',
    name: 'CE2-A',
    level: 'CE2',
    ageGroup: '8-10',
    teacherId: 'teacher-1',
    learnerIds: ['learner-4', 'learner-5'],
    learningLanguage: 'ar',
  },
]

export const DEMO_ASSIGNMENTS: readonly Assignment[] = [
  {
    id: 'assign-1',
    classId: 'class-1',
    activityIds: ['math-1', 'alpha-1', 'safari-1'],
    createdBy: 'teacher-1',
    createdAt: '2026-10-20T09:00:00.000Z',
    dueDate: '2026-10-30',
  },
]

/** Historique fictif : sert à montrer la vue enseignant, clairement marqué démo. */
export const DEMO_RESULTS: readonly SessionResult[] = [
  {
    id: 'demo-r1', learnerId: 'learner-1', activityId: 'math-1', category: 'math', skill: 'addition-jusqu-a-10',
    startedAt: '2026-10-21T09:10:00.000Z', finishedAt: '2026-10-21T09:13:00.000Z', durationSeconds: 180,
    correct: 4, total: 5, difficulty: 1, synced: true,
  },
  {
    id: 'demo-r2', learnerId: 'learner-1', activityId: 'alpha-1', category: 'alphabet', skill: 'sons-initials-fr',
    startedAt: '2026-10-22T09:00:00.000Z', finishedAt: '2026-10-22T09:04:00.000Z', durationSeconds: 240,
    correct: 3, total: 5, difficulty: 1, synced: true,
  },
  {
    id: 'demo-r3', learnerId: 'learner-1', activityId: 'safari-1', category: 'safari', skill: 'animaux-caracteristiques',
    startedAt: '2026-10-23T09:00:00.000Z', finishedAt: '2026-10-23T09:02:30.000Z', durationSeconds: 150,
    correct: 5, total: 5, difficulty: 1, synced: true,
  },
  {
    id: 'demo-r4', learnerId: 'learner-2', activityId: 'math-3', category: 'math', skill: 'multiplication-tables-2-5',
    startedAt: '2026-10-21T10:00:00.000Z', finishedAt: '2026-10-21T10:04:00.000Z', durationSeconds: 240,
    correct: 2, total: 5, difficulty: 2, synced: true,
  },
  {
    id: 'demo-r5', learnerId: 'learner-2', activityId: 'det-2', category: 'detective', skill: 'traduction-fr-ar',
    startedAt: '2026-10-22T10:00:00.000Z', finishedAt: '2026-10-22T10:05:00.000Z', durationSeconds: 300,
    correct: 4, total: 5, difficulty: 2, synced: true,
  },
  {
    id: 'demo-r6', learnerId: 'learner-2', activityId: 'psi-none' as string, category: 'logique', skill: 'memoire-visuelle',
    startedAt: '2026-10-23T10:00:00.000Z', finishedAt: '2026-10-23T10:04:00.000Z', durationSeconds: 240,
    correct: 3, total: 5, difficulty: 2, synced: true,
  },
  {
    id: 'demo-r7', learnerId: 'learner-3', activityId: 'safari-2', category: 'safari', skill: 'couleurs',
    startedAt: '2026-10-22T11:00:00.000Z', finishedAt: '2026-10-22T11:03:00.000Z', durationSeconds: 180,
    correct: 5, total: 5, difficulty: 1, synced: true,
  },
  {
    id: 'demo-r8', learnerId: 'learner-3', activityId: 'sci-1', category: 'sciences', skill: 'besoins-plantes',
    startedAt: '2026-10-23T11:00:00.000Z', finishedAt: '2026-10-23T11:03:00.000Z', durationSeconds: 180,
    correct: 2, total: 5, difficulty: 1, synced: true,
  },
  {
    id: 'demo-r9', learnerId: 'learner-4', activityId: 'math-5', category: 'math', skill: 'division-simple',
    startedAt: '2026-10-24T08:00:00.000Z', finishedAt: '2026-10-24T08:05:00.000Z', durationSeconds: 300,
    correct: 3, total: 5, difficulty: 3, synced: true,
  },
  {
    id: 'demo-r10', learnerId: 'learner-5', activityId: 'conte-2', category: 'contes', skill: 'comprehension-conte',
    startedAt: '2026-10-24T09:00:00.000Z', finishedAt: '2026-10-24T09:05:00.000Z', durationSeconds: 300,
    correct: 4, total: 5, difficulty: 2, synced: true,
  },
]

export const DEMO_DATA = {
  school: DEMO_SCHOOLS[0]!,
  teachers: DEMO_TEACHERS,
  parents: DEMO_PARENTS,
  students: DEMO_LEARNERS,
  classes: DEMO_CLASSES,
  assignments: DEMO_ASSIGNMENTS,
  results: DEMO_RESULTS,
} as const
