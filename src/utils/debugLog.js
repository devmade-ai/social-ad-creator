// Requirement: In-memory debug event store for production diagnostics (alpha phase).
// Approach: Circular buffer with pub/sub, console interception, global error listeners,
//   report generation with URL redaction.
// Alternatives:
//   - Console-only: Rejected - logs lost on mobile, no structured capture.
//   - External service: Rejected - adds dependency, privacy concerns for local tool.

const MAX_ENTRIES = 200
let entries = []
let nextId = 1
const subscribers = new Set()

function notify(entry) {
  for (const fn of subscribers) {
    try { fn(entries, entry) } catch (_) { /* subscriber errors shouldn't break logging */ }
  }
}

export function debugLog(source, event, details = null, severity = 'info') {
  const entry = {
    id: nextId++,
    timestamp: Date.now(),
    source,
    severity,
    event,
    details,
  }
  entries.push(entry)
  if (entries.length > MAX_ENTRIES) {
    entries = entries.slice(-MAX_ENTRIES)
  }
  notify(entry)
}

export function getEntries() {
  return entries
}

export function clearEntries() {
  entries = []
  nextId = 1
  notify(null)
}

// New subscribers receive existing entries immediately on subscribe —
// eliminates timing bugs where a subscriber misses entries logged before it subscribed.
export function subscribe(fn) {
  subscribers.add(fn)
  if (entries.length > 0) {
    try { fn(entries, null) } catch (_) { /* ignore replay errors */ }
  }
  return () => subscribers.delete(fn)
}

// --- Report generation ---
// Lives in the module, not the pill component — reusable by any consumer.
// URL query params are redacted to prevent token/UTM leaking when users share reports.
function getEnvironmentForReport() {
  return {
    standalone: window.matchMedia('(display-mode: standalone)').matches
      || navigator.standalone === true,
    swSupport: 'serviceWorker' in navigator,
  }
}

export function debugGenerateReport() {
  const env = getEnvironmentForReport()
  // Redact query params to prevent token/UTM leaking
  const redactedUrl = window.location.origin + window.location.pathname
    + (window.location.search ? '?[redacted]' : '')
    + (window.location.hash ? '#[redacted]' : '')

  const logLines = entries.map(e => {
    const t = new Date(e.timestamp)
    const ts = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}.${String(t.getMilliseconds()).padStart(3, '0')}`
    const detail = e.details ? ` | ${JSON.stringify(e.details)}` : ''
    return `[${ts}] [${e.severity.toUpperCase()}] [${e.source}] ${e.event}${detail}`
  })

  const lines = [
    '=== CanvaGrid Debug Report ===',
    '',
    '--- Environment ---',
    `URL: ${redactedUrl}`,
    `User Agent: ${navigator.userAgent}`,
    `Screen: ${screen.width}x${screen.height}`,
    `Viewport: ${innerWidth}x${innerHeight}`,
    `Online: ${navigator.onLine}`,
    `Protocol: ${location.protocol}`,
    `Standalone: ${env.standalone}`,
    `SW Support: ${env.swSupport}`,
    `Timestamp: ${new Date().toISOString()}`,
    '',
    '--- Log ---',
    ...(logLines.length > 0 ? logLines : ['(empty)']),
  ]
  return lines.join('\n')
}

// --- Console interception ---
// Captures React warnings, library errors, and any other console output automatically.
// Runs at module load time to catch early console calls.
// HMR guard prevents double-patching during Vite hot reloads.
if (!window.__debugConsolePatched) {
  window.__debugConsolePatched = true
  const originalError = console.error
  const originalWarn = console.warn

  console.error = (...args) => {
    originalError.apply(console, args)
    debugLog('console', args.map(String).join(' '), null, 'error')
  }

  console.warn = (...args) => {
    originalWarn.apply(console, args)
    debugLog('console', args.map(String).join(' '), null, 'warn')
  }
}

// --- Global error capture ---
// Installed at module load time — captures crashes before React mounts.
// HMR guard prevents duplicate listeners during development.
if (!window.__debugLogListenersAttached) {
  window.__debugLogListenersAttached = true

  window.addEventListener('error', (e) => {
    debugLog('global', e.message || 'Unknown error', {
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    }, 'error')
  })

  window.addEventListener('unhandledrejection', (e) => {
    debugLog('global', `Unhandled rejection: ${e.reason}`, null, 'error')
  })
}
