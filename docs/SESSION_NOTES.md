# Session Notes

## Current Session

Based on tester feedback, implemented several improvements:

### Flexible Layout System

- Replaced 16 predefined layouts with a configurable system
- Split type: none (fullbleed), vertical (columns), horizontal (rows)
- 2 or 3 sections with adjustable image proportion (20-80%)
- Image position: first, middle, or last section
- Text overlay on image option for split layouts
- Text alignment (left/center/right) and vertical alignment (top/middle/bottom)

### Logo Upload

- Created LogoUploader.jsx component
- Position options: top-left, top-right, bottom-left, bottom-right, center
- Size options: XS (8%), S (12%), M (15%), L (20%), XL (25%)

### Font Size Controls

- Added per-layer size options: XS (0.6x), S (0.8x), M (1x), L (1.2x), XL (1.5x)
- Size multiplier applies to platform-relative base font size

### Text Overflow Protection

- Added wordWrap, overflowWrap to all text elements
- Added overflow: hidden to text containers

### Tab Order Update

- Image → Logo → Layout → Overlay → Text → Theme → Fonts
