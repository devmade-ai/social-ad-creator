import { useCallback, useRef, useState, memo, useMemo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import { sampleImages } from '../config/sampleImages'
import { platforms } from '../config/platforms'
import { overlayTypes } from '../config/layouts'
import { neutralColors } from '../config/themes'

// Theme color options for overlay
const themeColorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
]

// AI Image Prompt Helper options
const styleOptions = [
  { id: 'photorealistic', name: 'Photo', description: 'photorealistic photograph' },
  { id: 'cinematic', name: 'Cinematic', description: 'cinematic film still' },
  { id: 'editorial', name: 'Editorial', description: 'editorial photography' },
  { id: 'minimal', name: 'Minimal', description: 'minimalist clean image' },
  { id: 'abstract', name: 'Abstract', description: 'abstract artistic' },
  { id: 'illustration', name: 'Illustration', description: 'digital illustration' },
  { id: '3d', name: '3D', description: '3D rendered' },
]

const moodOptions = [
  { id: 'dark', name: 'Dark', description: 'dark moody lighting, deep shadows' },
  { id: 'light', name: 'Light', description: 'bright airy lighting, soft highlights' },
  { id: 'neutral', name: 'Neutral', description: 'balanced neutral lighting' },
  { id: 'dramatic', name: 'Dramatic', description: 'dramatic high-contrast lighting' },
  { id: 'soft', name: 'Soft', description: 'soft diffused lighting' },
  { id: 'warm', name: 'Warm', description: 'warm golden tones' },
  { id: 'cool', name: 'Cool', description: 'cool blue tones' },
]

const purposeOptions = [
  { id: 'hero', name: 'Hero Image', description: 'as a featured hero image with clear focal point' },
  { id: 'background', name: 'Background', description: 'as a background image suitable for text overlay, with subtle details and low contrast areas' },
]

const orientationOptions = [
  { id: 'landscape', name: 'Landscape', description: 'landscape orientation (wider than tall)' },
  { id: 'portrait', name: 'Portrait', description: 'portrait orientation (taller than wide)' },
  { id: 'square', name: 'Square', description: 'square orientation (1:1 aspect ratio)' },
]

