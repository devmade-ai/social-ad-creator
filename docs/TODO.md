# TODO

Future enhancements and ideas for CanvaGrid.

---

## Prioritized Improvements

### Medium Priority

| Item | Effort | Description |
|------|--------|-------------|
| **TypeScript migration** | Medium-High | Actual state: ~30% of config (3/11: textDefaults.ts, fonts.ts, sampleImages.ts), ~13% of utils (1/9: layoutHelpers.ts), 0% hooks, 0% components. Next: finish config + utils, then hooks (useHistory, useAdState — needs generic types), then components (.jsx → .tsx, starting smallest). |
| **Sunset `utils/pwaCleanup.js`** | Trivial | One-shot cleanup added 2026-04-23 to drop pre-rename SW caches (`google-fonts-cache`, `gstatic-fonts-cache`). Verification mechanism: DebugPill PWA Diagnostics tab now shows an `SW Caches` row that flags any stale pre-rename names (warn status, e.g. `2 (stale: google-fonts-cache)`). When no debug report from a real install shows that warning for ~30 days (estimate ~Oct 2026), it's safe to: (1) delete `utils/pwaCleanup.js`, (2) drop the import + call from `main.jsx`, (3) remove the architecture line from CLAUDE.md, (4) remove the `SW Caches`-stale logic from DebugPill (the row itself can stay as a generic cache enumerator), (5) delete this TODO entry. |

### Low Priority (Long-term)

| Item | Effort | Description |
|------|--------|-------------|
| **Expand unit test coverage** | Low-Medium | Current: 164 tests across 14 files (cellUtils, layoutPresets, stylePresets, canvasRenderers, exportHelpers, fontEmbed, pwaCleanup, oklchToHex, pwaHelpers, layouts, platforms, themes, iconCacheBust, bundleSize). Untested: designStorage.js (IndexedDB ops — needs mock), debugLog.js (circular buffer, pub/sub, console interception, subscriber replay, report generation, URL redaction). PWA hook integration tests (singleton state, visibility handler, install prompt flow) would need browser API mocks. |
