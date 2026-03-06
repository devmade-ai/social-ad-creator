# Social Media Platform Specifications (2025–2026)

Authoritative reference for image/video dimensions, file types, safe zones, and best practices across all major social media platforms. Use this when adding or updating export formats in `src/config/platforms.js`.

Last updated: 2026-03-06

---

## Instagram

Instagram now favors taller formats everywhere. The profile grid moved from 1:1 square to 3:4 rectangular thumbnails, and the platform now supports 1080 × 1440 px (3:4) feed posts. Reels expanded to 3 minutes. In January 2026, Explore merged into the Reels experience.

### Feed posts (single image)

| Format | Dimensions | Ratio |
|--------|-----------|-------|
| Tall (new 2026) | 1080 × 1440 px | 3:4 |
| Portrait (best engagement) | 1080 × 1350 px | 4:5 |
| Square | 1080 × 1080 px | 1:1 |
| Landscape | 1080 × 566 px | 1.91:1 |

- File types: JPG, PNG
- Max file size: 30 MB
- Color space: sRGB
- Min width: 320 px; max width: 1080 px (larger images downscaled)
- Grid preview crops all posts to a 3:4 rectangle (center 1012 × 1350 px visible)
- Instagram has only 1% aspect ratio tolerance — stricter than Facebook's 3%

**Tips:** Upload at exactly 1080 px wide to minimize re-compression. Use JPG at 80–90% quality for photos, PNG for graphics with text. Keep critical content centered for grid survival. Enable "Upload at highest quality" in Settings → Data Usage.

### Carousel posts

- Dimensions: same options as feed posts (first slide sets the ratio for all slides)
- 2–20 slides (expanded from 10 in 2024)
- Mix images and video freely
- Video slides: up to 60 seconds each
- Image max: 30 MB/slide; Video max: 4 GB/slide
- File types: JPG, PNG, WebP (images); MP4, MOV (video)

**Tips:** All subsequent slides crop to match the first slide's ratio. Carousels get 1.4× more reach than single posts. Optimal engagement: 5–8 slides. If a user scrolls past without swiping, Instagram may re-show the post later starting at slide 2 or 3.

### Stories

- Dimensions: 1080 × 1920 px (9:16)
- File types: JPG/PNG (images), MP4/MOV (video)
- Max size: 30 MB (image), 4 GB (video)
- Video length: up to 60 seconds per card (longer videos auto-split into 15-second segments)
- Stories disappear after 24 hours
- **Safe zones:** Top ~250 px and bottom ~250 px obscured by UI elements. Effective safe area: approximately 1080 × 1420 px centered. Never place Link stickers or key text at the very bottom edge.

### Reels

- Dimensions: 1080 × 1920 px (9:16)
- File types: MP4, MOV
- Max file size: 4 GB
- Video length: up to 3 minutes (expanded from 90 seconds in January 2025)
- Frame rate: 30 fps recommended
- Codec: H.264; Audio: AAC, 128 kbps+ stereo
- **Safe zones:** Top ~155 px (username), bottom ~320 px (captions/audio bar), right ~120 px (like/comment/share buttons). Universal safe content area: approximately 996 × 1400 px centered.
- Cover image: 1080 × 1920 px, with center 1080 × 1440 px visible on the 3:4 profile grid.

**Tips:** Reels under 90 seconds perform best in discovery feeds. Instagram deprioritizes content with TikTok watermarks. Videos over 3 minutes are mostly shown to existing followers only.

### Reel cover photo

- Upload: 420 × 654 px (~2:3)
- On the main profile grid (now 3:4), the center 1080 × 1440 px area of the full 1080 × 1920 reel is visible
- Center the main subject vertically to survive both crops

### Profile picture

- Upload: 320 × 320 px (1:1)
- Displayed as a circle at ~110 px
- File types: JPG, PNG
- Keep logos/faces centered; avoid text

### Highlight covers

- Dimensions: 1080 × 1920 px (9:16)
- Center all icons and text within an 800 × 800 px safe circle in the middle of the canvas
- File types: JPG, PNG
- Maintain a uniform design across all highlights

