import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/i18n/I18nProvider'
import type { Activity } from '@/lib/types'

/**
 * Jeu de mémoire : retrouver les paires. Un seul essai par paire retournée,
 * pas de chronomètre stressant, pas de pénalité négative affichée.
 * Score mesuré = paires trouvées d'essais ; converti en `correct`/`total`
 * sur une échelle comparable aux autres activités.
 */

interface Card {
  readonly id: string
  readonly pairId: string
  readonly emoji: string
  readonly label: string
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = copy[i]!
    copy[i] = copy[j]!
    copy[j] = tmp
  }
  return copy
}

export function MemoryGame({
  activity,
  difficulty,
  onComplete,
  onRestart,
}: {
  readonly activity: Activity
  readonly difficulty: 1 | 2 | 3
  readonly onComplete: (correct: number, total: number, durationSeconds: number) => void
  readonly onRestart: () => void
}) {
  const { t, localizedText, formatNumber } = useI18n()
  const startedAt = useRef(Date.now())
  const reported = useRef(false)

  const deck = useMemo<Card[]>(() => {
    const pairs = activity.pairs ?? []
    const limit = difficulty === 1 ? 4 : difficulty === 2 ? 5 : 6
    const used = pairs.slice(0, Math.min(limit, pairs.length))
    const cards: Card[] = used.flatMap((pair) => [
      { id: `${pair.id}-a`, pairId: pair.id, emoji: pair.emoji, label: localizedText(pair.label).value },
      { id: `${pair.id}-b`, pairId: pair.id, emoji: pair.emoji, label: localizedText(pair.label).value },
    ])
    return shuffle(cards)
  }, [activity, difficulty, localizedText])

  const [flipped, setFlipped] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [busy, setBusy] = useState(false)

  const totalPairs = deck.length / 2

  useEffect(() => {
    if (activity.id) {
      startedAt.current = Date.now()
      reported.current = false
      setFlipped([])
      setMatched([])
      setMoves(0)
    }
  }, [activity.id, difficulty])

  useEffect(() => {
    if (totalPairs > 0 && matched.length === totalPairs && !reported.current) {
      reported.current = true
      const duration = Math.round((Date.now() - startedAt.current) / 1000)
      // Mesure : paires trouvées vs nombre minimal d'essais (1 essai par paire).
      onComplete(totalPairs, totalPairs, duration)
    }
  }, [matched, totalPairs, onComplete])

  const flip = (card: Card) => {
    if (busy || flipped.includes(card.id) || matched.includes(card.pairId)) return
    const next = [...flipped, card.id]
    setFlipped(next)
    if (next.length === 2) {
      setBusy(true)
      setMoves((m) => m + 1)
      const [firstId, secondId] = next
      const first = deck.find((c) => c.id === firstId)
      const second = deck.find((c) => c.id === secondId)
      const isPair = first && second && first.pairId === second.pairId
      window.setTimeout(() => {
        if (isPair) setMatched((prev) => [...prev, first.pairId])
        setFlipped([])
        setBusy(false)
      }, isPair ? 350 : 800)
    }
  }

  return (
    <div className="mx-auto mt-3 flex w-full max-w-3xl flex-col gap-4 px-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-black text-ink-900">{localizedText(activity.title).value}</h1>
        <p className="text-sm font-bold text-ink-500">
          {t('game.memoryPairs')} {formatNumber(matched.length)}/{formatNumber(totalPairs)} · {t('game.memoryMoves')}{' '}
          {formatNumber(moves)}
        </p>
      </header>
      <p className="rounded-2xl bg-sky-soft-50 px-4 py-2 text-sm font-semibold text-ink-700">
        {localizedText(activity.instruction).value}
      </p>

      <div
        className="grid grid-cols-3 gap-3 sm:grid-cols-4"
        role="group"
        aria-label={t('game.memoryTitle')}
      >
        {deck.map((card) => {
          const isFlipped = flipped.includes(card.id)
          const isMatched = matched.includes(card.pairId)
          const revealed = isFlipped || isMatched
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(card)}
              aria-pressed={revealed}
              aria-label={revealed ? card.label : t('game.memoryTitle')}
              className={[
                'flex aspect-square items-center justify-center rounded-2xl text-4xl font-black transition',
                'focus-ring',
                revealed ? 'bg-white text-ink-900 ring-2 ring-teal-brand-300' : 'bg-sky-soft-500 text-white',
                isMatched ? 'opacity-70 ring-4 ring-teal-brand-500' : '',
              ].join(' ')}
            >
              <motion.span
                key={revealed ? 'up' : 'down'}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.18 }}
                aria-hidden="true"
              >
                {revealed ? card.emoji : '❔'}
              </motion.span>
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex gap-2">
        <Button fullWidth size="lg" onClick={onRestart}>
          🔁 {t('common.restart')}
        </Button>
      </div>

      {matched.length === totalPairs && totalPairs > 0 ? (
        <motion.section
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="kid-card bg-teal-brand-50 p-5 text-center"
        >
          <p className="text-2xl font-black text-ink-900">🎉 {t('game.correct')}</p>
          <p className="text-sm font-semibold text-ink-700">
            {totalPairs} {t('game.memoryPairs').toLowerCase()} · {formatNumber(moves)} {t('game.memoryMoves').toLowerCase()}
          </p>
          <Button className="mt-3" fullWidth onClick={onRestart}>
            {t('game.playAgain')}
          </Button>
        </motion.section>
      ) : null}
    </div>
  )
}
