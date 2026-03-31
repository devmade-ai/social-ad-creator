# AI Mistakes & Learnings

Record of significant AI mistakes to prevent repetition across sessions.

---

## 2025-01 | Presets Used Wrong Data Format (Happened Twice)

**What went wrong:** Both layout presets and style presets were using the old `textGroups` format (`titleGroup: { cell: 1 }`) but the app state had been refactored to use `textCells` format (`title: 1, tagline: 1`). Presets appeared to work (icons showed correct layout) but text cell assignments weren't applied.

**Why it happened:** During a refactor, the state structure changed but preset configurations weren't updated to match. Layout presets were fixed first, but style presets (`stylePresets.js`) were missed and had to be fixed in a later session.

**How to prevent:**

- When refactoring state structures, search for ALL usages of the old format across ALL config files
- Preset configs must match the current state shape exactly
- Test presets after any state structure changes
- Remember: there are TWO preset types (layout and style) that both need updating

---

## 2025-01 | Removed Features Without Tracking

**What went wrong:** Multiple sessions removed features (Presets tab, per-cell alignment, text visibility controls) without documenting why or that they were removed. Later sessions had to restore them.

**Why it happened:** Features were removed during "cleanup" or "simplification" without understanding they were intentional. No record of what features should exist.

**How to prevent:**

- CLAUDE.md Project Status must list ALL working features
- Before removing any feature, check if it's documented as intentional
- If removing something, document WHY in SESSION_NOTES

---

## 2025-01 | Over-Engineered Alignment (Per-Item Per-Cell Instead of Per-Cell)

**What went wrong:** User asked for per-cell text alignment (each cell can have different alignment). AI implemented per-item per-cell alignment (each text element in each cell can have different alignment). This over-engineering:

- Made the UI unnecessarily complex
- Broke existing functionality
- Required 11+ commits across multiple sessions to fix
- Cascading issues with cell grid rendering, fullbleed layouts, and more

**Timeline of damage:**

- `85e686c` Added per-group cell selectors and alignment (the mistake)
- `4264848` Revert per-group alignment to cell-level alignment
- `377775c`, `9876080`, `b54adc4` Multiple fixes for broken cell grid display
- `71117ad` Finally restore layout presets and placement tab features

**Why it happened:** AI interpreted "per-cell alignment" as a more complex feature than intended. Didn't clarify requirements before implementing. Over-engineering tendency.

**How to prevent:**

- CLARIFY before implementing: "Do you want alignment per cell, or per text element per cell?"
- Start with the simpler interpretation unless user specifies otherwise
- If a feature seems complex, ask if simpler version would suffice
- Don't add granularity the user didn't ask for

---

## 2026-01 | Double BASE_URL in Sample Images Path (User Reported 7+ Times)

**What went wrong:** Sample images weren't loading on GitHub Pages. The user reported this issue multiple times and even suggested it was a path issue related to Vite's base URL.

**Why it happened:** The `sampleImages.js` config was already prepending `import.meta.env.BASE_URL` to file paths:
```javascript
file: `${BASE_URL}samples/sample-01.jpg`  // Already /social-ad-creator/samples/...
```

Then `MediaTab.jsx` was adding BASE_URL again:
```javascript
src={import.meta.env.BASE_URL + sample.file.slice(1)}  // Doubled!
```

Result: `/social-ad-creator/social-ad-creator/samples/sample-01.jpg` (404)

**How to prevent:**

- When dealing with asset paths, trace the full path from config to usage
- Don't blindly add BASE_URL - check if the path already includes it
- Test GitHub Pages deployment specifically (paths work differently in dev vs prod)
- When users report the same issue multiple times and suggest a cause, investigate that cause immediately

---

## 2026-02 | Fixed Wrong Thing 3 Times Before Asking (Markdown Rendering)

**What went wrong:** User reported "markdown is still not rendering correctly on the display." Instead of asking what they were doing, AI made three wrong assumptions in sequence:
1. Assumed it was a CSS styling issue (fixed list-style-type, added pre/code styles)
2. Assumed user was in structured mode (added `marked.parseInline()` to structured text)
3. Finally learned user was in freeform mode typing `# Title` - the real issue was freeform mode required a hidden MD toggle that defaulted to off

Each wrong assumption led to a commit that didn't solve the actual problem. Three commits wasted before the real fix.

**Why it happened:** AI jumped to writing code instead of asking "which mode are you in?" and "what exactly did you type?" One clarifying question would have immediately revealed the issue.

**How to prevent:**
- When a user reports a bug, **ask what they're doing** before writing any code
- Don't assume which feature/mode/path the user is using
- A single clarifying question ("Are you in freeform mode with MD toggled on?") would have saved 3 wrong commits
- The cost of asking is low; the cost of fixing the wrong thing is high

---

## 2026-03 | PDF Fix Overcorrected — Reduced Pixels Instead of Fixing Ratio

