import { useState, useEffect } from 'react'

let deferredPrompt = null

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      deferredPrompt = e
      setCanInstall(true)
    }

    const installedHandler = () => {
      setCanInstall(false)
      deferredPrompt = null
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setCanInstall(false)
      deferredPrompt = null
      return true
    }
    return false
  }

  return { canInstall, install }
}
