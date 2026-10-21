import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Clock,
  Flame,
  ListChecks,
  RefreshCw,
  Target,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { useDashboardQuery, useSubjectProgressQuery, useTasksQuery, useRevisionsQuery } from '../../hooks'
import { ErrorState, LoadingSkeleton, ProgressBar, StatCard, EmptyState } from '../../components/ui'
import type { Task } from '../../types/model'

const statusStyles: Record<Task['status'], string> = {
  todo: 'bg-surface-sunken text-ink-soft',
  in_progress: 'bg-peach-soft text-rose-muted',
  done: 'bg-rose-muted-soft text-positive',
  skipped: 'bg-surface-sunken text-ink-faint',
}

export function DashboardPage() {
  const dashboard = useDashboardQuery()
  const progress = useSubjectProgressQuery()
  const tasks = useTasksQuery('todo')
  const revisions = useRevisionsQuery()

  if (dashboard.isLoading) {
    return (
      <div className="space-y-5">
        <LoadingSkeleton className="h-8 w-64" variant="text" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingSkeleton key={index} variant="card" />
          ))}
        </div>
        <LoadingSkeleton variant="list" />
      </div>
    )
  }

  if (dashboard.isError) {
    return (
      <ErrorState
        error={dashboard.error}
        title="Could not load your dashboard"
        onRetry={() => void dashboard.refetch()}
      />
    )
  }

  const summary = dashboard.data

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-soft">Your preparation snapshot for today.</p>
        </div>
        <Link
          to="/app/questions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-muted hover:underline"
        >
          Start practising <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Minutes studied"
          value={summary?.minutesStudiedToday ?? 0}
          icon={<Clock className="h-4.5 w-4.5" />}
          tone="info"
          hint="today"
        />
        <StatCard
          label="Questions solved"
          value={summary?.questionsSolvedToday ?? 0}
          icon={<ListChecks className="h-4.5 w-4.5" />}
          tone="brand"
          hint="today"
        />
        <StatCard
          label="Accuracy"
          value={`${Math.round(summary?.accuracyToday ?? 0)}%`}
          icon={<Target className="h-4.5 w-4.5" />}
          tone="accent"
          hint="today"
        />
        <StatCard
          label="Streak"
          value={`${summary?.streakDays ?? 0}d`}
          icon={<Flame className="h-4.5 w-4.5" />}
          tone="peach"
          hint="consecutive days"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="pf-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Subject progress</h2>
            <Link to="/app/subjects" className="text-xs font-medium text-rose-muted hover:underline">
              View all
            </Link>
          </div>

          {progress.isLoading ? (
            <LoadingSkeleton variant="list" />
          ) : progress.data && progress.data.length > 0 ? (
            <ul className="space-y-4">
              {progress.data.map((item) => (
                <li key={item.subjectId}>
                  <ProgressBar
                    value={item.completionPercent}
                    label={item.subjectName}
                    showValue
                    tone="brand"
                  />
                  <p className="mt-1 text-xs text-ink-faint">
                    {item.questionsSolved} of {item.questionsTotal} questions solved
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No subject progress yet"
              description="Pick a subject and start solving questions to track your coverage."
            />
          )}
        </section>

        <section className="pf-card p-5">
          <h2 className="mb-4 text-base font-semibold text-ink">Revisions due</h2>
          {revisions.isLoading ? (
            <LoadingSkeleton variant="text" />
          ) : (
            <div className="flex items-center gap-4">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-soft text-xl font-semibold text-rose-muted"
                aria-hidden="true"
              >
                {summary?.revisionsDue ?? 0}
              </span>
              <div>
                <p className="text-sm text-ink-soft">
                  {summary?.revisionsDue
                    ? 'items are ready for a spaced review.'
                    : 'Nothing due — you are all caught up.'}
                </p>
                <Link
                  to="/app/revisions"
                  className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-rose-muted hover:underline"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  Review queue
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="pf-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Open tasks</h2>
          <Link to="/app/planner" className="text-xs font-medium text-rose-muted hover:underline">
            Open planner
          </Link>
        </div>

        {tasks.isLoading ? (
          <LoadingSkeleton variant="list" />
        ) : tasks.data && tasks.data.length > 0 ? (
          <ul className="divide-y divide-line">
            {tasks.data.slice(0, 6).map((task) => (
              <li key={task.id} className="flex items-center gap-3 py-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{task.title}</p>
                  {task.dueDate && <p className="text-xs text-ink-faint">Due {task.dueDate}</p>}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[task.status]}`}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No open tasks"
            description="Plan your study blocks in the planner to see them here."
          />
        )}
      </section>

      <p className="flex items-center gap-1.5 text-xs text-ink-faint">
        <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
        Keep your streak alive by completing at least one task a day.
      </p>
    </div>
  )
}
