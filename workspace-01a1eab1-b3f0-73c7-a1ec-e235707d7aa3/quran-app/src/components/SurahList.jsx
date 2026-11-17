import { RotateCcw } from 'lucide-react'
import { useSurahIndex } from '../hooks/useQuran'
import { useLibrary } from '../context/LibraryContext'
import { StarNumber } from './Ornaments'
import { prefetchSurah } from '../lib/api'
import { useState } from 'react'

export default function SurahList({ onOpenSurah }) {
  const [refreshKey, setRefreshKey] = useState(0)
  const { index, loading, error } = useSurahIndex(refreshKey)
  const { lastRead } = useLibrary()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-12 sm:px-6">
      <header className="animate-fade text-center">
        <p className="arabic text-[26px]" style={{ color: 'var(--accent)' }}>
          ٱلْقُرْآن ٱلْكَرِيم
        </p>
        <h1
          className="mt-1 font-serif text-[22px] tracking-tight"
          style={{ color: 'var(--ink)' }}
        >
          The Noble Qur’an
        </h1>
        <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: 'var(--muted)' }}>
          Uthmani script · Saheeh International
        </p>
      </header>

      {lastRead && (
        <button
          type="button"
          onClick={() => onOpenSurah(lastRead.surah, lastRead.ayah)}
          className="mt-6 flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-transform duration-300 ease-calm active:scale-[0.99]"
          style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
        >
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 5h9a3 3 0 0 1 3 3v11H7a3 3 0 0 1-3-3V5Z" />
              <path d="M20 4v15" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>
              Continue reading
            </span>
            <span className="mt-0.5 block truncate text-[14px] font-medium" style={{ color: 'var(--ink)' }}>
              {lastRead.surahName}
              <span style={{ color: 'var(--muted)' }}> · {lastRead.surah}:{lastRead.ayah}</span>
            </span>
          </span>
          <span className="arabic shrink-0 text-[15px]" style={{ color: 'var(--muted)' }}>
            {lastRead.surahArabicName}
          </span>
        </button>
      )}

      {loading && (
        <div className="mt-6 space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton h-[62px] w-full rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-16 text-center">
          <p className="text-[14px]" style={{ color: 'var(--ink)' }}>
            The surah list could not be loaded
          </p>
          <p className="mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            <RotateCcw size={14} /> Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <ul className="mt-5 pb-2">
          {index.map((surah) => (
            <li key={surah.number}>
              <button
                type="button"
                onClick={() => onOpenSurah(surah.number, null)}
                onMouseEnter={() => prefetchSurah(surah.number)}
                onFocus={() => prefetchSurah(surah.number)}
                className="group flex w-full items-center gap-3.5 rounded-2xl px-2.5 py-2.5 text-left transition-colors duration-300 ease-calm hover:bg-surface"
              >
                <StarNumber value={surah.number} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span
                      className="truncate text-[14.5px] font-medium tracking-tight"
                      style={{ color: 'var(--ink)' }}
                    >
                      {surah.englishName}
                    </span>
                    {surah.revelationType === 'Medinan' && (
                      <span
                        className="shrink-0 rounded-full px-1.5 py-[1px] text-[9px] uppercase tracking-wider"
                        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                      >
                        Madani
                      </span>
                    )}
                  </span>
                  <span
                    className="mt-0.5 block truncate text-[11.5px]"
                    style={{ color: 'var(--muted)' }}
                  >
                    {surah.englishNameTranslation} · {surah.numberOfAyahs} ayahs
                  </span>
                </span>
                <span className="arabic shrink-0 text-[19px]" style={{ color: 'var(--ink)' }}>
                  {surah.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
