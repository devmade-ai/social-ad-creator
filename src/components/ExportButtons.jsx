import { useState, useCallback, useRef, memo } from 'react'
import { toCanvas } from 'html-to-image'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { platforms, categoryLabels, categoryOrder, platformsByCategory, findFormat } from '../config/platforms'
import { debugLog } from '../utils/debugLog'
import { useToast } from './Toast'

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
  const ss = String(now.getSeconds()).padStart(2, '0')
  return `${yy}${mm}${dd}-${hh}${min}${ss}`
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

// Requirement: PDF export preserving full platform resolution for sharing/uploading.
// Approach: Capture at user-selected pixelRatio (1x/2x/3x), embed in PDF page at
//   platform pixel dimensions (1:1 px-to-pt). Image pixels exceed page points,
//   giving integer px/pt ratios (1:1 low, 2:1 standard, 3:1 high).
// Print exception: pixelRatio always 1 with 72/150 DPI-to-point conversion for
//   correct physical page size. Higher ratios would create non-integer scaling.
// History: (1) 72/96 conversion → 2.667:1 non-integer ratio, gradient banding.
//   (2) 1:1 mapping + page scaled with pixelRatio → all qualities identical on mobile.
//   (3) pxToPt=1 fixed page + variable pixelRatio → current approach.
// Alternatives:
//   - pixelRatio:1 for everything: Rejected — 72 DPI looks blurry on 2-3x screens.
//   - JPEG capture: Rejected — DCT 8x8 blocks cause banding on smooth gradients.
//     PNG is lossless and pdf-lib embeds via FlateDecode (no re-encoding).

