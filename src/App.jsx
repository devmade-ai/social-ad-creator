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

          sectionCells.push(
            <div
              key={`overlay-cell-${currentCellIndex}`}
              onClick={() => onSelectCell(currentCellIndex)}
              style={{
                flex: `1 1 ${subSizes[subIndex]}%`,
                cursor: 'pointer',
                boxSizing: 'border-box',
                border: isSelected ? '2px solid rgba(99, 102, 241, 0.7)' : '1px solid transparent',
                transition: 'border-color 0.15s',
              }}
              className="hover:border-primary/40"
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
  const [activeSection, setActiveSection] = useState('templates')
  const [imageAspectRatio] = useState(null) // TODO: Calculate from first image in pool
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
    setTextCells,
    setLayout,
    setTheme,
    setThemePreset,
    setFonts,
    setPadding,
    setFrame,
    setOuterFrame,
    setCellFrame,
    setPlatform,
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
    setFreeformText,
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
  }, [undo, redo, isReaderMode, state.activePage, pageCount, setActivePage])

  // Track window height for reader mode scaling
  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight)
    window.addEventListener('resize', handleResize)
    // Also listen to orientationchange for mobile
    window.addEventListener('orientationchange', () => {
      // Delay to let the browser update layout after orientation change
      setTimeout(handleResize, 100)
    })
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
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
  const previewScale = useMemo(() => {
    const maxWidth = isReaderMode
      ? Math.max(containerWidth - 16, 200)  // Tight margins in reader mode
      : Math.max(containerWidth - 32, 200)
    const maxHeight = isReaderMode
      ? windowHeight - (hasMultiplePages ? 100 : 64) // Header ~44px + padding + nav
      : Math.min(windowHeight * 0.6, 600)
    const scaleX = maxWidth / platform.width
    const scaleY = maxHeight / platform.height
    return Math.min(scaleX, scaleY, 1)
  }, [platform, containerWidth, isReaderMode, windowHeight, hasMultiplePages])

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

      {/* Header - scrolls away, ContextBar below is sticky */}
      <header className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm border-b border-zinc-200/60 dark:border-zinc-700/60 px-4 py-3">
        {/* Desktop: single row */}
        <div className="hidden sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-display font-bold text-ui-text tracking-tight">Grumpy Cam Canvas 🫩</h1>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded">
              Research Preview
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setIsReaderMode(true)}
              title="Reader mode - view pages without editing UI"
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View</span>
            </button>
            <button
              onClick={() => setShowSaveLoadModal(true)}
              title="Save or load designs"
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Save</span>
            </button>
            <button
              onClick={() => setShowTutorial(true)}
              title="Help & Tutorial"
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Help</span>
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
              <span>Refresh</span>
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

        {/* Mobile: stacked rows */}
        <div className="flex flex-col gap-2 sm:hidden">
          {/* Row 1: Title */}
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-lg font-display font-bold text-ui-text tracking-tight">Grumpy Cam Canvas 🫩</h1>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded">
              Research Preview
            </span>
          </div>

          {/* Row 2: Utility buttons (centered) */}
          <div className="flex justify-center gap-1.5">
            <button
              onClick={() => setIsReaderMode(true)}
              title="Reader mode"
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => setShowSaveLoadModal(true)}
              title="Save or load designs"
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
            <button
              onClick={() => setShowTutorial(true)}
              title="Help & Tutorial"
              className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            </button>
          </div>

          {/* Row 3: Install/Update CTAs (conditional, centered) */}
          {(canInstall || (!canInstall && showManualInstructions && !isInstalled) || hasUpdate) && (
            <div className="flex justify-center gap-1.5">
              {canInstall && (
                <button
                  onClick={install}
                  title="Install app"
                  className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-primary text-white hover:bg-primary-hover active:scale-95 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Install App</span>
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
                  <span>Install App</span>
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
                  <span>Update Available</span>
                </button>
              )}
            </div>
          )}

        </div>
      </header>

      {/* Tab Navigation Bar - full width, website header style */}
      <nav className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm border-b border-zinc-200/60 dark:border-zinc-700/60 sticky top-0 z-10">
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

      <div className="flex flex-col lg:flex-row lg:items-stretch">
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
                    imageAspectRatio={imageAspectRatio}
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
                    textCells={state.textCells}
                    onTextCellsChange={setTextCells}
                    layout={state.layout}
                    theme={state.theme}
                    platform={state.platform}
                    textMode={state.textMode || 'structured'}
                    onTextModeChange={setTextMode}
                    freeformText={state.freeformText || {}}
                    onFreeformTextChange={setFreeformText}
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
                    textCells={state.textCells}
                    onTextCellsChange={setTextCells}
                    platform={state.platform}
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
              {/* Export overlay */}
              {isExporting && (
                <div className="absolute inset-0 bg-dark-page/80 flex items-center justify-center rounded-xl backdrop-blur-sm">
                  <div className="text-center">
                    <div className="inline-block w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
                    <p className="text-white font-medium">Exporting...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Export Buttons */}
            <div className="mt-5">
              <ErrorBoundary title="Export error" message="Failed to load export options.">
                <ExportButtons
                  canvasRef={canvasRef}
                  state={state}
                  onPlatformChange={setPlatform}
                  onExportingChange={setIsExporting}
                  pageCount={pageCount}
                  getPageState={getPageState}
                  onSetActivePage={setActivePage}
                />
              </ErrorBoundary>
            </div>
          </div>
        </main>
      </div>

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

export default App
