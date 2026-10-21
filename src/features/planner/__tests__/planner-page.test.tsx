import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlannerPage } from '../planner-page'
import { renderWithProviders } from '../../../test/utils'
import { tasksApi, subjectsApi } from '../../../api'

vi.mock('../../../api', () => ({
  analyticsApi: {
    dashboard: vi.fn(),
    overview: vi.fn(),
    activity: vi.fn(),
    subjectProgress: vi.fn(),
  },
  tasksApi: {
    list: vi.fn(),
    create: vi.fn(),
    complete: vi.fn(),
    remove: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
  },
  taskLogsApi: { list: vi.fn(), create: vi.fn() },
  revisionsApi: { list: vi.fn(), due: vi.fn(), review: vi.fn() },
  subjectsApi: { list: vi.fn(), getById: vi.fn(), create: vi.fn() },
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

const mockedTasks = vi.mocked(tasksApi)
const mockedSubjects = vi.mocked(subjectsApi)

const task = {
  id: 't1',
  title: 'Solve sliding window questions',
  status: 'todo' as const,
  priority: 'medium' as const,
  dueDate: null,
  estimatedMinutes: 45,
}

describe('PlannerPage', () => {
  beforeEach(() => {
    mockedTasks.list.mockReset()
    mockedTasks.create.mockReset()
    mockedTasks.complete.mockReset()
    mockedTasks.remove.mockReset()
    mockedSubjects.list.mockReset()

    mockedTasks.list.mockResolvedValue([task])
    mockedSubjects.list.mockResolvedValue([])
    mockedTasks.complete.mockResolvedValue({ ...task, status: 'done' })
    mockedTasks.remove.mockResolvedValue(undefined)
  })

  it('lists existing tasks', async () => {
    renderWithProviders(<PlannerPage />, { route: '/app/planner' })
    expect(await screen.findByText('Solve sliding window questions')).toBeInTheDocument()
  })

  it('creates a task from the form', async () => {
    const user = userEvent.setup()
    mockedTasks.create.mockResolvedValue(task)

    renderWithProviders(<PlannerPage />, { route: '/app/planner' })

    await user.click(await screen.findByRole('button', { name: /new task/i }))
    await user.type(screen.getByLabelText(/task title/i), 'Review graph traversal')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    await waitFor(() => {
      expect(mockedTasks.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Review graph traversal' }),
      )
    })
  })

  it('validates the task title before submitting', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlannerPage />, { route: '/app/planner' })

    await user.click(await screen.findByRole('button', { name: /new task/i }))
    await user.type(screen.getByLabelText(/task title/i), 'ab')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    expect(await screen.findByText(/at least 3 characters/i)).toBeInTheDocument()
    expect(mockedTasks.create).not.toHaveBeenCalled()
  })

  it('completes a task', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlannerPage />, { route: '/app/planner' })

    await user.click(await screen.findByRole('button', { name: /complete solve sliding window questions/i }))

    await waitFor(() => {
      expect(mockedTasks.complete).toHaveBeenCalledWith('t1')
    })
  })

  it('asks for confirmation before deleting a task', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlannerPage />, { route: '/app/planner' })

    await user.click(await screen.findByRole('button', { name: /delete solve sliding window questions/i }))

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(mockedTasks.remove).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(mockedTasks.remove).toHaveBeenCalledWith('t1')
    })
  })

  it('shows an empty state when no tasks exist', async () => {
    mockedTasks.list.mockResolvedValue([])
    renderWithProviders(<PlannerPage />, { route: '/app/planner' })
    expect(await screen.findByText(/nothing scheduled/i)).toBeInTheDocument()
  })
})
