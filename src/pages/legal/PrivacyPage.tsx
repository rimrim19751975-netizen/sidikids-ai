import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { UiLanguageSwitcher } from '@/components/ui/UiLanguageSwitcher'

export function PrivacyPage() {
  const { t } = useI18n()
  return (
    <main className="min-h-dvh bg-bg-page">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-sky-soft-700">
            ← {t('common.back')}
          </Link>
          <UiLanguageSwitcher compact />
        </div>
        <article className="kid-card flex flex-col gap-4 p-6">
          <h1 className="text-2xl font-black text-ink-900">{t('privacy.title')}</h1>
          <p className="text-ink-700">{t('privacy.intro')}</p>

          <section>
            <h2 className="text-lg font-black text-ink-900">{t('privacy.collect')}</h2>
            <p className="text-ink-700">{t('privacy.collectList')}</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-ink-900">{t('privacy.notCollect')}</h2>
            <p className="text-ink-700">{t('privacy.notCollectList')}</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-ink-900">{t('privacy.parental')}</h2>
            <p className="text-ink-700">{t('privacy.parentalText')}</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-ink-900">{t('privacy.deletion')}</h2>
            <p className="text-ink-700">{t('privacy.deletionText')}</p>
          </section>
          <section>
            <h2 className="text-lg font-black text-ink-900">{t('validation.title')}</h2>
            <p className="text-ink-700">{t('privacy.audioNote')}</p>
          </section>
          <p className="rounded-xl bg-sun-100 px-3 py-2 text-xs font-semibold text-sun-700">
            Les textes ci-dessus décrivent le comportement réel du mode démonstration. Avant une
            utilisation scolaire réelle, l'établissement doit fournir sa politique de confidentialité
            validée juridiquement et recueillir le consentement écrit des parents.
          </p>
        </article>
      </div>
    </main>
  )
}
