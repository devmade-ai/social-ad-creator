import { useState, useCallback, memo } from 'react'
import { toCanvas } from 'html-to-image'
import { PDFDocument } from 'pdf-lib'
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

// Requirement: Timestamp-first filenames for chronological sort in downloads folder
// Approach: YYMMdd-HHmm prefix ensures newest files sort first alphabetically.
//   Also avoids browser "already exists" prompts on repeated downloads.
// Alternatives:
//   - App name prefix (canvagrid-): Rejected - adds noise, doesn't help sorting
//   - Full ISO timestamp: Rejected - too long, clutters filename
//   - Unix epoch: Rejected - not human-readable
function getTimestamp() {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  return `${yy}${mm}${dd}-${hh}${min}`
}

// Wait for React re-render + browser paint to settle before canvas capture.
// Double-rAF ensures at least one paint cycle has occurred.
// Extra 100ms timeout ensures complex layouts with images/fonts are fully composited on slower devices.
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

// Capture element as blob in the selected format.
// Uses toCanvas → canvas.toBlob for all formats to avoid the wasteful
// fetch(dataUrl) round-trip that the toJpeg/toPng → fetch pattern requires.
const MIME_TYPES = { jpg: 'image/jpeg', webp: 'image/webp', png: 'image/png' }

async function captureAsBlob(element, width, height, format) {
  const canvas = await toCanvas(element, {
    width,
    height,
    pixelRatio: 1,
    style: { opacity: '1', transform: 'scale(1)' },
  })
  const mime = MIME_TYPES[format] || 'image/png'
  // PNG is lossless (no quality param). WebP needs higher quality than JPG because
  // its lossy encoder handles smooth gradients differently — 0.95 can show subtle
  // blocking on vignettes that JPG doesn't at the same number.
  const quality = format === 'png' ? undefined : format === 'webp' ? 0.98 : 0.95
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Canvas capture failed — image may be cross-origin')),
      mime,
      quality,
    )
  )
}

// Requirement: PDF export with identical quality to PNG/JPG image exports.
// Approach: Capture at pixelRatio:1 (same as image exports) and use PNG lossless.
//   Page dimensions set to platform pixel dimensions (1px = 1pt) so the embedded
//   image maps 1:1 to PDF page units — no viewer resampling needed.
// Why: Previous approach used pixelRatio:2 with 72/96 pt conversion, forcing PDF
//   viewers to downsample the image. PDF viewers (especially Chrome's) use cheap
//   bilinear interpolation that destroys smooth gradients (vignettes, radial overlays).
//   Physical print dimensions don't matter for social media/web exports.
// Alternatives:
//   - pixelRatio:2 with pt conversion: Rejected — PDF viewer resampling degrades
//     smooth gradients. Vignette overlays looked ~30% quality vs 100% in PNG.
//   - JPEG capture: Rejected — DCT 8x8 blocks cause banding on smooth gradients.
//     PNG is lossless and pdf-lib embeds via FlateDecode (no re-encoding).

async function captureForPdf(element, width, height) {
  const canvas = await toCanvas(element, {
    width,
    height,
    pixelRatio: 1,
    style: { opacity: '1', transform: 'scale(1)' },
  })
  // PNG: lossless capture — pdf-lib embeds directly with FlateDecode (no re-encoding).
  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => b ? resolve(b) : reject(new Error('Canvas capture failed')),
      'image/png',
    )
  )
  return { data: new Uint8Array(await blob.arrayBuffer()), format: 'png' }
}

// Diagnostic: download the raw captured image to compare quality vs the PDF output.
// Kept for future debugging — confirms capture quality matches PDF output.
function downloadDiagnosticImage(imageResult, platformId) {
  const blob = new Blob([imageResult.data], { type: 'image/png' })
  saveAs(blob, `pdf-diagnostic-${platformId}.png`)
}

