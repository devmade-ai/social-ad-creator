// Requirement: Eliminate theme prop drilling through layout components.
// Approach: React Context wrapping useDarkMode. ThemeSelector and MenuThemeSection
//   consume useTheme() directly instead of receiving 4 props forwarded through
//   App → DesktopLayout/MobileLayout/ReaderMode → ThemeSelector.
// Alternatives:
//   - Keep prop drilling: Rejected — 12 prop passes across 3 layout components
//     that don't use the values, just forward them.
//   - Merge into useDarkMode: Rejected — useDarkMode is a hook, not a context.
//     Multiple components calling useDarkMode() would create independent state.
import { createContext, useContext, createElement } from 'react'
import { useDarkMode } from './useDarkMode'

const ThemeContext = createContext(null)

// createElement instead of JSX — hooks use .js extension per project convention,
// and Vite only parses JSX in .jsx/.tsx files.
export function ThemeProvider({ children }) {
  const theme = useDarkMode()
  return createElement(ThemeContext.Provider, { value: theme }, children)
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
