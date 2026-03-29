// Requirement: CDN-hosted sample image browser with category filtering and pagination.
// Approach: Fetches manifest from jsDelivr, displays thumbnails in a grid,
//   click-to-add loads full image and passes to onAddImage callback.
// Alternatives:
//   - Bundle sample images: Rejected — bloats the app bundle.
//   - Inline in MediaTab: Rejected — adds ~250 lines to an already large file.
import { useCallback, useRef, useState, useMemo, useEffect } from 'react'
import { SAMPLE_MANIFEST_URL } from '../config/sampleImages'
import { debugLog } from '../utils/debugLog'

const SAMPLES_PER_PAGE = 15

export default function SampleImagesSection({ images, onAddImage, selectedCell, addToast }) {
  const [manifest, setManifest] = useState(null)
  const [manifestLoading, setManifestLoading] = useState(true)
  const [manifestError, setManifestError] = useState(null)
  const [loadingSample, setLoadingSample] = useState(null)
  const [sampleError, setSampleError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [page, setPage] = useState(0)

  // Race condition fix: use ref for selectedCell so async image load callbacks
  // always read the latest value instead of a stale closure capture.
  const selectedCellRef = useRef(selectedCell)
  selectedCellRef.current = selectedCell

  // Unmount guard: prevent state updates after component unmounts
  const mountedRef = useRef(true)
  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  const loadManifest = useCallback(async () => {
    setManifestLoading(true)
    setManifestError(null)
    try {
      // Cache-bust: append hourly timestamp to bypass jsDelivr CDN edge cache
      // and browser HTTP cache. Without this, @main URLs can serve stale content
      // for up to 24 hours even with NetworkFirst SW strategy.
      const cacheBust = Math.floor(Date.now() / (1000 * 60 * 60)) // changes hourly
      const url = `${SAMPLE_MANIFEST_URL}?v=${cacheBust}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setManifest(data)
      debugLog('media', 'manifest-loaded', { images: data.images?.length, categories: data.categories?.length })
    } catch (error) {
      debugLog('media', 'manifest-error', { error: error.message, url }, 'error')
      setManifestError('Could not load sample images. Check your connection.')
    } finally {
      setManifestLoading(false)
    }
  }, [])

  useEffect(() => {
    loadManifest()
  }, [loadManifest])

  const sampleCategories = manifest?.categories || []
  const sampleImages = manifest?.images || []
  const cdnBase = manifest?.cdnBase || ''

  const filteredImages = useMemo(() => {
    if (activeCategory === 'all') return sampleImages
    return sampleImages.filter((s) => s.categories.includes(activeCategory))
  }, [activeCategory, sampleImages])

  const totalPages = Math.ceil(filteredImages.length / SAMPLES_PER_PAGE)
  const pagedImages = filteredImages.slice(page * SAMPLES_PER_PAGE, (page + 1) * SAMPLES_PER_PAGE)

  // Reset page when category changes
  const handleCategoryChange = useCallback((cat) => {
    setActiveCategory(cat)
    setPage(0)
  }, [])

  // Race condition fix: read selectedCellRef.current at assignment time (not closure time)
  // so the image goes to whichever cell is selected when loading finishes.
  // Unmount guard: check mountedRef before calling setState after async operations.
  const loadSampleImage = useCallback(
    async (sample) => {
      setLoadingSample(sample.id)
      setSampleError(null)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      try {
        const response = await fetch(`${cdnBase}/${sample.full}`, {
          signal: controller.signal,
        })
        clearTimeout(timeout)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onload = (event) => {
          if (!mountedRef.current) return
          const img = new Image()
          img.onload = () => {
            if (!mountedRef.current) return
            const { assigned } = onAddImage(event.target.result, sample.name, selectedCellRef.current, { width: img.naturalWidth, height: img.naturalHeight })
            if (!assigned) addToast('Image added to library — all cells already have images', { type: 'info' })
            setLoadingSample(null)
          }
          img.onerror = () => {
            if (!mountedRef.current) return
            const { assigned } = onAddImage(event.target.result, sample.name, selectedCellRef.current)
            if (!assigned) addToast('Image added to library — all cells already have images', { type: 'info' })
            setLoadingSample(null)
          }
          img.src = event.target.result
        }
        reader.onerror = () => {
          if (!mountedRef.current) return
          setSampleError('Failed to load image')
          setLoadingSample(null)
        }
        reader.readAsDataURL(blob)
      } catch (err) {
        clearTimeout(timeout)
        if (!mountedRef.current) return
        setSampleError(
          err.name === 'AbortError'
            ? 'Image loading timed out. Try again.'
            : 'Failed to load image. Check your connection.'
        )
        setLoadingSample(null)
      }
    },
    [onAddImage, cdnBase]
  )

  if (manifestLoading) {
    return (
      <div className="flex items-center justify-center py-6 gap-2">
        <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-ui-text-subtle">Loading sample images...</p>
      </div>
    )
  }

  if (manifestError) {
    return (
      <div className="text-center py-4 space-y-2">
        <p className="text-xs text-red-600 dark:text-red-400">{manifestError}</p>
        <button
          onClick={loadManifest}
          className="px-3 py-1 text-xs rounded-lg bg-ui-surface-inset hover:bg-ui-surface-hover text-ui-text-muted"
        >
          Try again
        </button>
      </div>
    )
  }

  if (sampleImages.length === 0) {
    return (
      <p className="text-xs text-ui-text-subtle text-center py-3">No sample images available</p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-ui-text-subtle">
        {images.length === 0 ? 'Add a sample image to get started' : 'Add sample images to your library'}
      </p>

      {/* Category filter chips with horizontal scroll */}
      {sampleCategories.length > 0 && (
        <div className="relative group/cats">
          <div
            className="flex gap-1 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap flex-shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
              }`}
            >
              All
            </button>
            {sampleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap flex-shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {/* Fade indicator on right edge when scrollable */}
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-zinc-900 pointer-events-none opacity-0 group-hover/cats:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Image grid with CDN thumbnails */}
      <div className="grid grid-cols-5 gap-1.5">
        {pagedImages.map((sample) => (
          <button
            key={sample.id}
            onClick={() => loadSampleImage(sample)}
            disabled={loadingSample === sample.id}
            title={`Add ${sample.name} to library`}
            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${
              loadingSample === sample.id
                ? 'border-violet-400 opacity-50 scale-95'
                : 'border-ui-border hover:border-violet-400 hover:shadow-sm active:scale-95'
            }`}
          >
            <img
              src={`${cdnBase}/${sample.thumb}`}
              alt={sample.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div
              className="w-full h-full bg-ui-surface-inset items-center justify-center text-ui-text-faint text-[9px] text-center p-0.5"
              style={{ display: 'none' }}
            >
              {sample.name}
            </div>
            {loadingSample === sample.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <p className="text-xs text-ui-text-subtle text-center py-3">No images in this category</p>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-2 py-1 text-xs rounded-lg font-medium bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover disabled:opacity-30 disabled:pointer-events-none"
          >
            Prev
          </button>
          <span className="text-xs text-ui-text-subtle">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-2 py-1 text-xs rounded-lg font-medium bg-ui-surface-inset text-ui-text-muted hover:bg-ui-surface-hover disabled:opacity-30 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      )}

      {sampleError && <p className="text-xs text-red-600 dark:text-red-400">{sampleError}</p>}
    </div>
  )
}
