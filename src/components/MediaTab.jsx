import { useCallback, useRef, useState, memo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import { sampleImages } from '../config/sampleImages'

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

      {/* Background Image Section */}
      <CollapsibleSection title="Background Image" defaultExpanded={true}>
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Vertical</span>
                    <div className="flex gap-1">
                      {['top', 'center', 'bottom'].map((pos) => (
                        <button
                          key={pos}
                          onClick={() => onPositionChange({ vertical: pos })}
                          className={`flex-1 px-1.5 py-1.5 text-xs rounded capitalize font-medium ${
                            position.vertical === pos
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pos.charAt(0).toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block mb-1">Horizontal</span>
                    <div className="flex gap-1">
                      {['left', 'center', 'right'].map((pos) => (
                        <button
                          key={pos}
                          onClick={() => onPositionChange({ horizontal: pos })}
                          className={`flex-1 px-1.5 py-1.5 text-xs rounded capitalize font-medium ${
                            position.horizontal === pos
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pos.charAt(0).toUpperCase()}
                        </button>
                      ))}
                    </div>
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
            </div>
          )}
        </div>
      </CollapsibleSection>

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
        <CollapsibleSection title="Logo" defaultExpanded={!!logo}>
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
