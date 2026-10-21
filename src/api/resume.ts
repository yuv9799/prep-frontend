import type {
  Certification,
  CreateResumeDraftPayload,
  EducationEntry,
  ExperienceEntry,
  ResumeDraft,
  ResumeLink,
  ResumeProposal,
  ResumeProject,
  ResumeUpdatePayload,
  SkillGroup,
} from '../types/model'
import { del, get, patch, post } from './client'

export const resumeApi = {
  async getDraft(): Promise<ResumeDraft> {
    return get<ResumeDraft>('/resume')
  },

  async updateDraft(payload: ResumeUpdatePayload): Promise<ResumeDraft> {
    return patch<ResumeDraft>('/resume', payload)
  },

  async deleteDraft(): Promise<void> {
    await del('/resume')
  },

  async listDrafts(): Promise<ResumeDraft[]> {
    const response = await get<ResumeDraft[] | { items: ResumeDraft[] }>('/resumes')
    return Array.isArray(response) ? response : (response?.items ?? [])
  },

  async createDraft(payload: CreateResumeDraftPayload): Promise<ResumeDraft> {
    return post<ResumeDraft>('/resumes', payload)
  },

  async createProposal(payload: {
    field: string
    proposedValue: string
    rationale?: string
  }): Promise<ResumeProposal> {
    return post<ResumeProposal>('/resume/proposals', payload)
  },

  async listProposals(): Promise<ResumeProposal[]> {
    const response = await get<ResumeProposal[] | { items: ResumeProposal[] }>('/resume/proposals')
    if (Array.isArray(response)) return response
    return response?.items ?? []
  },

  async acceptProposal(id: string): Promise<ResumeProposal> {
    return patch<ResumeProposal>(`/resume/proposals/${id}`, { status: 'accepted' })
  },

  async rejectProposal(id: string): Promise<ResumeProposal> {
    return patch<ResumeProposal>(`/resume/proposals/${id}`, { status: 'rejected' })
  },
}

export const resumeEducationApi = {
  async list(): Promise<EducationEntry[]> {
    const response = await get<EducationEntry[] | { items: EducationEntry[] }>('/resume/education')
    return Array.isArray(response) ? response : (response?.items ?? [])
  },

  async create(payload: Omit<EducationEntry, 'id'>): Promise<EducationEntry> {
    return post<EducationEntry>('/resume/education', payload)
  },

  async update(id: string, payload: Partial<EducationEntry>): Promise<EducationEntry> {
    return patch<EducationEntry>(`/resume/education/${id}`, payload)
  },

  async remove(id: string): Promise<void> {
    await del(`/resume/education/${id}`)
  },
}

export const resumeExperienceApi = {
  async list(): Promise<ExperienceEntry[]> {
    const response = await get<ExperienceEntry[] | { items: ExperienceEntry[] }>('/resume/experience')
    return Array.isArray(response) ? response : (response?.items ?? [])
  },

  async create(payload: Omit<ExperienceEntry, 'id'>): Promise<ExperienceEntry> {
    return post<ExperienceEntry>('/resume/experience', payload)
  },

  async update(id: string, payload: Partial<ExperienceEntry>): Promise<ExperienceEntry> {
    return patch<ExperienceEntry>(`/resume/experience/${id}`, payload)
  },

  async remove(id: string): Promise<void> {
    await del(`/resume/experience/${id}`)
  },
}

export const resumeProjectsApi = {
  async list(): Promise<ResumeProject[]> {
    const response = await get<ResumeProject[] | { items: ResumeProject[] }>('/resume/projects')
    return Array.isArray(response) ? response : (response?.items ?? [])
  },

  async create(payload: Omit<ResumeProject, 'id'>): Promise<ResumeProject> {
    return post<ResumeProject>('/resume/projects', payload)
  },

  async update(id: string, payload: Partial<ResumeProject>): Promise<ResumeProject> {
    return patch<ResumeProject>(`/resume/projects/${id}`, payload)
  },

  async remove(id: string): Promise<void> {
    await del(`/resume/projects/${id}`)
  },
}

export const resumeSkillsApi = {
  async list(): Promise<SkillGroup[]> {
    const response = await get<SkillGroup[] | { items: SkillGroup[] }>('/resume/skills')
    return Array.isArray(response) ? response : (response?.items ?? [])
  },

  async create(payload: Omit<SkillGroup, 'id'>): Promise<SkillGroup> {
    return post<SkillGroup>('/resume/skills', payload)
  },

  async update(id: string, payload: Partial<SkillGroup>): Promise<SkillGroup> {
    return patch<SkillGroup>(`/resume/skills/${id}`, payload)
  },

  async remove(id: string): Promise<void> {
    await del(`/resume/skills/${id}`)
  },
}

export const resumeCertificationsApi = {
  async list(): Promise<Certification[]> {
    const response = await get<Certification[] | { items: Certification[] }>('/resume/certifications')
    return Array.isArray(response) ? response : (response?.items ?? [])
  },

  async create(payload: Omit<Certification, 'id'>): Promise<Certification> {
    return post<Certification>('/resume/certifications', payload)
  },

  async remove(id: string): Promise<void> {
    await del(`/resume/certifications/${id}`)
  },
}

export const resumeLinksApi = {
  async list(): Promise<ResumeLink[]> {
    const response = await get<ResumeLink[] | { items: ResumeLink[] }>('/resume/links')
    return Array.isArray(response) ? response : (response?.items ?? [])
  },

  async create(payload: Omit<ResumeLink, 'id'>): Promise<ResumeLink> {
    return post<ResumeLink>('/resume/links', payload)
  },

  async remove(id: string): Promise<void> {
    await del(`/resume/links/${id}`)
  },
}
