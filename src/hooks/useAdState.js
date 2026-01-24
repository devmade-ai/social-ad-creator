import { useCallback } from 'react'
import { presetThemes } from '../config/themes'
import { useHistory } from './useHistory'

const defaultTheme = presetThemes[0] // Dark theme

export const defaultState = {
  // Track active style preset (null = custom/no preset)
  activeStylePreset: null,

  // Media pool - all uploaded images with their settings
  // Each image: { id, src, name, fit, position, filters }
  images: [],

  // Per-cell image assignments (just the image ID)
  // { cellIndex: imageId }
  cellImages: {},

  // Default settings for new images
  defaultImageSettings: {
    fit: 'cover',
    position: { x: 50, y: 50 },
    filters: {
      grayscale: 0,
      sepia: 0,
      blur: 0,
      contrast: 100,
      brightness: 100,
    },
  },

  overlay: {
    type: 'solid',
    color: 'primary',
    opacity: 50,
  },

  text: {
    title: { content: 'Your Title Here', visible: true, color: 'secondary', size: 1, bold: true, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
    tagline: { content: 'Elevate your brand today', visible: true, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
    bodyHeading: { content: 'Why Choose Us', visible: true, color: 'secondary', size: 1, bold: true, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
    bodyText: { content: 'Transform your business with innovative solutions designed for success.', visible: true, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
    cta: { content: 'Learn More', visible: true, color: 'accent', size: 1, bold: true, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
    footnote: { content: '*Terms and conditions apply', visible: true, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
  },

  // Per-element cell placement (which cell each text element appears in)
  // null = auto (follows default behavior), number = specific cell index
  textCells: {
    title: null,
    tagline: null,
    bodyHeading: null,
    bodyText: null,
    cta: null,
    footnote: null,
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

  // Frame settings (colored border that uses percentage of padding)
  frame: {
    // Outer frame around entire canvas
    outer: { percent: 0, color: 'primary' },
    // Per-cell frames { cellIndex: { percent, color } }
    cellFrames: {},
  },

  platform: 'instagram-square',
}

export function useAdState() {
  const { state, setState, undo, redo, canUndo, canRedo, resetHistory } = useHistory(defaultState)

  // Add an image to the media pool with default settings
  const addImage = useCallback((src, name = 'Image') => {
    const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setState((prev) => ({
      ...prev,
      images: [...prev.images, {
        id,
        src,
        name,
        fit: prev.defaultImageSettings.fit,
        position: { ...prev.defaultImageSettings.position },
        filters: { ...prev.defaultImageSettings.filters },
      }],
    }))
    return id
  }, [setState])

  // Remove an image from the media pool (and any cell assignments)
  const removeImage = useCallback((imageId) => {
    setState((prev) => {
      // Remove from pool
      const newImages = prev.images.filter((img) => img.id !== imageId)
      // Remove from cell assignments
      const newCellImages = { ...prev.cellImages }
      Object.keys(newCellImages).forEach((cellIndex) => {
        if (newCellImages[cellIndex]?.imageId === imageId) {
          delete newCellImages[cellIndex]
        }
      })
      return { ...prev, images: newImages, cellImages: newCellImages }
    })
  }, [setState])

  // Assign an image to a cell (or remove assignment if imageId is null)
  const setCellImage = useCallback((cellIndex, imageId) => {
    setState((prev) => {
      const newCellImages = { ...prev.cellImages }
      if (imageId === null) {
        delete newCellImages[cellIndex]
      } else {
        newCellImages[cellIndex] = imageId
      }
      return { ...prev, cellImages: newCellImages }
    })
  }, [setState])

  // Update settings for an image in the library
  const updateImage = useCallback((imageId, updates) => {
    setState((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.id === imageId ? { ...img, ...updates } : img
      ),
    }))
  }, [setState])

  // Update filters for an image
  const updateImageFilters = useCallback((imageId, filters) => {
    setState((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.id === imageId
          ? { ...img, filters: { ...img.filters, ...filters } }
          : img
      ),
    }))
  }, [setState])

  // Update position for an image
  const updateImagePosition = useCallback((imageId, position) => {
    setState((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.id === imageId
          ? { ...img, position: { ...img.position, ...position } }
          : img
      ),
    }))
  }, [setState])

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

  const setTextCells = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      textCells: { ...prev.textCells, ...updates },
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
  }, [setState])

  // Update frame settings
  const setFrame = useCallback((frame) => {
    setState((prev) => ({ ...prev, frame: { ...prev.frame, ...frame } }))
  }, [setState])

  // Update outer frame
  const setOuterFrame = useCallback((outerFrame) => {
    setState((prev) => ({
      ...prev,
      frame: { ...prev.frame, outer: { ...prev.frame.outer, ...outerFrame } },
    }))
  }, [setState])

  // Update cell frame
  const setCellFrame = useCallback((cellIndex, frameConfig) => {
    setState((prev) => {
      const newCellFrames = { ...prev.frame.cellFrames }
      if (frameConfig === null) {
        delete newCellFrames[cellIndex]
      } else {
        newCellFrames[cellIndex] = { ...(newCellFrames[cellIndex] || {}), ...frameConfig }
      }
      return {
        ...prev,
        frame: { ...prev.frame, cellFrames: newCellFrames },
      }
    })
  }, [setState])

  const setPlatform = useCallback((platform) => {
    setState((prev) => ({ ...prev, platform }))
  }, [])

  const resetState = useCallback(() => {
    setState(defaultState)
  }, [])

  // Apply a complete style preset (theme, fonts, layout, overlay, filters, textCells)
  // Preserves: image, logo, text content, platform
  const applyStylePreset = useCallback((preset) => {
    if (!preset || !preset.settings) return

    const { settings } = preset

    setState((prev) => ({
      ...prev,
      activeStylePreset: preset.id,
      // Apply theme
      theme: settings.theme ? {
        preset: settings.theme.preset,
        primary: settings.theme.primary,
        secondary: settings.theme.secondary,
        accent: settings.theme.accent,
      } : prev.theme,
      // Apply fonts
      fonts: settings.fonts ? {
        title: settings.fonts.title,
        body: settings.fonts.body,
      } : prev.fonts,
      // Apply layout
      layout: settings.layout ? {
        ...settings.layout,
      } : prev.layout,
      // Apply overlay
      overlay: settings.overlay ? {
        type: settings.overlay.type,
        color: settings.overlay.color,
        opacity: settings.overlay.opacity,
      } : prev.overlay,
      // Apply image filters (preserve grayscale - user controls this independently)
      imageFilters: settings.imageFilters ? {
        grayscale: prev.imageFilters.grayscale,
        sepia: settings.imageFilters.sepia,
        blur: settings.imageFilters.blur,
        contrast: settings.imageFilters.contrast,
        brightness: settings.imageFilters.brightness,
      } : prev.imageFilters,
      // Apply text cell placements
      textCells: settings.textCells ? {
        title: settings.textCells.title ?? null,
        tagline: settings.textCells.tagline ?? null,
        bodyHeading: settings.textCells.bodyHeading ?? null,
        bodyText: settings.textCells.bodyText ?? null,
        cta: settings.textCells.cta ?? null,
        footnote: settings.textCells.footnote ?? null,
      } : prev.textCells,
    }))
  }, [])

  // Clear style preset tracking (called when user customizes something)
  const clearStylePreset = useCallback(() => {
    setState((prev) => ({ ...prev, activeStylePreset: null }))
  }, [])

  // Apply a layout preset (layout structure + text cell placements)
  const applyLayoutPreset = useCallback((preset) => {
    if (!preset) return

    setState((prev) => ({
      ...prev,
      // Apply layout settings
      layout: {
        ...preset.layout,
      },
      // Apply text cell placements
      textCells: preset.textCells ? {
        title: preset.textCells.title ?? null,
        tagline: preset.textCells.tagline ?? null,
        bodyHeading: preset.textCells.bodyHeading ?? null,
        bodyText: preset.textCells.bodyText ?? null,
        cta: preset.textCells.cta ?? null,
        footnote: preset.textCells.footnote ?? null,
      } : prev.textCells,
    }))
  }, [])

  return {
    state,
    // Image pool management
    addImage,
    removeImage,
    updateImage,
    updateImageFilters,
    updateImagePosition,
    setCellImage,
    // Other media
    setLogo,
    setLogoPosition,
    setLogoSize,
    setOverlay,
    setText,
    setTextCells,
    setLayout,
    setTheme,
    setThemePreset,
    setFonts,
    setPadding,
    setFrame,
    setOuterFrame,
    setCellFrame,
    setPlatform,
    resetState,
    applyStylePreset,
    clearStylePreset,
    applyLayoutPreset,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  }
}
