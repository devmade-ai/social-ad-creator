const colorOptions = [
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

const textLayers = [
  { id: 'title', label: 'Title', placeholder: 'Enter title...', multiline: false },
  { id: 'tagline', label: 'Tagline', placeholder: 'Your tagline here...', multiline: false },
  { id: 'bodyHeading', label: 'Body Heading', placeholder: 'Section heading...', multiline: false },
  { id: 'bodyText', label: 'Body Text', placeholder: 'Enter body text...', multiline: true },
  { id: 'cta', label: 'Call to Action', placeholder: 'Learn More', multiline: false },
  { id: 'footnote', label: 'Footnote', placeholder: 'Terms apply...', multiline: false },
]

export default function TextEditor({
  text,
  onTextChange,
  theme,
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Text</h3>

      <div className="space-y-3">
        {textLayers.map((layer) => {
          const layerState = text?.[layer.id] || { content: '', visible: false, color: 'secondary', size: 1 }

          return (
            <div key={layer.id} className="space-y-1.5 border-b border-gray-100 pb-3 last:border-0">
              {/* Header: label + visibility toggle */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">{layer.label}</label>
                <button
                  onClick={() => onTextChange(layer.id, { visible: !layerState.visible })}
                  className={`text-[10px] px-2 py-0.5 rounded ${
                    layerState.visible
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
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
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={layerState.content}
                  onChange={(e) => onTextChange(layer.id, { content: e.target.value })}
                  placeholder={layer.placeholder}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}

              {/* Style: color + size inline */}
              <div className="flex items-center gap-3">
                {/* Color options */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">Color:</span>
                  {colorOptions.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => onTextChange(layer.id, { color: color.id })}
                      title={color.name}
                      className={`w-5 h-5 rounded border-2 ${
                        layerState.color === color.id
                          ? 'border-blue-500'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: theme[color.id] }}
                    />
                  ))}
                </div>

                {/* Size options */}
                <div className="flex items-center gap-0.5 ml-auto">
                  <span className="text-[10px] text-gray-400">Size:</span>
                  {sizeOptions.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => onTextChange(layer.id, { size: size.id })}
                      title={`Size ${size.name}`}
                      className={`w-5 h-5 text-[9px] font-medium rounded ${
                        layerState.size === size.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
