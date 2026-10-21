import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import { ToastProvider } from '../components/ui'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })
}

export interface RenderOptions {
  route?: string
  queryClient?: QueryClient
  withAuth?: boolean
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', queryClient = createTestQueryClient(), withAuth = true }: RenderOptions = {},
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          {withAuth ? (
            <AuthProvider>
              <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
            </AuthProvider>
          ) : (
            <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
          )}
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper }),
  }
}

export { vi }
