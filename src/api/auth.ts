import type { AuthResponse, LoginPayload, RegisterPayload, UpdateProfilePayload, User } from '../types/auth'
import { clearAuthTokens, get, getRefreshToken, post, patch, setAccessToken, setRefreshToken } from './client'

function applyTokens(result?: AuthResponse | null) {
  const tokens = result?.tokens
  const accessToken = tokens?.accessToken ?? result?.accessToken
  const refreshToken = tokens ? tokens.refreshToken : result?.refreshToken

  if (accessToken) setAccessToken(accessToken)
  if (refreshToken !== undefined) setRefreshToken(refreshToken ?? null)
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const result = await post<AuthResponse>('/auth/login', payload)
    applyTokens(result)
    return result
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const result = await post<AuthResponse>('/auth/register', payload)
    applyTokens(result)
    return result
  },

  async logout(): Promise<void> {
    try {
      await post('/auth/logout', { refreshToken: getRefreshToken() })
    } finally {
      clearAuthTokens()
    }
  },

  /** Exchange the refresh token for a fresh access token after a page reload. */
  async refreshSession(): Promise<AuthResponse> {
    const storedRefreshToken = getRefreshToken()
    const result = await post<AuthResponse>('/auth/refresh', storedRefreshToken ? { refreshToken: storedRefreshToken } : {})
    applyTokens(result)
    return result
  },

  /** Restore a session using the refresh token first, then the current access token. */
  async restoreSession(): Promise<User | null> {
    if (getRefreshToken()) {
      try {
        const restored = await this.refreshSession()
        if (restored?.user) return restored.user
      } catch {
        // A still-valid access token may work if the refresh token has expired or
        // the refresh endpoint is temporarily unavailable.
      }
    }

    const current = await this.me()
    if (!current) clearAuthTokens()
    return current
  },

  /** Returns the authenticated user, or null when the session is absent. */
  async me(): Promise<User | null> {
    try {
      return await get<User>('/auth/me')
    } catch (error) {
      if (error instanceof Error && 'status' in error && (error as { status: number }).status === 401) {
        setAccessToken(null)
        return null
      }
      throw error
    }
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    return patch<User>('/auth/me', payload)
  },
}
