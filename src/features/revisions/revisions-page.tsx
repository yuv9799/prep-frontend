import { RefreshCw } from 'lucide-react'
import { useReviewMutation, useRevisionsQuery } from '../../hooks'
import { Button, EmptyState, ErrorState, LoadingSkeleton, useToast } from '../../components/ui'
import type { RevisionItem } from '../../types/model'

const stageTone: Record<RevisionItem['stage'], string> = {
  due: 'bg-coral-soft text-danger',
  scheduled: 'bg-peach-soft text-caution',
  completed: 'bg-rose-muted-soft text-positive',
}

export function RevisionsPage() {
  const revisions = useRevisionsQuery()
  const review = useReviewMutation()
  const toast = useToast()

  const handleReview = async (item: RevisionItem, quality: number) => {
    try {
      await review.mutateAsync({ id: item.id, quality })
      toast.success('Review recorded', 'Next review has been scheduled.')
    } catch (error) {
      toast.error('Could not record review', error instanceof Error ? error.message : undefined)
    }
  }

  if (revisions.isLoading) {
    return (
      <div className="space-y-5">
        <LoadingSkeleton className="h-8 w-56" variant="text" />
        <LoadingSkeleton variant="list" />
      </div>
    )
  }

  if (revisions.isError) {
    return (
      <ErrorState
        error={revisions.error}
        title="Could not load your revision queue"
        onRetry={() => void revisions.refetch()}
      />
    )
  }

  const items = revisions.data ?? []
  const due = items.filter((item) => item.stage === 'due')

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Revisions</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Spaced repetition keeps what you learn fresh. {due.length} item
          {due.length === 1 ? '' : 's'} due today.
        </p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="No revisions scheduled"
          description="Revisions are created automatically as you complete questions and topics."
        />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="pf-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    Next review {item.nextReviewAt} · interval {item.intervalDays}d
                    {item.repetitions ? ` · ${item.repetitions} reps` : ''}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${stageTone[item.stage]}`}
                >
                  {item.stage}
                </span>
              </div>

              {item.stage === 'due' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => void handleReview(item, 5)}
                    isLoading={review.isPending}
                    leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                  >
                    Mark as recalled
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void handleReview(item, 2)}
                    isLoading={review.isPending}
                  >
                    Needs work
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
