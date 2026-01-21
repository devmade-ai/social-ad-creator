import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { useAdState } from './hooks/useAdState'
import { useDarkMode } from './hooks/useDarkMode'
import AdCanvas from './components/AdCanvas'
import TemplatesTab from './components/TemplatesTab'
import MediaTab from './components/MediaTab'
import ContentTab from './components/ContentTab'
import LayoutTab from './components/LayoutTab'
import StyleTab from './components/StyleTab'
import PlatformPreview from './components/PlatformPreview'
import ExportButtons from './components/ExportButtons'
import ErrorBoundary from './components/ErrorBoundary'
import { platforms } from './config/platforms'
import { fonts } from './config/fonts'

function App() {
  const canvasRef = useRef(null)
  const previewContainerRef = useRef(null)
  const [activeSection, setActiveSection] = useState('templates')
  const [imageAspectRatio, setImageAspectRatio] = useState(null)
  const [containerWidth, setContainerWidth] = useState(600)
  const [isExporting, setIsExporting] = useState(false)
  const { isDark, toggle: toggleDarkMode } = useDarkMode()

  const {
    state,
    setImage,
    setImageObjectFit,
    setImagePosition,
    setImageFilters,
    setLogo,
    setLogoPosition,
    setLogoSize,
    setOverlay,
    setText,
    setTextCells,
    setLayout,
    setTheme,
    setThemePreset,
    setFonts,
    setPadding,
    setPlatform,
    applyStylePreset,
    applyLayoutPreset,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useAdState()

  const platform = platforms.find((p) => p.id === state.platform) || platforms[0]

  // Calculate image aspect ratio when image changes
  useEffect(() => {
    if (!state.image) {
      setImageAspectRatio(null)
      return
    }

    const img = new Image()
    img.onload = () => {
      setImageAspectRatio(img.width / img.height)
    }
    img.src = state.image
  }, [state.image])

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
    { id: 'templates', label: 'Templates' },
    { id: 'media', label: 'Media' },
    { id: 'content', label: 'Content' },
    { id: 'layout', label: 'Layout' },
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
        <h1 className="text-lg font-display font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Social Ad Creator</h1>
        <div className="flex gap-1.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium transition-all ${
              canUndo
                ? 'bg-zinc-100 dark:bg-dark-subtle text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95'
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
                ? 'bg-zinc-100 dark:bg-dark-subtle text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95'
                : 'bg-zinc-50 dark:bg-dark-subtle/50 text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <span>↷</span>
            <span className="hidden sm:inline">Redo</span>
          </button>
          <button
            onClick={toggleDarkMode}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 font-medium bg-zinc-100 dark:bg-dark-subtle text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-dark-elevated active:scale-95 transition-all"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
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
                      : 'bg-zinc-100 dark:bg-dark-subtle text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-dark-elevated hover:text-zinc-800 dark:hover:text-zinc-100'
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
                  />
                )}
              </ErrorBoundary>

              <ErrorBoundary title="Media error" message="Failed to load media controls.">
                {activeSection === 'media' && (
                  <MediaTab
                    image={state.image}
                    onImageChange={setImage}
                    objectFit={state.imageObjectFit}
                    onObjectFitChange={setImageObjectFit}
                    position={state.imagePosition}
                    onPositionChange={setImagePosition}
                    filters={state.imageFilters}
                    onFiltersChange={setImageFilters}
                    logo={state.logo}
                    onLogoChange={setLogo}
                    logoPosition={state.logoPosition}
                    onLogoPositionChange={setLogoPosition}
                    logoSize={state.logoSize}
                    onLogoSizeChange={setLogoSize}
                    layout={state.layout}
                    onLayoutChange={setLayout}
                    platform={state.platform}
                    theme={state.theme}
                    overlay={state.overlay}
                    onOverlayChange={setOverlay}
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
                    onThemeChange={setTheme}
                    onPresetChange={setThemePreset}
                    selectedFonts={state.fonts}
                    onFontsChange={setFonts}
                    layout={state.layout}
                    onLayoutChange={setLayout}
                    overlay={state.overlay}
                    platform={state.platform}
                    padding={state.padding}
                    onPaddingChange={setPadding}
                  />
                )}
              </ErrorBoundary>
            </div>
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 p-4 lg:p-5 space-y-4">
          <div className="bg-white dark:bg-dark-card rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-card p-4 lg:p-6">
            {/* Platform Selector */}
            <PlatformPreview selectedPlatform={state.platform} onPlatformChange={setPlatform} />

            {/* Canvas Preview */}
            <div
              ref={previewContainerRef}
              className="relative mt-5 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-dark-subtle dark:to-dark-page rounded-xl overflow-hidden flex items-center justify-center border border-zinc-200/50 dark:border-zinc-700/50"
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
    </div>
  )
}

export default App
