# User Guide

A complete guide to creating social media ads with the Social Ad Creator.

---

## Overview

The Social Ad Creator helps you build professional social media advertisements in minutes. The interface is organized into 5 tabs that follow a natural workflow:

1. **Templates** - Start here with pre-built designs
2. **Media** - Upload your background image and logo
3. **Content** - Write your text and configure visibility
4. **Layout** - Adjust the grid structure and cell alignment
5. **Style** - Customize colors, fonts, overlays, and spacing

---

## Tab-by-Tab Guide

### Templates Tab

The starting point for most designs. Contains two sections:

#### Complete Designs
Pre-built style combinations that apply everything at once:
- Color theme
- Font pairing
- Layout structure
- Overlay settings
- Image filters

**How to use:** Click any design thumbnail to apply it instantly. Your image and text content are preserved.

#### Layout Only
Grid templates that change only the structure:
- Number of rows/columns
- Cell sizes
- Text cell assignments

**How to use:** Click a layout to change your grid without affecting colors or fonts.

---

### Media Tab

Manage your background image and logo.

#### AI Image Prompt (collapsed by default)
A helper tool for generating prompts to use with AI image generation tools (like DALL-E, Midjourney, or Stable Diffusion). Expand this section to build a prompt tailored to your ad.

**Controls:**
- **Subject / Context:** Describe what you want in the image (e.g., "coffee shop interior", "mountain landscape")
- **Style:** Choose a visual style (Photo, Cinematic, Editorial, Minimal, Abstract, Illustration, 3D)
- **Mood / Lighting:** Set the atmosphere (Dark, Light, Neutral, Dramatic, Soft, Warm, Cool)
- **Image Purpose:**
  - **Hero Image:** Clean focal point for featured images
  - **Background:** Subtle details, optimized for text overlays
- **Colors:** Use your current theme colors or enter custom color descriptions
- **Format:** Automatically shows the current platform's dimensions and aspect ratio

**Generated Prompt:** The helper builds a complete prompt including:
- Your style and mood preferences
- Color palette from your theme
- Correct orientation and aspect ratio for your platform
- **Automatic constraints:** "no text, no overlays" - ensures clean images ready for your ad

Click **Copy** to copy the prompt to your clipboard for use in any AI image generator.

#### Background Image
- **Upload:** Drag-drop an image or click to browse
- **Sample Images:** Click any sample to use it as a starting point
- **Fit:** Choose "Cover" (fills frame, may crop) or "Contain" (shows entire image)
- **Position:** Adjust where the image sits within the frame
- **Image Cell:** (Multi-cell layouts only) Select which cell displays the background image

#### Image Overlay
Controls the overlay on your background image (same system used by Complete Design templates):

- **On/Off Toggle:** Quick enable/disable for the overlay effect
- **Type:** Choose from multiple overlay categories (click again to deselect):
  - **Basic & Gradients:** Solid color, linear gradients (8 directions)
  - **Radial:** Vignette, Spotlight, Radial Soft, Radial Ring
  - **Effects:** Blur Edges, Frame, Duotone
  - **Blend Modes:** Multiply, Screen, Overlay, Color Burn
  - **Textures:** Noise, Film Grain
- **Color:** Choose from theme colors (Primary, Secondary, Accent) or neutrals (click again to deselect)
- **Opacity:** Adjust transparency (1-100%)

**Note:** Type, Color, and Opacity controls only appear when the overlay is enabled. This is separate from per-cell overlays in the Style tab.

#### Advanced Filters
Expand this section to access:
- **Grayscale** - Convert to black and white (0-100%)
- **Sepia** - Add warm vintage tone
- **Blur** - Soften the image
- **Contrast** - Adjust light/dark difference
- **Brightness** - Make lighter or darker

#### Logo
- **Upload:** Add your brand logo
- **Position:** Place in any corner or center
- **Size:** Small, medium, or large

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

### Layout Tab

Fine-tune your grid structure and text alignment.

#### Structure
- **Layout Type:** Full Bleed (single cell), Rows, or Columns
- **Interactive Grid:** Click and drag dividers to resize sections
- **Add/Remove:** Adjust the number of sections
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

Customize the visual appearance.

#### Themes
- **12 preset themes:** Click to apply a color scheme instantly
- **Custom colors:** Expand to set your own background, primary, secondary, and accent colors

#### Typography
- **Title Font:** Choose from 15 Google Fonts for headlines
- **Body Font:** Choose a font for body text and smaller elements
- **Preview:** See how fonts look before selecting

#### Overlay
Controls per-cell overlays that help text stand out:
- **Enable/Disable:** Toggle overlay for each cell
- **Type:** Choose from multiple overlay categories (same options as Media > Image Overlay)
- **Color:** Usually matches your theme
- **Opacity:** Adjust transparency (0-100%)

#### Spacing
- **Global Padding:** Set consistent padding for all cells
- **Per-Cell Padding:** Override padding for specific cells

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

**Other:**
- Email Header (800×400) - Email campaign header
- Zoom Background (1920×1080) - Virtual meeting background

### Download Options
- **Download:** Export the current platform as a PNG file
- **Download All:** Get a ZIP file containing all platform sizes

---

## Workflow Tips

### Fastest Workflow
1. Pick a Complete Design from Templates
2. Upload your image in Media
3. Type your text in Content
4. Export

### Custom Design Workflow
1. Upload your image first (Media tab)
2. Pick a Layout Only preset (Templates tab)
3. Customize your theme and fonts (Style tab)
4. Add overlays to improve text readability (Style tab)
5. Write your content (Content tab)
6. Export

### Making Text Readable
- Use **overlays** on cells with text over busy images
- **Gradient overlays** work well for text at edges
- **Solid overlays** with low opacity create subtle darkening
- **Vignette** draws attention to the center
- Adjust **text color** to contrast with your overlay

### Using AI-Generated Images
1. Set your theme and platform first (Style tab and Export area)
2. Open **Media > AI Image Prompt** section
3. Describe your subject and choose style/mood
4. Select "Background" purpose if you'll have text overlays
5. Click **Copy** and paste into your AI image generator
6. Upload the generated image back into the tool

### Working with Layouts
- **Full Bleed:** Best for single-message ads with large text
- **Rows:** Good for separating image and text areas
- **Columns:** Creates side-by-side layouts
- Use **cell assignment** in Content tab to place text exactly where you want it
