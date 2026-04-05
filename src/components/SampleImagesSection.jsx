// Requirement: CDN-hosted sample image browser with category filtering and pagination.
// Approach: Fetches manifest from jsDelivr, displays thumbnails in a grid,
//   click-to-add loads full image and passes to onAddImage callback.
// Alternatives:
//   - Bundle sample images: Rejected — bloats the app bundle.
//   - Inline in MediaTab: Rejected — adds ~250 lines to an already large file.
import { useCallback, useRef, useState, useMemo, useEffect } from 'react'
import { SAMPLE_MANIFEST_URL } from '../config/sampleImages'

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
    } catch (error) {
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
        <span className="loading loading-spinner loading-sm text-primary" />
        <p className="text-xs text-base-content/60">Loading sample images...</p>
      </div>
    )
  }

  if (manifestError) {
    return (
      <div className="text-center py-4 space-y-2">
        <p className="text-xs text-error">{manifestError}</p>
        <button
          onClick={loadManifest}
          className="btn btn-ghost btn-xs"
        >
          Try again
        </button>
      </div>
    )
  }

  if (sampleImages.length === 0) {
    return (
      <p className="text-xs text-base-content/60 text-center py-3">No sample images available</p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-base-content/60">
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
              className={`btn btn-xs whitespace-nowrap flex-shrink-0 ${
                activeCategory === 'all' ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              All
            </button>
            {sampleCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`btn btn-xs whitespace-nowrap flex-shrink-0 ${
                  activeCategory === cat.id ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {/* Fade indicator on right edge when scrollable */}
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-base-100 pointer-events-none opacity-0 group-hover/cats:opacity-100 transition-opacity" />
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
                ? 'border-primary opacity-50 scale-95'
                : 'border-base-300 hover:border-primary hover:shadow-sm active:scale-95'
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
              className="w-full h-full bg-base-200 items-center justify-center text-base-content/50 text-[9px] text-center p-0.5"
              style={{ display: 'none' }}
            >
              {sample.name}
            </div>
            {loadingSample === sample.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                <span className="loading loading-spinner loading-sm text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <p className="text-xs text-base-content/60 text-center py-3">No images in this category</p>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn btn-ghost btn-xs"
          >
            Prev
          </button>
          <span className="text-xs text-base-content/60">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="btn btn-ghost btn-xs"
          >
            Next
          </button>
        </div>
      )}

      {sampleError && <p className="text-xs text-error">{sampleError}</p>}
    </div>
  )
}
