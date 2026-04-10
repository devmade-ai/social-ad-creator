/* eslint-disable react-refresh/only-export-components */
// Requirement: Floating debug pill for production diagnostics (alpha phase).
// Approach: Separate React root in #debug-root (survives App crashes), inline styles (survives
//   stylesheet failures), 3 tabs (Log, Env, PWA), embed mode skip, report generation via module.
// Alternatives:
//   - Render inside App tree: Rejected - crashes in App would kill the debug UI too.
//   - Browser devtools only: Rejected - not available on mobile or for non-technical users reporting bugs.

import { useState, useEffect, useRef, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { clearEntries, subscribe, debugLog, debugGenerateReport, formatTime } from '../utils/debugLog'

const SEVERITY_COLORS = {
  info: '#60a5fa',
  success: '#4ade80',
  warn: '#fbbf24',
  error: '#f87171',
}

// MobileNav dock height + safe area — pill must sit above this on mobile.
// Matches MobileNav's ~56px height + 12px breathing room.
const MOBILE_BOTTOM = 72
const DESKTOP_BOTTOM = 12
const MOBILE_MQ = '(max-width: 1023px)'

function getBottom() {
  return window.matchMedia(MOBILE_MQ).matches ? MOBILE_BOTTOM : DESKTOP_BOTTOM
}

// Clipboard with multiple fallbacks — ClipboardItem Blob, writeText, textarea execCommand.
async function copyToClipboard(text) {
  // Method 1: ClipboardItem Blob — works where writeText is blocked
  try {
    const blob = new Blob([text], { type: 'text/plain' })
    await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })])
    return true
  } catch { /* fall through */ }

  // Method 2: writeText
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch { /* fall through */ }

  // Method 3: Textarea fallback for mobile PWA webviews
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    return true
  } catch { return false }
}

function DebugPillInner() {
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState('log')
  const [entries, setEntries] = useState([])
  const [copyLabel, setCopyLabel] = useState('Copy')
  const [bottom, setBottom] = useState(getBottom)
  const logEndRef = useRef(null)
  const copyTimerRef = useRef(null)

  // Hydration-safe initialization — sync in useEffect, not useState initializer.
  // Subscriber replay delivers existing entries immediately on subscribe.
  useEffect(() => {
    return subscribe((allEntries) => setEntries([...allEntries]))
  }, [])

  // Track viewport size changes to reposition pill above MobileNav on mobile.
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const update = () => setBottom(getBottom())
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (expanded && tab === 'log' && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [entries.length, expanded, tab])

  const errorCount = entries.filter(e => e.severity === 'error').length
  const warnCount = entries.filter(e => e.severity === 'warn').length

  // Clean up copy feedback timer on unmount
  useEffect(() => () => clearTimeout(copyTimerRef.current), [])

  const copyReport = useCallback(async () => {
    const report = debugGenerateReport()
    const ok = await copyToClipboard(report)
    debugLog('debug-pill', ok ? 'report-copied' : 'report-copy-failed', null, ok ? 'success' : 'warn')
    // Visual feedback on the button — resets after 1.5s
    setCopyLabel(ok ? 'Copied!' : 'Failed')
    clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopyLabel('Copy'), 1500)
  }, [])

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          position: 'fixed',
          bottom,
          right: 12,
          zIndex: 80,
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
        {/* DebugPill renders in a separate React root without DaisyUI data-theme,
            so DaisyUI component classes won't resolve theme colors. Inline styles required. */}
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

  const tabButtonStyle = (id) => ({
    background: tab === id ? '#3f3f46' : 'transparent',
    color: tab === id ? '#fff' : '#a1a1aa',
    border: 'none',
    borderRadius: 4,
    padding: '2px 8px',
    cursor: 'pointer',
    fontSize: 11,
  })

  return (
    <div style={{
      position: 'fixed',
      bottom,
      right: 12,
      zIndex: 80,
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
        <button onClick={() => setTab('log')} style={tabButtonStyle('log')}>
          Log ({entries.length})
        </button>
        <button onClick={() => setTab('env')} style={tabButtonStyle('env')}>
          Env
        </button>
        <button onClick={() => setTab('pwa')} style={tabButtonStyle('pwa')}>
          PWA
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={copyReport}
          style={{
            background: 'transparent',
            color: copyLabel === 'Copied!' ? '#4ade80' : copyLabel === 'Failed' ? '#f87171' : '#60a5fa',
            border: '1px solid #3f3f46',
            borderRadius: 4,
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: 10,
          }}
        >
          {copyLabel}
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
                {entry.count > 1 && (
                  <span style={{ color: '#fbbf24', marginLeft: 4 }}>x{entry.count}</span>
                )}
                {entry.details && (
                  <span style={{ color: '#71717a' }}> {JSON.stringify(entry.details)}</span>
                )}
              </div>
            ))
          )
        )}
        {tab === 'log' && <div ref={logEndRef} />}

        {tab === 'env' && <EnvironmentTab />}
        {tab === 'pwa' && <PWADiagnosticsTab />}
      </div>
    </div>
  )
}

