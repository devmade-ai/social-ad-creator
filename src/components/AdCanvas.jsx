import { forwardRef, useMemo } from 'react'
import { overlayTypes, hexToRgb } from '../config/layouts'
import { platforms } from '../config/platforms'
import { fonts } from '../config/fonts'
import { getNeutralColor } from '../config/themes'

const defaultTextLayer = { content: '', visible: false, color: 'secondary', size: 1 }

const AdCanvas = forwardRef(function AdCanvas({ state, scale = 1 }, ref) {
  const platform = platforms.find((p) => p.id === state.platform) || platforms[0]
  const layout = state.layout
  const textCells = state.textCells || {}
  const titleFont = fonts.find((f) => f.id === state.fonts.title) || fonts[0]
  const bodyFont = fonts.find((f) => f.id === state.fonts.body) || fonts[0]
  const paddingConfig = state.padding || { global: 20, cellOverrides: {} }

  // Get padding for a specific cell (returns px string like "20px")
  const getCellPadding = (cellIndex) => {
    const override = paddingConfig.cellOverrides?.[cellIndex]
    const value = override !== undefined ? override : paddingConfig.global
    return `${value}px`
  }

  const themeColors = useMemo(() => ({
    primary: state.theme.primary,
    secondary: state.theme.secondary,
    accent: state.theme.accent,
  }), [state.theme])

  // Resolve a color key to hex (supports theme colors and neutral colors)
  const resolveColor = (colorKey, fallback) => {
    // Check theme colors first
    if (themeColors[colorKey]) return themeColors[colorKey]
    // Check neutral colors
    const neutralHex = getNeutralColor(colorKey)
    if (neutralHex) return neutralHex
    // Fallback
    return fallback
  }

  // Get overlay style for a given config
  const getOverlayStyle = (overlayConfig) => {
    const color = resolveColor(overlayConfig.color, themeColors.primary)
    const type = overlayTypes.find((o) => o.id === overlayConfig.type) || overlayTypes[0]
    return type.getCss(hexToRgb(color), overlayConfig.opacity)
  }

  // Global overlay style (for backward compatibility)
  const overlayStyle = getOverlayStyle(state.overlay)

  // Get overlay config for a specific cell (cell-specific only, not global fallback)
  // For image cells: global overlay is applied separately, this returns additional cell overlay
  // For non-image cells: this returns the cell overlay (no global overlay applies)
  const getCellOverlay = (cellIndex, hasImage) => {
    const cellOverlays = layout.cellOverlays || {}
    const cellConfig = cellOverlays[cellIndex]

    // No explicit config for this cell
    if (cellConfig === undefined) return null

    // Cell has explicit config
    if (cellConfig.enabled === false) return { enabled: false }
    return {
      type: cellConfig.type || state.overlay.type,
      color: cellConfig.color || state.overlay.color,
      opacity: cellConfig.opacity ?? state.overlay.opacity,
    }
  }

  const getTextColor = (colorKey) => resolveColor(colorKey, themeColors.secondary)
  const getTextLayer = (layerId) => state.text?.[layerId] || defaultTextLayer

  const containerStyle = {
    width: platform.width,
    height: platform.height,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: themeColors.primary,
  }

  // Calculate total cell count and build cell map from structure
  const cellInfo = useMemo(() => {
    const structure = layout.structure || [{ size: 100, subdivisions: 1, subSizes: [100] }]
    const cells = []
    let cellIndex = 0

    structure.forEach((section, sectionIndex) => {
      const subdivisions = section.subdivisions || 1
      for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
        cells.push({
          index: cellIndex,
          sectionIndex,
          subIndex,
          sectionSize: section.size,
          subSize: section.subSizes?.[subIndex] || (100 / subdivisions),
        })
        cellIndex++
      }
    })

    return { cells, totalCells: cellIndex }
  }, [layout.structure])

  const imageCell = layout.imageCell ?? 0

  // Check if a cell is the image cell
  const isImageCell = (cellIndex) => cellIndex === imageCell

  // Logo position styles
  const getLogoPositionStyle = () => {
    const logoWidth = platform.width * (state.logoSize || 0.15)
    const margin = platform.width * 0.03

    const baseStyle = {
      position: 'absolute',
      width: logoWidth,
      height: 'auto',
      maxHeight: logoWidth,
      objectFit: 'contain',
      zIndex: 10,
    }

    switch (state.logoPosition) {
      case 'top-left':
        return { ...baseStyle, top: margin, left: margin }
      case 'top-right':
        return { ...baseStyle, top: margin, right: margin }
      case 'bottom-left':
        return { ...baseStyle, bottom: margin, left: margin }
      case 'bottom-right':
        return { ...baseStyle, bottom: margin, right: margin }
      case 'center':
        return { ...baseStyle, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
      default:
        return { ...baseStyle, bottom: margin, right: margin }
    }
  }

  // Render logo
  const renderLogo = () => {
    if (!state.logo) return null
    return (
      <img
        src={state.logo}
        alt="Logo"
        style={getLogoPositionStyle()}
      />
    )
  }

  // Build image filter string from state
  const imageFilterStyle = useMemo(() => {
    const filters = state.imageFilters || {}
    const parts = []
    if (filters.grayscale > 0) parts.push(`grayscale(${filters.grayscale}%)`)
    if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`)
    if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`)
    if (filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`)
    if (filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`)
    return parts.length > 0 ? parts.join(' ') : 'none'
  }, [state.imageFilters])

  // Render image with overlay (for fullbleed or image cells)
  // Supports stacking: global overlay (Image tab) + cell overlay (Layout > Overlay)
  const renderImage = (style = {}, cellOverlayConfig = null) => {
    // Global overlay from Image tab (always applied if opacity > 0)
    const globalOverlay = state.overlay
    const hasGlobalOverlay = globalOverlay && globalOverlay.opacity > 0

    // Cell-specific overlay (stacks on top if different from global)
    const hasCellOverlay = cellOverlayConfig &&
      cellOverlayConfig !== globalOverlay &&
      cellOverlayConfig.enabled !== false

    return (
      <div style={{ position: 'relative', backgroundColor: themeColors.primary, ...style }}>
        {state.image && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${state.image})`,
              backgroundSize: state.imageObjectFit,
              backgroundPosition: `${state.imagePosition.horizontal} ${state.imagePosition.vertical}`,
              backgroundRepeat: 'no-repeat',
              filter: imageFilterStyle,
            }}
          />
        )}
        {/* Global overlay layer (from Image tab) */}
        {hasGlobalOverlay && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: getOverlayStyle(globalOverlay),
            }}
          />
        )}
        {/* Cell overlay layer (from Layout > Overlay) - stacks on top */}
        {hasCellOverlay && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: getOverlayStyle(cellOverlayConfig),
            }}
          />
        )}
      </div>
    )
  }

  // Get alignment CSS values
  const getAlignItems = (align) => {
    switch (align) {
      case 'left': return 'flex-start'
      case 'right': return 'flex-end'
      default: return 'center'
    }
  }

  const getJustifyContent = (align) => {
    switch (align) {
      case 'start': return 'flex-start'
      case 'end': return 'flex-end'
      default: return 'center'
    }
  }

  // Get cell-specific alignment with fallback to global
  const getCellTextAlign = (cellIndex) => {
    const cellAlign = layout.cellAlignments?.[cellIndex]?.textAlign
    return cellAlign !== null && cellAlign !== undefined ? cellAlign : layout.textAlign
  }

  const getCellVerticalAlign = (cellIndex) => {
    const cellAlign = layout.cellAlignments?.[cellIndex]?.textVerticalAlign
    return cellAlign !== null && cellAlign !== undefined ? cellAlign : layout.textVerticalAlign
  }

  // Get element-specific horizontal alignment with fallback chain: element → cell → global
  const getElementTextAlign = (elementId, cellIndex) => {
    const layer = getTextLayer(elementId)
    if (layer.textAlign !== null && layer.textAlign !== undefined) {
      return layer.textAlign
    }
    return getCellTextAlign(cellIndex)
  }

  // Find the first non-image cell for auto text placement
  const getFirstNonImageCellIndex = () => {
    for (let i = 0; i < cellInfo.totalCells; i++) {
      if (!isImageCell(i)) return i
    }
    return -1 // All cells have image (only possible with 1 cell)
  }

  // Get text elements for a specific cell
  const getElementsForCell = (cellIndex, onImageLayer) => {
    const elements = []
    const elementIds = ['title', 'tagline', 'bodyHeading', 'bodyText', 'cta', 'footnote']
    const hasImage = isImageCell(cellIndex)

    for (const elementId of elementIds) {
      const assignedCell = textCells[elementId]

      if (assignedCell !== null && assignedCell !== undefined) {
        // Explicitly assigned to a cell
        if (assignedCell === cellIndex) {
          elements.push(elementId)
        }
      } else {
        // Auto assignment based on layout
        if (layout.type === 'fullbleed') {
          // Fullbleed: all elements on the single layer
          elements.push(elementId)
        } else {
          // Grid layout: distribute based on image placement
          const firstNonImageCell = getFirstNonImageCellIndex()
          const onlyOneCell = cellInfo.totalCells === 1

          if (onlyOneCell) {
            // Single cell: all text goes here
            if (onImageLayer) elements.push(elementId)
          } else if (hasImage && onImageLayer) {
            // Image cell gets: title, tagline, cta
            if (['title', 'tagline', 'cta'].includes(elementId)) {
              elements.push(elementId)
            }
          } else if (!hasImage && !onImageLayer && cellIndex === firstNonImageCell) {
            // First non-image cell gets: bodyHeading, bodyText, footnote
            if (['bodyHeading', 'bodyText', 'footnote'].includes(elementId)) {
              elements.push(elementId)
            }
          }
        }
      }
    }
    return elements
  }

  // Render a single text element with per-element alignment support
  const renderTextElement = (elementId, withShadow = false, cellIndex = 0) => {
    const layer = getTextLayer(elementId)
    if (!layer.visible || !layer.content) return null

    const shadowStyle = withShadow ? { textShadow: '0 1px 2px rgba(0,0,0,0.3)' } : {}
    const titleShadow = withShadow ? { textShadow: '0 2px 4px rgba(0,0,0,0.3)' } : {}

    // Get per-element horizontal alignment (with cell/global fallback)
    const elementAlign = getElementTextAlign(elementId, cellIndex)

    // Element-specific styling
    const elementStyles = {
      title: {
        tag: 'h1',
        fontSize: Math.round(platform.width * 0.05 * (layer.size || 1)),
        fontWeight: layer.bold !== false ? 700 : 400,
        fontFamily: titleFont.family,
        margin: 0,
        lineHeight: 1.2,
        whiteSpace: 'pre-wrap',
        shadow: titleShadow,
      },
      tagline: {
        tag: 'p',
        fontSize: Math.round(platform.width * 0.028 * (layer.size || 1)),
        fontWeight: layer.bold ? 700 : 500,
        fontFamily: bodyFont.family,
        margin: '0.4em 0 0 0',
        lineHeight: 1.3,
        whiteSpace: 'pre-wrap',
        shadow: shadowStyle,
      },
      bodyHeading: {
        tag: 'p',
        fontSize: Math.round(platform.width * 0.026 * (layer.size || 1)),
        fontWeight: layer.bold !== false ? 600 : 400,
        fontFamily: bodyFont.family,
        margin: '0.8em 0 0 0',
        lineHeight: 1.3,
        whiteSpace: 'pre-wrap',
        shadow: shadowStyle,
      },
      bodyText: {
        tag: 'p',
        fontSize: Math.round(platform.width * 0.022 * (layer.size || 1)),
        fontWeight: layer.bold ? 700 : 400,
        fontFamily: bodyFont.family,
        margin: '0.4em 0 0 0',
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
        shadow: shadowStyle,
      },
      cta: {
        tag: 'p',
        fontSize: Math.round(platform.width * 0.028 * (layer.size || 1)),
        fontWeight: layer.bold !== false ? 600 : 400,
        fontFamily: bodyFont.family,
        margin: '0.8em 0 0 0',
        lineHeight: 1.3,
        whiteSpace: 'pre-wrap',
        shadow: shadowStyle,
      },
      footnote: {
        tag: 'p',
        fontSize: Math.round(platform.width * 0.015 * (layer.size || 1)),
        fontWeight: layer.bold ? 700 : 400,
        fontFamily: bodyFont.family,
        margin: '1em 0 0 0',
        lineHeight: 1.3,
        whiteSpace: 'pre-wrap',
        opacity: 0.8,
        shadow: shadowStyle,
      },
    }

    const style = elementStyles[elementId] || elementStyles.bodyText
    const Tag = style.tag

    return (
      <Tag
        key={elementId}
        style={{
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          fontStyle: layer.italic ? 'italic' : 'normal',
          letterSpacing: `${layer.letterSpacing || 0}px`,
          fontFamily: style.fontFamily,
          color: getTextColor(layer.color),
          margin: style.margin,
          lineHeight: style.lineHeight,
          opacity: style.opacity,
          whiteSpace: style.whiteSpace,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          // Per-element horizontal alignment
          textAlign: elementAlign,
          alignSelf: getAlignItems(elementAlign),
          ...style.shadow,
        }}
      >
        {layer.content}
      </Tag>
    )
  }

  // Render text elements for a specific cell - supports per-element horizontal alignment
  const renderTextElementsForCell = (cellIndex, isOnImage) => {
    const elements = getElementsForCell(cellIndex, isOnImage)
    const withShadow = isOnImage
    const padding = getCellPadding(cellIndex)
    const verticalAlign = getCellVerticalAlign(cellIndex)

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: getJustifyContent(verticalAlign),
          alignItems: 'stretch', // Allow elements to control their own horizontal alignment via alignSelf
          padding,
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        {elements.map(elementId => renderTextElement(elementId, withShadow, cellIndex))}
      </div>
    )
  }

  // Render fullbleed layout (no split) - supports per-element horizontal alignment
  const renderFullbleed = () => {
    const padding = getCellPadding(0)
    const verticalAlign = getCellVerticalAlign(0)
    const cellOverlay = getCellOverlay(0, true)
    const allElements = ['title', 'tagline', 'bodyHeading', 'bodyText', 'cta', 'footnote']

    return (
      <>
        {renderImage({ position: 'absolute', inset: 0 }, cellOverlay)}
        {/* Elements can have individual horizontal alignment via alignSelf */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: getJustifyContent(verticalAlign),
            alignItems: 'stretch', // Allow elements to control their own horizontal alignment
            padding,
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
          }}
        >
          {allElements.map(elementId => renderTextElement(elementId, true, 0))}
        </div>
      </>
    )
  }

  // Render a single cell content
  const renderCellContent = (cellIndex) => {
    const hasImage = isImageCell(cellIndex)
    const textElementsOnImage = hasImage ? getElementsForCell(cellIndex, true) : []
    const textElementsOnBackground = getElementsForCell(cellIndex, false)
    const cellOverlay = getCellOverlay(cellIndex, hasImage)

    return (
      <>
        {/* Background for non-image cells */}
        {!hasImage && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: themeColors.primary }} />
        )}

        {/* Image for image cells */}
        {hasImage && renderImage({ position: 'absolute', inset: 0 }, cellOverlay)}

        {/* Overlay for non-image cells (if enabled) */}
        {!hasImage && cellOverlay && cellOverlay.enabled !== false && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: getOverlayStyle(cellOverlay),
            }}
          />
        )}

        {/* Text on image layer */}
        {hasImage && textElementsOnImage.length > 0 && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
            {renderTextElementsForCell(cellIndex, true)}
          </div>
        )}

        {/* Text on background (non-image cells) */}
        {!hasImage && textElementsOnBackground.length > 0 && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            {renderTextElementsForCell(cellIndex, false)}
          </div>
        )}
      </>
    )
  }

  // Render nested grid layout (rows or columns with optional subdivisions)
  const renderGridLayout = () => {
    const { type, structure } = layout
    const isRows = type === 'rows'
    const sections = structure || [{ size: 100, subdivisions: 1, subSizes: [100] }]

    let cellIndex = 0

    return (
      <div
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: isRows ? 'column' : 'row',
        }}
      >
        {sections.map((section, sectionIndex) => {
          const sectionSize = section.size || 100
          const subdivisions = section.subdivisions || 1
          const subSizes = section.subSizes || [100]

          // Build cells for this section
          const sectionCells = []
          for (let subIndex = 0; subIndex < subdivisions; subIndex++) {
            const currentCellIndex = cellIndex
            cellIndex++

            sectionCells.push(
              <div
                key={`cell-${currentCellIndex}`}
                style={{
                  flex: `0 0 ${subSizes[subIndex] || (100 / subdivisions)}%`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {renderCellContent(currentCellIndex)}
              </div>
            )
          }

          return (
            <div
              key={`section-${sectionIndex}`}
              style={{
                flex: `0 0 ${sectionSize}%`,
                display: 'flex',
                flexDirection: isRows ? 'row' : 'column', // Subdivisions go perpendicular
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {sectionCells}
            </div>
          )
        })}
      </div>
    )
  }

  // Main render logic
  const renderLayout = () => {
    if (layout.type === 'fullbleed' || !layout.type) {
      return renderFullbleed()
    }
    return renderGridLayout()
  }

  return (
    <div ref={ref} style={containerStyle}>
      {renderLayout()}
      {renderLogo()}
    </div>
  )
})

export default AdCanvas
