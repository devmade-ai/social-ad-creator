# Manual Testing Guide

Step-by-step test scenarios for verifying the Social Ad Creator works correctly.

---

## How to Use This Guide

Each test scenario includes:
- **Scenario:** What you're testing
- **Steps:** Exact actions to perform
- **Where:** Which tab/section/element to interact with
- **Expected:** What should happen

Run these tests after making changes to ensure nothing is broken.

---

## Test Environment Setup

1. Start the dev server: `npm run dev`
2. Open `http://localhost:5173` in your browser
3. Open browser DevTools (F12) to check for console errors

---

## Templates Tab Tests

### T1: Apply Complete Design

**Scenario:** Complete designs should apply theme, fonts, layout, and overlay all at once.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click "Templates" tab | Top tab bar | Templates tab opens, shows two sections |
| 2 | Find "Complete Designs" section | Templates tab | Section visible with design thumbnails |
| 3 | Click any design thumbnail | Complete Designs grid | Preview updates immediately |
| 4 | Check Style tab | Click Style tab | Theme, fonts match the preset |
| 5 | Check Layout tab | Click Layout tab | Grid structure matches preset |

### T2: Apply Layout Only

**Scenario:** Layout-only presets should change grid without affecting colors/fonts.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Apply a Complete Design first | Templates → Complete Designs | Note the current theme colors |
| 2 | Click "Layout Only" section | Templates tab | Layout thumbnails visible |
| 3 | Click a different layout | Layout Only grid | Grid structure changes |
| 4 | Check Style tab | Click Style tab | Theme colors unchanged |

---

## Media Tab Tests

### M1: Image Upload

**Scenario:** Users can upload a background image via drag-drop or click.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click "Media" tab | Top tab bar | Media tab opens |
| 2 | Find "Background Image" section | Media tab | Upload area visible |
| 3 | Click upload area | Background Image section | File picker opens |
| 4 | Select an image file | File picker dialog | Image appears in preview |
| 5 | Alternative: drag image onto upload area | Background Image section | Image appears in preview |

### M2: Image Fit Modes

**Scenario:** Cover and Contain fit modes work correctly.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Upload a non-square image | Media → Background Image | Image visible in preview |
| 2 | Click "Cover" | Fit options | Image fills frame, may crop edges |
| 3 | Click "Contain" | Fit options | Entire image visible, may have empty space |

### M3: Image Position

**Scenario:** Position controls adjust where the image sits in the frame.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Upload image, set to "Cover" | Media tab | Image is cropped |
| 2 | Adjust position sliders | Position controls | Visible portion of image shifts |

### M4: Advanced Filters

**Scenario:** Image filters apply correctly.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Upload an image | Media tab | Image visible |
| 2 | Expand "Advanced Filters" | Media tab | Filter sliders appear |
| 3 | Drag Grayscale to 100% | Grayscale slider | Image becomes black and white |
| 4 | Drag Sepia to 50% | Sepia slider | Image has warm tone |
| 5 | Drag Blur to 5px | Blur slider | Image becomes blurry |
| 6 | Reset all to 0 | Each slider | Image returns to original |

### M5: Logo Upload and Position

**Scenario:** Logo appears in the correct position.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Expand "Logo" section | Media tab | Logo upload area visible |
| 2 | Upload a logo image | Logo section | Logo appears on preview |
| 3 | Click "Top Left" | Position options | Logo moves to top-left corner |
| 4 | Click "Bottom Right" | Position options | Logo moves to bottom-right corner |
| 5 | Click "Center" | Position options | Logo moves to center |
| 6 | Change size to "Large" | Size options | Logo becomes larger |

### M6: Image Cell Selection

**Scenario:** Image can be assigned to different cells from Media tab.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Upload an image | Media → Background Image | Image visible in preview |
| 2 | Apply a 2-cell layout | Layout → Structure | 2 cells visible |
| 3 | Return to Media tab | Top tab bar | Media tab opens |
| 4 | Find "Image Cell" selector | Background Image section | Small grid showing cells |
| 5 | Click cell 2 | Image Cell grid | Background image moves to cell 2 |

### M7: Image Overlay

**Scenario:** Image overlay controls affect the background image layer.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Upload an image | Media → Background Image | Image visible in preview |
| 2 | Find "Image Overlay" section | Media tab | Overlay controls visible |
| 3 | Change Type to "Vignette" | Type selector | Vignette effect appears on image |
| 4 | Change Color to "Primary" | Color selector | Overlay uses theme's primary color |
| 5 | Drag Opacity to 50% | Opacity slider | Overlay semi-transparent |
| 6 | Drag Opacity to 0% | Opacity slider | Overlay disappears completely |