async function captureForPdf(element, width, height, pixelRatio = 2) {
  const canvas = await toCanvas(element, {
    width,
    height,
    pixelRatio,
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

export default memo(function ExportButtons({ canvasRef, state, onPlatformChange, onExportFormatChange, onExportingChange, cancelExportRef, pageCount = 1, onSetActivePage }) {
  const { addToast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(null)
  // Requirement: Track which export operation is active so each button shows its own progress.
  // Approach: String state ('single' | 'allPages' | 'pdf' | 'multi') instead of shared boolean.
  // Alternatives:
  //   - Shared boolean: Rejected — PDF button couldn't show progress when multi-select panel was open.
  const [exportOp, setExportOp] = useState(null)
  const [showMultiSelect, setShowMultiSelect] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => new Set())
  // PDF quality maps to pixelRatio for capture. Print formats always use 1x regardless.
  const [pdfQuality, setPdfQuality] = useState('standard')
  const [showPdfQuality, setShowPdfQuality] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  // Requirement: Abort in-flight multi-page/PDF exports if component unmounts or user cancels.
  // Approach: Ref checked in the export loop between page captures.
  // The external cancelExportRef (from App) lets the overlay Cancel button abort exports too.
  const internalCancelRef = useRef(false)
  const cancelledRef = cancelExportRef || internalCancelRef
  // Requirement: Prevent concurrent exports that corrupt canvas state.
  // Approach: Ref-based mutex checked synchronously at handler entry, before any async work.
  // State-based `isExporting` is too slow (React batching delays the update), allowing
  // rapid clicks to fire two handlers before the disabled prop takes effect.
  const exportLockRef = useRef(false)

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
    if (!canvasRef.current || exportLockRef.current) return

    const platform = platforms.find((p) => p.id === state.platform)
    if (!platform) return

    exportLockRef.current = true
    updateExporting(true)
    setExportOp('single')
    debugLog('export', 'single-start', { platform: platform.id, format: exportFormat, width: platform.width, height: platform.height })
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
      debugLog('export', 'single-success', { platform: platform.id, sizeKB: Math.round(blob.size / 1024) })
      addToast('Download complete', { type: 'success' })
    } catch (error) {
      debugLog('export', 'single-error', { platform: platform.id, error: error.message }, 'error')
      addToast('Export failed. Please try again.', { type: 'error', duration: 5000 })
    } finally {
      restoreOpacity()
      updateExporting(false)
      setExportOp(null)
      exportLockRef.current = false
    }
  }, [canvasRef, state.platform, state.activePage, exportFormat, ext, pageCount, updateExporting, addToast])

  const handleExportAllPages = useCallback(async () => {
    if (!canvasRef.current || pageCount <= 1 || exportLockRef.current) return

    exportLockRef.current = true
    updateExporting(true)
    setExportOp('allPages')
    cancelledRef.current = false
    const zip = new JSZip()
    const platform = platforms.find((p) => p.id === state.platform)
    if (!platform) { updateExporting(false); setExportOp(null); return }

    const originalActivePage = state.activePage
    const restoreOpacity = hideCanvas(canvasRef.current)
    debugLog('export', 'all-pages-start', { platform: platform.id, format: exportFormat, pageCount })

    try {
      for (let i = 0; i < pageCount; i++) {
        if (cancelledRef.current) break
        setExportProgress({ current: i + 1, total: pageCount, name: `Page ${i + 1}` })
        debugLog('export', 'all-pages-capture', { page: i + 1, total: pageCount }, 'debug')

        onSetActivePage(i)
        // Wait for React state update + re-render + paint to settle.
        // 300ms fixed delay replaced with double waitForPaint for reliability on slow devices.
        await waitForPaint()
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
      debugLog('export', 'all-pages-success', { pageCount, sizeKB: Math.round(content.size / 1024) })
      addToast(`${pageCount} pages exported`, { type: 'success' })

      onSetActivePage(originalActivePage)
    } catch (error) {
      debugLog('export', 'all-pages-error', { error: error.message }, 'error')
      addToast('Export failed. Please try again.', { type: 'error', duration: 5000 })
      onSetActivePage(originalActivePage)
    } finally {
      restoreOpacity()
      updateExporting(false)
      setExportProgress(null)
      setExportOp(null)
      exportLockRef.current = false
    }
  }, [canvasRef, state.platform, state.activePage, exportFormat, ext, pageCount, onSetActivePage, updateExporting, addToast])

  // Requirement: PDF export for LinkedIn carousel documents and general print-to-PDF
  // Approach: Capture pages as lossless PNG at pixelRatio:2 (digital) or 1 (print),
  //   build PDF with pdf-lib using 1:1 pixel-to-point mapping. No viewer resampling —
  //   smooth gradients preserved, and 2× capture gives sharp display on phone screens.
  // Why: Previous window.open + window.print approach failed on mobile:
  //   - Opened about:blank tab (popup handling differs on mobile)
  //   - Mobile browsers ignore @page size CSS, defaulting to A4/Letter (wrong dimensions)
  //   - Required user to navigate print dialog instead of direct download
  // Alternatives:
  //   - jsPDF: Replaced — suspected quality loss in addImage dimension scaling.
  //   - window.open + window.print: Rejected - broken on mobile (about:blank, wrong sizes)
  //   - Direct window.print() on app: Rejected - prints entire UI, not just canvas
  const handleExportPDF = useCallback(async () => {
    if (!canvasRef.current || exportLockRef.current) return

    const platform = platforms.find((p) => p.id === state.platform)
    if (!platform) return

    exportLockRef.current = true
    updateExporting(true)
    setExportOp('pdf')
    cancelledRef.current = false
    const restoreOpacity = hideCanvas(canvasRef.current)

    const pageImages = []
    const originalActivePage = state.activePage
    const totalPages = pageCount > 1 ? pageCount : 1
    // Print always 1× (2× would create 4.17:1 non-integer ratio). Digital uses user selection.
    const isPrint = platform.category === 'print'
    const qualityToRatio = { low: 1, standard: 2, high: 3 }
    const pdfPixelRatio = isPrint ? 1 : (qualityToRatio[pdfQuality] || 2)
    debugLog('export', 'pdf-start', { platform: platform.id, quality: pdfQuality, pixelRatio: pdfPixelRatio, totalPages, isPrint })

    try {
      // Ensure all fonts are fully loaded before capture — prevents fallback font rendering
      await document.fonts.ready

      for (let i = 0; i < totalPages; i++) {
        if (cancelledRef.current) break
        if (totalPages > 1) {
          setExportProgress({ current: i + 1, total: totalPages, name: `Page ${i + 1}` })
          onSetActivePage(i)
          // Wait for React state update + re-render + paint to settle.
          // Double waitForPaint replaces fixed 300ms timeout for reliability on slow devices.
          await waitForPaint()
          await waitForPaint()
        } else {
          await waitForPaint()
        }

        const restoreTransform = setFullScale(canvasRef.current)
        await waitForPaint()

        const imageResult = await captureForPdf(canvasRef.current, platform.width, platform.height, pdfPixelRatio)
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

      // Digital: 1:1 px-to-pt preserves full platform resolution in the PDF.
      // Print: 72/150 DPI conversion for correct physical page size (A4=595×842pt).
      const pxToPt = isPrint ? 72 / 150 : 1
      const widthPt = platform.width * pxToPt
      const heightPt = platform.height * pxToPt

      const pdfDoc = await PDFDocument.create()
      pdfDoc.setTitle(`${platform.name} — CanvaGrid`)
      pdfDoc.setCreator('CanvaGrid')

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
      debugLog('export', 'pdf-success', { platform: platform.id, pagePt: `${widthPt}x${heightPt}`, pixelRatio: pdfPixelRatio, sizeKB: Math.round(pdfBytes.length / 1024), totalPages })
      addToast('PDF saved', { type: 'success' })
    } catch (error) {
      debugLog('export', 'pdf-error', { platform: platform.id, error: error.message }, 'error')
      addToast('PDF export failed. Please try again.', { type: 'error', duration: 5000 })
      if (totalPages > 1) {
        onSetActivePage(originalActivePage)
      }
    } finally {
      restoreOpacity()
      updateExporting(false)
      setExportProgress(null)
      setExportOp(null)
      exportLockRef.current = false
    }
  }, [canvasRef, state.platform, state.activePage, pageCount, onSetActivePage, updateExporting, pdfQuality, addToast])

  const handleExportMultiple = useCallback(async () => {
    if (!canvasRef.current || exportLockRef.current) return
    if (selectedPlatforms.size === 0) {
      addToast('Select at least one platform to export.', { type: 'warning' })
      return
    }

    exportLockRef.current = true
    updateExporting(true)
    setExportOp('multi')
    const zip = new JSZip()
    const originalPlatform = state.platform

    const platformsToExport = platforms.filter((p) => selectedPlatforms.has(p.id))
    const restoreOpacity = hideCanvas(canvasRef.current)
    debugLog('export', 'multi-start', { format: exportFormat, platformCount: platformsToExport.length })

    try {
      const failed = []
      for (let i = 0; i < platformsToExport.length; i++) {
        const platform = platformsToExport[i]
        setExportProgress({ current: i + 1, total: platformsToExport.length, name: platform.name })

        try {
          onPlatformChange(platform.id)
          await waitForPaint()

          const restoreTransform = setFullScale(canvasRef.current)
          await waitForPaint()

          const blob = await captureAsBlob(canvasRef.current, platform.width, platform.height, exportFormat)
          restoreTransform()

          zip.file(`${platform.id}-${platform.width}x${platform.height}.${ext}`, blob)
        } catch (err) {
          failed.push(platform.name)
          debugLog('export', 'multi-platform-fail', { platform: platform.id, error: err.message }, 'warn')
        }
      }

      const successCount = platformsToExport.length - failed.length
      if (successCount > 0) {
        const content = await zip.generateAsync({ type: 'blob' })
        const ts = getTimestamp()
        saveAs(content, `${ts}-multi.zip`)
        debugLog('export', 'multi-success', { platformCount: successCount, failed: failed.length, sizeKB: Math.round(content.size / 1024) })
      }

      if (failed.length > 0) {
        addToast(`${successCount} exported, ${failed.length} failed: ${failed.join(', ')}`, { type: 'warning', duration: 5000 })
      } else {
        addToast(`${platformsToExport.length} platforms exported`, { type: 'success' })
      }

      onPlatformChange(originalPlatform)
      setShowMultiSelect(false)
    } catch (error) {
      debugLog('export', 'multi-error', { error: error.message }, 'error')
      addToast('Export failed. Please try again.', { type: 'error', duration: 5000 })
      onPlatformChange(originalPlatform)
    } finally {
      restoreOpacity()
      updateExporting(false)
      setExportProgress(null)
      setExportOp(null)
      exportLockRef.current = false
    }
  }, [canvasRef, state.platform, exportFormat, ext, onPlatformChange, updateExporting, selectedPlatforms, addToast])

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

      {/* Primary action: Download current */}
      <button
        onClick={handleExportSingle}
        disabled={isExporting}
        className="w-full px-4 py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-glow active:scale-[0.98] btn-scale"
      >
        {exportOp === 'single' ? 'Exporting...' : `Download (.${ext})`}
      </button>

      {/* More export options toggle */}
      <button
        onClick={() => setShowMoreOptions(!showMoreOptions)}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-ui-text-muted hover:text-ui-text transition-colors"
      >
        <span>{showMoreOptions ? 'Fewer options' : 'More export options'}</span>
        <svg
          className={`w-3 h-3 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible secondary export options */}
      {showMoreOptions && (
        <div className="space-y-2 pt-1 border-t border-ui-border-subtle">
          {/* Download all pages as ZIP */}
          {pageCount > 1 && (
            <button
              onClick={handleExportAllPages}
              disabled={isExporting}
              className="w-full px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {exportOp === 'allPages' && exportProgress
                ? `Exporting Page ${exportProgress.current}/${exportProgress.total}...`
                : `All ${pageCount} Pages (ZIP)`}
            </button>
          )}

          {/* PDF export with inline quality selector */}
          <div className="space-y-1.5">
            <div className="flex w-full rounded-lg overflow-hidden">
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {exportOp === 'pdf' && exportProgress
                  ? `Preparing Page ${exportProgress.current}/${exportProgress.total}...`
                  : pageCount > 1
                    ? `${pageCount} Pages as PDF`
                    : 'Save as PDF'}
              </button>
              <button
                onClick={() => setShowPdfQuality(!showPdfQuality)}
                disabled={isExporting}
                className="px-2.5 py-2.5 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-l border-orange-200 dark:border-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${showPdfQuality ? 'rotate-180' : ''}`}>
                  <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            {showPdfQuality && (
              <div className="p-2 bg-ui-surface-elevated rounded-lg border border-ui-border">
                <span className="text-xs text-ui-text-muted block mb-1.5">PDF Quality</span>
                <div className="flex gap-1">
                  {[
                    { id: 'low', label: 'Low', desc: '1x' },
                    { id: 'standard', label: 'Standard', desc: '2x' },
                    { id: 'high', label: 'High', desc: '3x' },
                  ].map((q) => (
                    <button
                      key={q.id}
                      onClick={() => { setPdfQuality(q.id); setShowPdfQuality(false) }}
                      className={`flex-1 px-2 py-1.5 text-xs rounded-md transition-colors ${
                        pdfQuality === q.id
                          ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 font-semibold'
                          : 'bg-ui-surface text-ui-text-muted hover:bg-ui-surface-elevated'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Multi-platform export */}
          <button
            onClick={() => setShowMultiSelect(!showMultiSelect)}
            disabled={isExporting}
            className="w-full px-4 py-2.5 text-sm font-medium text-primary dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {showMultiSelect ? 'Hide Platforms' : 'Multiple Platforms (ZIP)'}
          </button>

          {/* Multi-select platform UI */}
          {showMultiSelect && (
            <div className="space-y-3 p-3 bg-ui-surface-elevated rounded-lg border border-ui-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ui-text-muted">
                  {selectedPlatforms.size} of {platforms.length} selected
                </span>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs text-primary hover:underline">Select All</button>
                  <button onClick={selectNone} className="text-xs text-ui-text-subtle hover:underline">Clear</button>
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
        </div>
      )}

      {/* Progress bar - always visible when active */}
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
