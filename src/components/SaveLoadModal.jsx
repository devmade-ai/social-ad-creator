import { useState, useEffect, useCallback, useRef } from 'react'
import ConfirmButton from './ConfirmButton'
import { useToast } from './Toast'
import { useFocusTrap } from '../hooks/useFocusTrap'

export default function SaveLoadModal({ isOpen, onClose, onSave, onLoad, onDelete, getSavedDesigns }) {
  const { addToast } = useToast()
  const modalRef = useRef(null)
  useFocusTrap(modalRef, isOpen)
  const [designs, setDesigns] = useState([])
  const [saveName, setSaveName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('save')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Track whether modal is still open to prevent stale state updates from in-flight IDB queries
  const activeRef = useRef(false)

  const refreshDesigns = useCallback(async () => {
    const list = await getSavedDesigns()
    if (activeRef.current) setDesigns(list)
  }, [getSavedDesigns])

  useEffect(() => {
    if (isOpen) {
      activeRef.current = true
      refreshDesigns()
      setSaveName('')
      setSearchQuery('')
      setError(null)
    }
    return () => { activeRef.current = false }
  }, [isOpen, refreshDesigns])

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    // Include time for uniqueness when saving multiple designs on the same day
    const name = saveName.trim() || `Design ${new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    const result = await onSave(name)
    setLoading(false)
    if (result.success) {
      await refreshDesigns()
      setSaveName('')
      setActiveTab('load')
      addToast(`Saved "${name}"`, { type: 'success' })
    } else {
      setError(result.error || 'Failed to save design')
    }
  }

  const handleLoad = async (designId) => {
    setLoading(true)
    setError(null)
    const result = await onLoad(designId)
    setLoading(false)
    if (result.success) {
      onClose()
    } else {
      setError(result.error || 'Failed to load design')
    }
  }

  const handleDelete = async (designId) => {
    setError(null)
    const result = await onDelete(designId)
    if (result.success) {
      await refreshDesigns()
      addToast('Design deleted', { type: 'info' })
    } else {
      setError(result.error || 'Failed to delete design')
    }
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Focus the first interactive element when modal opens
  const saveInputRef = useRef(null)
  useEffect(() => {
    if (isOpen) {
      // Delay focus slightly to ensure DOM is ready after render
      const timer = setTimeout(() => saveInputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    // Backdrop — click outside modal to close
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      {/* Modal content — stop propagation so clicks inside don't close */}
      <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="save-load-title" className="bg-base-100 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h2 id="save-load-title" className="text-lg font-semibold text-base-content">Saved Designs</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-lg hover:bg-base-300 active:bg-base-200 text-base-content/70"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-base-300">
          <button
            onClick={() => setActiveTab('save')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium ${
              activeTab === 'save'
                ? 'text-primary border-b-2 border-primary'
                : 'text-base-content/70 hover:text-base-content'
            }`}
          >
            Save Current
          </button>
          <button
            onClick={() => setActiveTab('load')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium ${
              activeTab === 'load'
                ? 'text-primary border-b-2 border-primary'
                : 'text-base-content/70 hover:text-base-content'
            }`}
          >
            Load ({designs.length})
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-base-200 border border-base-300 text-sm text-error">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'save' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">
                  Design Name
                </label>
                <input
                  ref={saveInputRef}
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="My Design"
                  className="input input-bordered w-full"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Saving...' : 'Save Design'}
              </button>
              <p className="text-xs text-base-content/70 text-center">
                Designs are saved in your browser.
              </p>
            </div>
          )}

          {activeTab === 'load' && (
            <div className="space-y-2">
              {/* Search filter for saved designs */}
              {designs.length > 3 && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search designs..."
                  aria-label="Search saved designs"
                  className="input input-bordered input-sm w-full mb-2"
                />
              )}
              {designs.length === 0 ? (
                <p className="text-center text-base-content/70 py-8">
                  No saved designs yet.
                </p>
              ) : (
                designs.filter((d) => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase())).map((design) => (
                  <div
                    key={design.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Load design "${design.name}"`}
                    onClick={() => !loading && handleLoad(design.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !loading) handleLoad(design.id) }}
                    className={`w-full p-3 rounded-lg bg-base-200 hover:bg-base-300 active:bg-base-300/80 text-left group transition-colors cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-base-content">{design.name}</div>
                        <div className="text-xs text-base-content/70">{formatDate(design.savedAt)}</div>
                      </div>
                      <ConfirmButton
                        onConfirm={() => handleDelete(design.id)}
                        confirmLabel="Delete?"
                        className="p-2 rounded-lg opacity-50 sm:opacity-0 group-hover:opacity-100 hover:bg-base-300 active:bg-base-300 text-error transition-all"
                        title="Delete design"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </ConfirmButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
