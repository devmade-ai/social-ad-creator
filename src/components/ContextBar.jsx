import { memo, useMemo } from 'react'
import { platforms } from '../config/platforms'

// Compact cell grid for global cell selection
function CellGrid({ layout, cellImages = {}, selectedCell, onSelectCell, platform }) {
  const { type, structure } = layout
  const isFullbleed = type === 'fullbleed'
  const isRows = type === 'rows'

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
        width: '48px',
        height: `${48 / aspectRatio}px`,
        minHeight: '32px',
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
          const hasImage = !!cellImages[currentCellIndex]
          const isSelected = selectedCell === currentCellIndex
          cellIndex++

          let bgClass
          if (isSelected) {
            bgClass = 'bg-primary hover:bg-primary-hover'
          } else if (hasImage) {
            bgClass = 'bg-violet-200 dark:bg-violet-800 hover:bg-violet-300 dark:hover:bg-violet-700'
          } else {
            bgClass = 'bg-ui-surface-inset hover:bg-ui-surface-hover'
          }

          sectionCells.push(
            <div
              key={`cell-${currentCellIndex}`}
              className={`relative cursor-pointer transition-colors min-h-[8px] ${bgClass} flex items-center justify-center`}
              style={{ flex: `1 1 ${subSizes[subIndex]}%` }}
              onClick={() => onSelectCell(currentCellIndex)}
              title={`Cell ${currentCellIndex + 1}`}
            >
              <span className={`text-[8px] font-medium leading-none ${isSelected ? 'text-white' : hasImage ? 'text-violet-700 dark:text-violet-200' : 'text-ui-text-faint'}`}>
                {currentCellIndex + 1}
              </span>
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

export default memo(function ContextBar({
  // Page
  activePage,
  pageCount,
  onSetActivePage,
  // Cell
  layout,
  cellImages,
  selectedCell,
  onSelectCell,
  platform,
  // Undo/Redo
  undo,
  redo,
  canUndo,
  canRedo,
}) {
  const totalCells = useMemo(() => {
    const structure = layout.structure || [{ size: 100, subdivisions: 1, subSizes: [100] }]
    return structure.reduce((total, section) => total + (section.subdivisions || 1), 0)
  }, [layout.structure])

  return (
    <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm border-b border-zinc-200/60 dark:border-zinc-700/60 px-4 py-1.5 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-3">
        {/* Page selector */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => activePage > 0 && onSetActivePage(activePage - 1)}
            disabled={activePage === 0}
            title="Previous page"
            className="p-0.5 rounded text-ui-text-muted hover:text-ui-text hover:bg-zinc-100 dark:hover:bg-dark-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs font-medium text-ui-text min-w-[36px] text-center">
            {activePage + 1}/{pageCount}
          </span>
          <button
            onClick={() => activePage < pageCount - 1 && onSetActivePage(activePage + 1)}
            disabled={activePage >= pageCount - 1}
            title="Next page"
            className="p-0.5 rounded text-ui-text-muted hover:text-ui-text hover:bg-zinc-100 dark:hover:bg-dark-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Cell selector - miniature layout grid */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-ui-text-faint uppercase tracking-wide hidden sm:inline">Cell</span>
          <CellGrid
            layout={layout}
            cellImages={cellImages}
            selectedCell={selectedCell}
            onSelectCell={onSelectCell}
            platform={platform}
          />
          {totalCells > 1 && (
            <span className="text-xs font-medium text-ui-text-muted">
              {selectedCell + 1}
            </span>
          )}
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded-lg transition-all ${
              canUndo
                ? 'text-ui-text hover:bg-zinc-100 dark:hover:bg-dark-subtle active:scale-95'
                : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <span className="text-sm">↶</span>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded-lg transition-all ${
              canRedo
                ? 'text-ui-text hover:bg-zinc-100 dark:hover:bg-dark-subtle active:scale-95'
                : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <span className="text-sm">↷</span>
          </button>
        </div>
      </div>
    </div>
  )
})
