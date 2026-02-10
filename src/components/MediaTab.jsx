import { useCallback, useRef, useState, memo, useMemo, useEffect } from 'react'
import CollapsibleSection from './CollapsibleSection'
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

// Cell grid for image assignment
function CellGrid({ layout, cellImages, selectedCell, onSelectCell, platform, highlightImageId }) {
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
      className="rounded overflow-hidden border border-ui-border-strong flex"
      style={{
        aspectRatio,
        maxWidth: '140px',
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
          const cellImageId = cellImages && cellImages[currentCellIndex]
          const hasImage = !!cellImageId
          const isSelected = selectedCell === currentCellIndex
          // When highlightImageId is provided, highlight cells with that image
          const isHighlighted = highlightImageId && cellImageId === highlightImageId
          cellIndex++

          sectionCells.push(
            <button
              key={`cell-${currentCellIndex}`}
              onClick={() => onSelectCell(currentCellIndex)}
              className={`flex items-center justify-center text-xs font-medium transition-colors ${
                isHighlighted
                  ? 'bg-primary hover:bg-primary-hover text-white ring-2 ring-primary ring-offset-1'
                  : isSelected
                  ? 'bg-primary hover:bg-primary-hover text-white ring-2 ring-primary ring-offset-1'
                  : hasImage
                  ? 'bg-violet-200 dark:bg-violet-800 hover:bg-violet-300 dark:hover:bg-violet-700 text-violet-700 dark:text-violet-200'
                  : 'bg-ui-surface-inset hover:bg-ui-surface-hover text-ui-text-subtle'
              }`}
              style={{ flex: `0 0 ${subSizes[subIndex]}%` }}
            >
              {hasImage ? '📷' : currentCellIndex + 1}
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
        <label className="block text-xs font-medium text-ui-text-muted">Subject / Context</label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g., coffee shop interior, mountain landscape, abstract geometric shapes..."
          className="w-full px-3 py-2 text-sm text-ui-text bg-white dark:bg-dark-subtle placeholder-zinc-400 dark:placeholder-zinc-500 border border-ui-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      {/* Style */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-ui-text-muted">Style</label>
        <div className="flex flex-wrap gap-1">
          {styleOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setStyle(opt.id)}
              className={`px-2 py-1 text-xs rounded-lg font-medium ${
                style === opt.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-ui-text-muted">Mood / Lighting</label>
        <div className="flex flex-wrap gap-1">
          {moodOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setMood(opt.id)}
              className={`px-2 py-1 text-xs rounded-lg font-medium ${
                mood === opt.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Purpose */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-ui-text-muted">Image Purpose</label>
        <div className="flex gap-1.5">
          {purposeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPurpose(opt.id)}
              className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
                purpose === opt.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-ui-text-faint">
          {purpose === 'hero' ? 'Clean focal point for featured images' : 'Subtle details, good for text overlays'}
        </p>
      </div>

      {/* Orientation */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-ui-text-muted">Orientation</label>
        <div className="flex gap-1">
          {orientationOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setOrientation(opt.id)}
              className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
                orientation === opt.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-ui-text-muted">Colors (optional)</label>
        <div className="flex gap-1.5 mb-2">
          <button
            onClick={() => setUseThemeColors(true)}
            className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
              useThemeColors
                ? 'bg-primary text-white shadow-sm'
                : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
            }`}
          >
            Use Theme
          </button>
          <button
            onClick={() => setUseThemeColors(false)}
            className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
              !useThemeColors
                ? 'bg-primary text-white shadow-sm'
                : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
            }`}
          >
            Custom
          </button>
        </div>
        {useThemeColors ? (
          theme ? (
            <div className="flex gap-2 items-center text-xs text-ui-text-subtle">
              <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: theme.primary }} />
              <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: theme.secondary }} />
              <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: theme.accent }} />
              <span>From Style tab</span>
            </div>
          ) : (
            <p className="text-[10px] text-ui-text-faint">
              Select a theme in the Style tab, or switch to Custom
            </p>
          )
        ) : (
          <input
            type="text"
            value={customColors}
            onChange={(e) => setCustomColors(e.target.value)}
            placeholder="e.g., blue and orange, muted earth tones..."
            className="w-full px-3 py-1.5 text-sm text-ui-text bg-white dark:bg-dark-subtle placeholder-zinc-400 dark:placeholder-zinc-500 border border-ui-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        )}
      </div>

      {/* Generated Prompt */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-medium text-ui-text-muted">Generated Prompt</label>
          <span className="text-[10px] text-ui-text-faint">Updates as you change options</span>
        </div>
        <div className="relative">
          <div className="w-full px-3 py-2 text-xs bg-ui-surface-elevated border border-ui-border rounded-lg text-ui-text-muted max-h-24 overflow-y-auto">
            {generatedPrompt}
          </div>
          <button
            onClick={handleCopy}
            className={`absolute top-1.5 right-1.5 px-2 py-1 text-[10px] rounded font-medium transition-colors ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-primary text-white hover:bg-primary-hover'
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
  // Image pool
  images = [],
  onAddImage,
  onRemoveImage,
  onUpdateImage,
  onUpdateImageFilters,
  onUpdateImagePosition,
  onUpdateImageOverlay,
  // Cell assignments
  cellImages = {},
  onSetCellImage,
  // Logo props
  logo,
  onLogoChange,
  logoPosition,
  onLogoPositionChange,
  logoSize,
  onLogoSizeChange,
  // Layout props
  layout,
  platform,
  theme,
}) {
  const fileInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const [selectedImageId, setSelectedImageId] = useState(null) // Currently selected image for editing

  // Get selected image data
  const selectedImage = images.find((img) => img.id === selectedImageId) || null

  // Auto-select first image when images are added
  useEffect(() => {
    if (images.length > 0 && !selectedImage) {
      setSelectedImageId(images[0].id)
    } else if (images.length === 0) {
      setSelectedImageId(null)
    }
  }, [images, selectedImage])

  // Get total cell count
  const totalCells = useMemo(() => {
    const structure = layout?.structure || [{ size: 100, subdivisions: 1, subSizes: [100] }]
    let count = 0
    structure.forEach((section) => {
      count += section.subdivisions || 1
    })
    return count
  }, [layout])

  // Find which cells this image is assigned to
  const getImageCells = useCallback((imageId) => {
    return Object.entries(cellImages)
      .filter(([, id]) => id === imageId)
      .map(([cellIdx]) => parseInt(cellIdx))
  }, [cellImages])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files || [])
      let firstImageId = null
      files.forEach((file) => {
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const imageId = onAddImage(event.target.result, file.name)
            if (!firstImageId) {
              firstImageId = imageId
              setSelectedImageId(imageId)
            }
          }
          reader.readAsDataURL(file)
        }
      })
    },
    [onAddImage]
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleFileSelect = useCallback(
    (e) => {
      const files = Array.from(e.target.files || [])
      let firstImageId = null
      files.forEach((file) => {
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const imageId = onAddImage(event.target.result, file.name)
            if (!firstImageId) {
              firstImageId = imageId
              setSelectedImageId(imageId)
            }
          }
          reader.readAsDataURL(file)
        }
      })
    },
    [onAddImage]
  )

  // Toggle assignment of selected image to a cell
  const toggleCellAssignment = useCallback(
    (cellIndex) => {
      if (!selectedImageId) return
      const currentImageId = cellImages[cellIndex]
      if (currentImageId === selectedImageId) {
        // Remove assignment
        onSetCellImage(cellIndex, null)
      } else {
        // Assign selected image to this cell
        onSetCellImage(cellIndex, selectedImageId)
      }
    },
    [selectedImageId, cellImages, onSetCellImage]
  )

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-ui-text">Media</h3>

      {/* AI Image Prompt Helper Section - collapsed by default */}
      <CollapsibleSection title="AI Image Prompt" defaultExpanded={false}>
        <AIPromptHelper theme={theme} />
      </CollapsibleSection>

      {/* Images Section */}
      <CollapsibleSection title="Images" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Upload area - first, to build library */}
          <div
            className="border-2 border-dashed border-ui-border rounded-xl p-4 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 dark:hover:bg-violet-900/30 transition-all"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="py-2">
              <svg
                className="w-8 h-8 mx-auto text-ui-text-faint mb-2"
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
              <p className="text-sm text-ui-text-muted font-medium">Drop image or click to upload</p>
              <p className="text-xs text-ui-text-faint mt-1">
                {images.length === 0 ? 'Add images to your library' : `${images.length} image${images.length !== 1 ? 's' : ''} in library`}
              </p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
          </div>

          {/* Image Library - click to select an image */}
          {images.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-ui-text-muted">
                Select Image <span className="text-ui-text-faint font-normal">(click to edit)</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {images.map((img) => {
                  const isSelected = selectedImageId === img.id
                  const assignedCells = getImageCells(img.id)

                  return (
                    <div key={img.id} className="relative group">
                      <button
                        onClick={() => setSelectedImageId(img.id)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all w-full ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/30'
                            : assignedCells.length > 0
                            ? 'border-violet-300 dark:border-violet-600 hover:border-violet-400'
                            : 'border-ui-border hover:border-violet-400'
                        }`}
                        title={isSelected ? 'Selected' : 'Click to select'}
                      >
                        <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                      </button>
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveImage(img.id)
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                        title="Remove from library"
                      >
                        ×
                      </button>
                      {/* Assignment indicator */}
                      {assignedCells.length > 0 && (
                        <div className="absolute bottom-0.5 left-0.5 bg-violet-600 text-white text-[8px] px-1 rounded">
                          {assignedCells.length > 2 ? `${assignedCells.length} cells` : assignedCells.map(c => c + 1).join(', ')}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Selected Image Settings */}
          {selectedImage && (
            <div className="space-y-3 pt-3 border-t border-ui-border-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ui-text-muted">
                  {selectedImage.name}
                </span>
              </div>

              {/* Assign to Cells - primary action after selection */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-ui-text-muted">Assign to Cells</label>
                <div className="flex items-center gap-3">
                  <CellGrid
                    layout={layout}
                    cellImages={cellImages}
                    selectedCell={null}
                    onSelectCell={toggleCellAssignment}
                    platform={platform}
                    highlightImageId={selectedImageId}
                  />
                  <div className="text-xs text-ui-text-subtle">
                    <div>Click cells to assign/unassign</div>
                    <div className="text-violet-600 dark:text-violet-400">
                      {getImageCells(selectedImageId).length > 0
                        ? `In cells: ${getImageCells(selectedImageId).map(c => c + 1).join(', ')}`
                        : 'Not assigned'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Object Fit */}
              <div className="space-y-2 pt-3 border-t border-ui-border-subtle">
                <label className="block text-xs font-medium text-ui-text-muted">Fit</label>
                <div className="flex gap-2">
                  {['cover', 'contain'].map((fit) => (
                    <button
                      key={fit}
                      onClick={() => onUpdateImage(selectedImageId, { fit })}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg capitalize font-medium ${
                        selectedImage.fit === fit
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-ui-text-muted">Position</label>
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
                      onClick={() => onUpdateImagePosition(selectedImageId, { x: preset.x, y: preset.y })}
                      className={`px-2 py-1.5 text-sm rounded font-medium ${
                        selectedImage.position?.x === preset.x && selectedImage.position?.y === preset.y
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {/* Fine-grained position sliders */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ui-text-muted w-6">X</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedImage.position?.x ?? 50}
                      onChange={(e) => onUpdateImagePosition(selectedImageId, { x: parseInt(e.target.value) })}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-xs text-ui-text-muted w-8 text-right">{selectedImage.position?.x ?? 50}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ui-text-muted w-6">Y</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedImage.position?.y ?? 50}
                      onChange={(e) => onUpdateImagePosition(selectedImageId, { y: parseInt(e.target.value) })}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-xs text-ui-text-muted w-8 text-right">{selectedImage.position?.y ?? 50}%</span>
                  </div>
                </div>
              </div>

              {/* Grayscale toggle */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-ui-text-muted">Grayscale</label>
                <button
                  onClick={() =>
                    onUpdateImageFilters(selectedImageId, {
                      grayscale: (selectedImage.filters?.grayscale || 0) > 0 ? 0 : 100,
                    })
                  }
                  className={`w-full px-3 py-2 text-sm rounded-lg font-medium ${
                    (selectedImage.filters?.grayscale || 0) > 0
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                  }`}
                >
                  {(selectedImage.filters?.grayscale || 0) > 0 ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Image Overlay Section - only when image is selected */}
      {selectedImage && (
        <CollapsibleSection title="Image Overlay" defaultExpanded={false}>
          <div className="space-y-3">
            <p className="text-xs text-ui-text-subtle">
              Overlay for {selectedImage.name}
            </p>

            {/* On/Off Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-ui-text-muted">Overlay</label>
              <button
                onClick={() => onUpdateImageOverlay(selectedImageId, { opacity: (selectedImage.overlay?.opacity ?? 0) > 0 ? 0 : 50 })}
                className={`w-full px-3 py-2 text-sm rounded-lg font-medium ${
                  (selectedImage.overlay?.opacity ?? 0) > 0
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                }`}
              >
                {(selectedImage.overlay?.opacity ?? 0) > 0 ? 'On' : 'Off'}
              </button>
            </div>

            {/* Only show controls when overlay is enabled */}
            {(selectedImage.overlay?.opacity ?? 0) > 0 && (
              <>
                {/* Overlay Type - organized by category */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-ui-text-muted">Type</label>
                  {/* Basic & Linear Gradients */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-ui-text-faint uppercase tracking-wide">Basic & Gradients</span>
                    <div className="grid grid-cols-5 gap-1">
                      {overlayTypes.filter(t => t.category === 'basic' || t.category === 'linear').map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onUpdateImageOverlay(selectedImageId, { type: t.id })}
                          className={`px-1.5 py-1.5 text-[10px] rounded-lg font-medium truncate ${
                            selectedImage.overlay?.type === t.id
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
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
                    <span className="text-[10px] text-ui-text-faint uppercase tracking-wide">Radial</span>
                    <div className="grid grid-cols-4 gap-1">
                      {overlayTypes.filter(t => t.category === 'radial').map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onUpdateImageOverlay(selectedImageId, { type: t.id })}
                          className={`px-1.5 py-1.5 text-[10px] rounded-lg font-medium truncate ${
                            selectedImage.overlay?.type === t.id
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
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
                    <span className="text-[10px] text-ui-text-faint uppercase tracking-wide">Effects</span>
                    <div className="grid grid-cols-4 gap-1">
                      {overlayTypes.filter(t => t.category === 'effect' || t.category === 'texture').map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onUpdateImageOverlay(selectedImageId, { type: t.id })}
                          className={`px-1.5 py-1.5 text-[10px] rounded-lg font-medium truncate ${
                            selectedImage.overlay?.type === t.id
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
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
                    <span className="text-[10px] text-ui-text-faint uppercase tracking-wide">Blend Modes</span>
                    <div className="grid grid-cols-4 gap-1">
                      {overlayTypes.filter(t => t.category === 'blend').map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onUpdateImageOverlay(selectedImageId, { type: t.id })}
                          className={`px-1.5 py-1.5 text-[10px] rounded-lg font-medium truncate ${
                            selectedImage.overlay?.type === t.id
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
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
                  <label className="block text-xs font-medium text-ui-text-muted">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {/* Theme colors */}
                    {themeColorOptions.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onUpdateImageOverlay(selectedImageId, { color: c.id })}
                        className={`px-2.5 py-1.5 text-xs rounded-lg font-medium ${
                          selectedImage.overlay?.color === c.id
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                        }`}
                      >
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 border border-ui-border-strong"
                          style={{ backgroundColor: theme?.[c.id] || '#000' }}
                        />
                        {c.name}
                      </button>
                    ))}
                    {/* Neutral colors */}
                    {neutralColors.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onUpdateImageOverlay(selectedImageId, { color: c.id })}
                        className={`px-2.5 py-1.5 text-xs rounded-lg font-medium ${
                          selectedImage.overlay?.color === c.id
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                        }`}
                      >
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 border border-ui-border-strong"
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
                    <label className="text-xs font-medium text-ui-text-muted">Opacity</label>
                    <span className="text-xs text-ui-text-subtle">
                      {selectedImage.overlay?.opacity ?? 0}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={selectedImage.overlay?.opacity ?? 0}
                    onChange={(e) => onUpdateImageOverlay(selectedImageId, { opacity: parseInt(e.target.value, 10) })}
                    className="w-full h-2 bg-ui-surface-hover rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Advanced Filters Section - only when image is selected */}
      {selectedImage && (
        <CollapsibleSection title="Advanced Filters" defaultExpanded={false}>
          <div className="space-y-3">
            <p className="text-xs text-ui-text-subtle">
              Filters for {selectedImage.name}
            </p>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-ui-text-muted">Grayscale</label>
                <span className="text-xs text-ui-text-subtle">{selectedImage.filters?.grayscale || 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={selectedImage.filters?.grayscale || 0}
                onChange={(e) => onUpdateImageFilters(selectedImageId, { grayscale: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-ui-surface-hover rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-ui-text-muted">Sepia</label>
                <span className="text-xs text-ui-text-subtle">{selectedImage.filters?.sepia || 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={selectedImage.filters?.sepia || 0}
                onChange={(e) => onUpdateImageFilters(selectedImageId, { sepia: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-ui-surface-hover rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-ui-text-muted">Blur</label>
                <span className="text-xs text-ui-text-subtle">{selectedImage.filters?.blur || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={selectedImage.filters?.blur || 0}
                onChange={(e) => onUpdateImageFilters(selectedImageId, { blur: parseFloat(e.target.value) })}
                className="w-full h-2 bg-ui-surface-hover rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-ui-text-muted">Contrast</label>
                <span className="text-xs text-ui-text-subtle">{selectedImage.filters?.contrast || 100}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="5"
                value={selectedImage.filters?.contrast || 100}
                onChange={(e) => onUpdateImageFilters(selectedImageId, { contrast: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-ui-surface-hover rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-ui-text-muted">Brightness</label>
                <span className="text-xs text-ui-text-subtle">{selectedImage.filters?.brightness || 100}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="5"
                value={selectedImage.filters?.brightness || 100}
                onChange={(e) => onUpdateImageFilters(selectedImageId, { brightness: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-ui-surface-hover rounded-lg appearance-none cursor-pointer"
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
              className="border-2 border-dashed border-ui-border rounded-xl p-4 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 dark:hover:bg-violet-900/30 transition-all"
              onClick={() => logoInputRef.current?.click()}
            >
              <svg
                className="w-8 h-8 mx-auto text-ui-text-faint mb-2"
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
              <p className="text-sm text-ui-text-subtle">Click to upload logo</p>
              <p className="text-xs text-ui-text-faint mt-1">Optional</p>
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
              <div className="relative bg-ui-surface-elevated rounded-xl p-3">
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
                <label className="block text-xs font-medium text-ui-text-muted">Position</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {logoPositionOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onLogoPositionChange(opt.id)}
                      className={`px-2 py-1.5 text-xs rounded-lg font-medium ${
                        logoPosition === opt.id
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo size */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-ui-text-muted">Size</label>
                <div className="flex gap-1.5">
                  {logoSizeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onLogoSizeChange(opt.id)}
                      className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
                        logoSize === opt.id
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
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
