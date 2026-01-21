# Session Notes

Compact context summary for session continuity. Rewrite at session end.

---

## Worked on
Adding AI Image Prompt Helper feature to help users generate prompts for AI image generation tools

## Accomplished

- Added new "AI Image Prompt" collapsible section at top of Media tab (collapsed by default)
- Prompt builder includes:
  - Subject/context text area
  - Style options (Photo, Cinematic, Editorial, Minimal, Abstract, Illustration, 3D)
  - Mood/lighting options (Dark, Light, Neutral, Dramatic, Soft, Warm, Cool)
  - Image purpose (Hero Image vs Background for text overlays)
  - Color options (use current theme or custom description)
  - Auto-detected format from current platform (orientation, aspect ratio, dimensions)
- Generated prompt automatically includes:
  - "do not include any text, words, letters, numbers, or typography"
  - "do not include any overlays, borders, watermarks, or graphic elements"
- Copy button with visual feedback
- Updated USER_GUIDE.md with documentation
- Build passes successfully

## Current state
- **Build**: Passes successfully
- **All features**: Working
- New AI Image Prompt Helper section is ready to use in Media tab

## Key context

- The helper uses `useMemo` to efficiently regenerate the prompt when options change
- Platform aspect ratio is calculated from the platforms config using GCD
- Theme colors are passed from parent component and can be used in the generated prompt
- The section is collapsed by default to keep the UI clean for users who don't need it
