// Requirement: Unified mini cell grid used by StyleTab and ContentTab.
// Approach: Single component with flexible cell rendering via mode or content callbacks.
//   Pre-computes cell mapping via useMemo to avoid mutable cellIndex during render.
// Alternatives:
//   - Separate per-tab implementations: Rejected — divergent code, duplicated layout logic.
//   - Render prop for cell content: Rejected — mode-based is simpler for 2 known consumers.
import { useMemo, memo } from 'react'
import { getAspectRatio } from '../config/platforms'
import { normalizeStructure } from '../utils/cellUtils'

// Requirement: Fixed-height sizing mode for horizontal contexts (ContextBar).
// Approach: fixedHeight prop caps the grid height (s=44px, m=64px, l=88px) and derives
//   width from height × aspectRatio. This prevents tall portrait formats (9:16) from
//   blowing out the ContextBar height (was 114px for Stories).
// Alternatives:
//   - max-height + overflow:hidden on ContextBar: Rejected — clips content, doesn't show
//     the correct layout proportions.
//   - Device-based toggle: Rejected — the issue is context (horizontal bar vs vertical panel),
//     not device type. Let each consumer choose the right mode.
const FIXED_HEIGHTS = { s: 44, m: 64, l: 88 }

export default memo(function MiniCellGrid({
  layout,
  // Cell data
  cellImages = {},       // Object of cellIndex → imageId
  // Selection
  selectedCell = null,   // Highlighted cell index
  onSelectCell,
  // Display
  platform,
  cellsWithContent,      // Set of cell indices with content (ContentTab freeform)
  size = 'small',        // 'small' | 'medium' | 'large' — fixed-width mode (height from aspect ratio)
  fixedHeight = null,    // 's' | 'm' | 'l' — fixed-height mode (width from aspect ratio)
  mode = 'default',      // 'default' (StyleTab-style) | 'content' (ContentTab-style)
}) {
  const { type, structure } = layout
  const isFullbleed = type === 'fullbleed'
  const isRows = type === 'rows'

  const normalizedStructure = normalizeStructure(type, structure)

  const aspectRatio = getAspectRatio(platform)

  // Two sizing modes:
  // 1. fixedHeight (s/m/l): height is fixed, width = height × aspectRatio.
  //    Best for horizontal bars where vertical space is constrained.
  // 2. size (small/medium/large): width is fixed, height = width / aspectRatio.
  //    Best for vertical panels where width is constrained.
  const isFixedHeight = fixedHeight && FIXED_HEIGHTS[fixedHeight]
  const gridHeight = isFixedHeight ? FIXED_HEIGHTS[fixedHeight] : null
  const gridWidth = isFixedHeight
    ? Math.round(gridHeight * aspectRatio)
    : size === 'large' ? 120 : size === 'medium' ? 88 : 64
  const fontSize = isFixedHeight
    ? (fixedHeight === 'l' ? 'text-[11px]' : fixedHeight === 'm' ? 'text-[10px]' : 'text-[9px]')
    : size === 'large' ? 'text-[11px] sm:text-[10px]' : size === 'medium' ? 'text-[10px] sm:text-[9px]' : 'text-[9px] sm:text-[8px]'
  const minCellH = isFixedHeight
    ? (fixedHeight === 'l' ? 'min-h-[12px]' : fixedHeight === 'm' ? 'min-h-[10px]' : 'min-h-[8px]')
    : size === 'large' ? 'min-h-[28px] sm:min-h-[24px]' : size === 'medium' ? 'min-h-[20px] sm:min-h-[18px]' : 'min-h-[16px] sm:min-h-[14px]'

  // Pre-compute cell mapping grouped by section to avoid mutable cellIndex during render
  const sectionCellMap = useMemo(() => {
    const grouped = new Map()
    let idx = 0
    const src = normalizeStructure(type, structure)
    src.forEach((section, sectionIndex) => {
      const subdivisions = section.subdivisions || 1
      const subSizes = section.subSizes || Array(subdivisions).fill(100 / subdivisions)
      const cells = []
      for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
        cells.push({ cellIndex: idx, subSize: subSizes[subIndex] })
        idx++
      }
      grouped.set(sectionIndex, cells)
    })
    return grouped
  }, [type, structure])

  // Determine cell appearance based on mode
  const getCellAppearance = (currentCellIndex) => {
    const isSelected = selectedCell === currentCellIndex
    const hasImage = !!cellImages[currentCellIndex]
    const hasContent = cellsWithContent?.has(currentCellIndex)

    if (mode === 'content') {
      // ContentTab style: selected > hasContent > hasImage > default
      if (isSelected) {
        return {
          bgClass: 'bg-primary hover:bg-primary/80',
          content: <span className={`text-primary-content ${fontSize}`}>{currentCellIndex + 1}</span>,
        }
      }
      if (hasContent) {
        return {
          bgClass: 'bg-base-300 hover:bg-base-200',
          content: <span className={`text-primary ${fontSize}`}>{currentCellIndex + 1}</span>,
        }
      }
      if (hasImage) {
        return {
          bgClass: 'bg-base-300 hover:bg-base-200',
          content: <span className={`text-primary ${fontSize}`}>📷</span>,
        }
      }
      return {
        bgClass: 'bg-base-200 hover:bg-base-300',
        content: <span className={`text-base-content/60 ${fontSize}`}>{currentCellIndex + 1}</span>,
      }
    }

    // Default style: selected > hasImage > default
    if (isSelected) {
      return {
        bgClass: 'bg-primary hover:bg-primary/80',
        content: <span className={`text-primary-content ${fontSize}`}>✓</span>,
      }
    }
    if (hasImage) {
      return {
        bgClass: 'bg-base-300 hover:bg-base-200',
        content: <span className={`text-primary ${fontSize}`}>📷</span>,
      }
    }
    return {
      bgClass: 'bg-base-200 hover:bg-base-300',
      content: <span className={`text-base-content/60 ${fontSize}`}>{currentCellIndex + 1}</span>,
    }
  }

  return (
    <div
      className="flex overflow-hidden border border-base-300 rounded"
      style={{
        width: `${gridWidth}px`,
        height: isFixedHeight ? `${gridHeight}px` : `${gridWidth / aspectRatio}px`,
        flexDirection: isRows || isFullbleed ? 'column' : 'row',
      }}
    >
      {normalizedStructure.map((section, sectionIndex) => {
        const sectionSize = section.size || 100 / normalizedStructure.length
        const sectionCells = sectionCellMap.get(sectionIndex) || []

        return (
          <div
            key={`section-${sectionIndex}`}
            className={`flex ${isRows || isFullbleed ? 'flex-row' : 'flex-col'}`}
            style={{ flex: `1 1 ${sectionSize}%` }}
          >
            {sectionCells.map(({ cellIndex: currentCellIndex, subSize }) => {
              const { bgClass, content } = getCellAppearance(currentCellIndex)

              return (
                <div
                  key={`cell-${currentCellIndex}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Cell ${currentCellIndex + 1}`}
                  className={`relative cursor-pointer transition-colors ${minCellH} ${bgClass} flex items-center justify-center active:opacity-70`}
                  style={{ flex: `1 1 ${subSize}%` }}
                  onClick={() => onSelectCell(currentCellIndex)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectCell(currentCellIndex) } }}
                >
                  {content}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
})
