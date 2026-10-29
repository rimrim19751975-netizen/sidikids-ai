import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nProvider'
import { useAppState } from '@/hooks/AppState'
import { AVATARS } from '@/data/badges'

/**
 * Mascotte + bulle de dialogue. Sidi la gazelle est le guide original de l'app :
 * dessinée en SVG (aucune image externe, fonctionne hors ligne).
 */
export function Mascot({ size = 96, mood = 'happy' }: { readonly size?: number; readonly mood?: 'happy' | 'thinking' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Sidi la gazelle, guide de SIDIKIDS"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="sidiFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f6c46a" />
        </linearGradient>
      </defs>
      {/* Cornes */}
      <path d="M40 30 C32 16 36 8 46 6" stroke="#8b5cf6" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M80 30 C88 16 84 8 74 6" stroke="#8b5cf6" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Oreilles */}
      <ellipse cx="28" cy="52" rx="10" ry="16" transform="rotate(-25 28 52)" fill="#f6c46a" />
      <ellipse cx="92" cy="52" rx="10" ry="16" transform="rotate(25 92 52)" fill="#f6c46a" />
      {/* Tête */}
      <ellipse cx="60" cy="66" rx="34" ry="31" fill="url(#sidiFace)" />
      {/* Museau */}
      <ellipse cx="60" cy="82" rx="16" ry="12" fill="#fff7d6" />
      <circle cx="60" cy="84" r="3.5" fill="#16233b" />
      {/* Yeux */}
      <circle cx="47" cy="60" r="5" fill="#16233b" />
      <circle cx="73" cy="60" r="5" fill="#16233b" />
      <circle cx="48.8" cy="58" r="1.8" fill="#fff" />
      <circle cx="74.8" cy="58" r="1.8" fill="#fff" />
      {/* Sourire */}
      <path
        d={mood === 'happy' ? 'M50 92 Q60 100 70 92' : 'M52 94 H68'}
        stroke="#16233b"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Joues */}
      <circle cx="38" cy="76" r="5" fill="#fca5a5" opacity="0.5" />
      <circle cx="82" cy="76" r="5" fill="#fca5a5" opacity="0.5" />
    </svg>
  )
}

interface BubbleProps {
  readonly children: React.ReactNode
  readonly mood?: 'happy' | 'thinking'
  readonly compact?: boolean
}

export function MascotBubble({ children, mood = 'happy', compact = false }: BubbleProps) {
  return (
    <div className="flex items-center gap-3">
      <Mascot size={compact ? 56 : 92} mood={mood} />
      <div className="kid-card relative px-4 py-3 text-base font-semibold text-ink-900 sm:text-lg">{children}</div>
    </div>
  )
}

/** En-tête de l'univers enfant : accueil, réglages, changement de joueur. */
export function ChildHeader() {
  const { t } = useI18n()
  const { activeProfile, clearActiveProfile } = useAppState()
  const avatar = AVATARS.find((a) => a.id === activeProfile?.avatar)

  return (
    <header className="flex items-center justify-between gap-2 px-4 pt-4">
      <Link to="/enfant" className="flex items-center gap-2 rounded-2xl px-1 py-1 focus-ring" aria-label={t('child.map')}>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-soft-500 text-lg font-black text-white">S</span>
        <span className="hidden text-lg font-black tracking-tight text-ink-900 sm:inline">{t('app.name')}</span>
      </Link>
      <div className="flex items-center gap-2">
        <Link
          to="/enfant/reglages"
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-xl shadow ring-1 ring-sky-soft-200 focus-ring"
          aria-label={t('child.settings')}
        >
          <span aria-hidden="true">⚙️</span>
        </Link>
        {activeProfile ? (
          <button
            type="button"
            onClick={clearActiveProfile}
            className="flex min-h-11 items-center gap-2 rounded-2xl bg-white px-3 py-1 text-sm font-bold text-ink-700 shadow ring-1 ring-sky-soft-200 focus-ring"
          >
            <span aria-hidden="true" className="text-lg">
              {avatar?.emoji ?? '🙂'}
            </span>
            <span className="max-w-24 truncate">{activeProfile.displayName}</span>
          </button>
        ) : null}
      </div>
    </header>
  )
}
