// Requirement: Central state management for multi-page design tool.
// Approach: Single useHistory-backed state object with page swap on active page change.
//   Active page data lives at top-level (state.layout, state.text, etc.) so components
//   don't need to know about pages. Inactive pages stored in state.pages[] as snapshots.
// Alternatives:
//   - Separate state per page: Rejected - shared fields (theme, fonts, platform) would
//     need cross-page sync logic, and undo/redo would only cover the active page.
//   - Redux/Zustand: Rejected - adds dependency for a single-page app with no async state.
import { useCallback } from 'react'
import { presetThemes } from '../config/themes'
import { getLookSettingsForLayout } from '../config/stylePresets'
import { useHistory } from './useHistory'
import { countCells, cleanupOrphanedCells } from '../utils/cellUtils'

const defaultTheme = presetThemes[0] // Dark theme
const STORAGE_KEY = 'canvagrid-designs'

// Fields that are unique per page (swapped in/out when switching pages).
// Everything NOT listed here is shared across all pages (theme, fonts, platform, logo).
const PAGE_FIELDS = [
  'activeStylePreset', 'activeLayoutPreset',
  'images', 'cellImages', 'defaultImageSettings',
  'text', 'textCells',
  'layout',
  'padding', 'frame',
  'textMode', 'freeformText',
]

function extractPageData(state) {
  const data = {}
  PAGE_FIELDS.forEach(field => {
    if (state[field] !== undefined) data[field] = JSON.parse(JSON.stringify(state[field]))
  })
  return data
}

