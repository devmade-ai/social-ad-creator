import { useRef, useMemo, useState, useEffect } from 'react'
import { useAdState } from './hooks/useAdState'
import AdCanvas from './components/AdCanvas'
import ImageUploader from './components/ImageUploader'
import LogoUploader from './components/LogoUploader'
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
  const [activeSection, setActiveSection] = useState('image')
  const [imageAspectRatio, setImageAspectRatio] = useState(null)

  const {
    state,
    setImage,
    setImageObjectFit,
    setImagePosition,
    setImageGrayscale,
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

  // Calculate scale to fit preview in container
  const previewScale = useMemo(() => {
    const maxWidth = 600
    const maxHeight = 500
    const scaleX = maxWidth / platform.width
    const scaleY = maxHeight / platform.height
    return Math.min(scaleX, scaleY, 1)
  }, [platform])

  const sections = [
    { id: 'image', label: 'Image' },
    { id: 'logo', label: 'Logo' },
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
                grayscale={state.imageGrayscale}
                onGrayscaleChange={setImageGrayscale}
                overlay={state.overlay}
                onOverlayChange={setOverlay}
                theme={state.theme}
                layout={state.layout}
                onLayoutChange={setLayout}
                onTextGroupsChange={setTextGroups}
                imageAspectRatio={imageAspectRatio}
                platform={state.platform}
              />
            )}

            {activeSection === 'logo' && (
              <LogoUploader
                logo={state.logo}
                onLogoChange={setLogo}
                position={state.logoPosition}
                onPositionChange={setLogoPosition}
                size={state.logoSize}
                onSizeChange={setLogoSize}
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
                imageAspectRatio={imageAspectRatio}
                platform={state.platform}
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
