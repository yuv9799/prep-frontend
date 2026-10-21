import type { Question, QuestionAttempt } from '../types/model'
import { asList, del, get, patch, post } from './client'

export interface QuestionFilters {
  subjectId?: string
  topicId?: string
  subtopicId?: string
  patternId?: string
  difficulty?: string
  type?: string
  favoriteOnly?: boolean
  search?: string
  page?: number
  pageSize?: number
}

export interface UpdateQuestionPayload {
  title?: string
  body?: string | null
  type?: string
  difficulty?: string
  options?: { id?: string; text: string; isCorrect?: boolean }[]
  correctAnswer?: string | string[] | number | null
  explanation?: string | null
  timeLimitSeconds?: number | null
  tags?: string[]
  isFavorite?: boolean
  status?: 'todo' | 'attempted' | 'solved' | 'skipped'
  personalNotes?: string | null
  solutionReference?: string | null
  source?: string | null
  externalUrl?: string | null
  confidence?: number
}

export const questionsApi = {
  async list(filters: QuestionFilters = {}): Promise<Question[]> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''),
    )
    return asList<Question>(await get('/questions', { params }))
  },

  async getById(id: string): Promise<Question> {
    return get<Question>(`/questions/${id}`)
  },

  async create(payload: Partial<Question>): Promise<Question> {
    return post<Question>('/questions', payload)
  },

  async update(id: string, payload: UpdateQuestionPayload): Promise<Question> {
    return patch<Question>(`/questions/${id}`, payload)
  },

  async remove(id: string): Promise<void> {
    await del(`/questions/${id}`)
  },

  async attempt(
    id: string,
    payload: { answer: string | string[] | number | null; timeTakenSeconds?: number },
  ): Promise<QuestionAttempt> {
    return post<QuestionAttempt>(`/questions/${id}/attempt`, payload)
  },

  async attempts(id: string): Promise<QuestionAttempt[]> {
    return asList<QuestionAttempt>(await get(`/questions/${id}/attempts`))
  },

  async toggleFavorite(id: string, favorite: boolean): Promise<Question> {
    return post<Question>(`/questions/${id}/favorite`, { favorite })
  },
}
