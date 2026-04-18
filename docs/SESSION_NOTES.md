# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on

Adopt the glow-props fleet Triggers section in CLAUDE.md, then run the `tidy` meta sweep — resolved `clean` and `doc-cleanup` findings.

## Accomplished

### CLAUDE.md — Triggers rewrite (commit 1c15967)
- Replaced the older 10-trigger single-word list with the cross-fleet 2026-04-17 redesign: 48 triggers across 8 groups (`correctness`, `trust`, `speed`, `frontend`, `quality`, `ops`, `design`, `fleet`), 6 meta sweeps (`hot` / `quick` / `ship` / `session` / `tidy` / `all`), 7 reflective passes (`risk` / `surface` / `wrap` / `skipped` / `assumed` / `approach` / `cold`), scope modifiers (`branch` / `staged` / `file <path>`).
- Added AI note on trigger-name collisions with repo folders/concepts (`docs/`, `src/config/`, `__tests__/`, `mobile`, `pwa`, `state`, `ci`) clarifying bare-word-as-invocation vs in-prose-as-reference precedence.

### `clean` trigger pass (commit abfa57a)
- Inlined `downloadDiagnosticImage` into its sole DEV-gated call site in `ExportButtons.jsx`; removed the export from `exportHelpers.js` along with the `saveAs` import (it was only used by the diagnostic function). No dev-only code ships in prod bundles.
- Dropped `export` from `MIME_TYPES` — it was imported-but-unused in `ExportButtons.jsx` and only referenced internally by `captureAsBlob`. Removed the direct unit test and updated the test file's header comment.
- Extracted `updateCellBackground` and `updateCellFrame` helpers in `StyleTab.jsx`, replacing 5 inline `{ ...obj, [key]: ... }` duplications. Two helpers (not one generic) because each writes to a different parent callback and has different merge semantics.
- Pushed back on the `pruneOrphanedKeys` finding — it has 5 call sites inside `cleanupOrphanedCells`, is already module-private, and inlining would duplicate the NaN-guarded loop.
- Net -18 LOC across 4 files.

### `doc-cleanup` trigger pass (this commit)
- Deleted `plan.md` (root) — stale implementation plan for the `imageCells → cellImages` refactor, which is complete (only reference left is a comment in `useAdState.js:661` documenting the removal).
- `README.md`: "Structured" → "Guided" (matching UI label); Structure section now lists Grid + Pages (removed stale "Text Alignment" which moved to Content); Style section now lists all five current sub-sections (Background, Color Tint, Frames, Spacing, Fonts) in the order they appear in the UI.
- `docs/USER_GUIDE.md`: "Structured Mode" → "Guided Mode"; added Background section; renamed "Overlay" → "Color Tint" (UI label); added dedicated Frames section (was lumped into Spacing); renamed "Typography" → "Fonts" (UI label); removed a duplicated "Zoom Background (1920×1080)" line.
- `CLAUDE.md` + `docs/TODO.md`: test count 142 → 141 (the `MIME_TYPES` test was removed in the prior commit).
- `CLAUDE.md` architecture: added reference from `config/platforms.js` → `docs/SOCIAL_MEDIA_SPECS.md` (previously orphaned reference doc).

## Current state

- **Branch:** `claude/replace-triggers-glow-props-j0m6j` (pushed through commit abfa57a; `doc-cleanup` commit pending)
- `npm run lint` clean, `vite build` green, `npm test` 138 passed / 3 skipped / 141 total

## Key context

- **Tidy sweep in progress.** Completed: `clean`, `doc-cleanup`. Remaining: `hacks`, `deps`, `undone`, `dx`. After each pass, pause for `fix` / `skip` / `stop` before proceeding.
- **UI label vs state value convention:** Content tab UI labels are "Guided" / "Freeform" but the state value remains `'structured'` for backwards compat. User-facing docs should use the UI labels; code/state discussions use the state values.
- **Reference doc pattern:** `docs/SOCIAL_MEDIA_SPECS.md` is external reference material sourced from platform docs (not auto-maintained). CLAUDE.md Documentation section describes auto-maintained docs — the reference is linked from the `platforms.js` architecture line instead.
- **Trigger-name collisions:** Bare word = Triggers invocation; in-prose reference = folder/concept. See the collisions AI note in CLAUDE.md for the full list and precedence rules.
