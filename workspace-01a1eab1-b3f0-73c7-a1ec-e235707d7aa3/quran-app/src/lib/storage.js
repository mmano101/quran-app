import { useCallback, useEffect, useRef, useState } from 'react'

/** localStorage-backed state with a safe fallback (private mode, quota, …). */
export function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw == null) return initialValue
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && typeof initialValue === 'object' && !Array.isArray(initialValue)) {
        return { ...initialValue, ...parsed }
      }
      return parsed
    } catch {
      return initialValue
    }
  })

  const keyRef = useRef(key)
  keyRef.current = key

  useEffect(() => {
    try {
      localStorage.setItem(keyRef.current, JSON.stringify(state))
    } catch {
      /* storage full / unavailable — app keeps working in memory */
    }
  }, [state])

  return [state, setState]
}

export const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function useToast() {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const show = useCallback((message) => {
    setToast(message)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 2000)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return { toast, show }
}
