export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  targetRole?: string | null
  targetCompanies?: string[]
  graduationYear?: number | null
  createdAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string | null
}

export interface AuthResponse {
  user: User
  tokens?: AuthTokens
  /** Some deployments return the tokens as top-level fields. */
  accessToken?: string
  refreshToken?: string | null
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  targetRole?: string
  targetCompanies?: string[]
  graduationYear?: number
}

export interface UpdateProfilePayload {
  name?: string
  targetRole?: string | null
  targetCompanies?: string[]
  graduationYear?: number | null
}
