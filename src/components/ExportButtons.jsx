import { useState, useCallback, useRef, memo } from 'react'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { platforms, categoryLabels, categoryOrder, platformsByCategory, findFormat } from '../config/platforms'
import { debugLog } from '../utils/debugLog'
import { useToast } from './Toast'
import { getTimestamp, waitForPaint, hideCanvas, setFullScale, captureAsBlob, captureForPdf, FORMAT_OPTIONS, FILE_EXTENSIONS } from '../utils/exportHelpers'

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
        debugLog('export', 'all-pages-capture', { page: i + 1, total: pageCount })

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
  }, [canvasRef, state.platform, state.activePage, exportFormat, ext, pageCount, onSetActivePage, updateExporting, addToast, cancelledRef])

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
      // Isolates whether quality loss is in capture or PDF embedding. DEV-only so the
      // block is stripped from prod builds (Vite inlines `import.meta.env.DEV` as false).
      if (import.meta.env.DEV && pageImages.length > 0) {
        const diagBlob = new Blob([pageImages[0].data], { type: 'image/png' })
        saveAs(diagBlob, `pdf-diagnostic-${platform.id}.png`)
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
  }, [canvasRef, state.platform, state.activePage, pageCount, onSetActivePage, updateExporting, pdfQuality, addToast, cancelledRef])

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
          <span className="text-xs font-medium text-base-content/70">File Format</span>
          {currentFormat.recommendedFormat && currentFormat.recommendedFormat !== exportFormat && (
            <button
              onClick={() => onExportFormatChange(currentFormat.recommendedFormat)}
              className="btn btn-ghost btn-xs text-primary"
            >
              Use recommended ({currentFormat.recommendedFormat.toUpperCase()})
            </button>
          )}
        </div>
        {/* Requirement: Grouped format selector buttons.
            Approach: DaisyUI join component for connected button group.
            Alternatives:
              - flex + gap: Replaced — join gives connected borders and semantic grouping. */}
        <div className="join w-full">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onExportFormatChange(opt.id)}
              title={opt.description}
              className={`btn btn-xs flex-1 join-item ${
                exportFormat === opt.id ? 'btn-primary' : 'btn-ghost'
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
        className="btn btn-primary w-full"
      >
        {exportOp === 'single' ? 'Exporting...' : `Download (.${ext})`}
      </button>

      {/* More export options toggle */}
      <button
        onClick={() => setShowMoreOptions(!showMoreOptions)}
        className="btn btn-ghost btn-xs w-full gap-1.5"
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
        <div className="space-y-2 pt-1 border-t border-base-200">
          {/* Download all pages as ZIP */}
          {pageCount > 1 && (
            <button
              onClick={handleExportAllPages}
              disabled={isExporting}
              className="btn btn-ghost btn-sm w-full text-success"
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
                className="btn btn-ghost btn-sm flex-1 text-warning"
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
                className="btn btn-ghost btn-sm btn-square text-warning border-l border-base-300 rounded-l-none"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${showPdfQuality ? 'rotate-180' : ''}`}>
                  <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            {showPdfQuality && (
              <div className="p-2 bg-base-200 rounded-lg border border-base-300">
                <span className="text-xs text-base-content/70 block mb-1.5">PDF Quality</span>
                <div className="flex gap-1">
                  {[
                    { id: 'low', label: 'Low', desc: '1x' },
                    { id: 'standard', label: 'Standard', desc: '2x' },
                    { id: 'high', label: 'High', desc: '3x' },
                  ].map((q) => (
                    <button
                      key={q.id}
                      onClick={() => { setPdfQuality(q.id); setShowPdfQuality(false) }}
                      className={`btn btn-xs flex-1 ${
                        pdfQuality === q.id ? 'btn-warning' : 'btn-ghost'
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
            className="btn btn-ghost btn-sm w-full text-primary"
          >
            {showMultiSelect ? 'Hide Platforms' : 'Multiple Platforms (ZIP)'}
          </button>

          {/* Multi-select platform UI */}
          {showMultiSelect && (
            <div className="space-y-3 p-3 bg-base-200 rounded-lg border border-base-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-base-content/70">
                  {selectedPlatforms.size} of {platforms.length} selected
                </span>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="btn btn-ghost btn-xs text-primary">Select All</button>
                  <button onClick={selectNone} className="btn btn-ghost btn-xs">Clear</button>
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
                        className="btn btn-ghost btn-xs text-base-content/50 uppercase tracking-wide"
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
                            className={`btn btn-xs ${
                              selectedPlatforms.has(p.id) ? 'btn-primary' : 'btn-outline'
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
                className="btn btn-primary btn-sm w-full"
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
          {/* Requirement: Visual export progress feedback.
              Approach: DaisyUI progress component replaces hand-rolled div-based bar.
              Alternatives:
                - Custom div with bg-gradient-creative: Replaced — DaisyUI progress is semantic,
                  accessible, and theme-aware out of the box. */}
          <progress
            className="progress progress-primary w-full"
            value={exportProgress.current}
            max={exportProgress.total}
          />
          <p className="text-sm text-center text-base-content/60">
            Processing: {exportProgress.name}
          </p>
        </div>
      )}
    </div>
  )
})