### Instagram ads (all placements)

| Placement | Ratio | Dimensions | Max Size | Duration |
|-----------|-------|-----------|----------|----------|
| Feed (image) | 1:1 or 4:5 | 1440 × 1440 or 1440 × 1800 px | 30 MB | — |
| Feed (video) | 4:5 | 1080 × 1350 px | 4 GB | 1 sec–60 min |
| Stories | 9:16 | 1440 × 2560 px | 30 MB (img) / 4 GB (vid) | up to 60 min |
| Reels | 9:16 | 1440 × 2560 px | 4 GB | 1 sec–15 min |
| Explore | 4:5 | 1080 × 1350 px | 4 GB | 1 sec–60 min |
| Carousel | 1:1 | 1080 × 1080 px/card | 30 MB (img) / 4 GB (vid) | up to 240 min/card |

- File types: JPG, PNG (images); MP4, MOV, GIF (video). Codec: H.264 video, AAC audio
- 2026 update: Meta now recommends 1440 px resolution for high-density screens (up from 1080 px)
- Reels ad safe zones: leave 14% top, 35% bottom, 6% each side free of key elements
- The 20% text rule was officially removed, but ads with minimal text overlay still get better delivery and lower costs

---

## Facebook

Meta announced all Facebook videos are now Reels with no length/format restrictions — global rollout is ongoing in 2026. The platform now favors 4:5 portrait over the old 1200 × 630 landscape standard. Approximately 98% of users access via mobile. Facebook remains the largest consolidated audience in South Africa, with estimates placing active users between 26.7 and 36 million.

### Feed posts (single image)

| Format | Dimensions | Ratio |
|--------|-----------|-------|
| Portrait (recommended) | 1080 × 1350 px | 4:5 |
| Square | 1080 × 1080 px | 1:1 |
| Landscape | 1080 × 566 px | 1.91:1 |

- File types: JPG, PNG. Max size: 30 MB. Aspect ratio tolerance: 3%. Min resolution: 600 × 600 px.

### Stories

- 1080 × 1920 px (9:16)
- Max: 30 MB (image), 4 GB (video)
- Video: up to 20 seconds per card (longer videos split into 15-second cards)
- Safe zones: top 14% (~250 px), bottom 20% (~340 px)

### Reels

- 1080 × 1920 px (9:16), minimum 720 × 1280 px
- MP4/MOV, H.264 codec. Max: 4 GB
- Duration: up to 90 seconds (3 minutes rolling out)
- Best performing: 15–60 seconds. Frame rate: 30 fps+

### Cover photo

- Recommended upload: 1640 × 624 px
- Desktop display: 820 × 312 px. Mobile display: 640 × 360 px
- Safe zone (visible on all devices): 640 × 312 px centered
- File types: JPG, PNG. Profile photo overlaps bottom-left on desktop

### Profile picture

- Upload: 320 × 320 px (1:1, displayed as circle)
- Display: 176 × 176 px (desktop), 196 × 196 px (mobile). Min: 180 × 180 px

### Other Facebook formats

| Format | Dimensions | Ratio |
|--------|-----------|-------|
| Event cover | 1920 × 1005 px | ~1.91:1 |
| Group cover | 1640 × 856 px | 1.91:1 |
| Marketplace listing | 1200 × 1200 px (recommended) | 1:1 |

- Marketplace: Min 500 × 500 px. JPEG/PNG only. Up to 10 photos. Must be actual photos — no stock photos, text overlays, or screenshots.

### Facebook ads (all placements)

| Placement | Ratio | Dimensions | Duration |
|-----------|-------|-----------|----------|
| Feed (image) | 1:1 or 4:5 | 1440 × 1440 or 1440 × 1800 px | — |
| Feed (video) | 1:1 or 4:5 | 1440 × 1440 or 1440 × 1800 px | 1 sec–241 min |
| Stories | 9:16 | 1440 × 2560 px | 1–60 sec |
| Right column (desktop) | 1:1 | 1080 × 1080 px | — |
| Marketplace | 1:1 | 1080 × 1080 px | up to 241 min |
| In-stream video | 16:9 or 1:1 | 1080 × 1080 px min | 5–120 sec |
| Reels | 9:16 | 1440 × 2560 px | under 30 sec best |
| Carousel | 1:1 | 1080 × 1080 px/card | up to 240 min/card |
| Collection | 1:1 or 4:5 | 1080 × 1080 px | up to 15 sec (cover) |

