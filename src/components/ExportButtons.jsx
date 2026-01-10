import { useState, useCallback } from 'react'
import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { platforms } from '../config/platforms'

export default function ExportButtons({ canvasRef, state, onPlatformChange }) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(null)

  const handleExportSingle = useCallback(async () => {
    if (!canvasRef.current) return

    const platform = platforms.find((p) => p.id === state.platform)
    if (!platform) return

    setIsExporting(true)

    try {
      const dataUrl = await toPng(canvasRef.current, {
        width: platform.width,
        height: platform.height,
        pixelRatio: 1,
        skipFonts: true,
      })

      const link = document.createElement('a')
      link.download = `ad-${platform.id}-${platform.width}x${platform.height}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }, [canvasRef, state.platform])

  const handleExportAll = useCallback(async () => {
    if (!canvasRef.current) return

    setIsExporting(true)
    const zip = new JSZip()
    const originalPlatform = state.platform

    try {
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        setExportProgress({ current: i + 1, total: platforms.length, name: platform.name })

        // Switch to this platform temporarily
        onPlatformChange(platform.id)

        // Wait for render
        await new Promise((resolve) => setTimeout(resolve, 100))

        const dataUrl = await toPng(canvasRef.current, {
          width: platform.width,
          height: platform.height,
          pixelRatio: 1,
          skipFonts: true,
        })

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
      setIsExporting(false)
      setExportProgress(null)
    }
  }, [canvasRef, state.platform, onPlatformChange])

  return (
    <div className="space-y-2">
      <button
        onClick={handleExportSingle}
        disabled={isExporting}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExporting && !exportProgress ? 'Exporting...' : 'Download Current'}
      </button>

      <button
        onClick={handleExportAll}
        disabled={isExporting}
        className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {exportProgress
          ? `Exporting ${exportProgress.current}/${exportProgress.total}...`
          : 'Download All (ZIP)'}
      </button>

      {exportProgress && (
        <p className="text-xs text-center text-gray-500">
          Processing: {exportProgress.name}
        </p>
      )}
    </div>
  )
}
