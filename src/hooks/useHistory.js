import { useState, useCallback, useRef } from 'react'

const MAX_HISTORY = 50

// Requirement: Fast state comparison that avoids serializing large base64 image data.
// Approach: Recursive deep equality with early exit. Avoids JSON.stringify entirely —
//   JSON.stringify on complex state trees with nested objects is O(n) per keystroke
//   and can take 10-100ms. Recursive comparison exits at the first mismatch.
// Alternatives:
//   - JSON.stringify: Rejected — serializes entire state tree on every keystroke.
//   - immer-style structural sharing: Rejected — requires changing state management.
function deepEqual(a, b) {
  if (a === b) return true
  if (a == null || b == null) return a === b
  if (typeof a !== typeof b) return false

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }

  if (typeof a === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    for (const key of keysA) {
      if (!deepEqual(a[key], b[key])) return false
    }
    return true
  }

  return a === b
}

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
      for (let i = 0; i < a[key].length; i++) {
        if (a[key][i].id !== b[key][i].id) return false
        // Compare non-src fields using recursive deepEqual (no JSON.stringify)
        const { src: _a, ...restA } = a[key][i]
        const { src: _b, ...restB } = b[key][i]
        if (!deepEqual(restA, restB)) return false
      }
      continue
    }
    // Logo: skip base64 comparison (reference change = content change)
    if (key === 'logo') return false
    // Recursive deep comparison — exits at first mismatch instead of serializing entire subtree
    if (!deepEqual(a[key], b[key])) return false
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