function getEnvironmentInfo() {
  return {
    // Redact query params and hash to prevent token/UTM leaking — matches debugGenerateReport
    url: window.location.origin + window.location.pathname
      + (window.location.search ? '?[redacted]' : '')
      + (window.location.hash ? '#[redacted]' : ''),
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

// --- PWA Diagnostics Tab ---
// Active health checks: HTTPS, SW registration, manifest validation, standalone mode,
// beforeinstallprompt receipt. Uses monotonic counter for stale-run cancellation.
const DIAG_STATUS_COLORS = {
  pass: '#4ade80',
  fail: '#f87171',
  warn: '#fbbf24',
  running: '#a1a1aa',
}

function PWADiagnosticsTab() {
  const [results, setResults] = useState([])
  const [running, setRunning] = useState(false)
  const runIdRef = useRef(0)

  const runDiagnostics = useCallback(async () => {
    const currentRun = ++runIdRef.current
    setRunning(true)
    setResults([])

    const diags = []

    // Sync checks
    diags.push({
      label: 'Protocol',
      status: location.protocol === 'https:' || location.hostname === 'localhost' ? 'pass' : 'fail',
      detail: location.protocol,
    })
    diags.push({
      label: 'Network',
      status: navigator.onLine ? 'pass' : 'warn',
      detail: navigator.onLine ? 'Online' : 'Offline',
    })
    diags.push({
      label: 'SW Support',
      status: 'serviceWorker' in navigator ? 'pass' : 'fail',
      detail: 'serviceWorker' in navigator ? 'Supported' : 'Not supported',
    })

    // Standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || navigator.standalone === true
    diags.push({
      label: 'Standalone',
      status: standalone ? 'pass' : 'warn',
      detail: String(standalone),
    })

    // beforeinstallprompt
    const hasPrompt = !!window.__pwaInstallPrompt
    diags.push({
      label: 'Install Prompt',
      status: hasPrompt ? 'pass' : 'warn',
      detail: hasPrompt ? 'Captured' : 'Not received',
    })

    const isStale = () => runIdRef.current !== currentRun

    // Stale-run guard for sync results
    if (isStale()) { setRunning(false); return }
    setResults([...diags])

    // Async: SW registration
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration('/')
        const state = reg?.active ? 'active' : reg?.waiting ? 'waiting' : reg?.installing ? 'installing' : 'none'
        diags.push({ label: 'SW State', status: reg ? 'pass' : 'warn', detail: state })
      } catch (e) {
        diags.push({ label: 'SW State', status: 'fail', detail: String(e) })
      }
    }

    if (isStale()) { setRunning(false); return }
    setResults([...diags])

    // Async: Manifest validation
    const manifestLink = document.querySelector('link[rel="manifest"]')
    if (manifestLink) {
      try {
        const res = await fetch(manifestLink.getAttribute('href') || '/manifest.json')
        const manifest = await res.json()
        const hasIcons = manifest.icons?.length > 0
        const hasName = !!manifest.name
        diags.push({
          label: 'Manifest',
          status: hasIcons && hasName ? 'pass' : 'warn',
          detail: `name=${manifest.name || 'missing'}, icons=${manifest.icons?.length || 0}`,
        })
      } catch {
        diags.push({ label: 'Manifest', status: 'fail', detail: 'Failed to fetch' })
      }
    } else {
      diags.push({ label: 'Manifest', status: 'fail', detail: 'No <link rel="manifest"> found' })
    }

    if (isStale()) { setRunning(false); return }
    setResults([...diags])
    setRunning(false)
  }, [])

  // Run diagnostics on mount
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { runDiagnostics() }, [runDiagnostics])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>PWA Diagnostics</span>
        <button
          onClick={runDiagnostics}
          disabled={running}
          style={{
            background: 'transparent',
            color: running ? '#71717a' : '#60a5fa',
            border: '1px solid #3f3f46',
            borderRadius: 4,
            padding: '1px 6px',
            cursor: running ? 'default' : 'pointer',
            fontSize: 10,
          }}
        >
          {running ? 'Running...' : 'Re-run'}
        </button>
      </div>
      {results.length === 0 && running && (
        <div style={{ color: '#71717a', textAlign: 'center', padding: 8 }}>Running checks...</div>
      )}
      {results.map((r) => (
        <div key={r.label} style={{ marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: DIAG_STATUS_COLORS[r.status] || '#a1a1aa',
            flexShrink: 0,
          }} />
          <span style={{ color: '#e4e4e7' }}>{r.label}:</span>
          <span style={{ color: '#a1a1aa' }}>{r.detail}</span>
        </div>
      ))}
    </div>
  )
}

// Mount into #debug-root — a static div in index.html, separate from App's #root.
// This ensures the pill survives App crashes.
export function mountDebugPill() {
  // Skip pill in embed mode
  if (window.location.search.includes('embed=')) return

  const container = document.getElementById('debug-root')
  if (!container) return
  const root = createRoot(container)
  root.render(<DebugPillInner />)
}
