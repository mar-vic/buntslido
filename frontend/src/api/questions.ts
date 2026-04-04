import { request, getAuthorToken } from './client'
import type { Question, QuestionStatus } from '../types'

export function getQuestions(joinCode: string): Promise<Question[]> {
  return request(`/events/${joinCode}/questions`)
}

export function getAllQuestions(joinCode: string, hostToken: string): Promise<Question[]> {
  return request(`/events/${joinCode}/questions/all`, { hostToken })
}

export function submitQuestion(joinCode: string, body: string): Promise<Question> {
  return request(`/events/${joinCode}/questions`, {
    method: 'POST',
    body: JSON.stringify({ body, author_token: getAuthorToken() }),
  })
}

export function upvoteQuestion(joinCode: string, questionId: number): Promise<Question> {
  return request(`/events/${joinCode}/questions/${questionId}/upvote`, {
    method: 'POST',
    body: JSON.stringify({ author_token: getAuthorToken() }),
  })
}

export function updateQuestionStatus(
  joinCode: string,
  questionId: number,
  status: QuestionStatus,
  hostToken: string
): Promise<Question> {
  return request(`/events/${joinCode}/questions/${questionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    hostToken,
  })
}

export function deleteQuestion(
  joinCode: string,
  questionId: number,
  hostToken: string
): Promise<void> {
  return request(`/events/${joinCode}/questions/${questionId}`, {
    method: 'DELETE',
    hostToken,
  })
}
