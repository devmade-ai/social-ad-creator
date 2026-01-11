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

      // Don't add to history if state hasn't changed
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
