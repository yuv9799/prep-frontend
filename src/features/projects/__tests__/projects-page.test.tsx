import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectsPage } from '../projects-page'
import { renderWithProviders } from '../../../test/utils'
import { projectsApi } from '../../../api'

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
  projectsApi: { list: vi.fn(), create: vi.fn() },
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

const mockedProjects = vi.mocked(projectsApi)

const project = {
  id: 'p1',
  title: 'PrepForge',
  description: 'A placement tracker.',
  status: 'in_progress' as const,
  techStack: ['React', 'TypeScript'],
  repositoryUrl: 'https://github.com/example/prepforge',
}

describe('ProjectsPage', () => {
  beforeEach(() => {
    mockedProjects.list.mockReset()
    mockedProjects.create.mockReset()
    mockedProjects.list.mockResolvedValue([project])
    mockedProjects.create.mockResolvedValue(project)
  })

  it('lists projects with their tech stack', async () => {
    renderWithProviders(<ProjectsPage />, { route: '/app/projects' })
    expect(await screen.findByText('PrepForge')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('creates a project and splits the tech stack', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProjectsPage />, { route: '/app/projects' })

    await user.click(await screen.findByRole('button', { name: /new project/i }))
    await user.type(screen.getByLabelText(/project title/i), 'Task Board')
    await user.type(screen.getByLabelText(/tech stack/i), 'React, Node.js')
    await user.click(screen.getByRole('button', { name: /add project/i }))

    await waitFor(() => {
      expect(mockedProjects.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Task Board',
          techStack: ['React', 'Node.js'],
        }),
      )
    })
  })

  it('shows an empty state when there are no projects', async () => {
    mockedProjects.list.mockResolvedValue([])
    renderWithProviders(<ProjectsPage />, { route: '/app/projects' })
    expect(await screen.findByText(/no projects yet/i)).toBeInTheDocument()
  })
})
