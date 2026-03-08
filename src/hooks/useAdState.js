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
import { countCells, cleanupOrphanedCells, shiftCellIndices, swapCellIndices } from '../utils/cellUtils'

const defaultTheme = presetThemes[0] // Dark theme
const STORAGE_KEY = 'canvagrid-designs'

// Element IDs for structured text
const TEXT_ELEMENT_IDS = ['title', 'tagline', 'bodyHeading', 'bodyText', 'cta', 'footnote']

// Requirement: Migrate old global text format (text.title + textCells) to per-cell format (text[cellIndex].title)
// Approach: Detect old format by checking if text has element keys directly, then redistribute
//   using textCells assignments. For null (auto-assign) entries, replicate old auto-placement:
//   title/tagline/cta → first image cell, bodyHeading/bodyText/footnote → first non-image cell.
// Alternatives:
//   - Breaking change with no migration: Rejected — users lose saved designs
//   - Map all null to cell 0: Rejected — stacks everything in one cell for multi-cell layouts
function migrateTextToPerCell(stateObj) {
  if (!stateObj.text) return
  // Detect old format: text has element keys like 'title', 'tagline' directly
  const hasOldFormat = TEXT_ELEMENT_IDS.some((id) => stateObj.text[id] && typeof stateObj.text[id] === 'object' && 'content' in stateObj.text[id])
  if (!hasOldFormat) return

  const oldText = stateObj.text
  const textCells = stateObj.textCells || {}
  const newText = {}

  // Replicate old auto-assignment for null entries
  const imageCells = stateObj.layout?.imageCells || [0]
  const totalCells = countCells(stateObj.layout?.structure)
  const firstImageCell = imageCells.length > 0 ? imageCells[0] : 0
  const firstNonImageCell = totalCells > 1
    ? Array.from({ length: totalCells }, (_, i) => i).find((i) => !imageCells.includes(i)) ?? 0
    : 0
  // Old auto-assignment: title/tagline/cta on image cell, body/footnote on non-image cell
  const autoAssign = {
    title: firstImageCell,
    tagline: firstImageCell,
    cta: firstImageCell,
    bodyHeading: firstNonImageCell,
    bodyText: firstNonImageCell,
    footnote: firstNonImageCell,
  }

  for (const elementId of TEXT_ELEMENT_IDS) {
    const elementData = oldText[elementId]
    if (!elementData) continue
    // Use explicit assignment, or auto-assign based on old placement logic
    const cellIndex = textCells[elementId] ?? autoAssign[elementId] ?? 0
    if (!newText[cellIndex]) newText[cellIndex] = {}
    newText[cellIndex][elementId] = { ...elementData }
  }

  stateObj.text = newText
  delete stateObj.textCells
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
  // Requirement: Per-cell structured text — each cell gets its own set of text fields
  // Approach: text is keyed by cell index, each cell has all 6 fields
  // Alternatives:
  //   - Global text with cell assignment (textCells): Rejected — indirect, confusing UX
  text: {},
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

  // Requirement: Per-cell structured text — each cell gets its own title, tagline, body, etc.
  // Approach: text[cellIndex] = { title: {...}, tagline: {...}, ... }
  text: {
    1: {
      title: { content: 'Your Title Here', visible: true, color: 'secondary', size: 1, bold: true, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
      tagline: { content: 'Elevate your brand today', visible: true, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
    },
    2: {
      bodyHeading: { content: 'Why Choose Us', visible: true, color: 'secondary', size: 1, bold: true, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
      bodyText: { content: 'Transform your business with innovative solutions designed for success.', visible: true, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
      cta: { content: 'Learn More', visible: true, color: 'accent', size: 1, bold: true, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
      footnote: { content: '*Terms and conditions apply', visible: true, color: 'secondary', size: 1, bold: false, italic: false, letterSpacing: 0, textAlign: null, textVerticalAlign: null },
    },
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

        // Shift cellAlignments (array) and cellOverlays (object) from the layout too
        const oldAlignments = newLayout.cellAlignments || []
        const shiftedAlignments = []
        for (let i = 0; i < oldAlignments.length; i++) {
          if (i >= fromIndex) {
            const newIdx = i + shiftBy
            if (newIdx >= 0) shiftedAlignments[newIdx] = oldAlignments[i]
          } else {
            shiftedAlignments[i] = oldAlignments[i]
          }
        }
        // Fill gaps with null alignment
        for (let i = 0; i < shiftedAlignments.length; i++) {
          if (!shiftedAlignments[i]) shiftedAlignments[i] = { textAlign: null, textVerticalAlign: null }
        }

        const oldOverlays = newLayout.cellOverlays || {}
        const shiftedOverlays = {}
        for (const [key, value] of Object.entries(oldOverlays)) {
          const idx = parseInt(key, 10)
          if (idx >= fromIndex) {
            const newIdx = idx + shiftBy
            if (newIdx >= 0) shiftedOverlays[newIdx] = value
          } else {
            shiftedOverlays[key] = value
          }
        }

        // Shift imageCells array values
        const oldImageCells = newLayout.imageCells || [0]
        const shiftedImageCells = oldImageCells.map((cellIdx) =>
          cellIdx >= fromIndex ? cellIdx + shiftBy : cellIdx,
        ).filter((cellIdx) => cellIdx >= 0 && cellIdx < newCellCount)
        const finalImageCells = shiftedImageCells.length > 0 ? shiftedImageCells : [0]

        newLayout.cellAlignments = shiftedAlignments
        newLayout.cellOverlays = shiftedOverlays
        newLayout.imageCells = finalImageCells

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

        // Remap cellAlignments (array)
        const oldAlignments = newLayout.cellAlignments || []
        const swappedAlignments = [...oldAlignments]
        for (const [oldIdx, newIdx] of Object.entries(_cellSwap)) {
          swappedAlignments[newIdx] = oldAlignments[parseInt(oldIdx, 10)] || { textAlign: null, textVerticalAlign: null }
        }
        newLayout.cellAlignments = swappedAlignments

        // Remap cellOverlays (object)
        const oldOverlays = newLayout.cellOverlays || {}
        const swappedOverlays = { ...oldOverlays }
        // Clear old keys for swapped cells first, then set new
        for (const oldIdx of Object.keys(_cellSwap)) {
          delete swappedOverlays[oldIdx]
        }
        for (const [oldIdx, newIdx] of Object.entries(_cellSwap)) {
          if (oldOverlays[oldIdx]) swappedOverlays[newIdx] = oldOverlays[oldIdx]
        }
        newLayout.cellOverlays = swappedOverlays

        // Remap imageCells array values
        const oldImageCells = newLayout.imageCells || [0]
        newLayout.imageCells = oldImageCells.map((cellIdx) =>
          _cellSwap[cellIdx] !== undefined ? _cellSwap[cellIdx] : cellIdx,
        )

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

      return {
        ...prev,
        layout: { ...newLayout, cellAlignments: cleanCellAlignments, cellOverlays: cleanCellOverlays },
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
  }, [setState])

  const clearStylePreset = useCallback(() => {
    setState((prev) => ({ ...prev, activeStylePreset: null }))
  }, [setState])

  // Requirement: Apply layout preset and redistribute text from image cells to non-image cells
  // Approach: After cleanup, move text entries that land on image cells to the first available
  //   non-image cell. Preserves user content while respecting the preset's cell roles.
  // Alternatives:
  //   - Drop text on image cells: Rejected — loses user content silently
  //   - Keep text on image cells: Rejected — text hidden behind images, confusing UX
  const applyLayoutPreset = useCallback((preset) => {
    if (!preset) return

    setState((prev) => {
      const newCellCount = countCells(preset.layout.structure)
      const cleaned = cleanupOrphanedCells(prev, newCellCount)
      const imageCells = preset.layout.imageCells || []
      const allCells = Array.from({ length: newCellCount }, (_, i) => i)
      const nonImageCells = allCells.filter((i) => !imageCells.includes(i))

      // Requirement: Distribute text across non-image cells when switching presets
      // Approach: Collect all text from image cells, split into header/body groups,
      //   distribute across available non-image cells so presets look complete
      // Alternatives:
      //   - Dump all text into first non-image cell: Rejected — looks cramped, bad UX
      //   - Per-preset text mapping: Rejected — too much config to maintain
      const redistributedText = { ...cleaned.text }
      if (nonImageCells.length > 0) {
        // Collect text elements displaced from image cells
        const displaced = {}
        Object.keys(redistributedText).forEach((cellIndex) => {
          const ci = parseInt(cellIndex, 10)
          if (imageCells.includes(ci)) {
            Object.assign(displaced, redistributedText[ci])
            delete redistributedText[ci]
          }
        })

        // If we have displaced text, distribute it across non-image cells
        if (Object.keys(displaced).length > 0) {
          const headerKeys = ['title', 'tagline']
          const bodyKeys = ['bodyHeading', 'bodyText', 'cta', 'footnote']

          const headerGroup = {}
          const bodyGroup = {}
          Object.entries(displaced).forEach(([key, val]) => {
            if (headerKeys.includes(key)) headerGroup[key] = val
            else if (bodyKeys.includes(key)) bodyGroup[key] = val
          })

          // Find non-image cells that don't already have text
          const emptyNonImageCells = nonImageCells.filter(
            (ci) => !redistributedText[ci] || Object.keys(redistributedText[ci]).length === 0
          )
          const targetCells = emptyNonImageCells.length > 0 ? emptyNonImageCells : nonImageCells

          if (Object.keys(headerGroup).length > 0) {
            const target = targetCells[0]
            redistributedText[target] = { ...headerGroup, ...(redistributedText[target] || {}) }
          }
          if (Object.keys(bodyGroup).length > 0) {
            // Use second cell if available, otherwise same as header
            const target = targetCells.length > 1 ? targetCells[1] : targetCells[0]
            redistributedText[target] = { ...bodyGroup, ...(redistributedText[target] || {}) }
          }
        }
      }

      return {
        ...prev,
        activeLayoutPreset: preset.id,
        layout: {
          ...preset.layout,
        },
        text: redistributedText,
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
      return { success: false, error: error.message }
    }
  }, [state])

  // Requirement: Load saved designs with backward compatibility for older saves.
  // Approach: Merge with defaultState to fill missing fields. Migrate old global text
  //   format (text.title, textCells) to per-cell format (text[cellIndex].title).
  // Alternatives:
  //   - Version field + explicit migrations: Rejected — overkill for a single-user tool.
  //   - No migration: Rejected — older saves crash on missing pages/textMode fields.
  const loadDesign = useCallback((designId) => {
    try {
      const designs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const design = designs.find(d => d.id === designId)
      if (design && design.state) {
        const loadedState = { ...defaultState, ...design.state }
        // Ensure multi-page fields exist for pre-multi-page saves
        if (!loadedState.pages) loadedState.pages = [null]
        if (!loadedState.textMode) loadedState.textMode = 'structured'
        if (!loadedState.freeformText) loadedState.freeformText = {}
        // saveDesign syncs all pages to non-null, so restore the active one to top-level
        const activePage = loadedState.activePage || 0
        if (loadedState.pages[activePage] !== null) {
          const pageData = loadedState.pages[activePage]
          Object.assign(loadedState, pageData)
          loadedState.pages[activePage] = null
        }
        // Migrate old global text format to per-cell format
        migrateTextToPerCell(loadedState)
        // Migrate inactive pages too
        if (loadedState.pages) {
          loadedState.pages.forEach((page) => {
            if (page && page.text) migrateTextToPerCell(page)
          })
        }
        // Clean up legacy textCells field from top-level and all pages
        delete loadedState.textCells
        if (loadedState.pages) {
          loadedState.pages.forEach((page) => {
            if (page) delete page.textCells
          })
        }
        resetHistory(loadedState)
        return { success: true }
      }
      return { success: false, error: 'Design not found' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [resetHistory])

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
