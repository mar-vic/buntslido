import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getEvent } from '../api/events'
import { getQuestions, submitQuestion, upvoteQuestion } from '../api/questions'
import { EventHeader } from '../components/EventHeader'
import { SubmitForm } from '../components/SubmitForm'
import { QuestionList } from '../components/QuestionList'
import { useWebSocket } from '../hooks/useWebSocket'
import { useQuestions } from '../hooks/useQuestions'
import type { Event, WsMessage } from '../types'

export function AudiencePage() {
  const { joinCode } = useParams<{ joinCode: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [upvotedIds, setUpvotedIds] = useState<Set<number>>(new Set())
  const { questions, setInitial, handleWsMessage } = useQuestions()

  useEffect(() => {
    if (!joinCode) return
    Promise.all([getEvent(joinCode), getQuestions(joinCode)])
      .then(([ev, qs]) => {
        setEvent(ev)
        setInitial(qs)
      })
      .catch((err) => setError((err as Error).message))
  }, [joinCode])

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
    try {
      await upvoteQuestion(joinCode!, id)
      setUpvotedIds((s) => new Set(s).add(id))
    } catch {
      // duplicate upvote handled silently
    }
  }

  if (error) return <p style={{ color: '#c62828', padding: '2rem' }}>{error}</p>
  if (!event) return <p style={{ padding: '2rem' }}>Loading…</p>

  return (
    <div style={{ maxWidth: 680, margin: '2rem auto', padding: '0 1rem' }}>
      <EventHeader title={event.title} joinCode={event.join_code} isActive={event.is_active} />
      <SubmitForm onSubmit={handleSubmit} disabled={!event.is_active} />
      <QuestionList
        questions={questions}
        isHost={false}
        upvotedIds={upvotedIds}
        onUpvote={handleUpvote}
      />
    </div>
  )
}
