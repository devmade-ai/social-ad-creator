import { memo, useMemo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import { neutralColors } from '../config/themes'
import { platforms } from '../config/platforms'

// Theme color options
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
  { id: -1, name: 'Tight', label: 'T' },
  { id: 0, name: 'Normal', label: 'N' },
  { id: 1, name: 'Wide', label: 'W' },
  { id: 2, name: 'Wider', label: 'W+' },
]

// Alignment icons
const AlignAutoIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
    <rect x="2" y="0" width="10" height="2" opacity="0.4" />
    <rect x="0" y="4" width="14" height="2" opacity="0.4" />
    <rect x="3" y="8" width="8" height="2" opacity="0.4" />
  </svg>
)
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
  { id: null, name: 'Auto (cell default)', Icon: AlignAutoIcon },
  { id: 'left', name: 'Left', Icon: AlignLeftIcon },
  { id: 'center', name: 'Center', Icon: AlignCenterIcon },
  { id: 'right', name: 'Right', Icon: AlignRightIcon },
]

// Text element definitions organized by group
const textGroups = [
  {
    id: 'titleTagline',
    name: 'Title & Tagline',
    elements: [
      { id: 'title', label: 'Title', placeholder: 'Enter title...' },
      { id: 'tagline', label: 'Tagline', placeholder: 'Your tagline here...' },
    ],
  },
  {
    id: 'body',
    name: 'Body',
    elements: [
      { id: 'bodyHeading', label: 'Heading', placeholder: 'Section heading...' },
      { id: 'bodyText', label: 'Text', placeholder: 'Enter body text...' },
    ],
  },
  {
    id: 'cta',
    name: 'Call to Action',
    elements: [{ id: 'cta', label: 'CTA', placeholder: 'Learn More' }],
  },
  {
    id: 'footnote',
    name: 'Footnote',
    elements: [{ id: 'footnote', label: 'Footnote', placeholder: 'Terms apply...' }],
  },
]

// Helper to get cell info
function getCellInfo(layout) {
  const { structure } = layout
  if (!structure || structure.length === 0) {
    return [{ index: 0, label: '1' }]
  }

  const cells = []
  let cellIndex = 0

  structure.forEach((section) => {
    const subdivisions = section.subdivisions || 1
    for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
      cells.push({ index: cellIndex, label: `${cellIndex + 1}` })
      cellIndex++
    }
  })

  return cells
}

// Mini cell grid for text element cell assignment
function MiniCellGrid({ layout, imageCells = [], highlightCell, onSelectCell, platform }) {
  const { type, structure } = layout
  const isFullbleed = type === 'fullbleed'
  const isRows = type === 'rows'
  // Normalize imageCells to always be an array
  const normalizedImageCells = Array.isArray(imageCells) ? imageCells : [imageCells]

  const normalizedStructure =
    isFullbleed || !structure || structure.length === 0
      ? [{ size: 100, subdivisions: 1, subSizes: [100] }]
      : structure

  const platformData = platforms.find((p) => p.id === platform) || platforms[0]
  const aspectRatio = platformData.width / platformData.height

  let cellIndex = 0

  return (
    <div
      className="flex overflow-hidden border border-zinc-300 dark:border-zinc-600 rounded"
      style={{
        width: '64px',
        height: `${64 / aspectRatio}px`,
        flexDirection: isRows || isFullbleed ? 'column' : 'row',
      }}
    >
      {normalizedStructure.map((section, sectionIndex) => {
        const sectionSize = section.size || 100 / normalizedStructure.length
        const subdivisions = section.subdivisions || 1
        const subSizes = section.subSizes || Array(subdivisions).fill(100 / subdivisions)

        const sectionCells = []
        for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
          const currentCellIndex = cellIndex
          const isImage = normalizedImageCells.includes(currentCellIndex)
          const isHighlighted = highlightCell === currentCellIndex
          cellIndex++

          let bgClass, content
          if (isHighlighted) {
            bgClass = 'bg-primary hover:bg-primary-hover'
            content = <span className="text-white text-[8px]">✓</span>
          } else if (isImage) {
            bgClass = 'bg-primary hover:bg-primary-hover'
            content = <span className="text-white text-[8px]">📷</span>
          } else {
            bgClass = 'bg-zinc-200 dark:bg-dark-subtle hover:bg-zinc-300 dark:hover:bg-dark-elevated'
            content = <span className="text-zinc-500 dark:text-zinc-400 text-[8px]">{currentCellIndex + 1}</span>
          }

          sectionCells.push(
            <div
              key={`cell-${currentCellIndex}`}
              className={`relative cursor-pointer transition-colors min-h-[12px] ${bgClass} flex items-center justify-center`}
              style={{ flex: `1 1 ${subSizes[subIndex]}%` }}
              onClick={() => onSelectCell(currentCellIndex)}
            >
              {content}
            </div>
          )
        }

        return (
          <div
            key={`section-${sectionIndex}`}
            className={`flex ${isRows || isFullbleed ? 'flex-row' : 'flex-col'}`}
            style={{ flex: `1 1 ${sectionSize}%` }}
          >
            {sectionCells}
          </div>
        )
      })}
    </div>
  )
}

