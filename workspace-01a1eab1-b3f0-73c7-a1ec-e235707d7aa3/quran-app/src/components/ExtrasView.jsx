import { Bookmark, BookmarkCheck, Copy, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useLibrary } from '../context/LibraryContext'
import { useToast } from './Toast'
import {
  DUA_CATEGORIES,
  HADITH_CATEGORIES,
  filterExtras,
  getDuas,
  getHadiths,
} from '../lib/extras'

const PAGE = 20

/* ------------------------------- card ---------------------------------- */

function ExtraCard({ item, type }) {
  const { settings } = useSettings()
  const { isExtraSaved, toggleExtra } = useLibrary()
  const notify = useToast()
  const [expanded, setExpanded] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)
  const arRef = useRef(null)
  const enRef = useRef(null)

  const saved = isExtraSaved(item.id)
  const showArabic = settings.displayMode !== 'en'
  const showEnglish = settings.displayMode !== 'ar'
  // only offer "Read full text" when the clamped text actually overflows
  useEffect(() => {
    if (expanded) return undefined
    const check = () => {
      const els = [arRef.current, enRef.current].filter(Boolean)
      setHasOverflow(els.some((el) => el.scrollHeight - el.clientHeight > 2))
    }
    check()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null
    ;[arRef.current, enRef.current].forEach((el) => el && ro?.observe(el))
    window.addEventListener('resize', check)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', check)
    }
  }, [expanded, settings.arabicSize, settings.englishSize, settings.displayMode])

  const clamp = (lines) =>
    expanded
      ? {}
      : {
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }

  const handleSave = () => {
    toggleExtra({
      id: item.id,
      type,
      purpose: item.purpose,
      category: item.cat,
      arabic: item.arb,
      english: item.en,
      ref: item.ref,
      src: item.src,
      grade: item.grade || '',
    })
    notify(saved ? 'Removed from Saved' : 'Saved to bookmarks')
  }

  const handleCopy = async () => {
    const text = `${item.arb}\n\n${item.en}\n\n— ${item.ref}${item.grade ? ` (${item.grade})` : ''}`
    try {
      await navigator.clipboard.writeText(text)
      notify('Copied Arabic & translation')
    } catch {
      notify('Copy is not available in this browser')
    }
  }

  return (
    <article
      className="animate-fade rounded-2xl border p-4"
      style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
    >
      <div className="flex items-start gap-2">
        <span
          className="max-w-[62%] truncate rounded-full px-2 py-[3px] text-[10.5px] font-medium leading-snug"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          title={item.purpose || item.cat}
        >
          {item.purpose || item.cat}
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={handleSave}
            aria-label={saved ? 'Remove bookmark' : 'Save'}
            aria-pressed={saved}
            className="grid h-8 w-8 place-items-center rounded-full"
            style={{ color: saved ? 'var(--accent)' : 'var(--muted)' }}
          >
            {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy"
            className="grid h-8 w-8 place-items-center rounded-full"
            style={{ color: 'var(--muted)' }}
          >
            <Copy size={14} />
          </button>
        </div>
      </div>

      {showArabic && (
        <p
          ref={arRef}
          dir="rtl"
          className="arabic mt-3"
          style={{
            fontSize: Math.min(Math.max(Math.round(settings.arabicSize * 0.66), 20), 25),
            lineHeight: 1.95,
            color: 'var(--ink)',
            ...clamp(expanded ? 0 : 4),
          }}
        >
          {item.arb}
        </p>
      )}

      {showEnglish && (
        <p
          ref={enRef}
          className="mt-2 font-serif"
          style={{
            fontSize: Math.max(settings.englishSize - 3, 12.5),
            lineHeight: 1.6,
            color: 'color-mix(in srgb, var(--ink) 74%, var(--muted))',
            ...clamp(expanded ? 0 : 4),
          }}
        >
          {item.en}
        </p>
      )}

      {hasOverflow && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-[11.5px] font-medium"
          style={{ color: 'var(--accent)' }}
        >
          {expanded ? 'Show less' : 'Read full text'}
        </button>
      )}

      <div
        className="mt-3 border-t pt-2.5 text-[10.5px]"
        style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
      >
        <div className="flex items-center gap-2">
          <span className="truncate" style={{ color: 'var(--ink)', opacity: 0.75 }}>
            {item.ref}
          </span>
          {item.grade && (
            <span
              className="ml-auto shrink-0 rounded-full px-1.5 py-[1px]"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              {item.grade}
            </span>
          )}
        </div>
        {(() => {
          const note = item.sec || item.det
          if (!note || note === item.purpose || item.ref.includes(note)) return null
          return (
            <p className="mt-1 truncate opacity-80" title={note}>
              {note}
            </p>
          )
        })()}
      </div>
    </article>
  )
}

