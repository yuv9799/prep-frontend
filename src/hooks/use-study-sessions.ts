import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionsApi } from '../api'
import type { StudySessionDTO } from '../types/model'

type CreateSessionPayload = Parameters<typeof sessionsApi.create>[0]
type UpdateSessionPayload = Parameters<typeof sessionsApi.update>[1]

export function useStudySessions() {
  const queryClient = useQueryClient()

  const sessionsQuery = useQuery<StudySessionDTO[]>({
    queryKey: ['sessions'],
    queryFn: () => sessionsApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateSessionPayload) => sessionsApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sessions'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSessionPayload }) =>
      sessionsApi.update(id, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['sessions'] })
      await queryClient.invalidateQueries({ queryKey: ['session', variables.id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sessionsApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  return { sessionsQuery, createMutation, updateMutation, deleteMutation }
}

export function useCreateSessionMutation() {
  return useStudySessions().createMutation
}

export function useUpdateSessionMutation() {
  return useStudySessions().updateMutation
}
