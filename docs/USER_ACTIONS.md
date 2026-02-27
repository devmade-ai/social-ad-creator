# User Actions Required

This document tracks manual actions that require user intervention (external dashboards, credentials, configuration, etc.).

---

## Connect repo to Vercel

**Why:** Deployment was migrated from GitHub Pages to Vercel. The codebase is ready (`vercel.json` added, base-path removed), but the repo needs to be linked in Vercel's dashboard.

**Steps:**
1. Go to [vercel.com/new](https://vercel.com/new) and import the `devmade-ai/canva-grid` GitHub repo
2. Vercel will auto-detect Vite framework and use settings from `vercel.json`
3. Click Deploy
4. If the app uses any env vars (e.g., analytics keys injected at build time), add them under **Settings → Environment Variables**
5. After first deploy succeeds, update the "Live Demo" URL in `README.md` line 5 from the old GitHub Pages URL to the new Vercel URL

**After completing:** Remove this section and replace with "No pending actions."
