import type { PatchSubjectPayload, PatchTopicPayload, Pattern, Subtopic, Subject, Topic, TopicProgress, UpdateTopicProgressPayload } from '../types/model'
import { asList, del, get, patch, post } from './client'

export const subjectsApi = {
  async list(): Promise<Subject[]> {
    return asList<Subject>(await get('/subjects'))
  },

  async getById(id: string): Promise<Subject> {
    return get<Subject>(`/subjects/${id}`)
  },

  async create(payload: Partial<Subject>): Promise<Subject> {
    return post<Subject>('/subjects', payload)
  },

  async update(id: string, payload: PatchSubjectPayload): Promise<Subject> {
    return patch<Subject>(`/subjects/${id}`, payload)
  },

  async remove(id: string): Promise<void> {
    await del(`/subjects/${id}`)
  },
}

export const topicsApi = {
  async list(subjectId?: string): Promise<Topic[]> {
    const url = subjectId ? `/subjects/${subjectId}/topics` : '/topics'
    return asList<Topic>(await get(url))
  },

  async getById(id: string): Promise<Topic> {
    return get<Topic>(`/topics/${id}`)
  },

  async create(payload: Partial<Topic>): Promise<Topic> {
    return post<Topic>('/topics', payload)
  },

  async update(id: string, payload: PatchTopicPayload): Promise<Topic> {
    return patch<Topic>(`/topics/${id}`, payload)
  },

  async remove(id: string): Promise<void> {
    await del(`/topics/${id}`)
  },

  async updateProgress(topicId: string, payload: UpdateTopicProgressPayload): Promise<TopicProgress> {
    return patch<TopicProgress>(`/topics/${topicId}/progress`, payload)
  },
}

export const subtopicsApi = {
  async list(topicId: string): Promise<Subtopic[]> {
    return asList<Subtopic>(await get(`/topics/${topicId}/subtopics`))
  },
}

export const patternsApi = {
  async list(topicId: string): Promise<Pattern[]> {
    return asList<Pattern>(await get(`/topics/${topicId}/patterns`))
  },
}
