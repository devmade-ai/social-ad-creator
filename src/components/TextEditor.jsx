import { memo } from 'react'
import { neutralColors } from '../config/themes'

const themeColorOptions = [
  { id: 'primary', name: 'Primary' },
  { id: 'secondary', name: 'Secondary' },
  { id: 'accent', name: 'Accent' },
]

const sizeOptions = [
  { id: 0.6, name: 'XS' },
  { id: 0.8, name: 'S' },
  { id: 1, name: 'M' },
  { id: 1.2, name: 'L' },
  { id: 1.5, name: 'XL' },
]

const letterSpacingOptions = [
  { id: -1, name: 'Tight' },
  { id: 0, name: 'Normal' },
  { id: 1, name: 'Wide' },
  { id: 2, name: 'Wider' },
]

// Alignment icons
const AlignLeftIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
    <rect x="0" y="0" width="10" height="2" />
    <rect x="0" y="4" width="14" height="2" />
    <rect x="0" y="8" width="8" height="2" />
  </svg>
)
const AlignCenterIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
    <rect x="2" y="0" width="10" height="2" />
    <rect x="0" y="4" width="14" height="2" />
    <rect x="3" y="8" width="8" height="2" />
  </svg>
)
const AlignRightIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
    <rect x="4" y="0" width="10" height="2" />
    <rect x="0" y="4" width="14" height="2" />
    <rect x="6" y="8" width="8" height="2" />
  </svg>
)

const textAlignOptions = [
  { id: 'left', name: 'Left', Icon: AlignLeftIcon },
  { id: 'center', name: 'Center', Icon: AlignCenterIcon },
  { id: 'right', name: 'Right', Icon: AlignRightIcon },
]

const textLayers = [
  { id: 'title', label: 'Title', placeholder: 'Enter title...', multiline: true },
  { id: 'tagline', label: 'Tagline', placeholder: 'Your tagline here...', multiline: true },
  { id: 'bodyHeading', label: 'Body Heading', placeholder: 'Section heading...', multiline: true },
  { id: 'bodyText', label: 'Body Text', placeholder: 'Enter body text...', multiline: true },
  { id: 'cta', label: 'Call to Action', placeholder: 'Learn More', multiline: true },
  { id: 'footnote', label: 'Footnote', placeholder: 'Terms apply...', multiline: true },
]

export default memo(function TextEditor({
  text,
  onTextChange,
  theme,
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Text</h3>

      <div className="space-y-4">
        {textLayers.map((layer) => {
          const layerState = text?.[layer.id] || { content: '', visible: false, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0 }

          return (
            <div key={layer.id} className="space-y-2.5 border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
              {/* Header: label + visibility toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{layer.label}</label>
                <button
                  onClick={() => onTextChange(layer.id, { visible: !layerState.visible })}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    layerState.visible
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {layerState.visible ? 'On' : 'Off'}
                </button>
              </div>

              {/* Content input */}
              {layer.multiline ? (
                <textarea
                  value={layerState.content}
                  onChange={(e) => onTextChange(layer.id, { content: e.target.value })}
                  placeholder={layer.placeholder}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                />
              ) : (
                <input
                  type="text"
                  value={layerState.content}
                  onChange={(e) => onTextChange(layer.id, { content: e.target.value })}
                  placeholder={layer.placeholder}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                />
              )}

              {/* Row 1: Color */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-500 dark:text-gray-400">Color:</span>
                {/* Theme colors */}
                {themeColorOptions.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onTextChange(layer.id, { color: color.id })}
                    title={color.name}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      layerState.color === color.id
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: theme[color.id] }}
                  />
                ))}
                {/* Separator */}
                <span className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />
                {/* Neutral colors */}
                {neutralColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onTextChange(layer.id, { color: color.id })}
                    title={color.name}
                    className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                      layerState.color === color.id
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>

              {/* Row 2: Size */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Size:</span>
                {sizeOptions.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => onTextChange(layer.id, { size: size.id })}
                    title={`Size ${size.name}`}
                    className={`w-6 h-6 text-xs font-medium rounded-md ${
                      layerState.size === size.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>

              {/* Row 3: Bold/Italic + Letter Spacing */}
              <div className="flex items-center gap-4">
                {/* Bold/Italic toggles */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Style:</span>
                  <button
                    onClick={() => onTextChange(layer.id, { bold: !layerState.bold })}
                    title="Bold"
                    className={`w-7 h-6 text-xs font-bold rounded-md ${
                      layerState.bold
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    B
                  </button>
                  <button
                    onClick={() => onTextChange(layer.id, { italic: !layerState.italic })}
                    title="Italic"
                    className={`w-7 h-6 text-xs italic rounded-md ${
                      layerState.italic
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    I
                  </button>
                </div>

                {/* Letter spacing */}
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Spacing:</span>
                  {letterSpacingOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onTextChange(layer.id, { letterSpacing: opt.id })}
                      title={opt.name}
                      className={`px-2 h-6 text-xs rounded-md ${
                        layerState.letterSpacing === opt.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {opt.name.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Alignment */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 dark:text-gray-400">Align:</span>
                {textAlignOptions.map((align) => {
                  const isActive = layerState.textAlign === align.id
                  return (
                    <button
                      key={align.id}
                      onClick={() => onTextChange(layer.id, { textAlign: align.id })}
                      title={align.name}
                      className={`w-7 h-6 rounded-md flex items-center justify-center ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <align.Icon />
                    </button>
                  )
                })}
                {/* Reset to cell default */}
                {layerState.textAlign !== null && (
                  <button
                    onClick={() => onTextChange(layer.id, { textAlign: null })}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1"
                    title="Use cell default alignment"
                  >
                    ×
                  </button>
                )}
                {layerState.textAlign === null && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">(cell default)</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
