import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResumePage } from '../resume-page'
import { renderWithProviders } from '../../../test/utils'
import { resumeApi } from '../../../api'

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
  resumeApi: {
    getDraft: vi.fn(),
    listProposals: vi.fn(),
    createProposal: vi.fn(),
    acceptProposal: vi.fn(),
    rejectProposal: vi.fn(),
  },
}))

const mockedResume = vi.mocked(resumeApi)

describe('ResumePage', () => {
  beforeEach(() => {
    mockedResume.getDraft.mockReset()
    mockedResume.listProposals.mockReset()
    mockedResume.createProposal.mockReset()
    mockedResume.acceptProposal.mockReset()
    mockedResume.rejectProposal.mockReset()

    mockedResume.getDraft.mockResolvedValue({
      id: 'r1',
      headline: 'Frontend developer',
      summary: 'Builds React apps.',
      skills: [{ category: 'Languages', skills: ['TypeScript'] }],
    })
    mockedResume.listProposals.mockResolvedValue([])
  })

  it('renders the current draft summary', async () => {
    renderWithProviders(<ResumePage />, { route: '/app/resume' })
    expect(await screen.findByText('Builds React apps.')).toBeInTheDocument()
  })

  it('does not write suggestions into the draft without approval', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ResumePage />, { route: '/app/resume' })

    await user.click(await screen.findByRole('button', { name: /write a proposal/i }))
    await user.type(screen.getByLabelText(/proposed text/i), 'A deliberately reviewed summary.')
    await user.click(screen.getByRole('button', { name: /save proposal/i }))

    await waitFor(() => {
      expect(mockedResume.createProposal).toHaveBeenCalledWith(
        expect.objectContaining({ proposedValue: 'A deliberately reviewed summary.' }),
      )
    })

    expect(mockedResume.updateDraft).toBeUndefined()
  })

  it('accepts a pending proposal only after explicit user action', async () => {
    const user = userEvent.setup()
    mockedResume.listProposals.mockResolvedValue([
      {
        id: 'p1',
        field: 'summary',
        currentValue: '',
        proposedValue: 'Reviewed summary text',
        status: 'pending',
      },
    ])
    mockedResume.acceptProposal.mockResolvedValue({
      id: 'p1',
      field: 'summary',
      currentValue: '',
      proposedValue: 'Reviewed summary text',
      status: 'accepted',
    })

    renderWithProviders(<ResumePage />, { route: '/app/resume' })

    expect(await screen.findByText('Reviewed summary text')).toBeInTheDocument()
    expect(mockedResume.acceptProposal).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /accept/i }))

    await waitFor(() => {
      expect(mockedResume.acceptProposal).toHaveBeenCalledWith('p1')
    })
  })

  it('shows an empty state when there is nothing to review', async () => {
    renderWithProviders(<ResumePage />, { route: '/app/resume' })
    expect(await screen.findByText(/nothing to review/i)).toBeInTheDocument()
  })
})

