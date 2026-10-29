import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppState } from '@/hooks/AppState'
import { useSession } from '@/hooks/useSession'
import { AVATARS } from '@/data/badges'
import { Mascot } from '@/components/child/Mascot'
import { Button } from '@/components/ui/Button'
import { APP_MODE } from '@/lib/supabase'
import { InstallPwaCard } from '@/components/ui/InstallPwaCard'
import { UiLanguageSwitcher } from '@/components/ui/UiLanguageSwitcher'

export function HomePage() {
  const { t } = useI18n()
  const { profiles, selectProfile } = useAppState()
  const { isAuthenticated, signOut } = useSession()

  return (
    <main className="dune-bg min-h-dvh">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:py-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-soft-500 text-xl font-black text-white shadow-md">
              S
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">{t('app.name')}</h1>
              <p className="text-sm text-ink-500">{t('app.tagline')}</p>
            </div>
          </div>
          <UiLanguageSwitcher />
        </header>

        {APP_MODE === 'demo' ? (
          <p className="rounded-2xl bg-white/85 px-4 py-3 text-sm text-ink-700 ring-1 ring-sun-300">
            <strong className="font-bold">{t('app.demoMode')}</strong> — {t('app.demoModeExplain')}
          </p>
        ) : null}

        <section className="kid-card flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-start">
          <Mascot size={120} />
          <div className="flex-1">
            <h2 className="text-2xl font-black text-ink-900 sm:text-3xl">{t('home.pickProfile')}</h2>
            <p className="mt-1 text-ink-500">{t('child.mapIntro')}</p>
          </div>
        </section>

        {profiles.length > 0 ? (
          <section aria-label={t('home.pickProfile')} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {profiles.map((profile) => {
              const avatar = AVATARS.find((a) => a.id === profile.avatar)
              return (
                <Link
                  key={profile.id}
                  to="/enfant"
                  onClick={() => selectProfile(profile.id)}
                  className="kid-card flex min-h-32 flex-col items-center justify-center gap-2 p-4 transition hover:-translate-y-0.5 focus-ring"
                >
                  <span aria-hidden="true" className="grid h-16 w-16 place-items-center rounded-full bg-sky-soft-100 text-3xl">
                    {avatar?.emoji ?? '🙂'}
                  </span>
                  <span className="text-lg font-bold text-ink-900">{profile.displayName}</span>
                  <span className="rounded-full bg-teal-brand-100 px-2 py-0.5 text-xs font-bold text-teal-brand-700">
                    {profile.age} {t('common.yes') === 'Oui' ? 'ans' : ''}
                  </span>
                </Link>
              )
            })}
          </section>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/enfant/nouveau" className="block">
            <div className="kid-card flex min-h-20 items-center gap-4 p-5 transition hover:-translate-y-0.5">
              <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-2xl bg-sun-100 text-3xl">
                ✨
              </span>
              <span className="text-xl font-black text-ink-900">{t('home.newPlayer')}</span>
            </div>
          </Link>
          <Link to="/enfant" className="block">
            <div className="kid-card flex min-h-20 items-center gap-4 p-5 transition hover:-translate-y-0.5">
              <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-brand-100 text-3xl">
                🗺️
              </span>
              <span className="text-xl font-black text-ink-900">{t('child.map')}</span>
            </div>
          </Link>
        </div>

        <InstallPwaCard />

        <nav aria-label="Espaces adultes" className="adult-card flex flex-wrap items-center gap-3 p-4 text-sm">
          <Link className="font-bold text-sky-soft-700 underline-offset-4 hover:underline" to="/enseignant">
            {t('home.teacherSpace')}
          </Link>
          <span aria-hidden="true" className="text-ink-300">
            ·
          </span>
          <Link className="font-bold text-sky-soft-700 underline-offset-4 hover:underline" to="/validation">
            {t('validation.title')}
          </Link>
          <span aria-hidden="true" className="text-ink-300">
            ·
          </span>
          <Link className="font-bold text-sky-soft-700 underline-offset-4 hover:underline" to="/confidentialite">
            {t('home.legal')}
          </Link>
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={() => void signOut()} className="ms-auto">
              {t('teacher.signOut')}
            </Button>
          ) : null}
        </nav>

        <footer className="pb-6 text-center text-xs text-ink-500">
          {t('app.name')} · {t('home.legal')} · {t('pwa.offlineReady')}
        </footer>
      </div>
    </main>
  )
}
