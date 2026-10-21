import type { StudySessionDTO } from '../types/model'
import { asList, del, get, patch, post } from './client'

export type SessionType = 'study' | 'practice' | 'revision' | 'mock'

export interface SessionFilters {
  page?: number
  pageSize?: number
  subjectId?: string
  topicId?: string
  taskId?: string
  sessionType?: SessionType
  from?: string
  to?: string
}

export interface CreateSessionPayload {
  subjectId?: string | null
  topicId?: string | null
  taskId?: string | null
  startedAt: string
  endedAt?: string | null
  durationSeconds?: number
  sessionType?: SessionType
  notes?: string
  idempotencyKey: string
}

export type UpdateSessionPayload = Partial<Omit<CreateSessionPayload, 'idempotencyKey'>>

export const sessionsApi = {
  async list(params: SessionFilters = {}): Promise<StudySessionDTO[]> {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') query.set(key, String(value))
    }
    const suffix = query.size ? `?${query.toString()}` : ''
    return asList<StudySessionDTO>(await get(`/sessions${suffix}`))
  },

  async getById(id: string): Promise<StudySessionDTO> {
    return get<StudySessionDTO>(`/sessions/${id}`)
  },

  async create(payload: CreateSessionPayload): Promise<StudySessionDTO> {
    return post<StudySessionDTO>('/sessions', payload)
  },

  async update(id: string, payload: UpdateSessionPayload): Promise<StudySessionDTO> {
    return patch<StudySessionDTO>(`/sessions/${id}`, payload)
  },

  async remove(id: string): Promise<void> {
    await del(`/sessions/${id}`)
  },
}
