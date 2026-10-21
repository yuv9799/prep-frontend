import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, Layers } from 'lucide-react'
import { useSubjectsQuery, useTopicsQuery } from '../../hooks'
import { EmptyState, ErrorState, LoadingSkeleton, ProgressBar } from '../../components/ui'
import type { Subject } from '../../types/model'

const categoryLabels: Record<Subject['category'], string> = {
  dsa: 'Data structures & algorithms',
  core: 'Core CS',
  aptitude: 'Aptitude',
  db: 'Databases',
  os: 'Operating systems',
  cn: 'Computer networks',
  other: 'Other',
}

function SubjectCard({ subject }: { subject: Subject }) {
  const [expanded, setExpanded] = useState(false)
  const topics = useTopicsQuery(expanded ? subject.id : undefined, expanded)

  return (
    <li className="pf-card overflow-hidden">
      <div className="flex items-start gap-4 p-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-dusty-soft text-purple-dusty"
          aria-hidden="true"
        >
          <BookOpen className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-ink">{subject.name}</h3>
          <p className="mt-0.5 text-xs text-ink-soft">
            {categoryLabels[subject.category]}
            {subject.questionsCount ? ` · ${subject.questionsCount} questions` : ''}
          </p>
          {subject.description && (
            <p className="mt-1.5 line-clamp-2 text-xs text-ink-faint">{subject.description}</p>
          )}
          {typeof subject.completionPercent === 'number' && (
            <ProgressBar
              className="mt-3"
              value={subject.completionPercent}
              showValue
              size="sm"
              tone="accent"
            />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Hide' : 'Show'} topics for ${subject.name}`}
            className="rounded p-1.5 text-ink-faint transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
              aria-hidden="true"
            />
          </button>
          <Link
            to={`/app/questions?subjectId=${subject.id}`}
            className="rounded-[var(--radius-control)] border border-line-strong px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            Practise
          </Link>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-line bg-surface-raised px-4 py-3">
          {topics.isLoading ? (
            <LoadingSkeleton variant="text" />
          ) : topics.data && topics.data.length > 0 ? (
            <ul className="space-y-1.5">
              {topics.data.map((topic) => (
                <li key={topic.id} className="flex items-center gap-2 text-sm text-ink-soft">
                  <Layers className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
                  <span className="truncate">{topic.name}</span>
                  {topic.questionsCount ? (
                    <span className="ml-auto text-xs text-ink-faint">{topic.questionsCount} Q</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-faint">No topics published for this subject yet.</p>
          )}
        </div>
      )}
    </li>
  )
}

export function SubjectsPage() {
  const subjects = useSubjectsQuery()

  if (subjects.isLoading) {
    return (
      <div className="space-y-5">
        <LoadingSkeleton className="h-8 w-48" variant="text" />
        <LoadingSkeleton variant="list" />
      </div>
    )
  }

  if (subjects.isError) {
    return (
      <ErrorState
        error={subjects.error}
        title="Could not load subjects"
        onRetry={() => void subjects.refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Subjects</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Browse the curriculum, expand a subject to see its topics, then practise.
        </p>
      </header>

      {subjects.data && subjects.data.length > 0 ? (
        <ul className="space-y-3">
          {subjects.data.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No subjects available"
          description="The curriculum has not been published yet. Check back shortly."
        />
      )}
    </div>
  )
}

