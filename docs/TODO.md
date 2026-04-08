# TODO

Future enhancements and ideas for CanvaGrid.

---

## Prioritized Improvements

### Medium Priority

| Item | Effort | Description |
|------|--------|-------------|
| **TypeScript migration** | Medium-High | Actual state: ~30% of config (3/11: textDefaults.ts, fonts.ts, sampleImages.ts), ~11% of utils (1/9: layoutHelpers.ts), 0% hooks, 0% components. Next: finish config + utils, then hooks (useHistory, useAdState — needs generic types), then components (.jsx → .tsx, starting smallest). |
| **React Context for theme values** | Medium | `useDarkMode` returns 4 values threaded through App.jsx → 3 layout components → ThemeSelector (12 prop passes). Replace with ThemeContext/ThemeProvider so ThemeSelector consumes the hook directly. Eliminates prop drilling without adding complexity. |

### Low Priority (Long-term)

| Item | Effort | Description |
|------|--------|-------------|
| **Expand unit test coverage** | Low-Medium | Current: 72 tests across 6 files (cellUtils, layoutPresets, stylePresets, canvasRenderers, exportHelpers, oklchToHex). Untested: designStorage.js (IndexedDB ops — needs mock), debugLog.js (circular buffer, pub/sub), layouts.js (toRgba, gradient stops), platforms.js (group structure validation), themes.js (neutral colors, preset integrity, variant resolution, backward compat mapping). |

- [ ] **App.jsx stale closure Escape handlers (lines 332-338)** — `useEffect` has `[]` deps but references `showShortcuts`, `showMobileMenu`, `isReaderMode` — always their initial values. Dead code. BurgerMenu handles its own Escape via `useEscapeKey`, modals use native `<dialog>` Escape. Fix: either add proper deps or remove the handlers entirely.

- [ ] **Print CSS hardening** — `.no-print { display: none }` rule added. Remaining: force white bg/black text, `break-inside: avoid` on sections. canva-grid uses pdf-lib for export, but this prevents garbage output if a user hits Ctrl+P. Pattern: glow-props Implementation Patterns → Download as PDF → Print-Friendly CSS.