- Image max 30 MB; video max 4 GB. JPG/PNG (images), MP4/MOV/GIF (video). H.264, AAC 128 kbps+
- 2026 change: Right column ads now require 1:1 square exclusively (1.91:1 deprecated). Collection ads now support 4:5 cover images.

---

## TikTok

TikTok Shop integration and new interactive overlays in 2026 have eaten into usable screen space. The algorithm favors 21–34 seconds for maximum distribution. The "Save Rate" has become one of the strongest signals — educational "how-to" content that users bookmark performs disproportionately well.

### Organic videos

- Dimensions: 1080 × 1920 px (9:16). Also supports 1:1 and 16:9
- File types: MP4 (preferred), MOV, MPEG, AVI, 3GP
- Max file size: 72 MB (Android), 287.6 MB (iOS), 500 MB (web)
- Max length: 10 min (in-app recording), 60 min (uploaded)
- Frame rate: 30 fps; 60 fps for fast-paced content. Codec: H.264
- **Safe zones on 1080 × 1920 canvas:** Avoid top ~200 px (search bar, logo), bottom ~250–370 px (captions, progress bar), right ~164–180 px (like/comment/share icons). Usable safe zone: approximately 960 × 1386 px centered.

### Profile picture

- Recommended: 720 × 720 px (1:1, displayed as circle). Min: 200 × 200 px
- File types: JPG, PNG, WebP. Max: 10 MB
- TikTok also allows 6-second profile videos

### Photo carousel (Photo Mode)

- 1080 × 1920 px (9:16). 2–35 images per post
- Under 500 KB per image recommended. Images only (no video)

### TikTok ads

| Placement | Dimensions | Duration | Max Size |
|-----------|-----------|----------|----------|
| In-feed (standard) | 1080 × 1920 px (9:16) | up to 10 min (9–15 sec optimal) | 500 MB |
| TopView | 1080 × 1920 px (9:16 only) | 5–60 sec | 500 MB |
| Brand Takeover | 1080 × 1920 px (9:16) | 3–5 sec | 500 MB |
| Spark Ads | organic video specs | no duration cap | organic limits |
| Carousel (image) | 1080 × 1920 or 640 × 640 px | — | 500 KB/image |
| Branded Hashtag | 1080 × 1920 px (9:16) | up to 60 sec | 500 MB |

- File types: MP4, MOV, MPEG, 3GP, AVI. Caption: 100 characters max
- Min bitrate: 516 kbps (in-feed), 2,500 kbps (TopView)
- Spark Ads see 30% higher completion rates and 142% higher engagement than standard ads
- TopView: must not use pure white in first 3 seconds. Audio required.

---

## YouTube

Shorts expanded from 60 seconds to 3 minutes in late 2024/early 2025 and now supports custom thumbnails. Standard uploads accept up to 128 GB or 12 hours.

### Standard video upload

- Recommended: 1920 × 1080 px (1080p) minimum; 3840 × 2160 px (4K) for premium content
- Aspect ratio: 16:9 standard
- File types: MP4 (H.264 + AAC-LC) strongly preferred; also MOV, AVI, WMV, FLV, WebM, ProRes
- Max file size: 128 GB (or 12 hours). Max length: 12 hours (verified), 15 min (unverified)
- Bitrate: 1080p SDR: 8–12 Mbps; 4K SDR: 35–45 Mbps
- Frame rates: 24, 25, 30, or 60 fps
- Uploading in 4K (even for 1080p content) can improve playback quality due to YouTube's VP9 codec allocation

### YouTube Shorts

