# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
Multi-image system and frame borders

## Accomplished

- **Multi-image system**: Replaced single image with image library + per-cell assignment
  - `images` array holds all uploaded images
  - `cellImages` object maps cells to image IDs with per-cell settings
  - Each cell can have its own fit, position, and filters
  - MediaTab redesigned: upload to library, cell selector, assign images

- **Frame system**: Added colored borders using percentage of padding
  - Outer frame: Canvas-wide border
  - Per-cell frames: Individual cell borders
  - Frame width calculated as % of padding (keeps dimensions stable)
  - Controls in Style > Spacing section

- **Paper sizes**: Added A3, A4, A5 in portrait/landscape (150 DPI)

## Current state
- **Build**: Passes
- **Breaking change**: Old `image`, `imageObjectFit`, `imagePosition`, `imageFilters` state fields removed
- **New state fields**: `images`, `cellImages`, `frame`

## Key context

- Image cells determined by `cellImages` presence, not `imageCell` index
- `cellHasImage(cellIndex)` helper used throughout for consistency
- Frame renders as `box-shadow: inset` for clean borders
- StyleTab now receives `cellImages` prop for cell indicators
