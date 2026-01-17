import { useCallback, useRef, useState, memo } from 'react'
import { overlayTypes } from '../config/layouts'
import { sampleImages } from '../config/sampleImages'
import { neutralColors } from '../config/themes'

const themeColorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
]

// Contextual tips for overlay settings
function getOverlayTip(type, opacity, grayscaleAmount) {
  // Special tip for grayscale + overlay combo
  if (grayscaleAmount > 0 && opacity > 0) {
    return 'Grayscale + colored overlay creates a professional duotone effect—great for brand consistency.'
  }

  if (!type || opacity === 0) return null

  const isLowOpacity = opacity <= 40
  const isMidOpacity = opacity > 40 && opacity <= 60

  switch (type) {
    case 'solid':
      if (isLowOpacity) {
        return 'Subtle brand tint—keeps image details visible while adding color cohesion.'
      } else if (isMidOpacity) {
        return 'Balanced tint—good for text legibility while showing the image.'
      } else {
        return 'Strong tint dominates the image. Consider a gradient for partial visibility.'
      }
    case 'gradient-down':
      if (isLowOpacity) {
        return 'Soft top fade—adds subtle depth for top-placed text.'
      } else {
        return 'Top-to-bottom fade creates a natural "scrim" for headlines at the top.'
      }
    case 'gradient-up':
      if (isLowOpacity) {
        return 'Soft bottom fade—mimics natural shadow for bottom text.'
      } else {
        return 'Bottom fade creates a professional scrim—great for captions and CTAs.'
      }
    case 'vignette':
      if (isLowOpacity) {
        return 'Subtle vignette draws the eye to center content without being obvious.'
      } else if (isMidOpacity) {
        return 'Classic vignette effect—frames your content like professional photography.'
      } else {
        return 'Dramatic framing—creates strong focus but may obscure edge details.'
      }
    default:
      return null
  }
}

// Get filter tips
function getFilterTip(filters) {
  if (filters.grayscale > 0) {
    return 'Try adding a colored overlay in the Overlay section below for a duotone effect.'
  }
  if (filters.blur > 0) {
    return 'Blur softens the image—useful for making text stand out against busy backgrounds.'
  }
  return null
}

// Tip display component
function ImageTip({ tip }) {
  if (!tip) return null

  return (
    <div className="flex items-start gap-1.5 px-2.5 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-xs text-blue-700 dark:text-blue-300">
      <span className="flex-shrink-0">💡</span>
      <span>{tip}</span>
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
  { id: 0.20, name: 'L' },
  { id: 0.25, name: 'XL' },
]

// Collapsible Section Component
function Section({ title, children, defaultOpen = true, badge = null }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left mb-3 group"
      >
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100">{title}</h4>
          {badge && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="space-y-4">{children}</div>}
    </div>
  )
}

