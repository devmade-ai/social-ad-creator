# Social Ad Creator

A browser-based tool for creating social media advertisements. Upload images, add text overlays, choose layouts, and export ads optimized for multiple platforms.

**Live Demo:** [https://devmade-ai.github.io/social-ad-creator/](https://devmade-ai.github.io/social-ad-creator/)

## Features

### Templates
- **Complete Designs** - One-click style presets that apply theme, fonts, layout, overlay, and filters all at once
- **Layout Only** - Apply just the grid structure without changing colors or fonts

### Media
- **Image upload** - Drag-drop or click to upload background images
- **Object fit** - Cover (fill) or Contain (fit) modes
- **Position control** - Adjust image position within frame
- **Advanced filters** - Grayscale, sepia, blur, contrast, brightness
- **Logo upload** - Add your brand logo with position (corners/center) and size controls

### Content
Six text elements organized into groups:
- **Title & Tagline** - Main headline and supporting text (paired)
- **Body Heading & Body Text** - Section content (paired)
- **CTA** - Call to action button text
- **Footnote** - Fine print or disclaimers

Each text element supports:
- Visibility toggle
- Cell placement (which layout cell it appears in)
- Horizontal alignment (left, center, right, or auto)
- Color selection (theme colors + neutrals)
- Size adjustment
- Bold/italic styling
- Letter spacing (tight, normal, wide, wider)

### Layout
- **Structure** - Choose Full Bleed, Rows, or Columns with adjustable sizes
- **Cell Assignment** - Select which cell displays the image, set per-cell text alignment

### Style
- **12 color themes** - Quick color schemes plus custom color inputs
- **Typography** - 15 Google Fonts (sans-serif, serif, display categories) with separate title and body font selection
- **Overlay** - Per-cell overlay controls (solid, 8 gradient directions, vignette, spotlight) with adjustable opacity
- **Spacing** - Global padding plus per-cell custom padding

### Export
- **20 platforms** across 6 categories:
  - **Social** - Instagram Square/Story, TikTok, LinkedIn Post, Facebook Post, Twitter/X
  - **Website** - Hero (Standard/Tall/Full HD), OG Image
  - **Banners** - LinkedIn Banner, YouTube Banner
  - **Email** - Email Header
  - **Print** - A3, A4, A5 (Portrait & Landscape at 150 DPI)
  - **Other** - Zoom Background
- **Single download** - Export current platform as PNG
- **Batch download** - ZIP file with all platform sizes
- **Progress indicator** - Visual feedback during export

## Quick Start

1. **Pick a template** - Start with a Complete Design from the Templates tab
2. **Upload your image** - Go to Media tab, drag-drop or click to upload
3. **Add your text** - Fill in the Content tab with your headline, body, CTA
4. **Adjust layout** - Fine-tune grid structure in the Layout tab if needed
5. **Customize style** - Change theme, fonts, or overlay in the Style tab
6. **Export** - Select your platform and download

### Tips
- Start with **Complete Designs** for the fastest workflow
- Use **Layout Only** presets to change structure without losing your color choices
- **Per-cell overlay** helps text stand out over busy images
- Preview different platforms before exporting to ensure your design works everywhere

## Getting Started (Development)

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

## Tech Stack

- Vite + React 18
- Tailwind CSS
- html-to-image for rendering
- JSZip + file-saver for batch export
- GitHub Pages deployment

## Deployment

### Deploy to GitHub Pages

```bash
npm run deploy
```

This builds the app and pushes to the `gh-pages` branch automatically.

### Initial Setup (if not already configured)

1. In `vite.config.js`, set the base path to your repository name:

   ```js
   export default defineConfig({
     base: '/your-repo-name/',
   })
   ```

2. In GitHub repository settings → Pages:
   - Set Source to "Deploy from a branch"
   - Set Branch to `gh-pages` and folder to `/ (root)`

Your app will be available at `https://[username].github.io/[repo-name]/`
