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
| **Wire App.jsx layout components** | Medium | ReaderMode.jsx, MobileLayout.jsx, DesktopLayout.jsx files exist but App.jsx render branches need replacing with component usage. Complex prop threading — needs careful validation. |
| **TypeScript migration Phase 3-4** | Medium-High | Phases 1-2 done (config + utils). Remaining: hooks (useHistory, useAdState — needs generic types) and components (.jsx → .tsx, starting smallest). |

- [ ] **Timer leak audit (nested timeouts)** — Audit all `useEffect` hooks for nested `setTimeout` patterns. Apply the array cleanup pattern or mounted-ref guard from glow-props. Candidates: debounced saves, bottom sheet animations, toast timers, any close-then-act patterns. Each leak risks state updates on unmounted components. Pattern: glow-props Suggested Implementations → PWA System → Fix: Timer Leaks on Unmount.
- [ ] **Z-index scale standardization** — Audit and align all z-index values to the glow-props scale: headers=20, sheets=30, menu backdrop=40, menu dropdown=50, modals=60, toasts=70, debug pill=80. Affects: BottomSheet, burger menu, SaveLoadModal, TutorialModal, InstallInstructionsModal, KeyboardShortcutsOverlay, Toast, DebugPill. Prevents stacking bugs. Pattern: glow-props Suggested Implementations → Burger Menu → Z-Index Scale.
- [ ] **Burger menu disclosure pattern fixes** — Refactor mobile hamburger menu to add: `cursor-pointer` on backdrop (iOS Safari click fix), `hasBeenOpenRef` focus guard, `overscroll-contain` on menu card, `useId()` for `aria-controls`, proper `aria-expanded` + `<nav>` semantics. Accessibility and iOS bug fixes, not a rewrite. Pattern: glow-props Suggested Implementations → Burger Menu.

### Low Priority (Long-term)

| Item | Effort | Description |
|------|--------|-------------|
| **Expand unit test coverage** | Low-Medium | Current: 27 tests for cellUtils + layoutPresets. Add tests for: exportHelpers (waitForPaint, captureAsBlob), canvasRenderers (buildFilterStyle, getAlignItems), designStorage (IDB operations). |

- [ ] **`no-print` utility class + print CSS** — Add `@media print` rules: `.no-print { display: none !important; }`, force white bg/black text, `break-inside: avoid` on sections. canva-grid uses pdf-lib for export, but this prevents garbage output if a user hits Ctrl+P. Near-zero effort. Pattern: glow-props Suggested Implementations → Download as PDF → Print-Friendly CSS.

---

## Considered & Declined

| Item | Reason |
|------|--------|
| Pinch-to-zoom on canvas | Canvas already fits viewport at full resolution. Zooming into a portion has no clear value for a static design tool. Complex gesture conflicts with page swipe (which is more useful). High complexity, low ROI. |
| Template gallery with complete designs | Overlaps with save/load. Base64 images make templates heavy. Revisit after save/load is implemented. |
| Looks define text visibility per layout | Visibility feels like layout's job, not a "look". Could confuse users. |
| Animation preview for story formats | High complexity, low ROI for a static design tool. Out of scope. |
| Aspect ratio lock for custom sizes | 20 platform presets already cover most use cases. Niche need. |
| Image cropping within frame | Repositioning exists (preset grid + sliders planned). True cropping would need a crop UI - revisit if users request it. |
| Memoize getOverlayStyle / renderCellImage | These run per-cell per-render but the cost is trivial (simple object creation). Memoizing would add complexity without measurable gain. Revisit only if profiling shows bottleneck. |
| Inline onClick handlers in .map() loops | Present across many tab components. Extracting to useCallback would add boilerplate with no measurable perf gain — these lists are small (< 20 items) and React handles this fine. |
