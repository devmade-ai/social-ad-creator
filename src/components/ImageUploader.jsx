import { useCallback, useRef, useMemo } from 'react'
import { overlayTypes } from '../config/layouts'
import {
  layoutPresets,
  presetIcons,
  getSuggestedLayouts,
} from '../config/layoutPresets'

const overlayColorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
]

// SVG Preview Icon Component (compact version)
function PresetIcon({ presetId, isActive }) {
  const iconData = presetIcons[presetId]
  if (!iconData) return <span className="text-base">?</span>

  return (
    <svg
      viewBox={iconData.viewBox}
      className="w-8 h-6"
      style={{ display: 'block' }}
    >
      {iconData.elements.map((el, i) => {
        const Element = el.type
        const props = { ...el.props }
        if (isActive) {
          if (props.fill === '#3b82f6') props.fill = '#ffffff'
          if (props.fill === '#e5e7eb') props.fill = 'rgba(255,255,255,0.4)'
          if (props.fill === '#d1d5db') props.fill = 'rgba(255,255,255,0.3)'
        }
        return <Element key={i} {...props} />
      })}
    </svg>
  )
}

export default function ImageUploader({
  image,
  onImageChange,
  objectFit,
  onObjectFitChange,
  position,
  onPositionChange,
  grayscale,
  onGrayscaleChange,
  overlay,
  onOverlayChange,
  theme,
  // New props for layout presets
  layout,
  onLayoutChange,
  onTextGroupsChange,
  imageAspectRatio,
  platform,
}) {
  const fileInputRef = useRef(null)

  // Get suggested layout presets
  const suggestedIds = useMemo(() => {
    return getSuggestedLayouts(imageAspectRatio, platform)
  }, [imageAspectRatio, platform])

  const suggestedPresets = useMemo(() => {
    return layoutPresets.filter(p => suggestedIds.includes(p.id))
  }, [suggestedIds])

  // Check if current layout matches a preset
  const getActivePreset = () => {
    if (!layout) return null
    return layoutPresets.find(preset => {
      return JSON.stringify(preset.layout) === JSON.stringify(layout)
    })
  }

  const activePreset = getActivePreset()

  // Apply a preset
  const applyPreset = (preset) => {
    if (onLayoutChange) onLayoutChange(preset.layout)
    if (onTextGroupsChange) onTextGroupsChange(preset.textGroups)
  }

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

      {/* Quick Layout Presets - shown when layout controls available */}
      {onLayoutChange && suggestedPresets.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600">
            Quick Layout {image ? '(suggested)' : ''}
          </label>
          <div className="flex flex-wrap gap-1">
            {suggestedPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                title={preset.description}
                className={`px-1.5 py-1.5 text-xs rounded flex flex-col items-center gap-0.5 transition-colors ${
                  activePreset?.id === preset.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <PresetIcon presetId={preset.id} isActive={activePreset?.id === preset.id} />
                <span className="text-[8px] leading-tight text-center max-w-[50px] truncate">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {image && (
        <>
          <button
            onClick={handleRemove}
            className="w-full text-sm text-red-600 hover:text-red-700 py-1"
          >
            Remove Image
          </button>

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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="grayscale"
              checked={grayscale}
              onChange={(e) => onGrayscaleChange(e.target.checked)}
              className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="grayscale" className="text-xs font-medium text-gray-600">
              Grayscale
            </label>
          </div>

          {/* Overlay Controls */}
          <div className="pt-3 border-t border-gray-200 space-y-3">
            <h4 className="text-xs font-semibold text-gray-700">Overlay</h4>

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
          </div>
        </>
      )}
    </div>
  )
}