---

## Content Tab Tests

### C1: Text Input

**Scenario:** Text entered in fields appears in the preview.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click "Content" tab | Top tab bar | Content tab opens |
| 2 | Expand "Title & Tagline" section | Content tab | Title and Tagline fields visible |
| 3 | Type "Test Headline" in Title field | Title input | Text appears in preview |
| 4 | Type "Supporting text" in Tagline field | Tagline input | Tagline appears below title |

### C2: Visibility Toggle

**Scenario:** Eye icon toggles text visibility.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Enter text in Title field | Content → Title & Tagline | Title visible in preview |
| 2 | Click eye icon next to Title | Title row | Title disappears from preview |
| 3 | Click eye icon again | Title row | Title reappears |

### C3: Cell Assignment

**Scenario:** Text can be assigned to different layout cells.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Apply a 2-row layout | Templates → Layout Only | Preview shows 2 cells |
| 2 | Go to Content tab | Top tab bar | Content tab opens |
| 3 | Find Cell dropdown for Title | Title controls | Dropdown shows "Auto" and cell numbers |
| 4 | Select "Cell 2" | Cell dropdown | Title moves to second cell in preview |

### C4: Text Alignment

**Scenario:** Alignment controls position text within cells.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Enter Title text | Content → Title | Title visible |
| 2 | Click "Left" alignment | Title alignment buttons | Title aligns left |
| 3 | Click "Center" alignment | Title alignment buttons | Title centers |
| 4 | Click "Right" alignment | Title alignment buttons | Title aligns right |
| 5 | Click "Auto" | Title alignment buttons | Title uses cell default |

### C5: Text Styling

**Scenario:** Bold, italic, color, and size work correctly.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Enter Title text | Content → Title | Title visible |
| 2 | Click Bold (B) button | Title controls | Title becomes bold |
| 3 | Click Italic (I) button | Title controls | Title becomes italic |
| 4 | Change color dropdown | Title color selector | Title color changes |
| 5 | Adjust size slider | Title size slider | Title size changes |

---

## Layout Tab Tests

### L1: Layout Type Selection

**Scenario:** Layout type changes the grid structure.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click "Layout" tab | Top tab bar | Layout tab opens |
| 2 | Expand "Structure" section | Layout tab | Layout type options visible |
| 3 | Click "Full Bleed" | Layout type buttons | Preview shows single cell |
| 4 | Click "Rows" | Layout type buttons | Preview shows horizontal divisions |
| 5 | Click "Columns" | Layout type buttons | Preview shows vertical divisions |

### L2: Interactive Grid Resizing

**Scenario:** Dragging dividers resizes cells.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Select "Rows" layout type | Layout → Structure | 2+ rows visible in grid editor |
| 2 | Find the divider line between rows | Interactive grid | Cursor changes on hover |
| 3 | Drag the divider up or down | Grid divider | Cell sizes change proportionally |
| 4 | Check preview | Ad preview | Preview reflects new proportions |

### L3: Text Alignment - Section Selection

**Scenario:** Selecting a section applies alignment to all cells in that section.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Apply a 2-row layout | Layout → Structure | 2 rows visible in grid editor |
| 2 | Click on Row 1 in the grid | Structure grid | Row 1 highlights as selected |
| 3 | Check Text Alignment section | Layout tab | Shows "Row 1" or section indicator |
| 4 | Set horizontal to "Left" | Alignment buttons | All cells in Row 1 align left |
| 5 | Add text to both cells in Row 1 | Content tab | Both show left alignment |

### L4: Text Alignment - Cell Selection

**Scenario:** Selecting a cell applies alignment to just that cell.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Apply a layout with subdivisions | Layout → Structure | Multiple cells visible |
| 2 | Click on a specific cell | Structure grid | Single cell highlights |
| 3 | Check Text Alignment section | Layout tab | Shows "Cell X" indicator |
| 4 | Set vertical to "Top" | Alignment buttons | Only that cell aligns to top |
| 5 | Check adjacent cells | Preview | Other cells unaffected |

### L5: Text Alignment - Global Default

**Scenario:** With nothing selected, alignment sets the global default.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click empty area in Structure grid | Structure grid | No selection highlighted |
| 2 | Check Text Alignment section | Layout tab | Shows "Global" or default indicator |
| 3 | Set alignment to "Center" + "Middle" | Alignment buttons | All cells without overrides use this |
| 4 | Add text to any cell | Content tab | Text centers (unless cell has override) |

---

## Style Tab Tests

