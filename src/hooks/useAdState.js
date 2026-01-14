import { useCallback } from 'react'
import { presetThemes } from '../config/themes'
import { useHistory } from './useHistory'

const defaultTheme = presetThemes[0] // Dark theme

export const defaultState = {
  image: null,
  imageObjectFit: 'cover',
  imagePosition: 'center',
  imageFilters: {
    grayscale: false,
    sepia: 0,
    blur: 0,
    contrast: 100,
    brightness: 100,
  },

  overlay: {
    type: 'solid',
    color: 'primary',
    opacity: 50,
  },

  text: {
    title: { content: 'Your Title Here', visible: true, color: 'secondary', size: 1, bold: true, italic: false, letterSpacing: 0 },
    tagline: { content: 'Elevate your brand today', visible: true, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0 },
    bodyHeading: { content: 'Why Choose Us', visible: true, color: 'secondary', size: 1, bold: true, italic: false, letterSpacing: 0 },
    bodyText: { content: 'Transform your business with innovative solutions designed for success.', visible: true, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0 },
    cta: { content: 'Learn More', visible: true, color: 'accent', size: 1, bold: true, italic: false, letterSpacing: 0 },
    footnote: { content: '*Terms and conditions apply', visible: true, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0 },
  },

  // Text group positioning (which cell each group appears in)
  // null = auto (follows default behavior), number = specific cell index
  textGroups: {
    titleGroup: { cell: null },    // title + tagline
    bodyGroup: { cell: null },     // bodyHeading + bodyText
    cta: { cell: null },           // independent
    footnote: { cell: null },      // independent
  },

  logo: null,
  logoPosition: 'bottom-right',
  logoSize: 0.15, // 15% of canvas width

  // Nested grid layout system
  // type: 'fullbleed' = single layer, 'rows' = horizontal sections, 'columns' = vertical sections
  // Each section can optionally be subdivided in the perpendicular direction
  layout: {
    type: 'fullbleed', // 'fullbleed' | 'rows' | 'columns'
    // Structure defines each primary section (row or column depending on type)
    // size = percentage of total height (rows) or width (columns)
    // subdivisions = how many cells in this section (1 = no split)
    // subSizes = percentage widths (rows) or heights (columns) for each subdivision
    structure: [
      { size: 100, subdivisions: 1, subSizes: [100] },
    ],
    imageCell: 0, // flat cell index where image appears (single cell, no spanning)
    textAlign: 'center', // 'left' | 'center' | 'right' - global fallback
    textVerticalAlign: 'center', // 'start' | 'center' | 'end' - global fallback
    // Per-cell alignment overrides (flat cell index)
    cellAlignments: [],
    // Per-cell overlay overrides (flat cell index -> { enabled, type, color, opacity })
    // If not set for a cell, uses global overlay settings for image cell, none for others
    cellOverlays: {},
  },

  theme: {
    preset: 'dark',
    primary: defaultTheme.primary,
    secondary: defaultTheme.secondary,
    accent: defaultTheme.accent,
  },

  fonts: {
    title: 'montserrat',
    body: 'inter',
  },

  // Padding settings (in pixels)
  padding: {
    global: 20, // 20px padding for all cells
    cellOverrides: {}, // { cellIndex: paddingValue } for per-cell overrides
  },

  platform: 'instagram-square',
}

export function useAdState() {
  const { state, setState, undo, redo, canUndo, canRedo, resetHistory } = useHistory(defaultState)

  const setImage = useCallback((image) => {
    setState((prev) => ({ ...prev, image }))
  }, [])

  const setImageObjectFit = useCallback((imageObjectFit) => {
    setState((prev) => ({ ...prev, imageObjectFit }))
  }, [])

  const setImagePosition = useCallback((imagePosition) => {
    setState((prev) => ({ ...prev, imagePosition }))
  }, [])

  const setImageFilters = useCallback((filters) => {
    setState((prev) => ({ ...prev, imageFilters: { ...prev.imageFilters, ...filters } }))
  }, [])

  const setLogo = useCallback((logo) => {
    setState((prev) => ({ ...prev, logo }))
  }, [])

  const setLogoPosition = useCallback((logoPosition) => {
    setState((prev) => ({ ...prev, logoPosition }))
  }, [])

  const setLogoSize = useCallback((logoSize) => {
    setState((prev) => ({ ...prev, logoSize }))
  }, [])

  const setOverlay = useCallback((overlay) => {
    setState((prev) => ({ ...prev, overlay: { ...prev.overlay, ...overlay } }))
  }, [])

  const setText = useCallback((layer, updates) => {
    setState((prev) => ({
      ...prev,
      text: {
        ...prev.text,
        [layer]: { ...prev.text[layer], ...updates },
      },
    }))
  }, [])

  const setTextGroups = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      textGroups: { ...prev.textGroups, ...updates },
    }))
  }, [])

  const setLayout = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      layout: { ...prev.layout, ...updates },
    }))
  }, [])

  const setTheme = useCallback((theme) => {
    setState((prev) => ({ ...prev, theme: { ...prev.theme, ...theme } }))
  }, [])

  const setThemePreset = useCallback((presetId) => {
    const preset = presetThemes.find((t) => t.id === presetId)
    if (preset) {
      setState((prev) => ({
        ...prev,
        theme: {
          preset: preset.id,
          primary: preset.primary,
          secondary: preset.secondary,
          accent: preset.accent,
        },
      }))
    }
  }, [])

  const setFonts = useCallback((fonts) => {
    setState((prev) => ({ ...prev, fonts: { ...prev.fonts, ...fonts } }))
  }, [])

  const setPadding = useCallback((padding) => {
    setState((prev) => ({ ...prev, padding: { ...prev.padding, ...padding } }))
  }, [])

  const setPlatform = useCallback((platform) => {
    setState((prev) => ({ ...prev, platform }))
  }, [])

  const resetState = useCallback(() => {
    setState(defaultState)
  }, [])

  return {
    state,
    setImage,
    setImageObjectFit,
    setImagePosition,
    setImageFilters,
    setLogo,
    setLogoPosition,
    setLogoSize,
    setOverlay,
    setText,
    setTextGroups,
    setLayout,
    setTheme,
    setThemePreset,
    setFonts,
    setPadding,
    setPlatform,
    resetState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  }
}
