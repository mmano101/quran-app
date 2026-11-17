import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { DEFAULT_SETTINGS, patternDataUri, resolveTheme } from '../lib/themes'
import { usePersistentState } from '../lib/storage'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = usePersistentState('quran.settings.v1', DEFAULT_SETTINGS)

  const update = useCallback(
    (patch) => setSettings((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) })),
    [setSettings],
  )

  const theme = useMemo(
    () => resolveTheme(settings.themeId, settings.customBg),
    [settings.themeId, settings.customBg],
  )

  // Apply theme tokens to :root so every component can use CSS variables.
  useEffect(() => {
    const t = theme.tokens
    const root = document.documentElement
    root.style.setProperty('--bg', t.bg)
    root.style.setProperty('--surface', t.surface)
    root.style.setProperty('--surface-2', t.surface2)
    root.style.setProperty('--ink', t.ink)
    root.style.setProperty('--muted', t.muted)
    root.style.setProperty('--accent', t.accent)
    root.style.setProperty('--accent-ink', t.accentInk)
    root.style.setProperty('--accent-soft', t.accentSoft)
    root.style.setProperty('--line', t.line)
    root.style.setProperty(
      '--arabic-font',
      settings.arabicFont === 'scheherazade'
        ? "'Scheherazade New', 'Amiri', serif"
        : "'Amiri', 'Scheherazade New', serif",
    )
    root.style.setProperty(
      '--pattern',
      settings.pattern ? patternDataUri(t.accent, t.dark ? 0.2 : 0.11) : 'none',
    )
    root.dataset.dark = String(Boolean(t.dark))
    root.style.colorScheme = t.dark ? 'dark' : 'light'
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', t.bg)
  }, [theme, settings.pattern, settings.arabicFont])

  const value = useMemo(() => ({ settings, update, theme }), [settings, update, theme])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
