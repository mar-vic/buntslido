import type { Question, QuestionStatus } from '../types'
import { QuestionCard } from './QuestionCard'

interface Props {
  questions: Question[]
  isHost: boolean
  upvotedIds: Set<number>
  onUpvote: (id: number) => void
  onStatusChange?: (id: number, status: QuestionStatus) => void
  onDelete?: (id: number) => void
  showArchived?: boolean
}

function sortQuestions(qs: Question[]): Question[] {
  return [...qs].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === 'open') return -1
      if (b.status === 'open') return 1
    }
    if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
}

export function QuestionList({
  questions,
  isHost,
  upvotedIds,
  onUpvote,
  onStatusChange,
  onDelete,
  showArchived = false,
}: Props) {
  const visible = questions.filter((q) =>
    showArchived ? true : q.status !== 'archived'
  )
  const sorted = sortQuestions(visible)

  const active = sorted.filter((q) => q.status !== 'archived')
  const archived = sorted.filter((q) => q.status === 'archived')

  if (active.length === 0 && (!showArchived || archived.length === 0)) {
    return <p style={{ color: '#999' }}>No questions yet. Be the first to ask!</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {active.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          isHost={isHost}
          hasUpvoted={upvotedIds.has(q.id)}
          onUpvote={onUpvote}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
      {showArchived && archived.length > 0 && (
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#757575' }}>
            Archived ({archived.length})
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            {archived.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                isHost={isHost}
                hasUpvoted={upvotedIds.has(q.id)}
                onUpvote={onUpvote}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
