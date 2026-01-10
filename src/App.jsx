import { useRef, useMemo, useState } from 'react'
import { useAdState } from './hooks/useAdState'
import AdCanvas from './components/AdCanvas'
import ImageUploader from './components/ImageUploader'
import OverlayControls from './components/OverlayControls'
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

  const {
    state,
    setImage,
    setImageObjectFit,
    setImagePosition,
    setImageGrayscale,
    setOverlay,
    setText,
    setLayout,
    setTheme,
    setThemePreset,
    setFonts,
    setPlatform,
  } = useAdState()

  const platform = platforms.find((p) => p.id === state.platform) || platforms[0]

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
    { id: 'layout', label: 'Layout' },
    { id: 'overlay', label: 'Overlay' },
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
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-800">Social Ad Creator</h1>
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
              />
            )}

            {activeSection === 'overlay' && (
              <OverlayControls
                overlay={state.overlay}
                onOverlayChange={setOverlay}
                theme={state.theme}
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
                selectedLayout={state.layout}
                onLayoutChange={setLayout}
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
