# Session Notes

## Current Session

Fixed bugs in column/row layouts and text overlay on images.

### Issues Fixed

1. **Image not displaying in split layouts** - Changed section sizing to use `flex: "0 0 ${size}"` with absolute positioning for content
2. **Text duplication** - In 3-section layouts, only first text section renders content now
3. **Removed redundant layout preview** - The small preview in Layout tab was unnecessary
4. **Logo drag-drop not working** - Added onDrop/onDragOver handlers to LogoUploader
5. **Text vertical align not working on image** - Changed hardcoded `flex-end` to use `layout.textVerticalAlign`
6. **Text sizes inconsistent on image** - Updated `renderOverlayText` to use same font size multipliers as `renderAllText`
