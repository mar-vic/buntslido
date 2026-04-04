import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getEvent, updateEvent } from '../api/events'
import { getAllQuestions, submitQuestion, upvoteQuestion, updateQuestionStatus, deleteQuestion } from '../api/questions'
import { EventHeader } from '../components/EventHeader'
import { SubmitForm } from '../components/SubmitForm'
import { QuestionList } from '../components/QuestionList'
import { useWebSocket } from '../hooks/useWebSocket'
import { useQuestions } from '../hooks/useQuestions'
import { useRole } from '../hooks/useRole'
import type { Event, QuestionStatus, WsMessage } from '../types'

export function HostPage() {
  const { joinCode } = useParams<{ joinCode: string }>()
  const { hostToken } = useRole()
  const [event, setEvent] = useState<Event | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [upvotedIds] = useState<Set<number>>(new Set())
  const { questions, setInitial, handleWsMessage, removeQuestion } = useQuestions()

  useEffect(() => {
    if (!joinCode || !hostToken) return
    Promise.all([getEvent(joinCode), getAllQuestions(joinCode, hostToken)])
      .then(([ev, qs]) => {
        setEvent(ev)
        setInitial(qs)
      })
      .catch((err) => setLoadError((err as Error).message))
  }, [joinCode, hostToken])

  function onWsMessage(msg: WsMessage) {
    if (msg.type === 'event_updated') {
      setEvent((e) => e ? { ...e, ...msg } : e)
    } else {
      handleWsMessage(msg)
    }
  }

  useWebSocket(joinCode, onWsMessage)

  async function handleSubmit(body: string) {
    try {
      await submitQuestion(joinCode!, body)
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  async function handleUpvote(id: number) {
    if (upvotedIds.has(id)) return
    try {
      await upvoteQuestion(joinCode!, id)
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  async function handleStatusChange(id: number, status: QuestionStatus) {
    try {
      await updateQuestionStatus(joinCode!, id, status, hostToken!)
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteQuestion(joinCode!, id, hostToken!)
      removeQuestion(id)
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  async function toggleActive() {
    if (!event) return
    try {
      const updated = await updateEvent(joinCode!, { is_active: !event.is_active }, hostToken!)
      setEvent(updated)
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  if (!hostToken) return <p style={{ color: '#e57373', padding: '2rem' }}>Missing host token.</p>
  if (loadError) return <p style={{ color: '#e57373', padding: '2rem' }}>{loadError}</p>
  if (!event) return <p style={{ padding: '2rem' }}>Loading…</p>

  return (
    <div style={{ maxWidth: 680, margin: '2rem auto', padding: '0 1rem' }}>
      <EventHeader title={event.title} joinCode={event.join_code} isActive={event.is_active} />
      {actionError && (
        <p
          style={{ color: '#e57373', margin: '0 0 1rem', cursor: 'pointer', fontSize: '0.9rem' }}
          onClick={() => setActionError(null)}
        >
          ⚠ {actionError} (click to dismiss)
        </p>
      )}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={toggleActive}>
          {event.is_active ? 'Close session' : 'Reopen session'}
        </button>
      </div>
      <SubmitForm onSubmit={handleSubmit} disabled={!event.is_active} />
      <QuestionList
        questions={questions}
        isHost={true}
        upvotedIds={upvotedIds}
        onUpvote={handleUpvote}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        showArchived={true}
      />
    </div>
  )
}
