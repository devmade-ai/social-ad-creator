# TODO

Future enhancements and ideas for CanvaGrid.

---

## Prioritized Improvements

### Medium Priority

| Item | Effort | Description |
|------|--------|-------------|
| **TypeScript migration** | Medium-High | Actual state: ~30% of config (3/11: textDefaults.ts, fonts.ts, sampleImages.ts), ~11% of utils (1/9: layoutHelpers.ts), 0% hooks, 0% components. Next: finish config + utils, then hooks (useHistory, useAdState — needs generic types), then components (.jsx → .tsx, starting smallest). |
| **React Context for theme values** | Medium | `useDarkMode` returns 8 values threaded through App.jsx → 3 layout components → ThemeSelector (24 prop passes). Replace with ThemeContext/ThemeProvider so ThemeSelector consumes the hook directly. Eliminates prop drilling without adding complexity. |
| **Split useDarkMode hook** | Medium | Single hook manages dark/light toggle AND per-mode theme selection. Split into `useDarkMode()` (mode only) + `useThemeSelection(isDark)` (theme catalog, validation, meta color). Improves testability and single responsibility. |

### Low Priority (Long-term)

| Item | Effort | Description |
|------|--------|-------------|
| **Expand unit test coverage** | Low-Medium | Current: 72 tests across 6 files (cellUtils, layoutPresets, stylePresets, canvasRenderers, exportHelpers, oklchToHex). Untested: designStorage.js (IndexedDB ops — needs mock), debugLog.js (circular buffer, pub/sub), layouts.js (toRgba, gradient stops), platforms.js (group structure validation), themes.js (neutral colors, preset integrity, variant resolution, backward compat mapping). |

- [ ] **Migrate buttons to DaisyUI `btn` component** — 150+ buttons across all components use hand-rolled Tailwind classes (`px-3 py-1.5 rounded-lg bg-primary text-primary-content hover:bg-primary/80` etc.) instead of DaisyUI's `btn btn-primary btn-sm` etc. High effort, high regression risk — needs careful per-component review since buttons have varied sizes, ghost styles, and icon-only variants. Audit found ~3% DaisyUI compliance on buttons.
- [ ] **`no-print` utility class + print CSS** — Add `@media print` rules: `.no-print { display: none !important; }`, force white bg/black text, `break-inside: avoid` on sections. canva-grid uses pdf-lib for export, but this prevents garbage output if a user hits Ctrl+P. Near-zero effort. Pattern: glow-props Suggested Implementations → Download as PDF → Print-Friendly CSS.

