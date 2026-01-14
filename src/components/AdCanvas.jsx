import { forwardRef, useMemo } from 'react'
import { overlayTypes, hexToRgb } from '../config/layouts'
import { platforms } from '../config/platforms'
import { fonts } from '../config/fonts'

const defaultTextLayer = { content: '', visible: false, color: 'secondary', size: 1 }

const AdCanvas = forwardRef(function AdCanvas({ state, scale = 1 }, ref) {
  const platform = platforms.find((p) => p.id === state.platform) || platforms[0]
  const layout = state.layout
  const textGroups = state.textGroups || {}
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

  // Get overlay style for a given config
  const getOverlayStyle = (overlayConfig) => {
    const color = themeColors[overlayConfig.color] || themeColors.primary
    const type = overlayTypes.find((o) => o.id === overlayConfig.type) || overlayTypes[0]
    return type.getCss(hexToRgb(color), overlayConfig.opacity)
  }

  // Global overlay style (for backward compatibility)
  const overlayStyle = getOverlayStyle(state.overlay)

  // Get overlay config for a specific cell
  const getCellOverlay = (cellIndex, hasImage) => {
    const cellOverlays = layout.cellOverlays || {}
    const cellConfig = cellOverlays[cellIndex]

    // If cell has explicit config
    if (cellConfig !== undefined) {
      if (cellConfig.enabled === false) return null
      return {
        type: cellConfig.type || state.overlay.type,
        color: cellConfig.color || state.overlay.color,
        opacity: cellConfig.opacity ?? state.overlay.opacity,
      }
    }

    // Default: image cells get global overlay, non-image cells get none
    if (hasImage) return state.overlay
    return null
  }

  const getTextColor = (colorKey) => themeColors[colorKey] || themeColors.secondary
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
    if (filters.grayscale) parts.push('grayscale(100%)')
    if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`)
    if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`)
    if (filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`)
    if (filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`)
    return parts.length > 0 ? parts.join(' ') : 'none'
  }, [state.imageFilters])

  // Render image with overlay (for fullbleed or image cells)
  const renderImage = (style = {}) => (
    <div style={{ position: 'relative', backgroundColor: themeColors.primary, ...style }}>
      {state.image && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${state.image})`,
            backgroundSize: state.imageObjectFit,
            backgroundPosition: state.imagePosition,
            backgroundRepeat: 'no-repeat',
            filter: imageFilterStyle,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: overlayStyle,
        }}
      />
    </div>
  )

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

  // Get group-specific alignment with fallback to global
  const getGroupTextAlign = (groupId) => {
    const groupAlign = textGroups[groupId]?.textAlign
    return groupAlign !== null && groupAlign !== undefined ? groupAlign : layout.textAlign
  }

  const getGroupVerticalAlign = (groupId) => {
    const groupAlign = textGroups[groupId]?.textVerticalAlign
    return groupAlign !== null && groupAlign !== undefined ? groupAlign : layout.textVerticalAlign
  }

  // Find the first non-image cell for auto text placement
  const getFirstNonImageCellIndex = () => {
    for (let i = 0; i < cellInfo.totalCells; i++) {
      if (!isImageCell(i)) return i
    }
    return -1 // All cells have image (only possible with 1 cell)
  }

  // Get text groups for a specific cell
  const getGroupsForCell = (cellIndex, onImageLayer) => {
    const groups = []
    const groupIds = ['titleGroup', 'bodyGroup', 'cta', 'footnote']
    const hasImage = isImageCell(cellIndex)

    for (const groupId of groupIds) {
      const assignedCell = textGroups[groupId]?.cell

      if (assignedCell !== null && assignedCell !== undefined) {
        // Explicitly assigned to a cell
        if (assignedCell === cellIndex) {
          groups.push(groupId)
        }
      } else {
        // Auto assignment based on layout
        if (layout.type === 'fullbleed') {
          // Fullbleed: all groups on the single layer
          groups.push(groupId)
        } else {
          // Grid layout: distribute based on image placement
          const firstNonImageCell = getFirstNonImageCellIndex()
          const onlyOneCell = cellInfo.totalCells === 1

          if (onlyOneCell) {
            // Single cell: all text goes here
            if (onImageLayer) groups.push(groupId)
          } else if (hasImage && onImageLayer) {
            // Image cell gets: titleGroup and cta
            if (groupId === 'titleGroup' || groupId === 'cta') {
              groups.push(groupId)
            }
          } else if (!hasImage && !onImageLayer && cellIndex === firstNonImageCell) {
            // First non-image cell gets: bodyGroup and footnote
            if (groupId === 'bodyGroup' || groupId === 'footnote') {
              groups.push(groupId)
            }
          }
        }
      }
    }
    return groups
  }

  // Render title group (title + tagline)
  const renderTitleGroup = (withShadow = false) => {
    const title = getTextLayer('title')
    const tagline = getTextLayer('tagline')
    const shadowStyle = withShadow ? { textShadow: '0 2px 4px rgba(0,0,0,0.3)' } : {}
    const taglineShadow = withShadow ? { textShadow: '0 1px 2px rgba(0,0,0,0.3)' } : {}

    return (
      <>
        {title.visible && title.content && (
          <h1
            style={{
              fontSize: Math.round(platform.width * 0.05 * (title.size || 1)),
              fontWeight: title.bold !== false ? 700 : 400,
              fontStyle: title.italic ? 'italic' : 'normal',
              letterSpacing: `${title.letterSpacing || 0}px`,
              fontFamily: titleFont.family,
              color: getTextColor(title.color),
              margin: 0,
              lineHeight: 1.2,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              ...shadowStyle,
            }}
          >
            {title.content}
          </h1>
        )}
        {tagline.visible && tagline.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.028 * (tagline.size || 1)),
              fontWeight: tagline.bold ? 700 : 500,
              fontStyle: tagline.italic ? 'italic' : 'normal',
              letterSpacing: `${tagline.letterSpacing || 0}px`,
              fontFamily: bodyFont.family,
              color: getTextColor(tagline.color),
              margin: '0.4em 0 0 0',
              lineHeight: 1.3,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              ...taglineShadow,
            }}
          >
            {tagline.content}
          </p>
        )}
      </>
    )
  }

  // Render body group (body heading + body text)
  const renderBodyGroup = (withShadow = false) => {
    const bodyHeading = getTextLayer('bodyHeading')
    const bodyTextLayer = getTextLayer('bodyText')
    const shadowStyle = withShadow ? { textShadow: '0 1px 2px rgba(0,0,0,0.3)' } : {}

    return (
      <>
        {bodyHeading.visible && bodyHeading.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.026 * (bodyHeading.size || 1)),
              fontWeight: bodyHeading.bold !== false ? 600 : 400,
              fontStyle: bodyHeading.italic ? 'italic' : 'normal',
              letterSpacing: `${bodyHeading.letterSpacing || 0}px`,
              fontFamily: bodyFont.family,
              color: getTextColor(bodyHeading.color),
              margin: '0.8em 0 0 0',
              lineHeight: 1.3,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              ...shadowStyle,
            }}
          >
            {bodyHeading.content}
          </p>
        )}
        {bodyTextLayer.visible && bodyTextLayer.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.022 * (bodyTextLayer.size || 1)),
              fontWeight: bodyTextLayer.bold ? 700 : 400,
              fontStyle: bodyTextLayer.italic ? 'italic' : 'normal',
              letterSpacing: `${bodyTextLayer.letterSpacing || 0}px`,
              fontFamily: bodyFont.family,
              color: getTextColor(bodyTextLayer.color),
              margin: '0.4em 0 0 0',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              ...shadowStyle,
            }}
          >
            {bodyTextLayer.content}
          </p>
        )}
      </>
    )
  }

  // Render CTA
  const renderCta = (withShadow = false) => {
    const cta = getTextLayer('cta')
    const shadowStyle = withShadow ? { textShadow: '0 1px 2px rgba(0,0,0,0.3)' } : {}

    if (!cta.visible || !cta.content) return null
    return (
      <p
        style={{
          fontSize: Math.round(platform.width * 0.028 * (cta.size || 1)),
          fontWeight: cta.bold !== false ? 600 : 400,
          fontStyle: cta.italic ? 'italic' : 'normal',
          letterSpacing: `${cta.letterSpacing || 0}px`,
          fontFamily: bodyFont.family,
          color: getTextColor(cta.color),
          margin: '0.8em 0 0 0',
          lineHeight: 1.3,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          ...shadowStyle,
        }}
      >
        {cta.content}
      </p>
    )
  }

  // Render footnote
  const renderFootnote = (withShadow = false) => {
    const footnote = getTextLayer('footnote')
    const shadowStyle = withShadow ? { textShadow: '0 1px 2px rgba(0,0,0,0.3)' } : {}

    if (!footnote.visible || !footnote.content) return null
    return (
      <p
        style={{
          fontSize: Math.round(platform.width * 0.015 * (footnote.size || 1)),
          fontWeight: footnote.bold ? 700 : 400,
          fontStyle: footnote.italic ? 'italic' : 'normal',
          letterSpacing: `${footnote.letterSpacing || 0}px`,
          fontFamily: bodyFont.family,
          color: getTextColor(footnote.color),
          margin: '1em 0 0 0',
          lineHeight: 1.3,
          opacity: 0.8,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          ...shadowStyle,
        }}
      >
        {footnote.content}
      </p>
    )
  }

  // Render a single text group with its alignment
  const renderGroupWithAlignment = (groupId, renderFn, withShadow, padding) => {
    const textAlign = getGroupTextAlign(groupId)
    const verticalAlign = getGroupVerticalAlign(groupId)

    return (
      <div
        key={groupId}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: getJustifyContent(verticalAlign),
          alignItems: getAlignItems(textAlign),
          padding,
          textAlign,
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '90%', overflow: 'hidden' }}>
          {renderFn(withShadow)}
        </div>
      </div>
    )
  }

  // Render text groups for a specific cell - each group with its own alignment
  const renderTextGroupsForCell = (cellIndex, isOnImage) => {
    const groups = getGroupsForCell(cellIndex, isOnImage)
    const withShadow = isOnImage
    const padding = getCellPadding(cellIndex)

    // Group render functions mapping
    const groupRenderFns = {
      titleGroup: renderTitleGroup,
      bodyGroup: renderBodyGroup,
      cta: renderCta,
      footnote: renderFootnote,
    }

    return (
      <>
        {groups.map(groupId => renderGroupWithAlignment(groupId, groupRenderFns[groupId], withShadow, padding))}
      </>
    )
  }

  // Render fullbleed layout (no split) - each group with its own alignment
  const renderFullbleed = () => {
    const padding = getCellPadding(0)

    const groupRenderFns = {
      titleGroup: renderTitleGroup,
      bodyGroup: renderBodyGroup,
      cta: renderCta,
      footnote: renderFootnote,
    }

    return (
      <>
        {renderImage({ position: 'absolute', inset: 0 })}
        {/* Each group gets its own alignment container */}
        {Object.keys(groupRenderFns).map(groupId =>
          renderGroupWithAlignment(groupId, groupRenderFns[groupId], true, padding)
        )}
      </>
    )
  }

  // Render a single cell content
  const renderCellContent = (cellIndex) => {
    const hasImage = isImageCell(cellIndex)
    const textGroupsOnImage = hasImage ? getGroupsForCell(cellIndex, true) : []
    const textGroupsOnBackground = getGroupsForCell(cellIndex, false)
    const cellOverlay = getCellOverlay(cellIndex, hasImage)

    return (
      <>
        {/* Background for non-image cells */}
        {!hasImage && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: themeColors.primary }} />
        )}

        {/* Image for image cells */}
        {hasImage && renderImage({ position: 'absolute', inset: 0 })}

        {/* Overlay for non-image cells (if enabled) */}
        {!hasImage && cellOverlay && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: getOverlayStyle(cellOverlay),
            }}
          />
        )}

        {/* Text on image layer - each group has its own alignment */}
        {hasImage && textGroupsOnImage.length > 0 && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
            {renderTextGroupsForCell(cellIndex, true)}
          </div>
        )}

        {/* Text on background (non-image cells) - each group has its own alignment */}
        {!hasImage && textGroupsOnBackground.length > 0 && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            {renderTextGroupsForCell(cellIndex, false)}
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