**What went wrong:** Original PDF export used pixelRatio:2 + 72/96 pt conversion, creating a 2.667:1 non-integer downsampling ratio that destroyed smooth gradients (vignettes at ~30% quality). The fix (d6ede26) correctly identified viewer resampling as the cause but overcorrected: dropped to pixelRatio:1 with 1:1 mapping. This preserved gradients but halved pixel count to 72 DPI — visibly soft/blurry on phone screens (2-3x pixel density).

**Why it happened:** The root cause was the non-integer 2.667:1 ratio, not having more pixels. The fix treated "more pixels" as the problem instead of "bad ratio." Also, the fix was verified on desktop (where 72 DPI looks fine) but not tested on phone screens.

**How to prevent:**
- When fixing quality bugs, identify the **specific** cause (non-integer ratio) vs the general symptom (viewer downsampling)
- Test PDF exports on actual phone screens, not just desktop viewers
- When reducing resolution to fix a quality issue, question whether you're treating the symptom instead of the cause

---

## 2026-03 | PDF Page Size Scaled With pixelRatio — All Qualities Identical on Mobile

**What went wrong:** PDF quality selector (Low/Standard/High) produced different file sizes but looked identical on mobile. The page dimensions scaled proportionally with pixelRatio (`widthPt = platform.width * pdfPixelRatio`), so a 2x capture got a 2x page — always 1:1 pixels-to-points. Mobile PDF viewers scaled the oversized page (30+ inches) back down to the screen, making all quality levels look the same. PDFs also looked worse than PNG/JPG/WebP exports.

**Why it happened:** The previous fix for gradient destruction (non-integer ratios) used 1:1 pixel-to-point mapping to avoid any viewer resampling. This eliminated the gradient bug but also eliminated any quality benefit from higher pixelRatio — the page just got physically larger without gaining effective resolution.

**How to prevent:**
- When embedding high-res images in PDF, the page size should stay fixed while pixel count increases
- Test PDF quality levels on actual mobile devices — desktop viewers hide this bug because they have enough screen resolution
- Clean integer pixel-per-point ratios (2:1, 3:1) don't cause gradient issues — the original bug was from 2.667:1

---

## 2026-03 | PDF Page Still Too Large — pxToPt=1 Created 15" Pages

**What went wrong:** After fixing the pixelRatio scaling bug, digital PDF pages used pxToPt=1 (1:1 pixel-to-point mapping). This created pages like 1080×1350pt = 15×18.75 inches for LinkedIn Portrait. Mobile PDF viewers had to scale these massive pages 5:1 onto 3-inch phone screens, degrading quality in the viewer's rendering pipeline. PDFs still "looked like shit" despite correct pixelRatio.

**Why it happened:** The previous fix focused on making quality levels produce different pixel counts (which it did successfully) but didn't consider that the page dimensions themselves were unreasonably large. A 15-inch-wide PDF page is 2× letter size — most mobile viewers aren't optimized for this.

**How to prevent:**
- Consider the ENTIRE rendering pipeline: capture → PDF embedding → viewer → screen
- Test with actual mobile PDF viewers (Google Drive, Chrome) at realistic page sizes
- 1080 pixels ≠ 1080 points. Points are 1/72 inch. Use a DPI conversion for digital formats too.

**Fix:** Changed digital pxToPt from 1 to 0.5 (effectively 144 DPI). Pages are now ~7.5" wide instead of 15". Integer pixel-per-point ratios preserved: 2/4/6 for low/standard/high quality.

---

## 2026-03 | Sunset Theme — 3 Fixes to Undo an Unrequested Change

**What went wrong:** When light/dark variants were added to all themes (`0b9bfc6`), the Sunset dark variant drifted from the original palette without being asked to. Original was vivid orange (`#f97316`) + cream + red (`#dc2626`). The variant rework changed dark primary to muddy brown (`#7c2d12`) and accent to orange (`#fb923c`) — losing the orange-vs-red contrast that defined the theme. Light accent also shifted from red to rose-pink (`#e11d48`).

**Timeline of damage:**
- `0b9bfc6` Variant rework introduced the drift (not requested for Sunset specifically)
- `4aab728` Fix 1: Changed dark primary from brown to deep red-orange (`#c2410c`) — better but still not the original
- `7edf112` Fix 2: Restored dark accent from orange to red (`#dc2626`) — fixed one problem but `#c2410c` primary was too close to `#dc2626` accent
- `9430088` Fix 3: Restored original vivid orange (`#f97316`) primary + aligned both variants to red accent

3 commits across 2 branches to get back to where it started.

**Why it happened:** The variant rework applied creative judgment to every theme instead of preserving known-good palettes. Sunset's original colors were orange+red — a clear identity — but the rework "reinterpreted" them into brown+orange (dark) and warm-white+rose-pink (light).

**How to prevent:**
- Don't change things that weren't asked to be changed. The task was "add light/dark variants" — not "redesign every theme's colors"
- When adding structure around existing values (variants, modes, etc.), wrap the existing values — don't replace them
- "While I'm here" changes are how working things break

---

*Add new entries above this line*
