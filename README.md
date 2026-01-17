# Social Ad Creator

A browser-based tool for creating social media advertisements. Upload images, add text overlays, choose layouts, and export ads optimized for multiple platforms.

**Live Demo:** [https://devmade-ai.github.io/social-ad-creator/](https://devmade-ai.github.io/social-ad-creator/)

## Features

### Image & Media

- **Image upload** - Drag-drop or click to upload background images
- **Object fit** - Cover (fill) or Contain (fit) modes
- **Position control** - Adjust image position within frame
- **Grayscale toggle** - Quick black & white conversion
- **Overlay system** - Solid, gradient (8 directions), vignette, spotlight effects with adjustable intensity and per-cell controls

### Logo

- **Logo upload** - Add your brand logo
- **Position** - Place in corners or center
- **Size control** - Small, medium, large options

### Text Layers

Six independent text elements, each with:

- **Title** - Main headline
- **Tagline** - Supporting headline
- **Body Heading** - Section header
- **Body Text** - Detailed content
- **CTA (Call to Action)** - Action prompt
- **Footnote** - Fine print or disclaimers

Each text element supports:

- Visibility toggle
- Custom color (theme colors + neutrals)
- Cell placement (which layout cell it appears in)
- Per-element horizontal alignment
- Bold/italic styling
- Letter spacing (tight, normal, wide, wider)

### Layout System

The Layout tab has 5 sub-tabs for organization:

- **Layouts** - 20 quick-start layout templates organized by category (Image Focus, Text Focus, Balanced, Grid) with smart suggestions based on your image's aspect ratio
- **Structure** - Fine-tune rows/columns and subdivisions
- **Placement** - Assign text elements to cells, per-cell alignment, image cell selection
- **Overlay** - Per-cell overlay controls (enable/disable, type, intensity)
- **Spacing** - Global and per-cell padding controls

### Quick Styles

One-click style combinations available above the preview area. Each Quick Style applies a theme + font pairing for instant results.

### Themes & Fonts

- **4 color themes** - Quick color schemes (or create custom)
- **Custom colors** - Full control over background, text, and accent colors
- **15 Google Fonts** - Sans-serif, serif, and display categories

### Export

- **6 platforms** - LinkedIn, Facebook, Instagram (Square & Story), Twitter/X, TikTok
- **Single download** - Export current platform as PNG
- **Batch download** - ZIP file with all platform sizes
- **Progress indicator** - Visual feedback during export

## How to Use

1. **Upload an image** - Drag-drop or click the upload area in the Image tab
2. **Choose a layout** - Go to Layout tab → Layouts and pick a starting template
3. **Add your text** - Fill in the text fields in the Text tab
4. **Customize** - Use Quick Styles for instant looks, or adjust colors (Theme tab) and fonts (Font tab) manually
5. **Export** - Select your platform and download

### Tips

- Use **Suggested** layouts for options that work well with your image's aspect ratio
- **Per-cell alignment** lets you position text differently in each layout cell
- **Overlays** help text stand out over busy images
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
