import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { Mascot } from '@/components/child/Mascot'

export function NotFoundPage() {
  const { t } = useI18n()
  return (
    <main className="dune-bg grid min-h-dvh place-items-center px-4">
      <div className="kid-card flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <Mascot size={110} mood="thinking" />
        <h1 className="text-2xl font-black text-ink-900">{t('notFound.title')}</h1>
        <p className="text-ink-500">{t('notFound.text')}</p>
        <Link
          to="/enfant"
          className="min-h-12 rounded-2xl bg-sky-soft-500 px-6 py-3 font-bold text-white shadow-md focus-ring"
        >
          {t('game.backToMap')}
        </Link>
      </div>
    </main>
  )
}
