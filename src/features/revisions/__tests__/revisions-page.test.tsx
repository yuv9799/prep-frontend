import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RevisionsPage } from '../revisions-page'
import { renderWithProviders } from '../../../test/utils'
import { revisionsApi } from '../../../api'

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

const mockedRevisions = vi.mocked(revisionsApi)

const revision = {
  id: 'r1',
  label: 'Binary search',
  stage: 'due' as const,
  intervalDays: 3,
  nextReviewAt: '2026-01-01',
}

describe('RevisionsPage', () => {
  beforeEach(() => {
    mockedRevisions.list.mockReset()
    mockedRevisions.review.mockReset()
    mockedRevisions.list.mockResolvedValue([revision])
    mockedRevisions.review.mockResolvedValue({ ...revision, stage: 'completed' })
  })

  it('lists the revision queue', async () => {
    renderWithProviders(<RevisionsPage />, { route: '/app/revisions' })
    expect(await screen.findByText('Binary search')).toBeInTheDocument()
  })

  it('records a review when the user marks an item as recalled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RevisionsPage />, { route: '/app/revisions' })

    await user.click(await screen.findByRole('button', { name: /mark as recalled/i }))

    await waitFor(() => {
      expect(mockedRevisions.review).toHaveBeenCalledWith('r1', 5)
    })
  })

  it('shows an empty state when nothing is scheduled', async () => {
    mockedRevisions.list.mockResolvedValue([])
    renderWithProviders(<RevisionsPage />, { route: '/app/revisions' })
    expect(await screen.findByText(/no revisions scheduled/i)).toBeInTheDocument()
  })

  it('shows an error state when the API fails', async () => {
    mockedRevisions.list.mockRejectedValue(new Error('Scheduler unavailable'))
    renderWithProviders(<RevisionsPage />, { route: '/app/revisions' })
    expect(await screen.findByRole('alert')).toHaveTextContent(/scheduler unavailable/i)
  })
})
