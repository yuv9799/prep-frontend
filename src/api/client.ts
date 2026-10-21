import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import type { ApiErrorBody } from '../types/core'

const configuredApiUrl = (import.meta.env.VITE_API_URL ?? '').trim()

function normalizeApiBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, '')
  if (!trimmed) return import.meta.env.DEV ? '/api' : ''

  // Accept either the backend origin or its explicit /api base URL.
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed)
      if (!url.pathname || url.pathname === '/') url.pathname = '/api'
      return url.toString().replace(/\/+$/, '')
    } catch {
      return trimmed
    }
  }

  return trimmed
}

const API_URL = normalizeApiBaseUrl(configuredApiUrl)
const API_URL_CONFIGURED = import.meta.env.DEV || /^https?:\/\//i.test(API_URL)

const ACCESS_TOKEN_KEY = 'prepforge.accessToken'
const REFRESH_TOKEN_KEY = 'prepforge.refreshToken'

function readSessionValue(key: string): string | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function writeSessionValue(key: string, value: string | null): void {
  try {
    if (typeof window === 'undefined') return
    if (value) window.sessionStorage.setItem(key, value)
    else window.sessionStorage.removeItem(key)
  } catch {
    // Keep the in-memory session usable if browser storage is unavailable.
  }
}

/** Normalized error surfaced to the UI. */
export class ApiError extends Error {
  status: number
  code?: string
  fieldErrors?: Record<string, string[]>

  constructor(message: string, status = 0, body?: ApiErrorBody) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = body?.code
    this.fieldErrors = body?.errors
  }

  get isUnauthorized() {
    return this.status === 401
  }

  get isForbidden() {
    return this.status === 403
  }

  get isNotFound() {
    return this.status === 404
  }

  get isNetworkError() {
    return this.status === 0
  }
}

let accessToken: string | null = readSessionValue(ACCESS_TOKEN_KEY)
let refreshToken: string | null = readSessionValue(REFRESH_TOKEN_KEY)

/** Short-lived bearer token; sessionStorage allows an SPA reload in the same tab. */
export function setAccessToken(token: string | null) {
  accessToken = token
  writeSessionValue(ACCESS_TOKEN_KEY, token)
}

export function getAccessToken() {
  return accessToken
}

/** Refresh tokens are stored per-tab because the API may be hosted cross-site. */
export function setRefreshToken(token: string | null) {
  refreshToken = token
  writeSessionValue(REFRESH_TOKEN_KEY, token)
}

export function getRefreshToken() {
  return refreshToken
}

export function clearAuthTokens() {
  setAccessToken(null)
  setRefreshToken(null)
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  if (!API_URL_CONFIGURED) {
    return Promise.reject(
      new ApiError(
        'The backend URL is not configured. Set VITE_API_URL to your deployed backend URL (for example, https://your-service.onrender.com/api).',
        0,
        { message: 'Backend API URL is missing', code: 'API_NOT_CONFIGURED' },
      ),
    )
  }
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    // Preserve intentional client-side configuration errors without rewriting them as network failures.
    if (error instanceof ApiError) return Promise.reject(error)

    const status = error.response?.status ?? 0
    const body = error.response?.data

    // Parse the canonical error envelope: { success: false, error: { code, message, details } }
    let message: string
    let code: string | undefined
    let fieldErrors: Record<string, string[]> | undefined

    if (body && typeof body === 'object' && 'error' in body && body.error) {
      const errBody = body.error as { code?: string; message?: string; details?: Record<string, string[]> }
      message = errBody.message || 'An error occurred'
      code = errBody.code
      fieldErrors = errBody.details
    } else if (body && typeof body === 'object' && 'message' in body) {
      message = (body as { message?: string }).message || 'An error occurred'
      code = (body as { code?: string }).code
      fieldErrors = (body as { errors?: Record<string, string[]> }).errors
    } else {
      message =
        status === 0
          ? 'Unable to reach the server. Check your connection and try again.'
          : error.message || 'Something went wrong. Please try again.'
    }

    return Promise.reject(new ApiError(message, status, { ...(body as ApiErrorBody), code, errors: fieldErrors }))
  },
)

/** Unwraps the canonical `{ success: true, data: ... }` envelope. */
export function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (record.success === true && 'data' in record) {
      return record.data as T
    }
    // Tolerate bare payloads (legacy / non-envelope responses).
    if (!('success' in record)) {
      return payload as T
    }
  }
  return payload as T
}

/** Normalizes collection responses that may be arrays or paginated envelopes. */
export function asList<T>(payload: unknown): T[] {
  const value = unwrap<unknown>(payload)
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    for (const key of ['items', 'results', 'data', 'rows']) {
      if (Array.isArray(record[key])) return record[key] as T[]
    }
  }
  return []
}

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, config)
  return unwrap<T>(response.data)
}

export async function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.post<T>(url, body, config)
  return unwrap<T>(response.data)
}

export async function patch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.patch<T>(url, body, config)
  return unwrap<T>(response.data)
}

export async function put<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.put<T>(url, body, config)
  return unwrap<T>(response.data)
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<T>(url, config)
  return unwrap<T>(response.data)
}
