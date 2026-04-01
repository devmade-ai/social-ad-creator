// Requirement: Full-screen reader mode for viewing multi-page documents.
// Approach: Extracted from App.jsx render branch to reduce file size.
// Props: all state/callbacks needed for reader UI (back button, page nav, dark mode toggle).
import ErrorBoundary from './ErrorBoundary'
import AdCanvas from './AdCanvas'

export default function ReaderMode({
  canvasRef,
  previewContainerRef,
  fontsToLoad,
  state,
  platform,
  previewScale,
  hasMultiplePages,
  pages,
  pageCount,
  setActivePage,
  setIsReaderMode,
  isDark,
  toggleDarkMode,
}) {
  return (
    <div className="h-[100dvh] flex flex-col bg-base-200">
      {fontsToLoad.map((font) => <link key={font.id} rel="stylesheet" href={font.url} />)}
      <header className="bg-base-100/80 backdrop-blur-sm border-b border-base-300/60 px-3 py-2 shrink-0" style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))' }}>
        <div className="flex items-center justify-between">
          <button onClick={() => setIsReaderMode(false)} aria-label="Back to Editor" className="px-2 py-1 sm:px-3 sm:py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-base-200 text-base-content hover:bg-base-300 active:scale-95 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="hidden sm:inline">Back to Editor</span>
          </button>
          {hasMultiplePages && <span className="text-sm font-medium text-base-content/70">{state.activePage + 1} / {pageCount}</span>}
          <button onClick={toggleDarkMode} title={isDark ? 'Light mode' : 'Dark mode'} className="px-2 py-1 sm:px-3 sm:py-1.5 text-sm rounded-lg font-medium bg-base-200 text-base-content hover:bg-base-300 active:scale-95 transition-all">
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-1 sm:px-4 sm:py-2 min-h-0">
        <div ref={previewContainerRef} className="w-full flex justify-center">
          <div style={{ width: platform.width * previewScale, height: platform.height * previewScale }}>
            <ErrorBoundary title="Preview error" message="Failed to render page.">
              <AdCanvas ref={canvasRef} state={state} scale={previewScale} />
            </ErrorBoundary>
          </div>
        </div>
        {hasMultiplePages && (
          <div className="flex items-center gap-3 mt-2 shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <button onClick={() => setActivePage(state.activePage - 1)} disabled={state.activePage === 0} className="px-3 py-2 sm:py-1.5 text-sm font-medium rounded-lg bg-base-100 border border-base-300 text-base-content hover:bg-base-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Prev</button>
            <div className="flex gap-1">
              {pages.map((_, index) => (
                <button key={index} onClick={() => setActivePage(index)} className={`w-8 h-8 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${index === state.activePage ? 'bg-primary text-primary-content scale-110' : 'bg-base-300 text-base-content/60 hover:bg-base-300/80'}`} title={`Page ${index + 1}`}>{index + 1}</button>
              ))}
            </div>
            <button onClick={() => setActivePage(state.activePage + 1)} disabled={state.activePage === pageCount - 1} className="px-3 py-2 sm:py-1.5 text-sm font-medium rounded-lg bg-base-100 border border-base-300 text-base-content hover:bg-base-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Next</button>
          </div>
        )}
      </main>
    </div>
  )
}
