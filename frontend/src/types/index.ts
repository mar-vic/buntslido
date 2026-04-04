export type QuestionStatus = 'open' | 'answered' | 'archived'

export interface Event {
  id: number
  title: string
  join_code: string
  is_active: boolean
  created_at: string
}

export interface Question {
  id: number
  event_id: number
  body: string
  upvotes: number
  status: QuestionStatus
  created_at: string
}

export type WsMessage =
  | { type: 'question_created'; question: Question }
  | { type: 'question_upvoted'; question_id: number; upvotes: number }
  | { type: 'question_updated'; question_id: number; status: QuestionStatus }
  | { type: 'question_deleted'; question_id: number }
  | { type: 'event_updated'; is_active: boolean; title: string }
