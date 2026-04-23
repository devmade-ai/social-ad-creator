// Requirement: Old runtime caches (`google-fonts-cache`, `gstatic-fonts-cache`)
// from before the SW cache rename to *-v2 sit in storage for ~1 year. They
// hold opaque (status 0) responses that fail the new CORS-mode font requests.
// Workbox's `cleanupOutdatedCaches: true` only handles precache, not runtime.
// Approach: fire-and-forget `caches.delete` on every page load. Idempotent —
// once the cache is gone, subsequent calls return false and do nothing.
// Alternatives:
//   - Custom SW activate handler: Rejected — would require switching from
//     `generateSW` to `injectManifest`, a much bigger refactor for a one-shot.
//   - Leave caches to expire naturally: Rejected — that's a year of wasted
//     storage budget on every PWA install that updates from the old SW.

// Single source of truth for the pre-rename cache names. DebugPill's PWA
// Diagnostics tab imports this list to flag any still-present entry as
// stale (the sunset signal). Adding a third rename here automatically
// surfaces it in the diagnostic — no lockstep update needed.
export const OLD_CACHES = ['google-fonts-cache', 'gstatic-fonts-cache']

export function cleanupOldCaches() {
  if (typeof caches === 'undefined') return
  for (const name of OLD_CACHES) {
    caches.delete(name).catch(() => { /* missing cache is the success case */ })
  }
}
