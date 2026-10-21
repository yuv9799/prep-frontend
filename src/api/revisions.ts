import type { CreateRevisionPayload, RevisionItem, UpdateRevisionPayload } from '../types/model'
import { asList, del, get, patch, post } from './client'

export const revisionsApi = {
  async list(): Promise<RevisionItem[]> {
    return asList<RevisionItem>(await get('/revisions'))
  },

  async due(): Promise<RevisionItem[]> {
    return asList<RevisionItem>(await get('/revisions/due'))
  },

  async create(payload: CreateRevisionPayload): Promise<RevisionItem> {
    return post<RevisionItem>('/revisions', payload)
  },

  async update(id: string, payload: UpdateRevisionPayload): Promise<RevisionItem> {
    return patch<RevisionItem>(`/revisions/${id}`, payload)
  },

  async remove(id: string): Promise<void> {
    await del(`/revisions/${id}`)
  },

  async review(id: string, quality: number): Promise<RevisionItem> {
    return post<RevisionItem>(`/revisions/${id}/review`, { quality })
  },
}
