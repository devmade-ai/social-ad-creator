import { useCallback, useRef, useState, memo } from 'react'
import { overlayTypes, imagePresets } from '../config/layouts'
import { sampleImages } from '../config/sampleImages'

const overlayColorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
]

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
    <div className="border-t border-gray-200 pt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left mb-2"
      >
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold text-gray-700">{title}</h4>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="space-y-3">{children}</div>}
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
    <div className="space-y-3">
      {/* ===== SECTION 1: IMAGE UPLOAD (always visible) ===== */}
      <h3 className="text-sm font-semibold text-gray-700">Image</h3>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        {image ? (
          <div className="space-y-2">
            <img
              src={image}
              alt="Preview"
              className="max-h-24 mx-auto rounded"
            />
            <p className="text-xs text-gray-500">Click or drop to replace</p>
          </div>
        ) : (
          <div className="py-4">
            <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">Drop image or click to upload</p>
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
          className="w-full text-sm text-red-600 hover:text-red-700 hover:bg-red-50 py-1.5 rounded transition-colors"
        >
          Remove Image
        </button>
      )}

      {/* Sample Images - shown when no image uploaded */}
      {!image && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600">
            Or try a sample
          </label>
          <div className="grid grid-cols-5 gap-1">
            {sampleImages.map((sample) => (
              <button
                key={sample.id}
                onClick={() => loadSampleImage(sample)}
                disabled={loadingSample === sample.id}
                title={sample.name}
                className={`aspect-square rounded overflow-hidden border-2 transition-colors ${
                  loadingSample === sample.id
                    ? 'border-blue-400 opacity-50'
                    : 'border-gray-200 hover:border-blue-400'
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
                  className="w-full h-full bg-gray-100 items-center justify-center text-gray-400 text-[8px] text-center p-0.5"
                  style={{ display: 'none' }}
                >
                  {sample.name}
                </div>
              </button>
            ))}
          </div>
          {sampleError && (
            <p className="text-xs text-amber-600">{sampleError}</p>
          )}
        </div>
      )}

      {/* ===== SECTION 2: IMAGE SETTINGS (when image exists) ===== */}
      {image && (
        <Section title="Settings" defaultOpen={true}>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Object Fit</label>
            <div className="flex gap-2">
              {['cover', 'contain'].map((fit) => (
                <button
                  key={fit}
                  onClick={() => onObjectFitChange(fit)}
                  className={`flex-1 px-3 py-1.5 text-xs rounded capitalize ${
                    objectFit === fit
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Position</label>
            <div className="grid grid-cols-3 gap-1">
              {['top', 'center', 'bottom'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => onPositionChange(pos)}
                  className={`px-2 py-1.5 text-xs rounded capitalize ${
                    position === pos
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ===== SECTION 3: STYLE PRESETS (when image exists) ===== */}
      {image && (
        <Section title="Style Presets" defaultOpen={false} badge="Quick">
          <div className="flex flex-wrap gap-1">
            {imagePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  onOverlayChange(preset.overlay)
                  onFiltersChange(preset.filters)
                }}
                className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* ===== SECTION 4: FILTERS (when image exists) ===== */}
      {image && (
        <Section title="Filters" defaultOpen={false}>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="grayscale"
              checked={filters.grayscale}
              onChange={(e) => onFiltersChange({ grayscale: e.target.checked })}
              className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="grayscale" className="text-xs font-medium text-gray-600">
              Grayscale
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-600">Sepia</label>
              <span className="text-xs text-gray-500">{filters.sepia}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.sepia}
              onChange={(e) => onFiltersChange({ sepia: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-600">Blur</label>
              <span className="text-xs text-gray-500">{filters.blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={filters.blur}
              onChange={(e) => onFiltersChange({ blur: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-600">Contrast</label>
              <span className="text-xs text-gray-500">{filters.contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={filters.contrast}
              onChange={(e) => onFiltersChange({ contrast: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-600">Brightness</label>
              <span className="text-xs text-gray-500">{filters.brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={filters.brightness}
              onChange={(e) => onFiltersChange({ brightness: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </Section>
      )}

      {/* ===== SECTION 5: OVERLAY (when image exists) ===== */}
      {image && (
        <Section title="Overlay" defaultOpen={false}>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Type</label>
            <div className="grid grid-cols-2 gap-1">
              {overlayTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onOverlayChange({ type: type.id })}
                  className={`px-2 py-1.5 text-xs rounded ${
                    overlay.type === type.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Overlay Color</label>
            <div className="flex gap-2">
              {overlayColorOptions.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onOverlayChange({ color: color.id })}
                  className={`flex-1 px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
                    overlay.color === color.id
                      ? 'ring-2 ring-blue-500 ring-offset-1'
                      : 'hover:bg-gray-100'
                  }`}
                  style={{ backgroundColor: theme[color.id] }}
                >
                  <span
                    className="text-xs"
                    style={{
                      color: color.id === 'primary' ? theme.secondary : theme.primary,
                    }}
                  >
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-600">Opacity</label>
              <span className="text-xs text-gray-500">{overlay.opacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={overlay.opacity}
              onChange={(e) => onOverlayChange({ opacity: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </Section>
      )}

      {/* ===== SECTION 6: LOGO ===== */}
      {onLogoChange && (
        <Section title="Logo" defaultOpen={!!logo} badge={logo ? null : 'Optional'}>
          {!logo ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => logoInputRef.current?.click()}
            >
              <svg className="w-6 h-6 mx-auto text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-500">Click to upload logo</p>
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
              <div className="relative bg-gray-100 rounded-lg p-2">
                <img src={logo} alt="Logo" className="max-h-16 mx-auto object-contain" />
                <button
                  onClick={() => {
                    onLogoChange(null)
                    if (logoInputRef.current) logoInputRef.current.value = ''
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>

              {/* Logo position */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-600">Position</label>
                <div className="grid grid-cols-3 gap-1">
                  {logoPositionOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onLogoPositionChange(opt.id)}
                      className={`px-1.5 py-1 text-[10px] rounded ${
                        logoPosition === opt.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo size */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-600">Size</label>
                <div className="flex gap-1">
                  {logoSizeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onLogoSizeChange(opt.id)}
                      className={`flex-1 px-1.5 py-1 text-[10px] rounded ${
                        logoSize === opt.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
