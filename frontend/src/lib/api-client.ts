import axios, { isAxiosError } from 'axios'
import type { ApiError } from '../types/api'
import { toast } from 'sonner'
import { queryClient } from './query-client'

export const ME_QUERY_KEY = ['me'] as const

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
})

// Bumped on every login. A 401 from a request sent before the latest login (e.g. a logged-out
// /auth/me or /cart still in flight) describes the old session, so it must not log the new one out.
let sessionGeneration = 0
const requestGeneration = new WeakMap<object, number>()

export function startNewSession() {
  sessionGeneration += 1
}

// synchronous: tag the request with the session it was sent in, not whatever session exists a tick later
apiClient.interceptors.request.use(
  (config) => {
    requestGeneration.set(config, sessionGeneration)
    return config
  },
  undefined,
  { synchronous: true },
)

// Session expired or not logged in: clear the cached user so <ProtectedRoute> sends us to /login.
// A failed login is also a 401, but that is handled by the login form itself.
apiClient.interceptors.response.use(undefined, (error) => {
  if (
    isAxiosError(error) &&
    error.response?.status === 401 &&
    !error.config?.url?.includes('/auth/login') &&
    !!error.config &&
    requestGeneration.get(error.config) === sessionGeneration
  ) {
    // Only a user who WAS signed in gets the message; a fixed toast id keeps concurrent 401s to one toast
    if (queryClient.getQueryData(ME_QUERY_KEY)) {
      toast.error('Your session expired. Please sign in again.', { id: 'session-expired' })
    }
    queryClient.setQueryData(ME_QUERY_KEY, null)
  }
  return Promise.reject(error)
})

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError<ApiError>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback
  }
  return error instanceof Error ? error.message : fallback
}
