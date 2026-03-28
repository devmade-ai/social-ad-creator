# TODO

Future enhancements and ideas for CanvaGrid.

---

## Prioritized Improvements

### High Priority

| Item | Effort | Description |
|------|--------|-------------|
| **Unassigned image feedback** | Low | `useAdState.js:228` — `addImage()` auto-assigns to first unoccupied cell, but if all cells are occupied the image goes to library silently. Violates "Provide feedback for all user actions" (UX Non-Negotiable). Add toast via return value. |
| **Accessibility pass** | Medium | ~20 elements across 5 files: platform chevron/format buttons lack `aria-label` (PlatformPreview.jsx), mobile menu items missing `role="menuitem"` (App.jsx), overlay type buttons need labels (StyleTab.jsx), decorative SVGs need `aria-hidden="true"`. |
| **Phase 4: Add remaining platform format data** | Medium | `platforms.js` — Add format specs for: Pinterest (Pin, Story), Snapchat (Snap Ad, Story), YouTube (Thumbnail, End Screen), WhatsApp (Status), Threads (Post, Story). Add e-commerce category: Takealot, Amazon (Product, Storefront), Shopify, Etsy. Each needs formats array with dimensions, tips, recommendedFormat, maxFileSize. |

### Medium Priority

| Item | Effort | Description |
|------|--------|-------------|
| **Lazy font loading** | Low | App.jsx renders all 15 Google Font `<link>` tags on mount (lines 475, 521, 657). On slow mobile connections, 15 HTTP requests delay first paint. Load only 2 active fonts on mount; load remaining 13 when StyleTab Fonts section expands. |
| **Looks define per-element text styling** | Medium | Extend `stylePresets.js` to include text colors and bold/italic per element. Currently looks change fonts/filters but text stays default white — presets feel half-finished. |
| **Calculate imageAspectRatio from first image** | Low | `TemplatesTab.jsx:171` passes `null` to `getSuggestedLayouts()`, so "Suggested" layout category always returns same 3 generic results. Derive ratio from `state.images[0].naturalWidth/Height` in App.jsx and pass as prop. |
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
