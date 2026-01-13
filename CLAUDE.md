# My Preferences

## Process

1. **Read these preferences first**
2. **Gather context from documentation** (CLAUDE.md, relevant docs/)
3. **Then proceed with the task**

## Principles

1. **User-first design** - Align with how real people will use the tool (top priority)
2. **Simplicity** - Simple flow, clear guidance, non-overwhelming visuals, accurate interpretation
3. **Document WHY** - Explain decisions and how they align with tool goals
4. **Keep docs updated** - HISTORY.md, CALCULATIONS.md, BUSINESS_GUIDE.md, CLAUDE.md as relevant
5. **Testability** - Ensure correctness and alignment with usage goals can be verified
6. **Know the purpose** - Always be aware of what the tool is for
7. **Logical checkpoints** - Stop at sensible points, document progress in docs/SESSION_NOTES.md
8. **Follow conventions** - Best practices and consistent patterns
9. **Capture ideas** - Add lower priority items and improvements I notice to docs/TODO.md so they persist between sessions (AI-managed, user can review)
10. **Repeatable process** - Follow consistent steps to ensure all the above
11. **Document user actions** - When manual user action is required (external dashboards, credentials, etc.), add detailed instructions to docs/USER_ACTIONS.md

## AI Notes

<!-- Reminders and learnings for AI assistants - add to this as needed -->

- Always read a file before attempting to edit it
- Check for existing patterns in the codebase before creating new ones
- Commit and push changes before ending a session
- Keep SESSION_NOTES.md lean - remove previous session notes once no longer relevant
- Clean up completed or obsolete docs/files and remove references to them

---

## Project Info

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Social Ad Creator - A browser-based tool for creating social media advertisements. Users can upload images, add text overlays, choose layouts, and export ads for multiple platforms.

## Project Status

Core features working:

- Image upload with drag-drop, object fit (cover/contain), position, grayscale, overlay controls
- Flexible layout system with sub-tab organization:
  - **Presets tab**: Quick layout selection with smart suggestions based on image aspect ratio
  - **Structure tab**: Fine-tune rows/columns with contextual cell/section selection
  - **Alignment tab**: Per-cell text alignment (horizontal/vertical)
  - **Placement tab**: Assign text groups to specific cells
- Text groups with cell assignment:
  - Title + Tagline (paired)
  - Body Heading + Body Text (paired)
  - CTA (independent)
  - Footnote (independent)
- Logo upload with position (corners, center) and size options
- Theme system with 4 presets and custom colors
- Overlay system (solid, gradient up/down, vignette) - integrated in Image tab
- 15 Google Fonts (sans-serif, serif, display categories)
- Export to 6 platforms (LinkedIn, Facebook, Instagram, Twitter/X, TikTok)
- Single download and ZIP batch download
- Responsive preview that adapts to device width

## Tech Stack

- Vite + React 18
- Tailwind CSS
- html-to-image for rendering
- JSZip + file-saver for batch export
- GitHub Pages deployment

## Common Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run deploy   # Deploy to GitHub Pages
```

## Architecture

```
src/
├── components/     # React components
│   ├── AdCanvas.jsx       # Core rendering (cell-based layout)
│   ├── ImageUploader.jsx  # Image upload + overlay controls
│   ├── LogoUploader.jsx   # Logo upload and positioning
│   ├── TextEditor.jsx     # Text layer editing
│   ├── LayoutSelector.jsx # Layout with sub-tabs (Presets, Structure, Alignment, Placement)
│   ├── ThemePicker.jsx
│   ├── FontSelector.jsx
│   ├── PlatformPreview.jsx
│   └── ExportButtons.jsx
├── config/         # Configuration
│   ├── layouts.js        # Overlay types and helpers
│   ├── layoutPresets.js  # 17 layout presets with SVG icons and categories
│   ├── platforms.js      # 6 platform sizes
│   ├── themes.js         # 4 preset themes
│   └── fonts.js          # 15 Google Fonts
├── hooks/
│   └── useAdState.js  # Central state (includes textGroups, layout)
├── utils/
│   └── export.js      # Export utilities
├── App.jsx
└── main.jsx
```

## Key State Structure

```js
layout: {
  type: 'fullbleed' | 'rows' | 'columns',
  structure: [
    { size: 50, subdivisions: 1, subSizes: [100] },  // Section with optional subdivisions
    { size: 50, subdivisions: 2, subSizes: [50, 50] }
  ],
  imageCell: 0,  // Which cell the image appears in
  textAlign: 'center',
  textVerticalAlign: 'center',
  cellAlignments: [{ textAlign, textVerticalAlign }, ...]  // Per-cell overrides
}

textGroups: {
  titleGroup: { cell: null },   // null = auto, number = specific cell
  bodyGroup: { cell: null },
  cta: { cell: null },
  footnote: { cell: null }
}
```

## Layout Tab Sub-tabs

The Layout tab uses a sub-tab architecture for better organization:

1. **Presets** - Quick start with 17 pre-built layouts
   - Categories: Suggested, All, Image Focus, Text Focus, Balanced
   - Smart suggestions based on image aspect ratio and platform
   - Visual SVG preview icons

2. **Structure** - Fine-tune the layout grid
   - Click section labels (R1, R2 or C1, C2) to edit row/column size
   - Click cells to edit subdivision sizes
   - Contextual controls based on selection

3. **Alignment** - Per-cell text alignment
   - Click cell to select (or none for all cells)
   - Horizontal: left, center, right
   - Vertical: top, middle, bottom

4. **Placement** - Assign text groups to cells
   - Click cell then toggle text groups
   - Visual feedback shows assigned groups
