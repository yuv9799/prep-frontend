import type { Achievement, Project, UpdateProjectPayload } from '../types/model'
import { asList, del, get, patch, post } from './client'

export const projectsApi = {
  async list(): Promise<Project[]> {
    return asList<Project>(await get('/projects'))
  },

  async getById(id: string): Promise<Project> {
    return get<Project>(`/projects/${id}`)
  },

  async create(payload: Partial<Project>): Promise<Project> {
    return post<Project>('/projects', payload)
  },

  async update(id: string, payload: UpdateProjectPayload): Promise<Project> {
    return patch<Project>(`/projects/${id}`, payload)
  },

  async remove(id: string): Promise<void> {
    await del(`/projects/${id}`)
  },
}

export const achievementsApi = {
  async list(): Promise<Achievement[]> {
    return asList<Achievement>(await get('/achievements'))
  },
}
