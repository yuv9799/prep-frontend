import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-surface-sunken">
      <div className="flex w-full flex-col justify-center px-5 py-10 sm:px-8 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral text-sm font-bold text-white"
              aria-hidden="true"
            >
              PF
            </span>
            <span className="text-lg font-semibold text-ink">PrepForge</span>
          </div>
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>
          <div className="mt-7">{children}</div>
          <div className="mt-6 text-sm text-ink-soft">{footer}</div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-purple-dusty lg:block lg:w-1/2">
        <div className="absolute -top-24 -right-16 h-96 w-96 rounded-full bg-coral/70 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-slate-deep/60 blur-3xl" />
        <div className="relative flex h-full flex-col justify-center px-14 text-white">
          <p className="text-sm tracking-widest text-white/70 uppercase">Placement preparation</p>
          <h2 className="mt-3 max-w-md text-3xl leading-tight font-semibold">
            Forged through practice, measured by progress.
          </h2>
          <ul className="mt-8 space-y-3 text-sm text-white/85">
            <li>· Curated subjects, topics and question banks</li>
            <li>· Spaced-revision scheduler with daily due queue</li>
            <li>· Project tracker and resume builder</li>
            <li>· Analytics on accuracy, streaks and study time</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export function AuthFooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="font-medium text-rose-muted hover:underline">
      {children}
    </Link>
  )
}
