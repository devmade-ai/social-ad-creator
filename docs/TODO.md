# TODO

Future enhancements and ideas for CanvaGrid.

---

## Prioritized Improvements

### Medium Priority

| Item | Effort | Description |
|------|--------|-------------|
| **Wire App.jsx layout components** | Medium | ReaderMode.jsx, MobileLayout.jsx, DesktopLayout.jsx files exist but App.jsx render branches need replacing with component usage. Complex prop threading — needs careful validation. |
| **TypeScript migration Phase 3-4** | Medium-High | Phases 1-2 done (config + utils). Remaining: hooks (useHistory, useAdState — needs generic types) and components (.jsx → .tsx, starting smallest). |

### Low Priority (Long-term)

| Item | Effort | Description |
|------|--------|-------------|
| **Expand unit test coverage** | Low-Medium | Current: 27 tests for cellUtils + layoutPresets. Add tests for: exportHelpers (waitForPaint, captureAsBlob), canvasRenderers (buildFilterStyle, getAlignItems), designStorage (IDB operations). |

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
