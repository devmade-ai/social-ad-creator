// Requirement: In-memory debug event store for production diagnostics.
// Approach: Circular buffer with pub/sub, global error listeners.
// Alternatives:
//   - Console-only: Rejected - logs lost on mobile, no structured capture.
//   - External service: Rejected - adds dependency, privacy concerns for local tool.

const MAX_ENTRIES = 200
let entries = []
let nextId = 1
const subscribers = new Set()

function notify() {
  for (const fn of subscribers) {
    try { fn(entries) } catch (_) { /* subscriber errors shouldn't break logging */ }
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
  notify()
}

export function getEntries() {
  return entries
}

export function clearEntries() {
  entries = []
  nextId = 1
  notify()
}

export function subscribe(fn) {
  subscribers.add(fn)
  return () => subscribers.delete(fn)
}

// Capture global errors at load time
window.addEventListener('error', (e) => {
  debugLog('window', 'error', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
  }, 'error')
})

window.addEventListener('unhandledrejection', (e) => {
  debugLog('window', 'unhandledrejection', {
    reason: String(e.reason),
  }, 'error')
})