### S1: Theme Application

**Scenario:** Themes change colors throughout the design.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click "Style" tab | Top tab bar | Style tab opens |
| 2 | Expand "Themes" section | Style tab | 12 theme thumbnails visible |
| 3 | Click a different theme | Theme grid | Preview colors change |
| 4 | Check text colors | Preview | Text uses theme colors |

### S2: Custom Colors

**Scenario:** Custom color inputs override theme colors.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Expand custom colors area | Style → Themes | Color input fields visible |
| 2 | Change "Primary" color | Primary color input | Primary text color changes |
| 3 | Change "Background" color | Background color input | Background color changes |

### S3: Font Selection

**Scenario:** Font changes apply to the correct text elements.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Expand "Typography" section | Style tab | Font selectors visible |
| 2 | Change Title font | Title font dropdown | Title text font changes |
| 3 | Change Body font | Body font dropdown | Body text, tagline, etc. font changes |

### S4: Overlay Controls

**Scenario:** Per-cell overlays can be configured independently.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Apply a 2-cell layout | Layout tab | 2 cells visible |
| 2 | Go to Style → Overlay | Style tab | Per-cell overlay controls visible |
| 3 | Enable overlay for Cell 1 | Cell 1 toggle | Overlay appears on cell 1 only |
| 4 | Change overlay type to "Gradient Bottom" | Cell 1 type dropdown | Gradient appears from bottom |
| 5 | Adjust opacity to 80% | Cell 1 opacity slider | Overlay becomes more opaque |

### S5: Spacing Controls

**Scenario:** Padding affects text positioning.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Add visible text | Content tab | Text visible in preview |
| 2 | Go to Style → Spacing | Style tab | Padding controls visible |
| 3 | Increase global padding | Global padding slider | Text moves away from edges |
| 4 | Set per-cell padding for Cell 1 | Cell 1 padding | Cell 1 padding differs from others |

---

## Export Tests

### E1: Platform Switching

**Scenario:** Preview updates for different platform sizes.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click "LinkedIn" | Platform buttons below preview | Preview shows 1200×627 aspect ratio |
| 2 | Click "Instagram Square" | Platform buttons | Preview shows square (1080×1080) |
| 3 | Click "Instagram Story" | Platform buttons | Preview shows tall (1080×1920) |
| 4 | Click "TikTok" | Platform buttons | Preview shows tall (1080×1920) |

### E2: Single Download

**Scenario:** Download button exports current platform as PNG.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Select a platform | Platform buttons | Platform selected |
| 2 | Click "Download" | Export buttons | PNG file downloads |
| 3 | Open downloaded file | File system | Image matches preview, correct dimensions |

### E3: Batch Download

**Scenario:** Download All creates ZIP with all platforms.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click "Download All" | Export buttons | Progress indicator appears |
| 2 | Wait for completion | Progress indicator | ZIP file downloads |
| 3 | Extract ZIP | File system | Contains 6 PNG files, one per platform |
| 4 | Check dimensions | Each file | Correct dimensions for each platform |

---

## Error Handling Tests

### ERR1: Invalid Image Upload

**Scenario:** Non-image files are rejected gracefully.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Try to upload a .txt file | Media → Background Image | File rejected or error message shown |
| 2 | Check console | DevTools | No uncaught errors |

### ERR2: Missing Image Export

**Scenario:** Export works even without a background image.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Clear/don't upload any image | Media tab | No background image |
| 2 | Add some text | Content tab | Text visible on solid background |
| 3 | Click Download | Export buttons | PNG exports successfully |

---

## Responsive Tests

### R1: Mobile Width

**Scenario:** UI remains usable on narrow screens.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Open DevTools | Browser | DevTools open |
| 2 | Toggle device toolbar | DevTools | Mobile view enabled |
| 3 | Set width to 375px | Device toolbar | UI adapts to narrow width |
| 4 | Navigate all tabs | Tab bar | All tabs accessible and functional |
| 5 | Check preview | Preview area | Preview scales appropriately |

---

## Regression Checklist

Quick checks to run after any code change:

- [ ] App loads without console errors
- [ ] All 5 tabs are clickable and show content
- [ ] Image upload works (drag-drop and click)
- [ ] Text appears in preview when typed
- [ ] Theme change affects preview colors
- [ ] Layout change affects preview structure
- [ ] Image Cell selector works in Media tab (multi-cell layouts)
- [ ] Image Overlay controls work in Media tab
- [ ] Text Alignment responds to grid selection in Layout tab
- [ ] Export produces a valid PNG matching preview
- [ ] No React warnings in console
