/* eslint-disable react-refresh/only-export-components -- ToastProvider + useToast hook co-located by design */
// Requirement: Non-blocking feedback notifications for user actions (save, export, errors).
// Approach: DaisyUI toast (positioning container) + alert (styled notification) components
//   replace hand-rolled fixed-position container and custom severity styling.
//   Keeps auto-dismiss timer, exit animation, and context-based access.
// Alternatives:
//   - Hand-rolled fixed container + custom severity colors: Replaced — DaisyUI toast
//     handles positioning/stacking; alert provides theme-aware severity colors.
//   - Browser alert(): Rejected — blocks UI, not accessible, jarring.
//   - Third-party library (react-hot-toast): Rejected — adds dependency for simple feature.

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const ToastContext = createContext(null)

// Wraps at Number.MAX_SAFE_INTEGER to prevent overflow in long sessions
let toastId = 0
const nextToastId = () => { toastId = (toastId + 1) % Number.MAX_SAFE_INTEGER; return toastId }

// Requirement: Global toast access from any component without prop drilling.
// Approach: Context provider + useToast hook. Provider manages toast queue.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, { type = 'info', duration = 3000 } = {}) => {
    const id = nextToastId()
    setToasts((prev) => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// DaisyUI alert severity class mapping
const ALERT_CLASSES = {
  success: 'alert-success',
  error: 'alert-error',
  info: 'alert-info',
  warning: 'alert-warning',
}

const icons = {
  success: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

// Individual toast with auto-dismiss and exit animation
function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (toast.duration <= 0) return
    const timer = setTimeout(() => {
      setIsExiting(true)
    }, toast.duration)
    return () => clearTimeout(timer)
  }, [toast.duration])

  useEffect(() => {
    if (!isExiting) return
    const timer = setTimeout(() => onRemove(toast.id), 200)
    return () => clearTimeout(timer)
  }, [isExiting, toast.id, onRemove])

  return (
    <div
      className={`alert ${ALERT_CLASSES[toast.type] || ALERT_CLASSES.info} text-sm py-2 shadow-lg transition-all duration-200 ${
        isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      {icons[toast.type]}
      <span>{toast.message}</span>
      <button
        onClick={() => setIsExiting(true)}
        className="btn btn-ghost btn-xs btn-circle"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// Requirement: Toast must clear iOS safe area (home indicator).
// Approach: DaisyUI toast container with toast-center + toast-bottom positioning,
//   plus env(safe-area-inset-bottom) for notched device clearance.
// Alternatives:
//   - Fixed bottom-4 only: Rejected — toast hidden behind home indicator on notched iPhones.
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null

  return (
    <div
      className="toast toast-center toast-bottom z-[70] max-w-sm w-full px-4"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
