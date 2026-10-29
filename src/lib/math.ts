/**
 * Calcul mental et génération d'exercices.
 * Module PUR (aucun accès au DOM) : testé dans `src/test/math.test.ts`.
 */

export type Operation = '+' | '-' | '×'

export interface MathQuestion {
  readonly a: number
  readonly b: number
  readonly op: Operation
  readonly answer: number
}

export function computeAnswer(a: number, b: number, op: Operation): number {
  switch (op) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '×':
      return a * b
  }
}

/** Bornes par difficulté — pensées pour les programmes CP/CE1/CE2/CM1. */
const RANGES: Record<1 | 2 | 3, { max: number; ops: readonly Operation[] }> = {
  1: { max: 10, ops: ['+', '-'] },
  2: { max: 20, ops: ['+', '-', '×'] },
  3: { max: 50, ops: ['+', '-', '×'] },
}

/**
 * Génère une question dont le résultat reste positif ou nul (pas de nombres
 * négatifs avant le CE2) et dont la multiplication reste dans les tables connues.
 */
export function generateQuestion(difficulty: 1 | 2 | 3, rng: () => number = Math.random): MathQuestion {
  const { max, ops } = RANGES[difficulty]
  const op = ops[Math.floor(rng() * ops.length)] ?? '+'
  let a: number
  let b: number
  if (op === '×') {
    const tableMax = difficulty === 3 ? 10 : 5
    a = 1 + Math.floor(rng() * tableMax)
    b = 1 + Math.floor(rng() * Math.min(10, difficulty === 3 ? 10 : 5))
  } else {
    a = 1 + Math.floor(rng() * max)
    b = 1 + Math.floor(rng() * max)
  }
  if (op === '-' && b > a) {
    const tmp = a
    a = b
    b = tmp
  }
  return { a, b, op, answer: computeAnswer(a, b, op) }
}

/** Propose 3 leurres plausibles et distincts, sans nombre négatif. */
export function buildDistractors(answer: number, rng: () => number = Math.random): number[] {
  const candidates = new Set<number>()
  const deltas = [-2, -1, 1, 2, 3, 10]
  for (const delta of deltas) {
    const value = answer + delta
    if (value >= 0 && value !== answer) candidates.add(value)
  }
  const pool = [...candidates]
  // Mélange partiel déterministe vis-à-vis du rng fourni.
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = pool[i]!
    pool[i] = pool[j]!
    pool[j] = tmp
  }
  return pool.slice(0, 3)
}

/** Ajoute la bonne réponse à la liste et mélange. */
export function shuffleWithAnswer(answer: number, rng: () => number = Math.random): number[] {
  const values = [answer, ...buildDistractors(answer, rng)]
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = values[i]!
    values[i] = values[j]!
    values[j] = tmp
  }
  return values
}

/** Nombre de questions d'une partie : courtes, 3 à 7 minutes. */
export function questionCountFor(ageGroup: '5-7' | '8-10', difficulty: 1 | 2 | 3): number {
  if (ageGroup === '5-7') return difficulty === 1 ? 5 : 6
  return difficulty === 3 ? 8 : 7
}
