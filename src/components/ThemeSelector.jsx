// Requirement: Combo-based DaisyUI theme selection in the header.
// Approach: DaisyUI join component for connected dark/light toggle + combo picker.
//   Two combos means no dropdown needed — just toggle between them.
// Alternatives:
//   - flex + gap with manual border-radius: Replaced — join handles connected borders,
//     border-radius on first/last items, and consistent group styling.
//   - Dropdown with theme list: Rejected — only 2 combos, inline toggle is simpler.
import { themeCombos } from '../config/daisyuiThemes'

export default function ThemeSelector({
  isDark,
  toggleDarkMode,
  comboId,
  setCombo,
}) {
  return (
    <div className="join">
      {/* Mode toggle — min 44px touch target on mobile */}
      <button
        onClick={toggleDarkMode}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`join-item min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-medium bg-base-200 text-base-content hover:bg-base-300 active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>
      {/* Combo picker — toggle between combos inline */}
      {themeCombos.map((combo) => (
        <button
          key={combo.id}
          onClick={() => setCombo(combo.id)}
          aria-label={`${combo.name} theme`}
          aria-pressed={comboId === combo.id}
          className={`join-item min-h-[44px] px-2.5 text-xs font-medium transition-all active:scale-95
                     outline-none focus-visible:ring-2 focus-visible:ring-primary
                     ${comboId === combo.id
                       ? 'bg-base-300 text-base-content'
                       : 'bg-base-200 text-base-content/50 hover:bg-base-300 hover:text-base-content'
                     }`}
        >
          {combo.name}
        </button>
      ))}
    </div>
  )
}
