import { useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePWAUpdate() {
  // Requirement: Periodic SW update checks without leaking intervals
  // Approach: Store registration in ref, manage interval in useEffect with cleanup
  // Why: onRegistered fires per mount — setInterval inside it leaks on remount (Strict Mode, etc.)
  const registrationRef = useRef(null)
  const [registered, setRegistered] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        registrationRef.current = r
        setRegistered(true)
      }
    },
  })

  useEffect(() => {
    if (!registered || !registrationRef.current) return

    // Check for updates every hour
    const interval = setInterval(() => {
      registrationRef.current?.update()
    }, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [registered])

  const update = () => {
    updateServiceWorker(true)
  }

  return { hasUpdate: needRefresh, update }
}