- 1080 × 1920 px (9:16 required). Max length: 3 minutes
- **Safe zones:** Avoid bottom 450 px (captions, channel name), right 150 px (buttons), top 150 px
- Sweet spot for engagement: 15–45 seconds
- Shorts have become a primary gateway to channel discovery

### Thumbnails

- Standard: 1280 × 720 px (16:9). Min width: 640 px. Max: 2 MB
- Shorts: 1080 × 1920 px (9:16) custom thumbnails now supported
- File types: JPG, PNG, GIF (non-animated), WebP

### Channel banner

- Upload: 2560 × 1440 px
- Safe area for all devices: 1546 × 423 px (centered)
- TV displays full 2560 × 1440; mobile shows only center 1546 × 423
- File types: JPG, PNG, BMP, GIF. Max: 6 MB

### Profile picture

- 800 × 800 px (1:1, displayed as circle)
- File types: JPG, GIF, BMP, PNG

---

## X (Twitter)

X Premium subscribers can upload videos up to 4 hours and posts up to 25,000 characters, while free accounts remain at 2 min 20 sec and 280 characters.

### Feed posts (single image)

- Recommended: 1200 × 675 px (16:9) or 1600 × 900 px
- File types: JPG, PNG, GIF, WebP. Max: 5 MB (mobile), 15 MB (web)
- Aspect ratios between 2:1 and 1:1 display without cropping. Images taller than 1:1 are cropped in-feed.

### Multi-image posts (2–4 images)

- 2 images: each 7:8 ratio (~700 × 800 px)
- 3 images: 1 large (7:8) + 2 stacked (4:7)
- 4 images: 2×2 grid at 2:1 each
- Full images visible when expanded

### Profile picture

- 400 × 400 px (1:1, circular crop). Max: 2 MB. JPG/PNG
- Verified Organizations display squares instead of circles

### Header/banner

- 1500 × 500 px (3:1). Max: 2–5 MB. JPG/PNG. ~60 px may be cropped top/bottom

### Video posts

- Free: 2 min 20 sec max, 512 MB
- Premium: up to 4 hours (web/iOS), 8–16 GB
- MP4/MOV, H.264, AAC. Recommended 1280 × 720 (landscape) or 720 × 1280 (portrait)
- Videos under 60 seconds loop automatically

### X ads

| Placement | Dimensions | Ratio | Max Size |
|-----------|-----------|-------|----------|
| Image ad (standalone) | 1200 × 1200 or 1200 × 628 px | 1:1 or 1.91:1 | 5 MB |
| Image ad (with buttons) | 800 × 800 or 800 × 418 px | 1:1 or 1.91:1 | 5 MB |
| Video ad | 1920 × 1080, 1080 × 1080, or 1080 × 1920 px | 16:9, 1:1, or 9:16 | 1 GB |
| Carousel | 800 × 800 or 800 × 418 px (2–6 cards) | 1:1 or 1.91:1 | 5 MB/card |
| Amplify pre-roll | 1920 × 1080 px | 16:9 | 1 GB |

- Video ads: 2 min 20 sec max (15 sec or less recommended). Post copy: 280 characters. GIFs render as static images in ads.

---

## Threads

Threads profile pictures are synced from Instagram — you cannot upload a separate Threads-only photo. The platform now supports 10,500 characters per post (500 + 10K text attachment).

### Image posts

- Best size: 1080 × 1350 px (4:5)
- Also supports: 1080 × 1080 (1:1), 1080 × 1920 (9:16), 1920 × 1080 (16:9)
- File types: JPG, PNG, HEIC. Max: ~100 MB. GIFs supported under 15 MB

### Video posts

- Max 5 minutes. Recommended 1080 × 1920 px (9:16)
- MP4, MOV. Max: 500 MB. Autoplay muted — burn in captions

### Carousel posts

- Up to 20 items (expanded from 10 in late 2024). Can mix images and video
- Bio: 150 characters; up to 5 clickable links. Only 1 hashtag per post

### Profile picture

- 320 × 320 px (1:1, circular). Automatically imports from linked Instagram account

---

## LinkedIn

