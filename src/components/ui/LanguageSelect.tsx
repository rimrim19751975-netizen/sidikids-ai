import { LANGUAGES, LANGUAGE_CODES } from '@/i18n/languages'
import { useI18n } from '@/i18n/I18nProvider'
import type { LanguageCode } from '@/lib/types'

interface LanguageSelectProps {
  readonly value: LanguageCode
  readonly onChange: (lang: LanguageCode) => void
  readonly label: string
  readonly help?: string
  readonly id: string
}

/** Sélecteur de langue : native names affichées, badge « à valider » si besoin. */
export function LanguageSelect({ value, onChange, label, help, id }: LanguageSelectProps) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-bold text-ink-700">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {LANGUAGE_CODES.map((code) => {
          const meta = LANGUAGES[code]
          const selected = value === code
          return (
            <button
              key={code}
              type="button"
              onClick={() => onChange(code)}
              aria-pressed={selected}
              className={[
                'flex min-h-14 flex-col items-start justify-center rounded-2xl px-3 py-2 text-start transition',
                selected ? 'bg-sky-soft-500 text-white shadow-md' : 'bg-white text-ink-900 ring-2 ring-sky-soft-100 hover:ring-sky-soft-300',
              ].join(' ')}
            >
              <span className={meta.dir === 'rtl' ? 'text-lg font-bold' : 'text-base font-bold'} dir={meta.dir} lang={code}>
                {meta.nativeName}
              </span>
              <span className={selected ? 'text-xs text-white/85' : 'text-xs text-ink-500'}>
                {meta.nameFr}
                {!meta.reviewedByNativeSpeaker ? ` · ${t('onboarding.languageReview')}` : ''}
              </span>
            </button>
          )
        })}
      </div>
      {help ? <p className="text-xs text-ink-500">{help}</p> : null}
      {!LANGUAGES[value].reviewedByNativeSpeaker ? (
        <p className="rounded-xl bg-sun-100 px-3 py-2 text-xs font-semibold text-sun-700">{LANGUAGES[value].reviewNote}</p>
      ) : null}
    </div>
  )
}
