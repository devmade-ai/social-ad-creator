// Requirement: Native app-like experience on mobile with bottom nav + bottom sheet.
// Approach: Extracted from App.jsx render branch to reduce file size.
//   Fixed viewport (100dvh), edge-to-edge canvas, bottom sheet for tab controls.
// Alternatives:
//   - Responsive sidebar: Rejected — scroll-heavy, canvas hidden by controls.
//   - Tab content above canvas: Rejected — canvas should be primary focus.
import { useState } from 'react'
import ErrorBoundary from './ErrorBoundary'
import AdCanvas from './AdCanvas'
import ContextBar from './ContextBar'
import ExportButtons from './ExportButtons'
import EmptyStateGuide from './EmptyStateGuide'
import BottomSheet from './BottomSheet'
import MobileNav from './MobileNav'
import BurgerMenu from './BurgerMenu'
import { lightThemes, darkThemes } from '../config/daisyuiThemes'

// Requirement: Visual toggle indicator for dark mode item in burger menu.
// Pure presentational — the actual toggle logic is on the menu item action.
function ToggleSwitch({ checked }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-base-300'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-base-100 shadow-sm transition-transform mt-0.5 ${checked ? 'translate-x-4.5 ml-0' : 'translate-x-0.5'}`} />
    </span>
  )
}

// Requirement: Dark mode toggle + theme picker grouped together in burger menu.
// Approach: Toggle row + expandable theme list as a single section.
// Replaces the standalone ThemeSelector component in the header.
function MenuThemePicker({ isDark, toggleDarkMode, lightTheme, darkTheme, setLightTheme, setDarkTheme }) {
  const [expanded, setExpanded] = useState(false)
  const themes = isDark ? darkThemes : lightThemes
  const currentTheme = isDark ? darkTheme : lightTheme
  const setTheme = isDark ? setDarkTheme : setLightTheme
  const currentEntry = themes.find(t => t.id === currentTheme)

  return (
    <div className="border-t border-base-200">
      {/* Dark/Light mode toggle */}
      <button
        type="button"
        onClick={toggleDarkMode}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-base-content hover:bg-base-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      >
        <svg className="w-4 h-4 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isDark ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' : 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'} />
        </svg>
        <span className="flex-1 text-left">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        <ToggleSwitch checked={isDark} />
      </button>
      {/* Theme picker — expandable list for active mode */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-base-content hover:bg-base-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      >
        <svg className="w-4 h-4 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <span className="flex-1 text-left">Theme: {currentEntry?.name || currentTheme}</span>
        <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="max-h-48 overflow-y-auto overscroll-contain border-t border-base-200">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setTheme(theme.id)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                currentTheme === theme.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-base-content hover:bg-base-200'
              }`}
            >
              <div className="pl-7">
                <span>{theme.name}</span>
                <span className="text-xs text-base-content/50 ml-2">{theme.description}</span>
              </div>
              {currentTheme === theme.id && (
                <svg className="w-3.5 h-3.5 shrink-0 text-primary" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

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
  lightTheme,
  darkTheme,
  setLightTheme,
  setDarkTheme,
  canInstall,
  install,
  hasUpdate,
  update,
  isOnline,
  // Content
  tabContent,
  exportOverlay,
  modals,
  // Canvas overlay + context menu
  CanvasCellOverlay,
  CellContextMenu,
  cellContextMenu,
  setCellContextMenu,
  handleCellLongPress,
  handleCellContextAction,
}) {
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-base-200">
      {fontsToLoad.map((font) => <link key={font.id} rel="stylesheet" href={font.url} />)}

      {/* Mobile header — compact with app name + burger menu only.
          Requirement: Move Save + ThemeSelector into burger menu for cleaner header.
          Ref: glow-props Suggested Implementations → Standard Menu Items. */}
      {/* z-50 when menu open to layer above BottomSheet (z-30) and MobileNav (z-40) */}
      <header className={`bg-base-100/90 backdrop-blur-sm border-b border-base-300/60 shrink-0 relative ${showMobileMenu ? 'z-50' : ''}`} style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-display font-bold text-base-content tracking-tight">CanvaGrid</h1>
            <span className="px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide bg-warning/10 text-warning rounded">Preview</span>
          </div>
          <BurgerMenu
            open={showMobileMenu}
            onToggle={() => { const opening = !showMobileMenu; setShowMobileMenu(opening); if (opening) closeMobileSheet() }}
            onClose={() => setShowMobileMenu(false)}
            items={[
              { label: 'Save / Load', icon: 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4', action: () => setShowSaveLoadModal(true) },
              { label: 'Reader Mode', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z', action: () => setIsReaderMode(true) },
              { label: 'Help & Tutorial', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', action: () => setShowTutorial(true) },
              { label: 'Keyboard Shortcuts', icon: 'M3 8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm4 2h2m2 0h2m2 0h2M5 14h14', action: () => setShowShortcuts(true) },
              { label: 'Refresh', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', action: () => window.location.reload() },
              { label: 'Install App', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4', action: install, visible: canInstall, highlight: true },
              { label: 'Update Available', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', action: update, visible: hasUpdate, highlight: true, highlightColor: 'text-success' },
            ]}
          >
            <MenuThemePicker isDark={isDark} toggleDarkMode={toggleDarkMode} lightTheme={lightTheme} darkTheme={darkTheme} setLightTheme={setLightTheme} setDarkTheme={setDarkTheme} />
          </BurgerMenu>
        </div>
      </header>

      {!isOnline && (
        <div className="bg-warning/10 border-b border-warning/30 px-3 py-1.5 text-center text-xs text-warning shrink-0">
          Offline — work saved locally
        </div>
      )}

      {/* Update banner — always visible so users can update even if menu is unreachable */}
      {hasUpdate && (
        <button onClick={update} className="w-full bg-success/10 border-b border-success/30 px-3 py-2 flex items-center justify-center gap-2 text-xs font-medium text-success shrink-0 active:bg-success/20 transition-colors">
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
        className="flex-1 min-h-0 flex items-start justify-center relative bg-gradient-to-br from-base-200 to-base-100"
        onTouchStart={hasMultiplePages ? handleCanvasTouchStart : undefined}
        onTouchEnd={hasMultiplePages ? handleCanvasTouchEnd : undefined}
      >
        <ErrorBoundary title="Preview error" message="Failed to render preview." className="w-full h-full min-h-[200px]">
          <div className="relative" style={{ width: platform.width * previewScale, height: platform.height * previewScale }}>
            <AdCanvas ref={canvasRef} state={state} scale={previewScale} />
            {totalCells > 1 && <CanvasCellOverlay layout={state.layout} selectedCell={safeSelectedCell} onSelectCell={setSelectedCell} onLongPress={handleCellLongPress} />}
            {cellContextMenu && (
              <CellContextMenu
                position={cellContextMenu.position}
                onAction={handleCellContextAction}
                onClose={() => setCellContextMenu(null)}
              />
            )}
          </div>
        </ErrorBoundary>
        {exportOverlay}
      </main>

      {/* Platform info strip + empty state — hidden when bottom sheet is open to maximize canvas space */}
      {!mobileSheetOpen && (
        <div className="shrink-0 bg-base-100/90 border-t border-base-300/30">
          <button
            onClick={() => handleMobileTabChange('export')}
            className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-base-300 transition-colors"
          >
            <span className="font-medium text-base-content/70">
              {platformGroup?.name || 'Platform'} — {platform.name}
            </span>
            <span className="text-base-content/40">
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