LinkedIn's document/carousel posts (PDF uploads) achieve approximately 24% average engagement — the highest of any LinkedIn format. LinkedIn has reached 15 million members in South Africa.

### Feed posts (single image)

| Format | Dimensions | Ratio | Notes |
|--------|-----------|-------|-------|
| Square | 1200 × 1200 px | 1:1 | General purpose |
| Portrait | 1080 × 1350 px | 4:5 | Higher engagement |
| Landscape | 1200 × 627 px | 1.91:1 | Best for link previews |

- JPG/PNG. Max: 8 MB. Up to 9 images per post

### Articles/newsletters

- Cover image: 1200 × 644 px. Inline images: 1200 px width recommended

### Banners and covers

| Format | Dimensions | Ratio |
|--------|-----------|-------|
| Company page cover | 1128 × 191 px | — |
| Personal profile banner | 1584 × 396 px | 4:1 |
| Event cover | 1776 × 444 px | — |
| Life Tab Custom images | 502 × 282 px | 16:9 |

- Max: 8 MB. JPG/PNG

### Profile picture

- Personal: 400 × 400 px (1:1, circular)
- Company logo: 300 × 300 px (displays at 60 × 60 px in feed). Max: 8 MB

### Native video

- MP4 preferred. Duration: 3 sec to 15 min (desktop) / 10 min (mobile). Max: 5 GB. Up to 4K. H.264/AAC
- Native uploads get 5× more engagement than YouTube links
- First-person founder and employee content generates 3–5× more engagement than polished corporate branding

### Document/PDF posts

- PDF, DOC, DOCX, PPT, PPTX. Max: 100 MB, up to 300 pages (10–20 optimal)

### LinkedIn ads

| Placement | Dimensions | Ratio | Max Size |
|-----------|-----------|-------|----------|
| Sponsored image (landscape) | 1200 × 628 px | 1.91:1 | 5 MB |
| Sponsored image (square) | 1200 × 1200 px | 1:1 | 5 MB |
| Sponsored image (vertical, mobile only) | 720 × 900 px | 4:5 | 5 MB |
| Sponsored video | 1080p recommended | 16:9, 1:1, or 9:16 | 200 MB |
| Carousel ads | 1080 × 1080 px/card (2–10 cards) | 1:1 | 10 MB/card |
| Document ads | PDF/PPT/DOC | — | 100 MB |
| Message ads (banner) | 300 × 250 px | — | 2 MB |
| Text ads (image) | 100 × 100 px | 1:1 | 2 MB |
| Connected TV ads (new) | 1920 × 1080 px | 16:9 | 500 MB |

- Introductory text: 150 characters before truncation. Headline: 70 characters
- Sponsored video: 15–30 seconds performs best
- Vertical ad images deliver to mobile only (not desktop)
- Connected TV ads are a new 2025–2026 format targeting decision-makers on streaming devices

---

## Pinterest

Pinterest is built for vertical content. The 2:3 ratio (1000 × 1500 px) is the algorithmic standard. Square pins get 40–50% less engagement. Horizontal images perform very poorly. 87% of usage is mobile. Most users scroll without audio.

### Standard pins

- 1000 × 1500 px (2:3). PNG or JPEG. Max: 20 MB (desktop), 32 MB (in-app)
- Title: 100 chars (40 visible in feed). Description: 800 chars
- Pins taller than 1:2.1 get cropped in the feed

### Idea pins (multi-page)

- 1080 × 1920 px (9:16). Up to 20 pages of mixed content
- Image file types: BMP, JPEG, PNG, TIFF, WebP. Video: MP4, M4V, MOV — max 5 min/page
- Max: 2 GB (mobile), 100 MB (web)
- **Safe zones:** Top 270 px, bottom 440 px, right 195 px. Now supports direct outbound links

### Video pins

- MP4, MOV, M4V. H.264/H.265. Max: 2 GB. Duration: 4 sec–15 min (6–15 seconds optimal)
- Aspect ratios: 1:1, 2:3, 4:5, or 9:16 recommended. Autoplay muted in feed

