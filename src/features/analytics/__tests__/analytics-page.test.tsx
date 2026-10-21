import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { AnalyticsPage } from '../analytics-page'
import { renderWithProviders } from '../../../test/utils'
import { analyticsApi } from '../../../api'

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

const mockedApi = vi.mocked(analyticsApi)

describe('AnalyticsPage', () => {
  beforeEach(() => {
    mockedApi.overview.mockReset()
    mockedApi.subjectProgress.mockReset()

    mockedApi.overview.mockResolvedValue({
      totalQuestionsSolved: 320,
      overallAccuracy: 76,
      totalMinutes: 2400,
      currentStreak: 9,
      accuracyTrend: [
        { date: '2026-01-01', minutes: 30, questions: 20 },
        { date: '2026-01-02', minutes: 45, questions: 25 },
      ],
    })
    mockedApi.subjectProgress.mockResolvedValue([
      {
        subjectId: 's1',
        subjectName: 'Data Structures',
        completionPercent: 55,
        questionsSolved: 60,
        questionsTotal: 110,
      },
    ])
  })

  it('renders the headline statistics', async () => {
    renderWithProviders(<AnalyticsPage />, { route: '/app/analytics' })
    expect(await screen.findByText('320')).toBeInTheDocument()
    expect(screen.getByText('76%')).toBeInTheDocument()
    expect(screen.getByText('9d')).toBeInTheDocument()
  })

  it('shows an empty state when there is no activity yet', async () => {
    mockedApi.overview.mockResolvedValue({
      totalQuestionsSolved: 0,
      overallAccuracy: 0,
      totalMinutes: 0,
      currentStreak: 0,
    })
    mockedApi.subjectProgress.mockResolvedValue([])

    renderWithProviders(<AnalyticsPage />, { route: '/app/analytics' })
    expect(await screen.findByText(/no analytics yet/i)).toBeInTheDocument()
  })

  it('shows an error state when the API fails', async () => {
    mockedApi.overview.mockRejectedValue(new Error('Analytics unavailable'))
    renderWithProviders(<AnalyticsPage />, { route: '/app/analytics' })
    expect(await screen.findByRole('alert')).toHaveTextContent(/analytics unavailable/i)
  })
})
