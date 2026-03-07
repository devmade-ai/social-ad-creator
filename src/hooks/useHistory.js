import { useState, useCallback, useRef } from 'react'

const MAX_HISTORY = 50

export function useHistory(initialState) {
  const [state, setStateInternal] = useState(initialState)
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
      return newState
    })
  }, [])

  const undo = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current--
      setStateInternal(historyRef.current[indexRef.current])
    }
  }, [])

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current++
      setStateInternal(historyRef.current[indexRef.current])
    }
  }, [])

  const canUndo = indexRef.current > 0
  const canRedo = indexRef.current < historyRef.current.length - 1

  // Reset history (e.g., when loading a saved design)
  const resetHistory = useCallback((newState) => {
    historyRef.current = [newState]
    indexRef.current = 0
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
