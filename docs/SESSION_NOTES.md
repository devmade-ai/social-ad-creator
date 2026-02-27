# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
1. Cross-pollination from `devmade-ai/glow-props` CLAUDE.md — PWA hardening + debug system
2. Migration from GitHub Pages to Vercel

## Accomplished

1. **PWA install prompt race condition fix** - Inline `beforeinstallprompt` capture in `index.html` before React mounts.
2. **Explicit manifest id** - Added `id: '/'` to vite PWA config for stable install identity.
3. **Dedicated maskable icon** - 1024px `pwa-maskable-1024.png` + 48px `favicon.png`. Extended icon gen to 5 sizes.
4. **Debug system (dev only)** - `debugLog.js` circular buffer + `DebugPill.jsx` in separate React root.
5. **Vercel migration** - Deleted `.github/workflows/deploy.yml`, removed `gh-pages` dep, removed all `/canva-grid/` base-path prefixes, added `vercel.json` with SPA rewrite rule.

## Current state

- **Working** - All changes verified with successful `vite build`
- Deployment is now Vercel (auto-deploy on push to main) instead of GitHub Pages
- No more `base: '/canva-grid/'` — app serves from root `/`
- Debug pill only appears in dev mode
- PWA manifest has explicit `id` and properly separated icon purposes

## Key context

- The 60-minute SW update check interval was already implemented — no change needed
- `canva-grid-assets` CDN URLs in vite.config.js and sampleImages.js are external URLs (not base-path) — left unchanged
- User needs to connect the repo in Vercel dashboard and add any env vars there
- AI_MISTAKES.md has historical GitHub Pages references — kept as-is (historical context)
