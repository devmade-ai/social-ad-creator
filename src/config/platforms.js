// Requirement: Structured platform data with nested formats, tips, and file specs
// Approach: Nested platform → formats structure with a flat `platforms` export for consumers
// Why: Nested structure enables two-level platform selector UI and per-format metadata
//   while flat export keeps all existing consumers working with zero changes
// Alternatives:
//   - Flat array only: Rejected - can't group formats under parent platforms or store tips
//   - Break all consumers at once: Rejected - flat export is trivial to derive and safer

export const platformGroups = [
  // --- Social Media ---
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    tips: [
      'Upload at 1080px wide minimum for sharp display',
      'JPG recommended for photos, PNG for graphics with text',
      'Feed images are cropped to center — keep key content centered',
      'Stories and Reels are full-screen vertical (9:16)',
    ],
    formats: [
      { id: 'instagram-feed-portrait', name: 'Feed Portrait', width: 1080, height: 1350, recommendedFormat: 'jpg', maxFileSize: '8MB' },
      { id: 'instagram-square', name: 'Square', width: 1080, height: 1080, recommendedFormat: 'jpg', maxFileSize: '8MB' },
      { id: 'instagram-feed-landscape', name: 'Feed Landscape', width: 1080, height: 566, recommendedFormat: 'jpg', maxFileSize: '8MB' },
      { id: 'instagram-story', name: 'Story / Reels', width: 1080, height: 1920, recommendedFormat: 'jpg', maxFileSize: '8MB' },
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'social',
    tips: [
      'Feed images display at 500px wide — upload at 1200px for sharpness on retina',
      'Shared links use the OG Image format (1200×630)',
      'Stories are full-screen vertical like Instagram',
    ],
    formats: [
      { id: 'facebook', name: 'Feed Post', width: 1200, height: 630, recommendedFormat: 'jpg', maxFileSize: '8MB' },
      { id: 'facebook-square', name: 'Square Post', width: 1080, height: 1080, recommendedFormat: 'jpg', maxFileSize: '8MB' },
      { id: 'facebook-story', name: 'Story', width: 1080, height: 1920, recommendedFormat: 'jpg', maxFileSize: '8MB' },
      { id: 'facebook-cover', name: 'Cover Photo', width: 1640, height: 624, recommendedFormat: 'jpg', maxFileSize: '8MB' },
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'social',
    tips: [
      'Vertical 9:16 is the only supported format for video covers',
      'Keep text within the center 80% — UI elements overlay the edges',
    ],
    formats: [
      { id: 'tiktok', name: 'Video Cover', width: 1080, height: 1920, recommendedFormat: 'jpg', maxFileSize: '10MB' },
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'social',
    // Requirement: LinkedIn recommends specific aspect ratios for optimal display
    // Approach: Three feed formats matching LinkedIn's recommended dimensions
    // Why: 1080px base width stays under 5MB after compression, ensures crisp display
    // Alternatives:
    //   - Single 1200x627: Rejected - outdated, doesn't match any LinkedIn-recommended ratio
    //   - Only square: Rejected - landscape/portrait serve different content needs
    tips: [
      'Square (1:1) works best on mobile feeds',
      'Portrait (4:5) maximizes vertical space in feeds',
      'Landscape (16:9) suits desktop-focused or cinematic content',
      'PDF carousels: export as PDF, upload directly to LinkedIn',
    ],
    formats: [
      { id: 'linkedin-square', name: 'Square', width: 1080, height: 1080, recommendedFormat: 'jpg', maxFileSize: '5MB' },
      { id: 'linkedin-portrait', name: 'Portrait', width: 1080, height: 1350, recommendedFormat: 'jpg', maxFileSize: '5MB' },
      { id: 'linkedin-landscape', name: 'Landscape', width: 1920, height: 1080, recommendedFormat: 'jpg', maxFileSize: '5MB' },
    ],
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    category: 'social',
    tips: [
      'Images in tweets are cropped to 16:9 in the feed',
      'Upload at 1600×900 to match the crop exactly',
      'PNG for screenshots and text, JPG for photos',
    ],
    formats: [
      { id: 'twitter', name: 'Post', width: 1600, height: 900, recommendedFormat: 'png', maxFileSize: '5MB' },
    ],
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    category: 'social',
    tips: [
      'Use vertical images — they take up more feed space',
      'Add text overlay for context — pins without text get fewer saves',
      'Rich, saturated colors perform best',
    ],
    formats: [
      { id: 'pinterest-pin', name: 'Pin', width: 1000, height: 1500, recommendedFormat: 'jpg', maxFileSize: '20MB' },
      { id: 'pinterest-story-pin', name: 'Story Pin', width: 1080, height: 1920, recommendedFormat: 'jpg', maxFileSize: '20MB' },
    ],
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    category: 'social',
    tips: [
      'Full-screen vertical format is essential',
      'Keep text in the center safe zone — edges get clipped',
      'Bold visuals with minimal text work best',
    ],
    formats: [
      { id: 'snapchat-snap-ad', name: 'Snap Ad', width: 1080, height: 1920, recommendedFormat: 'jpg', maxFileSize: '5MB' },
      { id: 'snapchat-story', name: 'Story', width: 1080, height: 1920, recommendedFormat: 'jpg', maxFileSize: '5MB' },
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'social',
    tips: [
      'Vertical format fills the screen on mobile',
      'Keep it simple — status viewers swipe quickly',
    ],
    formats: [
      { id: 'whatsapp-status', name: 'Status', width: 1080, height: 1920, recommendedFormat: 'jpg', maxFileSize: '16MB' },
    ],
  },
  {
    id: 'threads',
    name: 'Threads',
    category: 'social',
    tips: [
      'Square and portrait formats work best',
      'Clean, minimal designs get more engagement',
    ],
    formats: [
      { id: 'threads-post', name: 'Post', width: 1080, height: 1350, recommendedFormat: 'jpg', maxFileSize: '8MB' },
      { id: 'threads-story', name: 'Story', width: 1080, height: 1920, recommendedFormat: 'jpg', maxFileSize: '8MB' },
    ],
  },

  // --- Website ---
  {
    id: 'web-hero',
    name: 'Hero Banner',
    category: 'web',
    tips: [
      'Standard (1920×600) is most common for marketing pages',
      'Full HD (1920×1080) for full-viewport hero sections',
      'Compress to keep page load fast — aim for under 200KB',
    ],
    formats: [
      { id: 'hero-standard', name: 'Standard', width: 1920, height: 600, recommendedFormat: 'jpg', maxFileSize: '2MB' },
      { id: 'hero-tall', name: 'Tall', width: 1920, height: 800, recommendedFormat: 'jpg', maxFileSize: '2MB' },
      { id: 'hero-fullhd', name: 'Full HD', width: 1920, height: 1080, recommendedFormat: 'jpg', maxFileSize: '2MB' },
    ],
  },
  {
    id: 'og-image',
    name: 'Social Preview (OG)',
    category: 'web',
    tips: [
      'Shown when your link is shared on social media',
      'Text should be readable at small sizes — keep it simple',
      '1200×630 is the universal standard across all platforms',
    ],
    formats: [
      { id: 'og-image', name: 'OG Image', width: 1200, height: 630, recommendedFormat: 'png', maxFileSize: '1MB' },
    ],
  },

  // --- Banners ---
  {
    id: 'linkedin-banner',
    name: 'LinkedIn Banner',
    category: 'banner',
    tips: [
      'Profile photo overlaps the bottom-left — keep that area clear',
      'Displays differently on mobile — test at different widths',
    ],
    formats: [
      { id: 'linkedin-banner', name: 'Profile Banner', width: 1584, height: 396, recommendedFormat: 'png', maxFileSize: '4MB' },
    ],
  },
  {
    id: 'youtube-banner',
    name: 'YouTube',
    category: 'banner',
    tips: [
      'Safe area for text: 1546×423 centered within 2560×1440',
      'The full image shows on TV; mobile and desktop crop to center',
      'Use close-up faces and bold text for thumbnails',
      'Keep important elements in the center 1190×630 safe area',
    ],
    formats: [
      { id: 'youtube-banner', name: 'Channel Art', width: 2560, height: 1440, recommendedFormat: 'jpg', maxFileSize: '6MB' },
      { id: 'youtube-thumbnail', name: 'Thumbnail', width: 1280, height: 720, recommendedFormat: 'jpg', maxFileSize: '2MB' },
      { id: 'youtube-end-screen', name: 'End Screen', width: 1920, height: 1080, recommendedFormat: 'png', maxFileSize: null },
    ],
  },

  // --- Email ---
  {
    id: 'email',
    name: 'Email Header',
    category: 'email',
    tips: [
      'Keep under 600px display width — most email clients cap at this',
      'Use PNG for crisp text, JPG for photo-heavy headers',
      'Some email clients block images by default — don\'t rely on image-only content',
    ],
    formats: [
      { id: 'email-header', name: 'Header', width: 800, height: 400, recommendedFormat: 'jpg', maxFileSize: '1MB' },
    ],
  },

  // --- Print ---
  {
    id: 'print',
    name: 'Print',
    category: 'print',
    tips: [
      'All print sizes are at 150 DPI — suitable for screen and basic print',
      'For professional printing, export at the largest size and scale up externally',
      'PNG preserves text sharpness better than JPG for print',
    ],
    formats: [
      { id: 'a3-portrait', name: 'A3 Portrait', width: 1754, height: 2480, recommendedFormat: 'png', maxFileSize: null },
      { id: 'a3-landscape', name: 'A3 Landscape', width: 2480, height: 1754, recommendedFormat: 'png', maxFileSize: null },
      { id: 'a4-portrait', name: 'A4 Portrait', width: 1240, height: 1754, recommendedFormat: 'png', maxFileSize: null },
      { id: 'a4-landscape', name: 'A4 Landscape', width: 1754, height: 1240, recommendedFormat: 'png', maxFileSize: null },
      { id: 'a5-portrait', name: 'A5 Portrait', width: 874, height: 1240, recommendedFormat: 'png', maxFileSize: null },
      { id: 'a5-landscape', name: 'A5 Landscape', width: 1240, height: 874, recommendedFormat: 'png', maxFileSize: null },
    ],
  },

  // --- E-commerce ---
  {
    id: 'product-images',
    name: 'Product Images',
    category: 'ecommerce',
    tips: [
      'Use white or neutral backgrounds for marketplace listings',
      'Show the product clearly — no distracting elements',
      'Square format is universal across platforms',
    ],
    formats: [
      { id: 'product-square', name: 'Product Square', width: 2000, height: 2000, recommendedFormat: 'jpg', maxFileSize: null },
      { id: 'product-portrait', name: 'Product Portrait', width: 1200, height: 1800, recommendedFormat: 'jpg', maxFileSize: null },
    ],
  },
  {
    id: 'store-banners',
    name: 'Store Banners',
    category: 'ecommerce',
    tips: [
      'Wide banners work for hero sections and store headers',
      'Include a clear call-to-action',
      'Keep text readable at all screen sizes',
    ],
    formats: [
      { id: 'store-hero-banner', name: 'Hero Banner', width: 1920, height: 600, recommendedFormat: 'jpg', maxFileSize: null },
      { id: 'store-category-banner', name: 'Category Banner', width: 1200, height: 400, recommendedFormat: 'jpg', maxFileSize: null },
    ],
  },

  // --- Other ---
  {
    id: 'zoom',
    name: 'Zoom Background',
    category: 'other',
    tips: [
      '1920×1080 matches most webcam aspect ratios',
      'Avoid busy patterns — they distract during calls',
    ],
    formats: [
      { id: 'zoom-background', name: 'Virtual Background', width: 1920, height: 1080, recommendedFormat: 'jpg', maxFileSize: '5MB' },
    ],
  },
]

// Category labels for display
export const categoryLabels = {
  social: 'Social Media',
  web: 'Website',
  banner: 'Banners',
  email: 'Email',
  ecommerce: 'E-commerce',
  print: 'Print',
  other: 'Other',
}

// Category display order
export const categoryOrder = ['social', 'web', 'banner', 'email', 'ecommerce', 'print', 'other']

// Flat array for consumers that just need { id, name, width, height, category }
// Derived from platformGroups so there's a single source of truth
export const platforms = platformGroups.flatMap((group) =>
  group.formats.map((format) => ({
    ...format,
    category: group.category,
    // Attach parent platform info for UI lookups
    platformId: group.id,
    platformName: group.name,
  }))
)

// Pre-computed category groupings to avoid duplicate useMemo in components
// Groups flat platforms by category for ExportButtons multi-select UI
export const platformsByCategory = platforms.reduce((groups, p) => {
  const cat = p.category || 'other'
  if (!groups[cat]) groups[cat] = []
  groups[cat].push(p)
  return groups
}, {})

// Pre-computed category groupings for PlatformPreview nested UI
export const platformGroupsByCategory = platformGroups.reduce((groups, pg) => {
  const cat = pg.category || 'other'
  if (!groups[cat]) groups[cat] = []
  groups[cat].push(pg)
  return groups
}, {})

// Aspect ratio for a given platform ID (used by cell grids and media previews)
export function getAspectRatio(platformId) {
  const p = platforms.find((pl) => pl.id === platformId) || platforms[0]
  return p.width / p.height
}

// Lookup helpers
export function findFormat(formatId) {
  return platforms.find((p) => p.id === formatId) || platforms[0]
}

export function findPlatformGroup(formatId) {
  return platformGroups.find((g) => g.formats.some((f) => f.id === formatId)) || platformGroups[0]
}
