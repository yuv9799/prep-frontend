import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { RegisterPage } from '../register-page'
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

describe('RegisterPage', () => {
  beforeEach(() => {
    mockedAuth.me.mockResolvedValue(null)
    mockedAuth.register.mockReset()
  })

  it('rejects mismatched passwords', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterPage />, { route: '/register' })

    await user.type(await screen.findByLabelText(/full name/i), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/^email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password456')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
    expect(mockedAuth.register).not.toHaveBeenCalled()
  })

  it('registers a new account and navigates to the app', async () => {
    const user = userEvent.setup()
    mockedAuth.register.mockResolvedValue({
      user: { id: 'u1', name: 'Ada Lovelace', email: 'ada@example.com' },
    })

    renderWithProviders(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/app" element={<p>Dashboard loaded</p>} />
      </Routes>,
      { route: '/register' },
    )

    await user.type(await screen.findByLabelText(/full name/i), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/^email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/dashboard loaded/i)).toBeInTheDocument()
    expect(mockedAuth.register).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'password123',
      targetRole: undefined,
    })
  })
})
