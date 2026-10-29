import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/i18n/I18nProvider'
import type { Activity, ActivityOption, LanguageCode } from '@/lib/types'

/** Conte interactif : on lit, on écoute, et on répond à des questions du récit. */
export function StoryGame({
  activity,
  language,
  onComplete,
  onRestart,
}: {
  readonly activity: Activity
  readonly language: LanguageCode
  readonly onComplete: (correct: number, total: number) => void
  readonly onRestart: () => void
}) {
  const { t, localizedText, formatNumber } = useI18n()
  const steps = activity.story ?? []
  const [stepIndex, setStepIndex] = useState(0)
  const [chosen, setChosen] = useState<ActivityOption | null>(null)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState(false)

  const step = steps[stepIndex]
  const answered = chosen !== null

  const answer = (option: ActivityOption) => {
    if (answered) return
    setChosen(option)
    if (option.isCorrect) setCorrect((c) => c + 1)
  }

  const next = () => {
    if (stepIndex + 1 >= steps.length) {
      setFinished(true)
      onComplete(correct + (chosen?.isCorrect ? 0 : 0), steps.length)
      return
    }
    setStepIndex((i) => i + 1)
    setChosen(null)
  }

  const restart = () => {
    setStepIndex(0)
    setChosen(null)
    setCorrect(0)
    setFinished(false)
    onRestart()
  }

  if (!step || steps.length === 0) {
    return <p className="mx-auto max-w-xl px-4 py-8 text-center font-bold">{t('common.empty')}</p>
  }

  const text = localizedText(step.text, language)
  const question = localizedText(step.question, language)
  const explanation = localizedText(step.explanation, language)
  const correctOption = step.options.find((o) => o.isCorrect)

  return (
    <div className="mx-auto mt-3 flex w-full max-w-3xl flex-col gap-4 px-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-black text-ink-900">{localizedText(activity.title, language).value}</h1>
        <p className="text-sm font-bold text-ink-500">
          {formatNumber(stepIndex + 1)}/{formatNumber(steps.length)}
        </p>
      </header>

      {finished ? (
        <section className="kid-card flex flex-col items-center gap-3 p-6 text-center">
          <span aria-hidden="true" className="text-6xl">
            📖
          </span>
          <h2 className="text-2xl font-black text-ink-900">{t('game.storyEnd')}</h2>
          <p className="text-3xl font-black text-teal-brand-600">
            {formatNumber(correct)}/{formatNumber(steps.length)}
          </p>
          <p className="font-bold text-ink-700">{t('game.resultEncourage')}</p>
          <Button fullWidth size="lg" onClick={restart}>
            🔁 {t('game.playAgain')}
          </Button>
        </section>
      ) : (
        <>
          <motion.section
            key={step.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            className="kid-card flex flex-col gap-3 p-5"
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-5xl">
                {step.emoji}
              </span>
              <p className="flex-1 text-lg font-semibold text-ink-900">{text.value}</p>
            </div>
            <p className="text-base font-bold text-grape-700">{question.value}</p>
          </motion.section>

          <AnimatePresence mode="wait">
            <section className="grid gap-3 sm:grid-cols-3" aria-live="polite">
              {step.options.map((option) => {
                const isChosen = chosen?.id === option.id
                const showCorrect = answered && option.isCorrect
                const showWrong = answered && isChosen && !option.isCorrect
                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    disabled={answered}
                    onClick={() => answer(option)}
                    className={[
                      'flex min-h-28 flex-col items-center justify-center gap-1 rounded-3xl p-3 text-base font-black transition focus-ring',
                      showCorrect
                        ? 'bg-teal-brand-100 ring-4 ring-teal-brand-500'
                        : showWrong
                          ? 'bg-rose-50 ring-4 ring-rose-300'
                          : 'bg-white ring-2 ring-sky-soft-200 hover:ring-sky-soft-400',
                    ].join(' ')}
                  >
                    <span aria-hidden="true" className="text-3xl">
                      {option.emoji}
                    </span>
                    {localizedText(option.label, language).value}
                  </motion.button>
                )
              })}
            </section>
          </AnimatePresence>

          {answered ? (
            <section className="kid-card bg-sun-100 p-4">
              <p className="font-black text-ink-900">{chosen?.isCorrect ? `🎉 ${t('game.correct')}` : `💡 ${t('game.incorrect')}`}</p>
              <p className="text-sm font-semibold text-ink-700">{explanation.value}</p>
              {!chosen?.isCorrect && correctOption ? (
                <p className="text-sm font-bold text-teal-brand-700">
                  {t('game.correctAnswer')} : {localizedText(correctOption.label, language).value}
                </p>
              ) : null}
              <Button className="mt-3" fullWidth size="lg" onClick={next}>
                {stepIndex + 1 >= steps.length ? t('game.finish') : t('game.storyNext')}
              </Button>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}
