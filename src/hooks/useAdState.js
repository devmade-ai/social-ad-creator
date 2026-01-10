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
    title: { content: 'Your Title Here', visible: true, color: 'secondary' },
    tagline: { content: '', visible: true, color: 'secondary' },
    bodyHeading: { content: '', visible: true, color: 'secondary' },
    bodyText: { content: '', visible: true, color: 'secondary' },
    cta: { content: 'Learn More', visible: true, color: 'accent' },
    footnote: { content: '', visible: true, color: 'secondary' },
  },

  layout: 'fullbleed-center',

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

  const setLayout = useCallback((layout) => {
    setState((prev) => ({ ...prev, layout }))
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
