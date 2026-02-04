import { useState, useEffect } from 'react'

export default function SaveLoadModal({ isOpen, onClose, onSave, onLoad, onDelete, getSavedDesigns }) {
  const [designs, setDesigns] = useState([])
  const [saveName, setSaveName] = useState('')
  const [activeTab, setActiveTab] = useState('save')

  useEffect(() => {
    if (isOpen) {
      setDesigns(getSavedDesigns())
      setSaveName('')
    }
  }, [isOpen, getSavedDesigns])

  const handleSave = () => {
    const name = saveName.trim() || `Design ${new Date().toLocaleDateString()}`
    const result = onSave(name)
    if (result.success) {
      setDesigns(getSavedDesigns())
      setSaveName('')
      setActiveTab('load')
    }
  }

  const handleLoad = (designId) => {
    const result = onLoad(designId)
    if (result.success) {
      onClose()
    }
  }

  const handleDelete = (designId, e) => {
    e.stopPropagation()
    if (confirm('Delete this design?')) {
      onDelete(designId)
      setDesigns(getSavedDesigns())
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
            className="p-1 rounded-lg hover:bg-ui-surface-hover text-ui-text-muted"
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
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'save'
                ? 'text-primary border-b-2 border-primary'
                : 'text-ui-text-muted hover:text-ui-text'
            }`}
          >
            Save Current
          </button>
          <button
            onClick={() => setActiveTab('load')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'load'
                ? 'text-primary border-b-2 border-primary'
                : 'text-ui-text-muted hover:text-ui-text'
            }`}
          >
            Load ({designs.length})
          </button>
        </div>

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
                  className="w-full px-3 py-2 rounded-lg bg-ui-surface-inset border border-ui-border text-ui-text placeholder-ui-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover active:scale-[0.98] transition-all"
              >
                Save Design
              </button>
              <p className="text-xs text-ui-text-muted text-center">
                Designs are saved to your browser's local storage.
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
                    className="w-full p-3 rounded-lg bg-ui-surface-inset hover:bg-ui-surface-hover text-left group transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-ui-text">{design.name}</div>
                        <div className="text-xs text-ui-text-muted">{formatDate(design.savedAt)}</div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(design.id, e)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-all"
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
