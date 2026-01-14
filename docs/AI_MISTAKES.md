# AI Mistakes & Learnings

Record of significant AI mistakes to prevent repetition across sessions.

---

## 2025-01 | Layout Presets Used Wrong Data Format

**What went wrong:** Layout presets were using the old `textGroups` format (`titleGroup: { cell: 1 }`) but the app state had been refactored to use `textCells` format (`title: 1, tagline: 1`). Presets appeared to work (icons showed correct layout) but text ended up in wrong cells.

**Why it happened:** During a refactor, the state structure changed but the preset configurations weren't updated to match. No validation caught the mismatch.

**How to prevent:**

- When refactoring state structures, search for ALL usages of the old format
- Preset configs must match the current state shape exactly
- Test presets after any state structure changes

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

*Add new entries above this line*
