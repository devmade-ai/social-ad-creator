# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on

Adopted the glow-props fleet Triggers section in CLAUDE.md, then ran the full `tidy` meta sweep: `clean` → `doc-cleanup` → `hacks` → `deps` → `undone` → `dx`.

## Accomplished

### CLAUDE.md — Triggers rewrite (1c15967)
- Replaced the 10-trigger single-word list with the cross-fleet 2026-04-17 redesign: 48 triggers across 8 groups, 6 cadence meta sweeps, 7 reflective passes, scope modifiers (`branch` / `staged` / `file <path>`).
- Added AI note clarifying trigger-name collisions with repo folders/concepts (`docs/`, `src/config/`, `__tests__/`, `mobile`, `pwa`, `state`, `ci`).

### `clean` (abfa57a)
- Inlined `downloadDiagnosticImage` into its sole DEV-gated call site; removed the export from `exportHelpers.js` along with the `saveAs` import.
- Dropped `export` from `MIME_TYPES` (was imported-but-unused); removed its direct unit test.
- Extracted `updateCellBackground` + `updateCellFrame` helpers in `StyleTab.jsx`, replacing 5 inline duplications.
- Pushed back on the `pruneOrphanedKeys` finding — 5 call sites, already private, inlining would duplicate the NaN-guarded loop.

### `doc-cleanup` (74e296b)
- Deleted stale `plan.md` (imageCells → cellImages refactor complete).
- `README.md`: "Structured" → "Guided"; Structure section = Grid + Pages (removed stale Text Alignment); Style section lists all 5 subsections in UI order.
- `docs/USER_GUIDE.md`: "Structured Mode" → "Guided Mode"; added Background section; renamed Overlay → Color Tint, Typography → Fonts to match UI; split Frames out of Spacing; removed duplicated Zoom Background line.
- Test counts 142 → 141 in CLAUDE.md + TODO.md (post-MIME_TYPES test removal).
- Added `platforms.js → SOCIAL_MEDIA_SPECS.md` cross-reference in CLAUDE.md.

### `hacks` (cdebbc4)
- `SaveLoadModal.jsx`: `setTimeout(50)` → `requestAnimationFrame` for post-modal focus (proper API, not a timing guess).
- `App.jsx` + `BottomSheet.jsx`: added `--` reason suffixes to two `eslint-disable-next-line react-hooks/exhaustive-deps` comments per CLAUDE.md mandate.

### `deps` (f75bda2)
- Within-range bumps: dompurify 3.3.3 → 3.4.0, eslint-plugin-react-hooks 7.0.1 → 7.1.1, marked 17.0.1 → 17.0.6 (lockfile-only).
- Fixed 4 lint regressions from the stricter react-hooks 7.1.1 rule:
  - `SampleImagesSection.jsx`: moved ref mutation out of render into a no-deps useEffect (real concurrent-mode fix, not a suppression).
  - Three legitimate setState-in-effect patterns: suppressed with `-- reason` suffixes on the exact setState lines (plugin 7.1.1 reports at the setState site, not the useEffect).
- Deferred: eslint 10, react 19, vite 8 majors; 13 build-toolchain advisories whose "fix" is a regressive downgrade.

### `undone`
- Scan clean. No WIP/stub/experimental markers, no `if (false)` dead branches. The two `import.meta.env.DEV` uses are intentional (deepEqual depth warning, PDF diagnostic). TS migration (30% config, 17% utils, 0% hooks/components) is tracked in TODO.md as planned backlog, not undone work.

### `dx` (d826dc4)
- `package.json` engines: `{"node": ">=18.18.0"}` (ESLint 9's minimum).
- Test script: added `--no-warnings` alongside `--experimental-vm-modules` — removes 11 lines of `ExperimentalWarning: VM Modules` noise from every `npm test`.
- README.md Commands: added `npm run lint` and `npm test` (were only in CLAUDE.md).

## Current state

- **Branch:** `claude/replace-triggers-glow-props-j0m6j` (pushed, 7 commits ahead of main)
- `npm run lint` clean, `npm test` 141/141 green (no warnings), `vite build` succeeds
- Ready for review / merge

## Key context

- **Full tidy sweep done this session.** Next natural pass: `session` meta sweep (`surface` + `wrap` + `undone` + `skipped`) or merge the branch.
- **UI label vs state value convention:** Content tab UI labels are "Guided"/"Freeform"; state value remains `'structured'`. User-facing docs use UI labels; code/state discussions use state values.
- **Reference docs pattern:** `docs/SOCIAL_MEDIA_SPECS.md` is external reference (not auto-maintained) and is discoverable from the `platforms.js` architecture line in CLAUDE.md, not from the Documentation section.
- **Trigger-name collisions:** Bare word alone = Triggers invocation; in-prose reference = folder/concept. See the collisions AI note in CLAUDE.md.
- **Deferred work needing user call:** Major version bumps (eslint 9→10, react 18→19, vite 5→8, etc.) and 13 build-toolchain advisories. See the `deps` commit body for rationale.
