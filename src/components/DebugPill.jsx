// Requirement: Floating debug pill for production diagnostics.
// Approach: Separate React root (survives App crashes), collapsible panel with log + environment tabs.
// Alternatives:
//   - Render inside App tree: Rejected - crashes in App would kill the debug UI too.
//   - Browser devtools only: Rejected - not available on mobile or for non-technical users reporting bugs.

import { useState, useEffect, useRef, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { getEntries, clearEntries, subscribe, debugLog } from '../utils/debugLog'

function formatTime(ts) {
  const d = new Date(ts)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${h}:${m}:${s}.${ms}`
}

const SEVERITY_COLORS = {
  info: '#60a5fa',
  warn: '#fbbf24',
  error: '#f87171',
  debug: '#a78bfa',
}

function DebugPillInner() {
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState('log')
  const [entries, setEntries] = useState(getEntries)
  const logEndRef = useRef(null)

  useEffect(() => {
    return subscribe((newEntries) => setEntries([...newEntries]))
  }, [])

  useEffect(() => {
    if (expanded && tab === 'log' && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [entries.length, expanded, tab])

  const errorCount = entries.filter(e => e.severity === 'error').length
  const warnCount = entries.filter(e => e.severity === 'warn').length

  const copyReport = useCallback(() => {
    const env = getEnvironmentInfo()
    const logLines = entries.map(e =>
      `[${formatTime(e.timestamp)}] [${e.severity}] [${e.source}] ${e.event}${e.details ? ' ' + JSON.stringify(e.details) : ''}`
    ).join('\n')

    const report = [
      '=== CanvaGrid Debug Report ===',
      `Generated: ${new Date().toISOString()}`,
      '',
      '--- Environment ---',
      ...Object.entries(env).map(([k, v]) => `${k}: ${v}`),
      '',
      '--- Log ---',
      logLines || '(empty)',
    ].join('\n')

    navigator.clipboard.writeText(report).catch(() => {
      // Clipboard API fallback: use a temporary textarea
      const ta = document.createElement('textarea')
      ta.value = report
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })

    debugLog('debug-pill', 'report-copied', null, 'info')
  }, [entries])

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          position: 'fixed',
          bottom: 12,
          left: 12,
          zIndex: 99999,
          background: '#27272a',
          color: '#a1a1aa',
          border: '1px solid #3f3f46',
          borderRadius: 20,
          padding: '4px 12px',
          fontSize: 11,
          fontFamily: 'monospace',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          opacity: 0.7,
        }}
        title="Open debug panel"
      >
        dbg
        {errorCount > 0 && (
          <span style={{ background: '#dc2626', color: '#fff', borderRadius: 8, padding: '0 5px', fontSize: 10 }}>
            {errorCount}
          </span>
        )}
        {warnCount > 0 && (
          <span style={{ background: '#d97706', color: '#fff', borderRadius: 8, padding: '0 5px', fontSize: 10 }}>
            {warnCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 12,
      left: 12,
      zIndex: 99999,
      width: 380,
      maxWidth: 'calc(100vw - 24px)',
      maxHeight: 'min(420px, 60vh)',
      background: '#18181b',
      color: '#e4e4e7',
      border: '1px solid #3f3f46',
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 11,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderBottom: '1px solid #3f3f46',
        flexShrink: 0,
      }}>
        <button
          onClick={() => setTab('log')}
          style={{
            background: tab === 'log' ? '#3f3f46' : 'transparent',
            color: tab === 'log' ? '#fff' : '#a1a1aa',
            border: 'none',
            borderRadius: 4,
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: 11,
          }}
        >
          Log ({entries.length})
        </button>
        <button
          onClick={() => setTab('env')}
          style={{
            background: tab === 'env' ? '#3f3f46' : 'transparent',
            color: tab === 'env' ? '#fff' : '#a1a1aa',
            border: 'none',
            borderRadius: 4,
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: 11,
          }}
        >
          Env
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={copyReport}
          style={{
            background: 'transparent',
            color: '#60a5fa',
            border: '1px solid #3f3f46',
            borderRadius: 4,
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: 10,
          }}
        >
          Copy
        </button>
        <button
          onClick={() => { clearEntries() }}
          style={{
            background: 'transparent',
            color: '#fbbf24',
            border: '1px solid #3f3f46',
            borderRadius: 4,
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: 10,
          }}
        >
          Clear
        </button>
        <button
          onClick={() => setExpanded(false)}
          style={{
            background: 'transparent',
            color: '#a1a1aa',
            border: 'none',
            padding: '2px 6px',
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          x
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '6px 10px' }}>
        {tab === 'log' && (
          entries.length === 0 ? (
            <div style={{ color: '#71717a', padding: 8, textAlign: 'center' }}>No entries</div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} style={{ marginBottom: 3, lineHeight: 1.4 }}>
                <span style={{ color: '#71717a' }}>{formatTime(entry.timestamp)}</span>{' '}
                <span style={{ color: SEVERITY_COLORS[entry.severity] || '#a1a1aa' }}>[{entry.severity}]</span>{' '}
                <span style={{ color: '#a78bfa' }}>[{entry.source}]</span>{' '}
                <span>{entry.event}</span>
                {entry.details && (
                  <span style={{ color: '#71717a' }}> {JSON.stringify(entry.details)}</span>
                )}
              </div>
            ))
          )
        )}
        {tab === 'log' && <div ref={logEndRef} />}

        {tab === 'env' && (
          <EnvironmentTab />
        )}
      </div>
    </div>
  )
}

function getEnvironmentInfo() {
  return {
    url: window.location.href,
    userAgent: navigator.userAgent,
    screen: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    devicePixelRatio: window.devicePixelRatio,
    online: navigator.onLine,
    protocol: window.location.protocol,
    standalone: window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
    serviceWorker: 'serviceWorker' in navigator,
    indexedDB: 'indexedDB' in window,
    timestamp: new Date().toISOString(),
  }
}

function EnvironmentTab() {
  const info = getEnvironmentInfo()

  return (
    <div>
      {Object.entries(info).map(([key, value]) => (
        <div key={key} style={{ marginBottom: 3 }}>
          <span style={{ color: '#a78bfa' }}>{key}:</span>{' '}
          <span>{String(value)}</span>
        </div>
      ))}
    </div>
  )
}

// Mount into a separate React root so it survives App crashes
export function mountDebugPill() {
  const container = document.createElement('div')
  container.id = 'debug-pill-root'
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(<DebugPillInner />)
}
