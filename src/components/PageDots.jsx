// Requirement: Shared page thumbnail selector used in ContextBar and Structure tab.
// Approach: Single component with validated colors, ARIA attributes, and WCAG touch targets.
//   Extracted from ContextBar to eliminate duplication with LayoutTab's inline thumbnails.
// Alternatives:
//   - Inline in each consumer: Rejected — led to diverging behavior (ContextBar had
//     validation + ARIA, LayoutTab didn't). Shared component ensures consistency.
import { memo, useMemo } from 'react'

// Validate hex color to prevent CSS injection via theme values.
const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/
function safeColor(color, fallback = '#1a1a2e') {
  return color && HEX_COLOR_RE.test(color) ? color : fallback
}

// Compact page thumbnail.
// size (px) controls dimensions — consumers pass FIXED_HEIGHTS.m to match MiniCellGrid.
function PageDot({ pageState, isActive, onClick, index, size }) {
  const bgColor = safeColor(pageState?.theme?.primary)

  return (
    <button
      onClick={onClick}
      aria-label={`Switch to page ${index + 1}`}
      aria-current={isActive ? 'page' : undefined}
      className={`relative shrink-0 rounded-md overflow-hidden border-2 transition-all hover:scale-110 active:scale-95 ${
        isActive
          ? 'border-primary ring-1 ring-primary/30'
          : 'border-base-300 hover:border-base-300'
      }`}
      style={{ width: size, height: size }}
      title={`Page ${index + 1}`}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <span className={`text-[8px] font-bold ${isActive ? 'text-white' : 'text-white/70'}`}>
          {index + 1}
        </span>
      </div>
    </button>
  )
}

// Memoize page state lookups to avoid calling getPageState() for every page on every render.
const PageDots = memo(function PageDots({ pages, activePage, getPageState, onSetActivePage, size }) {
  const pageStates = useMemo(
    () => pages.map((_, i) => (getPageState ? getPageState(i) : null)),
    [pages, getPageState]
  )

  return (
    <div className="flex gap-1 py-0.5">
      {pages.map((_, index) => (
        <PageDot
          key={index}
          pageState={pageStates[index]}
          isActive={index === activePage}
          onClick={() => onSetActivePage(index)}
          index={index}
          size={size}
        />
      ))}
    </div>
  )
})

export default PageDots
