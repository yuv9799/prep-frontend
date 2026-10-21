import type { AuthResponse, LoginPayload, RegisterPayload, UpdateProfilePayload, User } from '../types/auth'
import { get, post, patch, setAccessToken } from './client'

function applyTokens(tokens?: { accessToken?: string; refreshToken?: string | null } | null) {
  if (tokens?.accessToken) {
    setAccessToken(tokens.accessToken)
  }
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const result = await post<AuthResponse>('/auth/login', payload)
    applyTokens(result?.tokens)
    if (result?.accessToken) setAccessToken(result.accessToken)
    return result
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const result = await post<AuthResponse>('/auth/register', payload)
    applyTokens(result?.tokens)
    if (result?.accessToken) setAccessToken(result.accessToken)
    return result
  },

  async logout(): Promise<void> {
    try {
      await post('/auth/logout')
    } finally {
      setAccessToken(null)
    }
  },

  /** Returns the authenticated user, or null when the session is absent. */
  async me(): Promise<User | null> {
    try {
      return await get<User>('/auth/me')
    } catch (error) {
      if (error instanceof Error && 'status' in error && (error as { status: number }).status === 401) {
        return null
      }
      throw error
    }
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    return patch<User>('/auth/me', payload)
  },
}
