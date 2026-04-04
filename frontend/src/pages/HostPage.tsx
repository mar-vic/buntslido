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
  const [error, setError] = useState<string | null>(null)
  const [upvotedIds] = useState<Set<number>>(new Set())
  const { questions, setInitial, handleWsMessage } = useQuestions()

  useEffect(() => {
    if (!joinCode || !hostToken) return
    Promise.all([getEvent(joinCode), getAllQuestions(joinCode, hostToken)])
      .then(([ev, qs]) => {
        setEvent(ev)
        setInitial(qs)
      })
      .catch((err) => setError((err as Error).message))
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
    await submitQuestion(joinCode!, body)
  }

  async function handleUpvote(id: number) {
    if (upvotedIds.has(id)) return
    await upvoteQuestion(joinCode!, id)
  }

  async function handleStatusChange(id: number, status: QuestionStatus) {
    await updateQuestionStatus(joinCode!, id, status, hostToken!)
  }

  async function handleDelete(id: number) {
    await deleteQuestion(joinCode!, id, hostToken!)
  }

  async function toggleActive() {
    if (!event) return
    const updated = await updateEvent(joinCode!, { is_active: !event.is_active }, hostToken!)
    setEvent(updated)
  }

  if (!hostToken) return <p style={{ color: '#c62828', padding: '2rem' }}>Missing host token.</p>
  if (error) return <p style={{ color: '#c62828', padding: '2rem' }}>{error}</p>
  if (!event) return <p style={{ padding: '2rem' }}>Loading…</p>

  return (
    <div style={{ maxWidth: 680, margin: '2rem auto', padding: '0 1rem' }}>
      <EventHeader title={event.title} joinCode={event.join_code} isActive={event.is_active} />
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={toggleActive} style={{ cursor: 'pointer' }}>
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
