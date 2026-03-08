// Requirement: Unified mini cell grid used by StyleTab and ContentTab.
// Approach: Single component with flexible cell rendering via mode or content callbacks.
//   Pre-computes cell mapping via useMemo to avoid mutable cellIndex during render.
// Alternatives:
//   - Separate per-tab implementations: Rejected — divergent code, duplicated layout logic.
//   - Render prop for cell content: Rejected — mode-based is simpler for 2 known consumers.
import { useMemo, memo } from 'react'
import { platforms } from '../config/platforms'

const FULLBLEED_STRUCTURE = [{ size: 100, subdivisions: 1, subSizes: [100] }]

export default memo(function MiniCellGrid({
  layout,
  // Cell data — pass whichever is relevant
  imageCells = [],       // Array of image cell indices (ContentTab)
  cellImages = {},       // Object of cellIndex → imageId (StyleTab)
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

  const normalizedStructure =
    isFullbleed || !structure || structure.length === 0
      ? FULLBLEED_STRUCTURE
      : structure

  const platformData = platforms.find((p) => p.id === platform) || platforms[0]
  const aspectRatio = platformData.width / platformData.height

  const gridWidth = size === 'large' ? 120 : 64
  const fontSize = size === 'large' ? 'text-[11px] sm:text-[10px]' : 'text-[9px] sm:text-[8px]'
  const minCellH = size === 'large' ? 'min-h-[28px] sm:min-h-[24px]' : 'min-h-[16px] sm:min-h-[14px]'

  // Pre-compute cell mapping grouped by section to avoid mutable cellIndex during render
  const sectionCellMap = useMemo(() => {
    const grouped = new Map()
    let idx = 0
    const src = isFullbleed || !structure || structure.length === 0 ? FULLBLEED_STRUCTURE : structure
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
    // Requirement: Show actual image assignments, not preset designations
    // Approach: Always use cellImages object (actual assignments) for image indicators
    // Alternatives:
    //   - imageCells array for content mode: Rejected — shows preset designation, not actual state
    const hasImage = !!cellImages[currentCellIndex]
    const hasContent = cellsWithContent?.has(currentCellIndex)

    if (mode === 'content') {
      // ContentTab style: selected > hasContent > hasImage > default
      if (isSelected) {
        return {
          bgClass: 'bg-primary hover:bg-primary-hover',
          content: <span className={`text-white ${fontSize}`}>{currentCellIndex + 1}</span>,
        }
      }
      if (hasContent) {
        return {
          bgClass: 'bg-violet-200 dark:bg-violet-800 hover:bg-violet-300 dark:hover:bg-violet-700',
          content: <span className={`text-violet-700 dark:text-violet-200 ${fontSize}`}>{currentCellIndex + 1}</span>,
        }
      }
      if (hasImage) {
        return {
          bgClass: 'bg-primary/20 hover:bg-primary/30',
          content: <span className={`text-primary ${fontSize}`}>📷</span>,
        }
      }
      return {
        bgClass: 'bg-ui-surface-inset hover:bg-ui-surface-hover',
        content: <span className={`text-ui-text-subtle ${fontSize}`}>{currentCellIndex + 1}</span>,
      }
    }

    // Default/StyleTab style: selected > hasImage > default
    if (isSelected) {
      return {
        bgClass: 'bg-primary hover:bg-primary-hover',
        content: <span className="text-white text-[10px]">✓</span>,
      }
    }
    if (hasImage) {
      return {
        bgClass: 'bg-violet-200 dark:bg-violet-800 hover:bg-violet-300 dark:hover:bg-violet-700',
        content: <span className="text-violet-700 dark:text-violet-200 text-[10px]">📷</span>,
      }
    }
    return {
      bgClass: 'bg-ui-surface-inset hover:bg-ui-surface-hover',
      content: <span className="text-ui-text-subtle text-[10px]">{currentCellIndex + 1}</span>,
    }
  }

  return (
    <div
      className={`flex overflow-hidden border border-ui-border-strong rounded ${size === 'large' ? 'w-[120px]' : ''}`}
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
                  className={`relative cursor-pointer transition-colors ${minCellH} ${bgClass} flex items-center justify-center active:opacity-70`}
                  style={{ flex: `1 1 ${subSize}%` }}
                  onClick={() => onSelectCell(currentCellIndex)}
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
