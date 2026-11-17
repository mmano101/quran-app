import { Bookmark, Copy, Play, ScrollText, Trash2 } from 'lucide-react'
import { useLibrary } from '../context/LibraryContext'
import { usePlayer } from '../context/PlayerContext'
import { useToast } from './Toast'

const clamp = (lines) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
})

export default function SavedList({ onOpenAyah, onBrowse }) {
  const { bookmarks, removeBookmark, extras, removeExtra } = useLibrary()
  const { playAyah } = usePlayer()
  const notify = useToast()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-12 sm:px-6">
      <header className="animate-fade">
        <h1 className="font-serif text-[22px] tracking-tight" style={{ color: 'var(--ink)' }}>
          Saved
        </h1>
        <p className="mt-1 text-[12px]" style={{ color: 'var(--muted)' }}>
          {bookmarks.length + extras.length === 0
            ? 'Your bookmarked ayahs, hadiths & duas will appear here'
            : (() => {
                const parts = []
                if (bookmarks.length)
                  parts.push(`${bookmarks.length} ayah${bookmarks.length > 1 ? 's' : ''}`)
                const duas = extras.filter((item) => item.type === 'dua').length
                const hadiths = extras.length - duas
                if (hadiths) parts.push(`${hadiths} hadith${hadiths > 1 ? 's' : ''}`)
                if (duas) parts.push(`${duas} dua${duas > 1 ? 's' : ''}`)
                return parts.join(' · ') + ' bookmarked'
              })()}
        </p>
      </header>

      {bookmarks.length === 0 && extras.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <span
            className="grid h-16 w-16 place-items-center rounded-full"
            style={{ background: 'var(--surface)', color: 'var(--accent)' }}
          >
            <Bookmark size={24} />
          </span>
          <p className="mt-4 font-serif text-[16px]" style={{ color: 'var(--ink)' }}>
            Nothing saved yet
          </p>
          <p className="mt-1.5 max-w-[16rem] text-[12.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>
            Open any ayah while reading and tap <span style={{ color: 'var(--accent)' }}>Save</span> to
            keep it here.
          </p>
          <button
            type="button"
            onClick={onBrowse}
            className="mt-5 rounded-full px-4 py-2 text-[13px] font-medium"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            Browse surahs
          </button>
        </div>
      ) : (
        <ul className="mt-5 space-y-2.5 pb-2">
          {bookmarks.map((item) => (
            <li
              key={`${item.surah}:${item.ayah}`}
              className="animate-fade overflow-hidden rounded-2xl border"
              style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
            >
              <div className="flex items-center justify-between gap-2 px-4 pt-3">
                <button
                  type="button"
                  onClick={() => onOpenAyah(item.surah, item.ayah)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="flex items-baseline gap-2">
                    <span className="truncate text-[12.5px] font-medium" style={{ color: 'var(--ink)' }}>
                      {item.surahName || `Surah ${item.surah}`}
                    </span>
                    <span className="shrink-0 text-[11px]" style={{ color: 'var(--muted)' }}>
                      {item.surah}:{item.ayah}
                    </span>
                  </span>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Play this ayah"
                    onClick={() =>
                      playAyah({
                        surah: item.surah,
                        ayah: item.ayah,
                        total: item.ayah,
                        surahName: item.surahName,
                        surahArabicName: item.surahArabicName,
                      })
                    }
                    className="grid h-8 w-8 place-items-center rounded-full"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                  >
                    <Play size={13} fill="currentColor" />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove bookmark"
                    onClick={() => {
                      removeBookmark(item.surah, item.ayah)
                      notify('Removed from Saved')
                    }}
                    className="grid h-8 w-8 place-items-center rounded-full"
                    style={{ color: 'var(--muted)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenAyah(item.surah, item.ayah)}
                className="block w-full px-4 pb-3.5 pt-1.5 text-left"
              >
                <span
                  dir="rtl"
                  className="arabic mt-1 block text-right"
                  style={{ fontSize: 22, lineHeight: 1.95, color: 'var(--ink)', ...clamp(2) }}
                >
                  {item.arabic}
                </span>
                <span
                  className="mt-1.5 block font-serif"
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    color: 'color-mix(in srgb, var(--ink) 70%, var(--muted))',
                    ...clamp(2),
                  }}
                >
                  {item.english}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {bookmarks.length > 0 && extras.length > 0 && (
        <h2
          className="mt-7 text-[11px] font-medium uppercase tracking-[0.16em]"
          style={{ color: 'var(--muted)' }}
        >
          Hadiths &amp; Duas
        </h2>
      )}

      {extras.length > 0 && (
        <ul className={bookmarks.length ? 'mt-2.5 space-y-2.5 pb-2' : 'mt-5 space-y-2.5 pb-2'}>
          {extras.map((item) => (
            <li
              key={item.id}
              className="animate-fade overflow-hidden rounded-2xl border p-4"
              style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
            >
              <div className="flex items-start gap-2">
                <span
                  className="flex min-w-0 items-center gap-1.5 text-[10.5px] font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  <ScrollText size={11} />
                  <span className="truncate">{item.purpose || item.category}</span>
                </span>
                <div className="ml-auto flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Copy"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          `${item.arabic}\n\n${item.english}\n\n— ${item.ref}`,
                        )
                        notify('Copied')
                      } catch {
                        notify('Copy is not available in this browser')
                      }
                    }}
                    className="grid h-8 w-8 place-items-center rounded-full"
                    style={{ color: 'var(--muted)' }}
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove from Saved"
                    onClick={() => {
                      removeExtra(item.id)
                      notify('Removed from Saved')
                    }}
                    className="grid h-8 w-8 place-items-center rounded-full"
                    style={{ color: 'var(--muted)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <span
                dir="rtl"
                className="arabic mt-2 block text-right"
                style={{ fontSize: 21, lineHeight: 1.95, color: 'var(--ink)', ...clamp(2) }}
              >
                {item.arabic}
              </span>
              <span
                className="mt-1.5 block font-serif"
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: 'color-mix(in srgb, var(--ink) 70%, var(--muted))',
                  ...clamp(2),
                }}
              >
                {item.english}
              </span>
              <span className="mt-2 block text-[10.5px]" style={{ color: 'var(--muted)' }}>
                {item.ref}
                {item.grade ? ` · ${item.grade}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
