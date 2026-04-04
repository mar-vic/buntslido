import { useEffect, useRef, useCallback } from 'react'
import type { WsMessage } from '../types'

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting'

export function useWebSocket(
  joinCode: string | undefined,
  onMessage: (msg: WsMessage) => void,
  onStatusChange?: (status: ConnectionStatus) => void
) {
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryDelayRef = useRef(1000)
  const mountedRef = useRef(true)

  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage
  const onStatusRef = useRef(onStatusChange)
  onStatusRef.current = onStatusChange

  const connect = useCallback(() => {
    if (!joinCode || !mountedRef.current) return
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/${joinCode}`)
    wsRef.current = ws

    ws.onopen = () => {
      retryDelayRef.current = 1000
      onStatusRef.current?.('connected')
    }

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as WsMessage
        onMessageRef.current(msg)
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      onStatusRef.current?.('reconnecting')
      retryRef.current = setTimeout(() => {
        retryDelayRef.current = Math.min(retryDelayRef.current * 2, 16000)
        connect()
      }, retryDelayRef.current)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [joinCode])

  useEffect(() => {
    mountedRef.current = true
    onStatusRef.current?.('disconnected')
    connect()

    return () => {
      mountedRef.current = false
      if (retryRef.current) clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [connect])
}
