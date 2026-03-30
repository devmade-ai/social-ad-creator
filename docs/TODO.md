# TODO

Future enhancements and ideas for CanvaGrid.

---

## Prioritized Improvements

### High Priority (Quick Wins from glow-props alignment)

- [ ] **Cross-tab dark mode sync** — Add `storage` event listener to `useDarkMode.js` so toggling dark mode in one tab updates all other open tabs. ~10 lines. Without this, tabs show different themes until manually refreshed. Pattern: glow-props Suggested Implementations → Theme & Dark Mode.
- [ ] **Dynamic meta theme-color update** — In `useDarkMode.js` effect, update all `<meta name="theme-color">` tags via `querySelectorAll` on toggle. ~5 lines. Without this, Android Chrome address bar stays wrong color after manual dark mode toggle. Pattern: glow-props Suggested Implementations → Theme & Dark Mode.
- [ ] **`color-scheme: dark` on `html.dark`** — Add `html.dark { color-scheme: dark; }` to CSS. 1 line. Without this, native `<select>`, `<input>`, and scrollbars stay light-themed in dark mode. Visible in platform selector, font selectors, text inputs.
- [ ] **Safe localStorage access** — Wrap all direct `localStorage.getItem`/`setItem` calls in `useDarkMode.js` and `usePWAInstall.js` with try/catch helpers (`safeStorageGet`/`safeStorageSet`). Prevents crashes in sandboxed iframes and enterprise browsers that disable storage. Pattern: glow-props Suggested Implementations → Theme & Dark Mode.

### Medium Priority

| Item | Effort | Description |
|------|--------|-------------|
| **TypeScript migration** | Medium-High | Actual state: ~30% of config (3/11: textDefaults.ts, fonts.ts, sampleImages.ts), ~11% of utils (1/9: layoutHelpers.ts), 0% hooks, 0% components. Next: finish config + utils, then hooks (useHistory, useAdState — needs generic types), then components (.jsx → .tsx, starting smallest). |

- [ ] **Timer leak audit (nested timeouts)** — Audit all `useEffect` hooks for nested `setTimeout` patterns. Apply the array cleanup pattern or mounted-ref guard from glow-props. Candidates: debounced saves, bottom sheet animations, toast timers, any close-then-act patterns. Each leak risks state updates on unmounted components. Pattern: glow-props Suggested Implementations → PWA System → Fix: Timer Leaks on Unmount.
- [ ] **Z-index scale standardization** — Audit and align all z-index values to the glow-props scale: headers=20, sheets=30, menu backdrop=40, menu dropdown=50, modals=60, toasts=70, debug pill=80. Affects: BottomSheet, burger menu, SaveLoadModal, TutorialModal, InstallInstructionsModal, KeyboardShortcutsOverlay, Toast, DebugPill. Prevents stacking bugs. Pattern: glow-props Suggested Implementations → Burger Menu → Z-Index Scale.
- [ ] **Burger menu disclosure pattern fixes** — Refactor mobile hamburger menu to add: `cursor-pointer` on backdrop (iOS Safari click fix), `hasBeenOpenRef` focus guard, `overscroll-contain` on menu card, `useId()` for `aria-controls`, proper `aria-expanded` + `<nav>` semantics. Accessibility and iOS bug fixes, not a rewrite. Pattern: glow-props Suggested Implementations → Burger Menu.

### Low Priority (Long-term)

| Item | Effort | Description |
|------|--------|-------------|
| **Expand unit test coverage** | Low-Medium | Current: 56 tests across 5 files (cellUtils, layoutPresets, stylePresets, canvasRenderers, exportHelpers). Untested: designStorage.js (IndexedDB ops — needs mock), debugLog.js (circular buffer, pub/sub), layouts.js (toRgba, gradient stops), platforms.js (group structure validation), themes.js (neutral colors, preset integrity). |

- [ ] **`no-print` utility class + print CSS** — Add `@media print` rules: `.no-print { display: none !important; }`, force white bg/black text, `break-inside: avoid` on sections. canva-grid uses pdf-lib for export, but this prevents garbage output if a user hits Ctrl+P. Near-zero effort. Pattern: glow-props Suggested Implementations → Download as PDF → Print-Friendly CSS.

