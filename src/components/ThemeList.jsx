// Requirement: Reusable theme list for both mobile burger menu and desktop dropdown.
// Approach: Shared component rendering the active mode's theme options with checkmark
//   indicator, theme name, and description. Used by MenuThemeSection (MobileLayout)
//   and ThemeSelector (DesktopLayout/ReaderMode).
// Alternatives:
//   - Duplicate rendering in each consumer: Rejected — theme list UI was identical
//     in both places, violating DRY and risking visual drift.

export default function ThemeList({ themes, currentTheme, onSelect, className = '' }) {
  return (
    <div className={className}>
      {themes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onSelect(theme.id)}
          className={`w-full text-left px-4 py-2.5 text-sm
                     flex items-center gap-2 rounded-lg
                     transition-colors cursor-pointer min-h-11
                     outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset
                     ${currentTheme === theme.id ? 'bg-base-200' : 'hover:bg-base-200'}`}
        >
          <span className={`text-primary text-xs ${currentTheme === theme.id ? '' : 'invisible'}`} aria-hidden="true">&#10003;</span>
          <span>{theme.name}</span>
          <span className="ml-auto text-xs text-base-content/40">{theme.description}</span>
        </button>
      ))}
    </div>
  )
}
