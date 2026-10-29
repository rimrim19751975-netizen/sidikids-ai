import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChildHeader, MascotBubble } from '@/components/child/Mascot'
import { Button } from '@/components/ui/Button'
import { LanguageSelect } from '@/components/ui/LanguageSelect'
import { EmptyState } from '@/components/ui/States'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppState } from '@/hooks/AppState'
import type { LanguageCode } from '@/lib/types'

export function ChildSettingsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { activeProfile, updateProfile, settings, setSettings, deleteProfile } = useAppState()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleted, setDeleted] = useState(false)

  if (!activeProfile) {
    return (
      <main className="min-h-dvh bg-bg-page">
        <ChildHeader />
        <div className="mx-auto max-w-3xl px-4 py-8">
          <EmptyState title={t('home.pickProfile')} emoji="🙂" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-bg-page pb-12">
      <ChildHeader />
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-4">
        <MascotBubble compact>{t('child.settings')}</MascotBubble>

        {deleted ? (
          <p role="status" className="kid-card bg-teal-brand-50 p-4 font-bold text-teal-brand-700">
            {t('privacy.deleted')}
          </p>
        ) : null}

        <section className="kid-card flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink-900">🔊 {t('child.sound')}</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.soundEnabled}
              onClick={() => setSettings({ soundEnabled: !settings.soundEnabled })}
              className={`min-h-11 min-w-20 rounded-full px-4 text-sm font-black ${
                settings.soundEnabled ? 'bg-teal-brand-500 text-white' : 'bg-slate-200 text-ink-700'
              }`}
            >
              {settings.soundEnabled ? t('common.yes') : t('common.no')}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink-900">🐢 {t('child.slowAudio')}</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.slowAudio}
              onClick={() => setSettings({ slowAudio: !settings.slowAudio })}
              className={`min-h-11 min-w-20 rounded-full px-4 text-sm font-black ${
                settings.slowAudio ? 'bg-teal-brand-500 text-white' : 'bg-slate-200 text-ink-700'
              }`}
            >
              {settings.slowAudio ? t('common.yes') : t('common.no')}
            </button>
          </div>
          <p className="rounded-xl bg-sun-100 px-3 py-2 text-xs font-semibold text-sun-700">{t('privacy.audioNote')}</p>
        </section>

        <section className="kid-card flex flex-col gap-4 p-4">
          <LanguageSelect
            id="settings-ui-language"
            label={t('onboarding.uiLanguageLabel')}
            value={activeProfile.uiLanguage}
            onChange={(lang: LanguageCode) => updateProfile(activeProfile.id, { uiLanguage: lang })}
          />
          <LanguageSelect
            id="settings-learning-language"
            label={t('onboarding.learningLanguageLabel')}
            value={activeProfile.learningLanguage}
            onChange={(lang: LanguageCode) => updateProfile(activeProfile.id, { learningLanguage: lang })}
          />
        </section>

        <section className="kid-card p-4">
          <h2 className="font-bold text-ink-900">{t('child.switchProfile')}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate('/')}>
              👋 {t('child.switchProfile')}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/enfant/progression')}>
              🏅 {t('child.progress')}
            </Button>
          </div>
        </section>

        <section className="kid-card flex flex-col gap-2 p-4">
          <h2 className="font-bold text-ink-900">{t('privacy.deletion')}</h2>
          <p className="text-xs text-ink-500">{t('privacy.deletionText')}</p>
          {confirmDelete ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="danger"
                onClick={() => {
                  deleteProfile(activeProfile.id)
                  setConfirmDelete(false)
                  setDeleted(true)
                }}
              >
                {t('common.yes')}, {t('privacy.deleteProfile')}
              </Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              🗑️ {t('privacy.deleteProfile')}
            </Button>
          )}
        </section>
      </div>
    </main>
  )
}
