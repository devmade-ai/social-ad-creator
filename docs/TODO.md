# TODO

Future enhancements and ideas for CanvaGrid.

---

## Prioritized Improvements

### Medium Priority

| Item | Effort | Description |
|------|--------|-------------|
| **Extract large components** | Medium | `MediaTab.jsx` (1397), `LayoutTab.jsx` (952), `ContentTab.jsx` (915), `AdCanvas.jsx` (878), `ExportButtons.jsx` (701) exceed the 800-line threshold. Extract sub-components when next modifying these files. |

### Mobile UX

| Item | Effort | Description |
|------|--------|-------------|
| **Long-press cell actions** | Low | Long-press on a cell in the canvas to show a context menu (assign image, edit text, change overlay). Reduces tab-hopping on mobile. Needs design decision on menu contents. |
| **Platform picker modal redesign** | Medium | Platform selector is a long scrollable list — awkward in a bottom sheet. Consider a dedicated modal or grouped card layout for mobile. Needs design direction. |
| **Extract App.jsx mobile/desktop paths** | Medium | App.jsx (788 lines) has 3 render branches (reader/mobile/desktop). Extract `ReaderMode.jsx`, `MobileLayout.jsx`, `DesktopLayout.jsx` to keep App.jsx focused on state. |

### Low Priority (Long-term)

| Item | Effort | Description |
|------|--------|-------------|
| **Unit tests for config utilities** | Low-Medium | Test pure functions: `getSuggestedLayouts`, `getPresetsByAspectRatio` (layoutPresets.js), `normalizeStructure`, `getCellInfo`, `cleanupOrphanedCells` (cellUtils.js). ~15 test cases. Add Jest. |
| **TypeScript migration** | High | Incremental: start with config files (textDefaults.js, fonts.js — 5 min each), then utils (cellUtils.js), then hooks (useHistory.js). Define core types: Layout, Structure, TextLayer, FreeformBlock, ImageEntry. |

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
