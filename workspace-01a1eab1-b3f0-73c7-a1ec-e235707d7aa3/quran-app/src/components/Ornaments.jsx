import { toArabicDigits } from '../lib/reciters'

/** Geometric medallion used for surah numbers in lists. */
export function StarNumber({ value, size = 38 }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="absolute inset-0 rounded-full border"
        style={{ borderColor: 'var(--line)' }}
      />
      <span
        className="absolute inset-[4px] rounded-[3px] border"
        style={{ borderColor: 'var(--accent-soft)', transform: 'rotate(45deg)' }}
      />
      <span className="tnum relative text-[12.5px] font-medium" style={{ color: 'var(--accent)' }}>
        {value}
      </span>
    </span>
  )
}

/** Traditional end-of-ayah marker, rendered inline inside the Arabic text. */
export function AyahBadge({ number }) {
  return (
    <span
      className="arabic mx-[0.30em] inline-grid place-items-center rounded-full border align-middle"
      style={{
        width: '1.62em',
        height: '1.62em',
        fontSize: '0.42em',
        borderColor: 'var(--accent)',
        color: 'var(--accent)',
        transform: 'translateY(-0.06em)',
        lineHeight: 1,
      }}
    >
      {toArabicDigits(number)}
    </span>
  )
}

/** Thin divider with a central diamond — used sparingly. */
export function Ornament({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-16 sm:w-24" style={{ background: 'var(--line)' }} />
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 0 10 5 5 10 0 5Z" fill="var(--accent)" opacity="0.55" />
      </svg>
      <span className="h-px w-16 sm:w-24" style={{ background: 'var(--line)' }} />
    </div>
  )
}

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'

export function Bismillah({ size = 26, mode = 'arabic' }) {
  if (mode === 'en') {
    return (
      <p
        className="select-none text-center font-serif italic"
        style={{
          fontSize: Math.max(13, Math.round(size * 0.6)),
          color: 'var(--muted)',
          lineHeight: 1.7,
        }}
      >
        In the name of Allah, the Entirely Merciful, the Especially Merciful.
      </p>
    )
  }
  return (
    <p
      className="arabic select-none text-center"
      style={{ fontSize: size, color: 'var(--accent)', lineHeight: 1.9 }}
    >
      {BISMILLAH}
    </p>
  )
}
