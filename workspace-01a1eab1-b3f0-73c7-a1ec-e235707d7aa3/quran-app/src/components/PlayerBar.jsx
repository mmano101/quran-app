import { useRef, useState } from 'react'
import {
  ChevronDown,
  Loader2,
  ListMusic,
  Pause,
  Play,
  Repeat1,
  SkipBack,
  SkipForward,
  X,
} from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

export default function PlayerBar() {
  const {
    current,
    isPlaying,
    isLoading,
    progress,
    error,
    toggle,
    next,
    previous,
    seekTo,
    stop,
    mode,
    setMode,
    repeat,
    setRepeat,
    reciter,
    isFullSurahAudio,
    clearError,
  } = usePlayer()

  const [modeOpen, setModeOpen] = useState(false)
  const trackRef = useRef(null)

  if (!current) return null

  const handleSeek = (event) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return
    seekTo((event.clientX - rect.left) / rect.width)
  }

  const canSkip = !isFullSurahAudio

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 px-3"
      style={{ bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div
        className="animate-rise pointer-events-auto mx-auto max-w-2xl rounded-[22px] border shadow-pill backdrop-blur-xl"
        style={{
          background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
          borderColor: 'var(--line)',
        }}
      >
        {/* seek bar */}
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          onPointerDown={handleSeek}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') seekTo(Math.min(1, progress + 0.05))
            if (e.key === 'ArrowLeft') seekTo(Math.max(0, progress - 0.05))
          }}
          className="group relative h-1.5 w-full cursor-pointer touch-none overflow-hidden rounded-t-[22px]"
          style={{ background: 'var(--surface-2)' }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-r-full transition-[width] duration-200 ease-linear"
            style={{ width: `${progress * 100}%`, background: 'var(--accent)' }}
          />
          <span
            className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100"
            style={{ left: `calc(${progress * 100}% - 5px)`, background: 'var(--accent)' }}
          />
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1.5">
          <div className="min-w-0 flex-1 pl-1">
            <p
              className="flex items-baseline gap-1.5 text-[12.5px] font-medium"
              style={{ color: 'var(--ink)' }}
            >
              <span className="min-w-0 truncate">
                {current.surahName || `Surah ${current.surah}`}
              </span>
              <span className="shrink-0" style={{ color: 'var(--muted)' }}>
                {isFullSurahAudio ? '· full surah' : `· ${current.ayah} / ${current.total}`}
              </span>
            </p>
            <p className="truncate text-[10.5px]" style={{ color: 'var(--muted)' }}>
              {reciter.name}
            </p>
          </div>

          {error && (
            <button
              type="button"
              onClick={clearError}
              className="max-w-[120px] truncate rounded-full px-2 py-1 text-[10px]"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              title={error}
            >
              Audio issue
            </button>
          )}

          <div className="flex shrink-0 items-center gap-0.5">
            <IconButton
              label="Previous ayah"
              onClick={previous}
              disabled={!canSkip || current.ayah <= 1}
            >
              <SkipBack size={16} />
            </IconButton>

            <button
              type="button"
              onClick={toggle}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="grid h-9 w-9 place-items-center rounded-full transition-transform active:scale-95"
              style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isPlaying ? (
                <Pause size={16} fill="currentColor" />
              ) : (
                <Play size={16} fill="currentColor" className="ml-[1px]" />
              )}
            </button>

            <IconButton
              label="Next ayah"
              onClick={next}
              disabled={!canSkip || (current.ayah ?? 0) >= current.total}
            >
              <SkipForward size={16} />
            </IconButton>

            <IconButton
              label={repeat ? 'Repeat ayah: on' : 'Repeat ayah: off'}
              onClick={() => setRepeat(!repeat)}
              active={repeat}
              disabled={isFullSurahAudio}
            >
              <Repeat1 size={16} />
            </IconButton>

            <div className="relative">
              <button
                type="button"
                onClick={() => setModeOpen((v) => !v)}
                aria-label="Playback range"
                disabled={isFullSurahAudio}
                className="flex items-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-medium disabled:opacity-40"
                style={{ background: 'var(--surface-2)', color: 'var(--ink)' }}
              >
                {mode === 'single' ? 'Ayah' : 'Surah'}
                <ChevronDown size={12} />
              </button>
              {modeOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setModeOpen(false)} />
                  <div
                    className="animate-rise absolute bottom-full right-0 z-20 mb-2 w-52 overflow-hidden rounded-2xl border p-1 shadow-soft"
                    style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
                  >
                    {[
                      { id: 'single', title: 'One ayah', description: 'Stop when it ends' },
                      { id: 'surah', title: 'Whole surah', description: 'Continue to the end' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setMode(option.id)
                          setModeOpen(false)
                        }}
                        className="flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-surface2"
                      >
                        <ListMusic
                          size={14}
                          className="mt-0.5 shrink-0"
                          style={{ color: mode === option.id ? 'var(--accent)' : 'var(--muted)' }}
                        />
                        <span>
                          <span
                            className="block text-[12.5px] font-medium"
                            style={{ color: 'var(--ink)' }}
                          >
                            {option.title}
                          </span>
                          <span className="block text-[10.5px]" style={{ color: 'var(--muted)' }}>
                            {option.description}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <IconButton label="Stop and close player" onClick={stop}>
              <X size={16} />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function IconButton({ children, label, onClick, disabled, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className="grid h-8 w-8 place-items-center rounded-full disabled:opacity-30"
      style={{
        color: active ? 'var(--accent)' : 'var(--muted)',
        background: active ? 'var(--accent-soft)' : 'transparent',
      }}
    >
      {children}
    </button>
  )
}
