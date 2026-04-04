import { useState, useCallback } from 'react'
import type { Question, WsMessage } from '../types'

export function useQuestions(initial: Question[] = []) {
  const [questions, setQuestions] = useState<Question[]>(initial)

  const setInitial = useCallback((qs: Question[]) => setQuestions(qs), [])

  const handleWsMessage = useCallback((msg: WsMessage) => {
    setQuestions((prev) => {
      switch (msg.type) {
        case 'question_created':
          if (prev.find((q) => q.id === msg.question.id)) return prev
          return [...prev, msg.question]

        case 'question_upvoted':
          return prev.map((q) =>
            q.id === msg.question_id ? { ...q, upvotes: msg.upvotes } : q
          )

        case 'question_updated':
          return prev.map((q) =>
            q.id === msg.question_id ? { ...q, status: msg.status } : q
          )

        case 'question_deleted':
          return prev.filter((q) => q.id !== msg.question_id)

        default:
          return prev
      }
    })
  }, [])

  return { questions, setInitial, handleWsMessage }
}
