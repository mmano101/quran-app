import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ayahAudioUrl, getReciter } from '../lib/reciters'
import { useSettings } from './SettingsContext'

const PlayerContext = createContext(null)

/**
 * One shared <audio> element drives every "play" action in the app.
 * Handles: single ayah / whole surah queues, repeat, auto-advance,
 * next-ayah preloading and the active-ayah highlight.
 */
export function PlayerProvider({ children }) {
  const { settings, update } = useSettings()
  const reciter = useMemo(() => getReciter(settings.reciterId), [settings.reciterId])

  const audioRef = useRef(null)
  const preloaded = useRef(new Map())
  const [current, setCurrent] = useState(null) // { surah, ayah, total, surahName, surahArabicName }
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0) // 0..1
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(null)

  const currentRef = useRef(current)
  currentRef.current = current
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const reciterRef = useRef(reciter)
  reciterRef.current = reciter
  const endedHandler = useRef(() => {})

  /* ------------------------- audio element setup ------------------------ */
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'auto'
    audioRef.current = audio

    const onTime = () =>
      setProgress(audio.duration ? Math.min(1, audio.currentTime / audio.duration) : 0)
    const onMeta = () => setDuration(audio.duration || 0)
    const onPlaying = () => {
      setIsPlaying(true)
      setIsLoading(false)
    }
    const onPause = () => setIsPlaying(false)
    const onWaiting = () => setIsLoading(true)
    const onCanPlay = () => setIsLoading(false)
    const onEnded = () => endedHandler.current()
    const onError = () => {
      setIsPlaying(false)
      setIsLoading(false)
      setError('This recitation could not be loaded. Try another reciter in Settings.')
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('play', onPlaying)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('play', onPlaying)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.src = ''
    }
  }, [])

  const preload = useCallback((url) => {
    if (!url || preloaded.current.has(url)) return
    const el = new Audio()
    el.preload = 'auto'
    el.src = url
    el.load()
    preloaded.current.set(url, el)
    if (preloaded.current.size > 4) {
      const [oldest] = preloaded.current.keys()
      preloaded.current.delete(oldest)
    }
  }, [])

  /* ----------------------------- playback core -------------------------- */
  const load = useCallback((track) => {
    const audio = audioRef.current
    if (!audio) return
    setError(null)
    setIsLoading(true)
    setProgress(0)
    setDuration(0)
    setCurrent(track)
    audio.src = ayahAudioUrl(reciterRef.current.id, track.surah, track.ayah)
    const nextAyah = track.ayah + 1
    if (!reciterRef.current.surahOnly && nextAyah <= track.total) {
      preload(ayahAudioUrl(reciterRef.current.id, track.surah, nextAyah))
    }
    const promise = audio.play()
    if (promise?.catch) {
      promise.catch((err) => {
        if (err?.name === 'AbortError') return
        setIsLoading(false)
        setIsPlaying(false)
        setError('Playback was blocked or the audio is unavailable. Tap play to retry.')
      })
    }
  }, [preload])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    setCurrent(null)
    setIsPlaying(false)
    setIsLoading(false)
    setProgress(0)
    setDuration(0)
  }, [])

  const finish = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    setCurrent(null)
    setIsPlaying(false)
    setProgress(0)
    setDuration(0)
  }, [])

  /** Play one ayah — `mode` decides what happens when it finishes. */
  const playAyah = useCallback(
    (track, mode) => {
      if (mode) update({ playbackMode: mode })
      load({
        surah: track.surah,
        ayah: track.ayah,
        total: track.total,
        surahName: track.surahName || '',
        surahArabicName: track.surahArabicName || '',
      })
    },
    [load, update],
  )

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!currentRef.current) return
    if (audio.paused) {
      audio.play().catch(() => {
        setIsPlaying(false)
        setError('Playback was blocked. Tap play again.')
      })
    } else {
      audio.pause()
    }
  }, [])

  const goTo = useCallback(
    (delta) => {
      const track = currentRef.current
      if (!track || reciterRef.current.surahOnly) return
      const next = track.ayah + delta
      if (next < 1 || next > track.total) return
      load({ ...track, ayah: next })
    },
    [load],
  )

  const seekTo = useCallback((ratio) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration
    setProgress(Math.max(0, Math.min(1, ratio)))
  }, [])

  const setMode = useCallback((playbackMode) => update({ playbackMode }), [update])
  const setRepeat = useCallback((repeatAyah) => update({ repeatAyah }), [update])

  /* ---------------------- what happens when audio ends ------------------ */
  useEffect(() => {
    endedHandler.current = () => {
      const track = currentRef.current
      if (!track) return finish()
      const audio = audioRef.current
      const { repeatAyah, playbackMode } = settingsRef.current

      if (repeatAyah && audio) {
        audio.currentTime = 0
        audio.play().catch(() => {})
        return
      }
      if (reciterRef.current.surahOnly) return finish() // full-surah file is done
      if (playbackMode === 'single') return finish() // stop after the single ayah
      if (track.ayah < track.total) {
        load({ ...track, ayah: track.ayah + 1 })
      } else {
        finish()
      }
    }
  }, [load, finish])

  /* ---------------- reciter change while something is loaded ------------ */
  const lastReciterRef = useRef(settings.reciterId)
  useEffect(() => {
    if (lastReciterRef.current === settings.reciterId) return
    lastReciterRef.current = settings.reciterId
    const track = currentRef.current
    if (!track) return
    const audio = audioRef.current
    if (audio && !audio.paused) {
      load({ ...track, ayah: reciter.surahOnly ? 1 : track.ayah })
    } else {
      finish()
    }
  }, [settings.reciterId, reciter.surahOnly, load, finish])

  /* -------------------- lock-screen / media key controls ---------------- */
  const goToRef = useRef(() => {})
  goToRef.current = goTo

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return undefined
    const ms = navigator.mediaSession
    const safe = (action, handler) => {
      try {
        ms.setActionHandler(action, handler)
      } catch {
        /* unsupported action */
      }
    }
    safe('play', () => audioRef.current?.play().catch(() => {}))
    safe('pause', () => audioRef.current?.pause())
    safe('nexttrack', () => goToRef.current(1))
    safe('previoustrack', () => goToRef.current(-1))
    safe('stop', () => audioRef.current?.pause())
    return () => {
      ;['play', 'pause', 'nexttrack', 'previoustrack', 'stop'].forEach((action) => safe(action, null))
    }
  }, [])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    try {
      if (!current) {
        navigator.mediaSession.metadata = null
        navigator.mediaSession.playbackState = 'none'
        return
      }
      if (typeof MediaMetadata !== 'undefined') {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `${current.surahName || `Surah ${current.surah}`} · ${
            reciter.surahOnly ? 'Full surah' : `Ayah ${current.ayah}`
          }`,
          artist: reciter.name,
          album: 'Qur’an',
        })
      }
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    } catch {
      /* ignore */
    }
  }, [current, isPlaying, reciter])

  const value = useMemo(
    () => ({
      current,
      isPlaying,
      isLoading,
      progress,
      duration,
      error,
      clearError: () => setError(null),
      playAyah,
      toggle,
      next: () => goTo(1),
      previous: () => goTo(-1),
      seekTo,
      stop,
      setMode,
      setRepeat,
      reciter,
      mode: settings.playbackMode,
      repeat: settings.repeatAyah,
      isFullSurahAudio: Boolean(reciter.surahOnly),
    }),
    [
      current,
      isPlaying,
      isLoading,
      progress,
      duration,
      error,
      playAyah,
      toggle,
      goTo,
      seekTo,
      stop,
      setMode,
      setRepeat,
      reciter,
      settings.playbackMode,
      settings.repeatAyah,
    ],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider')
  return ctx
}
