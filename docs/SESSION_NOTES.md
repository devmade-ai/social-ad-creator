# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on

Fleet alignment + full `tidy` hygiene sweep on branch `claude/align-components-HdSws`. Triggers run in sequence: `align` → `pattern-audit` → `clean` → `doc-cleanup` → `hacks` → `deps` → `undone` → `dx` → `daisyui-tokens` → `daisyui-components` → `daisyui-utilities` → `daisyui-build`. Each pause for the user, then "fix all properly" applied to the findings before the next trigger.

## Accomplished

### Fleet alignment (`align`)
- Merged glow-props CLAUDE.md additions into `CLAUDE.md`: the DaisyUI mandate AI Note (Tokens / Components / Colors / Borders / Shadows / Inline hex / Build integrity, plus "ask, don't roll custom" and "violations are fixed, not justified"), the corresponding Prohibition entry, the new `daisyui` Triggers group with 4 sub-triggers (`daisyui-tokens`/`-components`/`-utilities`/`-build`), all later triggers renumbered (clean: 22 → 26, ... pattern-audit: 48 → 52), and the `tidy` meta sweep extended with `+ daisyui`.

### Pattern audit (`pattern-audit`)
- 8 patterns fully implemented (APP_ICONS, BURGER_MENU, DEBUG_SYSTEM, PWA_ICON_CACHE_BUST, PWA_SYSTEM, THEME_DARK_MODE, TIMER_LEAKS, Z_INDEX_SCALE), 1 with justified deviation (DOWNLOAD_PDF — pdf-lib, justified by canvas-heavy content), 2 N/A (EVENT_BUS, HTTPS_PROXY). No fixes needed.

### Clean (`clean`)
- Deleted dead `src/components/LogoUploader.jsx` (162 lines, zero importers — logo upload lives inline in MediaTab.jsx).
- Removed unused export `getEntries()` from `src/utils/debugLog.js` (zero call sites; debug pill consumes via `subscribe()` which already replays existing entries).

### Doc cleanup (`doc-cleanup`)
- Rewrote `docs/STYLE_GUIDE.md` end-to-end. The prior version actively contradicted the new DaisyUI rule with hand-rolled `<button>`/`<input>`/card/tab examples, static low-opacity tinted backgrounds prescribed as canonical, custom `rounded-md/lg/xl` mapping where the new rule mandates `rounded-box`/`rounded-field`/`rounded-selector`, and `shadow-glow: 0 0 20px rgba(...)` arbitrary shadow. Also fixed two stale claims: "Primary: Lucide React" (Lucide not a dependency, icons are inline SVG paths in `src/config/menuIcons.js`) and "DaisyUI `night` theme" (combos are Mono lofi/black + Luxe fantasy/luxury, never `night`).

