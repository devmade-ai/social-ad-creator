import { forwardRef, useMemo } from 'react'
import { overlayTypes, hexToRgb, getOverlayType } from '../config/layouts'
import { platforms } from '../config/platforms'
import { fonts } from '../config/fonts'
import { getNeutralColor } from '../config/themes'

// SVG filter definitions for texture effects
const SvgFilters = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      {/* Noise filter - subtle random dots */}
      <filter id="noise-filter" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
        <feColorMatrix type="saturate" values="0" result="mono" />
        <feComponentTransfer result="contrast">
          <feFuncR type="linear" slope="2" intercept="-0.5" />
          <feFuncG type="linear" slope="2" intercept="-0.5" />
          <feFuncB type="linear" slope="2" intercept="-0.5" />
        </feComponentTransfer>
      </filter>
      {/* Film grain filter - finer texture */}
      <filter id="grain-filter" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="3" result="noise" />
        <feColorMatrix type="saturate" values="0" result="mono" />
        <feComponentTransfer result="contrast">
          <feFuncR type="linear" slope="1.5" intercept="-0.25" />
          <feFuncG type="linear" slope="1.5" intercept="-0.25" />
          <feFuncB type="linear" slope="1.5" intercept="-0.25" />
        </feComponentTransfer>
      </filter>
    </defs>
  </svg>
)

const defaultTextLayer = { content: '', visible: false, color: 'secondary', size: 1, textAlign: null }

