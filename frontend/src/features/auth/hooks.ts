import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ME_QUERY_KEY, startNewSession } from '../../lib/api-client'
import type { RegisterRequest, User } from '../../types/api'
import { fetchMe, login, logout, register } from './api'

export function useMe() {
  return useQuery({ queryKey: ME_QUERY_KEY, queryFn: fetchMe, staleTime: Infinity })
}

// New session: drop late 401s from the old one, cancel any in-flight logged-out /auth/me, and refetch
// everything else (e.g. the cart) with the new cookie
function useStartSession() {
  const queryClient = useQueryClient()
  return async (user: User) => {
    startNewSession()
    await queryClient.cancelQueries({ queryKey: ME_QUERY_KEY })
    queryClient.setQueryData(ME_QUERY_KEY, user)
    await queryClient.resetQueries({ predicate: (query) => query.queryKey[0] !== ME_QUERY_KEY[0] })
  }
}

export function useLogin() {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: startSession,
  })
}

// Registers, then logs straight in with the same credentials
export function useRegister() {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: async (request: RegisterRequest) => {
      await register(request)
      return login(request.email, request.password)
    },
    onSuccess: startSession,
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      // Drop the previous user's data but keep the `me` query itself: clear() would detach the
      // observers (e.g. the Navbar's useMe) from it, so they would never see the logged-out state
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== ME_QUERY_KEY[0] })
      queryClient.setQueryData(ME_QUERY_KEY, null)
    },
  })
}
