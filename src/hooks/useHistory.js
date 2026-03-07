import { useState, useCallback, useRef } from 'react'

const MAX_HISTORY = 50

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
      // Approach: Reference equality check first (covers most cases where updater
      //   returns prev unchanged), then fall back to JSON comparison only when needed.
      // Alternatives:
      //   - JSON.stringify only: Rejected — O(n) on every update, expensive with base64 images.
      //   - Shallow comparison: Rejected — nested state objects would miss deep changes.
      if (prev === newState) return prev
      if (JSON.stringify(prev) === JSON.stringify(newState)) {
        return prev
      }

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
