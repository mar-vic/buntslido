const BASE = '/api'

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for non-secure contexts (HTTP on LAN)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function getAuthorToken(): string {
  let token = localStorage.getItem('buntslido_author_token')
  if (!token) {
    token = generateUUID()
    localStorage.setItem('buntslido_author_token', token)
  }
  return token
}

async function request<T>(
  path: string,
  options: RequestInit & { hostToken?: string } = {}
): Promise<T> {
  const { hostToken, ...rest } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  }
  if (hostToken) {
    headers['X-Host-Token'] = hostToken
  }
  const res = await fetch(`${BASE}${path}`, { ...rest, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail ?? res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export { request, getAuthorToken }
