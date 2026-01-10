import { forwardRef, useMemo } from 'react'
import { layouts, overlayTypes, hexToRgb } from '../config/layouts'
import { platforms } from '../config/platforms'
import { fonts } from '../config/fonts'

const defaultTextLayer = { content: '', visible: false, color: 'secondary' }

const AdCanvas = forwardRef(function AdCanvas({ state, scale = 1 }, ref) {
  const platform = platforms.find((p) => p.id === state.platform) || platforms[0]
  const layout = layouts.find((l) => l.id === state.layout) || layouts[0]
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

  // Reusable image with overlay component
  const renderImageWithOverlay = (style = {}) => (
    <div style={{ position: 'relative', ...style }}>
      {state.image && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${state.image})`,
            backgroundSize: state.imageObjectFit,
            backgroundPosition: state.imagePosition,
            backgroundRepeat: 'no-repeat',
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

  const renderBackgroundLayout = () => (
    <>
      {renderImageWithOverlay({ position: 'absolute', inset: 0 })}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: layout.textVerticalAlign,
          alignItems: layout.textAlign === 'center' ? 'center' : layout.textAlign === 'right' ? 'flex-end' : 'flex-start',
          padding: '5%',
          textAlign: layout.textAlign,
        }}
      >
        {renderTextContent()}
      </div>
    </>
  )

  const renderVerticalLayout = () => {
    const imageWidth = `${layout.imageProportion}%`
    const textWidth = `${100 - layout.imageProportion}%`
    const isImageLeft = layout.imagePosition === 'left'

    const imageSection = renderImageWithOverlay({
      width: imageWidth,
      height: '100%',
    })

    return (
      <div style={{ display: 'flex', height: '100%', width: '100%' }}>
        {isImageLeft && imageSection}
        <div
          style={{
            width: textWidth,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '5%',
            backgroundColor: themeColors.primary,
          }}
        >
          {renderTextContent()}
        </div>
        {!isImageLeft && imageSection}
      </div>
    )
  }

  const renderHorizontalLayout = () => {
    if (layout.splitThirds) {
      return renderSplitThirds()
    }

    const imageHeight = `${layout.imageProportion}%`
    const textHeight = `${100 - layout.imageProportion}%`
    const isImageTop = layout.imagePosition === 'top'

    const imageSection = renderImageWithOverlay({
      height: imageHeight,
      width: '100%',
    })

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        {isImageTop && imageSection}
        <div
          style={{
            height: textHeight,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: layout.textAlign === 'center' ? 'center' : 'flex-start',
            padding: layout.bannerStyle ? '2%' : '5%',
            backgroundColor: themeColors.primary,
            textAlign: layout.textAlign,
          }}
        >
          {renderTextContent()}
        </div>
        {!isImageTop && imageSection}
      </div>
    )
  }

  const renderSplitThirds = () => {
    const title = getTextLayer('title')
    const tagline = getTextLayer('tagline')
    const cta = getTextLayer('cta')
    const footnote = getTextLayer('footnote')

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        <div
          style={{
            height: '33.33%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3%',
            backgroundColor: themeColors.primary,
          }}
        >
          {title.visible && title.content && (
            <h1
              style={{
                fontSize: Math.round(platform.width * 0.04),
                fontWeight: 700,
                fontFamily: titleFont.family,
                color: getTextColor(title.color),
                margin: 0,
                textAlign: 'center',
              }}
            >
              {title.content}
            </h1>
          )}
          {tagline.visible && tagline.content && (
            <p
              style={{
                fontSize: Math.round(platform.width * 0.022),
                fontWeight: 500,
                fontFamily: bodyFont.family,
                color: getTextColor(tagline.color),
                margin: '0.3em 0 0 0',
                textAlign: 'center',
              }}
            >
              {tagline.content}
            </p>
          )}
        </div>
        {renderImageWithOverlay({
          height: '33.33%',
          width: '100%',
        })}
        <div
          style={{
            height: '33.33%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3%',
            backgroundColor: themeColors.primary,
          }}
        >
          {cta.visible && cta.content && (
            <p
              style={{
                fontSize: Math.round(platform.width * 0.025),
                fontWeight: 600,
                fontFamily: bodyFont.family,
                color: getTextColor(cta.color),
                margin: 0,
                textAlign: 'center',
              }}
            >
              {cta.content}
            </p>
          )}
          {footnote.visible && footnote.content && (
            <p
              style={{
                fontSize: Math.round(platform.width * 0.015),
                fontWeight: 400,
                fontFamily: bodyFont.family,
                color: getTextColor(footnote.color),
                margin: '0.5em 0 0 0',
                textAlign: 'center',
                opacity: 0.8,
              }}
            >
              {footnote.content}
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderTextContent = () => {
    const title = getTextLayer('title')
    const tagline = getTextLayer('tagline')
    const bodyHeading = getTextLayer('bodyHeading')
    const bodyText = getTextLayer('bodyText')
    const cta = getTextLayer('cta')
    const footnote = getTextLayer('footnote')

    return (
      <div style={{ maxWidth: '90%' }}>
        {title.visible && title.content && (
          <h1
            style={{
              fontSize: Math.round(platform.width * 0.05),
              fontWeight: 700,
              fontFamily: titleFont.family,
              color: getTextColor(title.color),
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title.content}
          </h1>
        )}
        {tagline.visible && tagline.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.028),
              fontWeight: 500,
              fontFamily: bodyFont.family,
              color: getTextColor(tagline.color),
              margin: '0.4em 0 0 0',
              lineHeight: 1.3,
            }}
          >
            {tagline.content}
          </p>
        )}
        {bodyHeading.visible && bodyHeading.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.026),
              fontWeight: 600,
              fontFamily: bodyFont.family,
              color: getTextColor(bodyHeading.color),
              margin: '0.8em 0 0 0',
              lineHeight: 1.3,
            }}
          >
            {bodyHeading.content}
          </p>
        )}
        {bodyText.visible && bodyText.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.022),
              fontWeight: 400,
              fontFamily: bodyFont.family,
              color: getTextColor(bodyText.color),
              margin: '0.4em 0 0 0',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {bodyText.content}
          </p>
        )}
        {cta.visible && cta.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.028),
              fontWeight: 600,
              fontFamily: bodyFont.family,
              color: getTextColor(cta.color),
              margin: '0.8em 0 0 0',
              lineHeight: 1.3,
            }}
          >
            {cta.content}
          </p>
        )}
        {footnote.visible && footnote.content && (
          <p
            style={{
              fontSize: Math.round(platform.width * 0.015),
              fontWeight: 400,
              fontFamily: bodyFont.family,
              color: getTextColor(footnote.color),
              margin: '1em 0 0 0',
              lineHeight: 1.3,
              opacity: 0.8,
            }}
          >
            {footnote.content}
          </p>
        )}
      </div>
    )
  }

  const renderLayout = () => {
    switch (layout.category) {
      case 'background':
        return renderBackgroundLayout()
      case 'vertical':
        return renderVerticalLayout()
      case 'horizontal':
        return renderHorizontalLayout()
      default:
        return renderBackgroundLayout()
    }
  }

  return (
    <div ref={ref} style={containerStyle}>
      {renderLayout()}
    </div>
  )
})

export default AdCanvas