// Simple cell grid for image cell selection
function ImageCellGrid({ layout, imageCell, onSelectCell, platform }) {
  const { type, structure } = layout
  const isFullbleed = type === 'fullbleed'
  const isRows = type === 'rows'

  const normalizedStructure =
    isFullbleed || !structure || structure.length === 0
      ? [{ size: 100, subdivisions: 1, subSizes: [100] }]
      : structure

  const platformData = platforms.find((p) => p.id === platform) || platforms[0]
  const aspectRatio = platformData.width / platformData.height

  let cellIndex = 0

  return (
    <div
      className="rounded overflow-hidden border border-gray-300 dark:border-gray-600 flex"
      style={{
        aspectRatio,
        maxWidth: '120px',
        width: '100%',
        flexDirection: isRows || isFullbleed ? 'column' : 'row',
      }}
    >
      {normalizedStructure.map((section, sectionIndex) => {
        const sectionSize = section.size || 100 / normalizedStructure.length
        const subdivisions = section.subdivisions || 1
        const subSizes = section.subSizes || Array(subdivisions).fill(100 / subdivisions)

        const sectionCells = []
        for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
          const currentCellIndex = cellIndex
          const isImage = currentCellIndex === imageCell
          cellIndex++

          sectionCells.push(
            <button
              key={`cell-${currentCellIndex}`}
              onClick={() => onSelectCell(currentCellIndex)}
              className={`flex items-center justify-center text-xs font-medium transition-colors ${
                isImage
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}
              style={{ flex: `0 0 ${subSizes[subIndex]}%` }}
            >
              {isImage ? '📷' : currentCellIndex + 1}
            </button>
          )
        }

        return (
          <div
            key={`section-${sectionIndex}`}
            className="flex"
            style={{
              flex: `0 0 ${sectionSize}%`,
              flexDirection: isRows ? 'row' : 'column',
            }}
          >
            {sectionCells}
          </div>
        )
      })}
    </div>
  )
}

const logoPositionOptions = [
  { id: 'top-left', name: 'Top Left' },
  { id: 'top-right', name: 'Top Right' },
  { id: 'bottom-left', name: 'Bot Left' },
  { id: 'bottom-right', name: 'Bot Right' },
  { id: 'center', name: 'Center' },
]

const logoSizeOptions = [
  { id: 0.08, name: 'XS' },
  { id: 0.12, name: 'S' },
  { id: 0.15, name: 'M' },
  { id: 0.2, name: 'L' },
  { id: 0.25, name: 'XL' },
]

// AI Image Prompt Helper Component
function AIPromptHelper({ theme }) {
  const [style, setStyle] = useState('photorealistic')
  const [mood, setMood] = useState('neutral')
  const [purpose, setPurpose] = useState('background')
  const [orientation, setOrientation] = useState('landscape')
  const [useThemeColors, setUseThemeColors] = useState(false)
  const [customColors, setCustomColors] = useState('')
  const [context, setContext] = useState('')
  const [copied, setCopied] = useState(false)

  // Generate the prompt
  const generatedPrompt = useMemo(() => {
    const parts = []

    // Style
    const styleData = styleOptions.find((s) => s.id === style)
    if (styleData) parts.push(styleData.description)

    // Context (subject)
    if (context.trim()) {
      parts.push(context.trim())
    }

    // Purpose
    const purposeData = purposeOptions.find((p) => p.id === purpose)
    if (purposeData) parts.push(purposeData.description)

    // Mood/Lighting
    const moodData = moodOptions.find((m) => m.id === mood)
    if (moodData) parts.push(moodData.description)

    // Colors
    if (useThemeColors && theme) {
      parts.push(`color palette: ${theme.primary} (primary), ${theme.secondary} (secondary), ${theme.accent} (accent)`)
    } else if (customColors.trim()) {
      parts.push(`color palette: ${customColors.trim()}`)
    }

    // Orientation
    const orientationData = orientationOptions.find((o) => o.id === orientation)
    if (orientationData) parts.push(orientationData.description)

    // Constants - always include
    parts.push('do not include any text, words, letters, numbers, or typography')
    parts.push('do not include any overlays, borders, watermarks, or graphic elements')

    return parts.join(', ')
  }, [style, mood, purpose, orientation, useThemeColors, customColors, context, theme])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generatedPrompt])

  return (
    <div className="space-y-3">
      {/* Subject/Context */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Subject / Context</label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g., coffee shop interior, mountain landscape, abstract geometric shapes..."
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      {/* Style */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Style</label>
        <div className="flex flex-wrap gap-1">
          {styleOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setStyle(opt.id)}
              className={`px-2 py-1 text-xs rounded-lg font-medium ${
                style === opt.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Mood / Lighting</label>
        <div className="flex flex-wrap gap-1">
          {moodOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setMood(opt.id)}
              className={`px-2 py-1 text-xs rounded-lg font-medium ${
                mood === opt.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Purpose */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Image Purpose</label>
        <div className="flex gap-1.5">
          {purposeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPurpose(opt.id)}
              className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
                purpose === opt.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          {purpose === 'hero' ? 'Clean focal point for featured images' : 'Subtle details, good for text overlays'}
        </p>
      </div>

      {/* Orientation */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Orientation</label>
        <div className="flex gap-1">
          {orientationOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setOrientation(opt.id)}
              className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
                orientation === opt.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Colors (optional)</label>
        <div className="flex gap-1.5 mb-2">
          <button
            onClick={() => setUseThemeColors(true)}
            className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
              useThemeColors
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Use Theme
          </button>
          <button
            onClick={() => setUseThemeColors(false)}
            className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
              !useThemeColors
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Custom
          </button>
        </div>
        {useThemeColors ? (
          theme ? (
            <div className="flex gap-2 items-center text-xs text-gray-500 dark:text-gray-400">
              <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: theme.primary }} />
              <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: theme.secondary }} />
              <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: theme.accent }} />
              <span>From Style tab</span>
            </div>
          ) : (
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              Select a theme in the Style tab, or switch to Custom
            </p>
          )
        ) : (
          <input
            type="text"
            value={customColors}
            onChange={(e) => setCustomColors(e.target.value)}
            placeholder="e.g., blue and orange, muted earth tones..."
            className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>

      {/* Generated Prompt */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Generated Prompt</label>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">Updates as you change options</span>
        </div>
        <div className="relative">
          <div className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 max-h-24 overflow-y-auto">
            {generatedPrompt}
          </div>
          <button
            onClick={handleCopy}
            className={`absolute top-1.5 right-1.5 px-2 py-1 text-[10px] rounded font-medium transition-colors ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(function MediaTab({
  image,
  onImageChange,
  objectFit,
  onObjectFitChange,
  position,
  onPositionChange,
  filters,
  onFiltersChange,
  // Logo props
  logo,
  onLogoChange,
  logoPosition,
  onLogoPositionChange,
  logoSize,
  onLogoSizeChange,
  // Layout props for image cell
  layout,
  onLayoutChange,
  platform,
  theme,
  // Overlay props (global overlay for image)
  overlay,
  onOverlayChange,
}) {
  const fileInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const [loadingSample, setLoadingSample] = useState(null)
  const [sampleError, setSampleError] = useState(null)

  // Load a sample image
  const loadSampleImage = useCallback(
    async (sample) => {
      setLoadingSample(sample.id)
      setSampleError(null)
      try {
        const response = await fetch(import.meta.env.BASE_URL + sample.file.slice(1))
        if (!response.ok) throw new Error('Image not found')
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onload = (event) => {
          onImageChange(event.target.result)
          setLoadingSample(null)
        }
        reader.onerror = () => {
          setSampleError('Failed to load image')
          setLoadingSample(null)
        }
        reader.readAsDataURL(blob)
      } catch {
        setSampleError(`Add ${sample.name} to public/samples/`)
        setLoadingSample(null)
      }
    },
    [onImageChange]
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          onImageChange(event.target.result)
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageChange]
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          onImageChange(event.target.result)
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageChange]
  )

  const handleRemove = useCallback(() => {
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onImageChange])

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Media</h3>

      {/* AI Image Prompt Helper Section - collapsed by default */}
      <CollapsibleSection title="AI Image Prompt" defaultExpanded={false}>
        <AIPromptHelper theme={theme} />
      </CollapsibleSection>

      {/* Background Image Section */}
      <CollapsibleSection title="Background Image" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Upload area */}
          <div
            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            {image ? (
              <div className="space-y-2">
                <img src={image} alt="Preview" className="max-h-24 mx-auto rounded-lg shadow-sm" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Click or drop to replace</p>
              </div>
            ) : (
              <div className="py-2">
                <svg
                  className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Drop image or click to upload</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </div>

          {/* Remove button */}
          {image && (
            <button
              onClick={handleRemove}
              className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg transition-colors font-medium"
            >
              Remove Image
            </button>
          )}

          {/* Sample Images */}
          {!image && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Or try a sample</label>
              <div className="grid grid-cols-5 gap-1.5">
                {sampleImages.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => loadSampleImage(sample)}
                    disabled={loadingSample === sample.id}
                    title={sample.name}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      loadingSample === sample.id
                        ? 'border-blue-400 opacity-50 scale-95'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-sm active:scale-95'
                    }`}
                  >
                    <img
                      src={import.meta.env.BASE_URL + sample.file.slice(1)}
                      alt={sample.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div
                      className="w-full h-full bg-gray-100 dark:bg-gray-800 items-center justify-center text-gray-400 text-[9px] text-center p-0.5"
                      style={{ display: 'none' }}
                    >
                      {sample.name}
                    </div>
                  </button>
                ))}
              </div>
              {sampleError && <p className="text-xs text-red-600 dark:text-red-400">{sampleError}</p>}
            </div>
          )}

          {/* Image Settings - only when image exists */}
          {image && (
            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              {/* Object Fit */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Fit</label>
                <div className="flex gap-2">
                  {['cover', 'contain'].map((fit) => (
                    <button
                      key={fit}
                      onClick={() => onObjectFitChange(fit)}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg capitalize font-medium ${
                        objectFit === fit
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Position</label>
                {/* Quick presets */}
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { x: 0, y: 0, label: '↖' },
                    { x: 50, y: 0, label: '↑' },
                    { x: 100, y: 0, label: '↗' },
                    { x: 0, y: 50, label: '←' },
                    { x: 50, y: 50, label: '•' },
                    { x: 100, y: 50, label: '→' },
                    { x: 0, y: 100, label: '↙' },
                    { x: 50, y: 100, label: '↓' },
                    { x: 100, y: 100, label: '↘' },
                  ].map((preset) => (
                    <button
                      key={`${preset.x}-${preset.y}`}
                      onClick={() => onPositionChange({ x: preset.x, y: preset.y })}
                      className={`px-2 py-1.5 text-sm rounded font-medium ${
                        position.x === preset.x && position.y === preset.y
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {/* Fine-tune sliders */}
                <div className="space-y-2 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">Horizontal (X)</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{position.x}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={position.x}
                      onChange={(e) => onPositionChange({ x: parseInt(e.target.value, 10) })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">Vertical (Y)</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{position.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={position.y}
                      onChange={(e) => onPositionChange({ y: parseInt(e.target.value, 10) })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Grayscale toggle */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Grayscale</label>
                <button
                  onClick={() => onFiltersChange({ grayscale: filters.grayscale > 0 ? 0 : 100 })}
                  className={`w-full px-3 py-2 text-sm rounded-lg font-medium ${
                    filters.grayscale > 0
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {filters.grayscale > 0 ? 'On' : 'Off'}
                </button>
              </div>

              {/* Image Cell - only show for multi-cell layouts */}
              {layout && layout.type !== 'fullbleed' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Cell</label>
                  <div className="flex items-center gap-3">
                    <ImageCellGrid
                      layout={layout}
                      imageCell={layout.imageCell || 0}
                      onSelectCell={(idx) => onLayoutChange({ imageCell: idx })}
                      platform={platform}
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Cell {(layout.imageCell || 0) + 1}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Image Overlay Section - only when image exists */}
      {image && (
        <CollapsibleSection title="Image Overlay" defaultExpanded={false}>
          <div className="space-y-3">
            {/* On/Off Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Overlay</label>
              <button
                onClick={() => onOverlayChange({ opacity: (overlay?.opacity ?? 0) > 0 ? 0 : 50 })}
                className={`w-full px-3 py-2 text-sm rounded-lg font-medium ${
                  (overlay?.opacity ?? 0) > 0
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {(overlay?.opacity ?? 0) > 0 ? 'On' : 'Off'}
              </button>
            </div>

            {/* Only show controls when overlay is enabled */}
            {(overlay?.opacity ?? 0) > 0 && (
              <>
                {/* Overlay Type - organized by category */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Type</label>
                  {/* Basic & Linear Gradients */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Basic & Gradients</span>
                    <div className="grid grid-cols-5 gap-1">
                      {overlayTypes.filter(t => t.category === 'basic' || t.category === 'linear').map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onOverlayChange({ type: overlay?.type === t.id ? null : t.id })}
                          className={`px-1.5 py-1.5 text-[10px] rounded-lg font-medium truncate ${
                            overlay?.type === t.id
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                          title={t.name}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Radial */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Radial</span>
                    <div className="grid grid-cols-4 gap-1">
                      {overlayTypes.filter(t => t.category === 'radial').map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onOverlayChange({ type: overlay?.type === t.id ? null : t.id })}
                          className={`px-1.5 py-1.5 text-[10px] rounded-lg font-medium truncate ${
                            overlay?.type === t.id
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                          title={t.name}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Effects & Textures */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Effects</span>
                    <div className="grid grid-cols-4 gap-1">
                      {overlayTypes.filter(t => t.category === 'effect' || t.category === 'texture').map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onOverlayChange({ type: overlay?.type === t.id ? null : t.id })}
                          className={`px-1.5 py-1.5 text-[10px] rounded-lg font-medium truncate ${
                            overlay?.type === t.id
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                          title={t.name}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Blend Modes */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Blend Modes</span>
                    <div className="grid grid-cols-4 gap-1">
                      {overlayTypes.filter(t => t.category === 'blend').map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onOverlayChange({ type: overlay?.type === t.id ? null : t.id })}
                          className={`px-1.5 py-1.5 text-[10px] rounded-lg font-medium truncate ${
                            overlay?.type === t.id
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                          title={t.name}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Overlay Color */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {/* Theme colors */}
                    {themeColorOptions.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onOverlayChange({ color: overlay?.color === c.id ? null : c.id })}
                        className={`px-2.5 py-1.5 text-xs rounded-lg font-medium ${
                          overlay?.color === c.id
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: theme?.[c.id] || '#000' }}
                        />
                        {c.name}
                      </button>
                    ))}
                    {/* Neutral colors */}
                    {neutralColors.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onOverlayChange({ color: overlay?.color === c.id ? null : c.id })}
                        className={`px-2.5 py-1.5 text-xs rounded-lg font-medium ${
                          overlay?.color === c.id
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Overlay Opacity */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Opacity</label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {overlay?.opacity ?? 0}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={overlay?.opacity ?? 0}
                    onChange={(e) => onOverlayChange({ opacity: parseInt(e.target.value, 10) })}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Advanced Filters Section - only when image exists */}
      {image && (
        <CollapsibleSection title="Advanced Filters" defaultExpanded={false}>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Grayscale</label>
                <span className="text-xs text-gray-500 dark:text-gray-400">{filters.grayscale}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={filters.grayscale}
                onChange={(e) => onFiltersChange({ grayscale: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Sepia</label>
                <span className="text-xs text-gray-500 dark:text-gray-400">{filters.sepia}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={filters.sepia}
                onChange={(e) => onFiltersChange({ sepia: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Blur</label>
                <span className="text-xs text-gray-500 dark:text-gray-400">{filters.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.blur}
                onChange={(e) => onFiltersChange({ blur: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Contrast</label>
                <span className="text-xs text-gray-500 dark:text-gray-400">{filters.contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="5"
                value={filters.contrast}
                onChange={(e) => onFiltersChange({ contrast: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Brightness</label>
                <span className="text-xs text-gray-500 dark:text-gray-400">{filters.brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="5"
                value={filters.brightness}
                onChange={(e) => onFiltersChange({ brightness: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Logo Section */}
      {onLogoChange && (
        <CollapsibleSection title="Logo" defaultExpanded={false}>
          {!logo ? (
            <div
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all"
              onClick={() => logoInputRef.current?.click()}
            >
              <svg
                className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload logo</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Optional</p>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader()
                    reader.onload = (event) => onLogoChange(event.target.result)
                    reader.readAsDataURL(file)
                  }
                }}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Logo preview */}
              <div className="relative bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <img src={logo} alt="Logo" className="max-h-16 mx-auto object-contain" />
                <button
                  onClick={() => {
                    onLogoChange(null)
                    if (logoInputRef.current) logoInputRef.current.value = ''
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-sm"
                >
                  ×
                </button>
              </div>

              {/* Logo position */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Position</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {logoPositionOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onLogoPositionChange(opt.id)}
                      className={`px-2 py-1.5 text-xs rounded-lg font-medium ${
                        logoPosition === opt.id
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo size */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Size</label>
                <div className="flex gap-1.5">
                  {logoSizeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onLogoSizeChange(opt.id)}
                      className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
                        logoSize === opt.id
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CollapsibleSection>
      )}
    </div>
  )
})
