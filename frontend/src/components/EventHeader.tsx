import { QRCodeSVG } from 'qrcode.react'
import { usePublicOrigin } from '../hooks/usePublicOrigin'

interface Props {
  title: string
  joinCode: string
  isActive: boolean
}

export function EventHeader({ title, joinCode, isActive }: Props) {
  const origin = usePublicOrigin()
  const audienceUrl = `${origin}/event/${joinCode}`

  function copy() {
    navigator.clipboard.writeText(audienceUrl)
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      {!isActive && (
        <p style={{ color: '#e57373', fontWeight: 600 }}>This session has ended.</p>
      )}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginTop: '1rem', flexWrap: 'wrap' }}>
        <div style={{ background: '#fff', padding: 8, borderRadius: 8, lineHeight: 0 }}>
          <QRCodeSVG value={audienceUrl} size={120} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
          <code style={{ background: 'var(--color-muted-bg)', padding: '4px 10px', borderRadius: 4, fontSize: '0.875rem', wordBreak: 'break-all' }}>
            {audienceUrl}
          </code>
          <button onClick={copy} style={{ alignSelf: 'flex-start' }}>Copy link</button>
        </div>
      </div>
    </div>
  )
}
