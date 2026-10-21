import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Plus, Trash2 } from 'lucide-react'
import {
  useCompleteTaskMutation,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useSubjectsQuery,
  useTasksQuery,
} from '../../hooks'
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FormField,
  LoadingSkeleton,
  useToast,
} from '../../components/ui'
import type { Task } from '../../types/model'

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subjectId: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  estimatedMinutes: z
    .string()
    .optional()
    .refine(
      (value) => value === undefined || value === '' || /^\d+$/.test(value),
      'Enter a whole number of minutes',
    )
    .refine(
      (value) => value === undefined || value === '' || Number(value) <= 1440,
      'Must be under 1440 minutes',
    ),
})

type TaskValues = z.infer<typeof taskSchema>

const statusStyles: Record<Task['status'], string> = {
  todo: 'bg-surface-sunken text-ink-soft',
  in_progress: 'bg-peach-soft text-rose-muted',
  done: 'bg-rose-muted-soft text-positive',
  skipped: 'bg-surface-sunken text-ink-faint',
}


export function PlannerPage() {
  const tasks = useTasksQuery()
  const subjects = useSubjectsQuery()
  const createTask = useCreateTaskMutation()
  const completeTask = useCompleteTaskMutation()
  const deleteTask = useDeleteTaskMutation()
  const toast = useToast()

  const [showForm, setShowForm] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null)
  const [filter, setFilter] = useState<'all' | Task['status']>('all')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', subjectId: '', dueDate: '', priority: 'medium' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createTask.mutateAsync({
        title: values.title,
        subjectId: values.subjectId || null,
        dueDate: values.dueDate || null,
        priority: values.priority,
        estimatedMinutes: values.estimatedMinutes ? Number(values.estimatedMinutes) : null,
      })
      reset()
      setShowForm(false)
      toast.success('Task created', 'Added to your study plan.')
    } catch (error) {
      toast.error('Could not create task', error instanceof Error ? error.message : undefined)
    }
  })

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteTask.mutateAsync(pendingDelete.id)
      toast.success('Task removed')
    } catch (error) {
      toast.error('Could not remove task', error instanceof Error ? error.message : undefined)
    } finally {
      setPendingDelete(null)
    }
  }

  const toggleComplete = async (task: Task) => {
    try {
      await completeTask.mutateAsync(task.id)
      toast.success('Task completed', "Nice work — that counts toward today's progress.")
    } catch (error) {
      toast.error('Could not update task', error instanceof Error ? error.message : undefined)
    }
  }

  const list = (tasks.data ?? []).filter((task) => filter === 'all' || task.status === filter)

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Planner</h1>
          <p className="mt-1 text-sm text-ink-soft">Break your preparation into concrete tasks.</p>
        </div>
        <Button onClick={() => setShowForm((value) => !value)} leftIcon={<Plus className="h-4 w-4" />}>
          {showForm ? 'Cancel' : 'New task'}
        </Button>
      </header>


      {showForm && (
        <form onSubmit={onSubmit} noValidate className="pf-card space-y-4 p-5">
          <FormField label="Task title" error={errors.title?.message} required>
            {(props) => (
              <input
                {...props}
                {...register('title')}
                type="text"
                className="pf-input"
                placeholder="Solve 15 sliding-window questions"
              />
            )}
          </FormField>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Subject" error={errors.subjectId?.message}>
              {(props) => (
                <select {...props} {...register('subjectId')} className="pf-input">
                  <option value="">None</option>
                  {(subjects.data ?? []).map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              )}
            </FormField>

            <FormField label="Due date" error={errors.dueDate?.message}>
              {(props) => (
                <input {...props} {...register('dueDate')} type="date" className="pf-input" />
              )}
            </FormField>

            <FormField label="Priority" error={errors.priority?.message}>
              {(props) => (
                <select {...props} {...register('priority')} className="pf-input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              )}
            </FormField>
          </div>

          <FormField label="Estimated minutes" error={errors.estimatedMinutes?.message}>
            {(props) => (
                <input
                  {...props}
                  {...register('estimatedMinutes')}
                  type="number"
                  min={0}
                  className="pf-input"
                  placeholder="60"
                />
            )}
          </FormField>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createTask.isPending}>
              Add task
            </Button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {(['all', 'todo', 'in_progress', 'done'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === value
                ? 'bg-coral text-white'
                : 'bg-surface text-ink-soft hover:bg-surface-sunken'
            }`}
          >
            {value.replace('_', ' ')}
          </button>
        ))}
      </div>


      {tasks.isLoading ? (
        <LoadingSkeleton variant="list" />
      ) : tasks.isError ? (
        <ErrorState
          error={tasks.error}
          title="Could not load your tasks"
          onRetry={() => void tasks.refetch()}
        />
      ) : list.length === 0 ? (
        <EmptyState
          title="Nothing scheduled"
          description="Create a task to plan your next study block."
          actionLabel="New task"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <ul className="space-y-2">
          {list.map((task) => (
            <li key={task.id} className="pf-card flex items-center gap-3 p-4">
              <button
                type="button"
                onClick={() => void toggleComplete(task)}
                disabled={task.status === 'done' || completeTask.isPending}
                aria-label={task.status === 'done' ? `${task.title} completed` : `Complete ${task.title}`}
                className={`shrink-0 rounded-full border-2 transition-colors ${
                  task.status === 'done'
                    ? 'border-positive bg-positive text-white'
                    : 'border-line-strong text-transparent hover:border-coral'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${
                    task.status === 'done' ? 'text-ink-faint line-through' : 'text-ink'
                  }`}
                >
                  {task.title}
                </p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {task.dueDate ? `Due ${task.dueDate}` : 'No due date'}
                  {task.estimatedMinutes ? ` · ${task.estimatedMinutes} min` : ''}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[task.status]}`}
              >
                {task.status.replace('_', ' ')}
              </span>

              <button
                type="button"
                onClick={() => setPendingDelete(task)}
                aria-label={`Delete ${task.title}`}
                className="shrink-0 rounded p-1.5 text-ink-faint transition-colors hover:bg-coral-soft hover:text-danger"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this task?"
        description={
          pendingDelete ? `"${pendingDelete.title}" will be removed from your plan.` : undefined
        }
        confirmLabel="Delete"
        destructive
        isLoading={deleteTask.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
