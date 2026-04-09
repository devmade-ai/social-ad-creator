# TODO

Future enhancements and ideas for CanvaGrid.

---

## Prioritized Improvements

### Medium Priority

| Item | Effort | Description |
|------|--------|-------------|
| **TypeScript migration** | Medium-High | Actual state: ~30% of config (3/11: textDefaults.ts, fonts.ts, sampleImages.ts), ~17% of utils (1/6: layoutHelpers.ts), 0% hooks, 0% components. Next: finish config + utils, then hooks (useHistory, useAdState — needs generic types), then components (.jsx → .tsx, starting smallest). |
| **React Context for theme values** | Medium | `useDarkMode` returns 4 values threaded through App.jsx → 3 layout components → ThemeSelector (12 prop passes). Replace with ThemeContext/ThemeProvider so ThemeSelector consumes the hook directly. Eliminates prop drilling without adding complexity. |

### Low Priority (Long-term)

| Item | Effort | Description |
|------|--------|-------------|
| **Expand unit test coverage** | Low-Medium | Current: 76 tests across 6 files (cellUtils, layoutPresets, stylePresets, canvasRenderers, exportHelpers, oklchToHex). Untested: designStorage.js (IndexedDB ops — needs mock), debugLog.js (circular buffer, pub/sub, console interception, subscriber replay, report generation, URL redaction), usePWAUpdate.js (singleton state, wasJustUpdated suppression, visibility handler — needs SW mocks), usePWAInstall.js (detectBrowser with iOS variants, singleton state, trackInstallEvent, install prompt flow — needs beforeinstallprompt mock), layouts.js (toRgba, gradient stops), platforms.js (group structure validation), themes.js (neutral colors, preset integrity, variant resolution, backward compat mapping). |


