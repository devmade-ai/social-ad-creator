// Requirement: Mobile-first design tool with bottom sheet + bottom nav on mobile,
//   sidebar + top tabs on desktop. All state via useAdState hook.
// Approach: useIsMobile hook for conditional layout rendering.
//   Mobile: fixed viewport, edge-to-edge canvas, bottom sheet for controls, bottom nav.
//   Desktop: scrollable page, sidebar + main split, sticky top tab bar.
//   Reader mode is shared (full-screen overlay with keyboard navigation).
// Alternatives:
//   - CSS-only responsive with one layout: Rejected — fundamentally different component trees needed.
//   - React Router per tab: Rejected — tabs are panels, not routes.
import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { useAdState } from './hooks/useAdState'
import { useDarkMode } from './hooks/useDarkMode'
import { usePWAInstall } from './hooks/usePWAInstall'
import { usePWAUpdate } from './hooks/usePWAUpdate'
import { useIsMobile } from './hooks/useIsMobile'
import AdCanvas from './components/AdCanvas'
import TemplatesTab from './components/TemplatesTab'
import MediaTab from './components/MediaTab'
import ContentTab from './components/ContentTab'
import LayoutTab from './components/LayoutTab'
import StyleTab from './components/StyleTab'
import PlatformPreview from './components/PlatformPreview'
import ExportButtons from './components/ExportButtons'
import ErrorBoundary from './components/ErrorBoundary'
import InstallInstructionsModal from './components/InstallInstructionsModal'
import TutorialModal from './components/TutorialModal'
import SaveLoadModal from './components/SaveLoadModal'
import ContextBar from './components/ContextBar'
import { ToastProvider } from './components/Toast'
import KeyboardShortcutsOverlay from './components/KeyboardShortcutsOverlay'
import EmptyStateGuide from './components/EmptyStateGuide'
import QuickActionsBar from './components/QuickActionsBar'
import BottomSheet, { SNAP_HALF } from './components/BottomSheet'
import MobileNav from './components/MobileNav'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { platforms, findPlatformGroup } from './config/platforms'
import { fonts } from './config/fonts'

// Transparent overlay on canvas for click-to-select cell
function CanvasCellOverlay({ layout, selectedCell, onSelectCell }) {
  const { type, structure } = layout
  const isFullbleed = type === 'fullbleed'
  const isRows = type === 'rows'

  const normalizedStructure =
    isFullbleed || !structure || structure.length === 0
      ? [{ size: 100, subdivisions: 1, subSizes: [100] }]
      : structure

  let cellIndex = 0

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: isRows || isFullbleed ? 'column' : 'row',
        zIndex: 5,
      }}
    >
      {normalizedStructure.map((section, sectionIndex) => {
        const sectionSize = section.size || 100 / normalizedStructure.length
        const subdivisions = section.subdivisions || 1
        const subSizes = section.subSizes || Array(subdivisions).fill(100 / subdivisions)

        const sectionCells = []
        for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
          const currentCellIndex = cellIndex
          const isSelected = selectedCell === currentCellIndex
          cellIndex++

          sectionCells.push(
            <div
              key={`overlay-cell-${currentCellIndex}`}
              role="button"
              tabIndex={0}
              aria-label={`Select cell ${currentCellIndex + 1}`}
              onClick={() => onSelectCell(currentCellIndex)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectCell(currentCellIndex) } }}
              style={{
                flex: `1 1 ${subSizes[subIndex]}%`,
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
              className={`hover:outline hover:outline-2 hover:-outline-offset-2 hover:outline-primary/30 active:bg-primary/5 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary/50 ${isSelected ? 'cell-select-flash' : ''}`}
              title={`Cell ${currentCellIndex + 1}`}
            />
          )
        }

        return (
          <div
            key={`overlay-section-${sectionIndex}`}
            style={{
              flex: `1 1 ${sectionSize}%`,
              display: 'flex',
              flexDirection: isRows || isFullbleed ? 'row' : 'column',
            }}
          >
            {sectionCells}
          </div>
        )
      })}
    </div>
  )
}

