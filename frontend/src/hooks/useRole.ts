import { useLocation, useSearchParams } from 'react-router-dom'

export function useRole() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const hostToken = searchParams.get('t')
  const isHost = location.pathname.endsWith('/host') && !!hostToken
  return { isHost, hostToken: isHost ? hostToken! : null }
}
