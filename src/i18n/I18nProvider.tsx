import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LANGUAGES, formatNumber } from '@/i18n/languages'
import type { LanguageCode, LocalizedText } from '@/lib/types'
import { ar } from './locales/ar'
import { fr, type Dictionary, type TranslationKey } from './locales/fr'
import { hassaniya } from './locales/hassaniya'
import { pulaar } from './locales/pulaar'
import { wolof } from './locales/wolof'

export const DICTIONARIES: Readonly<Record<LanguageCode, Dictionary>> = { fr, ar, hassaniya, pulaar, wolof }

export type TranslationParams = Record<string, string | number>

/** Interpolation simple `{name}` — sans dépendance externe. */
function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key]
    return value === undefined ? match : String(value)
  })
}

export type TFunction = (key: TranslationKey, params?: TranslationParams) => string

export interface I18nValue {
  readonly uiLanguage: LanguageCode
  readonly setUiLanguage: (lang: LanguageCode) => void
  readonly t: TFunction
  readonly dir: 'ltr' | 'rtl'
  readonly isReviewed: boolean
  readonly formatNumber: (value: number) => string
  /**
   * Résout un texte localisé dans la langue d'interface courante. Accepte une
   * langue explicite pour l'espace enfant, où la langue d'apprentissage peut
   * différer de la langue de l'interface.
   */
  readonly localizedText: (
    text: LocalizedText,
    lang?: LanguageCode,
  ) => { value: string; needsReview: boolean; missing: boolean }
}

const I18nContext = createContext<I18nValue | null>(null)

/**
 * Résout un texte localisé pour une langue donnée.
 * - Si la traduction manque, on retombe sur le français et on l'indique
 *   (`missing: true`) : on n'invente jamais une traduction.
 * - `needsReview` est vrai si la langue n'est pas dans `validated`.
 */
export function resolveLocalizedText(
  text: LocalizedText,
  lang: LanguageCode,
): { value: string; needsReview: boolean; missing: boolean } {
  const raw = text[lang]
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return { value: raw, needsReview: !text.validated.includes(lang), missing: false }
  }
  return { value: text.fr, needsReview: lang !== 'fr', missing: true }
}

interface I18nProviderProps {
  readonly initialLanguage: LanguageCode
  readonly onLanguageChange?: (lang: LanguageCode) => void
  readonly children: ReactNode
}

export function I18nProvider({ initialLanguage, onLanguageChange, children }: I18nProviderProps) {
  const [uiLanguage, setUiLanguageState] = useState<LanguageCode>(initialLanguage)

  // Synchronise le provider quand la langue source change (ex. profil actif
  // créé en arabe, ou langue modifiée depuis les réglages). Sans cet effet,
  // `useState(initialLanguage)` ignorait les changements et l'interface
  // restait bloquée en français — d'où l'impression que l'arabe n'existait pas.
  useEffect(() => {
    setUiLanguageState(initialLanguage)
  }, [initialLanguage])

  const setUiLanguage = useCallback(
    (lang: LanguageCode) => {
      setUiLanguageState(lang)
      onLanguageChange?.(lang)
    },
    [onLanguageChange],
  )

  const value = useMemo<I18nValue>(() => {
    const dictionary = DICTIONARIES[uiLanguage]
    const t: TFunction = (key, params) => {
      const template = dictionary[key] ?? fr[key]
      return interpolate(template, params)
    }
    return {
      uiLanguage,
      setUiLanguage,
      t,
      dir: LANGUAGES[uiLanguage].dir,
      isReviewed: LANGUAGES[uiLanguage].reviewedByNativeSpeaker,
      formatNumber: (n: number) => formatNumber(n, uiLanguage),
      localizedText: (text: LocalizedText, lang?: LanguageCode) => resolveLocalizedText(text, lang ?? uiLanguage),
    }
  }, [uiLanguage, setUiLanguage])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n doit être utilisé dans <I18nProvider>')
  return ctx
}

/** Traductions statiques pour les tests et la validation linguistique. */
export function dictionaryFor(lang: LanguageCode): Dictionary {
  return DICTIONARIES[lang]
}
