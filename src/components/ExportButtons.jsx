import { useState, useCallback, memo, useMemo } from 'react'
import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { platforms } from '../config/platforms'

// Category labels for display
const categoryLabels = {
  social: 'Social Media',
  web: 'Website',
  banner: 'Banners',
  email: 'Email',
  print: 'Print',
  other: 'Other',
}

export default memo(function ExportButtons({ canvasRef, state, onPlatformChange, onExportingChange }) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(null)
  const [showMultiSelect, setShowMultiSelect] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState(() => new Set())

  // Group platforms by category
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

  // Update both local state and notify parent
  const updateExporting = useCallback((value) => {
    setIsExporting(value)
    onExportingChange?.(value)
  }, [onExportingChange])

  const handleExportSingle = useCallback(async () => {
    if (!canvasRef.current) return

    const platform = platforms.find((p) => p.id === state.platform)
    if (!platform) return

    updateExporting(true)

    // Store original styles and hide canvas during capture to prevent visible flash
    const originalTransform = canvasRef.current.style.transform
    const originalOpacity = canvasRef.current.style.opacity
    canvasRef.current.style.opacity = '0'
    canvasRef.current.style.transform = 'scale(1)'

    try {
      // Wait for reflow
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

      const link = document.createElement('a')
      link.download = `ad-${platform.id}-${platform.width}x${platform.height}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      // Restore original styles
      canvasRef.current.style.transform = originalTransform
      canvasRef.current.style.opacity = originalOpacity
      updateExporting(false)
    }
  }, [canvasRef, state.platform, updateExporting])

  const handleExportMultiple = useCallback(async () => {
    if (!canvasRef.current) return
    if (selectedPlatforms.size === 0) {
      alert('Please select at least one platform to export.')
      return
    }

    updateExporting(true)
    const zip = new JSZip()
    const originalPlatform = state.platform

    // Get the platforms to export
    const platformsToExport = platforms.filter((p) => selectedPlatforms.has(p.id))

    // Hide canvas during batch export to prevent visible flashing
    const originalOpacity = canvasRef.current.style.opacity
    canvasRef.current.style.opacity = '0'

    try {
      for (let i = 0; i < platformsToExport.length; i++) {
        const platform = platformsToExport[i]
        setExportProgress({ current: i + 1, total: platformsToExport.length, name: platform.name })

        // Switch to this platform temporarily
        onPlatformChange(platform.id)

        // Wait for render
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Store original transform and temporarily remove scale for capture
        const originalTransform = canvasRef.current.style.transform
        canvasRef.current.style.transform = 'scale(1)'

        // Wait for reflow
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

        // Restore transform immediately after capture
        canvasRef.current.style.transform = originalTransform

        const response = await fetch(dataUrl)
        const blob = await response.blob()
        zip.file(`ad-${platform.id}-${platform.width}x${platform.height}.png`, blob)
      }

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, 'social-ads.zip')

      // Restore original platform
      onPlatformChange(originalPlatform)
      setShowMultiSelect(false)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
      onPlatformChange(originalPlatform)
    } finally {
      // Restore canvas visibility
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

      <button
        onClick={() => setShowMultiSelect(!showMultiSelect)}
        disabled={isExporting}
        className="w-full px-4 py-3 text-sm font-semibold text-primary dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        {showMultiSelect ? 'Hide Selection' : 'Download Multiple (ZIP)'}
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
