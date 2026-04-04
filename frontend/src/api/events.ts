import { request } from './client'
import type { Event } from '../types'

export interface CreateEventResponse extends Event {
  host_token: string
}

export function listEvents(): Promise<CreateEventResponse[]> {
  return request('/events')
}

export function createEvent(title: string): Promise<CreateEventResponse> {
  return request('/events', { method: 'POST', body: JSON.stringify({ title }) })
}

export function getEvent(joinCode: string): Promise<Event> {
  return request(`/events/${joinCode}`)
}

export function deleteEvent(joinCode: string): Promise<void> {
  return request(`/events/${joinCode}`, { method: 'DELETE' })
}

export function updateEvent(
  joinCode: string,
  data: { title?: string; is_active?: boolean },
  hostToken: string
): Promise<Event> {
  return request(`/events/${joinCode}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    hostToken,
  })
}
