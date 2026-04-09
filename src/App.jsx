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
import TemplatesTab from './components/TemplatesTab'
import MediaTab from './components/MediaTab'
import ContentTab from './components/ContentTab'
import LayoutTab from './components/LayoutTab'
import StyleTab from './components/StyleTab'
import ErrorBoundary from './components/ErrorBoundary'
import InstallInstructionsModal from './components/InstallInstructionsModal'
import TutorialModal from './components/TutorialModal'
import SaveLoadModal from './components/SaveLoadModal'
import { ToastProvider } from './components/Toast'
import KeyboardShortcutsOverlay from './components/KeyboardShortcutsOverlay'
import ReaderMode from './components/ReaderMode'
import MobileLayout from './components/MobileLayout'
import DesktopLayout from './components/DesktopLayout'
import { SNAP_HALF } from './components/BottomSheet'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { platforms, findPlatformGroup } from './config/platforms'
import { fonts } from './config/fonts'
import { normalizeStructure } from './utils/cellUtils'
import { debugLog } from './utils/debugLog'

// Swipe threshold for page navigation on mobile (px)
const SWIPE_THRESHOLD = 50

// Transparent overlay on canvas for click-to-select cell
// Requirement: Long-press context menu on mobile — reduces tab-hopping for common cell actions.
// Approach: 500ms touch timeout on cell overlay divs. Short press = select cell (existing).
//   Long press = show floating menu with 3 tab shortcuts (Media, Content, Style).
//   Menu anchored near touch point, dismissed on selection or outside tap.
// Alternatives:
//   - Always-visible quick actions bar: Rejected — already exists (QuickActionsBar) but requires
//     cell selection first. Long-press is more direct.
//   - Double-tap: Rejected — conflicts with zoom gestures on some mobile browsers.
function CellContextMenu({ position, onAction, onClose }) {
  const actions = [
    { id: 'media', label: 'Add Image', icon: '🖼️' },
    { id: 'content', label: 'Edit Text', icon: '✏️' },
    { id: 'style', label: 'Style Cell', icon: '🎨' },
  ]

  return (
    <>
      {/* Backdrop to catch outside taps */}
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        className="absolute z-30 bg-base-100 rounded-xl shadow-lg border border-base-300 py-1 min-w-[140px]"
        style={{ top: position.y, left: position.x }}
      >
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className="w-full px-3 py-2.5 text-sm text-left flex items-center gap-2 text-base-content hover:bg-base-300 active:bg-base-200 transition-colors"
          >
            <span aria-hidden="true">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </>
  )
}