// Single text element editor
function TextElementEditor({
  element,
  text,
  onTextChange,
  textCells,
  onTextCellsChange,
  layout,
  theme,
  platform,
}) {
  // Support both old imageCell (single) and new imageCells (array) format
  const imageCells = layout.imageCells ?? (layout.imageCell !== undefined ? [layout.imageCell] : [0])
  const layerState = text?.[element.id] || {
    content: '',
    visible: false,
    color: 'secondary',
    size: 1,
    bold: false,
    italic: false,
    letterSpacing: 0,
    textAlign: null,
  }
  const currentCell = textCells?.[element.id]
  const isVisible = layerState.visible !== false

  return (
    <div className="space-y-2 pb-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
      {/* Row 1: Visibility + Label + Cell Assignment */}
      <div className="flex items-center gap-2">
        {/* Visibility Toggle */}
        <button
          onClick={() => onTextChange(element.id, { visible: !isVisible })}
          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 ${
            isVisible ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'bg-zinc-100 dark:bg-dark-subtle text-zinc-400'
          }`}
          title={isVisible ? 'Visible - click to hide' : 'Hidden - click to show'}
        >
          {isVisible ? '✓' : '○'}
        </button>

        {/* Label */}
        <span className={`text-sm flex-1 min-w-0 ${isVisible ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-400'}`}>
          {element.label}
        </span>

        {/* Cell Selector */}
        <MiniCellGrid
          layout={layout}
          imageCells={imageCells}
          highlightCell={currentCell}
          onSelectCell={(idx) => onTextCellsChange?.({ [element.id]: idx })}
          platform={platform}
        />

        {/* Cell Label */}
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 w-10 shrink-0 text-right">
          {currentCell !== null && currentCell !== undefined ? `Cell ${currentCell + 1}` : 'Auto'}
        </span>

        {/* Reset Cell */}
        {currentCell !== null && currentCell !== undefined && (
          <button
            onClick={() => onTextCellsChange?.({ [element.id]: null })}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 shrink-0"
            title="Reset to auto"
          >
            ×
          </button>
        )}
      </div>

      {/* Row 2: Text Input */}
      <textarea
        value={layerState.content}
        onChange={(e) => onTextChange(element.id, { content: e.target.value })}
        placeholder={element.placeholder}
        rows={2}
        className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-white dark:bg-dark-subtle dark:text-zinc-100 dark:placeholder-zinc-500"
      />

      {/* Row 3: Alignment */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Align:</span>
        {textAlignOptions.map((align) => {
          const isActive = layerState.textAlign === align.id
          return (
            <button
              key={align.id ?? 'auto'}
              onClick={() => onTextChange(element.id, { textAlign: align.id })}
              title={align.name}
              className={`w-6 h-5 rounded flex items-center justify-center transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-zinc-100 dark:bg-dark-subtle text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-dark-elevated'
              }`}
            >
              <align.Icon />
            </button>
          )
        })}
      </div>

      {/* Row 4: Color */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Color:</span>
        {themeColorOptions.map((color) => (
          <button
            key={color.id}
            onClick={() => onTextChange(element.id, { color: color.id })}
            title={color.name}
            className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
              layerState.color === color.id
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-zinc-200 dark:border-zinc-600'
            }`}
            style={{ backgroundColor: theme[color.id] }}
          />
        ))}
        <span className="w-px h-3 bg-zinc-200 dark:bg-dark-subtle mx-0.5" />
        {neutralColors.map((color) => (
          <button
            key={color.id}
            onClick={() => onTextChange(element.id, { color: color.id })}
            title={color.name}
            className={`w-4 h-4 rounded-full border transition-transform hover:scale-110 ${
              layerState.color === color.id
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-zinc-300 dark:border-zinc-600'
            }`}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>

      {/* Row 5: Size + Style + Spacing */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Size */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Size:</span>
          {sizeOptions.map((size) => (
            <button
              key={size.id}
              onClick={() => onTextChange(element.id, { size: size.id })}
              title={`Size ${size.name}`}
              className={`w-5 h-5 text-[10px] font-medium rounded ${
                layerState.size === size.id
                  ? 'bg-primary text-white'
                  : 'bg-zinc-100 dark:bg-dark-subtle text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-dark-elevated'
              }`}
            >
              {size.name}
            </button>
          ))}
        </div>

        {/* Bold/Italic */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTextChange(element.id, { bold: !layerState.bold })}
            title="Bold"
            className={`w-6 h-5 text-[10px] font-bold rounded ${
              layerState.bold
                ? 'bg-primary text-white'
                : 'bg-zinc-100 dark:bg-dark-subtle text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-dark-elevated'
            }`}
          >
            B
          </button>
          <button
            onClick={() => onTextChange(element.id, { italic: !layerState.italic })}
            title="Italic"
            className={`w-6 h-5 text-[10px] italic rounded ${
              layerState.italic
                ? 'bg-primary text-white'
                : 'bg-zinc-100 dark:bg-dark-subtle text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-dark-elevated'
            }`}
          >
            I
          </button>
        </div>

        {/* Letter spacing */}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Sp:</span>
          {letterSpacingOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onTextChange(element.id, { letterSpacing: opt.id })}
              title={opt.name}
              className={`px-1.5 h-5 text-[10px] rounded ${
                layerState.letterSpacing === opt.id
                  ? 'bg-primary text-white'
                  : 'bg-zinc-100 dark:bg-dark-subtle text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-dark-elevated'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(function ContentTab({
  text,
  onTextChange,
  textCells,
  onTextCellsChange,
  layout,
  theme,
  platform,
}) {
  const cellInfoList = useMemo(() => getCellInfo(layout), [layout])

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Content</h3>

      {textGroups.map((group) => (
        <CollapsibleSection key={group.id} title={group.name} defaultExpanded={false}>
          <div className="space-y-3">
            {group.elements.map((element) => (
              <TextElementEditor
                key={element.id}
                element={element}
                text={text}
                onTextChange={onTextChange}
                textCells={textCells}
                onTextCellsChange={onTextCellsChange}
                layout={layout}
                theme={theme}
                platform={platform}
              />
            ))}
          </div>
        </CollapsibleSection>
      ))}
    </div>
  )
})
