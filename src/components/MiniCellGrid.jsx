// Requirement: Unified mini cell grid used by StyleTab and ContentTab.
// Approach: Single component with flexible cell rendering via mode or content callbacks.
//   Pre-computes cell mapping via useMemo to avoid mutable cellIndex during render.
// Alternatives:
//   - Separate per-tab implementations: Rejected — divergent code, duplicated layout logic.
//   - Render prop for cell content: Rejected — mode-based is simpler for 2 known consumers.
import { useMemo, memo } from 'react'
import { getAspectRatio } from '../config/platforms'
import { normalizeStructure } from '../utils/cellUtils'

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
  size = 'small',        // 'small' | 'large'
  mode = 'default',      // 'default' (StyleTab-style) | 'content' (ContentTab-style)
}) {
  const { type, structure } = layout
  const isFullbleed = type === 'fullbleed'
  const isRows = type === 'rows'

  const normalizedStructure = normalizeStructure(type, structure)

  const aspectRatio = getAspectRatio(platform)

  const gridWidth = size === 'large' ? 120 : 64
  const fontSize = size === 'large' ? 'text-[11px] sm:text-[10px]' : 'text-[9px] sm:text-[8px]'
  const minCellH = size === 'large' ? 'min-h-[28px] sm:min-h-[24px]' : 'min-h-[16px] sm:min-h-[14px]'

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
          bgClass: 'bg-primary/15 hover:bg-primary/20',
          content: <span className={`text-primary ${fontSize}`}>{currentCellIndex + 1}</span>,
        }
      }
      if (hasImage) {
        return {
          bgClass: 'bg-primary/20 hover:bg-primary/30',
          content: <span className={`text-primary ${fontSize}`}>📷</span>,
        }
      }
      return {
        bgClass: 'bg-base-200 hover:bg-base-300',
        content: <span className={`text-base-content/60 ${fontSize}`}>{currentCellIndex + 1}</span>,
      }
    }

    // Default/StyleTab style: selected > hasImage > default
    if (isSelected) {
      return {
        bgClass: 'bg-primary hover:bg-primary/80',
        content: <span className="text-primary-content text-[10px]">✓</span>,
      }
    }
    if (hasImage) {
      return {
        bgClass: 'bg-primary/15 hover:bg-primary/20',
        content: <span className="text-primary text-[10px]">📷</span>,
      }
    }
    return {
      bgClass: 'bg-base-200 hover:bg-base-300',
      content: <span className="text-base-content/60 text-[10px]">{currentCellIndex + 1}</span>,
    }
  }

  return (
    <div
      className={`flex overflow-hidden border border-base-300 rounded ${size === 'large' ? 'w-[120px]' : ''}`}
      style={{
        ...(size !== 'large' ? { width: `${gridWidth}px` } : {}),
        ...(size === 'large' ? {} : { height: `${gridWidth / aspectRatio}px` }),
        aspectRatio: size === 'large' ? `${aspectRatio}` : undefined,
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
