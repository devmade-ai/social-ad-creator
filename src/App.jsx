import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { useAdState } from './hooks/useAdState'
import AdCanvas from './components/AdCanvas'
import ImageUploader from './components/ImageUploader'
import TextEditor from './components/TextEditor'
import LayoutSelector from './components/LayoutSelector'
import ThemePicker from './components/ThemePicker'
import FontSelector from './components/FontSelector'
import PlatformPreview from './components/PlatformPreview'
import ExportButtons from './components/ExportButtons'
import { platforms } from './config/platforms'
import { fonts } from './config/fonts'

function App() {
  const canvasRef = useRef(null)
  const previewContainerRef = useRef(null)
  const [activeSection, setActiveSection] = useState('image')
  const [imageAspectRatio, setImageAspectRatio] = useState(null)
  const [containerWidth, setContainerWidth] = useState(600)

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
    setTextGroups,
    setLayout,
    setTheme,
    setThemePreset,
    setFonts,
    setPadding,
    setPlatform,
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

  const sections = [
    { id: 'image', label: 'Image' },
    { id: 'layout', label: 'Layout' },
    { id: 'text', label: 'Text' },
    { id: 'theme', label: 'Theme' },
    { id: 'fonts', label: 'Fonts' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Load fonts */}
      {fonts.map((font) => (
        <link key={font.id} rel="stylesheet" href={font.url} />
      ))}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Social Ad Creator</h1>
        <div className="flex gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`px-3 py-1.5 text-sm rounded flex items-center gap-1 ${
              canUndo
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <span>↶</span>
            <span className="hidden sm:inline">Undo</span>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`px-3 py-1.5 text-sm rounded flex items-center gap-1 ${
              canRedo
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <span>↷</span>
            <span className="hidden sm:inline">Redo</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar Controls */}
        <aside className="w-full lg:w-80 bg-white border-r border-gray-200 p-4 lg:min-h-[calc(100vh-57px)] lg:max-h-[calc(100vh-57px)] lg:overflow-y-auto">
          {/* Section Tabs */}
          <div className="flex flex-wrap gap-1 mb-4 pb-3 border-b border-gray-100">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="space-y-4">
            {activeSection === 'image' && (
              <ImageUploader
                image={state.image}
                onImageChange={setImage}
                objectFit={state.imageObjectFit}
                onObjectFitChange={setImageObjectFit}
                position={state.imagePosition}
                onPositionChange={setImagePosition}
                filters={state.imageFilters}
                onFiltersChange={setImageFilters}
                overlay={state.overlay}
                onOverlayChange={setOverlay}
                theme={state.theme}
                layout={state.layout}
                onLayoutChange={setLayout}
                onTextGroupsChange={setTextGroups}
                imageAspectRatio={imageAspectRatio}
                platform={state.platform}
                logo={state.logo}
                onLogoChange={setLogo}
                logoPosition={state.logoPosition}
                onLogoPositionChange={setLogoPosition}
                logoSize={state.logoSize}
                onLogoSizeChange={setLogoSize}
              />
            )}

            {activeSection === 'text' && (
              <TextEditor
                text={state.text}
                onTextChange={setText}
                theme={state.theme}
              />
            )}

            {activeSection === 'layout' && (
              <LayoutSelector
                layout={state.layout}
                onLayoutChange={setLayout}
                textGroups={state.textGroups}
                onTextGroupsChange={setTextGroups}
                text={state.text}
                onTextChange={setText}
                imageAspectRatio={imageAspectRatio}
                platform={state.platform}
                overlay={state.overlay}
                theme={state.theme}
                padding={state.padding}
                onPaddingChange={setPadding}
                imageObjectFit={state.imageObjectFit}
                onImageObjectFitChange={setImageObjectFit}
                imageFilters={state.imageFilters}
                onImageFiltersChange={setImageFilters}
              />
            )}

            {activeSection === 'theme' && (
              <ThemePicker
                theme={state.theme}
                onThemeChange={setTheme}
                onPresetChange={setThemePreset}
              />
            )}

            {activeSection === 'fonts' && (
              <FontSelector
                selectedFonts={state.fonts}
                onFontsChange={setFonts}
              />
            )}
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
            {/* Platform Selector */}
            <PlatformPreview
              selectedPlatform={state.platform}
              onPlatformChange={setPlatform}
            />

            {/* Canvas Preview */}
            <div
              ref={previewContainerRef}
              className="mt-4 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center"
              style={{
                minHeight: platform.height * previewScale + 40,
              }}
            >
              <div
                style={{
                  width: platform.width * previewScale,
                  height: platform.height * previewScale,
                }}
              >
                <AdCanvas
                  ref={canvasRef}
                  state={state}
                  scale={previewScale}
                />
              </div>
            </div>

            {/* Export Buttons */}
            <div className="mt-4">
              <ExportButtons
                canvasRef={canvasRef}
                state={state}
                onPlatformChange={setPlatform}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
