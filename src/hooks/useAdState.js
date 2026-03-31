// Requirement: Central state management for multi-page design tool.
// Approach: Single useHistory-backed state object with page swap on active page change.
//   Active page data lives at top-level (state.layout, state.text, etc.) so components
//   don't need to know about pages. Inactive pages stored in state.pages[] as snapshots.
// Alternatives:
//   - Separate state per page: Rejected - shared fields (theme, fonts, platform) would
//     need cross-page sync logic, and undo/redo would only cover the active page.
//   - Redux/Zustand: Rejected - adds dependency for a single-page app with no async state.
import { useCallback, useEffect, useRef } from 'react'
import { presetThemes, getThemeVariant, resolveThemePreset } from '../config/themes'
import { getLookSettingsForLayout } from '../config/stylePresets'
import { useHistory } from './useHistory'
import { countCells, cleanupOrphanedCells, shiftCellIndices, swapCellIndices, shiftLayoutCellData, swapLayoutCellData } from '../utils/cellUtils'
import { createFreeformBlock } from '../config/textDefaults'
import * as designStorage from '../utils/designStorage'
import { debugLog } from '../utils/debugLog'

// Requirement: Default theme uses first preset's default variant (neutral/dark).
// Approach: Resolve variant colors from the structured theme definition.
const defaultThemeEntry = presetThemes[0] // Neutral theme
const defaultThemeColors = getThemeVariant(defaultThemeEntry, defaultThemeEntry.defaultVariant)

// Element IDs for structured text (used in legacy migration and look preset text style application)
const TEXT_ELEMENT_IDS = ['title', 'tagline', 'bodyHeading', 'bodyText', 'cta', 'footnote']

// Requirement: Migrate old global text format for the one-time localStorage→IndexedDB transfer.
// This runs during migration only, not on every load. After migration, designs in IndexedDB
// are already in the per-cell format.
function migrateTextForStorage(stateObj) {
  if (!stateObj.text) return
  const hasOldFormat = TEXT_ELEMENT_IDS.some((id) => stateObj.text[id] && typeof stateObj.text[id] === 'object' && 'content' in stateObj.text[id])
  if (!hasOldFormat) return

  // Requirement: One-time legacy migration — place text on cell 0 by default
  // Approach: Use textCells assignments if present, otherwise default to cell 0
  const oldText = stateObj.text
  const textCells = stateObj.textCells || {}
  const newText = {}
  const autoAssign = { title: 0, tagline: 0, cta: 0, bodyHeading: 0, bodyText: 0, footnote: 0 }

  for (const elementId of TEXT_ELEMENT_IDS) {
    const elementData = oldText[elementId]
    if (!elementData) continue
    const cellIndex = textCells[elementId] ?? autoAssign[elementId] ?? 0
    if (!newText[cellIndex]) newText[cellIndex] = {}
    newText[cellIndex][elementId] = { ...elementData }
  }

  stateObj.text = newText
  delete stateObj.textCells

  // Migrate inactive pages too
  if (stateObj.pages) {
    stateObj.pages.forEach((page) => {
      if (page) {
        migrateTextForStorage(page)
        delete page.textCells
      }
    })
  }
}

// Fields that are unique per page (swapped in/out when switching pages).
// Everything NOT listed here is shared across all pages (theme, fonts, platform, logo).
const PAGE_FIELDS = [
  'activeStylePreset', 'activeLayoutPreset',
  'images', 'cellImages', 'defaultImageSettings',
  'text',
  'layout',
  'padding', 'frame',
  'textMode', 'freeformText',
]

function extractPageData(state) {
  const data = {}
  PAGE_FIELDS.forEach(field => {
    if (state[field] !== undefined) {
      try {
        data[field] = structuredClone(state[field])
      } catch {
        // Fallback to JSON round-trip if structuredClone fails on non-cloneable data
        // (e.g., DOM refs, Blobs that leaked into state). Preserves page swap stability.
        try {
          data[field] = JSON.parse(JSON.stringify(state[field]))
        } catch {
          data[field] = state[field]
        }
      }
    }
  })
  return data
}

