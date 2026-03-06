import { useState, useCallback, memo } from 'react'
import { toPng, toJpeg, toCanvas } from 'html-to-image'
import { jsPDF } from 'jspdf'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { platforms, categoryLabels, categoryOrder, platformsByCategory, findFormat } from '../config/platforms'

// Requirement: Export in multiple image formats (PNG, JPG, WebP)
// Approach: Format toggle above export buttons, shared captureElement helper
// Why: Different platforms recommend different formats. JPG for photos (smaller),
//   PNG for text/graphics (lossless), WebP for best compression.
// Alternatives:
//   - Always PNG: Rejected - users asked for format choice, platforms recommend JPG
//   - Auto-detect from platform: Rejected - user should have final say

const FORMAT_OPTIONS = [
  { id: 'png', label: 'PNG', description: 'Lossless, best for text & graphics' },
  { id: 'jpg', label: 'JPG', description: 'Smaller files, best for photos' },
  { id: 'webp', label: 'WebP', description: 'Smallest files, modern format' },
]

const FILE_EXTENSIONS = { jpg: 'jpg', webp: 'webp', png: 'png' }

// Consistent filename prefix for all export types
const FILE_PREFIX = 'canvagrid'

// Wait for React re-render + browser paint to settle before canvas capture
function waitForPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100)))
  })
}

// Temporarily hide canvas during export and restore after.
// Returns a restore function to call in finally blocks.
function hideCanvas(element) {
  const originalOpacity = element.style.opacity
  element.style.opacity = '0'
  return () => { element.style.opacity = originalOpacity }
}

// Set canvas to full size for capture, returns restore function
function setFullScale(element) {
  const originalTransform = element.style.transform
  element.style.transform = 'scale(1)'
  return () => { element.style.transform = originalTransform }
}

// Capture element as blob in the selected format
async function captureAsBlob(element, width, height, format) {
  const options = {
    width,
    height,
    pixelRatio: 1,
    style: { opacity: '1', transform: 'scale(1)' },
  }

  if (format === 'jpg') {
    const dataUrl = await toJpeg(element, { ...options, quality: 0.92 })
    const response = await fetch(dataUrl)
    return response.blob()
  }

  if (format === 'webp') {
    const canvas = await toCanvas(element, options)
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.92))
  }

  // Default: PNG
  const dataUrl = await toPng(element, options)
  const response = await fetch(dataUrl)
  return response.blob()
}

// Capture element as data URL (for PDF embedding, always PNG)
async function captureAsDataUrl(element, width, height) {
  return toPng(element, {
    width,
    height,
    pixelRatio: 1,
    style: { opacity: '1', transform: 'scale(1)' },
  })
}

