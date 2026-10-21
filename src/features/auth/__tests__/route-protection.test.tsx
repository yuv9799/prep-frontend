import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../../../test/utils'
import { authApi } from '../../../api/auth'
import { ProtectedRoute } from '../../../components/routing/protected-route'

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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<p>Login page</p>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<p>Protected content</p>} />
      </Route>
    </Routes>
  )
}

describe('route protection', () => {
  beforeEach(() => {
    mockedAuth.me.mockReset()
  })

  it('redirects an unauthenticated visitor to the login page', async () => {
    mockedAuth.me.mockResolvedValue(null)

    renderWithProviders(<AppRoutes />, { route: '/app' })

    await waitFor(() => {
      expect(screen.getByText(/login page/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
  })

  it('shows protected content for an authenticated user', async () => {
    mockedAuth.me.mockResolvedValue({ id: 'u1', name: 'Ada', email: 'ada@example.com' })

    renderWithProviders(<AppRoutes />, { route: '/app' })

    await waitFor(() => {
      expect(screen.getByText(/protected content/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/login page/i)).not.toBeInTheDocument()
  })
})
