import { useState, useEffect, useCallback } from 'react'

export default function SaveLoadModal({ isOpen, onClose, onSave, onLoad, onDelete, getSavedDesigns }) {
  const [designs, setDesigns] = useState([])
  const [saveName, setSaveName] = useState('')
  const [activeTab, setActiveTab] = useState('save')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refreshDesigns = useCallback(async () => {
    const list = await getSavedDesigns()
    setDesigns(list)
  }, [getSavedDesigns])

  useEffect(() => {
    if (isOpen) {
      refreshDesigns()
      setSaveName('')
      setError(null)
    }
  }, [isOpen, refreshDesigns])

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    const name = saveName.trim() || `Design ${new Date().toLocaleDateString()}`
    const result = await onSave(name)
    setLoading(false)
    if (result.success) {
      await refreshDesigns()
      setSaveName('')
      setActiveTab('load')
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

  const handleDelete = async (designId, e) => {
    e.stopPropagation()
    if (confirm('Delete this design?')) {
      await onDelete(designId)
      await refreshDesigns()
    }
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-ui-surface rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ui-border">
          <h2 className="text-lg font-semibold text-ui-text">Saved Designs</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-ui-surface-hover active:bg-ui-surface-inset text-ui-text-muted"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-ui-border">
          <button
            onClick={() => setActiveTab('save')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium ${
              activeTab === 'save'
                ? 'text-primary border-b-2 border-primary'
                : 'text-ui-text-muted hover:text-ui-text'
            }`}
          >
            Save Current
          </button>
          <button
            onClick={() => setActiveTab('load')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium ${
              activeTab === 'load'
                ? 'text-primary border-b-2 border-primary'
                : 'text-ui-text-muted hover:text-ui-text'
            }`}
          >
            Load ({designs.length})
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'save' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ui-text-muted mb-1">
                  Design Name
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="My Design"
                  className="w-full px-3 py-2.5 rounded-lg bg-ui-surface-inset border border-ui-border text-ui-text placeholder-ui-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 transition-all"
              >
                {loading ? 'Saving...' : 'Save Design'}
              </button>
              <p className="text-xs text-ui-text-muted text-center">
                Designs are saved in your browser.
              </p>
            </div>
          )}

          {activeTab === 'load' && (
            <div className="space-y-2">
              {designs.length === 0 ? (
                <p className="text-center text-ui-text-muted py-8">
                  No saved designs yet.
                </p>
              ) : (
                designs.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => handleLoad(design.id)}
                    disabled={loading}
                    className="w-full p-3 rounded-lg bg-ui-surface-inset hover:bg-ui-surface-hover active:bg-ui-surface-hover/80 text-left group transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-ui-text">{design.name}</div>
                        <div className="text-xs text-ui-text-muted">{formatDate(design.savedAt)}</div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(design.id, e)}
                        className="p-2 rounded-lg opacity-50 sm:opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 active:bg-red-200 dark:active:bg-red-900/50 text-red-500 transition-all"
                        title="Delete design"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
