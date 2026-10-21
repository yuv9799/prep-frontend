import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, ChevronRight, Search, XCircle } from 'lucide-react'
import { useQuestionsQuery, useAttemptQuestionMutation, useSubjectsQuery } from '../../hooks'
import { EmptyState, ErrorState, LoadingSkeleton, Button, useToast } from '../../components/ui'
import type { Question } from '../../types/model'

const difficultyTone: Record<Question['difficulty'], string> = {
  easy: 'bg-rose-muted-soft text-positive',
  medium: 'bg-peach-soft text-caution',
  hard: 'bg-coral-soft text-danger',
}

export function QuestionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const subjectId = searchParams.get('subjectId') ?? undefined
  const topicId = searchParams.get('topicId') ?? undefined
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Question | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [result, setResult] = useState<{ isCorrect: boolean } | null>(null)

  const subjects = useSubjectsQuery()
  const questions = useQuestionsQuery({ subjectId, topicId, search: search || undefined })
  const attempt = useAttemptQuestionMutation()
  const toast = useToast()

  const filtered = useMemo(() => {
    const list = questions.data ?? []
    if (!search.trim()) return list
    const term = search.trim().toLowerCase()
    return list.filter((question) => question.title.toLowerCase().includes(term))
  }, [questions.data, search])

  const openQuestion = (question: Question) => {
    setSelected(question)
    setAnswer(null)
    setResult(null)
  }

  const submitAnswer = async () => {
    if (!selected || answer === null) return
    try {
      const response = await attempt.mutateAsync({ id: selected.id, answer })
      const isCorrect = response?.isCorrect ?? false
      setResult({ isCorrect })
      toast.success(
        isCorrect ? 'Correct' : 'Incorrect',
        isCorrect ? 'Nice work. Keep the streak going.' : 'Review the explanation below.',
      )
    } catch (error) {
      toast.error(
        'Could not submit answer',
        error instanceof Error ? error.message : 'Please try again.',
      )
    }
  }

  const setFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }


  if (questions.isLoading) {
    return (
      <div className="space-y-5">
        <LoadingSkeleton className="h-8 w-56" variant="text" />
        <LoadingSkeleton variant="list" />
      </div>
    )
  }

  if (questions.isError) {
    return (
      <ErrorState
        error={questions.error}
        title="Could not load questions"
        onRetry={() => void questions.refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Practice</h1>
          <p className="mt-1 text-sm text-ink-soft">Solve questions and build accuracy.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-faint"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search questions"
            aria-label="Search questions"
            className="pf-input pl-9"
          />
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <select
          aria-label="Filter by subject"
          value={subjectId ?? ''}
          onChange={(event) => setFilter('subjectId', event.target.value || null)}
          className="pf-input w-auto"
        >
          <option value="">All subjects</option>
          {(subjects.data ?? []).map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        {(subjectId || topicId) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
            leftIcon={<XCircle className="h-3.5 w-3.5" />}
          >
            Clear filters
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No questions match"
          description="Adjust your filters or search term to find more questions."
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((question) => (
            <li key={question.id}>
              <button
                type="button"
                onClick={() => openQuestion(question)}
                className="pf-card flex w-full items-center gap-3 p-4 text-left transition-colors hover:border-line-strong"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{question.title}</p>
                  <p className="mt-1 text-xs text-ink-faint">
                    {question.type.toUpperCase()}
                    {question.accuracy !== undefined
                      ? ` · ${Math.round(question.accuracy)}% accuracy`
                      : ''}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${difficultyTone[question.difficulty]}`}
                >
                  {question.difficulty}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}


      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            className="pf-card max-h-[85vh] w-full max-w-2xl overflow-y-auto p-5 shadow-lift"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-ink">{selected.title}</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close question"
                className="rounded p-1 text-ink-faint hover:bg-surface-sunken hover:text-ink"
              >
                <XCircle className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>

            {selected.body && <p className="mt-3 text-sm text-ink-soft">{selected.body}</p>}

            <ul className="mt-4 space-y-2">
              {(selected.options ?? []).map((option, index) => {
                const optionId = option.id ?? String(index)
                const isChosen = answer === optionId
                return (
                  <li key={optionId}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-control)] border p-3 text-sm transition-colors ${
                        isChosen
                          ? 'border-coral bg-coral-soft text-ink'
                          : 'border-line-strong text-ink-soft hover:bg-surface-sunken'
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={optionId}
                        checked={isChosen}
                        onChange={() => setAnswer(optionId)}
                        disabled={result !== null}
                        className="accent-coral"
                      />
                      <span>{option.text}</span>
                    </label>
                  </li>
                )
              })}
            </ul>

            {result && (
              <div
                className={`mt-4 rounded-[var(--radius-control)] p-3 text-sm ${
                  result.isCorrect
                    ? 'bg-rose-muted-soft text-positive'
                    : 'bg-coral-soft text-danger'
                }`}
                role="status"
              >
                <p className="flex items-center gap-1.5 font-medium">
                  {result.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                  )}
                  {result.isCorrect ? 'Correct answer' : 'Not quite'}
                </p>
                {selected.explanation && (
                  <p className="mt-1 text-ink-soft">{selected.explanation}</p>
                )}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
              {!result && (
                <Button
                  onClick={() => void submitAnswer()}
                  disabled={answer === null}
                  isLoading={attempt.isPending}
                >
                  Submit answer
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
