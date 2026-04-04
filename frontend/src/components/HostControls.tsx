import type { QuestionStatus } from '../types'

interface Props {
  questionId: number
  status: QuestionStatus
  onStatusChange: (id: number, status: QuestionStatus) => void
  onDelete: (id: number) => void
}

export function HostControls({ questionId, status, onStatusChange, onDelete }: Props) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
      {status === 'open' && (
        <button onClick={() => onStatusChange(questionId, 'answered')}>
          Mark answered
        </button>
      )}
      {status === 'open' && (
        <button onClick={() => onStatusChange(questionId, 'archived')}>
          Archive
        </button>
      )}
      <button
        onClick={() => onDelete(questionId)}
        style={{ color: '#c62828', cursor: 'pointer' }}
      >
        Delete
      </button>
    </div>
  )
}
