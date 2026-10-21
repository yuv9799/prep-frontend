import type { CreateTaskPayload, Task, TaskLog, UpdateTaskPayload } from '../types/model'
import { asList, del, get, patch, post } from './client'

export const tasksApi = {
  async list(status?: Task['status']): Promise<Task[]> {
    const params = status ? { status } : undefined
    return asList<Task>(await get('/tasks', { params }))
  },

  async getById(id: string): Promise<Task> {
    return get<Task>(`/tasks/${id}`)
  },

  async create(payload: CreateTaskPayload): Promise<Task> {
    return post<Task>('/tasks', payload)
  },

  async update(id: string, payload: UpdateTaskPayload): Promise<Task> {
    return patch<Task>(`/tasks/${id}`, payload)
  },

  async complete(id: string): Promise<Task> {
    return patch<Task>(`/tasks/${id}`, { status: 'done' })
  },

  async remove(id: string): Promise<void> {
    await del(`/tasks/${id}`)
  },
}

export const taskLogsApi = {
  async list(): Promise<TaskLog[]> {
    return asList<TaskLog>(await get('/task-logs'))
  },

  async create(payload: {
    taskId?: string
    subjectId?: string
    topicId?: string
    minutesSpent: number
    questionsAttempted?: number
    notes?: string
  }): Promise<TaskLog> {
    return post<TaskLog>('/task-logs', payload)
  },
}
