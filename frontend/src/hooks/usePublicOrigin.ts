import { useEffect, useState } from 'react'

export function usePublicOrigin(): string {
  const [origin, setOrigin] = useState(window.location.origin)

  useEffect(() => {
    const { hostname, protocol, port } = window.location
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') return

    fetch('/api/info')
      .then((r) => r.json())
      .then(({ ip }) => {
        const p = port ? `:${port}` : ''
        setOrigin(`${protocol}//${ip}${p}`)
      })
      .catch(() => {})
  }, [])

  return origin
}
