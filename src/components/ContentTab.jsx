// Requirement: Two text editing modes — structured (text groups) and freeform (per-cell editors).
// Approach: Both modes use the same cell selector. Structured mode shows guided fields
//   (title, tagline, body, CTA, footnote) for the selected cell. Freeform mode shows a
//   single markdown editor per cell.
// Alternatives:
//   - Global text with cell assignment: Rejected — indirect, confusing for non-technical users.
//   - Single mode only: Rejected — structured is great for standard layouts, but freeform
//     gives power users full control for custom text-heavy designs.
import { memo, useMemo, useRef, useCallback, useState, useEffect } from 'react'
import CollapsibleSection from './CollapsibleSection'
import MiniCellGrid from './MiniCellGrid'
import TextStyleControls from './TextStyleControls'
import FreeformCellEditor from './FreeformEditor'
import { getCellInfo, getCellPositionLabel } from '../utils/cellUtils'
import { defaultTextLayer } from '../config/textDefaults'
import { textAlignOptions, verticalAlignOptions } from '../config/alignment'

const noop = () => {}

// Requirement: Deduplicate SVG icons used across multiple components.
// Approach: Named icon components rendered inline, avoiding repeated SVG path strings.
const GearIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const CloseIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

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

// Requirement: Collapsible styling controls to reduce visual noise (#2)
// Approach: Style toggle button reveals alignment, color, size, bold/italic, spacing
// Alternatives:
//   - Always visible: Rejected - 5 rows per element is overwhelming
//   - Separate modal: Rejected - too much friction for quick adjustments
function TextElementEditor({
  element,
  cellIndex,
  cellText,
  onTextChange,
  theme,
}) {
  const [showStyle, setShowStyle] = useState(false)
  const layerState = cellText?.[element.id] || defaultTextLayer
  const isVisible = layerState.visible !== false

  // Auto-grow textarea rows based on content (#9)
  const textareaRows = Math.min(8, Math.max(2, (layerState.content || '').split('\n').length + 1))

  // Scroll into view on mobile keyboard (#12)
  // Track timeout for cleanup on unmount to prevent stale DOM operations.
  const scrollTimerRef = useRef(null)
  useEffect(() => {
    return () => clearTimeout(scrollTimerRef.current)
  }, [])
  const handleFocus = useCallback((e) => {
    const el = e.target
    scrollTimerRef.current = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [])

  return (
    <div className="space-y-2 pb-3 border-b border-base-200 last:border-0 last:pb-0">
      {/* Row 1: Visibility + Label + Clear + Style toggle */}
      <div className="flex items-center gap-2">
        {/* Visibility Toggle */}
        <button
          onClick={() => onTextChange(cellIndex, element.id, { visible: !isVisible })}
          className={`w-8 h-8 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-xs shrink-0 active:scale-90 ${
            isVisible ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/50'
          }`}
          title={isVisible ? 'Visible - click to hide' : 'Hidden - click to show'}
        >
          {isVisible ? '✓' : '○'}
        </button>

        {/* Label */}
        <span className={`text-sm flex-1 min-w-0 ${isVisible ? 'text-base-content' : 'text-base-content/50'}`}>
          {element.label}
        </span>

        {/* Clear text button (#4) */}
        {layerState.content && (
          <button
            onClick={() => onTextChange(cellIndex, element.id, { content: '' })}
            className="w-8 h-8 sm:w-7 sm:h-7 rounded flex items-center justify-center text-base-content/50 hover:text-error hover:bg-error/10 active:bg-error/20 transition-colors"
            title="Clear text"
          >
            <CloseIcon />
          </button>
        )}

        {/* Style toggle (#2) */}
        <button
          onClick={() => setShowStyle(!showStyle)}
          className={`w-8 h-8 sm:w-7 sm:h-7 rounded flex items-center justify-center text-xs transition-colors active:scale-90 ${
            showStyle ? 'bg-primary/10 text-primary' : 'bg-base-200 text-base-content/60 hover:bg-base-300'
          }`}
          title="Text style options"
        >
          <GearIcon />
        </button>
      </div>

      {/* Row 2: Text Input — auto-grows with content (#9) */}
      <div className="relative">
        <textarea
          value={layerState.content}
          onChange={(e) => {
            const updates = { content: e.target.value }
            // Requirement: Auto-enable visibility when typing into an uninitialized element.
            // Why: Without this, the toggle shows ON (visible !== false treats undefined as true)
            //   but AdCanvas checks cellText[id]?.visible which is undefined (falsy) → text
            //   doesn't render. Writing visible: true to state keeps display and rendering in sync.
            // Guard: Only auto-enable if visible was never explicitly set (undefined).
            //   If user set visible: false, respect that — don't override their choice.
            const existingVisible = cellText?.[element.id]?.visible
            if (e.target.value && existingVisible === undefined) {
              updates.visible = true
            }
            onTextChange(cellIndex, element.id, updates)
          }}
          onFocus={handleFocus}
          placeholder={element.placeholder}
          rows={textareaRows}
          className="w-full px-3 py-2 text-sm text-base-content border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-base-100 placeholder-base-content/50"
          style={{ resize: 'vertical', minHeight: '2.5rem' }}
        />
      </div>

      {/* Collapsible style controls (#2) — uses shared TextStyleControls */}
      {showStyle && (
        <TextStyleControls
          value={layerState}
          onChange={(updates) => onTextChange(cellIndex, element.id, updates)}
          theme={theme}
        />
      )}
    </div>
  )
}

// Requirement: Content preview in collapsed section headers (#6)
// Approach: Check per-cell text for the active cell to show preview
function getGroupPreview(group, cellText) {
  for (const el of group.elements) {
    const content = cellText?.[el.id]?.content
    if (content) {
      return content.length > 30 ? content.slice(0, 30) + '…' : content
    }
  }
  return null
}

export default memo(function ContentTab({
  text,
  onTextChange,
  layout,
  onLayoutChange,
  theme,
  platform,
  textMode = 'structured',
  onTextModeChange,
  freeformText = {},
  onAddBlock,
  onUpdateBlock,
  onRemoveBlock,
  onMoveBlock,
  selectedCell: selectedCellProp = 0,
  onSelectCell,
}) {
  const cellInfoList = useMemo(() => getCellInfo(layout), [layout])
  const setSelectedCell = onSelectCell || noop

  const maxCell = cellInfoList.length - 1
  const activeCell = selectedCellProp < 0 || selectedCellProp > maxCell ? 0 : selectedCellProp

  const { type: layoutType, textAlign: globalTextAlign, textVerticalAlign: globalVerticalAlign, cellAlignments = [] } = layout

  // Get alignment for active cell (with global fallback)
  const getCellAlignment = (prop) => {
    const targetCell = layoutType === 'fullbleed' ? null : activeCell
    if (targetCell === null) {
      return prop === 'textAlign' ? globalTextAlign : globalVerticalAlign
    }
    const cellAlign = cellAlignments?.[targetCell]?.[prop]
    if (cellAlign !== null && cellAlign !== undefined) return cellAlign
    return prop === 'textAlign' ? globalTextAlign : globalVerticalAlign
  }

  // Set alignment for active cell (or global for fullbleed)
  const setCellAlignment = (prop, value) => {
    const targetCell = layoutType === 'fullbleed' ? null : activeCell
    if (targetCell === null) {
      onLayoutChange({ [prop]: value })
    } else {
      const newAlignments = [...(cellAlignments || [])]
      while (newAlignments.length <= targetCell) {
        newAlignments.push({ textAlign: null, textVerticalAlign: null })
      }
      newAlignments[targetCell] = { ...newAlignments[targetCell], [prop]: value }
      onLayoutChange({ cellAlignments: newAlignments })
    }
  }

  // Cells with content — works for both modes
  const cellsWithContent = useMemo(() => {
    const set = new Set()
    // Check freeform text (array of blocks per cell)
    for (const [idx, blocks] of Object.entries(freeformText)) {
      if (Array.isArray(blocks) && blocks.some((b) => b.content)) set.add(Number(idx))
    }
    // Check structured text
    for (const [idx, cellData] of Object.entries(text || {})) {
      if (typeof cellData === 'object' && cellData !== null) {
        const hasContent = Object.values(cellData).some((el) => el?.visible !== false && el?.content)
        if (hasContent) set.add(Number(idx))
      }
    }
    return set
  }, [freeformText, text])

  // Cell position label (#5)
  const cellPositionLabel = useMemo(
    () => getCellPositionLabel(layout, activeCell, cellInfoList.length),
    [layout, activeCell, cellInfoList.length],
  )

  // Per-cell text data for the active cell
  const activeCellText = text?.[activeCell] || {}

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-base-content">Content</h3>

        {/* Text mode toggle — renamed Structured to Guided (#13) */}
        <div className="flex bg-base-200 rounded-lg p-0.5">
          <button
            onClick={() => onTextModeChange?.('structured')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              textMode === 'structured'
                ? 'bg-base-100 text-base-content shadow-sm'
                : 'text-base-content/70 hover:text-base-content'
            }`}
          >
            Guided
          </button>
          <button
            onClick={() => onTextModeChange?.('freeform')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              textMode === 'freeform'
                ? 'bg-base-100 text-base-content shadow-sm'
                : 'text-base-content/70 hover:text-base-content'
            }`}
          >
            Freeform
          </button>
        </div>
      </div>

      {/* Subtitle for mode explanation (#13) */}
      <p className="text-[10px] text-base-content/50 -mt-1">
        {textMode === 'structured'
          ? 'Select a cell, then fill in title, tagline, body, and more'
          : 'Write anything in each cell, your way'}
      </p>

      {/* Cell selector — shared between both modes */}
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <MiniCellGrid
            layout={layout}
            selectedCell={activeCell}
            onSelectCell={setSelectedCell}
            platform={platform}
            cellsWithContent={cellsWithContent}
            size="medium"
            mode="content"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-base-content">
            Cell {activeCell + 1}
            {cellPositionLabel && (
              <span className="text-base-content/60 font-normal"> ({cellPositionLabel})</span>
            )}
          </p>
          <p className="text-[10px] text-base-content/60 mt-0.5">
            {textMode === 'structured'
              ? 'Add title, body, CTA and more to this cell'
              : 'Add text blocks with independent styling'}
          </p>
        </div>
      </div>

      {textMode === 'structured' ? (
        <>
          {textGroups.map((group, i) => {
            const preview = getGroupPreview(group, activeCellText)
            return (
              <CollapsibleSection
                key={group.id}
                title={group.name}
                subtitle={preview}
                defaultExpanded={i === 0}
              >
                <div className="space-y-3">
                  {group.elements.map((element) => (
                    <TextElementEditor
                      key={element.id}
                      element={element}
                      cellIndex={activeCell}
                      cellText={activeCellText}
                      onTextChange={onTextChange}
                      theme={theme}
                    />
                  ))}
                </div>
              </CollapsibleSection>
            )
          })}
        </>
      ) : (
        <FreeformCellEditor
          key={activeCell}
          cellIndex={activeCell}
          cellBlocks={freeformText[activeCell]}
          onAddBlock={onAddBlock}
          onUpdateBlock={onUpdateBlock}
          onRemoveBlock={onRemoveBlock}
          onMoveBlock={onMoveBlock}
          theme={theme}
        />
      )}

      {/* Requirement: Cell alignment controls moved from Structure tab — alignment belongs with content
          Approach: Collapsible section after text editors, reads/writes cellAlignments via onLayoutChange
          Alternatives:
            - Keep in Structure tab: Rejected — alignment is a content concern, not a structure concern */}
      <CollapsibleSection title="Text Alignment" subtitle={layoutType === 'fullbleed' ? 'Global' : `Cell ${activeCell + 1}`} defaultExpanded={false}>
        <div className="flex gap-4">
          <div className="flex-1">
            <span className="text-xs text-base-content/60 block mb-1.5">Horizontal</span>
            <div className="flex gap-1.5">
              {textAlignOptions.map((align) => (
                <button
                  key={align.id}
                  onClick={() => setCellAlignment('textAlign', align.id)}
                  title={align.name}
                  className={`flex-1 px-2 py-2 rounded-lg flex items-center justify-center ${
                    getCellAlignment('textAlign') === align.id
                      ? 'bg-primary text-primary-content shadow-sm'
                      : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                  }`}
                >
                  <align.Icon />
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <span className="text-xs text-base-content/60 block mb-1.5">Vertical</span>
            <div className="flex gap-1.5">
              {verticalAlignOptions.map((align) => (
                <button
                  key={align.id}
                  onClick={() => setCellAlignment('textVerticalAlign', align.id)}
                  title={align.name}
                  className={`flex-1 px-2 py-2 rounded-lg flex items-center justify-center ${
                    getCellAlignment('textVerticalAlign') === align.id
                      ? 'bg-primary text-primary-content shadow-sm'
                      : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                  }`}
                >
                  <align.Icon />
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
})
