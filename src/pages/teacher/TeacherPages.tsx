import { useState } from 'react'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/States'
import { useI18n } from '@/i18n/I18nProvider'
import { useSession } from '@/hooks/useSession'
import { DEMO_CLASSES, DEMO_DATA, DEMO_RESULTS, DEMO_TEACHERS } from '@/data/demo'
import { ACTIVITIES } from '@/data/activities'
import { computeSkills, ratio } from '@/lib/progress'
import { canManageClass, visibleLearners } from '@/lib/permissions'
import type { Assignment, LearnerProfile, SessionResult } from '@/lib/types'
import { readJson, STORAGE_KEYS, writeJson } from '@/lib/storage'
import { UiLanguageSwitcher } from '@/components/ui/UiLanguageSwitcher'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export function TeacherLoginPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { signIn, error, loading, isAuthenticated, user, signOut, configuredWithSupabase } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const parsed = credentialsSchema.safeParse({ email, password })
    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path[0]
      setLocalError(field === 'email' ? t('teacher.invalidEmail') : t('teacher.invalidPassword'))
      return
    }
    setLocalError(null)
    await signIn(parsed.data.email, parsed.data.password)
  }

  if (isAuthenticated && user) {
    return (
      <main className="min-h-dvh bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="adult-card p-6">
            <h1 className="text-xl font-bold text-ink-900">{t('teacher.title')}</h1>
            <p className="mt-1 text-sm text-ink-500">
              {user.displayName} · {user.email}
            </p>
            {user.role === 'teacher' || user.role === 'admin' ? (
              <Button className="mt-4" onClick={() => navigate('/enseignant/tableau-de-bord')}>
                {t('teacher.classes')}
              </Button>
            ) : (
              <p className="mt-4 rounded-xl bg-sun-100 px-3 py-2 text-sm font-semibold text-sun-700">
                {t('teacher.notAllowed')}
              </p>
            )}
            <Button variant="ghost" className="ms-2 mt-4" onClick={() => void signOut()}>
              {t('teacher.signOut')}
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="adult-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <Link to="/" className="text-sm font-semibold text-sky-soft-700">
              ← {t('common.back')}
            </Link>
            <UiLanguageSwitcher compact />
          </div>
          <h1 className="text-2xl font-bold text-ink-900">{t('teacher.login')}</h1>
          <p className="mt-1 text-sm text-ink-500">{t('teacher.loginHelp')}</p>

          {!configuredWithSupabase ? (
            <div className="mt-4 rounded-xl bg-sun-100 px-3 py-2 text-xs font-semibold text-sun-700">
              {t('teacher.demoBanner')}
              <br />
              <code>enseignant@sidikids.demo</code> / <code>demo1234</code>
              <br />
              <code>parent@sidikids.demo</code> / <code>demo1234</code>
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-5 flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-ink-700">
                {t('teacher.email')}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 focus:border-sky-soft-500 focus-ring"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-semibold text-ink-700">
                {t('teacher.password')}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 focus:border-sky-soft-500 focus-ring"
              />
            </div>
            {localError || error ? (
              <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
                {localError ?? (error === 'wrong-credentials' ? t('teacher.wrongCredentials') : t('common.error'))}
              </p>
            ) : null}
            <Button type="submit" disabled={loading}>
              {loading ? t('common.loading') : t('teacher.signIn')}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}

export function TeacherDashboardPage() {
  const { t, localizedText, formatNumber } = useI18n()
  const { user, signOut, configuredWithSupabase } = useSession()
  const navigate = useNavigate()

  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    readJson<Assignment[]>(STORAGE_KEYS.demoData, [...DEMO_DATA.assignments]),
  )
  const [results] = useState<readonly SessionResult[]>(() => {
    // Résultats réels de l'appareil (parties jouées) + historique fictif de démo.
    const local = readJson<SessionResult[]>(STORAGE_KEYS.results, [])
    return [...DEMO_RESULTS, ...local]
  })
  const [selectedClass, setSelectedClass] = useState<string>(DEMO_CLASSES[0]?.id ?? '')
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [activityToAssign, setActivityToAssign] = useState<string>(ACTIVITIES[0]?.id ?? '')
  const [toast, setToast] = useState<string | null>(null)

  const subject = user
    ? { id: user.id, role: user.role, classIds: user.classIds, childIds: user.childIds }
    : null

  if (!user || !subject) {
    return <TeacherLoginPage />
  }

  const myClasses = DEMO_CLASSES.filter((c) => canManageClass(subject, c.id))
  const learners = visibleLearners(subject, DEMO_DATA.students as readonly LearnerProfile[]) as LearnerProfile[]
  const classLearners = learners.filter((l) => l.classId === selectedClass)
  const classIds = new Set(classLearners.map((l) => l.id))
  const classResults = results.filter((r) => classIds.has(r.learnerId))

  const skills = computeSkills(classResults)
  const weakest = skills.slice(0, 3)
  const average = classResults.length
    ? Math.round(
        (classResults.reduce((sum, r) => sum + ratio(r.correct, r.total), 0) / classResults.length) * 100,
      )
    : 0

  const assign = () => {
    const assignment: Assignment = {
      id: `assign-${Date.now().toString(36)}`,
      classId: selectedClass,
      activityIds: [activityToAssign],
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    }
    const next = [...assignments, assignment]
    setAssignments(next)
    writeJson(STORAGE_KEYS.demoData, next)
    setToast(t('teacher.assignSuccess'))
    window.setTimeout(() => setToast(null), 3000)
  }

  const exportCsv = () => {
    const rows = [
      ['eleve', 'activite', 'skill', 'correct', 'total', 'score_pct', 'duree_s', 'fini_le'],
      ...classResults.map((r) => {
        const learner = learners.find((l) => l.id === r.learnerId)
        return [
          learner?.displayName ?? r.learnerId,
          r.activityId,
          r.skill,
          String(r.correct),
          String(r.total),
          String(Math.round(ratio(r.correct, r.total) * 100)),
          String(r.durationSeconds),
          r.finishedAt,
        ]
      }),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(';')).join('\r\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sidikids-rapport-${selectedClass}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const studentResults = selectedStudent ? results.filter((r) => r.learnerId === selectedStudent) : []

  return (
    <main className="min-h-dvh bg-slate-50 pb-12">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-ink-900">{t('teacher.title')}</h1>
            <p className="text-xs text-ink-500">
              {user.displayName} · {configuredWithSupabase ? 'Supabase' : t('app.demoModeShort')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <UiLanguageSwitcher compact />
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              {t('teacher.signOut')}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5">
        <p className="rounded-xl bg-sun-100 px-3 py-2 text-xs font-semibold text-sun-700">{t('teacher.demoBanner')}</p>
        {toast ? (
          <p role="status" className="rounded-xl bg-teal-brand-100 px-3 py-2 text-sm font-semibold text-teal-brand-700">
            {toast}
          </p>
        ) : null}

        <section aria-label={t('teacher.classes')} className="flex flex-wrap gap-2">
          {myClasses.map((cls) => (
            <button
              key={cls.id}
              type="button"
              aria-pressed={selectedClass === cls.id}
              onClick={() => {
                setSelectedClass(cls.id)
                setSelectedStudent(null)
              }}
              className={`min-h-11 rounded-lg px-4 text-sm font-semibold ${
                selectedClass === cls.id ? 'bg-sky-soft-500 text-white' : 'bg-white text-ink-700 ring-1 ring-slate-200'
              }`}
            >
              {cls.name} · {formatNumber(cls.learnerIds.length)} {t('teacher.students')}
            </button>
          ))}
        </section>

        {myClasses.length === 0 ? <EmptyState title={t('teacher.emptyClass')} emoji="🏫" /> : null}

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="adult-card p-4">
            <p className="text-xs font-semibold uppercase text-ink-500">{t('teacher.students')}</p>
            <p className="text-3xl font-bold text-ink-900">{formatNumber(classLearners.length)}</p>
          </div>
          <div className="adult-card p-4">
            <p className="text-xs font-semibold uppercase text-ink-500">{t('teacher.avgScore')}</p>
            <p className="text-3xl font-bold text-ink-900">{formatNumber(average)}%</p>
            <p className="text-xs text-ink-500">{t('teacher.measuredNote')}</p>
          </div>
          <div className="adult-card p-4">
            <p className="text-xs font-semibold uppercase text-ink-500">{t('teacher.sessionsCount')}</p>
            <p className="text-3xl font-bold text-ink-900">{formatNumber(classResults.length)}</p>
          </div>
        </section>

        <section className="adult-card p-4">
          <h2 className="text-sm font-bold text-ink-900">{t('teacher.assign')}</h2>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <label className="flex-1 text-sm">
              <span className="sr-only">{t('teacher.selectActivity')}</span>
              <select
                value={activityToAssign}
                onChange={(e) => setActivityToAssign(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3"
              >
                {ACTIVITIES.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {localizedText(activity.title).value} ({activity.category})
                  </option>
                ))}
              </select>
            </label>
            <Button onClick={assign} disabled={!selectedClass}>
              {t('teacher.assign')}
            </Button>
            <Button variant="secondary" onClick={exportCsv}>
              ⬇ {t('teacher.exportCsv')}
            </Button>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2 text-xs">
            {assignments
              .filter((a) => a.classId === selectedClass)
              .map((a) => (
                <li key={a.id} className="rounded-full bg-sky-soft-50 px-3 py-1 font-semibold text-sky-soft-700">
                  {a.activityIds.map((id) => ACTIVITIES.find((x) => x.id === id)?.title.fr ?? id).join(', ')} · {a.dueDate}
                </li>
              ))}
          </ul>
        </section>

        <section className="adult-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-900">{t('teacher.results')}</h2>
            <div className="flex gap-1 text-xs font-semibold">
              <span className={`rounded px-2 py-1 ${selectedStudent ? '' : 'bg-sky-soft-100 text-sky-soft-700'}`}>
                {t('teacher.classView')}
              </span>
              <span className={`rounded px-2 py-1 ${selectedStudent ? 'bg-sky-soft-100 text-sky-soft-700' : ''}`}>
                {t('teacher.studentView')}
              </span>
            </div>
          </div>

          {classLearners.length === 0 ? (
            <EmptyState title={t('teacher.emptyClass')} description={t('teacher.addStudentHelp')} emoji="👩‍🏫" />
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <caption className="sr-only">{t('teacher.results')}</caption>
                <thead className="text-xs uppercase text-ink-500">
                  <tr>
                    <th scope="col" className="py-2">
                      {t('teacher.studentView')}
                    </th>
                    <th scope="col">{t('teacher.sessionsCount')}</th>
                    <th scope="col">{t('teacher.avgScore')}</th>
                    <th scope="col">{t('teacher.lastPlayed')}</th>
                  </tr>
                </thead>
                <tbody>
                  {classLearners.map((learner) => {
                    const learnerResults = results.filter((r) => r.learnerId === learner.id)
                    const learnerAvg = learnerResults.length
                      ? Math.round(
                          (learnerResults.reduce((sum, r) => sum + ratio(r.correct, r.total), 0) / learnerResults.length) *
                            100,
                        )
                      : null
                    return (
                      <tr
                        key={learner.id}
                        className={`border-t border-slate-100 ${selectedStudent === learner.id ? 'bg-sky-soft-50' : ''}`}
                      >
                        <td className="py-2 font-semibold text-ink-900">
                          <button
                            type="button"
                            className="underline-offset-2 hover:underline"
                            onClick={() => setSelectedStudent(selectedStudent === learner.id ? null : learner.id)}
                          >
                            {learner.displayName}
                          </button>
                        </td>
                        <td>{formatNumber(learnerResults.length)}</td>
                        <td>{learnerAvg === null ? '—' : `${formatNumber(learnerAvg)}%`}</td>
                        <td className="text-xs text-ink-500">
                          {learnerResults.at(-1)?.finishedAt.slice(0, 10) ?? t('teacher.noResults')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {selectedStudent ? (
            <div className="mt-4 rounded-xl bg-sky-soft-50 p-3">
              <h3 className="text-sm font-bold text-ink-900">
                {t('teacher.studentView')} · {learners.find((l) => l.id === selectedStudent)?.displayName}
              </h3>
              {studentResults.length === 0 ? (
                <p className="text-xs text-ink-500">{t('teacher.noResults')}</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1 text-xs">
                  {studentResults.map((r) => (
                    <li key={r.id} className="flex justify-between gap-2">
                      <span className="font-semibold">{r.skill}</span>
                      <span>
                        {formatNumber(r.correct)}/{formatNumber(r.total)} · {Math.round(r.durationSeconds / 60)}{' '}
                        {t('common.minutes')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </section>

        <section className="adult-card p-4">
          <h2 className="text-sm font-bold text-ink-900">{t('teacher.skillsToReview')}</h2>
          <p className="text-xs text-ink-500">{t('teacher.recommendationNote')}</p>
          {weakest.length === 0 ? (
            <p className="mt-2 text-sm text-ink-500">{t('teacher.noResults')}</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {weakest.map((skill) => (
                <li key={skill.skill} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>{skill.skill}</span>
                    <span>{Math.round(skill.score * 100)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-sky-soft-500" style={{ width: `${Math.round(skill.score * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          ← {t('home.start')}
        </Button>
      </div>
    </main>
  )
}

export { DEMO_TEACHERS }
