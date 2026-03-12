# TODO

Future enhancements and ideas for CanvaGrid.

---

## Prioritized Improvements

### High Priority

| Item | Effort | Description |
|------|--------|-------------|
| **Phase 4: Add remaining platform format data** | Medium | `platforms.js` — Add format specs for: Pinterest (Pin, Story), Snapchat (Snap Ad, Story), YouTube (Thumbnail, End Screen), WhatsApp (Status), Threads (Post, Story). Add e-commerce category: Takealot, Amazon (Product, Storefront), Shopify, Etsy. Each needs formats array with dimensions, tips, recommendedFormat, maxFileSize. |
| **Validate loaded design state** | Low | `useAdState.js:901` — `loadDesign()` doesn't bounds-check `activePage` against `pages.length`. Corrupted or outdated saves could crash the app. Add field validation and fallbacks. |
| **Multi-page export uses arbitrary timeout** | Low | `ExportButtons.jsx:290` — `setTimeout(resolve, 300)` to wait for React re-render before capturing page. If state update is slow, captures stale canvas. Use a callback or ref-based signal instead of timing. |

### Medium Priority

| Item | Effort | Description |
|------|--------|-------------|
| **Looks define per-element text styling** | Medium | Extend `stylePresets.js` to include text colors and bold/italic per element. Makes presets feel more polished. |
| **Extract large components** | Medium | `MediaTab.jsx` (1328), `LayoutTab.jsx` (911), `useAdState.js` (852), `AdCanvas.jsx` (818), `App.jsx` (815) all exceed the 800-line threshold. Extract sub-components when next modifying these files. |
| ~~**Replace browser confirm() in SaveLoadModal and ContextBar**~~ | ~~Low~~ | Done — `ConfirmButton.jsx` replaces `confirm()` in both components. |
| ~~**Save feedback**~~ | ~~Low~~ | Done — Toast notifications added for save, delete, and all export operations. |
| **Unassigned image feedback** | Low | `useAdState.js:224` — `addImage()` auto-assigns to first unoccupied image cell, but if all cells are occupied the image is added to the library with no cell and no feedback to the user about why. |

### Low Priority (Long-term)

| Item | Effort | Description |
|------|--------|-------------|
| **TypeScript migration** | High | Incremental approach: start with config files and hooks, then components. Do when there's dedicated time. |
| **Unit tests for config utilities** | Low-Medium | Test helpers in `stylePresets.js`, `layoutPresets.js`. Do alongside TS migration or when configs change. |
| **Calculate imageAspectRatio from first image** | Low | `App.jsx:94` has `useState(null)`. Wire up calculation from first image in pool so `getSuggestedLayouts` returns filtered results. |
| **Sanitize markdown HTML output** | Low | `AdCanvas.jsx` uses `dangerouslySetInnerHTML` with `marked` output (lines 515, 567). Safe for single-user local tool, but add DOMPurify if app ever accepts shared/imported content. |
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
