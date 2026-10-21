export function LoadingSkeleton({
  className = '',
  variant = 'text',
}: {
  className?: string
  variant?: 'text' | 'card' | 'list' | 'table'
}) {
  if (variant === 'card') {
    return (
      <div className={`pf-card p-4 ${className}`} aria-hidden="true">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-sunken" />
        <div className="mt-3 h-7 w-16 animate-pulse rounded bg-surface-sunken" />
        <div className="mt-4 h-2 w-full animate-pulse rounded bg-surface-sunken" />
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <ul className="space-y-2" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <li
            key={index}
            className="pf-card flex items-center gap-4 p-3.5"
          >
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-surface-sunken" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/5 animate-pulse rounded bg-surface-sunken" />
              <div className="h-2.5 w-3/5 animate-pulse rounded bg-surface-sunken" />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (variant === 'table') {
    return (
      <div className="pf-card overflow-hidden" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-b-0"
          >
            <div className="h-3 w-1/3 animate-pulse rounded bg-surface-sunken" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-surface-sunken" />
            <div className="ml-auto h-3 w-16 animate-pulse rounded bg-surface-sunken" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      <div className="h-3 w-full animate-pulse rounded bg-surface-sunken" />
      <div className="h-3 w-4/5 animate-pulse rounded bg-surface-sunken" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-surface-sunken" />
    </div>
  )
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  )
}
