import { useState, useCallback } from 'react'
import { presetThemes } from '../config/themes'

const defaultTheme = presetThemes[0] // Dark theme

const defaultState = {
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
    tagline: { content: '', visible: true, color: 'secondary', size: 1 },
    bodyHeading: { content: '', visible: true, color: 'secondary', size: 1 },
    bodyText: { content: '', visible: true, color: 'secondary', size: 1 },
    cta: { content: 'Learn More', visible: true, color: 'accent', size: 1 },
    footnote: { content: '', visible: true, color: 'secondary', size: 1 },
  },

  logo: null,
  logoPosition: 'bottom-right',
  logoSize: 0.15, // 15% of canvas width

  // New flexible layout system
  layout: {
    splitType: 'none', // 'none' | 'vertical' | 'horizontal'
    sections: 2, // 2 or 3
    imagePosition: 'first', // 'first' | 'middle' | 'last'
    imageProportion: 50, // percentage for image section(s)
    textOnImage: false, // overlay text on image section
    textAlign: 'center', // 'left' | 'center' | 'right'
    textVerticalAlign: 'center', // 'start' | 'center' | 'end'
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
  const [state, setState] = useState(defaultState)

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
    setLayout,
    setTheme,
    setThemePreset,
    setFonts,
    setPlatform,
    resetState,
  }
}