export default memo(function ImageUploader({
  image,
  onImageChange,
  objectFit,
  onObjectFitChange,
  position,
  onPositionChange,
  filters,
  onFiltersChange,
  overlay,
  onOverlayChange,
  theme,
  // Logo props
  logo,
  onLogoChange,
  logoPosition,
  onLogoPositionChange,
  logoSize,
  onLogoSizeChange,
}) {
  const fileInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const [loadingSample, setLoadingSample] = useState(null)
  const [sampleError, setSampleError] = useState(null)

  // Load a sample image
  const loadSampleImage = useCallback(async (sample) => {
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
  }, [onImageChange])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onImageChange(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }, [onImageChange])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onImageChange(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }, [onImageChange])

  const handleRemove = useCallback(() => {
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onImageChange])

  return (
    <div className="space-y-4">
      {/* ===== SECTION 1: IMAGE UPLOAD (always visible) ===== */}
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Image</h3>

      <div
        className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        {image ? (
          <div className="space-y-3">
            <img
              src={image}
              alt="Preview"
              className="max-h-28 mx-auto rounded-lg shadow-sm"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">Click or drop to replace</p>
          </div>
        ) : (
          <div className="py-4">
            <svg className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Drop image or click to upload</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Remove button - immediately after upload area */}
      {image && (
        <button
          onClick={handleRemove}
          className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg transition-colors font-medium"
        >
          Remove Image
        </button>
      )}

      {/* Sample Images - shown when no image uploaded */}
      {!image && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
            Or try a sample
          </label>
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
          {sampleError && (
            <p className="text-sm text-red-600 dark:text-red-400">{sampleError}</p>
          )}
        </div>
      )}

      {/* ===== SECTION 2: IMAGE SETTINGS (when image exists) ===== */}
      {image && (
        <Section title="Settings" defaultOpen={true}>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Object Fit</label>
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

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Vertical Position</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['top', 'center', 'bottom'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => onPositionChange({ vertical: pos })}
                  className={`px-2 py-2 text-sm rounded-lg capitalize font-medium ${
                    position.vertical === pos
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Horizontal Position</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['left', 'center', 'right'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => onPositionChange({ horizontal: pos })}
                  className={`px-2 py-2 text-sm rounded-lg capitalize font-medium ${
                    position.horizontal === pos
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Grayscale</label>
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
        </Section>
      )}

      {/* ===== SECTION 3: FILTERS (when image exists) ===== */}
      {image && (
        <Section title="Filters" defaultOpen={false}>
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Grayscale</label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{filters.grayscale}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.grayscale}
              onChange={(e) => onFiltersChange({ grayscale: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Sepia</label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{filters.sepia}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.sepia}
              onChange={(e) => onFiltersChange({ sepia: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Blur</label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{filters.blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={filters.blur}
              onChange={(e) => onFiltersChange({ blur: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Contrast</label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{filters.contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={filters.contrast}
              onChange={(e) => onFiltersChange({ contrast: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Brightness</label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{filters.brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={filters.brightness}
              onChange={(e) => onFiltersChange({ brightness: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </div>

          {/* Filter tip */}
          <ImageTip tip={getFilterTip(filters)} />
        </Section>
      )}

      {/* ===== SECTION 4: OVERLAY (when image exists) ===== */}
      {image && (
        <Section title="Overlay" defaultOpen={false}>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {overlayTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onOverlayChange({ type: type.id })}
                  className={`px-2 py-2 text-sm rounded-lg font-medium ${
                    overlay.type === type.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Overlay Color</label>
            {/* Theme colors */}
            <div className="flex gap-2">
              {themeColorOptions.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onOverlayChange({ color: color.id })}
                  className={`flex-1 px-2 py-2 text-sm rounded-lg flex items-center justify-center gap-1 font-medium ${
                    overlay.color === color.id
                      ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
                      : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: theme[color.id] }}
                >
                  <span
                    style={{
                      color: color.id === 'primary' ? theme.secondary : theme.primary,
                    }}
                  >
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
            {/* Neutral colors */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Neutrals:</span>
              <div className="flex gap-1.5">
                {neutralColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onOverlayChange({ color: color.id })}
                    title={color.name}
                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${
                      overlay.color === color.id
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Opacity</label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{overlay.opacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={overlay.opacity}
              onChange={(e) => onOverlayChange({ opacity: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </div>

          {/* Overlay tip */}
          <ImageTip tip={getOverlayTip(overlay.type, overlay.opacity, filters.grayscale)} />
        </Section>
      )}

      {/* ===== SECTION 5: LOGO ===== */}
      {onLogoChange && (
        <Section title="Logo" defaultOpen={!!logo} badge={logo ? null : 'Optional'}>
          {!logo ? (
            <div
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all"
              onClick={() => logoInputRef.current?.click()}
            >
              <svg className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload logo</p>
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
            <>
              {/* Logo preview */}
              <div className="relative bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <img src={logo} alt="Logo" className="max-h-20 mx-auto object-contain" />
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
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Position</label>
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
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Size</label>
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
            </>
          )}
        </Section>
      )}
    </div>
  )
})
