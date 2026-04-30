// Requirement: Pure helpers extracted from useDarkMode for testability.
// Approach: Derivation logic (no React, no DOM, no localStorage access) lives
//   here so node-env Jest can assert the contract without rendering hooks.
// Alternatives:
//   - Inline in useDarkMode.js: Rejected — couldn't unit-test without testing-library.
//   - Test via @testing-library/react-hooks: Rejected — adds devDep + jsdom env
//     for one tripwire; matches pwaHelpers extraction pattern instead.

// First-visit default is light. The previous implementation honored
// `prefers-color-scheme` when no value was stored; that was deliberately
// removed for brand consistency on first impression. Keep this function
// strict — `stored === 'true'` is the only path to dark on init/sync, both
// for hook initialization and cross-tab `storage` events.
//
// Accepts: string ('true' | 'false') | null | undefined
// Returns: boolean
export function computeInitialDarkMode(stored) {
  return stored === 'true'
}
