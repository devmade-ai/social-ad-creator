// Requirement: Native app-like experience on mobile with bottom nav + bottom sheet.
// Approach: Extracted from App.jsx render branch to reduce file size.
//   Fixed viewport (100dvh), edge-to-edge canvas, bottom sheet for tab controls.
// Alternatives:
//   - Responsive sidebar: Rejected — scroll-heavy, canvas hidden by controls.
//   - Tab content above canvas: Rejected — canvas should be primary focus.
import ErrorBoundary from './ErrorBoundary'
import AdCanvas from './AdCanvas'
import ContextBar from './ContextBar'
import ExportButtons from './ExportButtons'
import EmptyStateGuide from './EmptyStateGuide'
import BottomSheet from './BottomSheet'
import MobileNav from './MobileNav'

export default function MobileLayout({
  // Refs
  canvasRef,
  previewContainerRef,
  // Fonts
  fontsToLoad,
  // Core state
  state,
  platform,
  platformGroup,
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
  hasMultiplePages,
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
  // Mobile-specific state
  showMobileMenu,
  setShowMobileMenu,
  mobileSheetOpen,
  closeMobileSheet,
  sheetSnap,
  setSheetSnap,
  activeSection,
  handleMobileTabChange,
  // Touch handlers
  handleCanvasTouchStart,
  handleCanvasTouchEnd,
  // Header actions
  setShowSaveLoadModal,
  setShowTutorial,
  setShowShortcuts,
  setIsReaderMode,
  isDark,
  toggleDarkMode,
  canInstall,
  install,
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
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-zinc-100 dark:bg-dark-page">
      {fontsToLoad.map((font) => <link key={font.id} rel="stylesheet" href={font.url} />)}

      {/* Mobile header — compact with overflow menu */}
      {/* z-[60] when menu open to layer above BottomSheet (z-40) and MobileNav (z-50) */}
      <header className={`bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm border-b border-zinc-200/60 dark:border-zinc-700/60 shrink-0 relative ${showMobileMenu ? 'z-[60]' : ''}`} style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-display font-bold text-ui-text tracking-tight">CanvaGrid</h1>
            <span className="px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded">Preview</span>
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setShowSaveLoadModal(true)} title="Save" aria-label="Save" className="p-2 rounded-lg text-ui-text hover:bg-zinc-100 dark:hover:bg-dark-subtle transition-colors">
              <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            </button>
            <button onClick={toggleDarkMode} title={isDark ? 'Light mode' : 'Dark mode'} aria-label={isDark ? 'Light mode' : 'Dark mode'} className="p-2 rounded-lg text-ui-text hover:bg-zinc-100 dark:hover:bg-dark-subtle transition-colors">
              <span className="text-sm" aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); const opening = !showMobileMenu; setShowMobileMenu(opening); if (opening) closeMobileSheet() }} title="More options" aria-label="More options" aria-expanded={showMobileMenu} className="p-2 rounded-lg text-ui-text hover:bg-zinc-100 dark:hover:bg-dark-subtle transition-colors">
              <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>
          </div>
        </div>
        {/* Overflow menu */}
        {showMobileMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)} role="presentation" />
            <div className="absolute right-3 top-full mt-1 z-50 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-ui-border py-1 min-w-[180px]" role="menu">
              {[
                { label: 'Reader Mode', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z', onClick: () => setIsReaderMode(true) },
                { label: 'Help & Tutorial', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', onClick: () => setShowTutorial(true) },
                { label: 'Keyboard Shortcuts', icon: 'M3 8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm4 2h2m2 0h2m2 0h2M5 14h14', onClick: () => setShowShortcuts(true) },
                { label: 'Refresh', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', onClick: () => window.location.reload() },
              ].map((item) => (
                <button key={item.label} role="menuitem" onClick={() => { item.onClick(); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ui-text hover:bg-ui-surface-hover transition-colors">
                  <svg className="w-4 h-4 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                  {item.label}
                </button>
              ))}
              {canInstall && (
                <button role="menuitem" onClick={() => { install(); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-primary/5 transition-colors">
                  <svg className="w-4 h-4 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Install App
                </button>
              )}
              {hasUpdate && (
                <button role="menuitem" onClick={() => { update(); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                  <svg className="w-4 h-4 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Update Available
                </button>
              )}
            </div>
          </>
        )}
      </header>

      {!isOnline && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-3 py-1.5 text-center text-xs text-amber-700 dark:text-amber-300 shrink-0">
          Offline — work saved locally
        </div>
      )}

      {/* Update banner — always visible so users can update even if menu is unreachable */}
      {hasUpdate && (
        <button onClick={update} className="w-full bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800 px-3 py-2 flex items-center justify-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 shrink-0 active:bg-emerald-100 dark:active:bg-emerald-900/50 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Update available — tap to refresh
        </button>
      )}

      {/* Compact context bar — hidden when bottom sheet is open to maximize canvas space */}
      {!mobileSheetOpen && (
        <ContextBar
          layout={state.layout} cellImages={state.cellImages} selectedCell={safeSelectedCell} onSelectCell={setSelectedCell} platform={state.platform}
          undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
          pages={pages} activePage={state.activePage} onSetActivePage={setActivePage}
          onAddPage={addPage} onDuplicatePage={duplicatePage} onRemovePage={removePage} onMovePage={movePage} getPageState={getPageState}
        />
      )}

      {/* Canvas — fills remaining space, edge-to-edge */}
      <main
        ref={previewContainerRef}
        className="flex-1 min-h-0 flex items-start justify-center relative bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-dark-subtle dark:to-dark-page"
        onTouchStart={hasMultiplePages ? handleCanvasTouchStart : undefined}
        onTouchEnd={hasMultiplePages ? handleCanvasTouchEnd : undefined}
      >
        <ErrorBoundary title="Preview error" message="Failed to render preview." className="w-full h-full min-h-[200px]">
          <div className="relative" style={{ width: platform.width * previewScale, height: platform.height * previewScale }}>
            <AdCanvas ref={canvasRef} state={state} scale={previewScale} />
            {totalCells > 1 && <CanvasCellOverlay layout={state.layout} selectedCell={safeSelectedCell} onSelectCell={setSelectedCell} />}
          </div>
        </ErrorBoundary>
        {exportOverlay}
      </main>

      {/* Platform info strip + empty state — hidden when bottom sheet is open to maximize canvas space */}
      {!mobileSheetOpen && (
        <div className="shrink-0 bg-white/90 dark:bg-dark-card/90 border-t border-zinc-200/30 dark:border-zinc-700/30">
          <button
            onClick={() => handleMobileTabChange('export')}
            className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-ui-surface-hover transition-colors"
          >
            <span className="font-medium text-ui-text-muted">
              {platformGroup?.name || 'Platform'} — {platform.name}
            </span>
            <span className="text-ui-text-faint">
              {platform.width} × {platform.height}
            </span>
          </button>
          {isCanvasEmpty && !isExporting && (
            <EmptyStateGuide onNavigate={(tab) => handleMobileTabChange(tab)} />
          )}
        </div>
      )}

      {/* Bottom sheet — tab content slides up from bottom */}
      <BottomSheet isOpen={mobileSheetOpen} onClose={closeMobileSheet} snapPoint={sheetSnap} onSnapChange={setSheetSnap}>
        {activeSection === 'export' ? (
          <ExportButtons
            canvasRef={canvasRef} state={state} onPlatformChange={setPlatform} onExportFormatChange={setExportFormat}
            onExportingChange={setIsExporting} cancelExportRef={cancelExportRef} pageCount={pageCount} onSetActivePage={setActivePage}
          />
        ) : tabContent}
      </BottomSheet>

      {/* Bottom navigation */}
      <MobileNav activeTab={activeSection} sheetOpen={mobileSheetOpen} onTabChange={handleMobileTabChange} />

      {modals}
    </div>
  )
}
