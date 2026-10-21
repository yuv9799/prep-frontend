import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Clock, Flame, Target, Trophy } from 'lucide-react'
import { useAnalyticsOverviewQuery, useSubjectProgressQuery } from '../../hooks'
import { EmptyState, ErrorState, LoadingSkeleton, ProgressBar, StatCard } from '../../components/ui'

const CHART_COLORS = ['#F2727F', '#C06C84', '#6C5C7E', '#355D7F', '#F9B294']

export function AnalyticsPage() {
  const overview = useAnalyticsOverviewQuery()
  const progress = useSubjectProgressQuery()

  if (overview.isLoading) {
    return (
      <div className="space-y-5">
        <LoadingSkeleton className="h-8 w-56" variant="text" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingSkeleton key={index} variant="card" />
          ))}
        </div>
        <LoadingSkeleton variant="card" />
      </div>
    )
  }

  if (overview.isError) {
    return (
      <ErrorState
        error={overview.error}
        title="Could not load analytics"
        onRetry={() => void overview.refetch()}
      />
    )
  }

  const data = overview.data
  const trend = data?.accuracyTrend ?? []
  const subjectData = progress.data ?? data?.bySubject ?? []

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-ink-soft">Measure the work, then adjust the plan.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Questions solved"
          value={data?.totalQuestionsSolved ?? 0}
          icon={<Target className="h-4.5 w-4.5" />}
          tone="brand"
        />
        <StatCard
          label="Overall accuracy"
          value={`${Math.round(data?.overallAccuracy ?? 0)}%`}
          icon={<Trophy className="h-4.5 w-4.5" />}
          tone="accent"
        />
        <StatCard
          label="Total minutes"
          value={data?.totalMinutes ?? 0}
          icon={<Clock className="h-4.5 w-4.5" />}
          tone="info"
        />
        <StatCard
          label="Current streak"
          value={`${data?.currentStreak ?? 0}d`}
          icon={<Flame className="h-4.5 w-4.5" />}
          tone="peach"
        />
      </div>

      {trend.length > 0 ? (
        <section className="pf-card p-5">
          <h2 className="mb-4 text-base font-semibold text-ink">Accuracy trend</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e3e0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8b8593' }} />
                <YAxis tick={{ fontSize: 11, fill: '#8b8593' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.5rem',
                    border: '1px solid #e7e3e0',
                    fontSize: '0.75rem',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Line
                  type="monotone"
                  dataKey="questions"
                  name="Questions"
                  stroke="#F2727F"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  name="Minutes"
                  stroke="#355D7F"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}

      {subjectData.length > 0 ? (
        <section className="pf-card p-5">
          <h2 className="mb-4 text-base font-semibold text-ink">Questions solved by subject</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e3e0" vertical={false} />
                <XAxis dataKey="subjectName" tick={{ fontSize: 11, fill: '#8b8593' }} />
                <YAxis tick={{ fontSize: 11, fill: '#8b8593' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.5rem',
                    border: '1px solid #e7e3e0',
                    fontSize: '0.75rem',
                  }}
                />
                <Bar dataKey="questionsSolved" name="Solved" radius={[6, 6, 0, 0]}>
                  {subjectData.map((entry, index) => (
                    <Cell key={entry.subjectId} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-5 space-y-3">
            {subjectData.map((item) => (
              <li key={item.subjectId}>
                <ProgressBar
                  value={item.completionPercent}
                  label={item.subjectName}
                  showValue
                  tone="accent"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <EmptyState
          title="No analytics yet"
          description="Solve a few questions and your trends will appear here."
        />
      )}
    </div>
  )
}
