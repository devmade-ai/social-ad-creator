// Requirement: Desktop layout with sidebar tabs + main canvas area.
// Approach: Extracted from App.jsx render branch to reduce file size.
//   Full sidebar with tab content, main area with platform selector, canvas, and export controls.
import ErrorBoundary from './ErrorBoundary'
import AdCanvas from './AdCanvas'
import ThemeSelector from './ThemeSelector'
import PlatformPreview from './PlatformPreview'
import ExportButtons from './ExportButtons'
import ContextBar from './ContextBar'
import EmptyStateGuide from './EmptyStateGuide'
import QuickActionsBar from './QuickActionsBar'
import UndoRedoButtons from './UndoRedoButtons'
import { useToast } from './Toast'

// Requirement: Consistent header button styling across desktop layout.
// Approach: Extract repeated className pattern to a small component.
const HEADER_BTN = 'btn btn-ghost btn-sm gap-1.5'

function HeaderButton({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title} className={HEADER_BTN}>
      {children}
    </button>
  )
}

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
  // Page state (selection only — management is in LayoutTab via tabContent)
  pages,
  pageCount,
  setActivePage,
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
  canInstall,
  install,
  showManualInstructions,
  isInstalled,
  hasUpdate,
  update,
  checkForUpdate,
  checking,
  isOnline,
  // Content
  tabContent,
  exportOverlay,
  modals,
  // Canvas overlay
  CanvasCellOverlay,
}) {
  const { addToast } = useToast()

  // Toast says "Check complete" — if an update was found during the settle delay,
  // the update banner appears via normal hasUpdate re-render. Don't read hasUpdate
  // in this closure — it's a stale prop value captured at render time, not a live ref.
  const handleCheckForUpdate = async () => {
    const result = await checkForUpdate()
    if (result === 'done') {
      addToast('Check complete — you\'re on the latest version', { type: 'success' })
    } else if (result === 'error') {
      addToast('Could not check for updates', { type: 'warning' })
    } else if (result === 'no-sw') {
      addToast('Updates not available in this environment', { type: 'info' })
    }
  }

  return (
    <div className="min-h-screen" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* crossOrigin makes cssRules JS-readable — see CLAUDE.md "Font embedding for export". */}
      {fontsToLoad.map((font) => <link key={font.id} rel="stylesheet" href={font.url} crossOrigin="anonymous" />)}

      {/* Header */}
      <header className="bg-base-100/80 backdrop-blur-sm border-b border-base-300/60 px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-lg font-display font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CanvaGrid</h1>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-base-200 text-warning rounded">Research Preview</span>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-1.5 items-center">
            {/* Undo/Redo — moved to header for constant visibility */}
            <UndoRedoButtons undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} size="sm" />
            <div className="w-px h-5 bg-base-300" />
            <HeaderButton onClick={() => setIsReaderMode(true)} title="Reader mode">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              <span className="hidden sm:inline">View</span>
            </HeaderButton>
            <HeaderButton onClick={() => setShowSaveLoadModal(true)} title="Save or load">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              <span className="hidden sm:inline">Save</span>
            </HeaderButton>
            <HeaderButton onClick={() => setShowTutorial(true)} title="Help">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="hidden sm:inline">Help</span>
            </HeaderButton>
            <HeaderButton onClick={() => setShowShortcuts(true)} title="Keyboard shortcuts">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm4 2h2m2 0h2m2 0h2M5 14h14" /></svg>
            </HeaderButton>
            <ThemeSelector />
            <HeaderButton onClick={() => window.location.reload()} title="Refresh">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span className="hidden sm:inline">Refresh</span>
            </HeaderButton>
            {canInstall && (
              <button onClick={install} title="Install app" className="btn btn-primary btn-sm gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Install</span>
              </button>
            )}
            {!canInstall && showManualInstructions && !isInstalled && (
              <HeaderButton onClick={() => setShowInstallModal(true)} title="Install">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Install</span>
              </HeaderButton>
            )}
            {hasUpdate ? (
              <button onClick={update} title="Update available" className="btn btn-success btn-sm gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span>Update</span>
              </button>
            ) : (
              <button onClick={handleCheckForUpdate} disabled={checking} title={checking ? 'Checking...' : 'Check for updates'} className={HEADER_BTN}>
                <svg className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {!isOnline && (
        <div className="bg-base-200 border-b border-base-300 px-4 py-2 text-center text-sm text-warning">
          You're offline. Your work is saved locally, but sample images and fonts may not load.
        </div>
      )}

      {/* Tab nav bar — desktop only */}
      <nav ref={tabNavRef} className="bg-base-100/90 backdrop-blur-sm border-b border-base-300/60 sticky top-0 z-20">
        <div className="flex items-center">
          <div className="flex overflow-x-auto scrollbar-thin">
            {sections.map((section) => (
              <button key={section.id} onClick={() => setActiveSection(section.id)} className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${activeSection === section.id ? 'border-primary text-primary bg-base-200' : 'border-transparent text-base-content/70 hover:text-base-content hover:border-base-300 hover:bg-base-200'}`}>
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <ErrorBoundary title="Selection bar error" message="Failed to render selection controls.">
        <ContextBar
          layout={state.layout} cellImages={state.cellImages} selectedCell={safeSelectedCell} onSelectCell={setSelectedCell} platform={state.platform}
          pages={pages} activePage={state.activePage} onSetActivePage={setActivePage} getPageState={getPageState}
        />
      </ErrorBoundary>

      {/* Desktop-only path: always >= 1024px, no responsive prefixes needed */}
      <div className="flex flex-row items-stretch">
        <aside className="w-96 p-5 pr-0 pb-5">
          <div className="bg-base-100 rounded-xl border border-base-300/80 shadow-card p-5">
            {tabContent}
          </div>
        </aside>

        <main className="flex-1 p-5 space-y-4">
          <div className="bg-base-100 rounded-xl border border-base-300/80 shadow-card p-5">
            <PlatformPreview selectedPlatform={state.platform} onPlatformChange={setPlatform} />
          </div>

          <div className="bg-base-100 rounded-xl border border-base-300/80 shadow-card p-6">
            <div
              ref={previewContainerRef}
              className="relative bg-gradient-to-br from-base-200 to-base-100 rounded-xl overflow-hidden flex items-center justify-center border border-base-300/50"
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
