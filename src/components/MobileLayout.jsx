// Requirement: Native app-like experience on mobile with bottom nav + bottom sheet.
// Approach: Extracted from App.jsx render branch to reduce file size.
//   Fixed viewport (100dvh), edge-to-edge canvas, bottom sheet for tab controls.
// Alternatives:
//   - Responsive sidebar: Rejected — scroll-heavy, canvas hidden by controls.
//   - Tab content above canvas: Rejected — canvas should be primary focus.
import { useCallback } from 'react'
import ErrorBoundary from './ErrorBoundary'
import AdCanvas from './AdCanvas'
import ContextBar from './ContextBar'
import ExportButtons from './ExportButtons'
import EmptyStateGuide from './EmptyStateGuide'
import BottomSheet from './BottomSheet'
import MobileNav from './MobileNav'
import BurgerMenu from './BurgerMenu'
import UndoRedoButtons from './UndoRedoButtons'
import { themeCombos } from '../config/daisyuiThemes'
import { ICON_HELP, ICON_INSTALL, ICON_UPDATE, ICON_REFRESH, ICON_READER, ICON_SAVE, ICON_KEYBOARD, ICON_SUN, ICON_MOON } from '../config/menuIcons'
import { version } from '../../package.json'

// Requirement: Dark mode toggle + combo theme picker inside burger menu.
// Approach: Rendered as BurgerMenu children (below action items, separated by <hr>).
//   Toggle button with sun/moon icon per BURGER_MENU pattern Theme UI spec.
//   Combo list shows 2 options with checkmark indicator. Menu stays open during switching.
// Alternatives:
//   - Independent per-mode theme list: Rejected — simplified to combos.
//   - Separate ThemeSelector in header: Rejected — clutters mobile header.
function MenuThemeSection({ isDark, toggleDarkMode, comboId, setCombo }) {
  return (
    <>
      <hr className="my-1 border-base-300" />
      {/* Dark/Light mode toggle — icon matches label (sun for "Light mode", moon for "Dark mode").
          aria-label updates with state per BURGER_MENU pattern. */}
      <button
        type="button"
        onClick={toggleDarkMode}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-base-content
                   hover:bg-base-200 transition-colors cursor-pointer min-h-11
                   outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      >
        <svg className="w-4 h-4 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isDark ? ICON_SUN : ICON_MOON} />
        </svg>
        {isDark ? 'Light mode' : 'Dark mode'}
      </button>
      <hr className="my-1 border-base-300" />
      {/* Combo section header */}
      <div className="px-4 pt-2 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
          Theme
        </span>
      </div>
      {/* Combo list — always visible */}
      <div>
        {themeCombos.map((combo) => (
          <button
            key={combo.id}
            type="button"
            onClick={() => setCombo(combo.id)}
            className={`w-full text-left px-4 py-2.5 text-sm
                       flex items-center gap-2 rounded-lg
                       transition-colors cursor-pointer min-h-11
                       outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset
                       ${comboId === combo.id ? 'bg-base-200' : 'hover:bg-base-200'}`}
          >
            <span className={`text-primary text-xs ${comboId === combo.id ? '' : 'invisible'}`} aria-hidden="true">&#10003;</span>
            <span>{combo.name}</span>
            <span className="ml-auto text-xs text-base-content/50">{combo.description}</span>
          </button>
        ))}
      </div>
    </>
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
  // Page state (selection only — management moved to Structure tab)
  pages,
  pageCount,
  hasMultiplePages,
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
  comboId,
  setCombo,
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
  // Stable callback for BurgerMenu onClose — prevents useEscapeKey from
  // re-attaching its listener every render while the menu is open.
  // setShowMobileMenu is a state setter (identity-stable from useState).
  const handleMenuClose = useCallback(() => setShowMobileMenu(false), [setShowMobileMenu])

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-base-200">
      {fontsToLoad.map((font) => <link key={font.id} rel="stylesheet" href={font.url} />)}

      {/* Mobile header — compact with app name + burger menu only.
          Backdrop is now owned by BurgerMenu (rendered inside its component).
          z-50 when menu open so the header stacking context layers above the
          backdrop (z-40 inside BurgerMenu) and MobileNav (z-40 at page level). */}
      <header className={`bg-base-100/90 backdrop-blur-sm border-b border-base-300/60 shrink-0 relative ${showMobileMenu ? 'z-50' : ''}`} style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            {/* Inline header icon — 2x3 grid pattern using currentColor.
                Derived from icon.svg but without the purple background/gradients
                so it adapts to any DaisyUI theme via text color inheritance. */}
            <svg className="w-6 h-6 text-base-content" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="2" y="2" width="9" height="5.5" rx="1" opacity="0.9"/>
              <rect x="13" y="2" width="9" height="5.5" rx="1" opacity="0.4"/>
              <rect x="2" y="9.25" width="9" height="5.5" rx="1" opacity="0.35"/>
              <rect x="13" y="9.25" width="9" height="5.5" rx="1" opacity="0.9"/>
              <rect x="2" y="16.5" width="9" height="5.5" rx="1" opacity="0.6"/>
              <rect x="13" y="16.5" width="9" height="5.5" rx="1" opacity="0.25"/>
            </svg>
            <h1 className="text-base font-display font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CanvaGrid</h1>
            <span className="px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide bg-base-200 text-warning rounded">Preview</span>
          </div>
          {/* Undo/Redo — moved to header for constant visibility */}
          <UndoRedoButtons undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} size="md" />
          <BurgerMenu
            open={showMobileMenu}
            onToggle={() => { const opening = !showMobileMenu; setShowMobileMenu(opening); if (opening) closeMobileSheet() }}
            onClose={handleMenuClose}
            version={version}
            items={[
              { label: 'Help & Tutorial', icon: ICON_HELP, action: () => setShowTutorial(true) },
              { label: 'Install App', icon: ICON_INSTALL, action: install, visible: canInstall, highlight: true },
              { label: 'Update Available', icon: ICON_UPDATE, action: update, visible: hasUpdate, highlight: true, highlightColor: 'text-success' },
              { label: 'Refresh', icon: ICON_REFRESH, action: () => window.location.reload(), separator: true },
              { label: 'Reader Mode', icon: ICON_READER, action: () => setIsReaderMode(true) },
              { label: 'Save / Load', icon: ICON_SAVE, action: () => setShowSaveLoadModal(true) },
              { label: 'Keyboard Shortcuts', icon: ICON_KEYBOARD, action: () => setShowShortcuts(true) },
            ]}
          >
            <MenuThemeSection isDark={isDark} toggleDarkMode={toggleDarkMode} comboId={comboId} setCombo={setCombo} />
          </BurgerMenu>
        </div>
      </header>

      {!isOnline && (
        <div className="bg-base-200 border-b border-base-300 px-3 py-1.5 text-center text-xs text-warning shrink-0">
          Offline — work saved locally
        </div>
      )}

      {/* Update banner — always visible so users can update even if menu is unreachable */}
      {hasUpdate && (
        <button onClick={update} className="w-full bg-base-200 border-b border-base-300 px-3 py-2 flex items-center justify-center gap-2 text-xs font-medium text-success shrink-0 active:bg-base-300 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Update available — tap to refresh
        </button>
      )}

      {/* Compact context bar — hidden when bottom sheet is open to maximize canvas space */}
      {!mobileSheetOpen && (
        <ErrorBoundary title="Selection bar error" message="Failed to render selection controls.">
          <ContextBar
            layout={state.layout} cellImages={state.cellImages} selectedCell={safeSelectedCell} onSelectCell={setSelectedCell} platform={state.platform}
            pages={pages} activePage={state.activePage} onSetActivePage={setActivePage} getPageState={getPageState}
          />
        </ErrorBoundary>
      )}

      {/* Canvas — fills remaining space, auto-scales to fit above bottom sheet */}
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
            <span className="text-base-content/50">
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
