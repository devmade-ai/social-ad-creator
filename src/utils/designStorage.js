// Requirement: Persistent design storage using IndexedDB instead of localStorage.
// Approach: IndexedDB has no practical size limit (vs localStorage's 5-10MB), handles
//   binary data natively, and avoids base64 overhead. Wraps IDB in a simple async API.
// Alternatives:
//   - localStorage: Rejected — 5-10MB limit silently drops designs with large images.
//   - localForage: Rejected — adds a dependency for a thin IDB wrapper we can write in 80 lines.

const DB_NAME = 'canvagrid'
const DB_VERSION = 1
const STORE_NAME = 'designs'
const LEGACY_STORAGE_KEY = 'canvagrid-designs'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function txn(mode, callback) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode)
      const store = tx.objectStore(STORE_NAME)
      const result = callback(store)
      tx.oncomplete = () => resolve(result._value)
      tx.onerror = () => reject(tx.error)
      // For get/getAll, attach to the IDBRequest
      if (result instanceof IDBRequest) {
        result.onsuccess = () => {
          result._value = result.result
        }
      }
    })
  })
}

/** Save a design to IndexedDB */
export async function saveDesign(design) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(design)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Load a single design by ID */
export async function loadDesign(designId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(designId)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

/** List all designs (metadata only: id, name, savedAt) */
export async function listDesigns() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = () => {
      const designs = (req.result || []).map((d) => ({
        id: d.id,
        name: d.name,
        savedAt: d.savedAt,
      }))
      // Sort newest first
      designs.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      resolve(designs)
    }
    req.onerror = () => reject(req.error)
  })
}

/** Delete a design by ID */
export async function deleteDesign(designId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(designId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// Requirement: One-time migration from localStorage to IndexedDB.
// Approach: Read legacy key, write each design to IDB, then delete the key.
//   Also runs text format migration (old global text → per-cell) so that
//   backward compat code can be removed from the load path.
// Alternatives:
//   - Keep localStorage forever: Rejected — defeats purpose of migration.
//   - Delete without migrating: Rejected — users lose saved designs.
let migrationDone = false

export async function migrateFromLocalStorage(migrateTextFn) {
  if (migrationDone) return
  migrationDone = true

  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return

    const designs = JSON.parse(raw)
    if (!Array.isArray(designs) || designs.length === 0) return

    for (const design of designs) {
      // Run text format migration on each design before storing in IDB
      if (design.state && migrateTextFn) {
        migrateTextFn(design.state)
      }
      await saveDesign(design)
    }

    // Remove legacy data after successful migration
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    // Non-critical — designs stay in localStorage if migration fails
  }
}
