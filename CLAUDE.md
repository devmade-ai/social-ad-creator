# My Preferences

## Process

1. **Read these preferences first**
2. **Gather context from documentation** (CLAUDE.md, relevant docs/)
3. **Then proceed with the task**

## Principles

1. **User-first design** - Align with how real people will use the tool (top priority)
2. **Simplicity** - Simple flow, clear guidance, non-overwhelming visuals, accurate interpretation
3. **Document WHY** - Explain decisions and how they align with tool goals
4. **Testability** - Ensure correctness and alignment with usage goals can be verified
5. **Know the purpose** - Always be aware of what the tool is for
6. **Follow conventions** - Best practices and consistent patterns
7. **Repeatable process** - Follow consistent steps to ensure all the above

## Documentation

Keep these documents up to date:

| Document | Purpose | When to Update |
|----------|---------|----------------|
| `CLAUDE.md` | AI preferences, project overview, architecture, state structure | When project architecture changes, state structure changes, or preferences evolve |
| `docs/SESSION_NOTES.md` | Track current session progress | At session start (clear previous), during session (note changes), at end (summarize) |
| `docs/TODO.md` | Backlog of ideas and improvements | When noticing potential improvements, when completing features (mark done) |
| `docs/USER_ACTIONS.md` | Manual actions requiring user intervention | When tasks need external dashboards, credentials, or manual configuration |

**Documentation Guidelines:**
- `SESSION_NOTES.md`: Keep lean - remove previous session notes once no longer relevant
- `TODO.md`: AI-managed backlog - user can review; mark items complete, don't delete them
- `USER_ACTIONS.md`: Clear when actions are completed; keep empty if no pending actions
- `CLAUDE.md`: Update Project Status and Key State Structure when features change

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
  titleGroup: { cell: null, textAlign: null, textVerticalAlign: null },
  bodyGroup: { cell: null, textAlign: null, textVerticalAlign: null },
  cta: { cell: null, textAlign: null, textVerticalAlign: null },
  footnote: { cell: null, textAlign: null, textVerticalAlign: null }
  // cell: null = auto, number = specific cell
  // textAlign/textVerticalAlign: null = use global, string = custom per-group
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

3. **Overlay** - Per-cell overlay controls
   - Click cell to select (or global)
   - Enable/disable overlay per cell
   - Custom overlay type and intensity per cell

4. **Spacing** - Global and per-cell padding
   - Global padding for all cells
   - Click cell for custom padding overrides

5. **Placement** - Assign text groups to cells with per-group alignment
   - Image cell selector with quick controls (fit, grayscale, overlay)
   - Per-group cell selectors (Title+Tagline, Body, CTA, Footnote)
   - Per-group horizontal/vertical alignment (amber = custom, blue = global)
   - Global alignment section as fallback for groups without custom alignment
