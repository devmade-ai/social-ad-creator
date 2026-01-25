# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
Overlay system fixes, tab naming, aspect ratio filtering

## Accomplished

- **Per-image overlay**: Fixed overlay applying to all images - now each image has its own overlay settings
  - Overlay settings stored on each image in `images` array
  - Removed global `state.overlay` in favor of per-image `image.overlay`
  - MediaTab now uses `onUpdateImageOverlay` to modify selected image's overlay
  - AdCanvas reads overlay from image data when rendering

- **Outer border fix**: Fixed outer frame not displaying
  - Outer frame was using `boxShadow: inset` on container, but children covered it
  - Changed to separate absolute-positioned div with `zIndex: 9`
  - Frame now renders correctly on top of content

- **Tab renaming**: Renamed confusing tabs for clarity
  - "Templates" tab renamed to "Presets"
  - "Layout" tab renamed to "Structure"

- **Aspect ratio filtering**: Added layout filtering by aspect ratio in Presets tab
  - Added `aspectRatios` property to each layout preset (square, portrait, landscape)
  - New `aspectRatioCategories` and `getPresetsByAspectRatio` helpers
  - TemplatesTab now shows aspect ratio filter buttons (All, Square, Portrait, Landscape)
  - Filters combine with category filters

## Current state
- **Build**: Passes
- **Breaking change**: Global `state.overlay` removed, now per-image
- **Tab structure**: Presets, Media, Content, Structure, Style

## Key context

- Image overlay stored in `image.overlay` with defaults `{ type: 'solid', color: 'primary', opacity: 0 }`
- Style presets no longer apply overlay (since it's per-image)
- Layout presets have `aspectRatios` array for filtering
- Outer frame rendered as separate div, not box-shadow on container