export default memo(function ExportButtons({ canvasRef, state, onPlatformChange, onExportFormatChange, onExportingChange, pageCount = 1, onSetActivePage }) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(null)
  const [showMultiSelect, setShowMultiSelect] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => new Set())

  const exportFormat = state.exportFormat || 'png'
  const ext = FILE_EXTENSIONS[exportFormat] || 'png'
  const currentFormat = findFormat(state.platform)

  const togglePlatform = useCallback((platformId) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev)
      if (next.has(platformId)) {
        next.delete(platformId)
      } else {
        next.add(platformId)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedPlatforms(new Set(platforms.map((p) => p.id)))
  }, [])

  const selectNone = useCallback(() => {
    setSelectedPlatforms(new Set())
  }, [])

  const selectCategory = useCallback((category) => {
    const catPlatforms = platforms.filter((p) => (p.category || 'other') === category)
    setSelectedPlatforms((prev) => {
      const next = new Set(prev)
      catPlatforms.forEach((p) => next.add(p.id))
      return next
    })
  }, [])

  const updateExporting = useCallback((value) => {
    setIsExporting(value)
    onExportingChange?.(value)
  }, [onExportingChange])

  // Requirement: Single-image download matching the multi-platform export reliability
  // Approach: Set transform AFTER React re-render settles
  // Alternatives:
  //   - Set transform before waiting: Rejected - React re-render from updateExporting()
  //     overwrites the manual transform back to scale(previewScale) during the wait
  const handleExportSingle = useCallback(async () => {
    if (!canvasRef.current) return

    const platform = platforms.find((p) => p.id === state.platform)
    if (!platform) return

    updateExporting(true)
    const restoreOpacity = hideCanvas(canvasRef.current)

    try {
      await waitForPaint()

      const restoreTransform = setFullScale(canvasRef.current)
      await waitForPaint()

      const blob = await captureAsBlob(canvasRef.current, platform.width, platform.height, exportFormat)
      restoreTransform()

      saveAs(blob, `${FILE_PREFIX}-${platform.id}-${platform.width}x${platform.height}.${ext}`)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      restoreOpacity()
      updateExporting(false)
    }
  }, [canvasRef, state.platform, exportFormat, ext, updateExporting])

  const handleExportAllPages = useCallback(async () => {
    if (!canvasRef.current || pageCount <= 1) return

    updateExporting(true)
    const zip = new JSZip()
    const platform = platforms.find((p) => p.id === state.platform)
    if (!platform) { updateExporting(false); return }

    const originalActivePage = state.activePage
    const restoreOpacity = hideCanvas(canvasRef.current)

    try {
      for (let i = 0; i < pageCount; i++) {
        setExportProgress({ current: i + 1, total: pageCount, name: `Page ${i + 1}` })

        onSetActivePage(i)
        await new Promise((resolve) => setTimeout(resolve, 300))
        await waitForPaint()

        const restoreTransform = setFullScale(canvasRef.current)
        await waitForPaint()

        const blob = await captureAsBlob(canvasRef.current, platform.width, platform.height, exportFormat)
        restoreTransform()

        const pageNum = String(i + 1).padStart(3, '0')
        zip.file(`${FILE_PREFIX}-page-${pageNum}-${platform.width}x${platform.height}.${ext}`, blob)
      }

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${FILE_PREFIX}-pages.zip`)

      onSetActivePage(originalActivePage)
    } catch (error) {
      console.error('Page export failed:', error)
      alert('Export failed. Please try again.')
      onSetActivePage(originalActivePage)
    } finally {
      restoreOpacity()
      updateExporting(false)
      setExportProgress(null)
    }
  }, [canvasRef, state.platform, state.activePage, exportFormat, ext, pageCount, onSetActivePage, updateExporting])

  // Requirement: PDF export for LinkedIn carousel documents and general print-to-PDF
  // Approach: Capture pages as PNGs, build PDF with jsPDF using exact platform dimensions
  // Why: Previous window.open + window.print approach failed on mobile:
  //   - Opened about:blank tab (popup handling differs on mobile)
  //   - Mobile browsers ignore @page size CSS, defaulting to A4/Letter (wrong dimensions)
  //   - Required user to navigate print dialog instead of direct download
  // Alternatives:
  //   - window.open + window.print: Rejected - broken on mobile (about:blank, wrong sizes)
  //   - Direct window.print() on app: Rejected - prints entire UI, not just canvas
  // Note: PDF always uses PNG internally for lossless quality regardless of exportFormat
  const handleExportPDF = useCallback(async () => {
    if (!canvasRef.current) return

    const platform = platforms.find((p) => p.id === state.platform)
    if (!platform) return

    updateExporting(true)
    const restoreOpacity = hideCanvas(canvasRef.current)

    const pageDataUrls = []
    const originalActivePage = state.activePage
    const totalPages = pageCount > 1 ? pageCount : 1

    try {
      for (let i = 0; i < totalPages; i++) {
        if (totalPages > 1) {
          setExportProgress({ current: i + 1, total: totalPages, name: `Page ${i + 1}` })
          onSetActivePage(i)
          await new Promise((resolve) => setTimeout(resolve, 300))
          await waitForPaint()
        } else {
          await waitForPaint()
        }

        const restoreTransform = setFullScale(canvasRef.current)
        await waitForPaint()

        const dataUrl = await captureAsDataUrl(canvasRef.current, platform.width, platform.height)
        restoreTransform()
        pageDataUrls.push(dataUrl)
      }

      if (totalPages > 1) {
        onSetActivePage(originalActivePage)
      }

      // Build PDF with exact platform dimensions using jsPDF
      // jsPDF uses points (72 per inch). Convert pixels to points at 72 DPI
      // so the PDF page size matches the image pixel dimensions exactly.
      // This prevents letterboxing on non-standard aspect ratios (1:1, 4:5, etc.)
      const pxToPt = 72 / 96
      const widthPt = platform.width * pxToPt
      const heightPt = platform.height * pxToPt
      const orientation = platform.width >= platform.height ? 'landscape' : 'portrait'

      const pdf = new jsPDF({
        orientation,
        unit: 'pt',
        format: [widthPt, heightPt],
      })

      for (let i = 0; i < pageDataUrls.length; i++) {
        if (i > 0) {
          pdf.addPage([widthPt, heightPt], orientation)
        }
        pdf.addImage(pageDataUrls[i], 'PNG', 0, 0, widthPt, heightPt)
      }

      pdf.save(`${FILE_PREFIX}-${platform.id}-${platform.width}x${platform.height}.pdf`)
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('PDF export failed. Please try again.')
      if (totalPages > 1) {
        onSetActivePage(originalActivePage)
      }
    } finally {
      restoreOpacity()
      updateExporting(false)
      setExportProgress(null)
    }
  }, [canvasRef, state.platform, state.activePage, pageCount, onSetActivePage, updateExporting])

  const handleExportMultiple = useCallback(async () => {
    if (!canvasRef.current) return
    if (selectedPlatforms.size === 0) {
      alert('Please select at least one platform to export.')
      return
    }

    updateExporting(true)
    const zip = new JSZip()
    const originalPlatform = state.platform

    const platformsToExport = platforms.filter((p) => selectedPlatforms.has(p.id))
    const restoreOpacity = hideCanvas(canvasRef.current)

    try {
      for (let i = 0; i < platformsToExport.length; i++) {
        const platform = platformsToExport[i]
        setExportProgress({ current: i + 1, total: platformsToExport.length, name: platform.name })

        onPlatformChange(platform.id)
        await waitForPaint()

        const restoreTransform = setFullScale(canvasRef.current)
        await waitForPaint()

        const blob = await captureAsBlob(canvasRef.current, platform.width, platform.height, exportFormat)
        restoreTransform()

        zip.file(`${FILE_PREFIX}-${platform.id}-${platform.width}x${platform.height}.${ext}`, blob)
      }

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${FILE_PREFIX}-multi.zip`)

      onPlatformChange(originalPlatform)
      setShowMultiSelect(false)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
      onPlatformChange(originalPlatform)
    } finally {
      restoreOpacity()
      updateExporting(false)
      setExportProgress(null)
    }
  }, [canvasRef, state.platform, exportFormat, ext, onPlatformChange, updateExporting, selectedPlatforms])

  return (
    <div className="space-y-3">
      {/* Format selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-ui-text-muted">File Format</span>
          {currentFormat.recommendedFormat && currentFormat.recommendedFormat !== exportFormat && (
            <button
              onClick={() => onExportFormatChange(currentFormat.recommendedFormat)}
              className="text-[10px] text-primary hover:text-primary-hover transition-colors"
            >
              Use recommended ({currentFormat.recommendedFormat.toUpperCase()})
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onExportFormatChange(opt.id)}
              title={opt.description}
              className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                exportFormat === opt.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleExportSingle}
        disabled={isExporting}
        className="w-full px-4 py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-glow active:scale-[0.98] btn-scale"
      >
        {isExporting && !exportProgress ? 'Exporting...' : `Download Current (.${ext})`}
      </button>

      {/* Download all pages as ZIP */}
      {pageCount > 1 && (
        <button
          onClick={handleExportAllPages}
          disabled={isExporting}
          className="w-full px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {exportProgress && !showMultiSelect
            ? `Exporting Page ${exportProgress.current}/${exportProgress.total}...`
            : `Download All ${pageCount} Pages (ZIP)`}
        </button>
      )}

      {/* Download as PDF - for LinkedIn carousels and print */}
      <button
        onClick={handleExportPDF}
        disabled={isExporting}
        className="w-full px-4 py-3 text-sm font-semibold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        {exportProgress && !showMultiSelect
          ? `Preparing Page ${exportProgress.current}/${exportProgress.total}...`
          : pageCount > 1
            ? `Download ${pageCount} Pages as PDF`
            : 'Download as PDF'}
      </button>

      <button
        onClick={() => setShowMultiSelect(!showMultiSelect)}
        disabled={isExporting}
        className="w-full px-4 py-3 text-sm font-semibold text-primary dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        {showMultiSelect ? 'Hide Selection' : 'Download Multiple Platforms (ZIP)'}
      </button>

      {/* Multi-select platform UI */}
      {showMultiSelect && (
        <div className="space-y-3 p-3 bg-ui-surface-elevated rounded-lg border border-ui-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ui-text-muted">
              {selectedPlatforms.size} of {platforms.length} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-primary hover:underline"
              >
                Select All
              </button>
              <button
                onClick={selectNone}
                className="text-xs text-ui-text-subtle hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categoryOrder.map((category) => {
              const catPlatforms = platformsByCategory[category]
              if (!catPlatforms || catPlatforms.length === 0) return null

              const allSelected = catPlatforms.every((p) => selectedPlatforms.has(p.id))
              const someSelected = catPlatforms.some((p) => selectedPlatforms.has(p.id))

              return (
                <div key={category} className="space-y-1">
                  <button
                    onClick={() => selectCategory(category)}
                    className="text-[10px] text-ui-text-faint uppercase tracking-wide font-medium hover:text-primary transition-colors"
                  >
                    {categoryLabels[category] || category}
                    {someSelected && !allSelected && <span className="ml-1 text-primary">+</span>}
                  </button>
                  <div className="flex flex-wrap gap-1">
                    {catPlatforms.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        title={`${p.width} × ${p.height}`}
                        className={`px-2 py-0.5 text-xs rounded font-medium transition-all ${
                          selectedPlatforms.has(p.id)
                            ? 'bg-primary text-white'
                            : 'bg-ui-surface text-ui-text-muted hover:bg-ui-surface-inset border border-ui-border'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={handleExportMultiple}
            disabled={isExporting || selectedPlatforms.size === 0}
            className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {exportProgress
              ? `Exporting ${exportProgress.current}/${exportProgress.total}...`
              : `Export ${selectedPlatforms.size} Platform${selectedPlatforms.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {exportProgress && (
        <div className="space-y-2">
          <div className="w-full bg-ui-surface-hover rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-creative h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
            />
          </div>
          <p className="text-sm text-center text-ui-text-subtle">
            Processing: {exportProgress.name}
          </p>
        </div>
      )}
    </div>
  )
})
