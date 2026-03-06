import { useState, useCallback, memo, useMemo } from 'react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { platforms } from '../config/platforms'

const categoryLabels = {
  social: 'Social Media',
  web: 'Website',
  banner: 'Banners',
  email: 'Email',
  print: 'Print',
  other: 'Other',
}

export default memo(function ExportButtons({ canvasRef, state, onPlatformChange, onExportingChange, pageCount = 1, getPageState, onSetActivePage }) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(null)
  const [showMultiSelect, setShowMultiSelect] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => new Set())

  const groupedPlatforms = useMemo(() => {
    const groups = {}
    platforms.forEach((p) => {
      const cat = p.category || 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(p)
    })
    return groups
  }, [])

  const categoryOrder = ['social', 'web', 'banner', 'email', 'print', 'other']

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
    const categoryPlatforms = platforms.filter((p) => (p.category || 'other') === category)
    setSelectedPlatforms((prev) => {
      const next = new Set(prev)
      categoryPlatforms.forEach((p) => next.add(p.id))
      return next
    })
  }, [])

  const updateExporting = useCallback((value) => {
    setIsExporting(value)
    onExportingChange?.(value)
  }, [onExportingChange])

  // Requirement: Single-image download matching the multi-platform export reliability
  // Approach: Set transform AFTER React re-render settles (same pattern as handleExportMultiple)
  // Alternatives:
  //   - Set transform before waiting: Rejected - React re-render from updateExporting()
  //     overwrites the manual transform back to scale(previewScale) during the wait
  const handleExportSingle = useCallback(async () => {
    if (!canvasRef.current) return

    const platform = platforms.find((p) => p.id === state.platform)
    if (!platform) return

    updateExporting(true)

    const originalOpacity = canvasRef.current.style.opacity
    canvasRef.current.style.opacity = '0'

    try {
      // Wait for React re-render from updateExporting() to settle
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Set transform AFTER re-render so it won't be overwritten
      const originalTransform = canvasRef.current.style.transform
      canvasRef.current.style.transform = 'scale(1)'

      await new Promise((resolve) => setTimeout(resolve, 50))

      const dataUrl = await toPng(canvasRef.current, {
        width: platform.width,
        height: platform.height,
        pixelRatio: 1,
        style: {
          opacity: '1',
          transform: 'scale(1)',
        },
      })

      canvasRef.current.style.transform = originalTransform

      // Requirement: Reliable single-image download across all browsers/contexts
      // Approach: Convert data URL to blob and use file-saver's saveAs
      // Alternatives:
      //   - Detached <a> link.click(): Rejected - fails in Safari, PWA contexts,
      //     and with large data URLs (print sizes). This was the previous approach.
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      saveAs(blob, `ad-${platform.id}-${platform.width}x${platform.height}.png`)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      canvasRef.current.style.opacity = originalOpacity
      updateExporting(false)
    }
  }, [canvasRef, state.platform, updateExporting])

  const handleExportAllPages = useCallback(async () => {
    if (!canvasRef.current || pageCount <= 1) return

    updateExporting(true)
    const zip = new JSZip()
    const platform = platforms.find((p) => p.id === state.platform)
    if (!platform) { updateExporting(false); return }

    const originalActivePage = state.activePage

    const originalOpacity = canvasRef.current.style.opacity
    canvasRef.current.style.opacity = '0'

    // Helper: wait for React re-render + browser paint
    const waitForPaint = () => new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100)))
    })

    try {
      for (let i = 0; i < pageCount; i++) {
        setExportProgress({ current: i + 1, total: pageCount, name: `Page ${i + 1}` })

        // Switch to the target page
        onSetActivePage(i)
        // Wait for React state update, re-render, and browser paint
        await new Promise((resolve) => setTimeout(resolve, 300))
        await waitForPaint()

        const originalTransform = canvasRef.current.style.transform
        canvasRef.current.style.transform = 'scale(1)'
        await waitForPaint()

        const dataUrl = await toPng(canvasRef.current, {
          width: platform.width,
          height: platform.height,
          pixelRatio: 1,
          style: { opacity: '1', transform: 'scale(1)' },
        })

        canvasRef.current.style.transform = originalTransform

        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const pageNum = String(i + 1).padStart(3, '0')
        zip.file(`page-${pageNum}-${platform.width}x${platform.height}.png`, blob)
      }

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, 'pages.zip')

      // Always restore to original page
      onSetActivePage(originalActivePage)
    } catch (error) {
      console.error('Page export failed:', error)
      alert('Export failed. Please try again.')
      onSetActivePage(originalActivePage)
    } finally {
      canvasRef.current.style.opacity = originalOpacity
      updateExporting(false)
      setExportProgress(null)
    }
  }, [canvasRef, state.platform, state.activePage, pageCount, onSetActivePage, updateExporting])

  // Requirement: PDF export for LinkedIn carousel documents and general print-to-PDF
  // Approach: Capture pages as PNGs, build PDF with jsPDF using exact platform dimensions
  // Why: Previous window.open + window.print approach failed on mobile:
  //   - Opened about:blank tab (popup handling differs on mobile)
  //   - Mobile browsers ignore @page size CSS, defaulting to A4/Letter (wrong dimensions)
  //   - Required user to navigate print dialog instead of direct download
  // Alternatives:
  //   - window.open + window.print: Rejected - broken on mobile (about:blank, wrong sizes)
  //   - Direct window.print() on app: Rejected - prints entire UI, not just canvas
  const handleExportPDF = useCallback(async () => {
    if (!canvasRef.current) return

    const platform = platforms.find((p) => p.id === state.platform)
    if (!platform) return

    updateExporting(true)

    const originalOpacity = canvasRef.current.style.opacity
    canvasRef.current.style.opacity = '0'

    const waitForPaint = () => new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100)))
    })

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
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        const originalTransform = canvasRef.current.style.transform
        canvasRef.current.style.transform = 'scale(1)'
        await waitForPaint()

        const dataUrl = await toPng(canvasRef.current, {
          width: platform.width,
          height: platform.height,
          pixelRatio: 1,
          style: { opacity: '1', transform: 'scale(1)' },
        })

        canvasRef.current.style.transform = originalTransform
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

      pdf.save(`canvagrid-${platform.id}-${platform.width}x${platform.height}.pdf`)
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('PDF export failed. Please try again.')
      if (totalPages > 1) {
        onSetActivePage(originalActivePage)
      }
    } finally {
      canvasRef.current.style.opacity = originalOpacity
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

    const originalOpacity = canvasRef.current.style.opacity
    canvasRef.current.style.opacity = '0'

    try {
      for (let i = 0; i < platformsToExport.length; i++) {
        const platform = platformsToExport[i]
        setExportProgress({ current: i + 1, total: platformsToExport.length, name: platform.name })

        onPlatformChange(platform.id)
        await new Promise((resolve) => setTimeout(resolve, 100))

        const originalTransform = canvasRef.current.style.transform
        canvasRef.current.style.transform = 'scale(1)'

        await new Promise((resolve) => setTimeout(resolve, 50))

        const dataUrl = await toPng(canvasRef.current, {
          width: platform.width,
          height: platform.height,
          pixelRatio: 1,
          style: {
            opacity: '1',
            transform: 'scale(1)',
          },
        })

        canvasRef.current.style.transform = originalTransform

        const response = await fetch(dataUrl)
        const blob = await response.blob()
        zip.file(`ad-${platform.id}-${platform.width}x${platform.height}.png`, blob)
      }

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, 'social-ads.zip')

      onPlatformChange(originalPlatform)
      setShowMultiSelect(false)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
      onPlatformChange(originalPlatform)
    } finally {
      canvasRef.current.style.opacity = originalOpacity
      updateExporting(false)
      setExportProgress(null)
    }
  }, [canvasRef, state.platform, onPlatformChange, updateExporting, selectedPlatforms])

  return (
    <div className="space-y-3">
      <button
        onClick={handleExportSingle}
        disabled={isExporting}
        className="w-full px-4 py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-glow active:scale-[0.98] btn-scale"
      >
        {isExporting && !exportProgress ? 'Exporting...' : 'Download Current'}
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
              const categoryPlatforms = groupedPlatforms[category]
              if (!categoryPlatforms || categoryPlatforms.length === 0) return null

              const allSelected = categoryPlatforms.every((p) => selectedPlatforms.has(p.id))
              const someSelected = categoryPlatforms.some((p) => selectedPlatforms.has(p.id))

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
                    {categoryPlatforms.map((p) => (
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
