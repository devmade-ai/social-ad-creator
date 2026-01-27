# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
Layout-Aware Looks System - making each Look apply intelligently based on the current layout

## Accomplished

- **Per-layout Look settings**: All 12 Looks now have unique imageOverlay settings for all 28 layouts (336 combinations)
- **Looks don't override alignment**: Fixed applyStylePreset to NOT override text alignment - alignment is now fully controlled by layouts
- **Auto-load sample images**: Random sample image loads on app start when no images uploaded
- **Active layout preset tracking**: Added `activeLayoutPreset` state to track which layout is active for Look settings

## Current state
- **Build**: Passing
- **Layout-Aware Looks**: Complete and working
- All completed tasks documented in HISTORY.md

## Key context

- **Separation of concerns**:
  - Looks control: fonts, image filters, image overlay (per-layout)
  - Layouts control: structure, text cells, all text alignments (global + per-cell)
- `stylePresets.js`: Each Look has a `layouts` object with settings per layout ID
- `getLookSettingsForLayout(lookId, layoutId)`: Returns layout-specific settings for a Look
- `useAdState.js`:
  - `applyStylePreset` only applies fonts, filters, overlay - NOT alignment
  - `loadSampleImage` loads random sample on app start if no images
  - `activeLayoutPreset` tracks current layout for Look settings