export default memo(function ExportButtons({ canvasRef, state, onPlatformChange, onExportFormatChange, onExportingChange, pageCount = 1, onSetActivePage }) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(null)
  // Requirement: Track which export operation is active so each button shows its own progress.
  // Approach: String state ('single' | 'allPages' | 'pdf' | 'multi') instead of shared boolean.
  // Alternatives:
  //   - Shared boolean: Rejected — PDF button couldn't show progress when multi-select panel was open.
  const [exportOp, setExportOp] = useState(null)
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

  // Requirement: Category header toggles selection (select all if any unselected, deselect all if all selected).
  // Approach: Check if all platforms in the category are already selected; if so, deselect them.
  // Alternatives:
  //   - Add-only: Rejected — users expect toggle behavior from a category header click.
  const selectCategory = useCallback((category) => {
    const catPlatforms = platforms.filter((p) => (p.category || 'other') === category)
    setSelectedPlatforms((prev) => {
      const next = new Set(prev)
      const allSelected = catPlatforms.every((p) => prev.has(p.id))
      if (allSelected) {
        catPlatforms.forEach((p) => next.delete(p.id))
      } else {
        catPlatforms.forEach((p) => next.add(p.id))
      }
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
    setExportOp('single')
    const restoreOpacity = hideCanvas(canvasRef.current)

    try {
      await waitForPaint()

      const restoreTransform = setFullScale(canvasRef.current)
      await waitForPaint()

      const blob = await captureAsBlob(canvasRef.current, platform.width, platform.height, exportFormat)
      restoreTransform()

      const ts = getTimestamp()
      const pageSuffix = pageCount > 1 ? `-p${String(state.activePage + 1).padStart(2, '0')}` : ''
      saveAs(blob, `${ts}-${platform.id}-${platform.width}x${platform.height}${pageSuffix}.${ext}`)
    } catch (error) {
      alert('Export failed. Please try again.')
    } finally {
      restoreOpacity()
      updateExporting(false)
      setExportOp(null)
    }
  }, [canvasRef, state.platform, state.activePage, exportFormat, ext, pageCount, updateExporting])

  const handleExportAllPages = useCallback(async () => {
    if (!canvasRef.current || pageCount <= 1) return

    updateExporting(true)
    setExportOp('allPages')
    const zip = new JSZip()
    const platform = platforms.find((p) => p.id === state.platform)
    if (!platform) { updateExporting(false); setExportOp(null); return }

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

        const pageNum = String(i + 1).padStart(2, '0')
        zip.file(`${platform.id}-${platform.width}x${platform.height}-p${pageNum}.${ext}`, blob)
      }

      const content = await zip.generateAsync({ type: 'blob' })
      const ts = getTimestamp()
      saveAs(content, `${ts}-pages.zip`)

      onSetActivePage(originalActivePage)
    } catch (error) {
      alert('Export failed. Please try again.')
      onSetActivePage(originalActivePage)
    } finally {
      restoreOpacity()
      updateExporting(false)
      setExportProgress(null)
      setExportOp(null)
    }
  }, [canvasRef, state.platform, state.activePage, exportFormat, ext, pageCount, onSetActivePage, updateExporting])

  // Requirement: PDF export for LinkedIn carousel documents and general print-to-PDF
  // Approach: Capture pages as lossless PNG at pixelRatio:1, build PDF with pdf-lib
  //   using 1:1 pixel-to-point mapping. No viewer resampling needed — smooth gradients
  //   (vignettes, radials) render identically to PNG/JPG exports.
  // Why: Previous window.open + window.print approach failed on mobile:
  //   - Opened about:blank tab (popup handling differs on mobile)
  //   - Mobile browsers ignore @page size CSS, defaulting to A4/Letter (wrong dimensions)
  //   - Required user to navigate print dialog instead of direct download
  // Alternatives:
  //   - jsPDF: Replaced — suspected quality loss in addImage dimension scaling.
  //   - window.open + window.print: Rejected - broken on mobile (about:blank, wrong sizes)
  //   - Direct window.print() on app: Rejected - prints entire UI, not just canvas
  const handleExportPDF = useCallback(async () => {
    if (!canvasRef.current) return

    const platform = platforms.find((p) => p.id === state.platform)
    if (!platform) return

    updateExporting(true)
    setExportOp('pdf')
    const restoreOpacity = hideCanvas(canvasRef.current)

    const pageImages = []
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

        const imageResult = await captureForPdf(canvasRef.current, platform.width, platform.height)
        restoreTransform()
        pageImages.push(imageResult)
      }

      if (totalPages > 1) {
        onSetActivePage(originalActivePage)
      }

      // Diagnostic: download raw captured image for first page to compare vs PDF output.
      // This isolates whether quality loss is in capture or PDF embedding.
      if (import.meta.env.DEV && pageImages.length > 0) {
        downloadDiagnosticImage(pageImages[0], platform.id)
      }

      // Requirement: PDF page dimensions must match the intended use case.
      // Approach: Print formats (A3/A4/A5) use proper DPI-to-point conversion so the
      //   PDF prints at the correct physical size. Digital formats use 1:1 pixel-to-point
      //   mapping so the PDF viewer doesn't resample (which destroys smooth gradients).
      // Why: Print platforms are defined at 150 DPI (e.g. A4 = 1240×1754px). Converting
      //   px → points via 72/150 gives the correct physical page size (8.27×11.69in).
      //   Digital platforms (social, web) don't have a meaningful physical size — pixel
      //   quality matters, so 1:1 mapping avoids viewer resampling artifacts.
      // Alternatives:
      //   - 72/96 for everything: Rejected — wrong physical size for print (assumes 96 DPI
      //     but print formats are 150 DPI), and causes resampling artifacts on digital.
      //   - 1:1 for everything: Rejected — print PDFs would be wrong physical size.
      const isPrint = platform.category === 'print'
      const pxToPt = isPrint ? 72 / 150 : 1
      const widthPt = platform.width * pxToPt
      const heightPt = platform.height * pxToPt

      const pdfDoc = await PDFDocument.create()

      for (let i = 0; i < pageImages.length; i++) {
        const { data, format } = pageImages[i]
        // pdf-lib embedPng: embeds raw bytes with FlateDecode — no re-encoding.
        const image = format === 'png'
          ? await pdfDoc.embedPng(data)
          : await pdfDoc.embedJpg(data)

        const page = pdfDoc.addPage([widthPt, heightPt])
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: widthPt,
          height: heightPt,
        })
      }

      const pdfBytes = await pdfDoc.save()
      const ts = getTimestamp()
      saveAs(
        new Blob([pdfBytes], { type: 'application/pdf' }),
        `${ts}-${platform.id}-${platform.width}x${platform.height}.pdf`
      )
    } catch (error) {
      alert('PDF export failed. Please try again.')
      if (totalPages > 1) {
        onSetActivePage(originalActivePage)
      }
    } finally {
      restoreOpacity()
      updateExporting(false)
      setExportProgress(null)
      setExportOp(null)
    }
  }, [canvasRef, state.platform, state.activePage, pageCount, onSetActivePage, updateExporting])

  const handleExportMultiple = useCallback(async () => {
    if (!canvasRef.current) return
    if (selectedPlatforms.size === 0) {
      alert('Please select at least one platform to export.')
      return
    }

    updateExporting(true)
    setExportOp('multi')
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

        zip.file(`${platform.id}-${platform.width}x${platform.height}.${ext}`, blob)
      }

      const content = await zip.generateAsync({ type: 'blob' })
      const ts = getTimestamp()
      saveAs(content, `${ts}-multi.zip`)

      onPlatformChange(originalPlatform)
      setShowMultiSelect(false)
    } catch (error) {
      alert('Export failed. Please try again.')
      onPlatformChange(originalPlatform)
    } finally {
      restoreOpacity()
      updateExporting(false)
      setExportProgress(null)
      setExportOp(null)
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
        {exportOp === 'single' ? 'Exporting...' : `Download Current (.${ext})`}
      </button>

      {/* Download all pages as ZIP */}
      {pageCount > 1 && (
        <button
          onClick={handleExportAllPages}
          disabled={isExporting}
          className="w-full px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {exportOp === 'allPages' && exportProgress
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
        {exportOp === 'pdf' && exportProgress
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
            {exportOp === 'multi' && exportProgress
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
