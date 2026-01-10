const splitTypes = [
  { id: 'none', name: 'Full Image', icon: '▣' },
  { id: 'vertical', name: 'Columns', icon: '▥' },
  { id: 'horizontal', name: 'Rows', icon: '▤' },
]

const sectionCounts = [
  { id: 2, name: '2' },
  { id: 3, name: '3' },
]

const imagePositions = {
  2: [
    { id: 'first', name: 'First' },
    { id: 'last', name: 'Last' },
  ],
  3: [
    { id: 'first', name: 'First' },
    { id: 'middle', name: 'Middle' },
    { id: 'last', name: 'Last' },
  ],
}

const textAlignOptions = [
  { id: 'left', name: 'Left', icon: '⊣' },
  { id: 'center', name: 'Center', icon: '⊡' },
  { id: 'right', name: 'Right', icon: '⊢' },
]

const verticalAlignOptions = [
  { id: 'start', name: 'Top', icon: '⊤' },
  { id: 'center', name: 'Middle', icon: '⊡' },
  { id: 'end', name: 'Bottom', icon: '⊥' },
]

const proportionPresets = [
  { value: 33, label: '33%' },
  { value: 50, label: '50%' },
  { value: 60, label: '60%' },
  { value: 70, label: '70%' },
]

export default function LayoutSelector({ layout, onLayoutChange }) {
  const { splitType, sections, imagePosition, imageProportion, textOnImage, textAlign, textVerticalAlign } = layout

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Layout</h3>

      {/* Split Type */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Split Type</label>
        <div className="flex gap-1">
          {splitTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onLayoutChange({ splitType: type.id })}
              className={`flex-1 px-2 py-2 text-xs rounded flex flex-col items-center gap-1 ${
                splitType === type.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">{type.icon}</span>
              <span>{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Only show split options when not 'none' */}
      {splitType !== 'none' && (
        <>
          {/* Number of Sections */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sections</label>
            <div className="flex gap-1">
              {sectionCounts.map((count) => (
                <button
                  key={count.id}
                  onClick={() => {
                    const updates = { sections: count.id }
                    // Reset imagePosition if switching to 2 sections and currently 'middle'
                    if (count.id === 2 && imagePosition === 'middle') {
                      updates.imagePosition = 'first'
                    }
                    onLayoutChange(updates)
                  }}
                  className={`flex-1 px-3 py-2 text-sm rounded ${
                    sections === count.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {count.name}
                </button>
              ))}
            </div>
          </div>

          {/* Image Position */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Image Position</label>
            <div className="flex gap-1">
              {imagePositions[sections].map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => onLayoutChange({ imagePosition: pos.id })}
                  className={`flex-1 px-2 py-1.5 text-xs rounded ${
                    imagePosition === pos.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {pos.name}
                </button>
              ))}
            </div>
          </div>

          {/* Image Proportion */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Image Size: {imageProportion}%
            </label>
            <div className="flex gap-1 mb-2">
              {proportionPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => onLayoutChange({ imageProportion: preset.value })}
                  className={`flex-1 px-2 py-1 text-xs rounded ${
                    imageProportion === preset.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={imageProportion}
              onChange={(e) => onLayoutChange({ imageProportion: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Text on Image Toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={textOnImage}
                onChange={(e) => onLayoutChange({ textOnImage: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-gray-600">Text overlay on image</span>
            </label>
            <p className="text-[10px] text-gray-400 mt-0.5 ml-6">
              Shows title, tagline & CTA on the image section
            </p>
          </div>
        </>
      )}

      {/* Text Alignment - always shown */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Text Align</label>
        <div className="flex gap-1">
          {textAlignOptions.map((align) => (
            <button
              key={align.id}
              onClick={() => onLayoutChange({ textAlign: align.id })}
              title={align.name}
              className={`flex-1 px-2 py-1.5 text-sm rounded ${
                textAlign === align.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {align.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Alignment - for fullbleed or text sections */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Vertical Align</label>
        <div className="flex gap-1">
          {verticalAlignOptions.map((align) => (
            <button
              key={align.id}
              onClick={() => onLayoutChange({ textVerticalAlign: align.id })}
              title={align.name}
              className={`flex-1 px-2 py-1.5 text-sm rounded ${
                textVerticalAlign === align.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {align.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Preview */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Preview</label>
        <LayoutPreview layout={layout} />
      </div>
    </div>
  )
}

function LayoutPreview({ layout }) {
  const { splitType, sections, imagePosition, imageProportion, textOnImage } = layout

  const imgClass = 'bg-blue-300'
  const textClass = 'bg-gray-200 flex items-center justify-center'
  const textLine = <div className="w-4 h-0.5 bg-gray-400 rounded" />

  if (splitType === 'none') {
    return (
      <div className={`w-full h-16 rounded ${imgClass} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-1 bg-blue-500 rounded" />
          <div className="w-6 h-0.5 bg-blue-500 rounded" />
        </div>
      </div>
    )
  }

  const isVertical = splitType === 'vertical'
  const flexDir = isVertical ? 'flex-row' : 'flex-col'

  // Build sections array
  const sectionElements = []
  const imgSize = `${imageProportion}%`
  const textSize = sections === 2 ? `${100 - imageProportion}%` : `${(100 - imageProportion) / 2}%`

  for (let i = 0; i < sections; i++) {
    const isImage =
      (imagePosition === 'first' && i === 0) ||
      (imagePosition === 'middle' && i === 1) ||
      (imagePosition === 'last' && i === sections - 1)

    const size = isImage ? imgSize : textSize
    const sizeStyle = isVertical ? { width: size } : { height: size }

    if (isImage) {
      sectionElements.push(
        <div key={i} className={`${imgClass} relative`} style={sizeStyle}>
          {textOnImage && (
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <div className="w-4 h-0.5 bg-blue-600 rounded" />
            </div>
          )}
        </div>
      )
    } else {
      sectionElements.push(
        <div key={i} className={textClass} style={sizeStyle}>
          {textLine}
        </div>
      )
    }
  }

  return (
    <div className={`w-full h-16 rounded overflow-hidden flex ${flexDir}`}>
      {sectionElements}
    </div>
  )
}
