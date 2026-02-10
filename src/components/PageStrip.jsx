import { memo, useRef, useMemo } from 'react'
import { platforms } from '../config/platforms'

// Tiny canvas preview for page thumbnails
function PageThumbnail({ pageState, isActive, onClick, index, platform }) {
  const platformData = platforms.find((p) => p.id === platform) || platforms[0]
  const aspectRatio = platformData.width / platformData.height
  const thumbHeight = 48
  const thumbWidth = thumbHeight * aspectRatio

  const bgColor = pageState?.theme?.primary || '#1a1a2e'

  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 rounded-md overflow-hidden border-2 transition-all hover:scale-105 ${
        isActive
          ? 'border-primary ring-2 ring-primary/30 shadow-sm'
          : 'border-ui-border hover:border-ui-border-strong'
      }`}
      style={{ width: thumbWidth, height: thumbHeight }}
      title={`Page ${index + 1}`}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <span className={`text-[9px] font-bold ${isActive ? 'text-white' : 'text-white/70'}`}>
          {index + 1}
        </span>
      </div>
    </button>
  )
}

export default memo(function PageStrip({
  pages,
  activePage,
  onSetActivePage,
  onAddPage,
  onDuplicatePage,
  onRemovePage,
  onMovePage,
  getPageState,
  platform,
}) {
  const scrollRef = useRef(null)
  const pageCount = pages.length

  // Scroll active page into view
  const scrollToActive = () => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.children[activePage]
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-zinc-200/80 dark:border-zinc-700/50 shadow-card p-3">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Page label */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-medium text-ui-text-muted">Pages</span>
          <span className="text-[10px] text-ui-text-subtle bg-ui-surface-inset px-1.5 py-0.5 rounded">
            {activePage + 1}/{pageCount}
          </span>
        </div>

        {/* Page thumbnails - scrollable */}
        <div className="flex-1 min-w-0 overflow-x-auto scrollbar-thin order-last sm:order-none w-full sm:w-auto" ref={scrollRef}>
          <div className="flex flex-wrap sm:flex-nowrap gap-1.5 py-0.5">
            {pages.map((_, index) => {
              const pageState = getPageState(index)
              return (
                <PageThumbnail
                  key={index}
                  pageState={pageState}
                  isActive={index === activePage}
                  onClick={() => onSetActivePage(index)}
                  index={index}
                  platform={platform}
                />
              )
            })}
          </div>
        </div>

        {/* Page actions */}
        <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
          {/* Move left */}
          <button
            onClick={() => onMovePage(activePage, activePage - 1)}
            disabled={activePage === 0}
            title="Move page left"
            className="w-6 h-6 rounded flex items-center justify-center text-ui-text-subtle hover:bg-ui-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Move right */}
          <button
            onClick={() => onMovePage(activePage, activePage + 1)}
            disabled={activePage === pageCount - 1}
            title="Move page right"
            className="w-6 h-6 rounded flex items-center justify-center text-ui-text-subtle hover:bg-ui-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="w-px h-4 bg-ui-border mx-0.5" />

          {/* Duplicate page */}
          <button
            onClick={onDuplicatePage}
            title="Duplicate page"
            className="w-6 h-6 rounded flex items-center justify-center text-ui-text-subtle hover:bg-ui-surface-hover transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Add page */}
          <button
            onClick={onAddPage}
            title="Add new page"
            className="w-6 h-6 rounded flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Remove page */}
          <button
            onClick={() => onRemovePage(activePage)}
            disabled={pageCount <= 1}
            title="Remove current page"
            className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
})
