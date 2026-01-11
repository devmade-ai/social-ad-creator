# TODO

Future enhancements and ideas for the Social Ad Creator.

## Layout & Positioning Overhaul (Completed)

### 1. Per-Cell Text Alignment

- [x] Add horizontal alignment (left/center/right) per layout cell
- [x] Add vertical alignment (top/center/bottom) per layout cell
- [x] Update layout config structure to store alignment per cell
- [x] Update AdCanvas to apply per-cell alignment styles

### 2. Move Overlay to Image Tab

- [x] Move OverlayControls component into ImageUploader tab
- [x] Update tab structure in App.jsx
- [x] Remove standalone Overlay tab

### 3. Text Element Grouping & Positioning

- [x] Decouple CTA from title/subtitle group (can position independently)
- [x] Keep title + subtitle as moveable pair
- [x] Keep body heading + body text as moveable pair
- [x] Footer can position independently
- [x] Add position selector per text group (which cell/row/column)

### 4. Image as Layer Over Cells

- [x] Change image from dedicated section to overlay spanning selected cells
- [x] Add cell selection UI for image placement (checkboxes for rows/columns)
- [x] Update AdCanvas to render image over selected grid cells
- [x] Handle z-index stacking with text overlays

### 5. Text Elements in Cells

- [x] Add cell assignment selector per text group
- [x] Allow text groups to be placed in any column/row
- [x] Update rendering to position text within assigned cells
- [x] Handle multiple text groups in same cell (stacking)

---

## Potential Improvements

- [x] Add undo/redo functionality (with Ctrl+Z / Ctrl+Y shortcuts)
- [ ] Save/load designs to localStorage
- [ ] Add more overlay types (diagonal gradient, radial from corner)
- [ ] Add text shadow/stroke options
- [x] Add logo/watermark placement
- [ ] Add animation preview for story formats
- [ ] Add keyboard shortcuts for common actions
- [ ] Add aspect ratio lock for custom sizes
- [ ] Add image cropping/repositioning within frame
- [x] Add more font options (expanded to 15)
- [x] Add font size controls (XS to XL per text layer)
- [ ] Add line height/letter spacing controls
- [ ] Add preset text styles (e.g., "Bold Statement", "Elegant Quote")

## Technical Improvements

- [ ] Add loading states during export
- [ ] Add error boundaries
- [ ] Add proper TypeScript types
- [ ] Add unit tests for config utilities
- [ ] Optimize re-renders with React.memo
- [ ] Add PWA support for offline use
