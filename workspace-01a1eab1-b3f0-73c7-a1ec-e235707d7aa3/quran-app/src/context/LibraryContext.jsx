import { createContext, useCallback, useContext, useMemo } from 'react'
import { usePersistentState } from '../lib/storage'

const LibraryContext = createContext(null)

/** Bookmarks ("Saved" tab) + last-read position. Both live in localStorage.
 *  Two collections are kept: Qur'an ayahs, and hadiths / du'as. */
export function LibraryProvider({ children }) {
  const [bookmarks, setBookmarks] = usePersistentState('quran.bookmarks.v1', [])
  const [extras, setExtras] = usePersistentState('quran.bookmarks.extras.v1', [])
  const [lastRead, setLastRead] = usePersistentState('quran.lastread.v1', null)

  const isSaved = useCallback(
    (surah, ayah) => bookmarks.some((b) => b.surah === surah && b.ayah === ayah),
    [bookmarks],
  )

  const toggleBookmark = useCallback(
    (entry) => {
      setBookmarks((prev) => {
        const exists = prev.some((b) => b.surah === entry.surah && b.ayah === entry.ayah)
        if (exists) return prev.filter((b) => !(b.surah === entry.surah && b.ayah === entry.ayah))
        return [{ ...entry, savedAt: Date.now() }, ...prev]
      })
    },
    [setBookmarks],
  )

  const removeBookmark = useCallback(
    (surah, ayah) =>
      setBookmarks((prev) => prev.filter((b) => !(b.surah === surah && b.ayah === ayah))),
    [setBookmarks],
  )

  /* ------------------- hadith / du'a bookmarks ------------------------- */
  const isExtraSaved = useCallback((id) => extras.some((item) => item.id === id), [extras])

  const toggleExtra = useCallback(
    (entry) => {
      setExtras((prev) => {
        if (prev.some((item) => item.id === entry.id)) {
          return prev.filter((item) => item.id !== entry.id)
        }
        return [{ ...entry, savedAt: Date.now() }, ...prev]
      })
    },
    [setExtras],
  )

  const removeExtra = useCallback(
    (id) => setExtras((prev) => prev.filter((item) => item.id !== id)),
    [setExtras],
  )

  const value = useMemo(
    () => ({
      bookmarks,
      isSaved,
      toggleBookmark,
      removeBookmark,
      extras,
      isExtraSaved,
      toggleExtra,
      removeExtra,
      lastRead,
      setLastRead,
    }),
    [
      bookmarks,
      isSaved,
      toggleBookmark,
      removeBookmark,
      extras,
      isExtraSaved,
      toggleExtra,
      removeExtra,
      lastRead,
      setLastRead,
    ],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export const useLibrary = () => {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider')
  return ctx
}
