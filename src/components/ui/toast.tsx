import type { ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react'
import { useToast } from './toast-context'
import type { ToastVariant } from './toast-context'

const variantStyles: Record<ToastVariant, { icon: ReactNode; accent: string }> = {
  success: { icon: <CheckCircle2 className="h-4 w-4 text-positive" />, accent: 'border-l-positive' },
  error: { icon: <XCircle className="h-4 w-4 text-danger" />, accent: 'border-l-danger' },
  warning: { icon: <AlertCircle className="h-4 w-4 text-caution" />, accent: 'border-l-caution' },
  info: { icon: <Info className="h-4 w-4 text-slate-deep" />, accent: 'border-l-slate-deep' },
}

export function ToastViewport() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((item) => {
        const style = variantStyles[item.variant]
        return (
          <div
            key={item.id}
            role="status"
            className={`pf-card pointer-events-auto flex items-start gap-3 border-l-4 p-3.5 shadow-lift ${style.accent}`}
          >
            <span className="mt-0.5 shrink-0" aria-hidden="true">
              {style.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 text-xs text-ink-soft">{item.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label={`Dismiss ${item.title}`}
              className="shrink-0 rounded p-1 text-ink-faint transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
