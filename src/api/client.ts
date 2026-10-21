import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import type { ApiErrorBody } from '../types/core'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

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

let accessToken: string | null = null

/** In-memory bearer token used when the backend does not rely solely on cookies. */
export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
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
