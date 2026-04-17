# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
Retire `docs/HISTORY.md`, add Communication section to CLAUDE.md, implement PWA icon cache busting with tripwire test and reinstall guidance.

## Accomplished

### Docs scaffolding (commit 4a1d02c)
- Deleted `docs/HISTORY.md` — git history is the source of truth for completed work, parallel changelog was redundant
- Removed `### docs/HISTORY.md` subsection from CLAUDE.md Documentation rules
- Updated `### docs/TODO.md` subsection: "move completed items to HISTORY.md" → "delete completed items (git history tracks them)"
- Added top-level `## Communication` section between Principles and Code Standards (peer-to-peer tone, no sycophancy, ask before assuming, concrete options)
- Added `COMMUNICATION` to the top-of-file reminder line
- Removed two AI Notes bullets ("ASK before assuming", "Communication style") now covered by the top-level section

### PWA icon cache busting (commit 7c25c37 + follow-up)
- `vite.config.js`: added `iconVersion()` helper (sha256 prefix of `public/<icon>`), `versioned()` helper, `iconCacheBustHtml()` Vite plugin that rewrites the four icon `<link>` literals in `index.html` to `?v=<hash>`, manifest icons use `versioned()`, workbox adds `cleanupOutdatedCaches: true` and `/^v$/` to `ignoreURLParametersMatching`. Plugin runs before `VitePWA()` to lock the contract.
- `src/__tests__/iconCacheBust.test.js`: 9 Jest assertions (source-level + dist-level, dist tests skip if no `dist/`). Tripwire verified — breaking `/^v$/` regex fails the test, restoring passes.
- `InstallInstructionsModal.jsx`: added DaisyUI `collapse collapse-arrow` collapsible ("Already installed and the icon looks outdated?") with platform-tailored reinstall steps keyed off `navigator.userAgent` (iOS long-press → Remove App, Android long-press → Uninstall, Desktop → app menu → Uninstall). UA-driven because `instructions.browser` display string doesn't carry mobile-vs-desktop for bare "Chrome"/"Edge"/"Brave"/"Opera".
- Updated CLAUDE.md Quick Reference test count 133 → 142 and added AI note describing the cache-bust invariants.
- Updated docs/TODO.md test coverage line 133 → 142 and added `iconCacheBust` to the file list.

## Current state

- **Branch:** `claude/delete-history-file-IbP5C` (pushed)
- Two commits: `4a1d02c` (docs), `7c25c37` (cache-bust + modal)
- `npm run lint` clean, `vite build` green, `npm test` 142/142 pass
- `dist/manifest.webmanifest` icons carry `?v=<hash>`, `dist/index.html` has four versioned icon `<link>` tags, `dist/sw.js` has `cleanupOutdatedCaches()` + `/^utm_/,/^v$/` ignore params
- Verified `sharp` generate-icons output is byte-deterministic — hashes only bump when `public/icon.svg` changes, not on every build

## Key context

- **Pattern source:** `glow-props/docs/implementations/PWA_ICON_CACHE_BUST.md`. Always fetch the latest before modifying the cache-bust flow.
- **Five cache layers the pattern covers:** browser HTTP cache, CDN edge (Vercel), Workbox precache, Chrome WebAPK shadow, OS icon cache. The first four bust via `?v=<hash>`; the OS layer is surfaced to users via the reinstall collapsible because no web-side change refreshes it.
- **Why the `/^v$/` workbox entry is non-optional:** without it, Workbox precache only matches the un-versioned URL — versioned icon requests fall through to network every time, breaking offline. The tripwire asserts this at both source and dist levels.
- **Why `iconCacheBustHtml()` throws on missing literal:** a subtle reformatting of a `<link>` tag (attribute reorder, single-quoted attrs, pre-existing query) would make the substring replacement a silent no-op and ship un-versioned URLs. Throwing at build time catches it immediately.
- **Why UA detection in the modal:** `instructions.browser` is the hook's human-readable display string; it includes `(iOS)`/`(Mobile)`/`(Desktop)` for Safari/Firefox but NOT for Chrome/Edge/Brave/Opera (bare display names). Keying off the string would misclassify Android Chromium users as desktop. `navigator.userAgent` in the modal avoids duplicating hook logic and covers all cases.
- **Deterministic icon generation:** `scripts/generate-icons.mjs` uses `sharp` with a fixed SVG density (400). Re-running produces byte-identical PNGs, so hashes only change when `public/icon.svg` changes — exactly what the pattern requires.
