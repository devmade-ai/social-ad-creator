import { useState, useCallback, memo } from 'react'
import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { platforms } from '../config/platforms'

export default memo(function ExportButtons({ canvasRef, state, onPlatformChange, onExportingChange }) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(null)

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

  const handleExportAll = useCallback(async () => {
    if (!canvasRef.current) return

    updateExporting(true)
    const zip = new JSZip()
    const originalPlatform = state.platform

    // Hide canvas during batch export to prevent visible flashing
    const originalOpacity = canvasRef.current.style.opacity
    canvasRef.current.style.opacity = '0'

    try {
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        setExportProgress({ current: i + 1, total: platforms.length, name: platform.name })

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
    } catch (error) {
      console.error('Export all failed:', error)
      alert('Export failed. Please try again.')
      onPlatformChange(originalPlatform)
    } finally {
      // Restore canvas visibility
      canvasRef.current.style.opacity = originalOpacity
      updateExporting(false)
      setExportProgress(null)
    }
  }, [canvasRef, state.platform, onPlatformChange, updateExporting])

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
        onClick={handleExportAll}
        disabled={isExporting}
        className="w-full px-4 py-3 text-sm font-semibold text-primary dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        {exportProgress
          ? `Exporting ${exportProgress.current}/${exportProgress.total}...`
          : 'Download All (ZIP)'}
      </button>

      {exportProgress && (
        <div className="space-y-2">
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-creative h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
            />
          </div>
          <p className="text-sm text-center text-zinc-500 dark:text-zinc-400">
            Processing: {exportProgress.name}
          </p>
        </div>
      )}
    </div>
  )
})
