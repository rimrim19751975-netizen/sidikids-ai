import { useEffect, useState } from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import { countPending, syncPendingResults } from '@/lib/sync'

/** Bandeau hors ligne honnête : ce qui marche, ce qui ne marche pas. */
export function OfflineBanner() {
  const { t } = useI18n()
  const [online, setOnline] = useState(() => navigator.onLine)
  const [pending, setPending] = useState(() => countPending())
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const goOnline = () => {
      setOnline(true)
      void syncPendingResults().then((synced) => {
        setPending(countPending())
        if (synced > 0) setMessage(t('offline.synced'))
      })
    }
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [t])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [message])

  if (online && pending === 0 && !message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full px-4 py-2 text-center text-sm font-semibold ${online ? 'bg-teal-brand-100 text-teal-brand-700' : 'bg-sun-100 text-sun-700'}`}
    >
      {message ? (
        <span>{message}</span>
      ) : !online ? (
        <span>
          📴 {t('offline.title')} — {t('offline.text')}
          {pending > 0 ? ` (${pending} ${t('offline.pending')})` : ''}
        </span>
      ) : null}
    </div>
  )
}
