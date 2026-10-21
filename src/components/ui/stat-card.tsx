import type { ReactNode } from 'react'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

export interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
  trend?: number
  trendLabel?: string
  tone?: 'brand' | 'accent' | 'info' | 'peach' | 'positive'
  className?: string
}

const tones: Record<NonNullable<StatCardProps['tone']>, string> = {
  brand: 'bg-coral-soft text-coral',
  accent: 'bg-purple-dusty-soft text-purple-dusty',
  info: 'bg-slate-deep-soft text-slate-deep',
  peach: 'bg-peach-soft text-rose-muted',
  positive: 'bg-rose-muted-soft text-positive',
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  trend,
  trendLabel,
  tone = 'brand',
  className = '',
}: StatCardProps) {
  const TrendIcon = trend === undefined ? Minus : trend >= 0 ? TrendingUp : TrendingDown
  const trendColor =
    trend === undefined ? 'text-ink-faint' : trend >= 0 ? 'text-positive' : 'text-danger'

  return (
    <div className={`pf-card p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium tracking-wide text-ink-soft uppercase">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold text-ink">{value}</p>
        </div>
        {icon && (
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>
      {(hint || trend !== undefined) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend !== undefined && (
            <span className={`inline-flex items-center gap-1 font-medium ${trendColor}`}>
              <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {trend > 0 ? '+' : ''}
              {trend}
              {trendLabel ? ` ${trendLabel}` : '%'}
            </span>
          )}
          {hint && <span className="truncate text-ink-faint">{hint}</span>}
        </div>
      )}
    </div>
  )
}
