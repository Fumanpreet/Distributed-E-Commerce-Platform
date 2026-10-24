import { isAxiosError } from 'axios'
import { apiClient } from '../../lib/api-client'
import type { RegisterRequest, User } from '../../types/api'

export async function fetchMe(): Promise<User | null> {
  try {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) return null
    throw error
  }
}

// Spring Security form login: form-urlencoded, username = email
export async function login(email: string, password: string): Promise<User> {
  const { data } = await apiClient.post<User>(
    '/auth/login',
    new URLSearchParams({ username: email, password }),
  )
  return data
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function register(request: RegisterRequest): Promise<User> {
  const { data } = await apiClient.post<User>('/auth/register', request)
  return data
}
