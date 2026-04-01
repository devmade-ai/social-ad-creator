import { useCallback, useRef } from 'react'
import { useToast } from './Toast'

// Max logo file size: 10MB. DataURL conversion of larger files can freeze the browser.
const MAX_LOGO_SIZE_BYTES = 10 * 1024 * 1024

const positionOptions = [
  { id: 'top-left', name: 'Top Left' },
  { id: 'top-right', name: 'Top Right' },
  { id: 'bottom-left', name: 'Bottom Left' },
  { id: 'bottom-right', name: 'Bottom Right' },
  { id: 'center', name: 'Center' },
]

const sizeOptions = [
  { id: 0.08, name: 'XS' },
  { id: 0.12, name: 'S' },
  { id: 0.15, name: 'M' },
  { id: 0.20, name: 'L' },
  { id: 0.25, name: 'XL' },
]

export default function LogoUploader({
  logo,
  onLogoChange,
  position,
  onPositionChange,
  size,
  onSizeChange,
}) {
  const { addToast } = useToast()
  const fileInputRef = useRef(null)

  // Validate and read a logo image file.
  // Rejects non-image files and files exceeding MAX_LOGO_SIZE_BYTES to prevent
  // browser freezes from DataURL conversion of very large images.
  const processLogoFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      addToast('Logo must be under 10 MB', { type: 'warning', duration: 4000 })
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      onLogoChange(event.target.result)
    }
    reader.readAsDataURL(file)
  }, [onLogoChange, addToast])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    processLogoFile(e.dataTransfer.files[0])
  }, [processLogoFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleFileChange = useCallback((e) => {
    processLogoFile(e.target.files?.[0])
  }, [processLogoFile])

  const handleRemove = useCallback(() => {
    onLogoChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onLogoChange])

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-base-content">Logo</h3>

      {/* Upload area */}
      {!logo ? (
        <div
          className="border-2 border-dashed border-base-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="text-base-content/60">
            <svg
              className="mx-auto h-8 w-8 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs">Drop logo or click to upload</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Logo preview */}
          <div className="relative bg-base-200 rounded-lg p-2">
            <img
              src={logo}
              alt="Logo preview"
              className="max-h-20 mx-auto object-contain"
            />
            <button
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>

          {/* Position selector */}
          <div>
            <label className="block text-xs font-medium text-base-content/70 mb-1">Position</label>
            <div className="grid grid-cols-3 gap-1">
              {positionOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onPositionChange(opt.id)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    position === opt.id
                      ? 'bg-primary text-primary-content'
                      : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <label className="block text-xs font-medium text-base-content/70 mb-1">Size</label>
            <div className="flex gap-1">
              {sizeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSizeChange(opt.id)}
                  className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                    size === opt.id
                      ? 'bg-primary text-primary-content'
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
    </div>
  )
}
