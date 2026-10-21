import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { Button } from './button'

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`pf-card flex flex-col items-center justify-center gap-3 px-6 py-12 text-center ${className}`}
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full bg-coral-soft text-coral"
        aria-hidden="true"
      >
        {icon ?? <Inbox className="h-6 w-6" />}
      </span>
      <div>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
