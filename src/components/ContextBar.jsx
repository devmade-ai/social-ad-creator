import { memo, useMemo } from 'react'
import { getAspectRatio } from '../config/platforms'
import { normalizeStructure } from '../utils/cellUtils'
import ConfirmButton from './ConfirmButton'

// Compact cell grid for global cell selection.
// Requirement: Pre-compute cell mapping to avoid mutable cellIndex during render.
// Approach: useMemo builds a Map of sectionIndex → cells[], used during render.
// Alternatives:
//   - Mutable let cellIndex = 0 in render: Rejected — side effect during render,
//     breaks under React strict mode double-rendering or concurrent features.
function CellGrid({ layout, cellImages = {}, selectedCell, onSelectCell, platform }) {
  const { type, structure } = layout
  const isFullbleed = type === 'fullbleed'
  const isRows = type === 'rows'

  const normalizedStructure = normalizeStructure(type, structure)

  const aspectRatio = getAspectRatio(platform)

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
        const sectionCells = sectionCellMap.get(sectionIndex) || []

        return (
          <div
            key={`section-${sectionIndex}`}
            className={`flex ${isRows || isFullbleed ? 'flex-row' : 'flex-col'}`}
            style={{ flex: `1 1 ${sectionSize}%` }}
          >
            {sectionCells.map(({ cellIndex: currentCellIndex, subSize }) => {
              const hasImage = !!cellImages[currentCellIndex]
              const isSelected = selectedCell === currentCellIndex

              let bgClass
              if (isSelected) {
                bgClass = 'bg-primary hover:bg-primary-hover'
              } else if (hasImage) {
                bgClass = 'bg-violet-200 dark:bg-violet-800 hover:bg-violet-300 dark:hover:bg-violet-700'
              } else {
                bgClass = 'bg-ui-surface-inset hover:bg-ui-surface-hover'
              }

              return (
                <div
                  key={`cell-${currentCellIndex}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Cell ${currentCellIndex + 1}`}
                  className={`relative cursor-pointer transition-colors min-h-[10px] ${bgClass} flex items-center justify-center active:opacity-70`}
                  style={{ flex: `1 1 ${subSize}%` }}
                  onClick={() => onSelectCell(currentCellIndex)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectCell(currentCellIndex) } }}
                  title={`Cell ${currentCellIndex + 1}`}
                >
                  <span className={`text-[9px] sm:text-[8px] font-medium leading-none ${isSelected ? 'text-white' : hasImage ? 'text-violet-700 dark:text-violet-200' : 'text-ui-text-faint'}`}>
                    {currentCellIndex + 1}
                  </span>
                </div>
              )
            })}
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
      className={`relative shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-md overflow-hidden border-2 transition-all hover:scale-110 active:scale-95 ${
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

// Memoize page state lookups to avoid calling getPageState() for every page on every render.
const PageDots = memo(function PageDots({ pages, activePage, getPageState, onSetActivePage }) {
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
        />
      ))}
    </div>
  )
})

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
  const pageCount = pages.length
  const hasMultiplePages = pageCount > 1

  const totalCells = useMemo(() => {
    const structure = layout.structure || [{ size: 100, subdivisions: 1, subSizes: [100] }]
    return structure.reduce((total, section) => total + (section.subdivisions || 1), 0)
  }, [layout.structure])

  const hasUndoRedo = canUndo || canRedo

  // Requirement: Collapse to single row on mobile when only 1 page to save vertical space.
  // Approach: Pages row only renders on mobile when hasMultiplePages; single-page shows
  //   cell grid + add page + undo/redo in one row. Undo/redo hidden when both disabled.
  // Alternatives:
  //   - Always show two rows: Rejected — wastes ~40px on mobile for the most common case (1 page)
  //   - Hide undo/redo entirely: Rejected — they should appear once user makes changes
  return (
    <div className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm border-b border-zinc-200/60 dark:border-zinc-700/60 px-3 sm:px-4 py-1.5 sticky z-20" style={{ top: 'var(--tab-nav-height, 41px)' }}>
      {/* Desktop: single row always. Mobile: one row (1 page) or two rows (multi-page) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
        {/* Pages row — hidden on mobile when single page, always shown on desktop */}
        {hasMultiplePages && (
          <div className="flex items-center gap-1.5 sm:hidden min-w-0">
            {/* Page thumbnails - scrollable */}
            <div className="flex-1 min-w-0 overflow-x-auto scrollbar-thin">
              <PageDots
                pages={pages}
                activePage={activePage}
                getPageState={getPageState}
                onSetActivePage={onSetActivePage}
              />
            </div>

            {/* Page actions — 44px touch targets for mobile (this block is sm:hidden) */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => onMovePage(activePage, activePage - 1)}
                disabled={activePage === 0}
                title="Move page left"
                className="w-11 h-11 rounded flex items-center justify-center text-ui-text-subtle hover:bg-ui-surface-hover active:bg-ui-surface-inset disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => onMovePage(activePage, activePage + 1)}
                disabled={activePage === pageCount - 1}
                title="Move page right"
                className="w-11 h-11 rounded flex items-center justify-center text-ui-text-subtle hover:bg-ui-surface-hover active:bg-ui-surface-inset disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={onDuplicatePage}
                title="Duplicate page"
                className="w-11 h-11 rounded flex items-center justify-center text-ui-text-subtle hover:bg-ui-surface-hover active:bg-ui-surface-inset transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={onAddPage}
                title="Add new page"
                className="w-11 h-11 rounded flex items-center justify-center text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <ConfirmButton
                onConfirm={() => onRemovePage(activePage)}
                confirmLabel={`Delete page ${activePage + 1}?`}
                disabled={pageCount <= 1}
                title="Remove current page"
                className="w-11 h-11 rounded flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </ConfirmButton>
            </div>
          </div>
        )}

        {/* Desktop pages row (always visible on desktop) */}
        <div className="hidden sm:flex items-center gap-1.5 sm:flex-1 min-w-0">
          <span className="text-[10px] text-ui-text-faint uppercase tracking-wide shrink-0">Pages</span>

          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-thin">
            <PageDots
              pages={pages}
              activePage={activePage}
              getPageState={getPageState}
              onSetActivePage={onSetActivePage}
            />
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {hasMultiplePages && (
              <>
                <button
                  onClick={() => onMovePage(activePage, activePage - 1)}
                  disabled={activePage === 0}
                  title="Move page left"
                  className="w-7 h-7 rounded flex items-center justify-center text-ui-text-subtle hover:bg-ui-surface-hover active:bg-ui-surface-inset disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => onMovePage(activePage, activePage + 1)}
                  disabled={activePage === pageCount - 1}
                  title="Move page right"
                  className="w-7 h-7 rounded flex items-center justify-center text-ui-text-subtle hover:bg-ui-surface-hover active:bg-ui-surface-inset disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            {hasMultiplePages && (
              <button
                onClick={onDuplicatePage}
                title="Duplicate page"
                className="w-7 h-7 rounded flex items-center justify-center text-ui-text-subtle hover:bg-ui-surface-hover active:bg-ui-surface-inset transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
            <button
              onClick={onAddPage}
              title="Add new page"
              className="w-7 h-7 rounded flex items-center justify-center text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {hasMultiplePages && (
              <ConfirmButton
                onConfirm={() => onRemovePage(activePage)}
                confirmLabel={`Delete page ${activePage + 1}?`}
                disabled={pageCount <= 1}
                title="Remove current page"
                className="w-7 h-7 rounded flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </ConfirmButton>
            )}
          </div>
        </div>

        {/* Divider - only on desktop */}
        <div className="w-px h-6 bg-ui-border shrink-0 hidden sm:block" />

        {/* Cell selector + add page (single page mobile) + undo/redo */}
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

          {/* Add page button — only on mobile single-page (multi-page has it in the pages row above) */}
          {!hasMultiplePages && (
            <button
              onClick={onAddPage}
              title="Add new page"
              className="w-11 h-11 sm:hidden rounded flex items-center justify-center text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}

          {/* Divider — hidden on mobile when undo/redo is hidden */}
          <div className={`w-px h-6 bg-ui-border shrink-0 ${!hasUndoRedo ? 'hidden sm:block' : ''}`} />

          {/* Undo/Redo — hidden on mobile when both disabled, always shown on desktop */}
          <div className={`flex items-center gap-1 sm:gap-0.5 sm:flex-1 sm:min-w-0 sm:justify-end shrink-0 ${!hasUndoRedo ? 'hidden sm:flex' : ''}`}>
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
              className={`p-2.5 sm:p-1.5 rounded-lg transition-all ${
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
              aria-label="Redo"
              className={`p-2.5 sm:p-1.5 rounded-lg transition-all ${
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
