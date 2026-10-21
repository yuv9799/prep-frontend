import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { DashboardPage } from '../dashboard-page'
import { renderWithProviders } from '../../../test/utils'
import { analyticsApi, tasksApi, revisionsApi } from '../../../api'

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
  authApi: { me: vi.fn(), login: vi.fn(), register: vi.fn(), logout: vi.fn(), updateProfile: vi.fn() },
  resumeApi: { getDraft: vi.fn(), listProposals: vi.fn() },
}))

const mockedApi = vi.mocked(analyticsApi)
const mockedTasks = vi.mocked(tasksApi)
const mockedRevisions = vi.mocked(revisionsApi)

describe('DashboardPage', () => {
  beforeEach(() => {
    mockedApi.dashboard.mockReset()
    mockedApi.subjectProgress.mockReset()
    mockedTasks.list.mockReset()
    mockedRevisions.list.mockReset()

    mockedApi.dashboard.mockResolvedValue({
      tasksCompletedToday: 2,
      minutesStudiedToday: 45,
      questionsSolvedToday: 12,
      accuracyToday: 80,
      revisionsDue: 3,
      streakDays: 5,
    })
    mockedApi.subjectProgress.mockResolvedValue([
      {
        subjectId: 's1',
        subjectName: 'Data Structures',
        completionPercent: 40,
        questionsSolved: 20,
        questionsTotal: 50,
      },
    ])
    mockedTasks.list.mockResolvedValue([])
    mockedRevisions.list.mockResolvedValue([])
  })

  it('renders the daily summary statistics', async () => {
    renderWithProviders(<DashboardPage />, { route: '/app' })

    expect(await screen.findByText('45')).toBeInTheDocument()
    expect(screen.getByText('Minutes studied')).toBeInTheDocument()
    expect(screen.getByText('5d')).toBeInTheDocument()
  })

  it('renders subject progress when available', async () => {
    renderWithProviders(<DashboardPage />, { route: '/app' })

    expect(await screen.findByText('Data Structures')).toBeInTheDocument()
  })

  it('shows an error state with a retry action when the API fails', async () => {
    mockedApi.dashboard.mockRejectedValue(new Error('Backend unavailable'))

    renderWithProviders(<DashboardPage />, { route: '/app' })

    expect(await screen.findByRole('alert')).toHaveTextContent(/backend unavailable/i)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('shows an empty state when there are no open tasks', async () => {
    renderWithProviders(<DashboardPage />, { route: '/app' })

    expect(await screen.findByText(/no open tasks/i)).toBeInTheDocument()
  })
})

