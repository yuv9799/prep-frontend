import { describe, expect, it, vi, beforeEach } from 'vitest'
import { apiClient, asList, unwrap, ApiError } from '../client'
import { authApi } from '../auth'
import { subjectsApi, topicsApi } from '../subjects'


describe('unwrap', () => {
  it('unwraps a data envelope', () => {
    expect(unwrap({ data: { id: 1 } })).toEqual({ id: 1 })
  })

  it('returns bare payloads untouched', () => {
    expect(unwrap({ id: 1 })).toEqual({ id: 1 })
  })
})

describe('asList', () => {
  it('reads arrays directly', () => {
    expect(asList([1, 2])).toEqual([1, 2])
  })

  it('reads common collection keys', () => {
    expect(asList({ data: { items: [1, 2] } })).toEqual([1, 2])
    expect(asList({ data: { results: [3] } })).toEqual([3])
  })

  it('returns an empty array for unknown shapes', () => {
    expect(asList({ data: { unexpected: true } })).toEqual([])
  })
})

describe('ApiError', () => {
  it('exposes status helpers', () => {
    const error = new ApiError('nope', 401)
    expect(error.isUnauthorized).toBe(true)
    expect(error.isNotFound).toBe(false)
  })

  it('treats a zero status as a network error', () => {
    expect(new ApiError('offline', 0).isNetworkError).toBe(true)
  })
})

describe('authApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns null from me() when the session is absent', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new ApiError('Unauthorized', 401))
    await expect(authApi.me()).resolves.toBeNull()
  })

  it('propagates non-401 failures from me()', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new ApiError('Server error', 500))
    await expect(authApi.me()).rejects.toThrow('Server error')
  })
})

describe('subjectsApi', () => {
  it('normalizes the subject list', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: { data: [{ id: 's1', name: 'DSA' }] } })
    await expect(subjectsApi.list()).resolves.toEqual([{ id: 's1', name: 'DSA' }])
  })

  it('scopes topics to a subject when provided', async () => {
    const spy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })
    await topicsApi.list('s1')
    expect(spy).toHaveBeenCalledWith('/subjects/s1/topics', undefined)
  })
})


