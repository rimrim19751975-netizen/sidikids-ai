import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { I18nProvider } from '@/i18n/I18nProvider'
import { AppStateProvider, useAppState } from '@/hooks/AppState'
import { SessionProvider } from '@/hooks/useSession'
import { LANGUAGES } from '@/i18n/languages'
import type { LanguageCode } from '@/lib/types'
import { AppRoutes } from '@/app/AppRoutes'
import { OfflineBanner } from '@/components/ui/OfflineBanner'

/** Applique `lang` et `dir` au document : indispensable pour le RTL arabe. */
function DocumentDirection({ children }: { readonly children: ReactNode }) {
  const { activeProfile } = useAppState()
  const [fallback, setFallback] = useState<LanguageCode>(() => {
    const stored = window.localStorage.getItem('sidikids.uiLanguage.v1')
    return stored && stored in LANGUAGES ? (stored as LanguageCode) : 'fr'
  })

  const language = activeProfile?.uiLanguage ?? fallback

  useEffect(() => {
    const meta = LANGUAGES[language]
    const root = document.documentElement
    root.lang = language === 'hassaniya' ? 'ar' : language
    root.dir = meta.dir
    root.dataset.lang = language
    window.localStorage.setItem('sidikids.uiLanguage.v1', language)
  }, [language])

  const onLanguageChange = useCallback((lang: LanguageCode) => setFallback(lang), [])

  return (
    <I18nProvider initialLanguage={language} onLanguageChange={onLanguageChange}>
      {children}
    </I18nProvider>
  )
}

function Shell() {
  const value = useMemo(() => null, [])
  void value
  return <AppRoutes />
}

export function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <SessionProvider>
          {/*
            `DocumentDirection` lit le profil actif ; il doit donc être à l'intérieur
            d'`AppStateProvider`. Le fournisseur i18n qui enveloppe les routes est
            créé ici pour rester aligné sur la langue affichée.
          */}
          <DocumentDirection>
            <OfflineBanner />
            <Shell />
          </DocumentDirection>
        </SessionProvider>
      </AppStateProvider>
    </BrowserRouter>
  )
}
