# Changelog

## 2026-01-10

### 821a0e4 - Fix export capturing scaled preview instead of full-size canvas
- Exported images were appearing smaller on a larger canvas
- Root cause: html-to-image was capturing the CSS-scaled preview instead of full-size canvas
- Fix: temporarily set `scale(1)` during capture, then restore original scale

### fa1af6d - Fix text layer state errors and Google Fonts export issue
- Fixed text layer state initialization errors
- Resolved Google Fonts not rendering in exported images

### df6d714 - Add overlay to all layouts and expand text layers
- Extended overlay system to apply to images in all layouts (not just background layouts)
- Expanded text layers to 6: title, tagline, body heading, body text, call to action, footnote

### eb92465 - Add Social Ad Creator implementation
- Initial feature-complete implementation
- Image upload with drag-drop
- 16 layout templates (background, vertical columns, horizontal rows)
- Theme system with 4 presets and custom colors
- Overlay system (solid, gradient up/down, vignette)
- 5 Google Fonts
- Export to 6 platforms (LinkedIn, Facebook, Instagram, Twitter/X, TikTok)
- Single download and ZIP batch download

### ab39a59 - Initial commit
- Vite + React project setup
