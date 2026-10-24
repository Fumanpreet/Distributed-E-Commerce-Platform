import { http, HttpResponse, delay } from 'msw'
import { expect, test } from 'vitest'
import { server, user } from '../test/server'
import { apiClient, ME_QUERY_KEY, startNewSession } from './api-client'
import { queryClient } from './query-client'

test('a 401 from a request sent before the latest login does not log the new session out', async () => {
  server.use(
    http.get('*/api/cart', async () => {
      await delay(50)
      return new HttpResponse(null, { status: 401 })
    }),
  )
  const stale = apiClient.get('/cart').catch(() => undefined)
  startNewSession()
  queryClient.setQueryData(ME_QUERY_KEY, user)
  await stale

  expect(queryClient.getQueryData(ME_QUERY_KEY)).toEqual(user)
})

test('a 401 in the current session still clears the user', async () => {
  server.use(http.get('*/api/cart', () => new HttpResponse(null, { status: 401 })))
  queryClient.setQueryData(ME_QUERY_KEY, user)
  await apiClient.get('/cart').catch(() => undefined)

  expect(queryClient.getQueryData(ME_QUERY_KEY)).toBeNull()
})