### Hacks (`hacks`)
- Added cleanup + Decision Documentation block to `App.jsx:362` orientationchange handler (was firing fire-and-forget setTimeout per rotation, violating TIMER_LEAKS rule).
- Replaced PR-reference rot comment "Scroll into view on mobile keyboard (#12)" in `ContentTab.jsx:83` with full Requirement/Approach/Alternatives block.
- Added matching block to `FreeformEditor.jsx:148` scrollIntoView timeout (the surrounding blur/confirm-delete timers in the same file already had Decision Documentation; this one didn't).

### Deps (`deps`)
- `npm update --save` patch-level updates: dompurify 3.4.0 → 3.4.2, @tailwindcss/vite 4.2.2 → 4.2.4 (lockfile), tailwindcss → 4.2.4 (lockfile). Audit went from 13 vulnerabilities (5 mod / 8 high) to 6 (2 mod / 4 high); the remaining six are stuck behind the Vite 5 → 8 + vite-plugin-pwa major bump.
- Added 3 entries to `docs/TODO.md` for the major-version backlog with concrete sequenced plans: Vite 5 → 8 + vite-plugin-pwa, React 18 → 19 + @vitejs/plugin-react 4 → 6, marked 17 → 18. Each entry has its own regression checklist.
- ESLint 10 intentionally not taken — capped at 9 by `eslint-plugin-react-hooks@7.x` per CLAUDE.md AI Note.

### Undone (`undone`)
- Finished the tab rename. UI labels were updated to "Presets"/"Structure" but internal section IDs and user-facing ErrorBoundary copy were left as `'templates'`/`'layout'`. Renamed across 7 sites: `App.jsx` initial useState, keyboard tabMap, sections array, two JSX conditionals, two ErrorBoundary title/message strings, plus `MobileNav.jsx` and `EmptyStateGuide.jsx`. Section IDs are runtime-only, never persisted to designStorage — verified before renaming.

### DX (`dx`)
- `vite.config.js`: enabled `build.sourcemap = true`. The DebugPill captures `Error.stack` for users to send back as bug reports — without sourcemaps those stacks were unactionable. `.map` files emit alongside `.js`; bundleSize tripwire test (asserts app `.js` chunk under 500KB) is unaffected since `.map` is separate; VitePWA precache glob is `**/*.{js,css,html,svg,woff2}` so `.map` files aren't precached.
- `README.md`: documented the `sharp`/prebuild gotcha and the `./node_modules/.bin/vite build` workaround.
- Added `.nvmrc` pinning Node 20.

### DaisyUI (`daisyui-tokens`/`-components`/`-utilities`/`-build`)
- Removed unused `--shadow-glow` from `src/index.css` `@theme`.
- Removed `--shadow-card` once its 3 consumer panels in `DesktopLayout.jsx` converted to `card card-border bg-base-100 border-base-300/80 card-body p-*`.
- Converted `App.jsx:589` export-cancel button from a hand-rolled `mt-3 px-4 py-1.5 ... rounded-lg ...` cluster to `btn btn-ghost btn-sm`.
- Replaced `shadow-[0_-4px_20px_rgba(0,0,0,0.12)]` arbitrary shadow on `BottomSheet.jsx` with `shadow-2xl`.
- Replaced `bg-black/30` + `text-white` on the `SampleImagesSection.jsx` loading overlay with `bg-neutral/60` + `text-neutral-content`.
- Added GEN: sentinels around the three auto-generated regions in `index.html` (theme-color meta tag, `var combos`, `var metaColors`). Generator script updated with `replaceBetweenSentinels(name, replacement)` helper supporting both HTML-comment and JS-comment sentinel forms. Re-verified idempotence: two consecutive runs produce zero diff (md5 stable across runs).
- Scheduled three large items in `docs/TODO.md` as the rest of the DaisyUI work — they're real work, not exceptions:
  1. **DebugPill DaisyUI conversion** — ~50 inline-style sites in `src/components/DebugPill.jsx` (the only outlier UI surface). Plan: keep the pre-React inline pill in `index.html` exactly as is (must work before any bundle loads), convert the React-mounted DebugPill to `btn`/`badge`/`rounded-box` + utility classes, drop the AI Note exception when done.
  2. **Hand-rolled button DaisyUI conversion (whole repo)** — ~110 hand-rolled `<button>` sites across 20+ files (LayoutTab 20, MediaTab 16, TemplatesTab 9, ...). Sequenced per-file with manual UI testing for each (visual regression risk).
  3. **Hand-rolled card panel sweep** — `App.jsx` long-press menu container needs `dropdown-content menu menu-sm`.
- Updated CLAUDE.md AI Note "DaisyUI component classes for UI chrome" to remove DebugPill from the canonical list and reframe the inline-styled state as tracked debt rather than a permanent architectural exception.

## Current state

- **Branch:** `claude/align-components-HdSws`, ahead of `main` by 11 commits, all pushed.
- `npm run lint` clean
- `npm test` 173/173 green (~1.4s) — gained 9 dist-conditional tests after running `vite build` first time in session
- `vite build` succeeds — sourcemaps emitted, app `index-*.js` 349KB (under 500KB tripwire), PWA SW + manifest generate, theme-meta generator idempotent
- `npm audit`: 6 remaining vulnerabilities, all in the Vite + Workbox build chain (vite 5.4.21 path-traversal, vite-plugin-pwa → workbox-build → @rollup/plugin-terser → serialize-javascript RCE, esbuild dev-server XHR). Clearing them is the Vite 5 → 8 task in TODO.md.

## Key context

- **DaisyUI mandate is now repo-wide policy.** CLAUDE.md AI Note "DaisyUI is the styling system in DaisyUI-installed repos" + the corresponding Prohibition + the `daisyui` Triggers group enforce it. The mantra is "violations are fixed, not justified" — when DaisyUI seems insufficient, ask the user, don't roll custom and don't add to a documented-exceptions list. The pre-existing AI Notes that documented Z-index deviations remain (those are genuine architectural facts about native `<dialog>` and BottomSheet/MobileNav z-stacking with sound rationale), but the DebugPill inline-styled state was reframed from "intentional exception" to "tracked debt."
- **Three big upgrades and three big DaisyUI conversions are queued in `docs/TODO.md`** with concrete plans. Don't bundle them — each is its own sequenced effort.
- **Section IDs renamed.** If you reference `'templates'` or `'layout'` for the section ID anywhere in NEW code, that's wrong — use `'presets'` and `'structure'`. The state-field name `state.layout` (the grid configuration) is unchanged and unrelated.
- **`--shadow-card` and `--shadow-glow` are gone from `src/index.css`.** If you need a shadow on a panel, use DaisyUI's `card` (which ships its own shadow) or DaisyUI's `shadow-md`/`shadow-lg`/`shadow-2xl` utilities. No new arbitrary `shadow-[...]` values.
- **Production sourcemaps now ship.** DebugPill bug reports include resolvable stack frames (with the .map files alongside the bundle).
- **GEN: sentinels are required around any new auto-generated region in index.html.** The generator script will throw a descriptive error if the sentinel is missing.
- **Migration: existing user installs.** All changes are non-breaking — the section ID rename is runtime-only state, theme combos are unchanged, manifest icons are unchanged, SW caches unchanged. No user migration needed.
