import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'
import { queryClient } from './query-client'

function axiosErrorWithStatus(status: number) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, undefined, {
    status,
    statusText: '',
    headers: {},
    config,
    data: undefined,
  })
}

const retry = queryClient.getDefaultOptions().queries?.retry
if (typeof retry !== 'function') throw new Error('expected a retry function')

describe('default query retry', () => {
  it('does not retry 4xx responses', () => {
    expect(retry(0, axiosErrorWithStatus(401))).toBe(false)
    expect(retry(0, axiosErrorWithStatus(404))).toBe(false)
  })

  it('retries 5xx responses up to twice', () => {
    expect(retry(0, axiosErrorWithStatus(502))).toBe(true)
    expect(retry(1, axiosErrorWithStatus(502))).toBe(true)
    expect(retry(2, axiosErrorWithStatus(502))).toBe(false)
  })

  it('retries non-HTTP errors (e.g. network failures) up to twice', () => {
    expect(retry(0, new Error('Network Error'))).toBe(true)
    expect(retry(2, new Error('Network Error'))).toBe(false)
  })
})
