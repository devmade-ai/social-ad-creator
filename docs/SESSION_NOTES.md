# Session Notes

## Current Session

Redesigned Placement tab and unified cell grid components across all Layout sub-tabs.

### Changes Made

1. **Per-Group Text Placement with Individual Cell Selectors**
   - Each text group (Title+Tagline, Body, CTA, Footnote) now has its own:
     - Cell selector grid (like the image cell selector)
     - Horizontal and vertical alignment controls
   - Alignment is per-group with fallback to global settings
   - Amber color indicates custom alignment, blue indicates using global
   - Reset to global button appears when custom alignment is set

2. **Unified Cell Grid Component**
   - Created single `UnifiedCellGrid` component that replaces both `CellGrid` and `StructureGrid`
   - Supports multiple modes: 'structure', 'image', 'textGroup', 'cell'
   - Shows section labels (R1, R2, C1, C2) only in Structure tab for rows/columns editing
   - Consistent visual appearance across all Layout sub-tabs

3. **Fullbleed Treated as Single-Cell Grid**
   - Removed special-casing for fullbleed layout type
   - Fullbleed now behaves like a single-cell grid with the same UI options
   - All sub-tabs (Structure, Placement, Overlay, Spacing) work consistently for all layout types

4. **Removed Style Presets from Image Tab**
   - Removed the "Quick Style Presets" section from ImageUploader
   - Simplifies the Image tab

5. **Updated textGroups State Structure**
   - Added `textAlign` and `textVerticalAlign` to each text group
   - Groups now store: `{ cell, textAlign, textVerticalAlign }`

6. **Documentation Improvements**
   - Added clear Documentation section to CLAUDE.md with table of documents
   - Defined when and what to update for each document
   - Updated Key State Structure to reflect new textGroups with alignment
   - Updated Layout Tab Sub-tabs section (Placement now has per-group alignment)

### Files Modified

- `src/hooks/useAdState.js` - Extended textGroups state with alignment properties
- `src/components/LayoutSelector.jsx` - New UnifiedCellGrid component, redesigned all sub-tabs
- `src/components/ImageUploader.jsx` - Removed Style Presets section
- `src/components/AdCanvas.jsx` - Per-group alignment rendering
- `CLAUDE.md` - Added Documentation section, updated state structure
- `docs/TODO.md` - Marked session items as completed
