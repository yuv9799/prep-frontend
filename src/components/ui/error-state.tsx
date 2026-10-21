import { AlertTriangle, RefreshCw } from 'lucide-react'
import { ApiError } from '../../api/client'
import { Button } from './button'

export interface ErrorStateProps {
  error?: unknown
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error) return error
  return fallback
}

export function ErrorState({
  error,
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}: ErrorStateProps) {
  const detail = message ?? getErrorMessage(error)

  return (
    <div
      role="alert"
      className={`pf-card flex flex-col items-center gap-3 border-danger/30 px-6 py-10 text-center ${className}`}
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full bg-coral-soft text-danger"
        aria-hidden="true"
      >
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-ink-soft">{detail}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
          Try again
        </Button>
      )}
    </div>
  )
}
