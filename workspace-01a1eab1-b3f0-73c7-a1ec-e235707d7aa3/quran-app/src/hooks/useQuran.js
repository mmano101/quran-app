import { useEffect, useState } from 'react'
import { fetchSurah, fetchSurahIndex } from '../lib/api'

/** 114-surah index (cached in localStorage after the first load). */
export function useSurahIndex(refreshKey = 0) {
  const [state, setState] = useState({ index: [], loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    fetchSurahIndex()
      .then((index) => !cancelled && setState({ index, loading: false, error: null }))
      .catch((error) =>
        !cancelled
          ? setState({ index: [], loading: false, error: error.message || 'Something went wrong' })
          : null,
      )
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  return state
}

/** Arabic + English text of one surah. */
export function useSurah(surahNumber, refreshKey = 0) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  useEffect(() => {
    if (!surahNumber) return
    let cancelled = false
    setState((prev) => ({
      data: prev.data && prev.data.meta.number === surahNumber ? prev.data : null,
      loading: true,
      error: null,
    }))
    fetchSurah(surahNumber)
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) =>
        !cancelled
          ? setState({ data: null, loading: false, error: error.message || 'Something went wrong' })
          : null,
      )
    return () => {
      cancelled = true
    }
  }, [surahNumber, refreshKey])

  return state
}
