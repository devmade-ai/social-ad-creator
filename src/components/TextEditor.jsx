import { useState, useMemo } from 'react'

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
  { id: 'title', label: 'Title', placeholder: 'Enter title...', multiline: false, group: 'titleGroup' },
  { id: 'tagline', label: 'Tagline', placeholder: 'Your tagline here...', multiline: false, group: 'titleGroup' },
  { id: 'bodyHeading', label: 'Body Heading', placeholder: 'Section heading...', multiline: false, group: 'bodyGroup' },
  { id: 'bodyText', label: 'Body Text', placeholder: 'Enter body text...', multiline: true, group: 'bodyGroup' },
  { id: 'cta', label: 'Call to Action', placeholder: 'Learn More', multiline: false, group: 'cta' },
  { id: 'footnote', label: 'Footnote', placeholder: 'Terms apply...', multiline: false, group: 'footnote' },
]

const textGroupDefs = [
  { id: 'titleGroup', name: 'Title + Tagline', layers: ['title', 'tagline'] },
  { id: 'bodyGroup', name: 'Body Text', layers: ['bodyHeading', 'bodyText'] },
  { id: 'cta', name: 'Call to Action', layers: ['cta'] },
  { id: 'footnote', name: 'Footnote', layers: ['footnote'] },
]

// Sub-tabs for the Text section
const subTabs = [
  { id: 'content', name: 'Content', icon: '✎' },
  { id: 'style', name: 'Style', icon: '◐' },
  { id: 'placement', name: 'Placement', icon: '⊞' },
]

// Helper to get cell info for display
function getCellInfo(layout) {
  const { type, structure } = layout
  if (type === 'fullbleed' || !structure) {
    return [{ index: 0, label: 'Full', sectionIndex: 0, subIndex: 0 }]
  }

  const cells = []
  let cellIndex = 0
  const isRows = type === 'rows'

  structure.forEach((section, sectionIndex) => {
    const subdivisions = section.subdivisions || 1
    for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
      let label
      if (subdivisions === 1) {
        label = isRows ? `Row ${sectionIndex + 1}` : `Col ${sectionIndex + 1}`
      } else {
        const subLabel = isRows ? `C${subIndex + 1}` : `R${subIndex + 1}`
        const sectionLabel = isRows ? `R${sectionIndex + 1}` : `C${sectionIndex + 1}`
        label = `${sectionLabel}-${subLabel}`
      }
      cells.push({ index: cellIndex, label, sectionIndex, subIndex })
      cellIndex++
    }
  })

  return cells
}

export default function TextEditor({
  text,
  onTextChange,
  theme,
  textGroups = {},
  onTextGroupsChange,
  layout = { type: 'fullbleed', structure: [], imageCell: 0 },
}) {
  const [activeSubTab, setActiveSubTab] = useState('content')

  const cellInfoList = useMemo(() => getCellInfo(layout), [layout])

  // Render sub-tab content
  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'content':
        return (
          <div className="space-y-3">
            {textLayers.map((layer) => {
              const layerState = text?.[layer.id] || { content: '', visible: false, color: 'secondary', size: 1 }

              return (
                <div key={layer.id} className="space-y-1.5 border-b border-gray-100 pb-2 last:border-0">
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
                </div>
              )
            })}
          </div>
        )

      case 'style':
        return (
          <div className="space-y-3">
            {textLayers.map((layer) => {
              const layerState = text?.[layer.id] || { content: '', visible: false, color: 'secondary', size: 1 }

              return (
                <div key={layer.id} className="space-y-1.5 border-b border-gray-100 pb-2 last:border-0">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">{layer.label}</label>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      layerState.visible ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                    }`}>
                      {layerState.visible ? 'visible' : 'hidden'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Color options */}
                    <div className="flex gap-1">
                      <span className="text-[10px] text-gray-400 mr-1">Color:</span>
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
                    <div className="flex gap-0.5 ml-auto">
                      <span className="text-[10px] text-gray-400 mr-1">Size:</span>
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
        )

      case 'placement':
        const isFullbleed = layout.type === 'fullbleed'

        if (isFullbleed) {
          return (
            <div className="text-xs text-gray-500 text-center py-4">
              Full image layout has a single cell.
              <br />
              All text appears in the same area.
              <br />
              <span className="text-gray-400">Switch to Rows or Columns in the Layout tab to place text in different cells.</span>
            </div>
          )
        }

        return (
          <div className="space-y-3">
            <p className="text-[10px] text-gray-500">
              Assign text groups to specific cells in your layout
            </p>

            {textGroupDefs.map((group) => {
              const currentCell = textGroups?.[group.id]?.cell
              const groupLayers = textLayers.filter(l => l.group === group.id)
              const visibleCount = groupLayers.filter(l => text?.[l.id]?.visible).length

              return (
                <div
                  key={group.id}
                  className={`p-2 rounded ${visibleCount > 0 ? 'bg-gray-50' : 'bg-gray-50/50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-medium text-gray-700">{group.name}</span>
                      <span className={`ml-2 text-[10px] ${visibleCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {visibleCount > 0 ? `${visibleCount} visible` : 'hidden'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => onTextGroupsChange?.({ [group.id]: { cell: null } })}
                      className={`px-2 py-1 text-[10px] rounded ${
                        currentCell === null || currentCell === undefined
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      Auto
                    </button>
                    {cellInfoList.map((cell) => (
                      <button
                        key={cell.index}
                        onClick={() => onTextGroupsChange?.({ [group.id]: { cell: cell.index } })}
                        className={`px-2 py-1 text-[10px] rounded ${
                          currentCell === cell.index
                            ? 'bg-blue-500 text-white'
                            : cell.index === layout.imageCell
                              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title={cell.index === layout.imageCell ? 'Image cell' : ''}
                      >
                        {cell.label}
                        {cell.index === layout.imageCell && ' 📷'}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            <p className="text-[10px] text-gray-400 text-center mt-2">
              Tip: Use the Layout tab for more placement options
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Text</h3>

      {/* Sub-tabs */}
      <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex-1 px-1.5 py-1.5 text-[10px] rounded-md transition-colors flex flex-col items-center gap-0.5 ${
              activeSubTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-xs">{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {renderSubTabContent()}
    </div>
  )
}
