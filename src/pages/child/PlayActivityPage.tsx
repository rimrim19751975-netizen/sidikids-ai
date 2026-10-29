import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ChildHeader } from '@/components/child/Mascot'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppState } from '@/hooks/AppState'
import { getActivity } from '@/data/activities'
import { buildSessionResult, nextDifficulty, startingDifficulty } from '@/lib/progress'
import { useAudio } from '@/lib/audio'
import type { ActivityOption, LanguageCode, SessionResult } from '@/lib/types'
import { MemoryGame } from '@/features/games/MemoryGame'
import { StoryGame } from '@/features/games/StoryGame'

/**
 * Moteur de session commun aux jeux « choix illustré ».
 * - 5 à 8 questions, ~3-7 minutes
 * - retour encourageant + explication après CHAQUE réponse
 * - un seul enregistrement de résultat par partie (progression mesurée)
 */

type Phase = 'playing' | 'feedback' | 'done'

interface AnswerLog {
  readonly optionId: string
  readonly correct: boolean
}

export function PlayActivityPage() {
  const { activityId } = useParams<{ activityId: string }>()
  const navigate = useNavigate()
  const { t, uiLanguage, localizedText, formatNumber } = useI18n()
  const { activeProfile, resultsForActive, addResult, settings } = useAppState()
  const audio = useAudio(settings.soundEnabled)

  const activity = activityId ? getActivity(activityId) : undefined

  const questions = useMemo(() => {
    if (!activity?.options) return []
    // Deux présentations : l'ordre des options ne favorise jamais une position fixe.
    return [activity.options, [...activity.options].reverse()]
  }, [activity])

  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(() =>
    activeProfile ? startingDifficulty(activeProfile.ageGroup) : 1,
  )
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('playing')
  const [log, setLog] = useState<AnswerLog[]>([])
  const [startedAt] = useState(() => Date.now())
  const [lastAnswer, setLastAnswer] = useState<AnswerLog | null>(null)
  const [audioMessage, setAudioMessage] = useState<string | null>(null)
  const savedRef = useRef(false)

  useEffect(() => {
    if (!audio.slow && settings.slowAudio) audio.setSlow(true)
  }, [audio, settings.slowAudio])

  const finish = useCallback(() => {
    if (!activity || !activeProfile || savedRef.current) return
    savedRef.current = true
    const correct = log.filter((entry) => entry.correct).length
    const result: SessionResult = buildSessionResult(
      activeProfile,
      activity,
      {
        correct,
        total: Math.max(1, log.length),
        durationSeconds: Math.round((Date.now() - startedAt) / 1000),
      },
      difficulty,
    )
    addResult(result)
    setPhase('done')
  }, [activity, activeProfile, addResult, difficulty, log, startedAt])

  const chooseOption = (option: ActivityOption) => {
    if (phase !== 'playing') return
    const entry: AnswerLog = { optionId: option.id, correct: option.isCorrect }
    setLastAnswer(entry)
    setLog((prev) => [...prev, entry])
    setPhase('feedback')
  }

  const goNext = () => {
    if (index + 1 >= questions.length) {
      finish()
      return
    }
    setIndex((i) => i + 1)
    setLastAnswer(null)
    setPhase('playing')
  }

  const restart = () => {
    savedRef.current = false
    setIndex(0)
    setLog([])
    setLastAnswer(null)
    setPhase('playing')
  }

  if (!activity) {
    return (
      <main className="min-h-dvh bg-bg-page">
        <ChildHeader />
        <div className="mx-auto max-w-xl px-4 py-8">
          <p className="kid-card p-6 text-center font-bold text-ink-900">{t('common.empty')}</p>
          <Button className="mt-4" fullWidth onClick={() => navigate('/enfant')}>
            {t('game.backToMap')}
          </Button>
        </div>
      </main>
    )
  }

  if (!activeProfile) {
    return (
      <main className="min-h-dvh bg-bg-page">
        <ChildHeader />
        <div className="mx-auto max-w-xl px-4 py-8">
          <p className="kid-card p-6 text-center font-bold text-ink-900">{t('home.pickProfile')}</p>
          <Button className="mt-4" fullWidth onClick={() => navigate('/enfant/nouveau')}>
            {t('home.newPlayer')}
          </Button>
        </div>
      </main>
    )
  }

  const contentLanguage: LanguageCode = activity.learningLanguages.includes(activeProfile.learningLanguage)
    ? activeProfile.learningLanguage
    : 'fr'
  const title = localizedText(activity.title, contentLanguage)
  const instruction = localizedText(activity.instruction, contentLanguage)

  const playInstruction = async () => {
    const outcome = await audio.play(contentLanguage, activity.audioKey)
    if (outcome.status === 'missing') setAudioMessage(t('game.audioMissing'))
    else setAudioMessage(null)
  }

  const correctOption = activity.options?.find((o) => o.isCorrect)
  const recentResults = resultsForActive.filter((r) => r.skill === activity.skill)
  const suggestedNext = nextDifficulty(difficulty, recentResults)

  const header = (
    <div className="mx-auto w-full max-w-3xl px-4 pt-3">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/enfant')} aria-label={t('game.exit')}>
          ✕ {t('game.exit')}
        </Button>
        <div className="flex items-center gap-1" aria-label={`${t('child.difficulty')}: ${difficulty}`}>
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => {
                setDifficulty(level as 1 | 2 | 3)
                restart()
              }}
              className={`h-9 min-w-9 rounded-xl px-2 text-xs font-black ${
                level <= difficulty ? 'bg-sun-500 text-ink-900' : 'bg-white text-ink-300 ring-1 ring-sky-soft-200'
              }`}
              aria-pressed={level === difficulty}
              aria-label={`${t('common.level')} ${level}${level === suggestedNext ? ' ⭐' : ''}`}
            >
              {level === 1 ? t('child.easy') : level === 2 ? t('child.medium') : t('child.hard')}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div
          className="h-3 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-sky-soft-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={Math.min(log.length, questions.length)}
        >
          <div
            className="h-full rounded-full bg-teal-brand-500 transition-all"
            style={{ width: `${questions.length ? (Math.min(log.length, questions.length) / questions.length) * 100 : 0}%` }}
          />
        </div>
        <span className="text-xs font-bold text-ink-500">
          {formatNumber(Math.min(index + 1, questions.length))}/{formatNumber(questions.length)}
        </span>
      </div>
    </div>
  )

  if (activity.mode === 'memory') {
    return (
      <main className="min-h-dvh bg-bg-page">
        <ChildHeader />
        {header}
        <MemoryGame
          activity={activity}
          difficulty={difficulty}
          onComplete={(correct, total, duration) => {
            if (!savedRef.current && activeProfile) {
              savedRef.current = true
              addResult(buildSessionResult(activeProfile, activity, { correct, total, durationSeconds: duration }, difficulty))
            }
          }}
          onRestart={restart}
        />
      </main>
    )
  }

  if (activity.mode === 'story') {
    return (
      <main className="min-h-dvh bg-bg-page">
        <ChildHeader />
        {header}
        <StoryGame
          activity={activity}
          language={contentLanguage}
          onComplete={(correct, total) => {
            if (!savedRef.current && activeProfile) {
              savedRef.current = true
              addResult(
                buildSessionResult(
                  activeProfile,
                  activity,
                  { correct, total, durationSeconds: Math.round((Date.now() - startedAt) / 1000) },
                  difficulty,
                ),
              )
            }
          }}
          onRestart={restart}
        />
      </main>
    )
  }

  const options = questions[index] ?? []
  const correctCount = log.filter((entry) => entry.correct).length

  return (
    <main className="min-h-dvh bg-bg-page pb-10">
      <ChildHeader />
      {header}

      <div className="mx-auto mt-3 flex w-full max-w-3xl flex-col gap-4 px-4">
        {phase === 'done' ? (
          <section className="kid-card flex flex-col items-center gap-3 p-6 text-center">
            <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="text-6xl" aria-hidden="true">
              {correctCount === questions.length ? '🏆' : correctCount >= questions.length / 2 ? '🌟' : '💪'}
            </motion.span>
            <h1 className="text-2xl font-black text-ink-900">{t('game.resultTitle')}</h1>
            <p className="text-4xl font-black text-teal-brand-600">
              {formatNumber(correctCount)}/{formatNumber(questions.length)}
            </p>
            <p className="text-ink-500">{t('game.resultCorrect')}</p>
            <p className="rounded-2xl bg-sky-soft-50 px-4 py-3 font-bold text-ink-900">
              {correctCount >= questions.length / 2 ? t('game.resultEncourage') : t('game.resultEncourageLow')}
            </p>
            <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
              <Button fullWidth size="lg" onClick={restart}>
                🔁 {t('game.playAgain')}
              </Button>
              <Button fullWidth size="lg" variant="secondary" onClick={() => navigate('/enfant')}>
                🗺️ {t('game.backToMap')}
              </Button>
            </div>
          </section>
        ) : (
          <>
              <section className="kid-card p-5" dir="auto">
              <h1 className="text-xl font-black text-ink-900">
                <span lang={title.needsReview ? undefined : contentLanguage}>{title.value}</span>
              </h1>
              <div className="mt-2 flex items-start gap-3">
                <p className="flex-1 text-lg font-semibold text-ink-700" dir="auto">
                  {phase === 'playing' || !lastAnswer
                    ? instruction.value
                    : lastAnswer.correct
                      ? localizedText(activity.explanation, contentLanguage).value
                      : `${localizedText(activity.explanation, contentLanguage).value}`}
                </p>
                <Button variant="secondary" size="sm" onClick={() => void playInstruction()} aria-label={t('game.listen')}>
                  🔊
                </Button>
              </div>
              {audioMessage ? (
                <p className="mt-2 rounded-xl bg-sun-100 px-3 py-2 text-xs font-semibold text-sun-700">{audioMessage}</p>
              ) : null}
              {!instruction.value ? <p className="text-sm text-ink-500">{t('game.instruction')}</p> : null}
            </section>

            <AnimatePresence mode="wait">
              <motion.section
                key={`${index}-${phase}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                aria-live="polite"
              >
                {options.map((option) => {
                  const chosen = lastAnswer?.optionId === option.id
                  const showCorrect = phase === 'feedback' && option.isCorrect
                  const showWrong = phase === 'feedback' && chosen && !option.isCorrect
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={phase !== 'playing'}
                      onClick={() => chooseOption(option)}
                      className={[
                        'flex min-h-32 flex-col items-center justify-center gap-2 rounded-3xl p-4 text-lg font-black transition',
                        'focus-ring disabled:cursor-default',
                        showCorrect
                          ? 'bg-teal-brand-100 ring-4 ring-teal-brand-500 text-teal-brand-700'
                          : showWrong
                            ? 'bg-rose-50 ring-4 ring-rose-300 text-rose-800'
                            : 'bg-white ring-2 ring-sky-soft-200 hover:-translate-y-0.5 hover:ring-sky-soft-400',
                      ].join(' ')}
                    >
                      <span aria-hidden="true" className="text-4xl">
                        {option.emoji}
                      </span>
                      <span dir="auto">{option.label ? localizedText(option.label, contentLanguage).value : ''}</span>
                      {showCorrect ? <span className="text-base">✓</span> : null}
                      {showWrong ? <span className="text-base">↺</span> : null}
                    </button>
                  )
                })}
              </motion.section>
            </AnimatePresence>

            {phase === 'feedback' && lastAnswer ? (
              <section
                className={`kid-card flex flex-col gap-2 p-4 ${lastAnswer.correct ? 'bg-teal-brand-50' : 'bg-sun-100'}`}
                aria-live="assertive"
                dir="auto"
              >
                <p className="text-xl font-black text-ink-900">
                  {lastAnswer.correct ? `🎉 ${t('game.correct')}` : `💡 ${t('game.incorrect')}`}
                </p>
                <p className="text-sm font-semibold text-ink-700">
                  {t('game.explanation')} {localizedText(activity.explanation, contentLanguage).value}
                </p>
                {!lastAnswer.correct && correctOption ? (
                  <p className="text-sm font-bold text-teal-brand-700">
                    {t('game.correctAnswer')} : {localizedText(correctOption.label, contentLanguage).value}
                  </p>
                ) : null}
                <Button size="lg" fullWidth onClick={goNext}>
                  {index + 1 >= questions.length ? t('game.finish') : t('game.next')}
                </Button>
              </section>
            ) : null}

            <p className="text-center text-xs text-ink-500" lang={uiLanguage === 'ar' ? 'ar' : undefined}>
              {t('teacher.measuredNote')}
            </p>
          </>
        )}
      </div>
    </main>
  )
}