// Requirement: Default to split-horizontal (2 rows: image top, text bottom) for simplicity
// Approach: Simple 2-cell layout is less overwhelming for first-time users than quad-grid
// Alternatives:
//   - quad-grid (4 cells): Rejected — too complex for initial experience, confuses new users
//   - hero (fullbleed): Rejected — user wanted split-horizontal specifically
// Requirement: Default to 'clean' look so new users see a polished starting state
// Approach: 'clean' is the most neutral look (Inter/Inter, minimal overlay) — barely
//   different from no look, but means switching looks feels like a lateral move
// Alternatives:
//   - null (no look): Rejected — blank canvas feels unfinished, switching looks feels
//     like "turning on a feature" rather than exploring options
//   - A WP-era look: Rejected — too opinionated as a universal default
const defaultPageData = {
  activeStylePreset: 'clean',
  activeLayoutPreset: 'split-horizontal',
  images: [],
  cellImages: {},
  defaultImageSettings: {
    fit: 'cover',
    position: { x: 50, y: 50 },
    filters: { grayscale: 0, sepia: 0, blur: 0, contrast: 100, brightness: 100 },
    overlay: { type: 'solid', color: 'primary', opacity: 0 },
  },
  text: {},
  layout: {
    type: 'rows',
    structure: [
      { size: 50, subdivisions: 1, subSizes: [100] },
      { size: 50, subdivisions: 1, subSizes: [100] },
    ],
    textAlign: 'center',
    textVerticalAlign: 'center',
    cellAlignments: [
      { textAlign: 'center', textVerticalAlign: 'center' },
      { textAlign: 'center', textVerticalAlign: 'center' },
    ],
    cellOverlays: {},
    cellBackgrounds: {},
  },
  padding: { global: 20, cellOverrides: {} },
  frame: { outer: { percent: 0, color: 'primary' }, cellFrames: {} },
  textMode: 'structured',
  freeformText: {},
}

