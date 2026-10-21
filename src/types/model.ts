import { z } from 'zod'
import type {
  Difficulty,
  QuestionType,
  SubjectCategory,
  TaskStatus,
  RevisionStage,
} from './core'

export interface Subject {
  id: string
  name: string
  slug: string
  description?: string | null
  category: SubjectCategory
  color?: string | null
  icon?: string | null
  order?: number
  topicsCount?: number
  questionsCount?: number
  completionPercent?: number
}

export interface PatchSubjectPayload {
  name?: string
  code?: string | null
  description?: string | null
  category?: SubjectCategory
  color?: string | null
  icon?: string | null
  displayOrder?: number
  isActive?: boolean
}

export interface Topic {
  id: string
  subjectId: string
  name: string
  slug: string
  description?: string | null
  order: number
  estimatedHours?: number | null
  difficulty?: Difficulty
  prerequisites?: string[]
  completionPercent?: number
  questionsCount?: number
  patternsCount?: number
}

export interface PatchTopicPayload {
  name?: string
  description?: string | null
  subjectId?: string
  parentTopicId?: string | null
  difficulty?: Difficulty
  prerequisites?: string[]
  displayOrder?: number
  estimatedHours?: number | null
  learningObjectives?: string[]
}

export interface Subtopic {
  id: string
  topicId: string
  name: string
  slug: string
  order: number
  notes?: string | null
}

export interface Pattern {
  id: string
  topicId: string
  name: string
  description?: string | null
  difficulty?: Difficulty
  keyIdeas?: string[]
}

export interface QuestionOption {
  id?: string
  text: string
  isCorrect?: boolean
}

export interface Question {
  id: string
  subjectId?: string
  topicId?: string
  subtopicId?: string | null
  patternId?: string | null
  title: string
  body?: string | null
  type: QuestionType
  difficulty: Difficulty
  options?: QuestionOption[]
  correctAnswer?: string | string[] | number | null
  explanation?: string | null
  timeLimitSeconds?: number | null
  tags?: string[]
  isFavorite?: boolean
  attemptsCount?: number
  accuracy?: number
  lastAttemptedAt?: string | null
}

export interface QuestionAttempt {
  id: string
  questionId: string
  userId?: string
  answer: string | string[] | number | null
  isCorrect: boolean
  timeTakenSeconds?: number | null
  createdAt: string
}

export interface TaskLog {
  id: string
  taskId?: string
  subjectId?: string
  topicId?: string
  minutesSpent: number
  questionsAttempted?: number
  notes?: string | null
  loggedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  subjectId?: string | null
  topicId?: string | null
  dueDate?: string | null
  priority: 'low' | 'medium' | 'high'
  estimatedMinutes?: number | null
  completedAt?: string | null
  createdAt?: string
}

export interface CreateTaskPayload {
  title: string
  description?: string
  subjectId?: string | null
  topicId?: string | null
  dueDate?: string | null
  priority?: Task['priority']
  estimatedMinutes?: number | null
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  status?: TaskStatus
}

export interface RevisionItem {
  id: string
  topicId?: string | null
  subjectId?: string | null
  questionId?: string | null
  label: string
  stage: RevisionStage
  intervalDays: number
  easeFactor?: number
  nextReviewAt: string
  lastReviewedAt?: string | null
  repetitions?: number
  lapses?: number
}

export interface CreateRevisionPayload {
  topicId?: string | null
  subjectId?: string | null
  questionId?: string | null
  label: string
  scheduledAt: string
  notes?: string
  intervalDays?: number
}

export interface UpdateRevisionPayload {
  label?: string
  scheduledAt?: string
  notes?: string | null
  status?: 'scheduled' | 'due' | 'completed' | 'cancelled'
  intervalDays?: number
}

export interface Project {
  id: string
  title: string
  description?: string | null
  status: 'planned' | 'in_progress' | 'completed' | 'archived'
  techStack?: string[]
  repositoryUrl?: string | null
  demoUrl?: string | null
  startedAt?: string | null
  completedAt?: string | null
  createdAt?: string
}

export interface UpdateProjectPayload {
  title?: string
  description?: string | null
  status?: 'planned' | 'in_progress' | 'completed' | 'archived'
  technologies?: string[]
  githubUrl?: string | null
  repositoryUrl?: string | null
  demoUrl?: string | null
  startDate?: string | null
  completionDate?: string | null
  contributionDetails?: string | null
  evidenceLinks?: string[]
  highlights?: string[]
}

