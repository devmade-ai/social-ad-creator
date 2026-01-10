# Social Ad Creator

A browser-based tool for creating social media advertisements. Upload images, add text overlays, choose layouts, and export ads for multiple platforms.

## Features

- Image upload with drag-drop
- 16 layout templates (background, vertical columns, horizontal rows)
- 6 text layers (title, tagline, body heading, body text, call to action, footnote)
- Theme system with 4 presets and custom colors
- Overlay system (solid, gradient up/down, vignette)
- 5 Google Fonts
- Export to 6 platforms (LinkedIn, Facebook, Instagram, Twitter/X, TikTok)
- Single download and ZIP batch download

## Tech Stack

- Vite + React 18
- Tailwind CSS
- html-to-image for rendering
- JSZip + file-saver for batch export

## Getting Started

```bash
npm install
npm run dev
```

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run deploy   # Deploy to GitHub Pages
```

## Deployment to GitHub Pages

### Initial Setup

1. Create a GitHub repository and push your code

2. In `vite.config.js`, set the base path to your repository name:

   ```js
   export default defineConfig({
     base: '/your-repo-name/',
     // ...
   })
   ```

3. Install gh-pages:

   ```bash
   npm install -D gh-pages
   ```

4. Add deploy script to `package.json`:

   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

5. Deploy:

   ```bash
   npm run deploy
   ```

6. In your GitHub repository settings:
   - Go to Settings > Pages
   - Set Source to "Deploy from a branch"
   - Set Branch to `gh-pages` and folder to `/ (root)`
   - Save

Your app will be available at `https://[username].github.io/[repo-name]/`

### Subsequent Deployments

Just run:

```bash
npm run deploy
```

This builds the app and pushes to the `gh-pages` branch automatically.
