import { useCallback } from 'react'
import { presetThemes } from '../config/themes'
import { useHistory } from './useHistory'

const defaultTheme = presetThemes[0] // Dark theme

export const defaultState = {
  image: null,
  imageObjectFit: 'cover',
  imagePosition: 'center',
  imageGrayscale: false,

  overlay: {
    type: 'solid',
    color: 'primary',
    opacity: 50,
  },

  text: {
    title: { content: 'Your Title Here', visible: true, color: 'secondary', size: 1 },
    tagline: { content: 'Elevate your brand today', visible: true, color: 'secondary', size: 1 },
    bodyHeading: { content: 'Why Choose Us', visible: true, color: 'secondary', size: 1 },
    bodyText: { content: 'Transform your business with innovative solutions designed for success.', visible: true, color: 'secondary', size: 1 },
    cta: { content: 'Learn More', visible: true, color: 'accent', size: 1 },
    footnote: { content: '*Terms and conditions apply', visible: true, color: 'secondary', size: 1 },
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

  // New flexible layout system
  layout: {
    splitType: 'none', // 'none' | 'vertical' | 'horizontal'
    sections: 2, // 2 or 3
    // Image can span multiple cells as a layer (array of cell indices)
    // Empty array = no image, [0] = first cell, [0,1] = spans first two, etc.
    imageCells: [0], // which cells the image covers
    textAlign: 'center', // 'left' | 'center' | 'right' - global fallback
    textVerticalAlign: 'center', // 'start' | 'center' | 'end' - global fallback
    // Per-cell alignment overrides (index 0 = first section, etc.)
    cellAlignments: [
      { textAlign: null, textVerticalAlign: null }, // null = use global
      { textAlign: null, textVerticalAlign: null },
      { textAlign: null, textVerticalAlign: null },
    ],
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

  platform: 'linkedin',
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

  const setImageGrayscale = useCallback((imageGrayscale) => {
    setState((prev) => ({ ...prev, imageGrayscale }))
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
    setImageGrayscale,
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
    setPlatform,
    resetState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  }
}
