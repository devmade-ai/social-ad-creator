# TODO

Future enhancements and ideas for CanvaGrid.

---

## Prioritized Improvements

### Medium Priority

| Item | Effort | Description |
|------|--------|-------------|
| **Looks define per-element text styling** | Medium | Extend `stylePresets.js` to include text colors and bold/italic per element. Makes presets feel more polished. |

### Low Priority (Long-term)

| Item | Effort | Description |
|------|--------|-------------|
| **TypeScript migration** | High | Incremental approach: start with config files and hooks, then components. Do when there's dedicated time. |
| **Unit tests for config utilities** | Low-Medium | Test helpers in `stylePresets.js`, `layoutPresets.js`. Do alongside TS migration or when configs change. |
| **Calculate imageAspectRatio from first image** | Low | `App.jsx:94` has `useState(null)` with TODO. Wire up calculation from first image in pool so `getSuggestedLayouts` returns filtered results. |
| **Sanitize markdown HTML output** | Low | `AdCanvas.jsx` uses `dangerouslySetInnerHTML` with `marked` output (lines 515, 567). Safe for single-user local tool, but add DOMPurify if app ever accepts shared/imported content. |
| **Extract large components** | Medium | `MediaTab.jsx` (1328 lines), `LayoutTab.jsx` (911 lines), `useAdState.js` (852 lines), `AdCanvas.jsx` (818 lines), `App.jsx` (815 lines) all exceed the 800-line threshold. Extract sub-components when modifying these files. |

---

## Considered & Declined

| Item | Reason |
|------|--------|
| Template gallery with complete designs | Overlaps with save/load. Base64 images make templates heavy. Revisit after save/load is implemented. |
| Looks define text visibility per layout | Visibility feels like layout's job, not a "look". Could confuse users. |
| Animation preview for story formats | High complexity, low ROI for a static design tool. Out of scope. |
| Aspect ratio lock for custom sizes | 20 platform presets already cover most use cases. Niche need. |
| Image cropping within frame | Repositioning exists (preset grid + sliders planned). True cropping would need a crop UI - revisit if users request it. |
