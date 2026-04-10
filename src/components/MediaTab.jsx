// Requirement: Image management hub — sample images, upload, per-cell assignment, overlay, filters, logo.
// Approach: Collapsible sections for each concern. Images stored in shared library (state.images[])
//   with per-image settings (fit, position, filters, overlay). Cells reference images by ID.
// Alternatives:
//   - Per-cell image upload: Rejected - users need to reuse one image across cells.
//   - Separate tabs for upload/filters/overlay: Rejected - too many tabs; collapsible sections
//     keep related controls together without overwhelming the sidebar.
import { useCallback, useRef, useState, memo, useMemo, useEffect } from 'react'
import CollapsibleSection from './CollapsibleSection'
import AIPromptHelper from './AIPromptHelper'
import SampleImagesSection from './SampleImagesSection'
import { useToast } from './Toast'
import { getAspectRatio } from '../config/platforms'
import { overlayTypes } from '../config/layouts'
import { neutralColors } from '../config/themes'
import { normalizeStructure } from '../utils/cellUtils'

// Theme color options for overlay
const themeColorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
]

// Requirement: Pre-compute cell mapping to avoid mutable cellIndex during render.
// Approach: useMemo builds a Map of sectionIndex → cells[], used during render.
// Alternatives:
//   - Mutable let cellIndex = 0 in render: Rejected — side effect during render,
//     breaks under React strict mode double-rendering or concurrent features.
function CellGrid({ layout, cellImages, selectedCell, onSelectCell, platform, highlightImageId }) {
  const { type, structure } = layout
  const isFullbleed = type === 'fullbleed'
  const isRows = type === 'rows'

  const normalizedStructure = normalizeStructure(type, structure)

  const aspectRatio = getAspectRatio(platform)

  // Pre-compute cell indices per section to avoid mutable counter during render
  const sectionCellMap = useMemo(() => {
    const grouped = new Map()
    let idx = 0
    const src = normalizeStructure(type, structure)
    src.forEach((section, sectionIndex) => {
      const subdivisions = section.subdivisions || 1
      const subSizes = section.subSizes || Array(subdivisions).fill(100 / subdivisions)
      const cells = []
      for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
        cells.push({ cellIndex: idx, subSize: subSizes[subIndex] })
        idx++
      }
      grouped.set(sectionIndex, cells)
    })
    return grouped
  }, [type, structure])

  return (
    <div
      className="rounded overflow-hidden border border-base-300 flex"
      style={{
        aspectRatio,
        maxWidth: '140px',
        width: '100%',
        flexDirection: isRows || isFullbleed ? 'column' : 'row',
      }}
    >
      {normalizedStructure.map((section, sectionIndex) => {
        const sectionSize = section.size || 100 / normalizedStructure.length
        const sectionCells = sectionCellMap.get(sectionIndex) || []

        return (
          <div
            key={`section-${sectionIndex}`}
            className="flex"
            style={{
              flex: `0 0 ${sectionSize}%`,
              flexDirection: isRows ? 'row' : 'column',
            }}
          >
            {sectionCells.map(({ cellIndex: currentCellIndex, subSize }) => {
              const cellImageId = cellImages && cellImages[currentCellIndex]
              const hasImage = !!cellImageId
              const isSelected = selectedCell === currentCellIndex
              const isHighlighted = highlightImageId && cellImageId === highlightImageId

              return (
                <button
                  key={`cell-${currentCellIndex}`}
                  onClick={() => onSelectCell(currentCellIndex)}
                  className={`flex items-center justify-center text-xs font-medium transition-colors ${
                    isHighlighted
                      ? 'bg-primary hover:bg-primary/80 text-primary-content ring-2 ring-primary ring-offset-1'
                      : isSelected
                      ? 'bg-primary hover:bg-primary/80 text-primary-content ring-2 ring-primary ring-offset-1'
                      : hasImage
                      ? 'bg-base-300 hover:bg-base-200 text-primary'
                      : 'bg-base-200 hover:bg-base-300 text-base-content/60'
                  }`}
                  style={{ flex: `0 0 ${subSize}%` }}
                >
                  {hasImage ? '\uD83D\uDCF7' : currentCellIndex + 1}
                </button>
              )
            })}
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

// Max image file size: 10 MB. Prevents memory issues from large base64 strings
// multiplied across undo history and multi-page state snapshots.
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

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
  // Global cell selection
  selectedCell,
}) {
  const { addToast } = useToast()
  const fileInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const [selectedImageId, setSelectedImageId] = useState(null) // Currently selected image for editing

  // Get selected image data
  const selectedImage = images.find((img) => img.id === selectedImageId) || null

  // Auto-select first image when images are added (syncing selection to library changes)
  /* eslint-disable react-hooks/set-state-in-effect -- auto-selecting images in response to library/cell changes */
  useEffect(() => {
    if (images.length > 0 && !selectedImage) {
      setSelectedImageId(images[0].id)
    } else if (images.length === 0) {
      setSelectedImageId(null)
    }
  }, [images, selectedImage])

  // Auto-select image based on global selectedCell (syncing to external cell selection)
  useEffect(() => {
    if (selectedCell != null && cellImages[selectedCell]) {
      const imageId = cellImages[selectedCell]
      // Only switch if the image exists in the library
      if (images.some((img) => img.id === imageId)) {
        setSelectedImageId(imageId)
      }
    }
  }, [selectedCell, cellImages, images])
  /* eslint-enable react-hooks/set-state-in-effect */

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
          if (file.size > MAX_IMAGE_SIZE_BYTES) {
            addToast(`"${file.name}" is too large (max 10 MB). Try a smaller image.`, { type: 'warning', duration: 5000 })
            return
          }
          const reader = new FileReader()
          reader.onload = (event) => {
            const img = new Image()
            img.onload = () => {
              const { id: imageId, assigned } = onAddImage(event.target.result, file.name, selectedCell, { width: img.naturalWidth, height: img.naturalHeight })
              if (!assigned) addToast('Image added to library — all cells already have images', { type: 'info' })
              if (!firstImageId) {
                firstImageId = imageId
                setSelectedImageId(imageId)
              }
            }
            img.src = event.target.result
          }
          reader.readAsDataURL(file)
        }
      })
    },
    [onAddImage, selectedCell, addToast]
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
          if (file.size > MAX_IMAGE_SIZE_BYTES) {
            addToast(`"${file.name}" is too large (max 10 MB). Try a smaller image.`, { type: 'warning', duration: 5000 })
            return
          }
          const reader = new FileReader()
          reader.onload = (event) => {
            const img = new Image()
            img.onload = () => {
              const { id: imageId, assigned } = onAddImage(event.target.result, file.name, selectedCell, { width: img.naturalWidth, height: img.naturalHeight })
              if (!assigned) addToast('Image added to library — all cells already have images', { type: 'info' })
              if (!firstImageId) {
                firstImageId = imageId
                setSelectedImageId(imageId)
              }
            }
            img.src = event.target.result
          }
          reader.readAsDataURL(file)
        }
      })
    },
    [onAddImage, selectedCell, addToast]
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
      <h3 className="text-sm font-semibold text-base-content">Media</h3>

      {/* AI Image Prompt Helper Section - collapsed by default */}
      <CollapsibleSection title="AI Image Prompt" defaultExpanded={false}>
        <AIPromptHelper theme={theme} />
      </CollapsibleSection>

      {/* Images Section */}
      <CollapsibleSection title="Images" defaultExpanded={false}>
        <div className="space-y-3">
          {/* Sample Images - collapsed by default, above upload */}
          <CollapsibleSection title="Sample Images" defaultExpanded={false}>
            <SampleImagesSection images={images} onAddImage={onAddImage} selectedCell={selectedCell} addToast={addToast} />
          </CollapsibleSection>

          {/* Upload area */}
          <div
            className="border-2 border-dashed border-base-300 rounded-xl p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-all"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="py-2">
              <svg
                className="w-8 h-8 mx-auto text-base-content/50 mb-2"
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
              <p className="text-sm text-base-content/70 font-medium">Drop image or click to upload</p>
              <p className="text-xs text-base-content/50 mt-1">
                {images.length === 0 ? 'Add images to your library' : `${images.length} image${images.length !== 1 ? 's' : ''} in library`}
              </p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
          </div>

          {/* Image Library - click to select an image */}
          {images.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-base-content/70">
                Select Image <span className="text-base-content/50 font-normal">(click to edit)</span>
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
                            ? 'border-primary/50 hover:border-primary'
                            : 'border-base-300 hover:border-primary'
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
                        className="btn btn-error btn-circle btn-xs absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        title="Remove from library"
                      >
                        ×
                      </button>
                      {/* Assignment indicator */}
                      {assignedCells.length > 0 && (
                        <div className="absolute bottom-0.5 left-0.5 bg-primary text-primary-content text-[8px] px-1 rounded">
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
            <div className="space-y-3 pt-3 border-t border-base-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-base-content/70">
                  {selectedImage.name}
                </span>
              </div>

              {/* Assign to Cells - primary action after selection */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-base-content/70">Assign to Cells</label>
                <div className="flex items-center gap-3">
                  <CellGrid
                    layout={layout}
                    cellImages={cellImages}
                    selectedCell={null}
                    onSelectCell={toggleCellAssignment}
                    platform={platform}
                    highlightImageId={selectedImageId}
                  />
                  <div className="text-xs text-base-content/60">
                    <div>Click cells to assign/unassign</div>
                    <div className="text-primary">
                      {getImageCells(selectedImageId).length > 0
                        ? `In cells: ${getImageCells(selectedImageId).map(c => c + 1).join(', ')}`
                        : 'Not assigned'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Object Fit */}
              <div className="space-y-2 pt-3 border-t border-base-200">
                <label className="block text-xs font-medium text-base-content/70">Fit</label>
                <div className="flex gap-2">
                  {[{ value: 'cover', label: 'Fill' }, { value: 'contain', label: 'Fit' }].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => onUpdateImage(selectedImageId, { fit: value })}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium ${
                        selectedImage.fit === value
                          ? 'bg-primary text-primary-content shadow-sm'
                          : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-base-content/70">Position</label>
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
                          ? 'bg-primary text-primary-content shadow-sm'
                          : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {/* Fine-grained position sliders */}
                <div className="space-y-2 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-base-content/70">Horizontal</label>
                      <span className="text-xs text-base-content/60">{selectedImage.position?.x ?? 50}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-base-content/50 w-6">Left</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedImage.position?.x ?? 50}
                        onChange={(e) => onUpdateImagePosition(selectedImageId, { x: parseInt(e.target.value) })}
                        className="range range-primary range-sm flex-1"
                      />
                      <span className="text-[10px] text-base-content/50 w-7 text-right">Right</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-base-content/70">Vertical</label>
                      <span className="text-xs text-base-content/60">{selectedImage.position?.y ?? 50}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-base-content/50 w-6">Top</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedImage.position?.y ?? 50}
                        onChange={(e) => onUpdateImagePosition(selectedImageId, { y: parseInt(e.target.value) })}
                        className="range range-primary range-sm flex-1"
                      />
                      <span className="text-[10px] text-base-content/50 w-7 text-right">Btm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grayscale toggle */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-base-content/70">Grayscale</label>
                <button
                  onClick={() =>
                    onUpdateImageFilters(selectedImageId, {
                      grayscale: (selectedImage.filters?.grayscale || 0) > 0 ? 0 : 100,
                    })
                  }
                  className={`w-full px-3 py-2 text-sm rounded-lg font-medium ${
                    (selectedImage.filters?.grayscale || 0) > 0
                      ? 'bg-primary text-primary-content shadow-sm'
                      : 'bg-base-200 text-base-content/70 hover:bg-base-300'
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
        <CollapsibleSection title="Image Color Tint" defaultExpanded={false}>
          <div className="space-y-3">
            <p className="text-xs text-base-content/60">
              Color tint for {selectedImage.name}
            </p>

            {/* On/Off Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-base-content/70">Color Tint</label>
              <button
                onClick={() => onUpdateImageOverlay(selectedImageId, { opacity: (selectedImage.overlay?.opacity ?? 0) > 0 ? 0 : 50 })}
                className={`w-full px-3 py-2 text-sm rounded-lg font-medium ${
                  (selectedImage.overlay?.opacity ?? 0) > 0
                    ? 'bg-primary text-primary-content shadow-sm'
                    : 'bg-base-200 text-base-content/70 hover:bg-base-300'
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
                  <label className="block text-xs font-medium text-base-content/70">Type</label>
                  {/* Basic & Linear Gradients */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-base-content/50 uppercase tracking-wide">Basic & Gradients</span>
                    <div className="grid grid-cols-5 gap-1">
                      {overlayTypes.filter(t => t.category === 'basic' || t.category === 'linear').map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onUpdateImageOverlay(selectedImageId, { type: t.id })}
                          className={`px-1.5 py-1.5 text-[10px] rounded-lg font-medium truncate ${
                            selectedImage.overlay?.type === t.id
                              ? 'bg-primary text-primary-content shadow-sm'
                              : 'bg-base-200 text-base-content/70 hover:bg-base-300'
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
                    <span className="text-[10px] text-base-content/50 uppercase tracking-wide">Circular</span>
                    <div className="grid grid-cols-4 gap-1">
                      {overlayTypes.filter(t => t.category === 'radial').map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onUpdateImageOverlay(selectedImageId, { type: t.id })}
                          className={`px-1.5 py-1.5 text-[10px] rounded-lg font-medium truncate ${
                            selectedImage.overlay?.type === t.id
                              ? 'bg-primary text-primary-content shadow-sm'
                              : 'bg-base-200 text-base-content/70 hover:bg-base-300'
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
                    <span className="text-[10px] text-base-content/50 uppercase tracking-wide">Effects</span>
                    <div className="grid grid-cols-4 gap-1">
                      {overlayTypes.filter(t => t.category === 'effect' || t.category === 'texture').map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onUpdateImageOverlay(selectedImageId, { type: t.id })}
                          className={`px-1.5 py-1.5 text-[10px] rounded-lg font-medium truncate ${
                            selectedImage.overlay?.type === t.id
                              ? 'bg-primary text-primary-content shadow-sm'
                              : 'bg-base-200 text-base-content/70 hover:bg-base-300'
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
                    <span className="text-[10px] text-base-content/50 uppercase tracking-wide">Blending</span>
                    <div className="grid grid-cols-4 gap-1">
                      {overlayTypes.filter(t => t.category === 'blend').map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onUpdateImageOverlay(selectedImageId, { type: t.id })}
                          className={`px-1.5 py-1.5 text-[10px] rounded-lg font-medium truncate ${
                            selectedImage.overlay?.type === t.id
                              ? 'bg-primary text-primary-content shadow-sm'
                              : 'bg-base-200 text-base-content/70 hover:bg-base-300'
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
                  <label className="block text-xs font-medium text-base-content/70">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {/* Theme colors */}
                    {themeColorOptions.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onUpdateImageOverlay(selectedImageId, { color: c.id })}
                        className={`px-2.5 py-1.5 text-xs rounded-lg font-medium ${
                          selectedImage.overlay?.color === c.id
                            ? 'bg-primary text-primary-content shadow-sm'
                            : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                        }`}
                      >
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 border border-base-300"
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
                            ? 'bg-primary text-primary-content shadow-sm'
                            : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                        }`}
                      >
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 border border-base-300"
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
                    <label className="text-xs font-medium text-base-content/70">Transparency</label>
                    <span className="text-xs text-base-content/60">
                      {selectedImage.overlay?.opacity ?? 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-base-content/50 w-7">None</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={selectedImage.overlay?.opacity ?? 0}
                      onChange={(e) => onUpdateImageOverlay(selectedImageId, { opacity: parseInt(e.target.value, 10) })}
                      className="range range-primary range-sm flex-1"
                    />
                    <span className="text-[10px] text-base-content/50 w-6 text-right">Full</span>
                  </div>
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
            <p className="text-xs text-base-content/60">
              Filters for {selectedImage.name}
            </p>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-base-content/70">Grayscale</label>
                <span className="text-xs text-base-content/60">{selectedImage.filters?.grayscale || 0}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-base-content/50 w-7">None</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={selectedImage.filters?.grayscale || 0}
                  onChange={(e) => onUpdateImageFilters(selectedImageId, { grayscale: parseInt(e.target.value, 10) })}
                  className="range range-primary range-sm flex-1"
                />
                <span className="text-[10px] text-base-content/50 w-6 text-right">Full</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-base-content/70">Sepia</label>
                <span className="text-xs text-base-content/60">{selectedImage.filters?.sepia || 0}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-base-content/50 w-7">None</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={selectedImage.filters?.sepia || 0}
                  onChange={(e) => onUpdateImageFilters(selectedImageId, { sepia: parseInt(e.target.value, 10) })}
                  className="range range-primary range-sm flex-1"
                />
                <span className="text-[10px] text-base-content/50 w-6 text-right">Full</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-base-content/70">Blur</label>
                <span className="text-xs text-base-content/60">{selectedImage.filters?.blur || 0}px</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-base-content/50 w-7">Sharp</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={selectedImage.filters?.blur || 0}
                  onChange={(e) => onUpdateImageFilters(selectedImageId, { blur: parseFloat(e.target.value) })}
                  className="range range-primary range-sm flex-1"
                />
                <span className="text-[10px] text-base-content/50 w-7 text-right">Blurry</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-base-content/70">Contrast</label>
                <span className="text-xs text-base-content/60">{selectedImage.filters?.contrast || 100}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-base-content/50 w-6">Low</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={selectedImage.filters?.contrast || 100}
                  onChange={(e) => onUpdateImageFilters(selectedImageId, { contrast: parseInt(e.target.value, 10) })}
                  className="range range-primary range-sm flex-1"
                />
                <span className="text-[10px] text-base-content/50 w-6 text-right">High</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-base-content/70">Brightness</label>
                <span className="text-xs text-base-content/60">{selectedImage.filters?.brightness || 100}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-base-content/50 w-6">Dark</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={selectedImage.filters?.brightness || 100}
                  onChange={(e) => onUpdateImageFilters(selectedImageId, { brightness: parseInt(e.target.value, 10) })}
                  className="range range-primary range-sm flex-1"
                />
                <span className="text-[10px] text-base-content/50 w-7 text-right">Bright</span>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Logo Section */}
      {onLogoChange && (
        <CollapsibleSection title="Logo" defaultExpanded={false}>
          {!logo ? (
            <div
              className="border-2 border-dashed border-base-300 rounded-xl p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-all"
              onClick={() => logoInputRef.current?.click()}
            >
              <svg
                className="w-8 h-8 mx-auto text-base-content/50 mb-2"
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
              <p className="text-sm text-base-content/60">Click to upload logo</p>
              <p className="text-xs text-base-content/50 mt-1">Optional</p>
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
              <div className="relative bg-base-200 rounded-xl p-3">
                <img src={logo} alt="Logo" className="max-h-16 mx-auto object-contain" />
                <button
                  onClick={() => {
                    onLogoChange(null)
                    if (logoInputRef.current) logoInputRef.current.value = ''
                  }}
                  className="btn btn-error btn-circle btn-xs absolute top-2 right-2 shadow-sm"
                >
                  ×
                </button>
              </div>

              {/* Logo position */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-base-content/70">Position</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {logoPositionOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onLogoPositionChange(opt.id)}
                      className={`px-2 py-1.5 text-xs rounded-lg font-medium ${
                        logoPosition === opt.id
                          ? 'bg-primary text-primary-content shadow-sm'
                          : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo size */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-base-content/70">Size</label>
                <div className="flex gap-1.5">
                  {logoSizeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onLogoSizeChange(opt.id)}
                      className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium ${
                        logoSize === opt.id
                          ? 'bg-primary text-primary-content shadow-sm'
                          : 'bg-base-200 text-base-content/70 hover:bg-base-300'
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
