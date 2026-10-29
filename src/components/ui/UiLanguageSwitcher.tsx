import { useI18n } from '@/i18n/I18nProvider'
import { LANGUAGES } from '@/i18n/languages'

/**
 * Changement de langue de l'interface, visible sur chaque écran.
 * Met aussi à jour `document.documentElement.lang/dir` pour le RTL.
 */
export function UiLanguageSwitcher({ compact = false }: { readonly compact?: boolean }) {
  const { uiLanguage, setUiLanguage, t } = useI18n()
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
      <span className="sr-only sm:not-sr-only">{t('common.language')}</span>
      <select
        value={uiLanguage}
        onChange={(event) => setUiLanguage(event.target.value as typeof uiLanguage)}
        aria-label={t('common.language')}
        className={[
          'min-h-11 rounded-xl border-2 border-sky-soft-200 bg-white px-3 font-bold text-ink-900 focus-ring',
          compact ? 'py-1 text-sm' : '',
        ].join(' ')}
      >
        {Object.values(LANGUAGES).map((meta) => (
          <option key={meta.code} value={meta.code}>
            {meta.nativeName}
            {meta.reviewedByNativeSpeaker ? '' : ' •'}
          </option>
        ))}
      </select>
    </label>
  )
}
