import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createEvent, listEvents, deleteEvent } from '../api/events'
import type { Event } from '../types'

const STORAGE_KEY = 'buntslido_host_tokens'

function loadHostTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveHostToken(joinCode: string, token: string) {
  const tokens = loadHostTokens()
  tokens[joinCode] = token
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

function removeHostToken(joinCode: string) {
  const tokens = loadHostTokens()
  delete tokens[joinCode]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

export function HomePage() {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [hostTokens, setHostTokens] = useState<Record<string, string>>(loadHostTokens)
  const navigate = useNavigate()

  useEffect(() => {
    listEvents().then(setEvents).catch(() => {})
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)
    try {
      const event = await createEvent(title.trim())
      saveHostToken(event.join_code, event.host_token)
      setHostTokens(loadHostTokens())
      navigate(`/event/${event.join_code}/host?t=${event.host_token}`)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  async function handleDelete(joinCode: string) {
    await deleteEvent(joinCode)
    removeHostToken(joinCode)
    setHostTokens(loadHostTokens())
    setEvents((prev) => prev.filter((ev) => ev.join_code !== joinCode))
  }

  return (
    <div style={{ maxWidth: 520, margin: '4rem auto', padding: '0 1rem' }}>
      <h1>Buntslido</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>Create a live Q&A session for your audience.</p>
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Session title"
          required
          style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }}
        />
        <button type="submit" disabled={loading || !title.trim()} style={{ padding: '0.5rem 1rem' }}>
          {loading ? 'Creating…' : 'Create'}
        </button>
      </form>
      {error && <p style={{ color: '#e57373' }}>{error}</p>}

      {events.length > 0 && (
        <div style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', fontWeight: 500 }}>
            Past sessions
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {events.map((ev) => {
              const token = hostTokens[ev.join_code]
              return (
                <li
                  key={ev.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.75rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    background: 'var(--color-card-bg)',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 500 }}>{ev.title}</span>
                    {!ev.is_active && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        closed
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {token && (
                      <Link to={`/event/${ev.join_code}/host?t=${token}`}>Manage ⚙</Link>
                    )}
                    <Link to={`/event/${ev.join_code}`} style={{ color: '#4caf50' }}>Join →</Link>
                    <button
                      onClick={() => handleDelete(ev.join_code)}
                      style={{ fontSize: '0.8rem', color: '#e57373', padding: '0.25rem 0.5rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