const defaultPageData = {
  activeStylePreset: null,
  activeLayoutPreset: 'quad-grid',
  images: [],
  cellImages: {},
  defaultImageSettings: {
    fit: 'cover',
    position: { x: 50, y: 50 },
    filters: { grayscale: 0, sepia: 0, blur: 0, contrast: 100, brightness: 100 },
    overlay: { type: 'solid', color: 'primary', opacity: 0 },
  },
  text: {
    title: { content: '', visible: true, color: 'secondary', size: 1, bold: true, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
    tagline: { content: '', visible: false, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
    bodyHeading: { content: '', visible: false, color: 'secondary', size: 1, bold: true, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
    bodyText: { content: '', visible: false, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
    cta: { content: '', visible: false, color: 'accent', size: 1, bold: true, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
    footnote: { content: '', visible: false, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
  },
  textCells: { title: 1, tagline: 1, bodyHeading: 2, bodyText: 2, cta: 2, footnote: 2 },
  layout: {
    type: 'rows',
    structure: [
      { size: 50, subdivisions: 2, subSizes: [50, 50] },
      { size: 50, subdivisions: 2, subSizes: [50, 50] },
    ],
    imageCells: [0, 3],
    textAlign: 'center',
    textVerticalAlign: 'center',
    cellAlignments: [
      { textAlign: 'center', textVerticalAlign: 'center' },
      { textAlign: 'center', textVerticalAlign: 'center' },
      { textAlign: 'center', textVerticalAlign: 'center' },
      { textAlign: 'center', textVerticalAlign: 'center' },
    ],
    cellOverlays: {},
  },
  padding: { global: 20, cellOverrides: {} },
  frame: { outer: { percent: 0, color: 'primary' }, cellFrames: {} },
  textMode: 'structured',
  freeformText: {},
}

export const defaultState = {
  activeStylePreset: null,
  activeLayoutPreset: 'quad-grid',

  images: [],

  cellImages: {},

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

  textCells: {
    title: 1,
    tagline: 1,
    bodyHeading: 2,
    bodyText: 2,
    cta: 2,
    footnote: 2,
  },

  logo: null,
  logoPosition: 'bottom-right',
  logoSize: 0.15,

  layout: {
    type: 'rows',
    structure: [
      { size: 50, subdivisions: 2, subSizes: [50, 50] },
      { size: 50, subdivisions: 2, subSizes: [50, 50] },
    ],
    imageCells: [0, 3],
    textAlign: 'center',
    textVerticalAlign: 'center',
    cellAlignments: [
      { textAlign: 'center', textVerticalAlign: 'center' },
      { textAlign: 'center', textVerticalAlign: 'center' },
      { textAlign: 'center', textVerticalAlign: 'center' },
      { textAlign: 'center', textVerticalAlign: 'center' },
    ],
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

  padding: {
    global: 20,
    cellOverrides: {},
  },

  frame: {
    outer: { percent: 0, color: 'primary' },
    cellFrames: {},
  },

  platform: 'instagram-square',
  exportFormat: 'png',

  // pages[activePage] = null because active page data lives at top-level state
  // (so existing components read state.layout, state.text etc. without knowing about pages)
  // pages[otherIndex] = { layout, text, images, ... } for inactive pages
  pages: [null],
  activePage: 0,

  textMode: 'structured',
  freeformText: {},
}

export function useAdState() {
  const { state, setState, undo, redo, canUndo, canRedo, resetHistory } = useHistory(defaultState)

  const addImage = useCallback((src, name = 'Image', targetCell = null) => {
    const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setState((prev) => {
      // If there's an active look, apply its filters/overlay to the new image
      let filters = { ...prev.defaultImageSettings.filters }
      let overlay = { ...prev.defaultImageSettings.overlay }

      if (prev.activeStylePreset) {
        const layoutId = prev.activeLayoutPreset || 'hero'
        const lookSettings = getLookSettingsForLayout(prev.activeStylePreset, layoutId)
        if (lookSettings) {
          if (lookSettings.imageFilters) {
            filters = { ...filters, ...lookSettings.imageFilters }
          }
          if (lookSettings.imageOverlay) {
            overlay = {
              type: lookSettings.imageOverlay.type,
              color: lookSettings.imageOverlay.color,
              opacity: lookSettings.imageOverlay.opacity,
            }
          }
        }
      }

      const newImages = [...prev.images, {
        id,
        src,
        name,
        fit: prev.defaultImageSettings.fit,
        position: { ...prev.defaultImageSettings.position },
        filters,
        overlay,
      }]

      const newCellImages = { ...prev.cellImages }

      if (targetCell !== null) {
        // Assign to the explicitly requested cell
        newCellImages[targetCell] = id
      } else {
        // Auto-assign to first unoccupied image cell
        const imageCells = prev.layout.imageCells || [0]
        for (const cellIndex of imageCells) {
          if (!newCellImages[cellIndex]) {
            newCellImages[cellIndex] = id
            break
          }
        }
      }

      return { ...prev, images: newImages, cellImages: newCellImages }
    })
    return id
  }, [setState])

  const removeImage = useCallback((imageId) => {
    setState((prev) => {
      const newImages = prev.images.filter((img) => img.id !== imageId)
      const newCellImages = { ...prev.cellImages }
      Object.keys(newCellImages).forEach((cellIndex) => {
        if (newCellImages[cellIndex] === imageId) {
          delete newCellImages[cellIndex]
        }
      })
      return { ...prev, images: newImages, cellImages: newCellImages }
    })
  }, [setState])

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

  const updateImage = useCallback((imageId, updates) => {
    setState((prev) => ({
      ...prev,
      images: prev.images.map((img) =>
        img.id === imageId ? { ...img, ...updates } : img
      ),
    }))
  }, [setState])

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

  // Requirement: Changing layout structure must not leave orphaned cell references.
  // Approach: On every layout update, clean up textCells, cellImages, cellAlignments,
  //   cellOverlays, padding overrides, cell frames, and freeformText that reference
  //   cells beyond the new cell count. Uses shared cleanupOrphanedCells utility.
  // Alternatives:
  //   - Lazy cleanup on render: Rejected - would cause subtle bugs when rendering stale refs.
  //   - Separate cleanup action: Rejected - user could forget; automatic is safer.
  const setLayout = useCallback((updates) => {
    setState((prev) => {
      const newLayout = { ...prev.layout, ...updates }
      const newCellCount = countCells(newLayout.structure)
      const cleaned = cleanupOrphanedCells(prev, newCellCount)

      const cleanCellAlignments = (newLayout.cellAlignments || []).slice(0, newCellCount)
      const cleanCellOverlays = { ...newLayout.cellOverlays }
      Object.keys(cleanCellOverlays).forEach((cellIndex) => {
        if (parseInt(cellIndex) >= newCellCount) {
          delete cleanCellOverlays[cellIndex]
        }
      })

      return {
        ...prev,
        layout: { ...newLayout, cellAlignments: cleanCellAlignments, cellOverlays: cleanCellOverlays },
        textCells: cleaned.textCells,
        cellImages: cleaned.cellImages,
        padding: { ...prev.padding, cellOverrides: cleaned.paddingOverrides },
        frame: { ...prev.frame, cellFrames: cleaned.cellFrames },
        freeformText: cleaned.freeformText,
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

  const setFrame = useCallback((frame) => {
    setState((prev) => ({ ...prev, frame: { ...prev.frame, ...frame } }))
  }, [setState])

  const setOuterFrame = useCallback((outerFrame) => {
    setState((prev) => ({
      ...prev,
      frame: { ...prev.frame, outer: { ...prev.frame.outer, ...outerFrame } },
    }))
  }, [setState])

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
  }, [setState])

  const setExportFormat = useCallback((exportFormat) => {
    setState((prev) => ({ ...prev, exportFormat }))
  }, [setState])

  const resetState = useCallback(() => {
    setState(defaultState)
  }, [])

  const applyStylePreset = useCallback((preset) => {
    if (!preset) return

    setState((prev) => {
      const layoutId = prev.activeLayoutPreset || 'hero'
      const settings = getLookSettingsForLayout(preset.id, layoutId)

      if (!settings) return prev

      const updatedImages = prev.images.map(img => ({
        ...img,
        filters: settings.imageFilters ? {
          grayscale: settings.imageFilters.grayscale ?? img.filters?.grayscale ?? 0,
          sepia: settings.imageFilters.sepia ?? img.filters?.sepia ?? 0,
          blur: settings.imageFilters.blur ?? img.filters?.blur ?? 0,
          contrast: settings.imageFilters.contrast ?? img.filters?.contrast ?? 100,
          brightness: settings.imageFilters.brightness ?? img.filters?.brightness ?? 100,
        } : img.filters,
        overlay: settings.imageOverlay ? {
          type: settings.imageOverlay.type,
          color: settings.imageOverlay.color,
          opacity: settings.imageOverlay.opacity,
        } : img.overlay,
      }))

      return {
        ...prev,
        activeStylePreset: preset.id,
        fonts: settings.fonts ? {
          title: settings.fonts.title,
          body: settings.fonts.body,
        } : prev.fonts,
        images: updatedImages,
      }
    })
  }, [])

  const clearStylePreset = useCallback(() => {
    setState((prev) => ({ ...prev, activeStylePreset: null }))
  }, [])

  const applyLayoutPreset = useCallback((preset) => {
    if (!preset) return

    setState((prev) => {
      const newCellCount = countCells(preset.layout.structure)
      const cleaned = cleanupOrphanedCells(prev, newCellCount)

      return {
        ...prev,
        activeLayoutPreset: preset.id,
        layout: {
          ...preset.layout,
        },
        textCells: preset.textCells ? {
          title: preset.textCells.title ?? null,
          tagline: preset.textCells.tagline ?? null,
          bodyHeading: preset.textCells.bodyHeading ?? null,
          bodyText: preset.textCells.bodyText ?? null,
          cta: preset.textCells.cta ?? null,
          footnote: preset.textCells.footnote ?? null,
        } : prev.textCells,
        cellImages: cleaned.cellImages,
        padding: { ...prev.padding, cellOverrides: cleaned.paddingOverrides },
        frame: { ...prev.frame, cellFrames: cleaned.cellFrames },
      }
    })
  }, [])

  const setActivePage = useCallback((newIndex) => {
    setState((prev) => {
      const pages = prev.pages || [null]
      if (newIndex < 0 || newIndex >= pages.length || newIndex === prev.activePage) return prev

      const currentPageData = extractPageData(prev)
      const newPages = [...pages]
      newPages[prev.activePage] = currentPageData

      const targetPageData = newPages[newIndex]
      newPages[newIndex] = null

      return {
        ...prev,
        ...targetPageData,
        pages: newPages,
        activePage: newIndex,
      }
    })
  }, [setState])

  const addPage = useCallback(() => {
    setState((prev) => {
      const pages = prev.pages || [null]
      const currentPageData = extractPageData(prev)

      const newPages = [...pages]
      newPages[prev.activePage] = currentPageData
      const insertIndex = prev.activePage + 1
      newPages.splice(insertIndex, 0, null)

      return {
        ...prev,
        ...JSON.parse(JSON.stringify(defaultPageData)),
        pages: newPages,
        activePage: insertIndex,
      }
    })
  }, [setState])

  const duplicatePage = useCallback(() => {
    setState((prev) => {
      const pages = prev.pages || [null]
      const currentPageData = extractPageData(prev)

      const newPages = [...pages]
      newPages[prev.activePage] = currentPageData
      const insertIndex = prev.activePage + 1
      newPages.splice(insertIndex, 0, null)

      const duplicateData = JSON.parse(JSON.stringify(currentPageData))

      return {
        ...prev,
        ...duplicateData,
        pages: newPages,
        activePage: insertIndex,
      }
    })
  }, [setState])

  const removePage = useCallback((index) => {
    setState((prev) => {
      const pages = prev.pages || [null]
      if (pages.length <= 1) return prev // Can't remove last page

      const newPages = [...pages]

      if (index === prev.activePage) {
        const newActiveIndex = index > 0 ? index - 1 : 0
        const currentPageData = extractPageData(prev)
        newPages[prev.activePage] = currentPageData

        newPages.splice(index, 1)

        const adjustedIndex = index > 0 ? index - 1 : 0
        const targetData = newPages[adjustedIndex]
        newPages[adjustedIndex] = null

        return {
          ...prev,
          ...(targetData || {}),
          pages: newPages,
          activePage: adjustedIndex,
        }
      } else {
        newPages.splice(index, 1)
        const newActivePage = index < prev.activePage ? prev.activePage - 1 : prev.activePage

        return {
          ...prev,
          pages: newPages,
          activePage: newActivePage,
        }
      }
    })
  }, [setState])

  const movePage = useCallback((fromIndex, toIndex) => {
    setState((prev) => {
      const pages = prev.pages || [null]
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 ||
          fromIndex >= pages.length || toIndex >= pages.length) return prev

      const newPages = [...pages]
      const [moved] = newPages.splice(fromIndex, 1)
      newPages.splice(toIndex, 0, moved)

      let newActivePage = prev.activePage
      if (prev.activePage === fromIndex) {
        newActivePage = toIndex
      } else if (fromIndex < prev.activePage && toIndex >= prev.activePage) {
        newActivePage = prev.activePage - 1
      } else if (fromIndex > prev.activePage && toIndex <= prev.activePage) {
        newActivePage = prev.activePage + 1
      }

      return {
        ...prev,
        pages: newPages,
        activePage: newActivePage,
      }
    })
  }, [setState])

  const getPageCount = useCallback(() => {
    return (state.pages || [null]).length
  }, [state.pages])

  const getPageState = useCallback((index) => {
    const pages = state.pages || [null]
    if (index === state.activePage) {
      return state
    }
    const pageData = pages[index]
    if (!pageData) return null
    return {
      ...pageData,
      theme: state.theme,
      fonts: state.fonts,
      platform: state.platform,
      logo: state.logo,
      logoPosition: state.logoPosition,
      logoSize: state.logoSize,
    }
  }, [state])

  const setTextMode = useCallback((mode) => {
    setState((prev) => ({ ...prev, textMode: mode }))
  }, [setState])

  const setFreeformText = useCallback((cellIndex, updates) => {
    setState((prev) => ({
      ...prev,
      freeformText: {
        ...(prev.freeformText || {}),
        [cellIndex]: {
          ...(prev.freeformText?.[cellIndex] || {
            content: '',
            color: 'secondary',
            size: 1,
            bold: false,
            italic: false,
            letterSpacing: 0,
            textAlign: null,
          }),
          ...updates,
        },
      },
    }))
  }, [setState])

  const saveDesign = useCallback((name = 'My Design') => {
    const pages = state.pages || [null]
    const syncedPages = [...pages]
    syncedPages[state.activePage] = extractPageData(state)

    const design = {
      name,
      savedAt: new Date().toISOString(),
      state: { ...state, pages: syncedPages },
    }
    try {
      const existingDesigns = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const newDesign = { id: `design-${Date.now()}`, ...design }
      existingDesigns.push(newDesign)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingDesigns))
      return { success: true, id: newDesign.id }
    } catch (error) {
      console.error('Failed to save design:', error)
      return { success: false, error: error.message }
    }
  }, [state])

  const loadDesign = useCallback((designId) => {
    try {
      const designs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const design = designs.find(d => d.id === designId)
      if (design && design.state) {
        const loadedState = { ...design.state }
        // saveDesign syncs all pages to non-null, so restore the active one to top-level
        const activePage = loadedState.activePage || 0
        if (loadedState.pages[activePage] !== null) {
          const pageData = loadedState.pages[activePage]
          Object.assign(loadedState, pageData)
          loadedState.pages[activePage] = null
        }
        setState(loadedState)
        resetHistory()
        return { success: true }
      }
      return { success: false, error: 'Design not found' }
    } catch (error) {
      console.error('Failed to load design:', error)
      return { success: false, error: error.message }
    }
  }, [setState, resetHistory])

  const getSavedDesigns = useCallback(() => {
    try {
      const designs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      return designs.map(d => ({
        id: d.id,
        name: d.name,
        savedAt: d.savedAt,
      }))
    } catch {
      return []
    }
  }, [])

  const deleteDesign = useCallback((designId) => {
    try {
      const designs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const filtered = designs.filter(d => d.id !== designId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  return {
    state,
    addImage,
    removeImage,
    updateImage,
    updateImageFilters,
    updateImagePosition,
    updateImageOverlay,
    setCellImage,
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
    setExportFormat,
    resetState,
    applyStylePreset,
    clearStylePreset,
    applyLayoutPreset,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
    saveDesign,
    loadDesign,
    getSavedDesigns,
    deleteDesign,
    setActivePage,
    addPage,
    duplicatePage,
    removePage,
    movePage,
    getPageCount,
    getPageState,
    setTextMode,
    setFreeformText,
  }
}
