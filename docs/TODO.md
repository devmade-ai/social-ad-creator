# TODO

Future enhancements and ideas for the Social Ad Creator.

---

## Potential Improvements

### Content & Presets

- [ ] **Save/load designs to localStorage** - Serialize full state to JSON, persist across sessions. High value, low effort.
- [ ] **Looks define per-element text styling** - Extend `stylePresets.js` to include text colors and bold/italic per element (title, tagline, CTA, etc.). Creates more cohesive preset looks.

### Visual Effects

- [ ] **More overlay types** - Add diagonal gradients and radial-from-corner options. Update `layouts.js` and `AdCanvas.jsx`.

### Usability

- [ ] **Restore fine-grained image position sliders** - Currently only 9 preset positions (3x3 grid). Add x/y sliders for precise control.

### Technical

- [ ] **TypeScript migration** - Incremental migration recommended. Start with config files and hooks.
- [ ] **Unit tests for config utilities** - Test helpers in `stylePresets.js`, `layoutPresets.js`, etc.

---

## Considered & Declined

| Item | Reason |
|------|--------|
| Template gallery with complete designs | Overlaps with save/load. Base64 images make templates heavy. Revisit after save/load is implemented. |
| Looks define text visibility per layout | Visibility feels like layout's job, not a "look". Could confuse users. |
| Animation preview for story formats | High complexity, low ROI for a static ad creator. Out of scope. |
| Aspect ratio lock for custom sizes | 20 platform presets already cover most use cases. Niche need. |
| Image cropping within frame | Repositioning exists (preset grid + sliders planned). True cropping would need a crop UI - revisit if users request it. |
