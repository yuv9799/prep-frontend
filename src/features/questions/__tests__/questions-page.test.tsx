import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionsPage } from '../questions-page'
import { renderWithProviders } from '../../../test/utils'
import { questionsApi, subjectsApi } from '../../../api'

vi.mock('../../../api', () => ({
  analyticsApi: {
    dashboard: vi.fn(),
    overview: vi.fn(),
    activity: vi.fn(),
    subjectProgress: vi.fn(),
  },
  tasksApi: { list: vi.fn() },
  taskLogsApi: { list: vi.fn() },
  revisionsApi: { list: vi.fn(), due: vi.fn(), review: vi.fn() },
  subjectsApi: { list: vi.fn() },
  topicsApi: { list: vi.fn() },
  subtopicsApi: { list: vi.fn() },
  patternsApi: { list: vi.fn() },
  questionsApi: { list: vi.fn(), attempt: vi.fn(), getById: vi.fn() },
  projectsApi: { list: vi.fn() },
  achievementsApi: { list: vi.fn() },
  authApi: {
    me: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
  },
  resumeApi: { getDraft: vi.fn(), listProposals: vi.fn() },
}))

const mockedQuestions = vi.mocked(questionsApi)
const mockedSubjects = vi.mocked(subjectsApi)

const question = {
  id: 'q1',
  title: 'What is the time complexity of binary search?',
  body: 'Choose the correct option.',
  type: 'mcq' as const,
  difficulty: 'medium' as const,
  options: [
    { id: 'o1', text: 'O(log n)' },
    { id: 'o2', text: 'O(n)' },
  ],
  explanation: 'Binary search halves the search space each step.',
}

describe('QuestionsPage', () => {
  beforeEach(() => {
    mockedQuestions.list.mockReset()
    mockedQuestions.attempt.mockReset()
    mockedSubjects.list.mockReset()

    mockedQuestions.list.mockResolvedValue([question])
    mockedSubjects.list.mockResolvedValue([{ id: 's1', name: 'DSA', slug: 'dsa', category: 'dsa' }])
    mockedQuestions.attempt.mockResolvedValue({
      id: 'a1',
      questionId: 'q1',
      answer: 'o1',
      isCorrect: true,
      createdAt: '2026-01-01T00:00:00Z',
    })
  })

  it('lists questions', async () => {
    renderWithProviders(<QuestionsPage />, { route: '/app/questions' })
    expect(await screen.findByText(question.title)).toBeInTheDocument()
  })

  it('opens a question and submits an answer', async () => {
    const user = userEvent.setup()
    renderWithProviders(<QuestionsPage />, { route: '/app/questions' })

    await user.click(await screen.findByText(question.title))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByLabelText(/O\(log n\)/))
    await user.click(screen.getByRole('button', { name: /submit answer/i }))

    await waitFor(() => {
      expect(mockedQuestions.attempt).toHaveBeenCalledWith('q1', { answer: 'o1' })
    })
    expect(await screen.findByText(/correct answer/i)).toBeInTheDocument()
  })

  it('shows an empty state when no questions match', async () => {
    mockedQuestions.list.mockResolvedValue([])
    renderWithProviders(<QuestionsPage />, { route: '/app/questions' })
    expect(await screen.findByText(/no questions match/i)).toBeInTheDocument()
  })

  it('shows an error state when the API fails', async () => {
    mockedQuestions.list.mockRejectedValue(new Error('Question bank unavailable'))
    renderWithProviders(<QuestionsPage />, { route: '/app/questions' })
    expect(await screen.findByRole('alert')).toHaveTextContent(/question bank unavailable/i)
  })
})
