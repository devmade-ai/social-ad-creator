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

function notify() {
  for (const fn of subscribers) {
    try { fn(entries) } catch { /* subscriber errors shouldn't break logging */ }
  }
}

export function debugLog(source, event, details = null, severity = 'info') {
  // Deduplicate consecutive identical messages — third-party scripts and React strict
  // mode can spam the same warning repeatedly, pushing real entries out of the buffer.
  // Collapsed entries get a count field and updated timestamp.
  // Creates a new object (not mutation) so React subscribers detect the change.
  const last = entries[entries.length - 1]
  if (last && last.source === source && last.event === event && last.severity === severity) {
    entries[entries.length - 1] = { ...last, count: (last.count || 1) + 1, timestamp: Date.now() }
    notify()
    return
  }

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
  notify()
}

// nextId intentionally NOT reset — IDs must be monotonically increasing for the
// lifetime of the page to guarantee unique React keys in the log list.
export function clearEntries() {
  entries = []
  notify()
}

// New subscribers receive existing entries immediately on subscribe —
// eliminates timing bugs where a subscriber misses entries logged before it subscribed.
export function subscribe(fn) {
  subscribers.add(fn)
  if (entries.length > 0) {
    try { fn(entries) } catch { /* ignore replay errors */ }
  }
  return () => subscribers.delete(fn)
}

// Shared timestamp formatter — used by both DebugPill Log tab and report generation.
export function formatTime(ts) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`
}

// --- Report generation ---
// Lives in the module, not the pill component — reusable by any consumer.
// URL query params are redacted to prevent token/UTM leaking when users share reports.

// JSON.stringify that can't throw — report generation must never crash.
function safeStringify(obj) {
  try { return JSON.stringify(obj) } catch { return '[unserializable]' }
}
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
    const detail = e.details ? ` | ${safeStringify(e.details)}` : ''
    const count = e.count > 1 ? ` (x${e.count})` : ''
    return `[${formatTime(e.timestamp)}] [${e.severity.toUpperCase()}] [${e.source}] ${e.event}${detail}${count}`
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
// Re-entrancy guard prevents infinite loops if debugLog itself triggers console.error.
//
// Handlers and original-fn refs are lifted to module scope so the HMR dispose
// hook below can restore originals and remove listeners when the module is
// replaced. Without dispose, the old module's patch closures stay alive across
// HMR cycles while the new module's guards short-circuit re-patching — which
// silently breaks console interception after the first hot reload.
let originalConsoleError = null
let originalConsoleWarn = null
let intercepting = false

function patchedConsoleError(...args) {
  originalConsoleError.apply(console, args)
  if (!intercepting) {
    intercepting = true
    // Capture stack trace from Error objects for easier debugging of minified crashes.
    const errObj = args.find(a => a instanceof Error)
    const details = errObj?.stack ? { stack: errObj.stack } : null
    try { debugLog('console', args.map(String).join(' '), details, 'error') } finally { intercepting = false }
  }
}

function patchedConsoleWarn(...args) {
  originalConsoleWarn.apply(console, args)
  if (!intercepting) {
    intercepting = true
    try { debugLog('console', args.map(String).join(' '), null, 'warn') } finally { intercepting = false }
  }
}

if (!window.__debugConsolePatched) {
  window.__debugConsolePatched = true
  originalConsoleError = console.error
  originalConsoleWarn = console.warn
  console.error = patchedConsoleError
  console.warn = patchedConsoleWarn
}

// --- Global error capture ---
// Installed at module load time — captures crashes before React mounts.
// HMR guard prevents duplicate listeners during development.
function globalErrorHandler(e) {
  debugLog('global', e.message || 'Unknown error', {
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    stack: e.error?.stack || null,
  }, 'error')
}

function globalRejectionHandler(e) {
  debugLog('global', `Unhandled rejection: ${e.reason}`, null, 'error')
}

if (!window.__debugLogListenersAttached) {
  window.__debugLogListenersAttached = true
  window.addEventListener('error', globalErrorHandler)
  window.addEventListener('unhandledrejection', globalRejectionHandler)
}

// --- HMR teardown (TIMER_LEAKS pattern variant 5) ---
// Vite fires dispose() BEFORE the new module loads, so the new module sees
// cleared window flags and re-installs patches with its own handler closures.
// In production builds, import.meta.hot is undefined and this block is stripped.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (originalConsoleError) {
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
    }
    window.removeEventListener('error', globalErrorHandler)
    window.removeEventListener('unhandledrejection', globalRejectionHandler)
    delete window.__debugConsolePatched
    delete window.__debugLogListenersAttached
  })
}

// --- Replay pre-React errors and deregister inline handlers ---
// The inline script in index.html captures errors into window.__debugErrors before
// this module loads. Replay them into the structured debug log so they appear in the pill,
// then remove the inline script's error/rejection listeners to prevent duplicate captures.
if (window.__debugErrors?.length > 0) {
  for (const err of window.__debugErrors) {
    debugLog('pre-react', err.msg, err.stack ? { stack: err.stack } : null, 'error')
  }
  window.__debugErrors = []
}
if (window.__debugPreErrorHandler) {
  window.removeEventListener('error', window.__debugPreErrorHandler)
  window.removeEventListener('unhandledrejection', window.__debugPreRejectionHandler)
  delete window.__debugPreErrorHandler
  delete window.__debugPreRejectionHandler
}
