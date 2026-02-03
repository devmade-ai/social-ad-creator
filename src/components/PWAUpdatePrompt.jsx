import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every hour
      r && setInterval(() => r.update(), 60 * 60 * 1000)
    },
  })

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-ui-text">Update Available</h3>
            <p className="text-xs text-ui-text-muted mt-0.5">A new version is ready to install.</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setNeedRefresh(false)}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-ui-text-muted bg-zinc-100 dark:bg-dark-subtle hover:bg-zinc-200 dark:hover:bg-dark-elevated rounded-lg transition-colors"
          >
            Later
          </button>
          <button
            onClick={() => updateServiceWorker(true)}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )
}
