import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ChildHeader, MascotBubble } from '@/components/child/Mascot'
import { Button } from '@/components/ui/Button'
import { LanguageSelect } from '@/components/ui/LanguageSelect'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppState } from '@/hooks/AppState'
import { AVATARS } from '@/data/badges'
import type { AvatarId, LanguageCode } from '@/lib/types'

const schema = z.object({
  displayName: z.string().trim().min(2).max(20),
  age: z.number().int().min(5).max(10),
  parentalConsent: z.literal(true),
})

export function OnboardingPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { createProfile } = useAppState()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [displayName, setDisplayName] = useState('')
  const [age, setAge] = useState<number>(6)
  const [avatar, setAvatar] = useState<AvatarId>('sidi')
  const [uiLanguage, setUiLanguage] = useState<LanguageCode>('fr')
  const [learningLanguage, setLearningLanguage] = useState<LanguageCode>('fr')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const submit = () => {
    const parsed = schema.safeParse({ displayName, age, parentalConsent: consent })
    if (!parsed.success) {
      const keys = parsed.error.issues.map((issue) =>
        issue.path[0] === 'parentalConsent' ? 'onboarding.consentError' : 'onboarding.nameError',
      )
      setErrors([...new Set(keys)])
      return
    }
    setErrors([])
    createProfile({
      displayName: parsed.data.displayName,
      age: parsed.data.age,
      avatar,
      uiLanguage,
      learningLanguage,
      parentalConsent: true,
    })
    navigate('/enfant')
  }

  return (
    <main className="dune-bg min-h-dvh pb-16">
      <ChildHeader />
      <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pt-4">
        <MascotBubble mood="thinking">{t('onboarding.title')}</MascotBubble>

        <div className="flex gap-1" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <span key={n} className={`h-2 flex-1 rounded-full ${step >= n ? 'bg-sky-soft-500' : 'bg-sky-soft-100'}`} />
          ))}
        </div>

        {step === 1 ? (
          <section className="kid-card flex flex-col gap-4 p-5">
            <div>
              <label htmlFor="displayName" className="text-lg font-black text-ink-900">
                {t('onboarding.nameLabel')}
              </label>
              <input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="off"
                maxLength={20}
                aria-describedby="name-help"
                className="mt-2 min-h-14 w-full rounded-2xl border-2 border-sky-soft-200 px-4 text-lg font-semibold focus:border-sky-soft-500 focus-ring"
                placeholder="Sidi"
              />
              <p id="name-help" className="mt-1 text-xs text-ink-500">
                {t('onboarding.nameHelp')}
              </p>
            </div>

            <fieldset>
              <legend className="text-lg font-black text-ink-900">{t('onboarding.ageLabel')}</legend>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {[5, 6, 7, 8, 9, 10].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={age === value}
                    onClick={() => setAge(value)}
                    className={`min-h-14 rounded-2xl text-xl font-black transition ${
                      age === value ? 'bg-sky-soft-500 text-white shadow-md' : 'bg-sky-soft-50 text-ink-900 hover:bg-sky-soft-100'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="mt-2 rounded-xl bg-teal-brand-50 px-3 py-2 text-xs font-semibold text-teal-brand-700">
                {age <= 7 ? t('onboarding.ageHint5') : t('onboarding.ageHint8')}
              </p>
            </fieldset>

            <Button size="lg" fullWidth onClick={() => setStep(2)}>
              {t('common.continue')}
            </Button>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="kid-card flex flex-col gap-4 p-5">
            <fieldset>
              <legend className="text-lg font-black text-ink-900">{t('onboarding.avatarLabel')}</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {AVATARS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={avatar === option.id}
                    onClick={() => setAvatar(option.id)}
                    className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl p-2 text-xs font-bold transition ${
                      avatar === option.id ? 'bg-grape-100 ring-3 ring-grape-500' : 'bg-sky-soft-50 hover:bg-sky-soft-100'
                    }`}
                  >
                    <span aria-hidden="true" className="text-3xl">
                      {option.emoji}
                    </span>
                    {option.name.fr}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="flex gap-2">
              <Button variant="secondary" size="lg" onClick={() => setStep(1)}>
                {t('common.back')}
              </Button>
              <Button size="lg" fullWidth onClick={() => setStep(3)}>
                {t('common.continue')}
              </Button>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="kid-card flex flex-col gap-4 p-5">
            <LanguageSelect
              id="ui-language"
              label={t('onboarding.uiLanguageLabel')}
              value={uiLanguage}
              onChange={setUiLanguage}
            />
            <LanguageSelect
              id="learning-language"
              label={t('onboarding.learningLanguageLabel')}
              help={t('onboarding.learningLanguageHelp')}
              value={learningLanguage}
              onChange={setLearningLanguage}
            />
            <label className="flex min-h-14 items-center gap-3 rounded-2xl bg-sun-100 px-4 py-3 text-sm font-bold text-ink-900">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="h-6 w-6 shrink-0 accent-sky-soft-500"
              />
              {t('onboarding.consent')}
            </label>
            {errors.length > 0 ? (
              <ul role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
                {errors.map((key) => (
                  <li key={key}>{t(key as 'onboarding.nameError')}</li>
                ))}
              </ul>
            ) : null}
            <div className="flex gap-2">
              <Button variant="secondary" size="lg" onClick={() => setStep(2)}>
                {t('common.back')}
              </Button>
              <Button size="lg" fullWidth onClick={submit}>
                {t('onboarding.submit')}
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}
