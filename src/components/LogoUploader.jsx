import { useCallback, useRef } from 'react'

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
  const fileInputRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onLogoChange(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }, [onLogoChange])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onLogoChange(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }, [onLogoChange])

  const handleRemove = useCallback(() => {
    onLogoChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onLogoChange])

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Logo</h3>

      {/* Upload area */}
      {!logo ? (
        <div
          className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-4 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
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
          <div className="text-zinc-500 dark:text-zinc-400">
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
          <div className="relative bg-zinc-100 dark:bg-dark-subtle rounded-lg p-2">
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
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">Position</label>
            <div className="grid grid-cols-3 gap-1">
              {positionOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onPositionChange(opt.id)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    position === opt.id
                      ? 'bg-primary text-white'
                      : 'bg-zinc-100 dark:bg-dark-subtle text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-dark-elevated'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">Size</label>
            <div className="flex gap-1">
              {sizeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSizeChange(opt.id)}
                  className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                    size === opt.id
                      ? 'bg-primary text-white'
                      : 'bg-zinc-100 dark:bg-dark-subtle text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-dark-elevated'
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
