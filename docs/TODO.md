# TODO

Future enhancements and ideas for CanvaGrid.

---

## Prioritized Improvements

### Medium Priority

| Item | Effort | Description |
|------|--------|-------------|
| **TypeScript migration** | Medium-High | Actual state: ~30% of config (3/11: textDefaults.ts, fonts.ts, sampleImages.ts), ~14% of utils (1/8: layoutHelpers.ts), 0% hooks, 0% components. Next: finish config + utils, then hooks (useHistory, useAdState — needs generic types), then components (.jsx → .tsx, starting smallest). |

### Low Priority (Long-term)

| Item | Effort | Description |
|------|--------|-------------|
| **Expand unit test coverage** | Low-Medium | Current: 150 tests across 12 files (cellUtils, layoutPresets, stylePresets, canvasRenderers, exportHelpers, fontEmbed, oklchToHex, pwaHelpers, layouts, platforms, themes, iconCacheBust). Untested: designStorage.js (IndexedDB ops — needs mock), debugLog.js (circular buffer, pub/sub, console interception, subscriber replay, report generation, URL redaction), pwaCleanup.js (trivial — caches.delete). PWA hook integration tests (singleton state, visibility handler, install prompt flow) would need browser API mocks. |
