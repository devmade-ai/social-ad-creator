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
import { platforms } from './config/platforms'
import { fonts } from './config/fonts'

function App() {
  const canvasRef = useRef(null)
  const previewContainerRef = useRef(null)
  const [activeSection, setActiveSection] = useState('templates')
  const [imageAspectRatio] = useState(null) // TODO: Calculate from first image in pool
  const [containerWidth, setContainerWidth] = useState(600)
  const [isExporting, setIsExporting] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
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
  } = useAdState()

  const platform = platforms.find((p) => p.id === state.platform) || platforms[0]

  // TODO: Calculate image aspect ratio from first image in pool for layout suggestions

  // Keyboard shortcuts for undo/redo
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
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  // Track container width for responsive preview
  useEffect(() => {
    const container = previewContainerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Use contentBoxSize if available, otherwise fallback to contentRect
        const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width
        setContainerWidth(width)
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  // Calculate scale to fit preview in container (responsive to container width)
  const previewScale = useMemo(() => {
    // Use container width with some padding, and a reasonable max height
    const maxWidth = Math.max(containerWidth - 32, 200) // 32px padding, min 200px
    const maxHeight = Math.min(window.innerHeight * 0.6, 600) // 60% viewport or 600px max
    const scaleX = maxWidth / platform.width
    const scaleY = maxHeight / platform.height
    return Math.min(scaleX, scaleY, 1)
  }, [platform, containerWidth])

  // New workflow-based tabs
  const sections = [
    { id: 'templates', label: 'Presets' },
    { id: 'media', label: 'Media' },
    { id: 'content', label: 'Content' },
    { id: 'layout', label: 'Structure' },
    { id: 'style', label: 'Style' },
  ]

  return (
    <div className="min-h-screen">
      {/* Load fonts */}
      {fonts.map((font) => (
        <link key={font.id} rel="stylesheet" href={font.url} />
      ))}

      {/* Header */}
      <header className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm border-b border-zinc-200/60 dark:border-zinc-700/60 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-display font-bold text-ui-text tracking-tight">Social Ad Creator</h1>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded">
            Alpha
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium transition-all ${
              canUndo
                ? 'bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95'
                : 'bg-zinc-50 dark:bg-dark-subtle/50 text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <span>↶</span>
            <span className="hidden sm:inline">Undo</span>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium transition-all ${
              canRedo
                ? 'bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95'
                : 'bg-zinc-50 dark:bg-dark-subtle/50 text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <span>↷</span>
            <span className="hidden sm:inline">Redo</span>
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
            onClick={toggleDarkMode}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-ui-text hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
          >
            {isDark ? '☀️' : '🌙'}
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
              <span className="hidden sm:inline">Install</span>
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
              <span className="hidden sm:inline">Install</span>
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
              <span className="hidden sm:inline">Update</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row lg:items-stretch">
        {/* Sidebar Controls */}
        <aside className="w-full lg:w-96 p-4 lg:p-5 lg:pr-0">
          <div className="bg-white dark:bg-dark-card rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-card p-4 lg:p-5">
            {/* Section Tabs */}
            <div className="flex flex-wrap gap-1.5 mb-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-primary text-white shadow-sm hover:bg-primary-hover'
                      : 'bg-zinc-100 dark:bg-dark-subtle text-ui-text-muted hover:bg-zinc-200 dark:hover:bg-dark-elevated hover:text-zinc-800 dark:hover:text-zinc-100'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>

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
                  />
                )}
              </ErrorBoundary>
            </div>
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 p-4 lg:p-5 space-y-4">
          {/* Platform Selector - Separate section */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-card p-4 lg:p-5">
            <PlatformPreview selectedPlatform={state.platform} onPlatformChange={setPlatform} />
          </div>

          {/* Canvas Preview - Separate section */}
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
                  style={{
                    width: platform.width * previewScale,
                    height: platform.height * previewScale,
                  }}
                >
                  <AdCanvas ref={canvasRef} state={state} scale={previewScale} />
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
                <ExportButtons canvasRef={canvasRef} state={state} onPlatformChange={setPlatform} onExportingChange={setIsExporting} />
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
    </div>
  )
}

export default App