export const defaultState = {
  activeStylePreset: 'clean',
  activeLayoutPreset: 'split-horizontal',

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

  // Requirement: Per-cell structured text — default text on cell 1
  // Approach: text[cellIndex] = { title: {...}, tagline: {...}, ... }
  text: {
    1: {
      title: { content: 'Your Title Here', visible: true, color: 'secondary', size: 1, bold: true, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
      tagline: { content: 'Elevate your brand today', visible: true, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
      bodyText: { content: 'Transform your business with innovative solutions designed for success.', visible: true, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
      cta: { content: 'Learn More', visible: true, color: 'accent', size: 1, bold: true, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
    },
  },

  logo: null,
  logoPosition: 'bottom-right',
  logoSize: 0.15,

  layout: {
    type: 'rows',
    structure: [
      { size: 50, subdivisions: 1, subSizes: [100] },
      { size: 50, subdivisions: 1, subSizes: [100] },
    ],
    textAlign: 'center',
    textVerticalAlign: 'center',
    cellAlignments: [
      { textAlign: 'center', textVerticalAlign: 'center' },
      { textAlign: 'center', textVerticalAlign: 'center' },
    ],
    cellOverlays: {},
    cellBackgrounds: {},
  },

  theme: {
    preset: defaultThemeEntry.id,
    variant: defaultThemeEntry.defaultVariant,
    primary: defaultThemeColors.primary,
    secondary: defaultThemeColors.secondary,
    accent: defaultThemeColors.accent,
  },

  fonts: {
    title: 'inter',
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

  // Requirement: Track whether addImage successfully assigned the image to a cell.
  // Approach: useRef flag set inside setState updater, read synchronously after setState.
  // Alternatives:
  //   - Return from setState updater: Rejected — React setState updaters can't return values.
  //   - Compute outside setState: Rejected — would need to duplicate cell-counting logic
  //     and risks race conditions with stale state.
  const wasAssignedRef = useRef(false)

  // Requirement: Store natural image dimensions for snap-to-fit feature.
  // Approach: Accept optional dimensions param { width, height } from upload handlers.
  // Alternatives:
  //   - Async Image() load inside addImage: Rejected — addImage is synchronous setState.
  //   - Lazy load on snap click: Rejected — storing up front is more reliable and enables future uses.
  const addImage = useCallback((src, name = 'Image', targetCell = null, dimensions = null) => {
    const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    wasAssignedRef.current = false
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
        ...(dimensions ? { naturalWidth: dimensions.width, naturalHeight: dimensions.height } : {}),
      }]

      const newCellImages = { ...prev.cellImages }

      if (targetCell !== null) {
        // Assign to the explicitly requested cell
        newCellImages[targetCell] = id
        wasAssignedRef.current = true
      } else {
        // Requirement: Auto-assign to first cell without an image
        // Approach: Iterate cells 0..n, assign to first unoccupied
        const totalCells = countCells(prev.layout.structure)
        for (let i = 0; i < totalCells; i++) {
          if (!newCellImages[i]) {
            newCellImages[i] = id
            wasAssignedRef.current = true
            break
          }
        }
      }

      return { ...prev, images: newImages, cellImages: newCellImages }
    })
    return { id, assigned: wasAssignedRef.current }
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
  }, [setState])

  const setLogoPosition = useCallback((logoPosition) => {
    setState((prev) => ({ ...prev, logoPosition }))
  }, [setState])

  const setLogoSize = useCallback((logoSize) => {
    setState((prev) => ({ ...prev, logoSize }))
  }, [setState])

  // Requirement: Per-cell structured text — setText now takes cellIndex
  // Approach: text[cellIndex][layer] = { ...updates }
  const setText = useCallback((cellIndex, layer, updates) => {
    setState((prev) => ({
      ...prev,
      text: {
        ...prev.text,
        [cellIndex]: {
          ...(prev.text?.[cellIndex] || {}),
          [layer]: { ...(prev.text?.[cellIndex]?.[layer] || {}), ...updates },
        },
      },
    }))
  }, [setState])

  // Requirement: Changing layout structure must not leave orphaned cell references.
  // Approach: On every layout update, shift cell-indexed data if cells were inserted/removed
  //   (via _cellShift metadata), then clean up orphaned references beyond the new cell count.
  // Alternatives:
  //   - Lazy cleanup on render: Rejected - would cause subtle bugs when rendering stale refs.
  //   - Separate cleanup action: Rejected - user could forget; automatic is safer.
  const setLayout = useCallback((updates) => {
    setState((prev) => {
      // Extract cell remap metadata (not stored in layout)
      const { _cellShift, _cellSwap, ...layoutUpdates } = updates
      const newLayout = { ...prev.layout, ...layoutUpdates }
      const newCellCount = countCells(newLayout.structure)

      // If cells were inserted/removed, remap indices first so content stays
      // with the correct visual cell. Then clean up any orphans beyond bounds.
      let stateForCleanup = prev
      if (_cellShift) {
        const { fromIndex, shiftBy } = _cellShift
        const shifted = shiftCellIndices(prev, fromIndex, shiftBy)

        // Shift layout-internal per-cell data (alignments, overlays, backgrounds)
        const shiftedLayoutData = shiftLayoutCellData(newLayout, fromIndex, shiftBy)
        newLayout.cellAlignments = shiftedLayoutData.cellAlignments
        newLayout.cellOverlays = shiftedLayoutData.cellOverlays
        newLayout.cellBackgrounds = shiftedLayoutData.cellBackgrounds

        // Build intermediate state with shifted data for cleanupOrphanedCells
        stateForCleanup = {
          ...prev,
          text: shifted.text,
          cellImages: shifted.cellImages,
          padding: { ...prev.padding, cellOverrides: shifted.paddingOverrides },
          frame: { ...prev.frame, cellFrames: shifted.cellFrames },
          freeformText: shifted.freeformText,
        }
      }

      // Requirement: Swapping sections must remap all per-cell data bidirectionally.
      // Approach: _cellSwap provides a complete oldIndex→newIndex map for affected cells.
      if (_cellSwap) {
        const swapped = swapCellIndices(stateForCleanup, _cellSwap)

        // Remap layout-internal per-cell data (alignments, overlays, backgrounds)
        const swappedLayoutData = swapLayoutCellData(newLayout, _cellSwap)
        newLayout.cellAlignments = swappedLayoutData.cellAlignments
        newLayout.cellOverlays = swappedLayoutData.cellOverlays
        newLayout.cellBackgrounds = swappedLayoutData.cellBackgrounds

        stateForCleanup = {
          ...stateForCleanup,
          text: swapped.text,
          cellImages: swapped.cellImages,
          padding: { ...stateForCleanup.padding, cellOverrides: swapped.paddingOverrides },
          frame: { ...stateForCleanup.frame, cellFrames: swapped.cellFrames },
          freeformText: swapped.freeformText,
        }
      }

      const cleaned = cleanupOrphanedCells(stateForCleanup, newCellCount)

      // For layout-internal fields, cleanup from newLayout (which includes user's updates)
      // rather than prev.layout (which cleanupOrphanedCells uses)
      const cleanCellAlignments = (newLayout.cellAlignments || []).slice(0, newCellCount)
      const cleanCellOverlays = { ...(newLayout.cellOverlays || {}) }
      Object.keys(cleanCellOverlays).forEach((cellIndex) => {
        if (parseInt(cellIndex, 10) >= newCellCount) {
          delete cleanCellOverlays[cellIndex]
        }
      })
      const cleanCellBackgrounds = { ...(newLayout.cellBackgrounds || {}) }
      Object.keys(cleanCellBackgrounds).forEach((cellIndex) => {
        if (parseInt(cellIndex, 10) >= newCellCount) {
          delete cleanCellBackgrounds[cellIndex]
        }
      })

      return {
        ...prev,
        layout: { ...newLayout, cellAlignments: cleanCellAlignments, cellOverlays: cleanCellOverlays, cellBackgrounds: cleanCellBackgrounds },
        text: cleaned.text,
        cellImages: cleaned.cellImages,
        padding: { ...prev.padding, cellOverrides: cleaned.paddingOverrides },
        frame: { ...prev.frame, cellFrames: cleaned.cellFrames },
        freeformText: cleaned.freeformText,
        activeLayoutPreset: null,
      }
    })
  }, [setState])

  const setTheme = useCallback((theme) => {
    setState((prev) => ({ ...prev, theme: { ...prev.theme, ...theme } }))
  }, [setState])

  // Requirement: Apply theme preset with variant support.
  // Approach: Accepts optional variant param. If omitted, uses the current variant
  //   (preserving user's light/dark preference when switching themes), falling back
  //   to the theme's defaultVariant.
  const setThemePreset = useCallback((presetId, variant = null) => {
    const preset = presetThemes.find((t) => t.id === presetId)
    if (preset) {
      setState((prev) => {
        const resolvedVariant = variant || prev.theme?.variant || preset.defaultVariant
        const colors = getThemeVariant(preset, resolvedVariant)
        return {
          ...prev,
          theme: {
            preset: preset.id,
            variant: resolvedVariant,
            primary: colors.primary,
            secondary: colors.secondary,
            accent: colors.accent,
          },
        }
      })
    }
  }, [setState])

  // Requirement: Toggle between light/dark variant for the current theme.
  // Approach: Resolves current theme from presetThemes, applies the requested variant's colors.
  //   If current theme is 'custom', does nothing — custom colors have no variants.
  const setThemeVariant = useCallback((variant) => {
    setState((prev) => {
      if (prev.theme?.preset === 'custom') return prev
      const preset = presetThemes.find((t) => t.id === prev.theme?.preset)
      if (!preset) return prev
      const colors = getThemeVariant(preset, variant)
      return {
        ...prev,
        theme: {
          ...prev.theme,
          variant,
          primary: colors.primary,
          secondary: colors.secondary,
          accent: colors.accent,
        },
      }
    })
  }, [setState])

  const setFonts = useCallback((fonts) => {
    setState((prev) => ({ ...prev, fonts: { ...prev.fonts, ...fonts } }))
  }, [setState])

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
  }, [setState])

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

      // Requirement: Looks define per-element text styling (color, bold) so presets
      //   feel complete — fonts + filters + overlay + text color/weight in one click.
      // Approach: Merge textStyles into each cell's text elements, overriding only
      //   color and bold. Preserves content, visible, size, italic, letterSpacing,
      //   alignment, spacers, and line decorators — those are user choices.
      // Alternatives:
      //   - Override all text fields: Rejected — destroys user's content and sizing
      //   - Only apply to cell 0: Rejected — inconsistent look across multi-cell layouts
      //   - Store as separate state: Rejected — text styling belongs on the text elements
      const updatedText = { ...prev.text }
      if (settings.textStyles) {
        for (const cellIndex of Object.keys(updatedText)) {
          const cellText = updatedText[cellIndex]
          if (!cellText) continue
          const updatedCell = { ...cellText }
          for (const elementId of TEXT_ELEMENT_IDS) {
            const styleOverride = settings.textStyles[elementId]
            if (styleOverride && updatedCell[elementId]) {
              updatedCell[elementId] = {
                ...updatedCell[elementId],
                ...(styleOverride.color !== undefined && { color: styleOverride.color }),
                ...(styleOverride.bold !== undefined && { bold: styleOverride.bold }),
              }
            }
          }
          updatedText[cellIndex] = updatedCell
        }
      }

      return {
        ...prev,
        activeStylePreset: preset.id,
        fonts: settings.fonts ? {
          title: settings.fonts.title,
          body: settings.fonts.body,
        } : prev.fonts,
        images: updatedImages,
        text: updatedText,
      }
    })
  }, [setState])

  const clearStylePreset = useCallback(() => {
    setState((prev) => ({ ...prev, activeStylePreset: null }))
  }, [setState])

  // Requirement: Apply layout preset — structure only, preserve user content in place
  // Approach: Clean up orphaned cells beyond new count, keep text/images where they are
  //   for cells that still exist. No redistribution — user controls content placement.
  // Alternatives:
  //   - Redistribute text based on imageCells: Rejected — imageCells concept removed,
  //     caused silent text merging/overwriting bugs
  //   - Drop text on orphaned cells: Acceptable — cells beyond new count no longer exist
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
        text: cleaned.text,
        cellImages: cleaned.cellImages,
        padding: { ...prev.padding, cellOverrides: cleaned.paddingOverrides },
        frame: { ...prev.frame, cellFrames: cleaned.cellFrames },
        freeformText: cleaned.freeformText,
      }
    })
  }, [setState])

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
    debugLog('state', 'page-add', null, 'debug')
    setState((prev) => {
      const pages = prev.pages || [null]
      const currentPageData = extractPageData(prev)

      const newPages = [...pages]
      newPages[prev.activePage] = currentPageData
      const insertIndex = prev.activePage + 1
      newPages.splice(insertIndex, 0, null)

      return {
        ...prev,
        ...structuredClone(defaultPageData),
        pages: newPages,
        activePage: insertIndex,
      }
    })
  }, [setState])

  const duplicatePage = useCallback(() => {
    debugLog('state', 'page-duplicate', null, 'debug')
    setState((prev) => {
      const pages = prev.pages || [null]
      const currentPageData = extractPageData(prev)

      const newPages = [...pages]
      newPages[prev.activePage] = currentPageData
      const insertIndex = prev.activePage + 1
      newPages.splice(insertIndex, 0, null)

      const duplicateData = structuredClone(currentPageData)

      return {
        ...prev,
        ...duplicateData,
        pages: newPages,
        activePage: insertIndex,
      }
    })
  }, [setState])

  const removePage = useCallback((index) => {
    debugLog('state', 'page-remove', { index }, 'debug')
    setState((prev) => {
      const pages = prev.pages || [null]
      if (pages.length <= 1) return prev // Can't remove last page

      const newPages = [...pages]

      if (index === prev.activePage) {
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

  // Requirement: Multi-block freeform text — array of independently styled markdown blocks per cell.
  // Approach: CRUD helpers that operate on freeformText[cellIndex] as an array of block objects.
  // Alternatives:
  //   - Single block per cell: Rejected — user requested multiple appendable blocks with reordering.
  const addFreeformBlock = useCallback((cellIndex, overrides = {}) => {
    setState((prev) => {
      const cellBlocks = prev.freeformText?.[cellIndex] || []
      return {
        ...prev,
        freeformText: {
          ...(prev.freeformText || {}),
          [cellIndex]: [...cellBlocks, createFreeformBlock(overrides)],
        },
      }
    })
  }, [setState])

  const updateFreeformBlock = useCallback((cellIndex, blockId, updates) => {
    setState((prev) => {
      const cellBlocks = prev.freeformText?.[cellIndex] || []
      return {
        ...prev,
        freeformText: {
          ...(prev.freeformText || {}),
          [cellIndex]: cellBlocks.map((b) => b.id === blockId ? { ...b, ...updates } : b),
        },
      }
    })
  }, [setState])

  const removeFreeformBlock = useCallback((cellIndex, blockId) => {
    setState((prev) => {
      const cellBlocks = prev.freeformText?.[cellIndex] || []
      return {
        ...prev,
        freeformText: {
          ...(prev.freeformText || {}),
          [cellIndex]: cellBlocks.filter((b) => b.id !== blockId),
        },
      }
    })
  }, [setState])

  const moveFreeformBlock = useCallback((cellIndex, blockId, direction) => {
    setState((prev) => {
      const cellBlocks = [...(prev.freeformText?.[cellIndex] || [])]
      const idx = cellBlocks.findIndex((b) => b.id === blockId)
      if (idx < 0) return prev
      const newIdx = idx + direction
      if (newIdx < 0 || newIdx >= cellBlocks.length) return prev
      ;[cellBlocks[idx], cellBlocks[newIdx]] = [cellBlocks[newIdx], cellBlocks[idx]]
      return {
        ...prev,
        freeformText: {
          ...(prev.freeformText || {}),
          [cellIndex]: cellBlocks,
        },
      }
    })
  }, [setState])

  // Requirement: Migrate localStorage designs to IndexedDB on first mount.
  // Approach: Run once via ref guard. migrateTextForStorage handles old text format
  //   during the one-time transfer so loadDesign doesn't need compat code.
  const migrationRan = useRef(false)
  useEffect(() => {
    if (!migrationRan.current) {
      migrationRan.current = true
      debugLog('state', 'migration-trigger', null, 'debug')
      designStorage.migrateFromLocalStorage(migrateTextForStorage)
    }
  }, [])

  // Requirement: Design persistence via IndexedDB (no size limits, handles binary natively).
  // Approach: Async save/load/list/delete. Callers must await results.
  const saveDesign = useCallback(async (name = 'My Design') => {
    const pages = state.pages || [null]
    const syncedPages = [...pages]
    syncedPages[state.activePage] = extractPageData(state)

    const design = {
      id: `design-${Date.now()}`,
      name,
      savedAt: new Date().toISOString(),
      state: { ...state, pages: syncedPages },
    }
    try {
      await designStorage.saveDesign(design)
      debugLog('state', 'design-saved', { id: design.id, name })
      return { success: true, id: design.id }
    } catch (error) {
      debugLog('state', 'design-save-error', { error: error.message }, 'error')
      return { success: false, error: error.message }
    }
  }, [state])

  const loadDesign = useCallback(async (designId) => {
    try {
      const design = await designStorage.loadDesign(designId)
      if (design && design.state) {
        const loadedState = { ...defaultState, ...design.state }
        if (!loadedState.pages) loadedState.pages = [null]
        if (!loadedState.textMode) loadedState.textMode = 'structured'
        if (!loadedState.freeformText) loadedState.freeformText = {}
        // Requirement: Backward compat for saved designs without theme variant.
        // Approach: Migrate old 'dark'/'light' presets to 'neutral' with variant,
        //   and add variant field to any theme missing it.
        if (loadedState.theme && !loadedState.theme.variant) {
          const resolved = resolveThemePreset(loadedState.theme.preset)
          if (resolved) {
            loadedState.theme.preset = resolved.theme.id
            loadedState.theme.variant = resolved.variant
          } else {
            // Unknown preset or custom — default to 'dark' variant
            loadedState.theme.variant = 'dark'
          }
        }
        // Requirement: Validate activePage bounds to prevent crash on corrupted saves
        // Approach: Clamp activePage to valid range
        const activePage = Math.max(0, Math.min(loadedState.activePage || 0, loadedState.pages.length - 1))
        loadedState.activePage = activePage
        if (loadedState.pages[activePage] !== null) {
          const pageData = loadedState.pages[activePage]
          // Only spread known PAGE_FIELDS to prevent orphaned fields from older versions
          // polluting the current state. Saved designs may contain fields that no longer exist.
          PAGE_FIELDS.forEach(field => {
            if (field in pageData) loadedState[field] = pageData[field]
          })
          loadedState.pages[activePage] = null
        }
        resetHistory(loadedState)
        debugLog('state', 'design-loaded', { id: designId, pages: loadedState.pages?.length || 1 })
        return { success: true }
      }
      debugLog('state', 'design-load-not-found', { id: designId }, 'warn')
      return { success: false, error: 'Design not found' }
    } catch (error) {
      debugLog('state', 'design-load-error', { id: designId, error: error.message }, 'error')
      return { success: false, error: error.message }
    }
  }, [resetHistory])

  const getSavedDesigns = useCallback(async () => {
    try {
      return await designStorage.listDesigns()
    } catch {
      return []
    }
  }, [])

  const deleteDesign = useCallback(async (designId) => {
    try {
      await designStorage.deleteDesign(designId)
      debugLog('state', 'design-deleted', { id: designId })
      return { success: true }
    } catch (error) {
      debugLog('state', 'design-delete-error', { id: designId, error: error.message }, 'error')
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
    setLayout,
    setTheme,
    setThemePreset,
    setThemeVariant,
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
    addFreeformBlock,
    updateFreeformBlock,
    removeFreeformBlock,
    moveFreeformBlock,
  }
}
