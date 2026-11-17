import { useEffect, useRef, useState } from 'react'
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ChevronDown,
  Copy,
  Info,
  ListMusic,
  Loader2,
  Play,
  X,
} from 'lucide-react'
import { useSurah } from '../hooks/useQuran'
import { usePlayer } from '../context/PlayerContext'
import { useSettings } from '../context/SettingsContext'
import { useLibrary } from '../context/LibraryContext'
import { useToast } from './Toast'
import { fetchTafsir } from '../lib/api'
import { AyahBadge } from './Ornaments'

export default function AyahSheet({ surah, ayah, onClose }) {
  const { settings } = useSettings()
  const { playAyah, isFullSurahAudio, reciter } = usePlayer()
  const { isSaved, toggleBookmark } = useLibrary()
  const notify = useToast()
  const { data, loading } = useSurah(surah)

  const [menuOpen, setMenuOpen] = useState(false)
  const [tafsirOpen, setTafsirOpen] = useState(false)
  const [tafsirLang, setTafsirLang] = useState('en')
  const [tafsirText, setTafsirText] = useState({ en: null, ar: null })
  const [tafsirLoading, setTafsirLoading] = useState(false)
  const [tafsirError, setTafsirError] = useState(null)
  const tafsirRef = useRef(null)

  const meta = data?.meta
  const verse = data?.ayahs.find((a) => a.number === ayah)
  const saved = isSaved(surah, ayah)

  /* ---- body scroll lock + escape to close ---- */
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  /* ---- tafsir loading ---- */
  useEffect(() => {
    if (!tafsirOpen || tafsirText[tafsirLang]) return
    let cancelled = false
    setTafsirLoading(true)
    setTafsirError(null)
    fetchTafsir(surah, ayah, tafsirLang)
      .then((text) => !cancelled && setTafsirText((prev) => ({ ...prev, [tafsirLang]: text })))
      .catch(
        (error) => !cancelled && setTafsirError(error.message || 'Tafsir unavailable right now'),
      )
      .finally(() => !cancelled && setTafsirLoading(false))
    return () => {
      cancelled = true
    }
  }, [tafsirOpen, tafsirLang, surah, ayah, tafsirText])

  const handlePlay = (mode) => {
    setMenuOpen(false)
    playAyah(
      {
        surah,
        ayah,
        total: meta?.numberOfAyahs ?? ayah,
        surahName: meta?.englishName ?? '',
        surahArabicName: meta?.name ?? '',
      },
      mode,
    )
    onClose()
  }

  const handleSave = () => {
    if (!verse) return
    toggleBookmark({
      surah,
      ayah,
      surahName: meta?.englishName ?? '',
      surahArabicName: meta?.name ?? '',
      arabic: verse.arabic,
      english: verse.english,
    })
    notify(saved ? 'Removed from Saved' : 'Saved to bookmarks')
  }

  const handleCopy = async () => {
    if (!verse) return
    const text = `${verse.arabic}\n\n${verse.english}\n\n— Qur’an ${surah}:${ayah} · ${meta?.englishName ?? ''} (Saheeh International)`
    try {
      await navigator.clipboard.writeText(text)
      notify('Copied Arabic & translation')
    } catch {
      notify('Copy is not available in this browser')
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div
        className="animate-fade absolute inset-0"
        style={{ background: 'rgba(12,10,8,0.45)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Ayah ${ayah} of surah ${meta?.englishName ?? surah}`}
        className="animate-sheet-up relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-[28px] border-t sm:max-h-[82vh] sm:max-w-lg sm:rounded-3xl sm:border"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--line)',
          boxShadow: '0 -8px 40px -12px rgba(0,0,0,.35)',
        }}
      >
        <div className="pt-2.5 sm:hidden">
          <div className="mx-auto h-1 w-10 rounded-full" style={{ background: 'var(--line)' }} />
        </div>

        <div className="flex items-start justify-between gap-3 px-5 pt-3">
          <div className="min-w-0">
            <p
              className="text-[10px] uppercase tracking-[0.22em]"
              style={{ color: 'var(--muted)' }}
            >
              Ayah {ayah} · {surah}:{ayah}
            </p>
            <p className="mt-1 flex items-baseline gap-2">
              <span
                className="truncate font-serif text-[17px] tracking-tight"
                style={{ color: 'var(--ink)' }}
              >
                {meta?.englishName ?? `Surah ${surah}`}
              </span>
              {meta?.name && (
                <span className="arabic shrink-0 text-[15px]" style={{ color: 'var(--accent)' }}>
                  {meta.name}
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
            style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4">
          {loading || !verse ? (
            <div className="space-y-3">
              <div className="skeleton ml-auto h-6 w-[90%]" />
              <div className="skeleton ml-auto h-6 w-[75%]" />
              <div className="skeleton h-4 w-[95%]" />
              <div className="skeleton h-4 w-[60%]" />
            </div>
          ) : (
            <>
              {settings.displayMode !== 'en' && (
                <p
                  dir="rtl"
                  className="arabic"
                  style={{
                    fontSize: Math.max(24, Math.round(settings.arabicSize * 0.95)),
                    lineHeight: 2.05,
                    color: 'var(--ink)',
                  }}
                >
                  {verse.arabic}
                  <AyahBadge number={ayah} />
                </p>
              )}

              {settings.displayMode !== 'ar' && (
                <p
                  className="mt-5 font-serif"
                  style={{
                    fontSize: settings.englishSize + 1,
                    lineHeight: 1.7,
                    color: 'color-mix(in srgb, var(--ink) 76%, var(--muted))',
                  }}
                >
                  {verse.english}
                </p>
              )}

              {/* Tafsir */}
              <button
                type="button"
                onClick={() => setTafsirOpen((v) => !v)}
                aria-expanded={tafsirOpen}
                className="mt-5 flex w-full items-center justify-between rounded-xl px-3.5 py-2.5"
                style={{ background: 'var(--surface-2)', color: 'var(--ink)' }}
              >
                <span className="flex items-center gap-2 text-[13px] font-medium">
                  <BookOpen size={15} style={{ color: 'var(--accent)' }} />
                  Brief Tafsir
                </span>
                <ChevronDown
                  size={16}
                  style={{
                    color: 'var(--muted)',
                    transform: tafsirOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform .25s',
                  }}
                />
              </button>

              {tafsirOpen && (
                <div className="animate-fade mt-2 rounded-xl border p-3.5" style={{ borderColor: 'var(--line)' }}>
                  <div className="flex gap-1.5">
                    {[
                      { id: 'en', label: 'English · Ibn Kathīr' },
                      { id: 'ar', label: 'العربية · الميسر' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setTafsirLang(option.id)}
                        className="rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors"
                        style={{
                          background: tafsirLang === option.id ? 'var(--accent-soft)' : 'transparent',
                          color: tafsirLang === option.id ? 'var(--accent)' : 'var(--muted)',
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <div
                    ref={tafsirRef}
                    className="mt-2.5 whitespace-pre-line pr-1 text-[13px] leading-relaxed"
                    dir={tafsirLang === 'ar' ? 'rtl' : 'ltr'}
                    style={{
                      color: 'color-mix(in srgb, var(--ink) 80%, var(--muted))',
                      fontFamily:
                        tafsirLang === 'ar'
                          ? 'var(--arabic-font)'
                          : 'Lora, var(--arabic-font), Georgia, serif',
                      fontSize: tafsirLang === 'ar' ? 16 : undefined,
                      lineHeight: tafsirLang === 'ar' ? 2 : undefined,
                    }}
                  >
                    {tafsirLoading && (
                      <span className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                        <Loader2 size={14} className="animate-spin" /> Loading commentary…
                      </span>
                    )}
                    {!tafsirLoading && tafsirError && (
                      <span style={{ color: 'var(--muted)' }}>{tafsirError}</span>
                    )}
                    {!tafsirLoading && !tafsirError && tafsirText[tafsirLang]}
                  </div>
                </div>
              )}

            </>
          )}
        </div>

        {/* Sticky action bar */}
        <div
          className="border-t px-5 pt-3"
          style={{
            borderColor: 'var(--line)',
            paddingBottom: 'calc(0.85rem + env(safe-area-inset-bottom, 0px))',
            background: 'var(--surface)',
          }}
        >
          <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <div
                    className="flex items-stretch overflow-hidden rounded-full"
                    style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
                  >
                    <button
                      type="button"
                      onClick={() => handlePlay()}
                      className="flex items-center gap-2 py-2.5 pl-4 pr-3 text-[13.5px] font-medium"
                    >
                      <Play size={14} fill="currentColor" />
                      Play
                    </button>
                    <span
                      className="my-1.5 w-px"
                      style={{ background: 'color-mix(in srgb, var(--accent-ink) 35%, transparent)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setMenuOpen((v) => !v)}
                      aria-label="Choose playback range"
                      aria-expanded={menuOpen}
                      className="px-2.5"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <div
                        className="animate-rise absolute bottom-full left-0 z-20 mb-2 w-60 overflow-hidden rounded-2xl border p-1 shadow-soft"
                        style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
                      >
                        <MenuItem
                          icon={Play}
                          title="Play this ayah"
                          description="Stops automatically when it ends"
                          onClick={() => handlePlay('single')}
                        />
                        <MenuItem
                          icon={ListMusic}
                          title="Play whole surah"
                          description={`Continues from ayah ${ayah} to the end`}
                          onClick={() => handlePlay('surah')}
                        />
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-full border px-3 py-2.5 text-[13px] font-medium xs:px-3.5"
                  style={{
                    borderColor: 'var(--line)',
                    color: saved ? 'var(--accent)' : 'var(--ink)',
                    background: saved ? 'var(--accent-soft)' : 'transparent',
                  }}
                  aria-pressed={saved}
                  aria-label={saved ? 'Remove bookmark' : 'Save ayah'}
                >
                  {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                  <span className="hidden xs:inline">{saved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-2 rounded-full border px-3 py-2.5 text-[13px] font-medium xs:px-3.5"
                  style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                  aria-label="Copy ayah text"
                >
                  <Copy size={15} />
                  <span className="hidden xs:inline">Copy</span>
                </button>
          </div>

          {isFullSurahAudio && (
            <p
              className="mt-2.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed"
              style={{ color: 'var(--muted)' }}
            >
              <Info size={13} className="mt-[1px] shrink-0" />
              {reciter.name} is published as full-surah audio, so playback starts from the
              beginning of the surah.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function MenuItem({ icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-surface2"
    >
      <Icon size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
      <span>
        <span className="block text-[13px] font-medium" style={{ color: 'var(--ink)' }}>
          {title}
        </span>
        <span className="mt-0.5 block text-[11px]" style={{ color: 'var(--muted)' }}>
          {description}
        </span>
      </span>
    </button>
  )
}
