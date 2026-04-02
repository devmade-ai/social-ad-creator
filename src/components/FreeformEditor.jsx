// Requirement: Multi-block freeform text — each cell has an array of independently styled blocks.
// Approach: Each block is a card with markdown editor, style controls, move/delete.
//   Toolbar only shows for the focused block to reduce repeated chrome.
//   Single-block mode hides #N and move buttons for a cleaner experience.
// Alternatives:
//   - Single block per cell: Rejected — user requested multiple appendable blocks with reordering.
//   - Toolbar always visible: Rejected — repetitive with 3+ blocks.
import { useRef, useCallback, useState, useEffect } from 'react'
import TextStyleControls from './TextStyleControls'

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
          {gi > 0 && <span className="w-px h-4 bg-base-200 mx-0.5 shrink-0" />}
          {formats.map((fmt) => (
            <button
              key={fmt.title}
              type="button"
              onClick={() => applyFormat(fmt)}
              title={fmt.title}
              className="px-2.5 py-1.5 sm:px-2 sm:py-1 text-[12px] sm:text-[11px] font-medium rounded text-base-content/70 hover:bg-base-300 hover:text-base-content active:bg-base-200 transition-colors shrink-0"
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
  const blurTimerRef = useRef(null)

  const handleContentChange = useCallback(
    (newContent) => onUpdateBlock(cellIndex, block.id, { content: newContent }),
    [cellIndex, block.id, onUpdateBlock],
  )

  const textareaRows = Math.min(10, Math.max(3, (block.content || '').split('\n').length + 1))

  // Track scroll timeout for cleanup on unmount
  const scrollTimerRef = useRef(null)
  const handleFocus = useCallback((e) => {
    clearTimeout(blurTimerRef.current)
    setIsFocused(true)
    const el = e.target
    scrollTimerRef.current = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [])

  // Requirement: Delayed blur so toolbar clicks register before unmount.
  // Approach: 150ms delay gives the toolbar button's onClick time to fire.
  // Alternatives:
  //   - Immediate blur: Rejected — toolbar unmounts before click event, breaking formatting.
  //   - onMouseDown preventDefault on toolbar: Rejected — prevents focus ring behavior.
  const handleBlur = useCallback(() => {
    blurTimerRef.current = setTimeout(() => setIsFocused(false), 150)
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

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(confirmTimerRef.current)
      clearTimeout(blurTimerRef.current)
      clearTimeout(scrollTimerRef.current)
    }
  }, [])

  const isMultiBlock = total > 1

  return (
    <div className="space-y-2 p-2 bg-base-200/30 rounded-lg border border-base-200">
      {/* Header: block number + move + style + delete */}
      <div className="flex items-center gap-1">
        {/* Only show block number and move buttons when multiple blocks exist */}
        {isMultiBlock && (
          <>
            <span className="text-[10px] text-base-content/60 font-medium w-6 shrink-0">#{index + 1}</span>

            <button
              onClick={() => onMoveBlock(cellIndex, block.id, -1)}
              disabled={index === 0}
              className="w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs active:scale-90 disabled:opacity-30 bg-base-200 text-base-content/70 hover:bg-base-300 disabled:hover:bg-base-200"
              title="Move up"
            >
              <ChevronUpIcon />
            </button>

            <button
              onClick={() => onMoveBlock(cellIndex, block.id, 1)}
              disabled={index === total - 1}
              className="w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs active:scale-90 disabled:opacity-30 bg-base-200 text-base-content/70 hover:bg-base-300 disabled:hover:bg-base-200"
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
            showStyle ? 'bg-primary/10 text-primary' : 'bg-base-200 text-base-content/60 hover:bg-base-300'
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
              ? 'bg-error text-error-content'
              : 'bg-base-200 text-base-content/50 hover:text-error hover:bg-error/10'
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
          className="textarea textarea-bordered textarea-sm w-full font-mono"
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
export default function FreeformCellEditor({
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
        className="w-full py-2 text-xs font-medium text-base-content/70 hover:text-base-content bg-base-200 hover:bg-base-300 rounded-lg transition-colors active:scale-[0.98]"
      >
        + Add Text Block
      </button>
    </div>
  )
}
