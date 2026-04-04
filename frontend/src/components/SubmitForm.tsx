import { useState } from 'react'

interface Props {
  onSubmit: (body: string) => Promise<void>
  disabled?: boolean
}

export function SubmitForm({ onSubmit, disabled }: Props) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(trimmed)
      setBody('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Ask a question..."
        rows={3}
        maxLength={500}
        disabled={disabled || submitting}
        style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem', resize: 'vertical' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        {error && <span style={{ color: '#c62828', fontSize: '0.875rem' }}>{error}</span>}
        <span style={{ fontSize: '0.8rem', color: '#999', marginLeft: 'auto' }}>{body.length}/500</span>
        <button
          type="submit"
          disabled={disabled || submitting || !body.trim()}
          style={{ marginLeft: '1rem', cursor: 'pointer' }}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
