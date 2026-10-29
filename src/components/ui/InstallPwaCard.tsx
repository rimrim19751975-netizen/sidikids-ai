import { useEffect, useState } from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import { Button } from './Button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Bouton d'installation PWA. Si le navigateur n'expose pas `beforeinstallprompt`
 * (iOS/Safari), on affiche la procédure manuelle exacte au lieu d'un bouton inerte.
 */
export function InstallPwaCard() {
  const { t } = useI18n()
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setInstalled(Boolean(standalone))
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent))

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed) {
    return (
      <p className="rounded-2xl bg-teal-brand-100 px-4 py-3 text-sm font-semibold text-teal-brand-700">✅ {t('pwa.installed')}</p>
    )
  }

  return (
    <section className="adult-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
      <div className="flex-1">
        <h2 className="text-base font-bold text-ink-900">{t('pwa.installTitle')}</h2>
        <p className="text-sm text-ink-500">{t('pwa.installText')}</p>
        {isIos ? <p className="mt-1 text-xs font-semibold text-ink-700">{t('pwa.iosHint')}</p> : null}
      </div>
      {promptEvent ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={async () => {
            await promptEvent.prompt()
            const choice = await promptEvent.userChoice
            if (choice.outcome === 'accepted') setInstalled(true)
            setPromptEvent(null)
          }}
        >
          {t('pwa.install')}
        </Button>
      ) : !isIos ? (
        <p className="text-xs text-ink-500">Menu du navigateur → « Installer l’application »</p>
      ) : null}
    </section>
  )
}
