import type { Category } from '@/lib/types'

/** Classes Tailwind explicites par accent (jamais construites dynamiquement). */
export const ACTIVITY_ACCENT: Record<
  Category['accent'],
  { bg: string; bar: string; text: string; ring: string }
> = {
  blue: { bg: 'bg-sky-soft-100', bar: 'bg-sky-soft-500', text: 'text-sky-soft-700', ring: 'ring-sky-soft-300' },
  teal: { bg: 'bg-teal-brand-100', bar: 'bg-teal-brand-500', text: 'text-teal-brand-700', ring: 'ring-teal-brand-300' },
  yellow: { bg: 'bg-sun-100', bar: 'bg-sun-500', text: 'text-sun-700', ring: 'ring-sun-300' },
  violet: { bg: 'bg-grape-100', bar: 'bg-grape-500', text: 'text-grape-700', ring: 'ring-grape-300' },
  green: { bg: 'bg-emerald-100', bar: 'bg-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-300' },
  orange: { bg: 'bg-orange-100', bar: 'bg-orange-500', text: 'text-orange-700', ring: 'ring-orange-300' },
  rose: { bg: 'bg-rose-100', bar: 'bg-rose-500', text: 'text-rose-700', ring: 'ring-rose-300' },
  indigo: { bg: 'bg-indigo-100', bar: 'bg-indigo-500', text: 'text-indigo-700', ring: 'ring-indigo-300' },
}
