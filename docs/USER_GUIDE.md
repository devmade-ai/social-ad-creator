# User Guide

A complete guide to creating social media ads with 🫩 Grumpy Campaign Kit.

---

## Overview

🫩 Grumpy Campaign Kit helps you build professional social media advertisements in minutes. The interface is organized into 5 tabs that follow a natural workflow:

1. **Presets** - Start here with layouts, themes, and looks
2. **Media** - Upload your images and logo
3. **Content** - Write your text and configure visibility
4. **Structure** - Adjust the grid structure and cell alignment
5. **Style** - Customize fonts, overlays, and spacing

---

## Header Controls

The header bar contains useful controls:

| Control | Description |
|---------|-------------|
| **Undo** (↶) | Undo your last change. Keyboard: `Ctrl+Z` (Windows) or `Cmd+Z` (Mac) |
| **Redo** (↷) | Redo an undone change. Keyboard: `Ctrl+Y` or `Ctrl+Shift+Z` |
| **Dark/Light Mode** | Toggle between dark and light interface themes |
| **Install** | (When available) Install the app for offline use |
| **Update** | (When available) Apply the latest version of the app |

---

## Installing the App (PWA)

🫩 Grumpy Campaign Kit can be installed as a Progressive Web App (PWA) for offline use and a native app-like experience.

### Benefits of Installing
- **Works offline** - Create ads without an internet connection
- **Faster loading** - App resources are cached locally
- **Full-screen experience** - No browser address bar or tabs
- **Quick access** - Launch from your dock, taskbar, or home screen

### Browser Support

