// Requirement: Detect online/offline status so users know when features may not work.
// Approach: Track navigator.onLine and listen to online/offline events.
// Alternatives:
//   - Ping a server: Rejected — adds latency and server dependency for a client-side tool.
import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
