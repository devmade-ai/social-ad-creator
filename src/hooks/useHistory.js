import { useState, useCallback, useRef } from 'react'

const MAX_HISTORY = 50

// Requirement: Fast state comparison that avoids serializing large base64 image data.
// Approach: Compare top-level keys by reference. For keys that differ, compare
//   JSON representation — but strip image `src` fields first (since images are
//   always replaced by reference via .map(), never mutated in-place, so if
//   the images array reference changed, the content definitely changed).
function shallowEqual(a, b) {
  if (a === b) return true
  if (!a || !b) return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  for (const key of keysA) {
    if (a[key] === b[key]) continue
    // Images array: compare by length + IDs only (skip base64 src)
    if (key === 'images') {
      if (!Array.isArray(a[key]) || !Array.isArray(b[key])) return false
      if (a[key].length !== b[key].length) return false
      const idsA = a[key].map((img) => img.id).join(',')
      const idsB = b[key].map((img) => img.id).join(',')
      if (idsA !== idsB) return false
      // Compare non-src fields for each image
      for (let i = 0; i < a[key].length; i++) {
        const { src: _a, ...restA } = a[key][i]
        const { src: _b, ...restB } = b[key][i]
        if (JSON.stringify(restA) !== JSON.stringify(restB)) return false
      }
      continue
    }
    // Logo: skip base64 comparison (reference change = content change)
    if (key === 'logo') return false
    // For other keys, fall back to JSON comparison
    if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) return false
  }
  return true
}

// Requirement: Undo/redo with canUndo/canRedo that stay in sync with React renders.
// Approach: Track history index in both a ref (for synchronous access inside updaters)
//   and a state variable (to trigger re-renders when it changes). canUndo/canRedo are
//   derived from the state variable, not the ref, so they update on every render.
// Alternatives:
//   - Refs only: Rejected — canUndo/canRedo derived from refs don't trigger re-renders,
//     causing stale disabled states on undo/redo buttons.
//   - State only: Rejected — need synchronous access inside setStateInternal updater.
export function useHistory(initialState) {
  const [state, setStateInternal] = useState(initialState)
  const [historyIndex, setHistoryIndex] = useState(0)
  const [historyLength, setHistoryLength] = useState(1)
  const historyRef = useRef([initialState])
  const indexRef = useRef(0)

  // Set state and add to history
  const setState = useCallback((updater) => {
    setStateInternal((prev) => {
      const newState = typeof updater === 'function' ? updater(prev) : updater

      // Requirement: Avoid expensive JSON.stringify on every state update.
      // Approach: Reference equality check first, then shallow key comparison,
      //   then lightweight deep comparison that skips image src data (multi-MB base64).
      // Alternatives:
      //   - Full JSON.stringify: Rejected — serializes multi-MB base64 on every keystroke.
      //   - Shallow comparison only: Rejected — misses nested state changes.
      if (prev === newState) return prev
      if (shallowEqual(prev, newState)) return prev

      // Truncate future history if we're not at the end
      const history = historyRef.current.slice(0, indexRef.current + 1)

      // Add new state
      history.push(newState)

      // Limit history size
      if (history.length > MAX_HISTORY) {
        history.shift()
      } else {
        indexRef.current++
      }

      historyRef.current = history
      setHistoryIndex(indexRef.current)
      setHistoryLength(history.length)
      return newState
    })
  }, [])

  const undo = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current--
      setHistoryIndex(indexRef.current)
      setStateInternal(historyRef.current[indexRef.current])
    }
  }, [])

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current++
      setHistoryIndex(indexRef.current)
      setStateInternal(historyRef.current[indexRef.current])
    }
  }, [])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < historyLength - 1

  // Reset history (e.g., when loading a saved design)
  const resetHistory = useCallback((newState) => {
    historyRef.current = [newState]
    indexRef.current = 0
    setHistoryIndex(0)
    setHistoryLength(1)
    setStateInternal(newState)
  }, [])

  return {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  }
}
