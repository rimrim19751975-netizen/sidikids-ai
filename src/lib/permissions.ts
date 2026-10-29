import type { Role } from './types'

/**
 * Règles d'autorisation côté client (miroir des politiques RLS Supabase).
 * Elles ne remplacent pas le contrôle serveur : elles empêchent seulement
 * l'affichage d'un écran non autorisé. Voir supabase/migrations/0002_rls.sql.
 */

export interface AccessSubject {
  readonly id: string
  readonly role: Role
  readonly classIds: readonly string[]
  readonly childIds: readonly string[]
}

export interface LearnerRecord {
  readonly id: string
  readonly classId: string
}

export function canViewLearner(subject: AccessSubject, learner: LearnerRecord): boolean {
  switch (subject.role) {
    case 'teacher':
      return subject.classIds.includes(learner.classId)
    case 'parent':
      return subject.childIds.includes(learner.id)
    case 'student':
      return subject.id === learner.id
    case 'admin':
      // Un administrateur ne consulte les données nominatives d'un enfant qu'en
      // mode support tracé ; l'interface ne l'expose donc pas ici.
      return false
  }
}

export function canManageClass(subject: AccessSubject, classId: string): boolean {
  if (subject.role === 'admin') return true
  return subject.role === 'teacher' && subject.classIds.includes(classId)
}

export function canAccessTeacherSpace(subject: AccessSubject | null): boolean {
  return subject !== null && (subject.role === 'teacher' || subject.role === 'admin')
}

export function canAccessParentSpace(subject: AccessSubject | null): boolean {
  return subject !== null && subject.role === 'parent'
}

/** Un enfant ne peut jamais accéder aux espaces adultes. */
export function canAccessAdminSpace(subject: AccessSubject | null): boolean {
  return subject !== null && subject.role === 'admin'
}

/** Filtre une liste d'élèves : un enseignant ne voit que ses classes. */
export function visibleLearners<T extends LearnerRecord>(subject: AccessSubject, learners: readonly T[]): T[] {
  return learners.filter((learner) => canViewLearner(subject, learner))
}