### Profile picture

- 400 × 400 px (1:1, circular). Min: 165 × 165 px

### Board covers

- Upload: 1000 × 1500 px (2:3). Display: 222 × 150 px. Center important elements

### Pinterest ads

| Placement | Ratio | Notes |
|-----------|-------|-------|
| Standard image ad | 2:3 | Same as organic pins |
| Standard video ad | 1:1, 2:3, 4:5, 9:16 | 4 sec–15 min, 2 GB max |
| Max-width video ad | 1:1 or 16:9 | Spans full feed width, paid only |
| Carousel ad | 1:1 or 2:3 (all must match) | 2–5 images (non-catalog), 2–10 (catalog) |
| Collections ad (mobile) | 1:1 or 2:3 hero | Hero + 3–24 secondary thumbnails |
| Showcase ad (new) | 2:3 | Title pin + up to 4 cards |
| Quiz ad (new) | 2:3 | Interactive quiz with results pins |

- Rich Pins (Article, Product, Recipe) require Open Graph or Schema.org markup on your website

---

## WhatsApp Business

WhatsApp compresses standard-quality images to ~1600 px on the longest side. HD mode preserves up to 4096 px. Sending as documents bypasses all compression (up to 2 GB). WhatsApp is the dominant communication channel in South Africa with an estimated 25 million users.

### Profile picture

- 1080 × 1080 px (1:1, circular crop). JPG/PNG. Max: 5 MB. Display: 192 × 192 px

### Catalog images

- Min: 600 × 600 px (1:1 square). JPG/PNG. Max: 5 MB/image. Up to 10 images per product
- Catalog header/banner: 1200 × 600 px

### Status updates

- 1080 × 1920 px (9:16). Video: up to 90 seconds (increased from 30)
- Video: MP4, H.264/AAC. Max: 16 MB (video), 5 MB (images)
- Safe zone: center 1080 × 1350 px

### Chat media

- Images max 5 MB (API). Videos: MP4 H.264/AAC, 16 MB max. Documents: up to 2 GB
- API carousel templates: 1125 × 600 px (1.91:1 mandatory), up to 10 cards

**Tip:** The "2 GB Document Trick" — sending high-resolution promo videos or print-ready photos as "Documents" rather than "Media" bypasses WhatsApp's aggressive compression completely. Essential for sharing product photography with suppliers or customers who need full-quality images.

---

## Snapchat

Every Snapchat format uses the 1080 × 1920 px (9:16) canvas. Video: H.264; audio ≥192 kbps AAC or PCM with -16 LUFS target level. Optimal ad length: 3–5 seconds.

### Snap ads (single image/video)

- 1080 × 1920 px (9:16). Video: 3 sec–30 min (3–5 sec recommended)
- MP4/MOV. Max: 1 GB (≤32 MB preferred). Image: JPG/PNG, ≤5 MB
- **Safe zones:** Avoid top 150 px and bottom 450 px
- Brand name: 32 chars. Headline: 34 chars

### Story ads

- 1–10 snaps, each following single-snap specs. Up to 180 sec/snap
- Tile image (for Discover feed): 360 × 500 px PNG, ≤2 MB

### Collection ads

- Hero at 1080 × 1920 + 2–4 product thumbnails at ≥160 × 160 px (≤2 MB each, JPG/PNG)

### Commercials

- Standard: 3–6 sec (non-skippable). Extended: 7–180 sec (first 6 sec non-skippable)
- 1080 × 1920 px, MP4/MOV, ≤1 GB

### Filter ads

- Static: 945 × 2048 px, transparent PNG, under 300 KB
- Min 50% transparent. Buffer: 310 px from top and bottom
- Filter cannot cover more than 25% of screen

### AR Lens ads

- Face and World lenses. 2D assets: PNG with transparency. 3D models: FBX, OBJ, or glTF
- Created via Lens Studio or Lens Web Builder

### Profile

- Bitmoji-driven (no traditional upload)
- Business ad profiles: square icon, 200 × 200 to 2000 × 2000 px PNG

---

## Telegram

