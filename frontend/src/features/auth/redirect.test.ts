import { describe, expect, it } from 'vitest'
import { safeRedirect } from './redirect'

describe('safeRedirect', () => {
  it('allows in-app paths', () => expect(safeRedirect('/cart')).toBe('/cart'))
  it('keeps the query string and hash of an in-app path', () =>
    expect(safeRedirect('/orders/42?x=1#top')).toBe('/orders/42?x=1#top'))
  it('defaults to home', () => {
    expect(safeRedirect(null)).toBe('/')
    expect(safeRedirect('')).toBe('/')
  })

  it.each([
    ['absolute URL', 'https://evil.com'],
    ['javascript: URL', 'javascript:alert(1)'],
    ['protocol-relative', '//evil.com'],
    ['backslash after slash', '/\\evil.com'],
    ['double backslash after slash', '/\\\\evil.com'],
    ['leading tab', '\t//evil.com'],
    ['tab between slashes', '/\t/evil.com'],
    ['newline between slashes', '/\n/evil.com'],
    ['dot segment that collapses to //', '/.//evil.com'],
  ])('rejects %s (%j)', (_, value) => {
    expect(safeRedirect(value)).toBe('/')
  })

  // These stay on this origin: the encoded slashes/backslash are a literal path segment, not a host
  it.each([
    ['/%2F%2Fevil.com', '/%2F%2Fevil.com'],
    ['/%5Cevil.com', '/%5Cevil.com'],
    ['/ /evil.com', '/%20/evil.com'],
  ])('keeps %j on this origin', (value, expected) => {
    const result = safeRedirect(value)
    expect(result).toBe(expected)
    expect(new URL(result, window.location.origin).origin).toBe(window.location.origin)
  })

  // The nested target is itself a same-origin path; the login page validates the inner
  // ?redirect again when it reads it
  it('allows a nested redirect but the inner value is validated on its own', () => {
    const outer = safeRedirect('/login?redirect=//evil.com')
    expect(outer).toBe('/login?redirect=//evil.com')
    const inner = new URL(outer, window.location.origin).searchParams.get('redirect')
    expect(safeRedirect(inner)).toBe('/')
  })
})