function CanvasCellOverlay({ layout, selectedCell, onSelectCell, onLongPress }) {
  const { type, structure } = layout
  const isFullbleed = type === 'fullbleed'
  const isRows = type === 'rows'

  const normalizedStructure = normalizeStructure(type, structure)

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
              onTouchStart={(e) => {
                if (!onLongPress) return
                const touch = e.touches[0]
                const rect = e.currentTarget.getBoundingClientRect()
                e.currentTarget._longPressTimer = setTimeout(() => {
                  onSelectCell(currentCellIndex)
                  onLongPress(currentCellIndex, {
                    x: Math.min(touch.clientX - rect.left, rect.width - 150),
                    y: Math.max(0, touch.clientY - rect.top - 40),
                  })
                }, 500)
              }}
              onTouchMove={(e) => { clearTimeout(e.currentTarget._longPressTimer) }}
              onTouchEnd={(e) => { clearTimeout(e.currentTarget._longPressTimer) }}
              onTouchCancel={(e) => { clearTimeout(e.currentTarget._longPressTimer) }}
              style={{
                flex: `1 1 ${subSizes[subIndex]}%`,
                cursor: 'pointer',
                boxSizing: 'border-box',
                touchAction: 'manipulation',
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
  const { isDark, toggle: toggleDarkMode, comboId, setCombo } = useDarkMode()
  const { canInstall, install, showManualInstructions, getInstallInstructions, isInstalled } = usePWAInstall()
  const { hasUpdate, update } = usePWAUpdate()
  const isOnline = useOnlineStatus()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [allFontsLoaded, setAllFontsLoaded] = useState(false)

  // Mobile-specific state
  // Requirement: Open Presets bottom sheet by default so users see it's active on load.
  // Approach: Initialize mobileSheetOpen=true and sheetSnap=SNAP_HALF for mobile.
  //   Non-mobile ignores these values (cleared by the isMobile effect below).
  const isMobile = useIsMobile()
  const [mobileSheetOpen, setMobileSheetOpen] = useState(true)
  const [sheetSnap, setSheetSnap] = useState(SNAP_HALF)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [cellContextMenu, setCellContextMenu] = useState(null) // { cellIndex, position: { x, y } }
  const swipeRef = useRef({ x: 0, y: 0 })

  const {
    state,
    addImage, removeImage, updateImage, updateImageFilters, updateImagePosition, updateImageOverlay, setCellImage,
    setLogo, setLogoPosition, setLogoSize,
    setText, setLayout, setTheme, setThemePreset, setThemeVariant, setFonts,
    setPadding, setFrame, setOuterFrame, setCellFrame,
    setPlatform, setExportFormat,
    applyStylePreset, applyLayoutPreset,
    undo, redo, canUndo, canRedo,
    saveDesign, loadDesign, getSavedDesigns, deleteDesign,
    setActivePage, addPage, duplicatePage, removePage, movePage, getPageState,
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

  // Requirement: Lazy-load fonts to reduce initial HTTP requests to 2.
  // Approach: Only load the 2 active fonts (title + body) on mount. Load all
  //   when user opens the font picker in StyleTab, so font previews work.
  // Alternatives:
  //   - Load on font change only: Rejected — font preview in picker needs all fonts loaded.
  //   - Intersection Observer: Rejected — overengineered for a simple boolean flag.
  const fontsToLoad = useMemo(() => {
    if (allFontsLoaded) return fonts
    const activeIds = new Set([state.fonts?.title, state.fonts?.body])
    return fonts.filter((f) => activeIds.has(f.id))
  }, [allFontsLoaded, state.fonts?.title, state.fonts?.body])

  const loadAllFonts = useCallback(() => setAllFontsLoaded(true), [])

  // Requirement: Derive image aspect ratio for layout suggestions.
  // Approach: Use first image's natural dimensions (stored by addImage on upload).
  // Alternatives:
  //   - Selected cell's image: Rejected — cell selection changes frequently, suggestions would jump.
  //   - Average of all images: Rejected — overcomplicates for marginal benefit.
  const imageAspectRatio = state.images.length > 0 && state.images[0].naturalWidth && state.images[0].naturalHeight
    ? state.images[0].naturalWidth / state.images[0].naturalHeight
    : null
  const platformGroup = findPlatformGroup(state.platform)
  const pages = state.pages || [null]
  const pageCount = pages.length
  const hasMultiplePages = pageCount > 1

  // Clear stale mobile state when transitioning to desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileSheetOpen(false)
      setSheetSnap(0)
      setShowMobileMenu(false)
    }
  }, [isMobile])

  // Mobile helpers
  const closeMobileSheet = useCallback(() => {
    setMobileSheetOpen(false)
    setSheetSnap(0)
    debugLog('ui', 'sheet-close')
  }, [])

  // Long-press on canvas cell → show context menu (mobile only)
  const handleCellLongPress = useCallback((cellIndex, position) => {
    setCellContextMenu({ cellIndex, position })
  }, [])

  const handleCellContextAction = useCallback((tabId) => {
    setCellContextMenu(null)
    setActiveSection(tabId)
    setMobileSheetOpen(true)
  }, [])

  const handleMobileTabChange = useCallback((tabId) => {
    if (tabId === activeSection && mobileSheetOpen) {
      closeMobileSheet()
    } else {
      debugLog('ui', 'tab-change', { from: activeSection, to: tabId })
      setActiveSection(tabId)
      setMobileSheetOpen(true)
      // BottomSheet auto-open effect handles snap=0 → SNAP_HALF
    }
  }, [activeSection, mobileSheetOpen, closeMobileSheet])

  // Ref for values accessed by stable callbacks (swipe, keyboard) to avoid stale closures.
  // Reader mode keyboard handling (Escape + arrow nav) moved to ReaderMode component.
  // Escape for shortcuts/menu handled by native <dialog> and BurgerMenu's useEscapeKey.
  const keyboardRef = useRef({ undo, redo, activePage: state.activePage, pageCount, setActivePage, setActiveSection, isMobile, setMobileSheetOpen })
  keyboardRef.current = { undo, redo, activePage: state.activePage, pageCount, setActivePage, setActiveSection, isMobile, setMobileSheetOpen }

  // Swipe between pages on mobile canvas
  const handleCanvasTouchStart = useCallback((e) => {
    swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const handleCanvasTouchEnd = useCallback((e) => {
    const dx = e.changedTouches[0].clientX - swipeRef.current.x
    const dy = e.changedTouches[0].clientY - swipeRef.current.y
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      // Prevent synthesized click from triggering cell selection during swipe
      e.preventDefault()
      // Read from ref to avoid stale closure on rapid successive swipes
      const { activePage, pageCount: pc, setActivePage: goTo } = keyboardRef.current
      if (dx > 0 && activePage > 0) { debugLog('ui', 'page-navigate', { to: activePage - 1, source: 'swipe' }); goTo(activePage - 1) }
      else if (dx < 0 && activePage < pc - 1) { debugLog('ui', 'page-navigate', { to: activePage + 1, source: 'swipe' }); goTo(activePage + 1) }
    }
  }, [])

  // Keyboard shortcuts

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      const { undo, redo, setActiveSection, isMobile, setMobileSheetOpen } = keyboardRef.current

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) { e.preventDefault(); redo() }
        else { e.preventDefault(); undo() }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo() }

      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const tabMap = { '1': 'templates', '2': 'media', '3': 'content', '4': 'layout', '5': 'style' }
        if (tabMap[e.key]) {
          debugLog('ui', 'tab-change', { to: tabMap[e.key], source: 'keyboard' })
          setActiveSection(tabMap[e.key])
          if (isMobile) setMobileSheetOpen(true)
        }
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
    // Mobile: use container dimensions, reduced by bottom sheet when open.
    // Desktop: use container width + 70% viewport height.
    // Requirement: Canvas auto-scales to fit visible area above bottom sheet
    //   so it's never hidden behind the sheet and doesn't need scrolling.
    // Alternatives:
    //   - overflow-y-auto + paddingBottom on canvas container: Rejected — ResizeObserver
    //     picks up the padding change, recalculates scale, causes dimension flicker,
    //     and scroll only worked on initial load (not on subsequent sheet opens).
    const maxWidth = isMobile
      ? Math.max(containerWidth - 8, 200)
      : Math.max(containerWidth - 32, 200)
    const maxHeight = isMobile
      ? Math.max(containerHeight - (mobileSheetOpen ? (sheetSnap / 100) * windowHeight : 0) - 8, 200)
      : windowHeight * 0.7
    if (!platform.width || !platform.height) return 1
    return Math.min(maxWidth / platform.width, maxHeight / platform.height, 1)
  }, [platform, containerWidth, containerHeight, isMobile, isReaderMode, windowHeight, hasMultiplePages, mobileSheetOpen, sheetSnap])

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

  // Shared tab content — rendered in sidebar (desktop) or bottom sheet (mobile).
  // Memoized to avoid recreating unused ErrorBoundary wrappers on every render.
  const tabContent = useMemo(() => (
    <div className="space-y-5">
      <ErrorBoundary title="Templates error" message="Failed to load templates.">
        {activeSection === 'templates' && (
          <TemplatesTab
            activeStylePreset={state.activeStylePreset}
            onSelectStylePreset={applyStylePreset}
            layout={state.layout}
            onApplyLayoutPreset={applyLayoutPreset}
            platform={state.platform}
            onPlatformChange={isMobile ? setPlatform : undefined}
            theme={state.theme}
            onThemeChange={setTheme}
            onThemePresetChange={setThemePreset}
            onThemeVariantChange={setThemeVariant}
            imageAspectRatio={imageAspectRatio}
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
            pages={pages}
            activePage={state.activePage}
            onSetActivePage={setActivePage}
            onAddPage={addPage}
            onDuplicatePage={duplicatePage}
            onRemovePage={removePage}
            onMovePage={movePage}
            getPageState={getPageState}
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
            onLoadAllFonts={loadAllFonts}
          />
        )}
      </ErrorBoundary>
    </div>
  ), [activeSection, safeSelectedCell,
      // Specific state slices (not `state` itself, which is a new object every render)
      state.activeStylePreset, state.layout, state.platform, state.theme, state.images, state.cellImages,
      state.logo, state.logoPosition, state.logoSize, state.text, state.fonts, state.padding, state.frame,
      state.textMode, state.freeformText, state.activePage, state.pages,
      // Callbacks (stable refs from useAdState)
      applyStylePreset, applyLayoutPreset, setTheme, setThemePreset, setThemeVariant,
      addImage, removeImage, updateImage, updateImageFilters, updateImagePosition, updateImageOverlay, setCellImage,
      setLogo, setLogoPosition, setLogoSize, setText, setLayout, setFonts, setPadding, setFrame,
      setTextMode, addFreeformBlock, updateFreeformBlock, removeFreeformBlock, moveFreeformBlock, setSelectedCell, loadAllFonts,
      // Platform conditional (isMobile determines whether TemplatesTab gets platform change handler)
      isMobile, setPlatform, imageAspectRatio,
      // Page management (for LayoutTab)
      pages, setActivePage, addPage, duplicatePage, removePage, movePage, getPageState])

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
    <div className="absolute inset-0 bg-neutral/80 flex items-center justify-center backdrop-blur-sm z-10">
      <div className="text-center">
        <span className="loading loading-spinner loading-md text-primary mb-3" />
        <p className="text-neutral-content font-medium">Exporting...</p>
        <button onClick={() => { cancelExportRef.current = true; setIsExporting(false) }} className="mt-3 px-4 py-1.5 text-sm text-neutral-content/70 hover:text-neutral-content rounded-lg hover:bg-neutral-content/10 transition-colors">Cancel</button>
      </div>
    </div>
  )

  // ─── Reader mode ───
  if (isReaderMode) {
    return (
      <ReaderMode
        canvasRef={canvasRef}
        previewContainerRef={previewContainerRef}
        fontsToLoad={fontsToLoad}
        state={state}
        platform={platform}
        previewScale={previewScale}
        hasMultiplePages={hasMultiplePages}
        pages={pages}
        pageCount={pageCount}
        setActivePage={setActivePage}
        setIsReaderMode={setIsReaderMode}
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
        comboId={comboId}
        setCombo={setCombo}
      />
    )
  }

  // ─── Mobile layout ───
  if (isMobile) {
    return (
      <MobileLayout
        canvasRef={canvasRef}
        previewContainerRef={previewContainerRef}
        fontsToLoad={fontsToLoad}
        state={state}
        platform={platform}
        platformGroup={platformGroup}
        previewScale={previewScale}
        totalCells={totalCells}
        safeSelectedCell={safeSelectedCell}
        setSelectedCell={setSelectedCell}
        isCanvasEmpty={isCanvasEmpty}
        isExporting={isExporting}
        cancelExportRef={cancelExportRef}
        setIsExporting={setIsExporting}
        pages={pages}
        pageCount={pageCount}
        hasMultiplePages={hasMultiplePages}
        setActivePage={setActivePage}
        getPageState={getPageState}
        setPlatform={setPlatform}
        setExportFormat={setExportFormat}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        mobileSheetOpen={mobileSheetOpen}
        closeMobileSheet={closeMobileSheet}
        sheetSnap={sheetSnap}
        setSheetSnap={setSheetSnap}
        activeSection={activeSection}
        handleMobileTabChange={handleMobileTabChange}
        handleCanvasTouchStart={handleCanvasTouchStart}
        handleCanvasTouchEnd={handleCanvasTouchEnd}
        setShowSaveLoadModal={setShowSaveLoadModal}
        setShowTutorial={setShowTutorial}
        setShowShortcuts={setShowShortcuts}
        setIsReaderMode={setIsReaderMode}
        isDark={isDark}
        toggleDarkMode={toggleDarkMode}
        comboId={comboId}
        setCombo={setCombo}
        canInstall={canInstall}
        install={install}
        hasUpdate={hasUpdate}
        update={update}
        isOnline={isOnline}
        tabContent={tabContent}
        exportOverlay={exportOverlay}
        modals={modals}
        CanvasCellOverlay={CanvasCellOverlay}
        CellContextMenu={CellContextMenu}
        cellContextMenu={cellContextMenu}
        setCellContextMenu={setCellContextMenu}
        handleCellLongPress={handleCellLongPress}
        handleCellContextAction={handleCellContextAction}
      />
    )
  }

  // ─── Desktop layout ───
  return (
    <DesktopLayout
      canvasRef={canvasRef}
      previewContainerRef={previewContainerRef}
      tabNavRef={tabNavRef}
      fontsToLoad={fontsToLoad}
      state={state}
      platform={platform}
      previewScale={previewScale}
      totalCells={totalCells}
      safeSelectedCell={safeSelectedCell}
      setSelectedCell={setSelectedCell}
      isCanvasEmpty={isCanvasEmpty}
      isExporting={isExporting}
      cancelExportRef={cancelExportRef}
      setIsExporting={setIsExporting}
      pages={pages}
      pageCount={pageCount}
      setActivePage={setActivePage}
      getPageState={getPageState}
      setPlatform={setPlatform}
      setExportFormat={setExportFormat}
      undo={undo}
      redo={redo}
      canUndo={canUndo}
      canRedo={canRedo}
      sections={sections}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      setShowSaveLoadModal={setShowSaveLoadModal}
      setShowTutorial={setShowTutorial}
      setShowShortcuts={setShowShortcuts}
      setShowInstallModal={setShowInstallModal}
      setIsReaderMode={setIsReaderMode}
      isDark={isDark}
      toggleDarkMode={toggleDarkMode}
      comboId={comboId}
      setCombo={setCombo}
      canInstall={canInstall}
      install={install}
      showManualInstructions={showManualInstructions}
      isInstalled={isInstalled}
      hasUpdate={hasUpdate}
      update={update}
      isOnline={isOnline}
      tabContent={tabContent}
      exportOverlay={exportOverlay}
      modals={modals}
      CanvasCellOverlay={CanvasCellOverlay}
    />
  )
}

export default function AppWithProviders() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  )
}