const AdCanvas = forwardRef(function AdCanvas({ state, scale = 1 }, ref) {
  const platform = platforms.find((p) => p.id === state.platform) || platforms[0]
  const layout = state.layout
  const textCells = state.textCells || {}
  const titleFont = fonts.find((f) => f.id === state.fonts.title) || fonts[0]
  const bodyFont = fonts.find((f) => f.id === state.fonts.body) || fonts[0]
  const paddingConfig = state.padding || { global: 20, cellOverrides: {} }
  const frameConfig = state.frame || { outer: { percent: 0, color: 'primary' }, cellFrames: {} }
  const images = state.images || []
  const cellImages = state.cellImages || {}

  // Get padding for a specific cell (returns number in px)
  const getCellPaddingValue = (cellIndex) => {
    const override = paddingConfig.cellOverrides?.[cellIndex]
    return override !== undefined ? override : paddingConfig.global
  }

  // Get padding for a specific cell (returns px string like "20px")
  const getCellPadding = (cellIndex) => {
    return `${getCellPaddingValue(cellIndex)}px`
  }

  // Get cell frame config
  const getCellFrame = (cellIndex) => {
    return frameConfig.cellFrames?.[cellIndex] || null
  }

  // Calculate frame and inner padding from total padding and frame percentage
  const getFrameDimensions = (totalPadding, framePercent) => {
    const frameWidth = Math.round(totalPadding * (framePercent / 100))
    const innerPadding = totalPadding - frameWidth
    return { frameWidth, innerPadding }
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

  // Get overlay style for a given config (returns object with background, blendMode, special)
  const getOverlayStyle = (overlayConfig) => {
    const color = resolveColor(overlayConfig.color, themeColors.primary)
    const type = getOverlayType(overlayConfig.type)
    const background = type.getCss(hexToRgb(color), overlayConfig.opacity)
    return {
      background,
      blendMode: type.blendMode || null,
      special: type.special || null,
      opacity: overlayConfig.opacity,
      color: hexToRgb(color),
    }
  }

  // Render special overlay effects (noise, grain, duotone, blur-edges)
  const renderSpecialOverlay = (special, overlayStyle, opacity) => {
    if (special === 'noise') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: opacity / 100,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
          }}
        >
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <filter id={`noise-${Math.random().toString(36).substr(2, 9)}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise-filter)" />
          </svg>
        </div>
      )
    }

    if (special === 'grain') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: (opacity / 100) * 0.5,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
          }}
        >
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <rect width="100%" height="100%" filter="url(#grain-filter)" />
          </svg>
        </div>
      )
    }

    if (special === 'blur-edges') {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: `inset 0 0 ${60 * (opacity / 100)}px ${30 * (opacity / 100)}px ${overlayStyle.color.replace('rgb', 'rgba').replace(')', `, ${opacity / 100})`)}`,
            pointerEvents: 'none',
          }}
        />
      )
    }

    return null
  }

  const getTextColor = (colorKey) => resolveColor(colorKey, themeColors.secondary)
  const getTextLayer = (layerId) => state.text?.[layerId] || defaultTextLayer

  // Get outer frame dimensions
  const outerFrame = frameConfig.outer || { percent: 0, color: 'primary' }
  const outerFrameColor = resolveColor(outerFrame.color, themeColors.primary)
  const outerFrameWidth = Math.round(paddingConfig.global * (outerFrame.percent / 100))

  const containerStyle = {
    width: platform.width,
    height: platform.height,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: themeColors.primary,
    // Outer frame as box-shadow (inset)
    ...(outerFrameWidth > 0 && {
      boxShadow: `inset 0 0 0 ${outerFrameWidth}px ${outerFrameColor}`,
    }),
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

  // Helper to get image data for a cell
  // cellImages now stores just imageId per cell, settings are on the image itself
  const getCellImageData = (cellIndex) => {
    const imageId = cellImages[cellIndex]
    if (!imageId) return null
    const imageData = images.find((img) => img.id === imageId)
    if (!imageData) return null
    return {
      src: imageData.src,
      fit: imageData.fit || 'cover',
      position: imageData.position || { x: 50, y: 50 },
      filters: imageData.filters || {},
    }
  }

  // Check if a cell has an image
  const cellHasImage = (cellIndex) => {
    return getCellImageData(cellIndex) !== null
  }

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

  // Build image filter string from cell-specific filters
  const buildFilterStyle = (filters) => {
    if (!filters) return 'none'
    const parts = []
    if (filters.grayscale > 0) parts.push(`grayscale(${filters.grayscale}%)`)
    if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`)
    if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`)
    if (filters.contrast && filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`)
    if (filters.brightness && filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`)
    return parts.length > 0 ? parts.join(' ') : 'none'
  }

  // Render a single overlay layer with support for blend modes and special effects
  const renderOverlayLayer = (overlayConfig, key = 'overlay') => {
    if (!overlayConfig || overlayConfig.opacity <= 0) return null

    const overlayStyle = getOverlayStyle(overlayConfig)

    // Handle special effects (noise, grain, blur-edges)
    if (overlayStyle.special && overlayStyle.special !== 'duotone') {
      return renderSpecialOverlay(overlayStyle.special, overlayStyle, overlayConfig.opacity)
    }

    // Standard overlay with optional blend mode
    return (
      <div
        key={key}
        style={{
          position: 'absolute',
          inset: 0,
          background: overlayStyle.background,
          mixBlendMode: overlayStyle.blendMode || 'normal',
          pointerEvents: 'none',
        }}
      />
    )
  }

  // Check if overlay is a duotone effect
  const isDuotoneOverlay = (overlayConfig) => {
    if (!overlayConfig) return false
    const type = getOverlayType(overlayConfig.type)
    return type.special === 'duotone'
  }

  // Render image with overlay for a specific cell
  // Supports stacking: global overlay (Image tab) + cell overlay (Layout > Overlay)
  const renderCellImage = (cellIndex, style = {}) => {
    const imageData = getCellImageData(cellIndex)
    if (!imageData) return null

    // Get cell-specific overlay config
    const cellOverlays = layout.cellOverlays || {}
    const cellOverlayConfig = cellOverlays[cellIndex]

    // Global overlay from Image tab (always applied if opacity > 0)
    const globalOverlay = state.overlay
    const hasGlobalOverlay = globalOverlay && globalOverlay.opacity > 0

    // Cell-specific overlay (stacks on top if different from global)
    const hasCellOverlay = cellOverlayConfig &&
      cellOverlayConfig !== globalOverlay &&
      cellOverlayConfig.enabled !== false

    // Check for duotone effect (applies grayscale to image)
    const hasDuotone = isDuotoneOverlay(globalOverlay) || isDuotoneOverlay(cellOverlayConfig)
    const duotoneFilter = hasDuotone ? 'grayscale(100%)' : ''
    const imageFilterStyle = buildFilterStyle(imageData.filters)
    const combinedFilter = [imageFilterStyle, duotoneFilter].filter(f => f && f !== 'none').join(' ') || 'none'

    return (
      <div style={{ position: 'relative', backgroundColor: themeColors.primary, ...style }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${imageData.src})`,
            backgroundSize: imageData.fit,
            backgroundPosition: `${imageData.position.x}% ${imageData.position.y}%`,
            backgroundRepeat: 'no-repeat',
            filter: combinedFilter,
          }}
        />
        {/* Global overlay layer (from Image tab) */}
        {hasGlobalOverlay && renderOverlayLayer(globalOverlay, 'global-overlay')}
        {/* Cell overlay layer (from Layout > Overlay) - stacks on top */}
        {hasCellOverlay && renderOverlayLayer(cellOverlayConfig, 'cell-overlay')}
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
      if (!cellHasImage(i)) return i
    }
    return -1 // All cells have images
  }

  // Find the first image cell for fullbleed default behavior
  const getFirstImageCellIndex = () => {
    for (let i = 0; i < cellInfo.totalCells; i++) {
      if (cellHasImage(i)) return i
    }
    return -1 // No cells have images
  }

  // Get text elements for a specific cell
  const getElementsForCell = (cellIndex, onImageLayer) => {
    const elements = []
    const elementIds = ['title', 'tagline', 'bodyHeading', 'bodyText', 'cta', 'footnote']
    const hasImage = cellHasImage(cellIndex)

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
          const firstImageCell = getFirstImageCellIndex()
          const onlyOneCell = cellInfo.totalCells === 1

          if (onlyOneCell) {
            // Single cell: all text goes here
            if (onImageLayer) elements.push(elementId)
          } else if (hasImage && onImageLayer && cellIndex === firstImageCell) {
            // First image cell gets: title, tagline, cta
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
    const hasImage = cellHasImage(0)
    const allElements = ['title', 'tagline', 'bodyHeading', 'bodyText', 'cta', 'footnote']

    // Cell frame for fullbleed (cell 0)
    const cellFrame = getCellFrame(0)
    const cellPadding = getCellPaddingValue(0)
    const frameWidth = cellFrame ? Math.round(cellPadding * (cellFrame.percent / 100)) : 0
    const frameColor = cellFrame ? resolveColor(cellFrame.color, themeColors.primary) : null

    return (
      <>
        {/* Background color */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: themeColors.primary }} />
        {/* Image layer */}
        {hasImage && renderCellImage(0, { position: 'absolute', inset: 0 })}
        {/* Cell frame (inset border) */}
        {frameWidth > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              boxShadow: `inset 0 0 0 ${frameWidth}px ${frameColor}`,
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        )}
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
          {allElements.map(elementId => renderTextElement(elementId, hasImage, 0))}
        </div>
      </>
    )
  }

  // Render a single cell content
  const renderCellContent = (cellIndex) => {
    const hasImage = cellHasImage(cellIndex)
    const textElementsOnImage = hasImage ? getElementsForCell(cellIndex, true) : []
    const textElementsOnBackground = getElementsForCell(cellIndex, false)
    const cellOverlays = layout.cellOverlays || {}
    const cellOverlay = cellOverlays[cellIndex]

    // Cell frame
    const cellFrame = getCellFrame(cellIndex)
    const cellPadding = getCellPaddingValue(cellIndex)
    const frameWidth = cellFrame ? Math.round(cellPadding * (cellFrame.percent / 100)) : 0
    const frameColor = cellFrame ? resolveColor(cellFrame.color, themeColors.primary) : null

    return (
      <>
        {/* Background for all cells */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: themeColors.primary }} />

        {/* Image for cells with images */}
        {hasImage && renderCellImage(cellIndex, { position: 'absolute', inset: 0 })}

        {/* Overlay for non-image cells (if enabled) */}
        {!hasImage && cellOverlay && cellOverlay.enabled !== false && renderOverlayLayer(cellOverlay, `cell-${cellIndex}-overlay`)}

        {/* Cell frame (inset border) */}
        {frameWidth > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              boxShadow: `inset 0 0 0 ${frameWidth}px ${frameColor}`,
              pointerEvents: 'none',
              zIndex: 5,
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
      <SvgFilters />
      {renderLayout()}
      {renderLogo()}
    </div>
  )
})

export default AdCanvas
