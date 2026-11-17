import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useSurah } from '../hooks/useQuran'
import { useSettings } from '../context/SettingsContext'
import { usePlayer } from '../context/PlayerContext'
import { AyahBadge, Bismillah, Ornament } from './Ornaments'

const inkMix = 'color-mix(in srgb, var(--ink) 74%, var(--muted))'

function LoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-6 sm:px-6">
      <div className="skeleton h-36 w-full rounded-3xl" />
      <div className="mt-8 space-y-4">
        {[92, 80, 96, 70, 88, 64].map((w, i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton ml-auto h-5" style={{ width: `${w}%` }} />
            <div className="skeleton h-3" style={{ width: `${Math.max(40, w - 24)}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Mushaf({ surahNumber, onOpenAyah, onBack, onGoToSurah, initialAyah }) {
  const { settings } = useSettings()
  const { current, isPlaying, isFullSurahAudio } = usePlayer()
  const [refreshKey, setRefreshKey] = useState(0)
  const { data, loading, error } = useSurah(surahNumber, refreshKey)

  const rowRefs = useRef({})
  const lastUserScroll = useRef(0)
  const didRestore = useRef(false)

  const showArabic = settings.displayMode !== 'en'
  const showEnglish = settings.displayMode !== 'ar'

  // Treat manual scrolling as intent — pause auto-follow briefly.
  useEffect(() => {
    const mark = () => {
      lastUserScroll.current = Date.now()
    }
    window.addEventListener('wheel', mark, { passive: true })
    window.addEventListener('touchmove', mark, { passive: true })
    window.addEventListener('keydown', mark)
    return () => {
      window.removeEventListener('wheel', mark)
      window.removeEventListener('touchmove', mark)
      window.removeEventListener('keydown', mark)
    }
  }, [])

  // Follow the recitation.
  const activeAyah =
    current && current.surah === surahNumber && !isFullSurahAudio ? current.ayah : null

  useEffect(() => {
    if (!isPlaying || !activeAyah) return
    if (Date.now() - lastUserScroll.current < 2200) return
    const el = rowRefs.current[activeAyah]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeAyah, isPlaying])

  // Restore the last-read position once per surah.
  useEffect(() => {
    didRestore.current = false
  }, [surahNumber])

  useEffect(() => {
    if (!data || didRestore.current) return
    didRestore.current = true
    if (initialAyah && initialAyah > 1) {
      requestAnimationFrame(() => {
        rowRefs.current[initialAyah]?.scrollIntoView({ block: 'center' })
      })
    }
  }, [data, initialAyah])

  const ayahs = useMemo(() => data?.ayahs ?? [], [data])

  if (loading) {
    return (
      <>
        <TopBar title="Mushaf" onBack={onBack} />
        <LoadingSkeleton />
      </>
    )
  }

  if (error) {
    return (
      <>
        <TopBar title="Mushaf" onBack={onBack} />
        <div className="mx-auto mt-24 max-w-sm px-6 text-center">
          <p className="font-serif text-lg" style={{ color: 'var(--ink)' }}>
            The text could not be loaded
          </p>
          <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
            {error} — please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            <RotateCcw size={15} /> Try again
          </button>
        </div>
      </>
    )
  }

  const { meta } = data

  return (
    <>
      <TopBar
        title={meta.englishName}
        subtitle={meta.name}
        onBack={onBack}
      />

      <div className="mx-auto w-full max-w-2xl px-4 pt-5 sm:px-6">
        {/* Surah header */}
        <header
          className="animate-fade rounded-3xl border px-5 py-7 text-center"
          style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
        >
          <p className="arabic text-[30px] leading-tight" style={{ color: 'var(--accent)' }}>
            {meta.name}
          </p>
          <h1 className="mt-3 font-serif text-[19px] tracking-tight" style={{ color: 'var(--ink)' }}>
            {meta.englishName}
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>
            {meta.englishNameTranslation}
          </p>
          <p className="mt-4 text-[10.5px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>
            {meta.revelationType} · {meta.numberOfAyahs} Ayahs
          </p>
        </header>

        {meta.number !== 1 && meta.number !== 9 && (
          <div className="mt-7">
            <Bismillah
              size={Math.round(Math.min(settings.arabicSize * 0.82, 34))}
              mode={settings.displayMode}
            />
          </div>
        )}

        <div className="mt-5 pb-2">
          {ayahs.map((ayah) => {
            const isActive = activeAyah === ayah.number
            return (
              <div
                key={ayah.number}
                id={`ayah-${ayah.number}`}
                ref={(el) => {
                  rowRefs.current[ayah.number] = el
                }}
                className="scroll-mt-24"
              >
                <button
                  type="button"
                  onClick={() => onOpenAyah(ayah.number)}
                  className="w-full rounded-2xl px-3 py-3.5 text-left transition-colors duration-300 ease-calm"
                  style={{
                    background: isActive ? 'var(--accent-soft)' : 'transparent',
                    boxShadow: isActive ? 'inset 2px 0 0 0 var(--accent)' : 'none',
                  }}
                  aria-label={`${meta.englishName}, ayah ${ayah.number}`}
                >
                  {showArabic && (
                    <p
                      dir="rtl"
                      className="arabic"
                      style={{
                        fontSize: settings.arabicSize,
                        lineHeight: 2.05,
                        color: 'var(--ink)',
                      }}
                    >
                      {ayah.arabic}
                      <AyahBadge number={ayah.number} />
                    </p>
                  )}
                  {showEnglish && (
                    <p
                      className="font-serif"
                      style={{
                        fontSize: settings.englishSize,
                        lineHeight: 1.68,
                        marginTop: showArabic ? '0.55rem' : 0,
                        color: inkMix,
                      }}
                    >
                      {ayah.english}
                      {ayah.sajda && (
                        <span
                          className="ml-2 align-middle text-[10px] uppercase tracking-widest"
                          style={{ color: 'var(--accent)' }}
                        >
                          ۩ sajda
                        </span>
                      )}
                    </p>
                  )}
                </button>
                <div className="mx-3 h-px" style={{ background: 'var(--line)', opacity: 0.55 }} />
              </div>
            )
          })}
        </div>

        <Ornament className="my-6" />

        <div className="flex items-center justify-between gap-3 pb-2">
          <button
            type="button"
            disabled={meta.number === 1}
            onClick={() => onGoToSurah(meta.number - 1)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] disabled:opacity-30"
            style={{ color: 'var(--muted)' }}
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <button
            type="button"
            disabled={meta.number === 114}
            onClick={() => onGoToSurah(meta.number + 1)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] disabled:opacity-30"
            style={{ color: 'var(--muted)' }}
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </>
  )
}

function TopBar({ title, subtitle, onBack }) {
  return (
    <div
      className="sticky top-0 z-30 border-b backdrop-blur-xl"
      style={{
        background: 'color-mix(in srgb, var(--bg) 82%, transparent)',
        borderColor: 'color-mix(in srgb, var(--line) 70%, transparent)',
      }}
    >
      <div className="relative mx-auto flex h-14 max-w-2xl items-center gap-2 pl-[7.6rem] pr-3 sm:pl-5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to surah list"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
          style={{ color: 'var(--muted)' }}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <p
            className="max-w-[42%] truncate px-1 text-[13.5px] font-medium tracking-wide"
            style={{ color: 'var(--ink)' }}
          >
            {title}
          </p>
        </div>
        <div className="ml-auto grid h-9 min-w-9 shrink-0 place-items-center">
          {subtitle ? (
            <span className="arabic truncate text-[13px]" style={{ color: 'var(--muted)' }}>
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
