import { useState, memo } from 'react'

/**
 * CollapsibleSection - Reusable collapsible section component for tab content
 *
 * @param {string} title - Section header text
 * @param {boolean} defaultExpanded - Whether section starts expanded (default: true)
 * @param {React.ReactNode} children - Section content
 * @param {string} className - Additional classes for the container
 */
export default memo(function CollapsibleSection({
  title,
  defaultExpanded = true,
  children,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={`border border-ui-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-ui-surface-elevated hover:bg-zinc-100 dark:hover:bg-dark-elevated transition-colors"
      >
        <span className="text-sm font-medium text-ui-text">{title}</span>
        <svg
          className={`w-4 h-4 text-ui-text-subtle transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 space-y-3 bg-white dark:bg-dark-card">
          {children}
        </div>
      )}
    </div>
  )
})
