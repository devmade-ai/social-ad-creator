// Requirement: Desktop layout with sidebar tabs + main canvas area.
// Approach: Extracted from App.jsx render branch to reduce file size.
//   Full sidebar with tab content, main area with platform selector, canvas, and export controls.
import ErrorBoundary from './ErrorBoundary'
import AdCanvas from './AdCanvas'
import PlatformPreview from './PlatformPreview'
import ExportButtons from './ExportButtons'
import ContextBar from './ContextBar'
import EmptyStateGuide from './EmptyStateGuide'
import QuickActionsBar from './QuickActionsBar'

export default function DesktopLayout({
  // Refs
  canvasRef,
  previewContainerRef,
  tabNavRef,
  // Fonts
  fontsToLoad,
  // Core state
  state,
  platform,
  previewScale,
  totalCells,
  safeSelectedCell,
  setSelectedCell,
  isCanvasEmpty,
  isExporting,
  cancelExportRef,
  setIsExporting,
  // Page state
  pages,
  pageCount,
  setActivePage,
  addPage,
  duplicatePage,
  removePage,
  movePage,
  getPageState,
  // Platform / export
  setPlatform,
  setExportFormat,
  // Undo/redo
  undo,
  redo,
  canUndo,
  canRedo,
  // Tabs
  sections,
  activeSection,
  setActiveSection,
  // Header actions
  setShowSaveLoadModal,
  setShowTutorial,
  setShowShortcuts,
  setShowInstallModal,
  setIsReaderMode,
  isDark,
  toggleDarkMode,
  canInstall,
  install,
  showManualInstructions,
  isInstalled,
  hasUpdate,
  update,
  isOnline,
  // Content
  tabContent,
  exportOverlay,
  modals,
  // Canvas overlay
  CanvasCellOverlay,
}) {
  return (
    <div className="min-h-screen" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {fontsToLoad.map((font) => <link key={font.id} rel="stylesheet" href={font.url} />)}

      {/* Header */}
      <header className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm border-b border-zinc-200/60 dark:border-zinc-700/60 px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-lg font-display font-bold text-ui-text tracking-tight">CanvaGrid</h1>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded">Research Preview</span>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-1.5">
            <button onClick={() => setIsReaderMode(true)} title="Reader mode" className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              <span className="hidden sm:inline">View</span>
            </button>
            <button onClick={() => setShowSaveLoadModal(true)} title="Save or load" className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              <span className="hidden sm:inline">Save</span>
            </button>
            <button onClick={() => setShowTutorial(true)} title="Help" className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="hidden sm:inline">Help</span>
            </button>
            <button onClick={() => setShowShortcuts(true)} title="Keyboard shortcuts" className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm4 2h2m2 0h2m2 0h2M5 14h14" /></svg>
            </button>
            <button onClick={toggleDarkMode} title={isDark ? 'Light mode' : 'Dark mode'} className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all">
              {isDark ? '☀️' : '🌙'}
            </button>
            <button onClick={() => window.location.reload()} title="Refresh" className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
            {canInstall && (
              <button onClick={install} title="Install app" className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-primary text-white hover:bg-primary-hover active:scale-95 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Install</span>
              </button>
            )}
            {!canInstall && showManualInstructions && !isInstalled && (
              <button onClick={() => setShowInstallModal(true)} title="Install" className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Install</span>
              </button>
            )}
            {hasUpdate && (
              <button onClick={update} title="Update available" className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span>Update</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {!isOnline && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-center text-sm text-amber-700 dark:text-amber-300">
          You're offline. Your work is saved locally, but sample images and fonts may not load.
        </div>
      )}

      {/* Tab nav bar — desktop only */}
      <nav ref={tabNavRef} className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm border-b border-zinc-200/60 dark:border-zinc-700/60 sticky top-0 z-10">
        <div className="flex items-center">
          <div className="flex overflow-x-auto scrollbar-thin">
            {sections.map((section) => (
              <button key={section.id} onClick={() => setActiveSection(section.id)} className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${activeSection === section.id ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10' : 'border-transparent text-ui-text-muted hover:text-ui-text hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-dark-subtle'}`}>
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <ContextBar
        layout={state.layout} cellImages={state.cellImages} selectedCell={safeSelectedCell} onSelectCell={setSelectedCell} platform={state.platform}
        undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
        pages={pages} activePage={state.activePage} onSetActivePage={setActivePage}
        onAddPage={addPage} onDuplicatePage={duplicatePage} onRemovePage={removePage} onMovePage={movePage} getPageState={getPageState}
      />

      {/* Desktop-only path: always >= 1024px, no responsive prefixes needed */}
      <div className="flex flex-row items-stretch">
        <aside className="w-96 p-5 pr-0 pb-5">
          <div className="bg-white dark:bg-dark-card rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-card p-5">
            {tabContent}
          </div>
        </aside>

        <main className="flex-1 p-5 space-y-4">
          <div className="bg-white dark:bg-dark-card rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-card p-5">
            <PlatformPreview selectedPlatform={state.platform} onPlatformChange={setPlatform} />
          </div>

          <div className="bg-white dark:bg-dark-card rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-card p-6">
            <div
              ref={previewContainerRef}
              className="relative bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-dark-subtle dark:to-dark-page rounded-xl overflow-hidden flex items-center justify-center border border-zinc-200/50 dark:border-zinc-700/50"
              style={{ minHeight: platform.height * previewScale + 40 }}
            >
              <ErrorBoundary title="Preview error" message="Failed to render the ad preview." className="w-full h-full min-h-[200px]">
                <div className="relative" style={{ width: platform.width * previewScale, height: platform.height * previewScale }}>
                  <AdCanvas ref={canvasRef} state={state} scale={previewScale} />
                  {totalCells > 1 && <CanvasCellOverlay layout={state.layout} selectedCell={safeSelectedCell} onSelectCell={setSelectedCell} />}
                </div>
              </ErrorBoundary>
              {exportOverlay}
            </div>

            {isCanvasEmpty && !isExporting && <EmptyStateGuide onNavigate={setActiveSection} />}
            {totalCells > 1 && <QuickActionsBar selectedCell={safeSelectedCell} onNavigate={setActiveSection} />}

            <div className="mt-5">
              <ErrorBoundary title="Export error" message="Failed to load export options.">
                <ExportButtons canvasRef={canvasRef} state={state} onPlatformChange={setPlatform} onExportFormatChange={setExportFormat} onExportingChange={setIsExporting} cancelExportRef={cancelExportRef} pageCount={pageCount} onSetActivePage={setActivePage} />
              </ErrorBoundary>
            </div>
          </div>
        </main>
      </div>

      {modals}
    </div>
  )
}
