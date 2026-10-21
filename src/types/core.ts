/** Envelope returned by the API for paginated collections. */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** Standard error body shape produced by the backend. */
export interface ApiErrorBody {
  message: string
  errors?: Record<string, string[]>
  code?: string
}

export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionType = 'mcq' | 'multi' | 'boolean' | 'numeric' | 'text' | 'code'

export type SubjectCategory = 'dsa' | 'core' | 'aptitude' | 'db' | 'os' | 'cn' | 'other'

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'skipped'

export type RevisionStage = 'due' | 'scheduled' | 'completed'