| Browser | Install Support | How to Install |
|---------|----------------|----------------|
| **Chrome** | ✅ Full | Click "Install" button in header, or click install icon in address bar |
| **Edge** | ✅ Full | Click "Install" button in header, or use menu → "Install Grumpy Campaign Kit" |
| **Brave** | ✅ Full | Click "Install" button in header (ensure Shields isn't blocking) |
| **Safari (iOS)** | ⚠️ Manual | Tap Share → "Add to Home Screen" |
| **Safari (macOS)** | ⚠️ Manual | File → "Add to Dock..." |
| **Firefox (Mobile)** | ⚠️ Manual | Menu → "Add to Home screen" |
| **Firefox (Desktop)** | ❌ Not supported | Firefox removed PWA support in 2021. Use Chrome, Edge, or Brave for installation. |

### Installation Instructions by Browser

#### Chrome / Edge / Brave (Automatic)
1. Look for the **Install** button in the header (appears automatically)
2. Click "Install" and confirm in the popup
3. The app will be added to your applications

#### Safari (iOS)
1. Tap the **Share** button (square with arrow) at the bottom
2. Scroll down and tap **"Add to Home Screen"**
3. Tap **"Add"** in the top right

#### Safari (macOS)
1. Click **File** in the menu bar
2. Select **"Add to Dock..."**
3. Click **"Add"** to confirm

#### Firefox Mobile
1. Tap the **menu button** (three dots)
2. Tap **"Add to Home screen"**
3. Tap **"Add"** to confirm

### Updates
When a new version is available, you'll see an **Update** button in the header. Click it to refresh and get the latest features.

---

## Tab-by-Tab Guide

### Presets Tab

The starting point for most designs. Contains four sections:

#### Sample Images
Quick-start sample images to add to your library. Auto-expands when your library is empty. Click any sample to add it.

#### Layout
Grid templates that change your structure without affecting colors or fonts:
- Number of rows/columns
- Cell sizes
- Image and text cell assignments

**Aspect Ratio Filter:** Filter layouts by aspect ratio (All, Square, Portrait, Landscape) to find layouts that work best for your target platform.

**Category Filter:** Browse by category (All, Suggested, Classic, Split, Stacked, etc.) to find the right layout style.

**How to use:** Click a layout to change your grid structure. Your colors, fonts, and content are preserved.

#### Themes
Color schemes for your ad:
- **Presets:** 12 pre-built color themes you can apply with one click
- **Custom Colors:** Set your own primary, secondary, and accent colors

**How to use:** Click a theme preset to apply it, or edit the custom color inputs to create your own palette.

#### Looks
Visual effect presets that apply overlay, fonts, and filters without changing layout or colors:
- Overlay effects (gradients, vignettes, etc.)
- Font combinations
- Image filters

**How to use:** Click a look to apply its visual effects. Your layout and theme colors are preserved.

---

### Media Tab

Manage your images and logo.

#### AI Image Prompt (collapsed by default)
A helper tool for generating prompts to use with AI image generation tools (like DALL-E, Midjourney, or Stable Diffusion). Expand this section to build a prompt tailored to your ad.

**Controls:**
- **Subject / Context:** Describe what you want in the image (e.g., "coffee shop interior", "mountain landscape")
- **Style:** Choose a visual style (Photo, Cinematic, Editorial, Minimal, Abstract, Illustration, 3D)
- **Mood / Lighting:** Set the atmosphere (Dark, Light, Neutral, Dramatic, Soft, Warm, Cool)
- **Image Purpose:**
  - **Hero Image:** Clean focal point for featured images
  - **Background:** Subtle details, optimized for text overlays
- **Orientation:** Landscape, Portrait, or Square (choose based on your target platforms)
- **Colors:** Use your current theme colors or enter custom color descriptions

**Generated Prompt:** The helper builds a complete prompt including:
- Your style and mood preferences
- Color palette from your theme
- Selected orientation
- **Automatic constraints:** "no text, no overlays" - ensures clean images ready for your ad

Click **Copy** to copy the prompt to your clipboard for use in any AI image generator.

#### Images
Upload and manage your image library:
- **Upload:** Drag-drop images or click to browse (supports multiple images)
- **Image Library:** Click any image to select it for editing

**Selected Image Settings:**
- **Assign to Cells:** Click cells in the mini-grid to assign the selected image to layout cells
- **Fit:** Choose "Cover" (fills frame, may crop) or "Contain" (shows entire image)
- **Position:** 9-point grid to adjust where the image sits within the frame
- **Grayscale:** Quick toggle for black & white effect

**Multi-Image Layouts:** For layouts with multiple image cells, you can assign different images to different cells. The mini-grid shows which cells have images assigned (📷 icon).

#### Image Overlay (appears when an image is selected)
Controls the overlay applied directly to the selected image:

- **On/Off Toggle:** Quick enable/disable for the overlay effect
- **Type:** Choose from multiple overlay categories:
  - **Basic & Gradients:** Solid color, linear gradients (8 directions)
  - **Radial:** Vignette, Spotlight, Radial Soft, Radial Ring
  - **Effects:** Blur Edges, Frame, Duotone
  - **Blend Modes:** Multiply, Screen, Overlay, Color Burn
  - **Textures:** Noise, Film Grain
- **Color:** Choose from theme colors (Primary, Secondary, Accent) or neutrals
- **Opacity:** Adjust transparency (1-100%)

**Note:** This overlay is saved with the image itself. The Style tab has separate per-cell overlays that stack on top.

#### Advanced Filters (appears when an image is selected)
Fine-tune the selected image:
- **Grayscale** - Convert to black and white (0-100%)
- **Sepia** - Add warm vintage tone (0-100%)
- **Blur** - Soften the image (0-10px)
- **Contrast** - Adjust light/dark difference (50-150%)
- **Brightness** - Make lighter or darker (50-150%)

#### Logo
- **Upload:** Add your brand logo
- **Position:** Place in any corner or center (Top Left, Top Right, Bottom Left, Bottom Right, Center)
- **Size:** XS, S, M, L, or XL

---

### Content Tab

Write and configure your text elements. Organized into collapsible groups:

#### Title & Tagline
- **Title:** Your main headline (largest text)
- **Tagline:** Supporting text that appears with the title

#### Body
- **Body Heading:** Section header for body content
- **Body Text:** Detailed information or description

#### Call to Action
- **CTA:** Action prompt like "Learn More" or "Shop Now"

#### Footnote
- **Footnote:** Fine print, disclaimers, or legal text

#### Text Controls (for each element)

| Control | What it does |
|---------|--------------|
| Eye icon | Toggle visibility on/off |
| Text input | Enter your content |
| Cell dropdown | Choose which layout cell this text appears in |
| Alignment | Left, Center, Right, or Auto (uses cell default) |
| Color | Pick from theme colors or neutrals |
| Size slider | Adjust relative size |
| B / I buttons | Bold and italic styling |
| Letter spacing | Tight, Normal, Wide, Wider |

---

### Structure Tab

Fine-tune your grid structure and text alignment.

#### Structure
- **Layout Type:** Full Bleed (single cell), Rows, or Columns
- **Interactive Grid:** Click and drag dividers to resize sections
- **Add/Remove:** Adjust the number of sections and subdivisions
- Click on a section or cell in the grid to select it

#### Text Alignment
Context-aware alignment controls that respond to your selection in the Structure grid:

| Selection | What happens |
|-----------|--------------|
| **Section selected** (row/column) | Alignment applies to all cells in that section |
| **Cell selected** | Alignment applies to that specific cell only |
| **Nothing selected** | Sets the global alignment default |

Controls available:
- **Horizontal:** Left, Center, Right
- **Vertical:** Top, Middle, Bottom

---

### Style Tab

Fine-tune typography, overlays, and spacing.

#### Typography
- **Title Font:** Choose from 15 Google Fonts for headlines
- **Body Font:** Choose a font for body text and smaller elements
- **Preview:** See how fonts look before selecting

#### Overlay
Controls per-cell overlays that help text stand out. Select a cell to configure:
- **Enable/Disable:** Toggle overlay for each cell (defaults to on for image cells)
- **Custom Settings:** Enable to override with your own type, color, and opacity
- **Type:** Choose from multiple overlay categories:
  - Basic & Gradients: Solid, 8 gradient directions
  - Radial: Vignette, Spotlight, Radial Soft, Radial Ring
  - Effects: Blur Edges, Frame, Duotone, Noise, Film Grain
  - Blend Modes: Multiply, Screen, Overlay, Color Burn
- **Color:** Theme colors (Primary, Secondary, Accent) or neutrals
- **Opacity:** Adjust transparency (0-100%)

#### Spacing
- **Global Padding:** Set consistent padding for all cells
- **Outer Frame:** Add a colored border around the entire canvas (% of padding)
- **Per-Cell Settings:** Select a cell to customize:
  - Custom padding override
  - Custom cell frame (colored border)

---

## Export

Located below the preview area.

### Platform Selection
Click any platform button to see how your ad looks at that size. Platforms are organized by category:

**Social Media:**
- Instagram Square (1080×1080)
- TikTok (1080×1920)
- Instagram Story (1080×1920)
- LinkedIn Post (1200×627)
- Facebook Post (1200×630)
- Twitter/X (1600×900)

**Website:**
- Hero Standard (1920×600) - Standard website hero banner
- Hero Tall (1920×800) - Taller hero for more impact
- Hero Full HD (1920×1080) - Full viewport hero
- OG Image (1200×630) - Social share preview image

**Banners:**
- LinkedIn Banner (1584×396) - Profile/company banner
- YouTube Banner (2560×1440) - Channel art

**Print (150 DPI):**
- A3 Portrait (1754×2480)
- A3 Landscape (2480×1754)
- A4 Portrait (1240×1754)
- A4 Landscape (1754×1240)
- A5 Portrait (874×1240)
- A5 Landscape (1240×874)

**Other:**
- Email Header (800×400) - Email campaign header
- Zoom Background (1920×1080) - Virtual meeting background

### Download Options
- **Download:** Export the current platform as a PNG file
- **Download All:** Get a ZIP file containing all platform sizes

---

## Workflow Tips

### Fastest Workflow
1. Pick a Layout and Theme from the Presets tab
2. Upload your image in Media
3. Type your text in Content
4. Export

### Custom Design Workflow
1. Upload your image first (Media tab)
2. Pick a Layout preset (Presets → Layout)
3. Choose your theme colors (Presets → Themes)
4. Pick fonts (Style → Typography)
5. Add overlays to improve text readability (Style → Overlay)
6. Write your content (Content tab)
7. Export

### Making Text Readable
- Use **overlays** on cells with text over busy images
- **Gradient overlays** work well for text at edges
- **Solid overlays** with low opacity create subtle darkening
- **Vignette** draws attention to the center
- Adjust **text color** to contrast with your overlay

### Using AI-Generated Images
1. Open **Media → AI Image Prompt** section
2. Describe your subject and choose style/mood
3. Select orientation (Landscape for banners, Portrait for stories, Square for posts)
4. Select "Background" purpose if you'll have text overlays
5. Optionally set a theme first (Presets → Themes) to include your colors
6. Click **Copy** and paste into your AI image generator
7. Upload the generated image back into the tool

### Working with Layouts
- **Full Bleed:** Best for single-message ads with large text
- **Rows:** Good for separating image and text areas
- **Columns:** Creates side-by-side layouts
- Use **cell assignment** in Content tab to place text exactly where you want it
- Use **Structure tab** to fine-tune cell sizes and alignment

### Multi-Image Layouts
Some layouts support multiple images in different cells:
1. Upload all your images to the library (Media → Images)
2. Select an image by clicking it in the library
3. Use the "Assign to Cells" mini-grid to assign it to cells
4. Repeat for each image you want to place
5. Each image can have its own fit, position, overlay, and filter settings
