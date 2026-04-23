# TODO

Future enhancements and ideas for CanvaGrid.

---

## Prioritized Improvements

### Medium Priority

| Item | Effort | Description |
|------|--------|-------------|
| **TypeScript migration** | Medium-High | Actual state: ~30% of config (3/11: textDefaults.ts, fonts.ts, sampleImages.ts), ~13% of utils (1/9: layoutHelpers.ts), 0% hooks, 0% components. Next: finish config + utils, then hooks (useHistory, useAdState — needs generic types), then components (.jsx → .tsx, starting smallest). |
| **Sunset `utils/pwaCleanup.js`** | Trivial | One-shot cleanup added 2026-04-23 to drop pre-rename SW caches (`google-fonts-cache`, `gstatic-fonts-cache`). After ~6 months of all installs running the new SW (~Oct 2026), every existing install will have already deleted those caches once. At that point: delete `utils/pwaCleanup.js`, drop the call from `main.jsx`, remove the architecture line from CLAUDE.md. Confirm via debug-pill cache list before removing if any users are still on very old installs. |

### Low Priority (Long-term)

| Item | Effort | Description |
|------|--------|-------------|
| **Expand unit test coverage** | Low-Medium | Current: 150 tests across 12 files (cellUtils, layoutPresets, stylePresets, canvasRenderers, exportHelpers, fontEmbed, oklchToHex, pwaHelpers, layouts, platforms, themes, iconCacheBust). Untested: designStorage.js (IndexedDB ops — needs mock), debugLog.js (circular buffer, pub/sub, console interception, subscriber replay, report generation, URL redaction), pwaCleanup.js (trivial — caches.delete). PWA hook integration tests (singleton state, visibility handler, install prompt flow) would need browser API mocks. |
