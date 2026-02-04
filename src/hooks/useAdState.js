import { useCallback } from 'react'
import { presetThemes } from '../config/themes'
import { getLookSettingsForLayout } from '../config/stylePresets'
import { useHistory } from './useHistory'

const defaultTheme = presetThemes[0] // Dark theme

export const defaultState = {
  // Track active style preset (null = custom/no preset)
  activeStylePreset: null,
  // Track active layout preset ID (null = custom/no preset)
  activeLayoutPreset: 'hero',

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
    overlay: {
      type: 'solid',
      color: 'primary',
      opacity: 0,
    },
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
    imageCells: [0], // Array of cell indices that contain images
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
        overlay: { ...prev.defaultImageSettings.overlay },
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
        if (newCellImages[cellIndex] === imageId) {
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

  // Update overlay for an image
  const updateImageOverlay = useCallback((imageId, overlay) => {
    setState((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.id === imageId
          ? { ...img, overlay: { ...img.overlay, ...overlay } }
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

  // Helper to count cells in a layout structure
  const countCells = (structure) => {
    if (!structure || structure.length === 0) return 1
    return structure.reduce((total, section) => total + (section.subdivisions || 1), 0)
  }

  const setLayout = useCallback((updates) => {
    setState((prev) => {
      const newLayout = { ...prev.layout, ...updates }
      const newCellCount = countCells(newLayout.structure)

      // Clean up stale cell assignments when cell count decreases
      // Filter out textCells, cellImages, cellAlignments, cellOverrides, cellFrames that reference non-existent cells
      const cleanTextCells = { ...prev.textCells }
      Object.keys(cleanTextCells).forEach((key) => {
        if (cleanTextCells[key] !== null && cleanTextCells[key] >= newCellCount) {
          cleanTextCells[key] = null // Reset to auto
        }
      })

      const cleanCellImages = { ...prev.cellImages }
      Object.keys(cleanCellImages).forEach((cellIndex) => {
        if (parseInt(cellIndex) >= newCellCount) {
          delete cleanCellImages[cellIndex]
        }
      })

      const cleanCellAlignments = (newLayout.cellAlignments || []).slice(0, newCellCount)

      const cleanCellOverlays = { ...newLayout.cellOverlays }
      Object.keys(cleanCellOverlays).forEach((cellIndex) => {
        if (parseInt(cellIndex) >= newCellCount) {
          delete cleanCellOverlays[cellIndex]
        }
      })

      const cleanPaddingOverrides = { ...prev.padding.cellOverrides }
      Object.keys(cleanPaddingOverrides).forEach((cellIndex) => {
        if (parseInt(cellIndex) >= newCellCount) {
          delete cleanPaddingOverrides[cellIndex]
        }
      })

      const cleanCellFrames = { ...prev.frame.cellFrames }
      Object.keys(cleanCellFrames).forEach((cellIndex) => {
        if (parseInt(cellIndex) >= newCellCount) {
          delete cleanCellFrames[cellIndex]
        }
      })

      return {
        ...prev,
        layout: { ...newLayout, cellAlignments: cleanCellAlignments, cellOverlays: cleanCellOverlays },
        textCells: cleanTextCells,
        cellImages: cleanCellImages,
        padding: { ...prev.padding, cellOverrides: cleanPaddingOverrides },
        frame: { ...prev.frame, cellFrames: cleanCellFrames },
        // Clear active layout preset since user is customizing
        activeLayoutPreset: null,
      }
    })
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

  // Apply a look preset (fonts, overlay, alignment, filters)
  // Uses layout-aware settings based on the active layout preset
  // Preserves: theme, layout structure, image, logo, text content, platform
  const applyStylePreset = useCallback((preset) => {
    if (!preset) return

    setState((prev) => {
      // Get layout-specific settings for this look
      // Use active layout preset ID, or default to 'hero' if none
      const layoutId = prev.activeLayoutPreset || 'hero'
      const settings = getLookSettingsForLayout(preset.id, layoutId)

      if (!settings) return prev

      // Apply overlay and filters to all images
      // Looks only affect visual styling (fonts, filters, overlay)
      // Text alignment is controlled entirely by the layout preset
      const updatedImages = prev.images.map(img => ({
        ...img,
        // Apply image filters from preset
        filters: settings.imageFilters ? {
          grayscale: settings.imageFilters.grayscale ?? img.filters?.grayscale ?? 0,
          sepia: settings.imageFilters.sepia ?? img.filters?.sepia ?? 0,
          blur: settings.imageFilters.blur ?? img.filters?.blur ?? 0,
          contrast: settings.imageFilters.contrast ?? img.filters?.contrast ?? 100,
          brightness: settings.imageFilters.brightness ?? img.filters?.brightness ?? 100,
        } : img.filters,
        // Apply overlay from preset (layout-aware)
        overlay: settings.imageOverlay ? {
          type: settings.imageOverlay.type,
          color: settings.imageOverlay.color,
          opacity: settings.imageOverlay.opacity,
        } : img.overlay,
      }))

      return {
        ...prev,
        activeStylePreset: preset.id,
        // Apply fonts only - alignment is controlled by layout preset
        fonts: settings.fonts ? {
          title: settings.fonts.title,
          body: settings.fonts.body,
        } : prev.fonts,
        // Apply filters and overlay to images
        images: updatedImages,
      }
    })
  }, [])

  // Clear style preset tracking (called when user customizes something)
  const clearStylePreset = useCallback(() => {
    setState((prev) => ({ ...prev, activeStylePreset: null }))
  }, [])

  // Apply a layout preset (layout structure + text cell placements)
  const applyLayoutPreset = useCallback((preset) => {
    if (!preset) return

    setState((prev) => {
      const newCellCount = countCells(preset.layout.structure)

      // Clean up cell images for cells that no longer exist
      const cleanCellImages = { ...prev.cellImages }
      Object.keys(cleanCellImages).forEach((cellIndex) => {
        if (parseInt(cellIndex) >= newCellCount) {
          delete cleanCellImages[cellIndex]
        }
      })

      // Clean up padding overrides
      const cleanPaddingOverrides = { ...prev.padding.cellOverrides }
      Object.keys(cleanPaddingOverrides).forEach((cellIndex) => {
        if (parseInt(cellIndex) >= newCellCount) {
          delete cleanPaddingOverrides[cellIndex]
        }
      })

      // Clean up cell frames
      const cleanCellFrames = { ...prev.frame.cellFrames }
      Object.keys(cleanCellFrames).forEach((cellIndex) => {
        if (parseInt(cellIndex) >= newCellCount) {
          delete cleanCellFrames[cellIndex]
        }
      })

      return {
        ...prev,
        // Track active layout preset ID for look-aware styling
        activeLayoutPreset: preset.id,
        // Apply layout settings
        layout: {
          ...preset.layout,
        },
        // Apply text cell placements (preset provides valid placements)
        textCells: preset.textCells ? {
          title: preset.textCells.title ?? null,
          tagline: preset.textCells.tagline ?? null,
          bodyHeading: preset.textCells.bodyHeading ?? null,
          bodyText: preset.textCells.bodyText ?? null,
          cta: preset.textCells.cta ?? null,
          footnote: preset.textCells.footnote ?? null,
        } : prev.textCells,
        cellImages: cleanCellImages,
        padding: { ...prev.padding, cellOverrides: cleanPaddingOverrides },
        frame: { ...prev.frame, cellFrames: cleanCellFrames },
      }
    })
  }, [])

  // Save current design to localStorage
  const saveDesign = useCallback((name = 'My Design') => {
    const design = {
      name,
      savedAt: new Date().toISOString(),
      state: state,
    }
    try {
      // Get existing designs or initialize empty array
      const existingDesigns = JSON.parse(localStorage.getItem('social-ad-creator-designs') || '[]')
      // Add new design with unique ID
      const newDesign = { id: `design-${Date.now()}`, ...design }
      existingDesigns.push(newDesign)
      localStorage.setItem('social-ad-creator-designs', JSON.stringify(existingDesigns))
      return { success: true, id: newDesign.id }
    } catch (error) {
      console.error('Failed to save design:', error)
      return { success: false, error: error.message }
    }
  }, [state])

  // Load a design from localStorage
  const loadDesign = useCallback((designId) => {
    try {
      const designs = JSON.parse(localStorage.getItem('social-ad-creator-designs') || '[]')
      const design = designs.find(d => d.id === designId)
      if (design && design.state) {
        setState(design.state)
        resetHistory()
        return { success: true }
      }
      return { success: false, error: 'Design not found' }
    } catch (error) {
      console.error('Failed to load design:', error)
      return { success: false, error: error.message }
    }
  }, [setState, resetHistory])

  // Get list of saved designs (without full state data for performance)
  const getSavedDesigns = useCallback(() => {
    try {
      const designs = JSON.parse(localStorage.getItem('social-ad-creator-designs') || '[]')
      return designs.map(d => ({
        id: d.id,
        name: d.name,
        savedAt: d.savedAt,
      }))
    } catch {
      return []
    }
  }, [])

  // Delete a saved design
  const deleteDesign = useCallback((designId) => {
    try {
      const designs = JSON.parse(localStorage.getItem('social-ad-creator-designs') || '[]')
      const filtered = designs.filter(d => d.id !== designId)
      localStorage.setItem('social-ad-creator-designs', JSON.stringify(filtered))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  return {
    state,
    // Image pool management
    addImage,
    removeImage,
    updateImage,
    updateImageFilters,
    updateImagePosition,
    updateImageOverlay,
    setCellImage,
    // Other media
    setLogo,
    setLogoPosition,
    setLogoSize,
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
    // Save/load
    saveDesign,
    loadDesign,
    getSavedDesigns,
    deleteDesign,
  }
}
