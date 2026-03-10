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
import ColorPicker from './ColorPicker'
import AlignmentPicker from './AlignmentPicker'
import MiniCellGrid from './MiniCellGrid'
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

const ChevronUpIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

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
  { id: 2, name: 'Extra' },
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

// Requirement: Shared style controls between structured TextElementEditor and freeform FreeformBlockEditor.
// Approach: Single component that takes current style values and an onChange callback.
// Alternatives:
//   - Duplicate controls in each editor: Rejected — 150+ lines of identical JSX duplicated.
//   - Render props: Rejected — simple value/onChange is cleaner and more readable.
function TextStyleControls({ value, onChange, theme }) {
  return (
    <div className="space-y-2 p-2 bg-ui-surface-inset/50 rounded-lg">
      {/* Alignment */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-ui-text-subtle w-10 shrink-0">Align</span>
        <AlignmentPicker
          value={value.textAlign}
          onChange={(id) => onChange({ textAlign: id })}
        />
      </div>

      {/* Color */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-ui-text-subtle w-10 shrink-0">Color</span>
        <ColorPicker
          value={value.color}
          onChange={(id) => onChange({ color: id })}
          theme={theme}
        />
      </div>

      {/* Size + Bold/Italic */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-ui-text-subtle w-10 shrink-0">Size</span>
        <div className="flex items-center gap-1">
          {sizeOptions.map((size) => (
            <button
              key={size.id}
              onClick={() => onChange({ size: size.id })}
              title={`Size ${size.name}`}
              className={`w-8 h-7 sm:w-7 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 font-medium rounded ${
                value.size === size.id
                  ? 'bg-primary text-white'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
              }`}
            >
              {size.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => onChange({ bold: !value.bold })}
            title="Bold"
            className={`w-9 h-7 sm:w-7 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 font-bold rounded ${
              value.bold
                ? 'bg-primary text-white'
                : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
            }`}
          >
            B
          </button>
          <button
            onClick={() => onChange({ italic: !value.italic })}
            title="Italic"
            className={`w-9 h-7 sm:w-7 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 italic rounded ${
              value.italic
                ? 'bg-primary text-white'
                : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
            }`}
          >
            I
          </button>
        </div>
      </div>

      {/* Letter spacing */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-ui-text-subtle w-10 shrink-0">Spacing</span>
        <div className="flex items-center gap-1">
          {letterSpacingOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChange({ letterSpacing: opt.id })}
              title={opt.name}
              className={`px-2.5 h-7 sm:px-2 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 rounded ${
                value.letterSpacing === opt.id
                  ? 'bg-primary text-white'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer/line above */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-ui-text-subtle w-10 shrink-0">Above</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange({ spacerAbove: ((value.spacerAbove || 0) + 1) % 3 })}
            title={`Spacer above: ${['None', 'Small', 'Large'][value.spacerAbove || 0]}`}
            className={`flex items-center gap-1 px-2 h-7 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 rounded ${
              (value.spacerAbove || 0) > 0
                ? 'bg-primary text-white'
                : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
            }`}
          >
            Gap {['Off', 'S', 'L'][value.spacerAbove || 0]}
          </button>
          <button
            onClick={() => onChange({ lineAbove: !value.lineAbove })}
            title={`Line above: ${value.lineAbove ? 'On' : 'Off'}`}
            className={`flex items-center gap-1 px-2 h-7 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 rounded ${
              value.lineAbove
                ? 'bg-primary text-white'
                : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
            }`}
          >
            Line
          </button>
        </div>
      </div>

      {/* Spacer/line below */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-ui-text-subtle w-10 shrink-0">Below</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange({ spacerBelow: ((value.spacerBelow || 0) + 1) % 3 })}
            title={`Spacer below: ${['None', 'Small', 'Large'][value.spacerBelow || 0]}`}
            className={`flex items-center gap-1 px-2 h-7 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 rounded ${
              (value.spacerBelow || 0) > 0
                ? 'bg-primary text-white'
                : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
            }`}
          >
            Gap {['Off', 'S', 'L'][value.spacerBelow || 0]}
          </button>
          <button
            onClick={() => onChange({ lineBelow: !value.lineBelow })}
            title={`Line below: ${value.lineBelow ? 'On' : 'Off'}`}
            className={`flex items-center gap-1 px-2 h-7 sm:h-6 text-[11px] sm:text-[10px] active:scale-90 rounded ${
              value.lineBelow
                ? 'bg-primary text-white'
                : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
            }`}
          >
            Line
          </button>
        </div>
      </div>
    </div>
  )
}

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
  const handleFocus = useCallback((e) => {
    const el = e.target
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [])

  return (
    <div className="space-y-2 pb-3 border-b border-ui-border-subtle last:border-0 last:pb-0">
      {/* Row 1: Visibility + Label + Clear + Style toggle */}
      <div className="flex items-center gap-2">
        {/* Visibility Toggle */}
        <button
          onClick={() => onTextChange(cellIndex, element.id, { visible: !isVisible })}
          className={`w-8 h-8 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-xs shrink-0 active:scale-90 ${
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

        {/* Clear text button (#4) */}
        {layerState.content && (
          <button
            onClick={() => onTextChange(cellIndex, element.id, { content: '' })}
            className="w-7 h-7 rounded flex items-center justify-center text-ui-text-faint hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 transition-colors"
            title="Clear text"
          >
            <CloseIcon />
          </button>
        )}

        {/* Style toggle (#2) */}
        <button
          onClick={() => setShowStyle(!showStyle)}
          className={`w-8 h-8 sm:w-7 sm:h-7 rounded flex items-center justify-center text-xs transition-colors active:scale-90 ${
            showStyle ? 'bg-primary/10 text-primary' : 'bg-ui-surface-inset text-ui-text-subtle hover:bg-ui-surface-hover'
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
          className="w-full px-3 py-2 text-sm text-ui-text border border-ui-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-subtle placeholder-zinc-400 dark:placeholder-zinc-500"
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

// Requirement: Formatting toolbar so non-technical users can insert markdown without knowing syntax
// Approach: Toolbar buttons that wrap selected text or insert syntax at cursor position
// Alternatives:
//   - Rich text editor (Quill/TipTap): Rejected — heavy dependency, markdown is already parsed
//   - Dropdown menu: Rejected — toolbar is more discoverable and faster for common actions
const markdownFormats = [
  { label: 'B', title: 'Bold', before: '**', after: '**', placeholder: 'bold text', group: 'inline' },
  { label: 'I', title: 'Italic', before: '_', after: '_', placeholder: 'italic text', style: 'italic', group: 'inline' },
  { label: 'S', title: 'Strikethrough', before: '~~', after: '~~', placeholder: 'text', style: 'line-through', group: 'inline' },
  { label: 'H1', title: 'Heading', before: '# ', after: '', placeholder: 'Heading', newLine: true, group: 'block' },
  { label: 'H2', title: 'Subheading', before: '## ', after: '', placeholder: 'Subheading', newLine: true, group: 'block' },
  { label: '"', title: 'Quote', before: '> ', after: '', placeholder: 'quote', newLine: true, group: 'block' },
  { label: '•', title: 'Bullet list', before: '- ', after: '', placeholder: 'list item', newLine: true, group: 'block' },
  { label: '1.', title: 'Numbered list', before: '1. ', after: '', placeholder: 'list item', newLine: true, group: 'block' },
  { label: '—', title: 'Divider', before: '\n---\n', after: '', placeholder: '', group: 'insert' },
  { label: '🔗', title: 'Link', before: '[', after: '](url)', placeholder: 'link text', group: 'insert' },
]

// Requirement: Toolbar needs visual separators between groups and horizontal scroll on narrow screens (#8)
// Approach: Group buttons by type (inline/block/insert) with dividers, flex-nowrap + overflow-x-auto
// Pre-grouped to avoid .filter() on every render
const groupedMarkdownFormats = [
  { id: 'inline', formats: markdownFormats.filter(f => f.group === 'inline') },
  { id: 'block', formats: markdownFormats.filter(f => f.group === 'block') },
  { id: 'insert', formats: markdownFormats.filter(f => f.group === 'insert') },
]

function MarkdownToolbar({ textareaRef, content, onContentChange }) {
  const applyFormat = useCallback(
    (fmt) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const { selectionStart, selectionEnd } = textarea
      const selected = content.slice(selectionStart, selectionEnd)
      const text = selected || fmt.placeholder

      let insertBefore = fmt.before
      if (fmt.newLine && selectionStart > 0 && content[selectionStart - 1] !== '\n') {
        insertBefore = '\n' + insertBefore
      }

      const replacement = insertBefore + text + fmt.after
      const newContent =
        content.slice(0, selectionStart) + replacement + content.slice(selectionEnd)

      onContentChange(newContent)

      requestAnimationFrame(() => {
        textarea.focus()
        const cursorStart = selectionStart + insertBefore.length
        if (selected) {
          textarea.selectionStart = textarea.selectionEnd =
            cursorStart + text.length + fmt.after.length
        } else {
          textarea.selectionStart = cursorStart
          textarea.selectionEnd = cursorStart + text.length
        }
      })
    },
    [textareaRef, content, onContentChange],
  )

  return (
    <div className="flex items-center gap-0.5 flex-nowrap overflow-x-auto scrollbar-thin">
      {groupedMarkdownFormats.map(({ id: group, formats }, gi) => (
        <div key={group} className="flex items-center gap-0.5 shrink-0">
          {gi > 0 && <span className="w-px h-4 bg-ui-border-subtle mx-0.5 shrink-0" />}
          {formats.map((fmt) => (
            <button
              key={fmt.title}
              type="button"
              onClick={() => applyFormat(fmt)}
              title={fmt.title}
              className="px-2.5 py-1.5 sm:px-2 sm:py-1 text-[12px] sm:text-[11px] font-medium rounded text-ui-text-muted hover:bg-ui-surface-hover hover:text-ui-text active:bg-ui-surface-inset transition-colors shrink-0"
              style={fmt.style ? { textDecoration: fmt.style === 'line-through' ? 'line-through' : undefined, fontStyle: fmt.style === 'italic' ? 'italic' : undefined } : undefined}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

// Requirement: Multi-block freeform text — each cell has an array of independently styled blocks.
// Approach: Each block is a card with markdown editor, style controls, move/delete.
//   Toolbar only shows for the focused block to reduce repeated chrome.
//   Single-block mode hides #N and move buttons for a cleaner experience.
// Alternatives:
//   - Single block per cell: Rejected — user requested multiple appendable blocks with reordering.
//   - Toolbar always visible: Rejected — repetitive with 3+ blocks.
function FreeformBlockEditor({
  block,
  cellIndex,
  index,
  total,
  onUpdateBlock,
  onRemoveBlock,
  onMoveBlock,
  theme,
}) {
  const textareaRef = useRef(null)
  const [showStyle, setShowStyle] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const confirmTimerRef = useRef(null)

  const handleContentChange = useCallback(
    (newContent) => onUpdateBlock(cellIndex, block.id, { content: newContent }),
    [cellIndex, block.id, onUpdateBlock],
  )

  const textareaRows = Math.min(10, Math.max(3, (block.content || '').split('\n').length + 1))

  const handleFocus = useCallback((e) => {
    setIsFocused(true)
    const el = e.target
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  // Requirement: Confirm-delete with timeout fallback for mobile touch reliability.
  // Approach: onBlur resets immediately, plus a 3-second timeout as safety net.
  // Alternatives:
  //   - onBlur only: Rejected — fires unreliably on mobile touch devices.
  //   - Timeout only: Rejected — desktop users expect blur-to-cancel behavior.
  const handleDelete = () => {
    if (block.content) {
      if (!confirmDelete) {
        setConfirmDelete(true)
        clearTimeout(confirmTimerRef.current)
        confirmTimerRef.current = setTimeout(() => setConfirmDelete(false), 3000)
        return
      }
    }
    clearTimeout(confirmTimerRef.current)
    onRemoveBlock(cellIndex, block.id)
  }

  const handleDeleteBlur = useCallback(() => {
    clearTimeout(confirmTimerRef.current)
    setConfirmDelete(false)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearTimeout(confirmTimerRef.current)
  }, [])

  const isMultiBlock = total > 1

  return (
    <div className="space-y-2 p-2 bg-ui-surface-inset/30 rounded-lg border border-ui-border-subtle">
      {/* Header: block number + move + style + delete */}
      <div className="flex items-center gap-1">
        {/* Only show block number and move buttons when multiple blocks exist */}
        {isMultiBlock && (
          <>
            <span className="text-[10px] text-ui-text-subtle font-medium w-6 shrink-0">#{index + 1}</span>

            <button
              onClick={() => onMoveBlock(cellIndex, block.id, -1)}
              disabled={index === 0}
              className="w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs active:scale-90 disabled:opacity-30 bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover disabled:hover:bg-ui-surface-inset"
              title="Move up"
            >
              <ChevronUpIcon />
            </button>

            <button
              onClick={() => onMoveBlock(cellIndex, block.id, 1)}
              disabled={index === total - 1}
              className="w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs active:scale-90 disabled:opacity-30 bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover disabled:hover:bg-ui-surface-inset"
              title="Move down"
            >
              <ChevronDownIcon />
            </button>
          </>
        )}

        <div className="flex-1" />

        {/* Style toggle */}
        <button
          onClick={() => setShowStyle(!showStyle)}
          className={`w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs transition-colors active:scale-90 ${
            showStyle ? 'bg-primary/10 text-primary' : 'bg-ui-surface-inset text-ui-text-subtle hover:bg-ui-surface-hover'
          }`}
          title="Block style options"
        >
          <GearIcon className="w-3 h-3" />
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          onBlur={handleDeleteBlur}
          className={`w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs active:scale-90 transition-colors ${
            confirmDelete
              ? 'bg-red-500 text-white'
              : 'bg-ui-surface-inset text-ui-text-faint hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
          title={confirmDelete ? 'Click again to confirm delete' : 'Delete block'}
        >
          <CloseIcon className="w-3 h-3" />
        </button>
      </div>

      {/* Markdown toolbar — only shown when block textarea is focused, to reduce visual noise */}
      {isFocused && (
        <MarkdownToolbar
          textareaRef={textareaRef}
          content={block.content}
          onContentChange={handleContentChange}
        />
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={(e) => onUpdateBlock(cellIndex, block.id, { content: e.target.value })}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Type here — focus to see formatting toolbar"
          rows={textareaRows}
          className="w-full px-3 py-2 text-sm text-ui-text border border-ui-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-dark-subtle placeholder-zinc-400 dark:placeholder-zinc-500 font-mono"
          style={{ resize: 'vertical', minHeight: '3rem' }}
        />
      </div>

      {/* Collapsible style controls — uses shared TextStyleControls */}
      {showStyle && (
        <TextStyleControls
          value={block}
          onChange={(updates) => onUpdateBlock(cellIndex, block.id, updates)}
          theme={theme}
        />
      )}
    </div>
  )
}

// Requirement: Auto-create first block so users can type immediately without extra clicks.
// Approach: useEffect creates a block when cell has none, so the editor is never empty on mount.
// Alternatives:
//   - Require user to click "Add": Rejected — adds friction to the most common path.
function FreeformCellEditor({
  cellIndex,
  cellBlocks,
  onAddBlock,
  onUpdateBlock,
  onRemoveBlock,
  onMoveBlock,
  theme,
}) {
  const blocks = cellBlocks || []

  useEffect(() => {
    if (blocks.length === 0) {
      onAddBlock(cellIndex)
    }
  }, [cellIndex, blocks.length, onAddBlock])

  // Don't render until the auto-created block is available
  if (blocks.length === 0) return null

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => (
        <FreeformBlockEditor
          key={block.id}
          block={block}
          cellIndex={cellIndex}
          index={i}
          total={blocks.length}
          onUpdateBlock={onUpdateBlock}
          onRemoveBlock={onRemoveBlock}
          onMoveBlock={onMoveBlock}
          theme={theme}
        />
      ))}

      <button
        onClick={() => onAddBlock(cellIndex)}
        className="w-full py-2 text-xs font-medium text-ui-text-muted hover:text-ui-text bg-ui-surface-inset hover:bg-ui-surface-hover rounded-lg transition-colors active:scale-[0.98]"
      >
        + Add Text Block
      </button>
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
        <h3 className="text-sm font-semibold text-ui-text">Content</h3>

        {/* Text mode toggle — renamed Structured to Guided (#13) */}
        <div className="flex bg-ui-surface-inset rounded-lg p-0.5">
          <button
            onClick={() => onTextModeChange?.('structured')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              textMode === 'structured'
                ? 'bg-white dark:bg-dark-card text-ui-text shadow-sm'
                : 'text-ui-text-muted hover:text-ui-text'
            }`}
          >
            Guided
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

      {/* Subtitle for mode explanation (#13) */}
      <p className="text-[10px] text-ui-text-faint -mt-1">
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
            size="large"
            mode="content"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ui-text">
            Cell {activeCell + 1}
            {cellPositionLabel && (
              <span className="text-ui-text-subtle font-normal"> ({cellPositionLabel})</span>
            )}
          </p>
          <p className="text-[10px] text-ui-text-subtle mt-0.5">
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
      <CollapsibleSection title="Cell Alignment" defaultExpanded={false}>
        <div className="flex gap-4">
          <div className="flex-1">
            <span className="text-xs text-ui-text-subtle block mb-1.5">Horizontal</span>
            <div className="flex gap-1.5">
              {textAlignOptions.map((align) => (
                <button
                  key={align.id}
                  onClick={() => setCellAlignment('textAlign', align.id)}
                  title={align.name}
                  className={`flex-1 px-2 py-2 rounded-lg flex items-center justify-center ${
                    getCellAlignment('textAlign') === align.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                  }`}
                >
                  <align.Icon />
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <span className="text-xs text-ui-text-subtle block mb-1.5">Vertical</span>
            <div className="flex gap-1.5">
              {verticalAlignOptions.map((align) => (
                <button
                  key={align.id}
                  onClick={() => setCellAlignment('textVerticalAlign', align.id)}
                  title={align.name}
                  className={`flex-1 px-2 py-2 rounded-lg flex items-center justify-center ${
                    getCellAlignment('textVerticalAlign') === align.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
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
