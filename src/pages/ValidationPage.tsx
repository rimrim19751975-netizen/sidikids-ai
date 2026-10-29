import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ACTIVITIES } from '@/data/activities'
import { LANGUAGES, LANGUAGE_CODES } from '@/i18n/languages'
import { resolveLocalizedText } from '@/i18n/I18nProvider'
import { useI18n } from '@/i18n/I18nProvider'
import { UiLanguageSwitcher } from '@/components/ui/UiLanguageSwitcher'
import type { LanguageCode } from '@/lib/types'

/**
 * Interface de validation linguistique.
 * Liste, pour chaque langue non relue, les contenus et audios qui doivent être
 * vérifiés par un locuteur natif. Aucun statut n'est marqué « validé » sans
 * relecture documentée dans les données.
 */
export function ValidationPage() {
  const { t } = useI18n()
  const [filter, setFilter] = useState<LanguageCode>('hassaniya')

  const rows = useMemo(
    () =>
      ACTIVITIES.map((activity) => {
        const title = resolveLocalizedText(activity.title, filter)
        return {
          id: activity.id,
          title: title.value,
          missing: title.missing,
          needsReview: title.needsReview,
          textStatus: activity.validation[filter],
          audioStatus: activity.audio[filter],
        }
      }),
    [filter],
  )

  const toReview = rows.filter((row) => row.textStatus !== 'validated').length
  const withText = rows.filter((row) => !row.missing).length

  return (
    <main className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-sky-soft-700">
            ← {t('common.back')}
          </Link>
          <UiLanguageSwitcher compact />
        </div>

        <header className="adult-card p-5">
          <h1 className="text-xl font-bold text-ink-900">{t('validation.title')}</h1>
          <p className="mt-1 text-sm text-ink-500">{t('validation.intro')}</p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-sm font-semibold text-ink-700">
              {t('validation.filter')}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as LanguageCode)}
                className="ms-2 min-h-10 rounded-lg border border-slate-300 px-2"
              >
                {LANGUAGE_CODES.map((code) => (
                  <option key={code} value={code}>
                    {LANGUAGES[code].nativeName} — {LANGUAGES[code].nameFr}
                  </option>
                ))}
              </select>
            </label>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink-700">
              {toReview} {t('validation.items')}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink-700">
              {withText}/{ACTIVITIES.length} textes présents
            </span>
          </div>
          <p className="mt-2 rounded-lg bg-sun-100 px-3 py-2 text-xs font-semibold text-sun-700">
            {LANGUAGES[filter].reviewNote}
          </p>
        </header>

        <div className="mt-4 overflow-x-auto adult-card">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">{t('validation.title')}</caption>
            <thead className="bg-slate-50 text-xs uppercase text-ink-500">
              <tr>
                <th scope="col" className="px-3 py-2">ID</th>
                <th scope="col" className="px-3 py-2">Texte</th>
                <th scope="col" className="px-3 py-2">{t('common.language')}</th>
                <th scope="col" className="px-3 py-2">Audio</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs text-ink-500">{row.id}</td>
                  <td className="px-3 py-2">{row.missing ? '— (français en secours)' : row.title}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        row.textStatus === 'validated'
                          ? 'bg-teal-brand-100 text-teal-brand-700'
                          : row.textStatus === 'needs-review'
                            ? 'bg-sun-100 text-sun-700'
                            : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {row.textStatus === 'validated'
                        ? t('validation.statusValidated')
                        : row.textStatus === 'needs-review'
                          ? t('validation.statusNeedsReview')
                          : t('validation.statusMissing')}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {row.audioStatus === 'validated'
                      ? t('validation.audioValidated')
                      : row.audioStatus === 'pending'
                        ? t('validation.audioPending')
                        : t('validation.audioMissing')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
