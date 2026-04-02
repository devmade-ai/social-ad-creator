// Requirement: Full-screen reader mode for viewing multi-page documents.
// Approach: Extracted from App.jsx render branch to reduce file size.
// Props: all state/callbacks needed for reader UI (back button, page nav, dark mode toggle).
import ErrorBoundary from './ErrorBoundary'
import AdCanvas from './AdCanvas'
import ThemeSelector from './ThemeSelector'

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
  lightTheme,
  darkTheme,
  setLightTheme,
  setDarkTheme,
}) {
  return (
    <div className="h-[100dvh] flex flex-col bg-base-200">
      {fontsToLoad.map((font) => <link key={font.id} rel="stylesheet" href={font.url} />)}
      <header className="bg-base-100/80 backdrop-blur-sm border-b border-base-300/60 px-3 py-2 shrink-0" style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))' }}>
        <div className="flex items-center justify-between">
          <button onClick={() => setIsReaderMode(false)} aria-label="Back to Editor" className="btn btn-ghost btn-sm gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="hidden sm:inline">Back to Editor</span>
          </button>
          {hasMultiplePages && <span className="text-sm font-medium text-base-content/70">{state.activePage + 1} / {pageCount}</span>}
          <ThemeSelector isDark={isDark} toggleDarkMode={toggleDarkMode} lightTheme={lightTheme} darkTheme={darkTheme} setLightTheme={setLightTheme} setDarkTheme={setDarkTheme} />
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
            <button onClick={() => setActivePage(state.activePage - 1)} disabled={state.activePage === 0} className="btn btn-outline btn-sm">Prev</button>
            <div className="flex gap-1">
              {pages.map((_, index) => (
                <button key={index} onClick={() => setActivePage(index)} className={`btn btn-circle btn-xs ${index === state.activePage ? 'btn-primary' : 'btn-ghost'}`} title={`Page ${index + 1}`}>{index + 1}</button>
              ))}
            </div>
            <button onClick={() => setActivePage(state.activePage + 1)} disabled={state.activePage === pageCount - 1} className="btn btn-outline btn-sm">Next</button>
          </div>
        )}
      </main>
    </div>
  )
}