/* ------------------------------- view ---------------------------------- */

export default function ExtrasView() {
  const [kind, setKind] = useState('duas') // 'duas' | 'hadiths'
  const [duas, setDuas] = useState([])
  const [hadiths, setHadiths] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [limit, setLimit] = useState(PAGE)
  const sentinel = useRef(null)
  const chipRow = useRef(null)

  useEffect(() => {
    let alive = true
    Promise.all([getDuas(), getHadiths()])
      .then(([d, h]) => {
        if (!alive) return
        setDuas(d)
        setHadiths(h)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const source = kind === 'duas' ? duas : hadiths
  const categories = kind === 'duas' ? DUA_CATEGORIES : HADITH_CATEGORIES

  const results = useMemo(
    () => filterExtras(source, { query, category }),
    [source, query, category],
  )

  // reset paging whenever the result set changes
  useEffect(() => {
    setLimit(PAGE)
  }, [kind, query, category])

  // infinite scroll
  useEffect(() => {
    const node = sentinel.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setLimit((n) => (n < results.length ? n + PAGE : n))
      },
      { rootMargin: '600px' },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [results.length])

  const switchKind = (next) => {
    setKind(next)
    setCategory('All')
    setQuery('')
    chipRow.current?.scrollTo({ left: 0 })
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-12 sm:px-6">
      <header className="animate-fade">
        <h1 className="font-serif text-[22px] tracking-tight" style={{ color: 'var(--ink)' }}>
          Hadiths &amp; Duas
        </h1>
        <p className="mt-1 text-[12px]" style={{ color: 'var(--muted)' }}>
          {loading
            ? 'Loading authentic texts…'
            : `${duas.length.toLocaleString()} duas & adhkar · ${hadiths.length} hadiths — verbatim from the sources`}
        </p>
      </header>

      {/* Duas / Hadiths toggle */}
      <div className="mt-4 flex gap-1 rounded-full p-1" style={{ background: 'var(--surface-2)' }}>
        {[
          { id: 'duas', label: 'Duas & Adhkar' },
          { id: 'hadiths', label: 'Hadiths' },
        ].map((option) => {
          const active = kind === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => switchKind(option.id)}
              aria-pressed={active}
              className="flex-1 rounded-full py-2 text-[12.5px] font-medium transition-colors"
              style={{
                background: active ? 'var(--surface)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--muted)',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
              }}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div
        className="mt-3 flex items-center gap-2 rounded-full border px-3.5 py-2.5"
        style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
      >
        <Search size={15} style={{ color: 'var(--muted)' }} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={kind === 'duas' ? 'Search duas in English or Arabic…' : 'Search hadiths…'}
          aria-label="Search"
          className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-70"
          style={{ color: 'var(--ink)' }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="grid h-6 w-6 place-items-center rounded-full"
            style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Category chips */}
      <div
        ref={chipRow}
        className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6"
      >
        {categories.map((cat) => {
          const active = category === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              aria-pressed={active}
              className="shrink-0 rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors"
              style={{
                borderColor: active ? 'var(--accent)' : 'var(--line)',
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? 'var(--accent-ink)' : 'var(--muted)',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Results */}
      {loading ? (
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-serif text-[16px]" style={{ color: 'var(--ink)' }}>
            Nothing found
          </p>
          <p className="mt-1.5 text-[12.5px]" style={{ color: 'var(--muted)' }}>
            Try another word or pick a different category.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setCategory('All')
            }}
            className="mt-4 rounded-full px-4 py-2 text-[12.5px] font-medium"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <p className="mt-3 text-[11px]" style={{ color: 'var(--muted)' }}>
            {results.length.toLocaleString()} {kind === 'duas' ? 'duas' : 'hadiths'}
            {category !== 'All' ? ` in ${category}` : ''}
          </p>
          <ul className="mt-2 space-y-2.5 pb-2">
            {results.slice(0, limit).map((item) => (
              <li key={item.id}>
                <ExtraCard item={item} type={kind === 'duas' ? 'dua' : 'hadith'} />
              </li>
            ))}
          </ul>
          {limit < results.length && (
            <div ref={sentinel} className="py-6 text-center">
              <span className="text-[11.5px]" style={{ color: 'var(--muted)' }}>
                Loading more…
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
