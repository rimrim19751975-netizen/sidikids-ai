import { Link } from 'react-router-dom'
import { ChildHeader, MascotBubble } from '@/components/child/Mascot'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/States'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppState } from '@/hooks/AppState'
import { BADGES } from '@/data/badges'
import { useNavigate } from 'react-router-dom'

const SKILL_LABELS: Record<string, string> = {
  'addition-jusqu-a-10': 'Additions jusqu’à 10',
  'soustraction-jusqu-a-10': 'Soustractions jusqu’à 10',
  'multiplication-tables-2-5': 'Tables de 2 à 5',
  'addition-avec-retenue': 'Additions avec retenue',
  'division-simple': 'Partages simples',
  'sons-initials-fr': 'Sons des lettres (français)',
  'lettres-arabes-initiales': 'Lettres arabes',
  'voyelles-consonnes': 'Voyelles et consonnes',
  'vocabulaire-scolaire': 'Vocabulaire de l’école',
  syllabes: 'Syllabes',
  rimes: 'Rimes',
  'animaux-caracteristiques': 'Animaux et caractéristiques',
  couleurs: 'Couleurs',
  'fruits-legumes': 'Fruits et légumes',
  'animaux-milieux': 'Animaux et milieux',
  'objets-quotidien': 'Objets du quotidien',
  'association-mot-image': 'Mot et image',
  'traduction-fr-ar': 'Français ↔ arabe',
  'ecoute-cris-animaux': 'Écoute des cris',
  'mots-hassaniya': 'Mots en hassaniya',
  'mots-wolof': 'Mots en wolof',
  'besoins-plantes': 'Besoins des plantes',
  'jour-nuit-soleil': 'Le soleil et la journée',
  'cycle-eau': 'Cycle de l’eau',
  'tri-dechets': 'Tri des déchets',
  'cinq-sens': 'Les cinq sens',
  'saisons-mauritanie': 'Saisons en Mauritanie',
  'suites-logiques': 'Suites logiques',
  'memoire-visuelle': 'Mémoire visuelle',
  'classement-categories': 'Classer par catégorie',
  'logique-geometrique': 'Logique géométrique',
  chronologie: 'Chronologie',
  'comprehension-conte': 'Compréhension de conte',
  'securite-au-quotidien': 'Sécurité au quotidien',
  'calcul-en-contexte': 'Calcul en situation',
  'habitudes-apprentissage': 'Habitudes d’apprentissage',
  'autonomie-quotidien': 'Autonomie',
  'hygiene-numerique': 'Pauses d’écran',
  'demander-aide': 'Demander de l’aide',
  'securite-numerique': 'Sécurité en ligne',
  'objectifs-realistes': 'Objectifs réalistes',
}

export function ChildProgressPage() {
  const { t, formatNumber } = useI18n()
  const { activeProfile, progress } = useAppState()
  const navigate = useNavigate()

  if (!activeProfile) {
    return (
      <main className="min-h-dvh bg-bg-page">
        <ChildHeader />
        <div className="mx-auto max-w-3xl px-4 py-8">
          <EmptyState
            title={t('home.pickProfile')}
            emoji="🙂"
            action={{ label: t('home.newPlayer'), onClick: () => navigate('/enfant/nouveau') }}
          />
        </div>
      </main>
    )
  }

  const earned = new Set(progress.badges)

  return (
    <main className="min-h-dvh bg-bg-page pb-12">
      <ChildHeader />
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 pt-4">
        <MascotBubble compact>{t('child.progress')}</MascotBubble>

        <section className="grid grid-cols-3 gap-3">
          <div className="kid-card flex flex-col items-center p-3">
            <span className="text-2xl" aria-hidden="true">
              🎮
            </span>
            <span className="text-2xl font-black text-ink-900">{formatNumber(progress.totalSessions)}</span>
            <span className="text-xs font-semibold text-ink-500">{t('teacher.sessionsCount')}</span>
          </div>
          <div className="kid-card flex flex-col items-center p-3">
            <span className="text-2xl" aria-hidden="true">
              ⏱️
            </span>
            <span className="text-2xl font-black text-ink-900">{formatNumber(progress.totalMinutes)}</span>
            <span className="text-xs font-semibold text-ink-500">{t('common.minutes')}</span>
          </div>
          <div className="kid-card flex flex-col items-center p-3">
            <span className="text-2xl" aria-hidden="true">
              🏅
            </span>
            <span className="text-2xl font-black text-ink-900">
              {formatNumber(progress.badges.length)}/{formatNumber(BADGES.length)}
            </span>
            <span className="text-xs font-semibold text-ink-500">{t('child.badges')}</span>
          </div>
        </section>

        <section className="kid-card p-4">
          <h2 className="text-lg font-black text-ink-900">🏅 {t('child.badges')}</h2>
          {progress.badges.length === 0 ? (
            <p className="mt-1 text-sm text-ink-500">{t('child.noBadge')}</p>
          ) : null}
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BADGES.map((badge) => {
              const unlocked = earned.has(badge.id)
              return (
                <li
                  key={badge.id}
                  className={`flex items-center gap-2 rounded-2xl p-2 ${
                    unlocked ? 'bg-sun-100 ring-2 ring-sun-300' : 'bg-slate-50 opacity-60'
                  }`}
                >
                  <span aria-hidden="true" className="text-2xl">
                    {unlocked ? badge.emoji : '🔒'}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-ink-900">{badge.name.fr}</span>
                    <span className="block text-[11px] leading-tight text-ink-500">{badge.description.fr}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="kid-card p-4">
          <h2 className="text-lg font-black text-ink-900">📈 {t('child.skills')}</h2>
          {progress.skills.length === 0 ? (
            <p className="mt-1 text-sm text-ink-500">{t('child.historyEmpty')}</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {progress.skills.map((skill) => (
                <li key={skill.skill}>
                  <div className="flex justify-between text-sm font-semibold text-ink-700">
                    <span>{SKILL_LABELS[skill.skill] ?? skill.skill}</span>
                    <span>{formatNumber(Math.round(skill.score * 100))}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-sky-soft-100">
                    <div className="h-full rounded-full bg-teal-brand-500" style={{ width: `${Math.round(skill.score * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="kid-card p-4">
          <h2 className="text-lg font-black text-ink-900">🕰️ {t('child.history')}</h2>
          {progress.history.length === 0 ? (
            <p className="mt-1 text-sm text-ink-500">{t('child.historyEmpty')}</p>
          ) : (
            <ul className="mt-2 divide-y divide-sky-soft-100">
              {progress.history.slice(0, 12).map((result) => (
                <li key={result.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="font-bold text-ink-900">{SKILL_LABELS[result.skill] ?? result.skill}</span>
                  <span className="text-ink-500">
                    {formatNumber(result.correct)}/{formatNumber(result.total)} ·{' '}
                    {new Date(result.finishedAt).toLocaleDateString('fr-FR')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Button variant="secondary" onClick={() => navigate('/enfant')}>
          🗺️ {t('game.backToMap')}
        </Button>
        <Link to="/confidentialite" className="text-center text-xs text-ink-500 underline-offset-2 hover:underline">
          {t('home.legal')}
        </Link>
      </div>
    </main>
  )
}
