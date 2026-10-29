import type { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  readonly title: string
  readonly description?: string
  readonly emoji?: string
  readonly action?: { readonly label: string; readonly onClick: () => void }
  readonly children?: ReactNode
}

export function EmptyState({ title, description, emoji = '🌾', action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-sky-soft-200 bg-white/70 px-6 py-10 text-center">
      <span aria-hidden="true" className="text-5xl">
        {emoji}
      </span>
      <p className="text-lg font-semibold text-ink-900">{title}</p>
      {description ? <p className="max-w-md text-sm text-ink-500">{description}</p> : null}
      {action ? (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
      {children}
    </div>
  )
}

export function ErrorState({ message, onRetry, retryLabel }: { readonly message: string; readonly onRetry?: () => void; readonly retryLabel: string }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-3xl bg-rose-50 px-6 py-8 text-center ring-1 ring-rose-200">
      <span aria-hidden="true" className="text-4xl">
        ⚠️
      </span>
      <p className="font-semibold text-rose-900">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}

export function LoadingState({ label }: { readonly label: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-10 text-ink-500">
      <span className="h-6 w-6 animate-spin rounded-full border-3 border-sky-soft-300 border-t-sky-soft-600" />
      <span>{label}</span>
    </div>
  )
}
