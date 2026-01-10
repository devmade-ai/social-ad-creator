import { forwardRef, useMemo } from 'react'
import { overlayTypes, hexToRgb } from '../config/layouts'
import { platforms } from '../config/platforms'
import { fonts } from '../config/fonts'

const defaultTextLayer = { content: '', visible: false, color: 'secondary', size: 1 }

const AdCanvas = forwardRef(function AdCanvas({ state, scale = 1 }, ref) {
  const platform = platforms.find((p) => p.id === state.platform) || platforms[0]
  const layout = state.layout
  const titleFont = fonts.find((f) => f.id === state.fonts.title) || fonts[0]
  const bodyFont = fonts.find((f) => f.id === state.fonts.body) || fonts[0]

  const themeColors = useMemo(() => ({
    primary: state.theme.primary,
    secondary: state.theme.secondary,
    accent: state.theme.accent,
  }), [state.theme])

  const overlayColor = themeColors[state.overlay.color] || themeColors.primary
  const overlayType = overlayTypes.find((o) => o.id === state.overlay.type) || overlayTypes[0]
  const overlayStyle = overlayType.getCss(hexToRgb(overlayColor), state.overlay.opacity)

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

  // Render image with overlay
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
            filter: state.imageGrayscale ? 'grayscale(100%)' : 'none',
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

  // Render all text content (for solid background sections)
  const renderAllText = () => {
    const title = getTextLayer('title')
    const tagline = getTextLayer('tagline')
    const bodyHeading = getTextLayer('bodyHeading')
    const bodyText = getTextLayer('bodyText')
    const cta = getTextLayer('cta')
    const footnote = getTextLayer('footnote')

    return (
      <div style={{ maxWidth: '90%', overflow: 'hidden' }}>
        {title.visible && title.content && (
          <h1
            style={{
              fontSize: Math.round(platform.width * 0.05 * (title.size || 1)),
              fontWeight: 700,
              fontFamily: titleFont.family,
              color: getTextColor(title.color),
              margin: 0,
              lineHeight: 1.2,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {title.content}
          </h1>
        )}
        {tagline.visible && tagline.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.028 * (tagline.size || 1)),
              fontWeight: 500,
              fontFamily: bodyFont.family,
              color: getTextColor(tagline.color),
              margin: '0.4em 0 0 0',
              lineHeight: 1.3,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {tagline.content}
          </p>
        )}
        {bodyHeading.visible && bodyHeading.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.026 * (bodyHeading.size || 1)),
              fontWeight: 600,
              fontFamily: bodyFont.family,
              color: getTextColor(bodyHeading.color),
              margin: '0.8em 0 0 0',
              lineHeight: 1.3,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {bodyHeading.content}
          </p>
        )}
        {bodyText.visible && bodyText.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.022 * (bodyText.size || 1)),
              fontWeight: 400,
              fontFamily: bodyFont.family,
              color: getTextColor(bodyText.color),
              margin: '0.4em 0 0 0',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {bodyText.content}
          </p>
        )}
        {cta.visible && cta.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.028 * (cta.size || 1)),
              fontWeight: 600,
              fontFamily: bodyFont.family,
              color: getTextColor(cta.color),
              margin: '0.8em 0 0 0',
              lineHeight: 1.3,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {cta.content}
          </p>
        )}
        {footnote.visible && footnote.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.015 * (footnote.size || 1)),
              fontWeight: 400,
              fontFamily: bodyFont.family,
              color: getTextColor(footnote.color),
              margin: '1em 0 0 0',
              lineHeight: 1.3,
              opacity: 0.8,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {footnote.content}
          </p>
        )}
      </div>
    )
  }

  // Render overlay text (title, tagline, CTA on image)
  const renderOverlayText = () => {
    const title = getTextLayer('title')
    const tagline = getTextLayer('tagline')
    const cta = getTextLayer('cta')

    return (
      <div style={{ maxWidth: '95%' }}>
        {title.visible && title.content && (
          <h1
            style={{
              fontSize: Math.round(platform.width * 0.04 * (title.size || 1)),
              fontWeight: 700,
              fontFamily: titleFont.family,
              color: getTextColor(title.color),
              margin: 0,
              lineHeight: 1.2,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {title.content}
          </h1>
        )}
        {tagline.visible && tagline.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.022 * (tagline.size || 1)),
              fontWeight: 500,
              fontFamily: bodyFont.family,
              color: getTextColor(tagline.color),
              margin: '0.3em 0 0 0',
              lineHeight: 1.3,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {tagline.content}
          </p>
        )}
        {cta.visible && cta.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.022 * (cta.size || 1)),
              fontWeight: 600,
              fontFamily: bodyFont.family,
              color: getTextColor(cta.color),
              margin: '0.6em 0 0 0',
              lineHeight: 1.3,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {cta.content}
          </p>
        )}
      </div>
    )
  }

  // Render body text only (for split layouts with text overlay)
  const renderBodyText = () => {
    const bodyHeading = getTextLayer('bodyHeading')
    const bodyText = getTextLayer('bodyText')
    const footnote = getTextLayer('footnote')

    return (
      <div style={{ maxWidth: '90%', overflow: 'hidden' }}>
        {bodyHeading.visible && bodyHeading.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.022 * (bodyHeading.size || 1)),
              fontWeight: 600,
              fontFamily: bodyFont.family,
              color: getTextColor(bodyHeading.color),
              margin: 0,
              lineHeight: 1.3,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {bodyHeading.content}
          </p>
        )}
        {bodyText.visible && bodyText.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.018 * (bodyText.size || 1)),
              fontWeight: 400,
              fontFamily: bodyFont.family,
              color: getTextColor(bodyText.color),
              margin: '0.4em 0 0 0',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {bodyText.content}
          </p>
        )}
        {footnote.visible && footnote.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.012 * (footnote.size || 1)),
              fontWeight: 400,
              fontFamily: bodyFont.family,
              color: getTextColor(footnote.color),
              margin: '1em 0 0 0',
              lineHeight: 1.3,
              opacity: 0.8,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {footnote.content}
          </p>
        )}
      </div>
    )
  }

  // Render fullbleed layout (no split)
  const renderFullbleed = () => (
    <>
      {renderImage({ position: 'absolute', inset: 0 })}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: getJustifyContent(layout.textVerticalAlign),
          alignItems: getAlignItems(layout.textAlign),
          padding: '5%',
          textAlign: layout.textAlign,
        }}
      >
        {renderAllText()}
      </div>
    </>
  )

  // Render a text section
  const renderTextSection = (sizeStyle, renderContent = renderAllText) => (
    <div
      style={{
        ...sizeStyle,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: getJustifyContent(layout.textVerticalAlign),
        alignItems: getAlignItems(layout.textAlign),
        padding: '5%',
        backgroundColor: themeColors.primary,
        textAlign: layout.textAlign,
      }}
    >
      {renderContent()}
    </div>
  )

  // Render an image section (with optional text overlay)
  const renderImageSection = (sizeStyle) => {
    if (layout.textOnImage) {
      return (
        <div style={{ position: 'relative', ...sizeStyle }}>
          {renderImage({ position: 'absolute', inset: 0 })}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: getAlignItems(layout.textAlign),
              padding: '5%',
              textAlign: layout.textAlign,
            }}
          >
            {renderOverlayText()}
          </div>
        </div>
      )
    }
    return renderImage(sizeStyle)
  }

  // Render split layout (vertical or horizontal)
  const renderSplitLayout = () => {
    const { splitType, sections, imagePosition, imageProportion, textOnImage } = layout
    const isVertical = splitType === 'vertical'
    const flexDirection = isVertical ? 'row' : 'column'
    const sizeProp = isVertical ? 'width' : 'height'

    const imgSize = `${imageProportion}%`
    const textSize = sections === 2
      ? `${100 - imageProportion}%`
      : `${(100 - imageProportion) / 2}%`

    const sectionElements = []

    for (let i = 0; i < sections; i++) {
      const isImage =
        (imagePosition === 'first' && i === 0) ||
        (imagePosition === 'middle' && i === 1) ||
        (imagePosition === 'last' && i === sections - 1)

      const size = isImage ? imgSize : textSize
      const sizeStyle = { [sizeProp]: size, height: isVertical ? '100%' : undefined, width: isVertical ? undefined : '100%' }

      if (isImage) {
        sectionElements.push(
          <div key={i} style={sizeStyle}>
            {renderImageSection({ width: '100%', height: '100%' })}
          </div>
        )
      } else {
        // For text sections, decide what content to show
        const contentRenderer = textOnImage ? renderBodyText : renderAllText
        sectionElements.push(
          <div key={i} style={sizeStyle}>
            {renderTextSection({ width: '100%', height: '100%' }, contentRenderer)}
          </div>
        )
      }
    }

    return (
      <div style={{ display: 'flex', flexDirection, height: '100%', width: '100%' }}>
        {sectionElements}
      </div>
    )
  }

  // Main render logic
  const renderLayout = () => {
    if (layout.splitType === 'none') {
      return renderFullbleed()
    }
    return renderSplitLayout()
  }

  return (
    <div ref={ref} style={containerStyle}>
      {renderLayout()}
      {renderLogo()}
    </div>
  )
})

export default AdCanvas
