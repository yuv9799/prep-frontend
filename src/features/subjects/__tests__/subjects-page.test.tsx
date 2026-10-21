import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubjectsPage } from '../subjects-page'
import { renderWithProviders } from '../../../test/utils'
import { subjectsApi, topicsApi } from '../../../api'

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
  questionsApi: { list: vi.fn(), attempt: vi.fn() },
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

const mockedSubjects = vi.mocked(subjectsApi)
const mockedTopics = vi.mocked(topicsApi)

const subject = {
  id: 's1',
  name: 'Data Structures',
  slug: 'data-structures',
  category: 'dsa' as const,
  questionsCount: 120,
  completionPercent: 30,
}

describe('SubjectsPage', () => {
  beforeEach(() => {
    mockedSubjects.list.mockReset()
    mockedTopics.list.mockReset()
    mockedSubjects.list.mockResolvedValue([subject])
    mockedTopics.list.mockResolvedValue([
      { id: 't1', subjectId: 's1', name: 'Arrays', slug: 'arrays', order: 1, questionsCount: 30 },
    ])
  })

  it('lists the subjects published by the backend', async () => {
    renderWithProviders(<SubjectsPage />, { route: '/app/subjects' })
    expect(await screen.findByText('Data Structures')).toBeInTheDocument()
    expect(screen.getByText(/120 questions/)).toBeInTheDocument()
  })

  it('loads topics lazily when a subject is expanded', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SubjectsPage />, { route: '/app/subjects' })

    expect(mockedTopics.list).not.toHaveBeenCalled()

    await user.click(await screen.findByRole('button', { name: /show topics for data structures/i }))

    expect(await screen.findByText('Arrays')).toBeInTheDocument()
    await waitFor(() => {
      expect(mockedTopics.list).toHaveBeenCalledWith('s1')
    })
  })

  it('shows an empty state when the curriculum is empty', async () => {
    mockedSubjects.list.mockResolvedValue([])
    renderWithProviders(<SubjectsPage />, { route: '/app/subjects' })
    expect(await screen.findByText(/no subjects available/i)).toBeInTheDocument()
  })

  it('shows an error state when the API fails', async () => {
    mockedSubjects.list.mockRejectedValue(new Error('Curriculum unavailable'))
    renderWithProviders(<SubjectsPage />, { route: '/app/subjects' })
    expect(await screen.findByRole('alert')).toHaveTextContent(/curriculum unavailable/i)
  })
})
