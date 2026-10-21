export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  tone?: 'brand' | 'accent' | 'info' | 'positive'
  className?: string
}

const tones: Record<NonNullable<ProgressBarProps['tone']>, string> = {
  brand: 'bg-coral',
  accent: 'bg-purple-dusty',
  info: 'bg-slate-deep',
  positive: 'bg-positive',
}

const sizes: Record<NonNullable<ProgressBarProps['size']>, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  tone = 'brand',
  className = '',
}: ProgressBarProps) {
  const safeMax = max <= 0 ? 100 : max
  const percent = Math.min(100, Math.max(0, (value / safeMax) * 100))
  const rounded = Math.round(percent)

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label ? <span className="text-ink-soft">{label}</span> : <span />}
          {showValue && <span className="font-medium text-ink">{rounded}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className={`w-full overflow-hidden rounded-full bg-surface-sunken ${sizes[size]}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${tones[tone]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