function App() {
  const canvasRef = useRef(null)
  const previewContainerRef = useRef(null)
  const tabNavRef = useRef(null)
  const [activeSection, setActiveSection] = useState('templates')

  const [containerWidth, setContainerWidth] = useState(600)
  const [containerHeight, setContainerHeight] = useState(400)
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)
  const [isExporting, setIsExporting] = useState(false)
  const cancelExportRef = useRef(false)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false)
  const [isReaderMode, setIsReaderMode] = useState(false)
  const [selectedCell, setSelectedCell] = useState(0)
  const { isDark, toggle: toggleDarkMode } = useDarkMode()
  const { canInstall, install, showManualInstructions, getInstallInstructions, isInstalled } = usePWAInstall()
  const { hasUpdate, update } = usePWAUpdate()
  const isOnline = useOnlineStatus()
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Mobile-specific state
  const isMobile = useIsMobile()
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [sheetHeight, setSheetHeight] = useState(0)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const swipeRef = useRef({ x: 0, y: 0 })

  const {
    state,
    addImage, removeImage, updateImage, updateImageFilters, updateImagePosition, updateImageOverlay, setCellImage,
    setLogo, setLogoPosition, setLogoSize,
    setText, setLayout, setTheme, setThemePreset, setFonts,
    setPadding, setFrame, setOuterFrame, setCellFrame,
    setPlatform, setExportFormat,
    applyStylePreset, applyLayoutPreset,
    undo, redo, canUndo, canRedo,
    saveDesign, loadDesign, getSavedDesigns, deleteDesign,
    setActivePage, addPage, duplicatePage, removePage, movePage, getPageCount, getPageState,
    setTextMode, addFreeformBlock, updateFreeformBlock, removeFreeformBlock, moveFreeformBlock,
  } = useAdState()

  const totalCells = useMemo(() => {
    const structure = state.layout.structure || [{ size: 100, subdivisions: 1, subSizes: [100] }]
    return structure.reduce((total, section) => total + (section.subdivisions || 1), 0)
  }, [state.layout.structure])

  const safeSelectedCell = selectedCell >= totalCells ? 0 : selectedCell

  useEffect(() => {
    if (selectedCell >= totalCells) setSelectedCell(0)
  }, [totalCells, selectedCell])

  const platform = platforms.find((p) => p.id === state.platform) || platforms[0]
  const platformGroup = findPlatformGroup(state.platform)
  const pages = state.pages || [null]
  const pageCount = pages.length
  const hasMultiplePages = pageCount > 1

  // Mobile helpers
  const closeMobileSheet = useCallback(() => {
    setMobileSheetOpen(false)
    setSheetHeight(0)
  }, [])

  const handleMobileTabChange = useCallback((tabId) => {
    if (tabId === activeSection && mobileSheetOpen) {
      closeMobileSheet()
    } else {
      setActiveSection(tabId)
      setMobileSheetOpen(true)
      if (sheetHeight < 20) setSheetHeight(SNAP_HALF)
    }
  }, [activeSection, mobileSheetOpen, sheetHeight, closeMobileSheet])

  // Swipe between pages on mobile canvas
  const SWIPE_THRESHOLD = 50
  const handleCanvasTouchStart = useCallback((e) => {
    swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const handleCanvasTouchEnd = useCallback((e) => {
    const dx = e.changedTouches[0].clientX - swipeRef.current.x
    const dy = e.changedTouches[0].clientY - swipeRef.current.y
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0 && state.activePage > 0) setActivePage(state.activePage - 1)
      else if (dx < 0 && state.activePage < pageCount - 1) setActivePage(state.activePage + 1)
    }
  }, [state.activePage, pageCount, setActivePage])

  // Keyboard shortcuts
  const keyboardRef = useRef({ undo, redo, isReaderMode, activePage: state.activePage, pageCount, setActivePage, showShortcuts, setShowShortcuts, setActiveSection, setIsReaderMode, isMobile, setMobileSheetOpen })
  keyboardRef.current = { undo, redo, isReaderMode, activePage: state.activePage, pageCount, setActivePage, showShortcuts, setShowShortcuts, setActiveSection, setIsReaderMode, isMobile, setMobileSheetOpen }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      const { undo, redo, isReaderMode, activePage, pageCount, setActivePage, showShortcuts, setShowShortcuts, setActiveSection, setIsReaderMode, isMobile, setMobileSheetOpen } = keyboardRef.current

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) { e.preventDefault(); redo() }
        else { e.preventDefault(); undo() }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo() }

      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const tabMap = { '1': 'templates', '2': 'media', '3': 'content', '4': 'layout', '5': 'style' }
        if (tabMap[e.key]) {
          setActiveSection(tabMap[e.key])
          if (isMobile) setMobileSheetOpen(true)
        }
      }

      if (e.key === 'Escape' && showShortcuts) { e.preventDefault(); setShowShortcuts(false); return }

      if (isReaderMode) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); if (activePage > 0) setActivePage(activePage - 1) }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); if (activePage < pageCount - 1) setActivePage(activePage + 1) }
        if (e.key === 'Escape') { e.preventDefault(); setIsReaderMode(false) }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Tab nav height measurement (desktop only)
  useEffect(() => {
    if (isMobile) return
    const nav = tabNavRef.current
    if (!nav) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.target.offsetHeight
        document.documentElement.style.setProperty('--tab-nav-height', `${height}px`)
      }
    })
    observer.observe(nav)
    return () => observer.disconnect()
  }, [isMobile])

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight)
    const handleOrientation = () => setTimeout(handleResize, 100)
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientation)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientation)
    }
  }, [])

  // Track container dimensions for responsive preview
  useEffect(() => {
    const container = previewContainerRef.current
    if (!container) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width
        const height = entry.contentBoxSize?.[0]?.blockSize ?? entry.contentRect.height
        setContainerWidth(width)
        setContainerHeight(height)
      }
    })
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [isReaderMode, isMobile])

  // Calculate scale to auto-fit preview in container
  const previewScale = useMemo(() => {
    if (isReaderMode) {
      const maxWidth = Math.max(containerWidth - 16, 200)
      const maxHeight = windowHeight - (hasMultiplePages ? 100 : 64)
      if (!platform.width || !platform.height) return 1
      return Math.min(maxWidth / platform.width, maxHeight / platform.height, 1)
    }
    // Mobile: use container dimensions (flex-1 fills available space)
    // Desktop: use container width + 70% viewport height
    const maxWidth = isMobile
      ? Math.max(containerWidth - 8, 200)
      : Math.max(containerWidth - 32, 200)
    const maxHeight = isMobile
      ? Math.max(containerHeight - 8, 200)
      : windowHeight * 0.7
    if (!platform.width || !platform.height) return 1
    return Math.min(maxWidth / platform.width, maxHeight / platform.height, 1)
  }, [platform, containerWidth, containerHeight, isMobile, isReaderMode, windowHeight, hasMultiplePages])

  const isCanvasEmpty = useMemo(() => {
    const hasImages = state.images && state.images.length > 0
    const hasText = state.text && Object.values(state.text).some((cellText) =>
      Object.values(cellText).some((el) => el?.content && el.content.trim() !== '')
    )
    const hasFreeform = state.freeformText && Object.values(state.freeformText).some((blocks) =>
      Array.isArray(blocks) && blocks.some((b) => b?.content && b.content.trim() !== '')
    )
    return !hasImages && !hasText && !hasFreeform
  }, [state.images, state.text, state.freeformText])

  useEffect(() => {
    const handleBeforeUnload = (e) => { if (!isCanvasEmpty) e.preventDefault() }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isCanvasEmpty])

  const sections = [
    { id: 'templates', label: 'Presets' },
    { id: 'media', label: 'Media' },
    { id: 'content', label: 'Content' },
    { id: 'layout', label: 'Structure' },
    { id: 'style', label: 'Style' },
  ]

  // Shared tab content — rendered in sidebar (desktop) or bottom sheet (mobile)
  const tabContent = (
    <div className="space-y-5">
      <ErrorBoundary title="Templates error" message="Failed to load templates.">
        {activeSection === 'templates' && (
          <TemplatesTab
            activeStylePreset={state.activeStylePreset}
            onSelectStylePreset={applyStylePreset}
            layout={state.layout}
            onApplyLayoutPreset={applyLayoutPreset}
            platform={state.platform}
            theme={state.theme}
            onThemeChange={setTheme}
            onThemePresetChange={setThemePreset}
          />
        )}
      </ErrorBoundary>
      <ErrorBoundary title="Media error" message="Failed to load media controls.">
        {activeSection === 'media' && (
          <MediaTab
            images={state.images}
            onAddImage={addImage}
            onRemoveImage={removeImage}
            onUpdateImage={updateImage}
            onUpdateImageFilters={updateImageFilters}
            onUpdateImagePosition={updateImagePosition}
            onUpdateImageOverlay={updateImageOverlay}
            cellImages={state.cellImages}
            onSetCellImage={setCellImage}
            logo={state.logo}
            onLogoChange={setLogo}
            logoPosition={state.logoPosition}
            onLogoPositionChange={setLogoPosition}
            logoSize={state.logoSize}
            onLogoSizeChange={setLogoSize}
            layout={state.layout}
            platform={state.platform}
            theme={state.theme}
            selectedCell={safeSelectedCell}
            onSelectCell={setSelectedCell}
          />
        )}
      </ErrorBoundary>
      <ErrorBoundary title="Content error" message="Failed to load content controls.">
        {activeSection === 'content' && (
          <ContentTab
            text={state.text}
            onTextChange={setText}
            layout={state.layout}
            onLayoutChange={setLayout}
            theme={state.theme}
            platform={state.platform}
            textMode={state.textMode || 'structured'}
            onTextModeChange={setTextMode}
            freeformText={state.freeformText || {}}
            onAddBlock={addFreeformBlock}
            onUpdateBlock={updateFreeformBlock}
            onRemoveBlock={removeFreeformBlock}
            onMoveBlock={moveFreeformBlock}
            selectedCell={safeSelectedCell}
            onSelectCell={setSelectedCell}
          />
        )}
      </ErrorBoundary>
      <ErrorBoundary title="Layout error" message="Failed to load layout controls.">
        {activeSection === 'layout' && (
          <LayoutTab
            layout={state.layout}
            onLayoutChange={setLayout}
            platform={state.platform}
            selectedCell={safeSelectedCell}
            onSelectCell={setSelectedCell}
            cellImages={state.cellImages}
            images={state.images}
            onUpdateImage={updateImage}
          />
        )}
      </ErrorBoundary>
      <ErrorBoundary title="Style error" message="Failed to load style controls.">
        {activeSection === 'style' && (
          <StyleTab
            theme={state.theme}
            selectedFonts={state.fonts}
            onFontsChange={setFonts}
            layout={state.layout}
            onLayoutChange={setLayout}
            platform={state.platform}
            padding={state.padding}
            onPaddingChange={setPadding}
            frame={state.frame}
            onFrameChange={setFrame}
            cellImages={state.cellImages}
            selectedCell={safeSelectedCell}
            onSelectCell={setSelectedCell}
          />
        )}
      </ErrorBoundary>
    </div>
  )

  // Shared modals — rendered in both mobile and desktop layouts
  const modals = (
    <>
      {showShortcuts && <KeyboardShortcutsOverlay onClose={() => setShowShortcuts(false)} />}
      <InstallInstructionsModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} instructions={getInstallInstructions()} />
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      <SaveLoadModal isOpen={showSaveLoadModal} onClose={() => setShowSaveLoadModal(false)} onSave={saveDesign} onLoad={loadDesign} onDelete={deleteDesign} getSavedDesigns={getSavedDesigns} />
    </>
  )

  // Shared export overlay
  const exportOverlay = isExporting && (
    <div className="absolute inset-0 bg-dark-page/80 flex items-center justify-center backdrop-blur-sm z-10">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
        <p className="text-white font-medium">Exporting...</p>
        <button onClick={() => { cancelExportRef.current = true; setIsExporting(false) }} className="mt-3 px-4 py-1.5 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
      </div>
    </div>
  )

  // ─── Reader mode ───
  if (isReaderMode) {
    return (
      <div className="h-[100dvh] flex flex-col bg-zinc-100 dark:bg-dark-page">
        {fonts.map((font) => <link key={font.id} rel="stylesheet" href={font.url} />)}
        <header className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm border-b border-zinc-200/60 dark:border-zinc-700/60 px-3 py-2 shrink-0" style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))' }}>
          <div className="flex items-center justify-between">
            <button onClick={() => setIsReaderMode(false)} className="px-2 py-1 sm:px-3 sm:py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span className="hidden sm:inline">Back to Editor</span>
            </button>
            {hasMultiplePages && <span className="text-sm font-medium text-ui-text-muted">{state.activePage + 1} / {pageCount}</span>}
            <button onClick={toggleDarkMode} title={isDark ? 'Light mode' : 'Dark mode'} className="px-2 py-1 sm:px-3 sm:py-1.5 text-sm rounded-lg font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all">
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
              <button onClick={() => setActivePage(state.activePage - 1)} disabled={state.activePage === 0} className="px-3 py-2 sm:py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-dark-card border border-ui-border text-ui-text hover:bg-zinc-50 dark:hover:bg-dark-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-all">Prev</button>
              <div className="flex gap-1">
                {pages.map((_, index) => (
                  <button key={index} onClick={() => setActivePage(index)} className={`w-8 h-8 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${index === state.activePage ? 'bg-primary text-white scale-110' : 'bg-zinc-200 dark:bg-zinc-600 text-zinc-500 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-500'}`} title={`Page ${index + 1}`}>{index + 1}</button>
                ))}
              </div>
              <button onClick={() => setActivePage(state.activePage + 1)} disabled={state.activePage === pageCount - 1} className="px-3 py-2 sm:py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-dark-card border border-ui-border text-ui-text hover:bg-zinc-50 dark:hover:bg-dark-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-all">Next</button>
            </div>
          )}
        </main>
      </div>
    )
  }

  // ─── Mobile layout ───
  // Requirement: Native app-like experience on mobile with bottom nav + bottom sheet.
  // Approach: Fixed viewport (100dvh), edge-to-edge canvas, bottom sheet for tab controls.
  // Alternatives:
  //   - Responsive sidebar: Rejected — scroll-heavy, canvas hidden by controls.
  //   - Tab content above canvas: Rejected — canvas should be primary focus.
  if (isMobile) {
    return (
      <div className="h-[100dvh] flex flex-col overflow-hidden bg-zinc-100 dark:bg-dark-page">
        {fonts.map((font) => <link key={font.id} rel="stylesheet" href={font.url} />)}

        {/* Mobile header — compact with overflow menu */}
        <header className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm border-b border-zinc-200/60 dark:border-zinc-700/60 shrink-0 relative" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-display font-bold text-ui-text tracking-tight">CanvaGrid</h1>
              <span className="px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded">Preview</span>
            </div>
            <div className="flex items-center gap-0.5">
              <button onClick={() => setShowSaveLoadModal(true)} title="Save" className="p-2 rounded-lg text-ui-text hover:bg-zinc-100 dark:hover:bg-dark-subtle transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              </button>
              <button onClick={toggleDarkMode} title={isDark ? 'Light mode' : 'Dark mode'} className="p-2 rounded-lg text-ui-text hover:bg-zinc-100 dark:hover:bg-dark-subtle transition-colors">
                <span className="text-sm">{isDark ? '☀️' : '🌙'}</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setShowMobileMenu(!showMobileMenu) }} title="More options" className="p-2 rounded-lg text-ui-text hover:bg-zinc-100 dark:hover:bg-dark-subtle transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
              </button>
            </div>
          </div>
          {/* Overflow menu */}
          {showMobileMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMobileMenu(false)} />
              <div className="absolute right-3 top-full mt-1 z-30 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-ui-border py-1 min-w-[180px]">
                {[
                  { label: 'Reader Mode', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z', onClick: () => setIsReaderMode(true) },
                  { label: 'Help & Tutorial', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', onClick: () => setShowTutorial(true) },
                  { label: 'Refresh', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', onClick: () => window.location.reload() },
                ].map((item) => (
                  <button key={item.label} onClick={() => { item.onClick(); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ui-text hover:bg-ui-surface-hover transition-colors">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                    {item.label}
                  </button>
                ))}
                {canInstall && (
                  <button onClick={() => { install(); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-primary/5 transition-colors">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Install App
                  </button>
                )}
                {hasUpdate && (
                  <button onClick={() => { update(); setShowMobileMenu(false) }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
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

        {/* Compact context bar */}
        <ContextBar
          layout={state.layout} cellImages={state.cellImages} selectedCell={safeSelectedCell} onSelectCell={setSelectedCell} platform={state.platform}
          undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
          pages={pages} activePage={state.activePage} onSetActivePage={setActivePage}
          onAddPage={addPage} onDuplicatePage={duplicatePage} onRemovePage={removePage} onMovePage={movePage} getPageState={getPageState}
        />

        {/* Canvas — fills remaining space, edge-to-edge */}
        <main
          ref={previewContainerRef}
          className="flex-1 min-h-0 flex items-center justify-center relative bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-dark-subtle dark:to-dark-page"
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

        {/* Platform info strip + empty state — below canvas, above nav */}
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

        {/* Bottom sheet — tab content slides up from bottom */}
        <BottomSheet isOpen={mobileSheetOpen} onClose={closeMobileSheet} height={sheetHeight} onHeightChange={setSheetHeight}>
          {activeSection === 'export' ? (
            <div className="space-y-5">
              <PlatformPreview selectedPlatform={state.platform} onPlatformChange={setPlatform} />
              <ExportButtons
                canvasRef={canvasRef} state={state} onPlatformChange={setPlatform} onExportFormatChange={setExportFormat}
                onExportingChange={setIsExporting} cancelExportRef={cancelExportRef} pageCount={pageCount} onSetActivePage={setActivePage}
              />
            </div>
          ) : tabContent}
        </BottomSheet>

        {/* Bottom navigation */}
        <MobileNav activeTab={activeSection} sheetOpen={mobileSheetOpen} onTabChange={handleMobileTabChange} />

        {modals}
      </div>
    )
  }

  // ─── Desktop layout ───
  return (
    <div className="min-h-screen" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {fonts.map((font) => <link key={font.id} rel="stylesheet" href={font.url} />)}

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

      <div className="flex flex-col-reverse lg:flex-row lg:items-stretch">
        <aside className="w-full lg:w-96 p-4 pb-24 lg:p-5 lg:pr-0 lg:pb-5">
          <div className="bg-white dark:bg-dark-card rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-card p-4 lg:p-5">
            {tabContent}
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-5 space-y-4">
          <div className="bg-white dark:bg-dark-card rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-card p-4 lg:p-5">
            <PlatformPreview selectedPlatform={state.platform} onPlatformChange={setPlatform} />
          </div>

          <div className="bg-white dark:bg-dark-card rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-card p-4 lg:p-6">
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

export default function AppWithProviders() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  )
}
