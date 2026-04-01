import { useState, memo } from 'react'

/**
 * CollapsibleSection - Reusable collapsible section component for tab content
 *
 * @param {string} title - Section header text
 * @param {string} subtitle - Optional preview text shown when collapsed (truncated)
 * @param {boolean} defaultExpanded - Whether section starts expanded (default: true)
 * @param {React.ReactNode} children - Section content
 * @param {string} className - Additional classes for the container
 */
export default memo(function CollapsibleSection({
  title,
  subtitle,
  defaultExpanded = true,
  children,
  className = '',
  onExpand,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={`border border-base-300 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => {
          const next = !isExpanded
          setIsExpanded(next)
          if (next) onExpand?.()
        }}
        className="w-full flex items-center justify-between px-3 py-3 lg:py-2.5 bg-base-200 hover:bg-base-300 transition-colors"
      >
        <span className="text-sm font-medium text-base-content flex items-center gap-2 min-w-0">
          <span className="shrink-0">{title}</span>
          {!isExpanded && subtitle && (
            <span className="text-[10px] text-base-content/40 font-normal truncate">— {subtitle}</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-base-content/60 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 space-y-3 bg-base-100">
          {children}
        </div>
      )}
    </div>
  )
})
