# TODO

Future enhancements and ideas for Grumpy Cam Canvas 🫩.

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

---

## Considered & Declined

| Item | Reason |
|------|--------|
| Template gallery with complete designs | Overlaps with save/load. Base64 images make templates heavy. Revisit after save/load is implemented. |
| Looks define text visibility per layout | Visibility feels like layout's job, not a "look". Could confuse users. |
| Animation preview for story formats | High complexity, low ROI for a static ad creator. Out of scope. |
| Aspect ratio lock for custom sizes | 20 platform presets already cover most use cases. Niche need. |
| Image cropping within frame | Repositioning exists (preset grid + sliders planned). True cropping would need a crop UI - revisit if users request it. |
