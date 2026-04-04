const BASE = '/api'

function getAuthorToken(): string {
  let token = localStorage.getItem('buntslido_author_token')
  if (!token) {
    token = crypto.randomUUID()
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
