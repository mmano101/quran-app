import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'

const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null)
  const timer = useRef(null)

  const notify = useCallback((text) => {
    setMessage(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 1900)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 z-[80] flex justify-center px-4"
        style={{ bottom: 'calc(148px + env(safe-area-inset-bottom, 0px))' }}
        aria-live="polite"
      >
        {message && (
          <div
            className="animate-rise flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] shadow-soft"
            style={{
              background: 'var(--surface)',
              color: 'var(--ink)',
              borderColor: 'var(--line)',
            }}
          >
            <Check size={14} style={{ color: 'var(--accent)' }} />
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
