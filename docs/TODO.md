# TODO

Future enhancements and ideas for CanvaGrid.

---

## Prioritized Improvements

### High Priority

| Item | Effort | Description |
|------|--------|-------------|
| **Phase 4: Add remaining platform format data** | Medium | `platforms.js` — Add format specs for: Pinterest (Pin, Story), Snapchat (Snap Ad, Story), YouTube (Thumbnail, End Screen), WhatsApp (Status), Threads (Post, Story). Add e-commerce category: Takealot, Amazon (Product, Storefront), Shopify, Etsy. Each needs formats array with dimensions, tips, recommendedFormat, maxFileSize. |

### Medium Priority

| Item | Effort | Description |
|------|--------|-------------|
| **Looks define per-element text styling** | Medium | Extend `stylePresets.js` to include text colors and bold/italic per element. Makes presets feel more polished. |
| **Extract large components** | Medium | `MediaTab.jsx` (1328), `LayoutTab.jsx` (911), `useAdState.js` (852), `AdCanvas.jsx` (818) exceed the 800-line threshold. Extract sub-components when next modifying these files. `App.jsx` grew again with dual mobile/desktop layout paths — see "Extract App.jsx mobile/desktop paths" in Mobile UX section. |
| **Unassigned image feedback** | Low | `useAdState.js:224` — `addImage()` auto-assigns to first unoccupied image cell, but if all cells are occupied the image is added to the library with no cell and no feedback to the user about why. |

### Mobile UX

| Item | Effort | Description |
|------|--------|-------------|
| **Pinch-to-zoom on canvas** | Medium | Mobile canvas is edge-to-edge but no zoom. Add pinch gesture to zoom in/out on the canvas preview. Needs careful interaction with swipe-to-navigate-pages. |
| **Long-press cell actions** | Low | Long-press on a cell in the canvas to show a context menu (assign image, edit text, change overlay). Reduces tab-hopping on mobile. |
| **Platform picker modal redesign** | Medium | Platform selector is a long scrollable list — awkward in a bottom sheet. Consider a dedicated modal or grouped card layout for mobile. |
| **Lazy font loading** | Low | All 15 Google Fonts load on mount. On mobile with slow connections, defer loading non-active fonts until the font picker is opened. |
| **Extract App.jsx mobile/desktop paths** | Medium | App.jsx grew with dual layout rendering. Consider extracting `MobileLayout` and `DesktopLayout` wrapper components to keep App.jsx focused on state. |

### Low Priority (Long-term)

| Item | Effort | Description |
|------|--------|-------------|
| **TypeScript migration** | High | Incremental approach: start with config files and hooks, then components. Do when there's dedicated time. |
| **Unit tests for config utilities** | Low-Medium | Test helpers in `stylePresets.js`, `layoutPresets.js`. Do alongside TS migration or when configs change. |
| **Calculate imageAspectRatio from first image** | Low | `App.jsx:94` has `useState(null)`. Wire up calculation from first image in pool so `getSuggestedLayouts` returns filtered results. |
| **Accessibility pass** | Medium | Multiple gaps: cell overlay divs lack `aria-label` (`App.jsx`), sample image error fallbacks lack roles (`MediaTab.jsx`), platform select buttons lack labels (`ExportButtons.jsx`). Address during next UX pass. |

---

## Considered & Declined

| Item | Reason |
|------|--------|
| Template gallery with complete designs | Overlaps with save/load. Base64 images make templates heavy. Revisit after save/load is implemented. |
| Looks define text visibility per layout | Visibility feels like layout's job, not a "look". Could confuse users. |
| Animation preview for story formats | High complexity, low ROI for a static design tool. Out of scope. |
| Aspect ratio lock for custom sizes | 20 platform presets already cover most use cases. Niche need. |
| Image cropping within frame | Repositioning exists (preset grid + sliders planned). True cropping would need a crop UI - revisit if users request it. |
| Memoize getOverlayStyle / renderCellImage | These run per-cell per-render but the cost is trivial (simple object creation). Memoizing would add complexity without measurable gain. Revisit only if profiling shows bottleneck. |
| Inline onClick handlers in .map() loops | Present across many tab components. Extracting to useCallback would add boilerplate with no measurable perf gain — these lists are small (< 20 items) and React handles this fine. |
