import { memo, useRef, useMemo } from 'react'
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
      className="flex overflow-hidden border border-ui-border-strong rounded w-16 sm:w-12"
      style={{
        aspectRatio: `${aspectRatio}`,
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
              className={`relative cursor-pointer transition-colors min-h-[6px] ${bgClass} flex items-center justify-center`}
              style={{ flex: `1 1 ${subSizes[subIndex]}%` }}
              onClick={() => onSelectCell(currentCellIndex)}
              title={`Cell ${currentCellIndex + 1}`}
            >
              <span className={`text-[9px] sm:text-[8px] font-medium leading-none ${isSelected ? 'text-white' : hasImage ? 'text-violet-700 dark:text-violet-200' : 'text-ui-text-faint'}`}>
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

// Compact page thumbnail for context bar
function PageDot({ pageState, isActive, onClick, index }) {
  const bgColor = pageState?.theme?.primary || '#1a1a2e'

  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 w-7 h-7 rounded-md overflow-hidden border-2 transition-all hover:scale-110 ${
        isActive
          ? 'border-primary ring-1 ring-primary/30'
          : 'border-ui-border hover:border-ui-border-strong'
      }`}
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

export default memo(function ContextBar({
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
  // Pages
  pages = [null],
  activePage = 0,
  onSetActivePage,
  onAddPage,
  onDuplicatePage,
  onRemovePage,
  onMovePage,
  getPageState,
}) {
  const scrollRef = useRef(null)
  const pageCount = pages.length
  const hasMultiplePages = pageCount > 1

  const totalCells = useMemo(() => {
    const structure = layout.structure || [{ size: 100, subdivisions: 1, subSizes: [100] }]
    return structure.reduce((total, section) => total + (section.subdivisions || 1), 0)
  }, [layout.structure])

  return (
    <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm border-b border-zinc-200/60 dark:border-zinc-700/60 px-3 sm:px-4 py-1.5 sticky top-[41px] z-[9]">
      {/* Mobile: two rows. Desktop: single row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
        {/* Pages row (own row on mobile, inline on desktop) */}
        <div className="flex items-center gap-1.5 sm:flex-1 min-w-0">
          <span className="text-[10px] text-ui-text-faint uppercase tracking-wide hidden sm:inline shrink-0">Pages</span>

          {/* Page thumbnails - scrollable */}
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-thin" ref={scrollRef}>
            <div className="flex gap-1 py-0.5">
              {pages.map((_, index) => {
                const pageState = getPageState ? getPageState(index) : null
                return (
                  <PageDot
                    key={index}
                    pageState={pageState}
                    isActive={index === activePage}
                    onClick={() => onSetActivePage(index)}
                    index={index}
                  />
                )
              })}
            </div>
          </div>

          {/* Page actions - compact */}
          <div className="flex items-center gap-0.5 shrink-0">
            {hasMultiplePages && (
              <>
                <button
                  onClick={() => onMovePage(activePage, activePage - 1)}
                  disabled={activePage === 0}
                  title="Move page left"
                  className="w-6 h-6 sm:w-5 sm:h-5 rounded flex items-center justify-center text-ui-text-subtle hover:bg-ui-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => onMovePage(activePage, activePage + 1)}
                  disabled={activePage === pageCount - 1}
                  title="Move page right"
                  className="w-6 h-6 sm:w-5 sm:h-5 rounded flex items-center justify-center text-ui-text-subtle hover:bg-ui-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            {hasMultiplePages && (
              <button
                onClick={onDuplicatePage}
                title="Duplicate page"
                className="w-6 h-6 sm:w-5 sm:h-5 rounded flex items-center justify-center text-ui-text-subtle hover:bg-ui-surface-hover transition-colors"
              >
                <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
            <button
              onClick={onAddPage}
              title="Add new page"
              className="w-6 h-6 sm:w-5 sm:h-5 rounded flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {hasMultiplePages && (
              <button
                onClick={() => {
                  if (window.confirm(`Delete page ${activePage + 1}?`)) {
                    onRemovePage(activePage)
                  }
                }}
                disabled={pageCount <= 1}
                title="Remove current page"
                className="w-6 h-6 sm:w-5 sm:h-5 rounded flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Divider - only on desktop (rows are visually separated on mobile) */}
        <div className="w-px h-6 bg-ui-border shrink-0 hidden sm:block" />

        {/* Bottom row on mobile: cell selector + undo/redo */}
        <div className="flex items-center gap-2 sm:contents">
          {/* Cell selector - miniature layout grid */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0 sm:justify-center">
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

          {/* Divider */}
          <div className="w-px h-6 bg-ui-border shrink-0" />

          {/* Undo/Redo - bigger on mobile */}
          <div className="flex items-center gap-1 sm:gap-0.5 sm:flex-1 sm:min-w-0 sm:justify-end shrink-0">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className={`p-2 sm:p-1.5 rounded-lg transition-all ${
                canUndo
                  ? 'text-ui-text hover:bg-zinc-100 dark:hover:bg-dark-subtle active:scale-95'
                  : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
              }`}
            >
              <span className="text-base sm:text-sm">&#x21B6;</span>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className={`p-2 sm:p-1.5 rounded-lg transition-all ${
                canRedo
                  ? 'text-ui-text hover:bg-zinc-100 dark:hover:bg-dark-subtle active:scale-95'
                  : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
              }`}
            >
              <span className="text-base sm:text-sm">&#x21B7;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
