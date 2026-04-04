import type { Question, QuestionStatus } from '../types'
import { HostControls } from './HostControls'

interface Props {
  question: Question
  isHost: boolean
  hasUpvoted: boolean
  onUpvote: (id: number) => void
  onStatusChange?: (id: number, status: QuestionStatus) => void
  onDelete?: (id: number) => void
}

export function QuestionCard({
  question,
  isHost,
  hasUpvoted,
  onUpvote,
  onStatusChange,
  onDelete,
}: Props) {
  const isAnswered = question.status === 'answered'
  const isArchived = question.status === 'archived'

  const bg = isAnswered
    ? 'var(--color-card-answered-bg)'
    : isArchived
    ? 'var(--color-card-archived-bg)'
    : 'var(--color-card-bg)'

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '0.75rem 1rem',
        opacity: isAnswered || isArchived ? 0.7 : 1,
        background: bg,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{ margin: 0, flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {question.body}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '1rem', minWidth: 48 }}>
          <button
            onClick={() => onUpvote(question.id)}
            disabled={hasUpvoted || isAnswered}
            title={hasUpvoted ? 'Already upvoted' : 'Upvote'}
            style={{ fontSize: '1.2rem', background: 'none', border: 'none', padding: '0 0.25rem' }}
          >
            ▲
          </button>
          <span style={{ fontWeight: 600 }}>{question.upvotes}</span>
        </div>
      </div>
      <div style={{ marginTop: '0.25rem' }}>
        {isAnswered && (
          <span style={{ color: '#4caf50', fontSize: '0.8rem', fontWeight: 600 }}>✓ Answered</span>
        )}
        {isArchived && (
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Archived</span>
        )}
      </div>
      {isHost && onStatusChange && onDelete && (
        <HostControls
          questionId={question.id}
          status={question.status}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      )}
    </div>
  )
}
