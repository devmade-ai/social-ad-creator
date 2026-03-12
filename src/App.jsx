// Requirement: Single-page app with workflow-based tab UI (Presets → Media → Content → Structure → Style).
// Approach: Sticky tab nav bar + sidebar/main split. All state via useAdState hook.
//   Reader mode is a full-screen overlay with keyboard navigation.
//   Each tab wrapped in ErrorBoundary so a crash in one tab doesn't break the app.
// Alternatives:
//   - React Router per tab: Rejected - tabs are panels, not routes; no URL benefit.
//   - Floating panel UI: Rejected - sidebar is more intuitive for non-technical users.
import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { useAdState } from './hooks/useAdState'
import { useDarkMode } from './hooks/useDarkMode'
import { usePWAInstall } from './hooks/usePWAInstall'
import { usePWAUpdate } from './hooks/usePWAUpdate'
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
import ZoomControls from './components/ZoomControls'
import QuickActionsBar from './components/QuickActionsBar'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { platforms } from './config/platforms'
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

          // Requirement: Click-to-select cells on canvas without persistent visual clutter
          // Approach: Brief flash animation on selection, then fully transparent
          // Alternatives:
          //   - Persistent outline: Rejected — obscures frames and design content
          //   - Borders on all cells: Rejected — looks like export borders, confuses users
          // Requirement: Canvas cell overlay must be keyboard-accessible
          // Approach: role="button", tabIndex, onKeyDown for Enter/Space
          // Alternatives:
          //   - <button> element: Rejected — needs extra reset styling, flex layout issues
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
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)
  const [isExporting, setIsExporting] = useState(false)
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
  const [zoomLevel, setZoomLevel] = useState(null) // null = auto-fit

  const {
    state,
    // Image pool management
    addImage,
    removeImage,
    updateImage,
    updateImageFilters,
    updateImagePosition,
    updateImageOverlay,
    setCellImage,
    // Other state
    setLogo,
    setLogoPosition,
    setLogoSize,
    setText,
    setLayout,
    setTheme,
    setThemePreset,
    setFonts,
    setPadding,
    setFrame,
    setOuterFrame,
    setCellFrame,
    setPlatform,
    setExportFormat,
    applyStylePreset,
    applyLayoutPreset,
    undo,
    redo,
    canUndo,
    canRedo,
    // Save/load
    saveDesign,
    loadDesign,
    getSavedDesigns,
    deleteDesign,
    // Multi-page
    setActivePage,
    addPage,
    duplicatePage,
    removePage,
    movePage,
    getPageCount,
    getPageState,
    // Text mode
    setTextMode,
    addFreeformBlock,
    updateFreeformBlock,
    removeFreeformBlock,
    moveFreeformBlock,
  } = useAdState()

  // Clamp selectedCell when layout structure changes
  const totalCells = useMemo(() => {
    const structure = state.layout.structure || [{ size: 100, subdivisions: 1, subSizes: [100] }]
    return structure.reduce((total, section) => total + (section.subdivisions || 1), 0)
  }, [state.layout.structure])

  useEffect(() => {
    if (selectedCell >= totalCells) {
      setSelectedCell(0)
    }
  }, [totalCells, selectedCell])

  const platform = platforms.find((p) => p.id === state.platform) || platforms[0]
  const pages = state.pages || [null]
  const pageCount = pages.length
  const hasMultiplePages = pageCount > 1

  // Keyboard shortcuts for undo/redo and reader mode navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault()
          redo()
        } else {
          e.preventDefault()
          undo()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      }

      // Tab switching with number keys (1-5)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const tabMap = { '1': 'templates', '2': 'media', '3': 'content', '4': 'layout', '5': 'style' }
        if (tabMap[e.key]) {
          setActiveSection(tabMap[e.key])
        }
      }

      // Escape closes modals/overlays
      if (e.key === 'Escape' && showShortcuts) {
        e.preventDefault()
        setShowShortcuts(false)
        return
      }

      // Reader mode navigation with arrow keys
      if (isReaderMode) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault()
          if (state.activePage > 0) setActivePage(state.activePage - 1)
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault()
          if (state.activePage < pageCount - 1) setActivePage(state.activePage + 1)
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          setIsReaderMode(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, isReaderMode, state.activePage, pageCount, setActivePage, showShortcuts])

  // Requirement: ContextBar sticky position must adapt to actual tab nav height
  // Approach: Measure tab nav via ResizeObserver, set CSS custom property
  // Alternatives:
  //   - Hardcoded pixel value: Rejected — breaks if font size or padding changes
  useEffect(() => {
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
  }, [])

  // Track window height for reader mode scaling
  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight)
    // Delay on orientation change to let the browser update layout
    const handleOrientation = () => setTimeout(handleResize, 100)
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientation)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientation)
    }
  }, [])

  // Track container width for responsive preview
  useEffect(() => {
    const container = previewContainerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width
        setContainerWidth(width)
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [isReaderMode])

  // Calculate scale to fit preview in container
  // Requirement: Zoom controls on canvas for user-controlled zoom.
  // Approach: zoomLevel state (null = auto-fit). When set, overrides auto-scale.
  // Alternatives:
  //   - Always auto-fit: Current behavior — no user control for detail inspection.
  //   - Pinch-to-zoom: Complex on desktop, and doesn't give precise control.
  const autoScale = useMemo(() => {
    const maxWidth = isReaderMode
      ? Math.max(containerWidth - 16, 200)
      : Math.max(containerWidth - 32, 200)
    const maxHeight = isReaderMode
      ? windowHeight - (hasMultiplePages ? 100 : 64)
      // Requirement: Remove artificial 600px height cap — let canvas use available space
      // Approach: Use 70% of viewport height instead of capped 60%
      // Alternatives:
      //   - Keep 600px cap: Rejected — wastes space on tall screens, cuts off large canvases
      : windowHeight * 0.7
    const scaleX = maxWidth / platform.width
    const scaleY = maxHeight / platform.height
    return Math.min(scaleX, scaleY, 1)
  }, [platform, containerWidth, isReaderMode, windowHeight, hasMultiplePages])

  const previewScale = zoomLevel !== null ? zoomLevel : autoScale

  // Reset zoom when platform changes
  useEffect(() => { setZoomLevel(null) }, [state.platform])

  // Detect empty state (no images, no meaningful text)
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

  // Requirement: Warn users before leaving with unsaved changes
  // Approach: beforeunload event when canvas has content
  // Alternatives:
  //   - No warning: Rejected — users lose work accidentally
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isCanvasEmpty) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isCanvasEmpty])

  // New workflow-based tabs
  const sections = [
    { id: 'templates', label: 'Presets' },
    { id: 'media', label: 'Media' },
    { id: 'content', label: 'Content' },
    { id: 'layout', label: 'Structure' },
    { id: 'style', label: 'Style' },
  ]

  // Reader mode - minimal UI with page navigation
  if (isReaderMode) {
    return (
      <div className="h-[100dvh] flex flex-col bg-zinc-100 dark:bg-dark-page">
        {/* Load fonts */}
        {fonts.map((font) => (
          <link key={font.id} rel="stylesheet" href={font.url} />
        ))}

        {/* Reader header - compact */}
        <header className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm border-b border-zinc-200/60 dark:border-zinc-700/60 px-3 py-2 shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsReaderMode(false)}
              className="px-2 py-1 sm:px-3 sm:py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Editor</span>
            </button>

            {hasMultiplePages && (
              <span className="text-sm font-medium text-ui-text-muted">
                {state.activePage + 1} / {pageCount}
              </span>
            )}

            <button
              onClick={toggleDarkMode}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="px-2 py-1 sm:px-3 sm:py-1.5 text-sm rounded-lg font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Reader canvas - fills remaining space */}
        <main className="flex-1 flex flex-col items-center justify-center px-2 py-1 sm:px-4 sm:py-2 min-h-0">
          <div
            ref={previewContainerRef}
            className="w-full flex justify-center"
          >
            <div
              style={{
                width: platform.width * previewScale,
                height: platform.height * previewScale,
              }}
            >
              <ErrorBoundary title="Preview error" message="Failed to render page.">
                <AdCanvas ref={canvasRef} state={state} scale={previewScale} />
              </ErrorBoundary>
            </div>
          </div>

          {/* Reader page navigation - compact */}
          {hasMultiplePages && (
            <div className="flex items-center gap-3 mt-2 shrink-0">
              <button
                onClick={() => setActivePage(state.activePage - 1)}
                disabled={state.activePage === 0}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-dark-card border border-ui-border text-ui-text hover:bg-zinc-50 dark:hover:bg-dark-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Prev
              </button>

              <div className="flex gap-1.5">
                {pages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActivePage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === state.activePage
                        ? 'bg-primary scale-125'
                        : 'bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400'
                    }`}
                    title={`Page ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActivePage(state.activePage + 1)}
                disabled={state.activePage === pageCount - 1}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-dark-card border border-ui-border text-ui-text hover:bg-zinc-50 dark:hover:bg-dark-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    )
  }

  // Normal editor mode
  return (
    <div className="min-h-screen">
      {/* Load fonts */}
      {fonts.map((font) => (
        <link key={font.id} rel="stylesheet" href={font.url} />
      ))}

      {/* Requirement: Deduplicate desktop/mobile header buttons.
          Approach: Single button set with responsive Tailwind classes.
          Alternatives:
            - Separate desktop/mobile JSX: Rejected — 200 lines of duplication. */}
      {/* Header - scrolls away, ContextBar below is sticky */}
      <header className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm border-b border-zinc-200/60 dark:border-zinc-700/60 px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-lg font-display font-bold text-ui-text tracking-tight">CanvaGrid</h1>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded">
              Research Preview
            </span>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-1.5">
            <button
              onClick={() => setIsReaderMode(true)}
              title="Reader mode - view pages without editing UI"
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="hidden sm:inline">View</span>
            </button>
            <button
              onClick={() => setShowSaveLoadModal(true)}
              title="Save or load designs"
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={() => setShowTutorial(true)}
              title="Help & Tutorial"
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Help</span>
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              title="Keyboard shortcuts"
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm4 2h2m2 0h2m2 0h2M5 14h14" />
              </svg>
            </button>
            <button
              onClick={toggleDarkMode}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => window.location.reload()}
              title="Refresh page"
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
            {canInstall && (
              <button
                onClick={install}
                title="Install app"
                className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-primary text-white hover:bg-primary-hover active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Install</span>
              </button>
            )}
            {!canInstall && showManualInstructions && !isInstalled && (
              <button
                onClick={() => setShowInstallModal(true)}
                title="How to install this app"
                className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Install</span>
              </button>
            )}
            {hasUpdate && (
              <button
                onClick={update}
                title="Update available - click to refresh"
                className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Update</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-center text-sm text-amber-700 dark:text-amber-300">
          You're offline. Your work is saved locally, but sample images and fonts may not load.
        </div>
      )}

      {/* Tab Navigation Bar - full width, website header style */}
      <nav ref={tabNavRef} className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm border-b border-zinc-200/60 dark:border-zinc-700/60 sticky top-0 z-10">
        <div className="flex items-center">
          <div className="flex overflow-x-auto scrollbar-thin">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeSection === section.id
                    ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-transparent text-ui-text-muted hover:text-ui-text hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-dark-subtle'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Context bar: cell selector, pages, undo/redo */}
      <ContextBar
        layout={state.layout}
        cellImages={state.cellImages}
        selectedCell={selectedCell}
        onSelectCell={setSelectedCell}
        platform={state.platform}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        pages={pages}
        activePage={state.activePage}
        onSetActivePage={setActivePage}
        onAddPage={addPage}
        onDuplicatePage={duplicatePage}
        onRemovePage={removePage}
        onMovePage={movePage}
        getPageState={getPageState}
      />

      {/* Requirement: On mobile, show canvas first so users see their design immediately
          Approach: flex-col-reverse on mobile, normal order on desktop
          Alternatives:
            - Sidebar first always: Rejected — on mobile, users scroll past controls to see canvas */}
      <div className="flex flex-col-reverse lg:flex-row lg:items-stretch">
        {/* Sidebar Controls */}
        <aside className="w-full lg:w-96 p-4 lg:p-5 lg:pr-0">
          <div className="bg-white dark:bg-dark-card rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-card p-4 lg:p-5">
            {/* Section Content */}
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
                    // Image pool
                    images={state.images}
                    onAddImage={addImage}
                    onRemoveImage={removeImage}
                    onUpdateImage={updateImage}
                    onUpdateImageFilters={updateImageFilters}
                    onUpdateImagePosition={updateImagePosition}
                    onUpdateImageOverlay={updateImageOverlay}
                    // Cell assignments
                    cellImages={state.cellImages}
                    onSetCellImage={setCellImage}
                    // Logo
                    logo={state.logo}
                    onLogoChange={setLogo}
                    logoPosition={state.logoPosition}
                    onLogoPositionChange={setLogoPosition}
                    logoSize={state.logoSize}
                    onLogoSizeChange={setLogoSize}
                    // Layout and other
                    layout={state.layout}
                    platform={state.platform}
                    theme={state.theme}
                    // Global cell selection
                    selectedCell={selectedCell}
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
                    selectedCell={selectedCell}
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
                    selectedCell={selectedCell}
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
                    selectedCell={selectedCell}
                    onSelectCell={setSelectedCell}
                  />
                )}
              </ErrorBoundary>
            </div>
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 p-4 lg:p-5 space-y-4">
          {/* Platform Selector */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-card p-4 lg:p-5">
            <PlatformPreview selectedPlatform={state.platform} onPlatformChange={setPlatform} />
          </div>

          {/* Canvas Preview */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-card p-4 lg:p-6">
            <div
              ref={previewContainerRef}
              className="relative bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-dark-subtle dark:to-dark-page rounded-xl overflow-hidden flex items-center justify-center border border-zinc-200/50 dark:border-zinc-700/50"
              style={{
                minHeight: platform.height * previewScale + 40,
              }}
            >
              <ErrorBoundary title="Preview error" message="Failed to render the ad preview." className="w-full h-full min-h-[200px]">
                <div
                  className="relative"
                  style={{
                    width: platform.width * previewScale,
                    height: platform.height * previewScale,
                  }}
                >
                  <AdCanvas ref={canvasRef} state={state} scale={previewScale} />
                  {/* Click-to-select cell overlay */}
                  {totalCells > 1 && (
                    <CanvasCellOverlay
                      layout={state.layout}
                      selectedCell={selectedCell}
                      onSelectCell={setSelectedCell}
                    />
                  )}
                </div>
              </ErrorBoundary>

              {/* Empty state guidance — helps new users get started */}
              {isCanvasEmpty && !isExporting && (
                <EmptyStateGuide onNavigate={setActiveSection} />
              )}

              {/* Zoom controls — floating bottom-right of canvas */}
              {!isExporting && (
                <ZoomControls zoomLevel={zoomLevel} autoScale={autoScale} onZoomChange={setZoomLevel} />
              )}

              {/* Export overlay with cancel option */}
              {isExporting && (
                <div className="absolute inset-0 bg-dark-page/80 flex items-center justify-center rounded-xl backdrop-blur-sm">
                  <div className="text-center">
                    <div className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
                    <p className="text-white font-medium">Exporting...</p>
                    <button
                      onClick={() => setIsExporting(false)}
                      className="mt-3 px-4 py-1.5 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions bar for selected cell — shortcuts to common per-cell actions */}
            {totalCells > 1 && (
              <QuickActionsBar selectedCell={selectedCell} onNavigate={setActiveSection} />
            )}

            {/* Export Buttons */}
            <div className="mt-5">
              <ErrorBoundary title="Export error" message="Failed to load export options.">
                <ExportButtons
                  canvasRef={canvasRef}
                  state={state}
                  onPlatformChange={setPlatform}
                  onExportFormatChange={setExportFormat}
                  onExportingChange={setIsExporting}
                  pageCount={pageCount}
                  onSetActivePage={setActivePage}
                />
              </ErrorBoundary>
            </div>
          </div>
        </main>
      </div>

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && (
        <KeyboardShortcutsOverlay onClose={() => setShowShortcuts(false)} />
      )}

      {/* Install Instructions Modal */}
      <InstallInstructionsModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        instructions={getInstallInstructions()}
      />

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      {/* Save/Load Modal */}
      <SaveLoadModal
        isOpen={showSaveLoadModal}
        onClose={() => setShowSaveLoadModal(false)}
        onSave={saveDesign}
        onLoad={loadDesign}
        onDelete={deleteDesign}
        getSavedDesigns={getSavedDesigns}
      />
    </div>
  )
}

// Wrap App with ToastProvider so all components can use useToast
export default function AppWithProviders() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  )
}
