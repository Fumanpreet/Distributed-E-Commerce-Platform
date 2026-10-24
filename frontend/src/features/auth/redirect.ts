// Only allow in-app paths, never an external URL from the query string.
// A prefix check alone is not enough: browsers treat `\` like `/` and strip tabs/newlines, so
// `/\evil.com` or `/\t/evil.com` resolve to another origin. Resolve the value the way the browser
// would and require the same origin and a single-slash path.
export function safeRedirect(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'

  const origin = window.location.origin
  let url: URL
  try {
    url = new URL(value, origin)
  } catch {
    return '/'
  }
  // After dot-segment removal `/.//evil.com` has the pathname `//evil.com`, which navigate() would
  // treat as protocol-relative
  if (url.origin !== origin || !url.pathname.startsWith('/') || url.pathname.startsWith('//')) {
    return '/'
  }
  return url.pathname + url.search + url.hash
}
