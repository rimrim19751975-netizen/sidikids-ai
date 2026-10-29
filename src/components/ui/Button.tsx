import type { ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'sun' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-sky-soft-500 text-white hover:bg-sky-soft-600 active:bg-sky-soft-700 shadow-md',
  secondary: 'bg-white text-ink-900 ring-2 ring-sky-soft-200 hover:ring-sky-soft-400 hover:bg-sky-soft-50',
  ghost: 'bg-transparent text-ink-700 hover:bg-sky-soft-100',
  sun: 'bg-sun-500 text-ink-900 hover:bg-sun-600 hover:text-white shadow-md',
  danger: 'bg-rose-100 text-rose-800 hover:bg-rose-200',
}

/** Hauteurs tactiles : 48 px minimum (sm réservé aux barres d'outils adultes). */
const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3 text-sm gap-1.5',
  md: 'min-h-12 px-5 text-base gap-2',
  lg: 'min-h-16 px-7 text-xl gap-3',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant
  readonly size?: ButtonSize
  readonly fullWidth?: boolean
  readonly children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center rounded-2xl font-semibold transition',
        'focus-ring disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
