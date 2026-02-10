import { memo, useMemo } from 'react'
import CollapsibleSection from './CollapsibleSection'
import { neutralColors } from '../config/themes'
import { platforms } from '../config/platforms'

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

const AlignAutoIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
    <rect x="0" y="0" width="8" height="2" opacity="0.4" />
    <rect x="2" y="4" width="10" height="2" opacity="0.4" />
    <rect x="4" y="8" width="10" height="2" opacity="0.4" />
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

function MiniCellGrid({ layout, imageCells = [], highlightCell, onSelectCell, platform }) {
  const { type, structure } = layout
  const isFullbleed = type === 'fullbleed'
  const isRows = type === 'rows'
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
      className="flex overflow-hidden border border-ui-border-strong rounded"
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
            bgClass = 'bg-ui-surface-inset hover:bg-ui-surface-hover'
            content = <span className="text-ui-text-subtle text-[8px]">{currentCellIndex + 1}</span>
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
    <div className="space-y-2 pb-3 border-b border-ui-border-subtle last:border-0 last:pb-0">
      {/* Row 1: Visibility + Label + Cell Assignment */}
      <div className="flex items-center gap-2">
        {/* Visibility Toggle */}
        <button
          onClick={() => onTextChange(element.id, { visible: !isVisible })}
          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 ${
            isVisible ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'bg-ui-surface-inset text-ui-text-faint'
          }`}
          title={isVisible ? 'Visible - click to hide' : 'Hidden - click to show'}
        >
          {isVisible ? '✓' : '○'}
        </button>

        {/* Label */}
        <span className={`text-sm flex-1 min-w-0 ${isVisible ? 'text-ui-text' : 'text-ui-text-faint'}`}>
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
        <span className="text-[10px] text-ui-text-subtle w-10 shrink-0 text-right">
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
        className="w-full px-3 py-2 text-sm text-ui-text border border-ui-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-white dark:bg-dark-subtle placeholder-zinc-400 dark:placeholder-zinc-500"
      />

      {/* Row 3: Alignment */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-ui-text-subtle">Align:</span>
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
                  : 'bg-ui-surface-inset text-ui-text-subtle hover:bg-ui-surface-hover'
              }`}
            >
              <align.Icon />
            </button>
          )
        })}
      </div>

      {/* Row 4: Color */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[10px] text-ui-text-subtle">Color:</span>
        {themeColorOptions.map((color) => (
          <button
            key={color.id}
            onClick={() => onTextChange(element.id, { color: color.id })}
            title={color.name}
            className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
              layerState.color === color.id
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-ui-border'
            }`}
            style={{ backgroundColor: theme[color.id] }}
          />
        ))}
        <span className="w-px h-3 bg-ui-surface-hover mx-0.5" />
        {neutralColors.map((color) => (
          <button
            key={color.id}
            onClick={() => onTextChange(element.id, { color: color.id })}
            title={color.name}
            className={`w-4 h-4 rounded-full border transition-transform hover:scale-110 ${
              layerState.color === color.id
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-ui-border-strong'
            }`}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>

      {/* Row 5: Size + Style + Spacing */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Size */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-ui-text-subtle">Size:</span>
          {sizeOptions.map((size) => (
            <button
              key={size.id}
              onClick={() => onTextChange(element.id, { size: size.id })}
              title={`Size ${size.name}`}
              className={`w-5 h-5 text-[10px] font-medium rounded ${
                layerState.size === size.id
                  ? 'bg-primary text-white'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
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
                : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
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
                : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
            }`}
          >
            I
          </button>
        </div>

        {/* Letter spacing */}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[10px] text-ui-text-subtle">Sp:</span>
          {letterSpacingOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onTextChange(element.id, { letterSpacing: opt.id })}
              title={opt.name}
              className={`px-1.5 h-5 text-[10px] rounded ${
                layerState.letterSpacing === opt.id
                  ? 'bg-primary text-white'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
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

function FreeformCellEditor({
  cellIndex,
  cellData,
  onFreeformTextChange,
  theme,
  layout,
}) {
  const data = cellData || {
    content: '',
    markdown: false,
    color: 'secondary',
    size: 1,
    bold: false,
    italic: false,
    letterSpacing: 0,
    textAlign: null,
  }

  const isImageCell = (layout.imageCells || []).includes(cellIndex)

  return (
    <div className="space-y-2">
      {/* Cell header */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-ui-text">
          Cell {cellIndex + 1}
          {isImageCell && <span className="ml-1 text-[10px] text-ui-text-subtle">(image)</span>}
        </span>
        {/* Markdown toggle */}
        <button
          onClick={() => onFreeformTextChange(cellIndex, { markdown: !data.markdown })}
          title={data.markdown ? 'Markdown enabled - click to disable' : 'Enable markdown'}
          className={`ml-auto px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
            data.markdown
              ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400'
              : 'bg-ui-surface-inset text-ui-text-faint hover:bg-ui-surface-hover'
          }`}
        >
          MD
        </button>
      </div>

      {/* Text input */}
      <textarea
        value={data.content}
        onChange={(e) => onFreeformTextChange(cellIndex, { content: e.target.value })}
        placeholder={data.markdown ? 'Write in **markdown**...' : 'Enter text...'}
        rows={3}
        className="w-full px-3 py-2 text-sm text-ui-text border border-ui-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-white dark:bg-dark-subtle placeholder-zinc-400 dark:placeholder-zinc-500 font-mono"
        style={{ fontFamily: data.markdown ? 'monospace' : 'inherit' }}
      />

      {/* Controls row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Alignment */}
        <div className="flex items-center gap-1">
          {textAlignOptions.map((align) => {
            const isActive = data.textAlign === align.id
            return (
              <button
                key={align.id ?? 'auto'}
                onClick={() => onFreeformTextChange(cellIndex, { textAlign: align.id })}
                title={align.name}
                className={`w-6 h-5 rounded flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-ui-surface-inset text-ui-text-subtle hover:bg-ui-surface-hover'
                }`}
              >
                <align.Icon />
              </button>
            )
          })}
        </div>

        {/* Color */}
        <div className="flex items-center gap-1">
          {themeColorOptions.map((color) => (
            <button
              key={color.id}
              onClick={() => onFreeformTextChange(cellIndex, { color: color.id })}
              title={color.name}
              className={`w-4 h-4 rounded-full border-2 transition-transform hover:scale-110 ${
                data.color === color.id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-ui-border'
              }`}
              style={{ backgroundColor: theme[color.id] }}
            />
          ))}
          {neutralColors.map((color) => (
            <button
              key={color.id}
              onClick={() => onFreeformTextChange(cellIndex, { color: color.id })}
              title={color.name}
              className={`w-3.5 h-3.5 rounded-full border transition-transform hover:scale-110 ${
                data.color === color.id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-ui-border-strong'
              }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>

        {/* Size */}
        <div className="flex items-center gap-1 ml-auto">
          {sizeOptions.map((size) => (
            <button
              key={size.id}
              onClick={() => onFreeformTextChange(cellIndex, { size: size.id })}
              title={`Size ${size.name}`}
              className={`w-5 h-5 text-[10px] font-medium rounded ${
                data.size === size.id
                  ? 'bg-primary text-white'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
              }`}
            >
              {size.name}
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
  textMode = 'structured',
  onTextModeChange,
  freeformText = {},
  onFreeformTextChange,
}) {
  const cellInfoList = useMemo(() => getCellInfo(layout), [layout])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ui-text">Content</h3>

        {/* Text mode toggle */}
        <div className="flex bg-ui-surface-inset rounded-lg p-0.5">
          <button
            onClick={() => onTextModeChange?.('structured')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              textMode === 'structured'
                ? 'bg-white dark:bg-dark-card text-ui-text shadow-sm'
                : 'text-ui-text-muted hover:text-ui-text'
            }`}
          >
            Structured
          </button>
          <button
            onClick={() => onTextModeChange?.('freeform')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              textMode === 'freeform'
                ? 'bg-white dark:bg-dark-card text-ui-text shadow-sm'
                : 'text-ui-text-muted hover:text-ui-text'
            }`}
          >
            Freeform
          </button>
        </div>
      </div>

      {textMode === 'structured' ? (
        <>
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
        </>
      ) : (
        <>
          <p className="text-[11px] text-ui-text-subtle">
            Write text for each cell. Toggle MD for markdown formatting.
          </p>
          {cellInfoList.map((cell) => (
            <CollapsibleSection
              key={cell.index}
              title={`Cell ${cell.label}`}
              defaultExpanded={cell.index === 0}
            >
              <FreeformCellEditor
                cellIndex={cell.index}
                cellData={freeformText[cell.index]}
                onFreeformTextChange={onFreeformTextChange}
                theme={theme}
                layout={layout}
              />
            </CollapsibleSection>
          ))}
        </>
      )}
    </div>
  )
})
