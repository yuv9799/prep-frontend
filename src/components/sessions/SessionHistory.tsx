import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { sessionsApi } from '../../api/sessions'
import { Button } from '../ui'
import { useToast } from '../ui/toast-context'

type SessionHistoryProps = {
  subjectId?: string
  topicId?: string
  sessionType?: 'study' | 'practice' | 'revision' | 'mock'
}

export function SessionHistory({ subjectId, topicId, sessionType }: SessionHistoryProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()
  const [page, setPage] = useState(1)
  const pageSize = 10

  const queryParams = useMemo(
    () => ({ subjectId, topicId, sessionType }),
    [subjectId, topicId, sessionType],
  )

  const { data: sessions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['sessions', queryParams],
    queryFn: () => sessionsApi.list(queryParams),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sessionsApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Session deleted')
    },
    onError: () => toast.error('Could not delete session', 'Please try again.'),
  })

  const totalPages = Math.max(1, Math.ceil(sessions.length / pageSize))
  const pageSessions = sessions.slice((page - 1) * pageSize, page * pageSize)

  if (isLoading) {
    return <div className="p-8 text-center"><h2 className="mb-4 text-xl font-semibold text-ink">Study Sessions</h2><p className="text-ink-soft">Loading sessions...</p></div>
  }

  if (isError) {
    return <div className="p-8 text-center"><h2 className="mb-4 text-xl font-semibold text-ink">Study Sessions</h2><p className="mb-4 text-ink-soft">Error loading sessions.</p><Button onClick={() => void refetch()}>Retry</Button></div>
  }

  if (sessions.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="mb-4 text-xl font-semibold text-ink">Study Sessions</h2>
        <p className="mb-6 text-ink-soft">No sessions found{(subjectId || topicId || sessionType) ? ' with the applied filters' : ''}.</p>
        <Button onClick={() => navigate('/app/sessions', { state: queryParams })} variant="secondary">Create first session</Button>
      </div>
    )
  }

  return (
    <div className="pf-space-y-6">
      <div className="pf-card p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-ink">Study Sessions</h2>
          <Button onClick={() => navigate('/app/sessions', { state: queryParams })} variant="primary">Create New Session</Button>
        </div>
        {(subjectId || topicId || sessionType) && (
          <p className="mb-4 text-sm text-ink-soft">
            Filters: {[subjectId && 'Subject', topicId && 'Topic', sessionType && `Type: ${sessionType}`].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="overflow-x-auto rounded-lg border bg-surface-0">
          <table className="min-w-full table-auto">
            <thead><tr className="border-b text-left text-ink">
              <th className="p-4">Date</th><th className="p-4">Subject / Topic</th><th className="p-4">Duration</th><th className="p-4">Type</th><th className="p-4">Notes</th><th className="p-4 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {pageSessions.map((session) => {
                const startedAt = session.startedAt ? new Date(session.startedAt) : null
                const endedAt = session.endedAt ? new Date(session.endedAt) : null
                const durationMinutes = endedAt && startedAt
                  ? Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)
                  : Math.round((session.durationSeconds ?? 0) / 60)
                const labels: Record<string, string> = { study: 'Study', practice: 'Practice', revision: 'Revision', mock: 'Mock Exam' }
                return (
                  <tr key={session.id} className="border-b last:border-none">
                    <td className="p-4">{startedAt ? `${startedAt.toLocaleDateString()} ${startedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '—'}</td>
                    <td className="p-4">{session.subjectId ? `Subject ${session.subjectId}` : '—'}{session.topicId ? ` · Topic ${session.topicId}` : ''}</td>
                    <td className="p-4">{durationMinutes > 0 ? `${durationMinutes}m` : '—'}</td>
                    <td className="p-4">{labels[session.sessionType] ?? session.sessionType ?? '—'}</td>
                    <td className="p-4">{session.notes || <span className="text-ink-soft">No notes</span>}</td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/app/sessions/${session.id}/edit`)}>Edit</Button>
                      <Button size="sm" variant="ghost" disabled={deleteMutation.isPending} onClick={() => {
                        if (window.confirm('Delete this study session?')) deleteMutation.mutate(session.id)
                      }}>Delete</Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <div className="mt-6 flex items-center justify-end gap-3"><span className="text-sm text-ink-soft">Page {page} of {totalPages}</span><Button variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button><Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</Button></div>}
      </div>
    </div>
  )
}
