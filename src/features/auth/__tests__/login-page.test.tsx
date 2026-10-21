import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { LoginPage } from '../login-page'
import { renderWithProviders } from '../../../test/utils'
import { authApi } from '../../../api/auth'

vi.mock('../../../api/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    updateProfile: vi.fn(),
  },
}))

const mockedAuth = vi.mocked(authApi)

describe('LoginPage', () => {
  beforeEach(() => {
    mockedAuth.me.mockResolvedValue(null)
    mockedAuth.login.mockReset()
  })

  it('renders the login form', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' })

    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows a validation error for an invalid email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { route: '/login' })

    await user.type(await screen.findByLabelText(/email/i), 'not-an-email')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument()
    expect(mockedAuth.login).not.toHaveBeenCalled()
  })

  it('submits valid credentials and navigates to the app', async () => {
    const user = userEvent.setup()
    mockedAuth.login.mockResolvedValue({
      user: { id: 'u1', name: 'Ada', email: 'ada@example.com' },
    })

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<p>Dashboard loaded</p>} />
      </Routes>,
      { route: '/login' },
    )

    await user.type(await screen.findByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/dashboard loaded/i)).toBeInTheDocument()
    expect(mockedAuth.login).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'password123',
    })
  })

  it('surfaces a backend error message when sign in fails', async () => {
    const user = userEvent.setup()
    mockedAuth.login.mockRejectedValue(new Error('Invalid email or password'))

    renderWithProviders(<LoginPage />, { route: '/login' })

    await user.type(await screen.findByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid email or password/i)
  })
})