Telegram offers unparalleled community features: groups up to 200,000 members, broadcast channels with unlimited subscribers, and file sharing up to 2 GB (Regular) or 4 GB (Premium). The Bot API allows businesses to build automated flows for lead capture, appointment booking, and order status checks — reducing manual support workload by up to 60%.

### Profile image

- 512 × 512 px (1:1, circle-cropped in chats). JPG/PNG

### Image posts

- Recommended: 1080 × 1350 px (4:5) for vertical engagement, also supports 1:1 and 16:9
- Up to 10 images per post. Max: 50 MB per image. File types: JPG, PNG

### Video posts

- 1080 × 1920 px (vertical) or 1920 × 1080 (landscape)
- Max: 4 GB (Premium) / 2 GB (Regular). Duration: unlimited. MP4 preferred
- Supports long-form podcasts, demos, and onboarding content

### Documents/files

- Up to 2 GB (Regular) / 4 GB (Premium). Any file type

**Tips:** Telegram channels function as one-way broadcast tools (like email lists but with push notifications). Pair channels with discussion groups for two-way engagement. Telegram does not compress images/files the way WhatsApp does — useful for sharing high-resolution product assets.

---

## Reddit

Reddit has become a "trust signal" for consumers looking to avoid AI-generated marketing noise. Small businesses thrive by participating authentically in industry-related subreddits, not by advertising. Reddit posts and comments now appear directly in Google search results, making the platform a long-term SEO play.

### Single image post

- 1200 × 1200 px (1:1 square) — most reliable across mobile and desktop feeds
- Also supports 1080 × 1350 (4:5 portrait) and 1920 × 1080 (16:9 landscape)

### Video posts

- 1920 × 1080 px (16:9). Duration sweet spot: 5–30 seconds for completion rates
- MP4 preferred. Max varies by subreddit

### Link post thumbnail

- 400 × 300 px (4:3). Max: 500 KB. Mandatory for visibility in feed

### Safe zones

- The bottom ~20% of images is obscured by Reddit's engagement bar overlay
- Keep text and logos away from the lower edge

### Community assets

| Format | Dimensions |
|--------|-----------|
| Community icon | 256 × 256 px (1:1) |
| Community banner (mobile) | 4000 × 192 px |
| Community banner (desktop) | 4000 × 128 px |

**Tips:** Self-promotion rules are strict — most subreddits enforce a 10:1 ratio (10 helpful/engaging posts for every 1 promotional post). AMAs (Ask Me Anything) in relevant subreddits build credibility. Product feedback subreddits can provide free market validation.

---

## Discord

Relevant for brands building product communities, running live tutorials, or targeting gaming/tech audiences.

### Server icon

- 512 × 512 px (1:1). PNG/JPG/GIF (animated GIFs for Nitro-boosted servers). Max: 8 MB

### Server banner

- 1920 × 1080 px (16:9). Requires Level 1 server boost. Max: 8 MB

### Server invite splash

- 1920 × 1080 px. Requires Level 1 boost

### In-chat media sharing

- Max: 8 MB (free users), 50 MB (Nitro Classic), 500 MB (Nitro)
- File types: JPG, PNG, GIF, MP4, MOV

**Tips:** Discord's 8 MB free-tier limit means high-resolution product images or videos must be shared via external links or compressed.

---

## Twitch

Primarily a live-streaming platform — VOD (video on demand) replays auto-delete after 14 days (60 days for Partners/Affiliates).

### Profile picture

- 800 × 800 px (1:1). PNG, JPG, GIF. Max: 10 MB. Displays at ~300 px

### Offline screen / video player banner

- 1920 × 1080 px (16:9)

### Channel banner

- 1200 × 480 px (2.5:1). Max: 10 MB

### Stories

- 1080 × 1920 px (9:16). Up to 60 seconds video

### Panels (below stream)

- 320 × 160 px (2:1) standard. PNG/JPG

### Emotes

- 112 × 112 px (uploaded), auto-scaled to 56 × 56, 28 × 28, and 112 × 112
- Transparent PNG required
