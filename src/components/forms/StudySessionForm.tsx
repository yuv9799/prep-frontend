import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useStudySessions } from '../../hooks/use-study-sessions'
import type { StudySessionDTO } from '../../types/model'

const sessionSchema = z.object({
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  taskId: z.string().optional(),
  startedAt: z.string().min(1, 'Start time is required'),
  endedAt: z.string().optional(),
  durationSeconds: z.string().optional().refine((value) => !value || /^\d+$/.test(value), 'Enter a whole number'),
  sessionType: z.enum(['study', 'practice', 'revision', 'mock']),
  notes: z.string().max(5000).optional(),
})

type SessionFormValues = z.infer<typeof sessionSchema>

export function StudySessionForm({
  initialSession,
  onSessionCreated,
  onSessionUpdated,
}: {
  initialSession?: StudySessionDTO
  onSessionCreated?: (session: StudySessionDTO) => void
  onSessionUpdated?: (session: StudySessionDTO) => void
}) {
  const { createMutation, updateMutation } = useStudySessions()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      subjectId: initialSession?.subjectId ?? '',
      topicId: initialSession?.topicId ?? '',
      taskId: initialSession?.taskId ?? '',
      startedAt: initialSession?.startedAt ? new Date(initialSession.startedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      endedAt: initialSession?.endedAt ? new Date(initialSession.endedAt).toISOString().slice(0, 16) : '',
      durationSeconds: initialSession?.durationSeconds?.toString() ?? '',
      sessionType: initialSession?.sessionType ?? 'study',
      notes: initialSession?.notes ?? '',
    },
  })

  const submit = handleSubmit(async (values) => {
    const startedAt = new Date(values.startedAt).toISOString()
    const endedAt = values.endedAt ? new Date(values.endedAt).toISOString() : null
    const common = {
      subjectId: values.subjectId || null,
      topicId: values.topicId || null,
      taskId: values.taskId || null,
      startedAt,
      endedAt,
      durationSeconds: values.durationSeconds ? Number(values.durationSeconds) : undefined,
      sessionType: values.sessionType,
      notes: values.notes || '',
    } as const

    if (initialSession) {
      const updated = await updateMutation.mutateAsync({ id: initialSession.id, payload: common })
      onSessionUpdated?.(updated)
    } else {
      const created = await createMutation.mutateAsync({
        ...common,
        idempotencyKey: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      })
      onSessionCreated?.(created)
      reset()
    }
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={(event) => { void submit(event) }} className="space-y-4">
      <h2 className="mb-4 text-xl font-semibold text-ink">{initialSession ? 'Edit Study Session' : 'Create New Session'}</h2>
      <label className="block text-sm">Subject ID
        <input {...register('subjectId')} className="mt-1 w-full rounded-md border p-2" />
      </label>
      <label className="block text-sm">Topic ID
        <input {...register('topicId')} className="mt-1 w-full rounded-md border p-2" />
      </label>
      <label className="block text-sm">Task ID
        <input {...register('taskId')} className="mt-1 w-full rounded-md border p-2" />
      </label>
      <label className="block text-sm">Start time
        <input type="datetime-local" {...register('startedAt')} className="mt-1 w-full rounded-md border p-2" />
      </label>
      {errors.startedAt && <p role="alert" className="text-sm text-danger">{errors.startedAt.message}</p>}
      <label className="block text-sm">End time
        <input type="datetime-local" {...register('endedAt')} className="mt-1 w-full rounded-md border p-2" />
      </label>
      <label className="block text-sm">Duration (seconds)
        <input type="number" min="0" max="86400" {...register('durationSeconds')} className="mt-1 w-full rounded-md border p-2" />
      </label>
      {errors.durationSeconds && <p role="alert" className="text-sm text-danger">{errors.durationSeconds.message}</p>}
      <label className="block text-sm">Session type
        <select {...register('sessionType')} className="mt-1 w-full rounded-md border p-2">
          {['study', 'practice', 'revision', 'mock'].map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </label>
      <label className="block text-sm">Notes
        <textarea {...register('notes')} rows={3} className="mt-1 w-full rounded-md border p-2" />
      </label>
      <button type="submit" disabled={isPending} className="rounded-md bg-coral px-4 py-2 text-white disabled:opacity-50">
        {isPending ? 'Saving…' : initialSession ? 'Update session' : 'Create session'}
      </button>
    </form>
  )
}