export interface Achievement {
  id: string
  title: string
  description?: string | null
  icon?: string | null
  points: number
  earnedAt?: string | null
  category?: string | null
}

export interface ResumeDraft {
  id: string
  profileName?: string | null
  headline?: string | null
  summary?: string | null
  email?: string | null
  phone?: string | null
  location?: string | null
  links?: ResumeLink[]
  education?: EducationEntry[]
  experience?: ExperienceEntry[]
  projects?: ResumeProject[]
  skills?: SkillGroup[]
  certifications?: Certification[]
  updatedAt?: string
}

export interface CreateResumeDraftPayload {
  title?: string
  targetRole?: string | null
  template?: string
  profileName?: string | null
  headline?: string | null
  summary?: string | null
  email?: string | null
  phone?: string | null
  location?: string | null
}

export interface ResumeUpdatePayload {
  title?: string
  targetRole?: string | null
  template?: string
  profileName?: string | null
  headline?: string | null
  summary?: string | null
  email?: string | null
  phone?: string | null
  location?: string | null
  links?: ResumeLink[]
  education?: EducationEntry[]
  experience?: ExperienceEntry[]
  projects?: ResumeProject[]
  skills?: SkillGroup[]
  certifications?: Certification[]
  sectionOrder?: string[]
}

export interface ResumeLink {
  id?: string
  label: string
  url: string
}

export interface EducationEntry {
  id?: string
  institution: string
  degree: string
  field?: string
  startYear?: number | string
  endYear?: number | string
  grade?: string
  location?: string
}

export interface ExperienceEntry {
  id?: string
  company: string
  role: string
  startDate?: string
  endDate?: string
  current?: boolean
  location?: string
  bullets?: string[]
}

export interface ResumeProject {
  id?: string
  name: string
  description?: string
  techStack?: string[]
  link?: string
  highlights?: string[]
}

export interface SkillGroup {
  id?: string
  category: string
  skills: string[]
}

export interface Certification {
  id?: string
  name: string
  issuer?: string
  issuedAt?: string
  credentialId?: string
  url?: string
}

export interface ResumeProposal {
  id: string
  field: string
  currentValue: string
  proposedValue: string
  rationale?: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt?: string
}

export interface DashboardSummary {
  tasksCompletedToday: number
  minutesStudiedToday: number
  questionsSolvedToday: number
  accuracyToday: number
  revisionsDue: number
  streakDays: number
  subjects?: SubjectProgress[]
}

export interface SubjectProgress {
  subjectId: string
  subjectName: string
  completionPercent: number
  questionsSolved: number
  questionsTotal: number
}

export interface StudyActivity {
  date: string
  minutes: number
  questions: number
}

export interface AnalyticsOverview {
  totalQuestionsSolved: number
  overallAccuracy: number
  totalMinutes: number
  currentStreak: number
  longestStreak?: number
  accuracyTrend?: StudyActivity[]
  timeSeries?: StudyActivity[]
  bySubject?: SubjectProgress[]
  byDifficulty?: { difficulty: Difficulty; solved: number; accuracy: number }[]
}

export interface TopicProgress {
  id: string
  userId: string
  topicId: string
  subjectId: string
  status: 'not_started' | 'in_progress' | 'completed'
  confidence: number
  estimatedStudyMinutes: number
  actualStudyMinutes: number
  startedAt: string | null
  completedAt: string | null
  lastReviewedAt: string | null
  nextReviewAt: string | null
  revisionCount: number
  notes: string | null
}

export interface UpdateTopicProgressPayload {
  status?: 'not_started' | 'in_progress' | 'completed'
  confidence?: number
  estimatedStudyMinutes?: number
  actualStudyMinutes?: number
  startedAt?: string | null
  completedAt?: string | null
  lastReviewedAt?: string | null
  nextReviewAt?: string | null
  revisionCount?: number
  notes?: string | null
}


export interface StudySessionDTO {
  id: string
  subjectId?: string | null
  topicId?: string | null
  taskId?: string | null
  startedAt: string
  endedAt?: string | null
  durationSeconds?: number
  sessionType: 'study' | 'practice' | 'revision' | 'mock'
  notes?: string | null
}

export type StudySession = StudySessionDTO

export const studySessionSchema = z.object({
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  taskId: z.string().optional(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  durationSeconds: z.string().optional(),
  sessionType: z.enum(['study', 'practice', 'revision', 'mock']).default('study'),
  notes: z.string().max(5000).optional(),
})
