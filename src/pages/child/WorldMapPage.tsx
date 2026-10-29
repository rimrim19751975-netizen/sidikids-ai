import { ChildHeader, MascotBubble } from '@/components/child/Mascot'
import { UiLanguageSwitcher } from '@/components/ui/UiLanguageSwitcher'
import { Button } from '@/components/ui/Button'
import { CATEGORIES } from '@/data/categories'
import { activitiesByCategory } from '@/data/activities'
import { recommendActivities, categoryProgress, startingDifficulty } from '@/lib/progress'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppState } from '@/hooks/AppState'
import { ACTIVITIES } from '@/data/activities'
import { ACTIVITY_ACCENT } from '@/components/ui/accents'
import { Link, useNavigate } from 'react-router-dom'

export function ChildWorldMapPage() {
  const { t, localizedText, formatNumber } = useI18n()
  const { activeProfile, resultsForActive, progress } = useAppState()
  const navigate = useNavigate()

  if (!activeProfile) {
    return (
      <main className="dune-bg min-h-dvh">
        <ChildHeader />
        <div className="mx-auto max-w-3xl px-4 py-8">
          <MascotBubble>{t('home.pickProfile')}</MascotBubble>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => navigate('/enfant/nouveau')}>{t('home.newPlayer')}</Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              {t('home.start')}
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const recommendations = recommendActivities(activeProfile, resultsForActive, ACTIVITIES, 3)
  const difficulty = startingDifficulty(activeProfile.ageGroup)

  return (
    <main className="dune-bg min-h-dvh pb-24">
      <ChildHeader />
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MascotBubble compact>
            {t('home.welcome')} {activeProfile.displayName} ! {t('child.mapIntro')}
          </MascotBubble>
          <UiLanguageSwitcher compact />
        </div>

        <section aria-labelledby="reco-title" className="kid-card p-4">
          <h2 id="reco-title" className="text-lg font-black text-ink-900">
            ⭐ {t('child.recommended')}
          </h2>
          <p className="text-xs text-ink-500">{t('child.recommendedExplain')}</p>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {recommendations.map(({ activity }) => {
              const title = localizedText(activity.title).value
              return (
                <Link
                  key={activity.id}
                  to={`/enfant/jouer/${activity.id}`}
                  state={{ difficulty }}
                  className="flex min-w-44 flex-1 flex-col items-start gap-1 rounded-2xl bg-sky-soft-50 p-3 ring-2 ring-sky-soft-100 focus-ring"
                >
                  <span aria-hidden="true" className="text-2xl">
                    {CATEGORIES.find((c) => c.id === activity.category)?.emoji}
                  </span>
                  <span className="text-sm font-bold text-ink-900">{title}</span>
                  <span className="text-xs text-ink-500">
                    {Math.round(activity.estimatedSeconds / 60)} {t('common.minutes')}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        <h2 className="text-2xl font-black text-ink-900">🗺️ {t('child.map')}</h2>
        <section aria-label={t('child.map')} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => {
            const items = activitiesByCategory(category.id).filter(
              (a) => a.ageGroups.includes(activeProfile.ageGroup),
            )
            const prog = categoryProgress(resultsForActive, ACTIVITIES, category.id)
            const first = items[0]
            const accent = ACTIVITY_ACCENT[category.accent]
            return (
              <article key={category.id} className="kid-card flex flex-col gap-3 p-4">
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className={`grid h-14 w-14 place-items-center rounded-2xl text-3xl ${accent.bg}`}>
                    {category.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-black text-ink-900">{localizedText(category.name).value}</h3>
                    <p className="text-xs text-ink-500">
                      {formatNumber(items.length)} {t('child.activityCount')} · {t('child.difficulty').toLowerCase()}{' '}
                      {t(`child.${difficulty === 1 ? 'easy' : difficulty === 2 ? 'medium' : 'hard'}` as 'child.easy')}
                    </p>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-sky-soft-100" aria-hidden="true">
                  <div className={`h-full rounded-full ${accent.bar}`} style={{ width: `${prog.percent}%` }} />
                </div>
                <p className="text-xs font-semibold text-ink-500">
                  {formatNumber(prog.done)}/{formatNumber(prog.total)} {t('child.activityCount')}
                </p>
                {first ? (
                  <Button
                    size="md"
                    fullWidth
                    onClick={() => navigate(`/enfant/jouer/${first.id}`, { state: { difficulty } })}
                  >
                    {t('common.play')}
                  </Button>
                ) : (
                  <p className="rounded-xl bg-sun-100 px-3 py-2 text-xs font-semibold text-sun-700">{t('common.empty')}</p>
                )}
              </article>
            )
          })}
        </section>

        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-sky-soft-100 bg-white/95 px-3 py-2 backdrop-blur">
          <ul className="mx-auto flex max-w-lg justify-around">
            <li>
              <Link to="/enfant" className="flex min-h-12 flex-col items-center rounded-xl px-3 text-xs font-bold text-sky-soft-600 focus-ring">
                <span aria-hidden="true" className="text-xl">
                  🗺️
                </span>
                {t('child.map')}
              </Link>
            </li>
            <li>
              <Link
                to="/enfant/progression"
                className="flex min-h-12 flex-col items-center rounded-xl px-3 text-xs font-bold text-ink-500 focus-ring"
              >
                <span aria-hidden="true" className="text-xl">
                  🏅
                </span>
                {t('child.progress')}
              </Link>
            </li>
            <li>
              <Link
                to="/enfant/reglages"
                className="flex min-h-12 flex-col items-center rounded-xl px-3 text-xs font-bold text-ink-500 focus-ring"
              >
                <span aria-hidden="true" className="text-xl">
                  ⚙️
                </span>
                {t('child.settings')}
              </Link>
            </li>
          </ul>
        </nav>

        <p className="text-center text-xs text-ink-500">
          {t('child.progress')} : {formatNumber(progress.totalSessions)} {t('teacher.sessionsCount').toLowerCase()}
        </p>
      </div>
    </main>
  )
}
