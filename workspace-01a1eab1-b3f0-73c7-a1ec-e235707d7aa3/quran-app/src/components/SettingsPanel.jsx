import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { THEMES } from '../lib/themes'
import { RECITERS, getReciter } from '../lib/reciters'

/* ------------------------------- primitives ------------------------------ */

function Section({ title, description, children }) {
  return (
    <section
      className="animate-fade rounded-2xl border p-4"
      style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}
    >
      <h2 className="text-[13px] font-semibold tracking-wide" style={{ color: 'var(--ink)' }}>
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>
          {description}
        </p>
      )}
      <div className="mt-3.5">{children}</div>
    </section>
  )
}

function Segmented({ options, value, onChange }) {
  return (
    <div
      className="flex gap-1 rounded-full p-1"
      style={{ background: 'var(--surface-2)' }}
      role="group"
    >
      {options.map((option) => {
        const isActive = value === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={isActive}
            className="flex-1 rounded-full px-2 py-2 text-[12.5px] font-medium transition-colors duration-200"
            style={{
              background: isActive ? 'var(--surface)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--muted)',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function Slider({ label, value, min, max, onChange, unit = 'px' }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px]" style={{ color: 'var(--ink)' }}>
          {label}
        </span>
        <span className="tnum text-[11.5px]" style={{ color: 'var(--muted)' }}>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-1"
      />
    </div>
  )
}

function Switch({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 py-1 text-left"
    >
      <span className="min-w-0">
        <span className="block text-[12.5px]" style={{ color: 'var(--ink)' }}>
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
            {description}
          </span>
        )}
      </span>
      <span
        className="relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-300"
        style={{ background: checked ? 'var(--accent)' : 'var(--line)' }}
      >
        <span
          className="absolute top-[3px] h-4 w-4 rounded-full bg-white transition-all duration-300 ease-calm"
          style={{ left: checked ? 19 : 3 }}
        />
      </span>
    </button>
  )
}

/* --------------------------------- panel -------------------------------- */

export default function SettingsPanel() {
  const { settings, update } = useSettings()
  const [recitersOpen, setRecitersOpen] = useState(false)
  const reciter = getReciter(settings.reciterId)

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-12 sm:px-6">
      <header className="animate-fade">
        <h1 className="font-serif text-[22px] tracking-tight" style={{ color: 'var(--ink)' }}>
          Settings
        </h1>
        <p className="mt-1 text-[12px]" style={{ color: 'var(--muted)' }}>
          Everything here is saved on this device only.
        </p>
      </header>

      <div className="mt-5 space-y-3 pb-2">
        {/* Reading mode */}
        <Section title="Text display" description="Choose what appears while you read.">
          <Segmented
            value={settings.displayMode}
            onChange={(displayMode) => update({ displayMode })}
            options={[
              { id: 'ar', label: 'Arabic' },
              { id: 'en', label: 'English' },
              { id: 'both', label: 'Both' },
            ]}
          />
        </Section>

        {/* Typography */}
        <Section title="Typography" description="Adjust the size and script of the text.">
          <div className="space-y-4">
            <Slider
              label="Arabic size"
              value={settings.arabicSize}
              min={24}
              max={56}
              onChange={(arabicSize) => update({ arabicSize })}
            />
            <Slider
              label="English size"
              value={settings.englishSize}
              min={14}
              max={26}
              onChange={(englishSize) => update({ englishSize })}
            />

            <div className="flex gap-1.5">
              {[
                { id: 'scheherazade', label: 'Scheherazade New' },
                { id: 'amiri', label: 'Amiri' },
              ].map((font) => {
                const isActive = settings.arabicFont === font.id
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => update({ arabicFont: font.id })}
                    className="flex-1 rounded-xl border px-2 py-2 text-[11.5px] font-medium transition-colors"
                    style={{
                      borderColor: isActive ? 'var(--accent)' : 'var(--line)',
                      background: isActive ? 'var(--accent-soft)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--muted)',
                    }}
                  >
                    {font.label}
                  </button>
                )
              })}
            </div>

            <div
              className="rounded-xl border px-3 py-3"
              style={{ borderColor: 'var(--line)', background: 'var(--surface-2)' }}
            >
              <p
                dir="rtl"
                className="arabic text-right"
                style={{ fontSize: Math.min(settings.arabicSize, 38), color: 'var(--ink)' }}
              >
                وَرَتِّلِ ٱلْقُرْآنَ تَرْتِيلًا
              </p>
              <p
                className="mt-2 font-serif"
                style={{
                  fontSize: settings.englishSize,
                  lineHeight: 1.6,
                  color: 'color-mix(in srgb, var(--ink) 74%, var(--muted))',
                }}
              >
                “And recite the Qur’an with measured recitation.”
              </p>
            </div>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" description="Background and colour theme.">
          <div className="grid grid-cols-5 gap-2">
            {THEMES.map((theme) => {
              const isActive = settings.themeId === theme.id
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => update({ themeId: theme.id })}
                  aria-pressed={isActive}
                  title={theme.name}
                  className="group flex flex-col items-center gap-1.5"
                >
                  <span
                    className="relative grid h-11 w-11 place-items-center rounded-full transition-transform duration-200 group-active:scale-95"
                    style={{
                      background: theme.swatch,
                      border: `1px solid ${theme.id === 'white' ? '#E0DED8' : 'transparent'}`,
                      boxShadow: isActive ? '0 0 0 2px var(--accent)' : 'inset 0 0 0 1px rgba(0,0,0,.06)',
                    }}
                  >
                    {isActive && (
                      <Check
                        size={15}
                        strokeWidth={3}
                        style={{ color: theme.tokens.dark ? '#F3ECDD' : '#3A2E22' }}
                      />
                    )}
                  </span>
                  <span
                    className="text-center text-[9.5px] leading-tight"
                    style={{ color: isActive ? 'var(--accent)' : 'var(--muted)' }}
                  >
                    {theme.name.replace('Warm Parchment', 'Parchment').replace('OLED Pitch Black', 'OLED')}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={settings.customBg}
                onChange={(e) => update({ customBg: e.target.value, themeId: 'custom' })}
                aria-label="Custom background colour"
                className="h-9 w-9 rounded-full"
              />
              <div>
                <p className="text-[12.5px]" style={{ color: 'var(--ink)' }}>
                  Custom background
                </p>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  {settings.themeId === 'custom' ? settings.customBg.toUpperCase() : 'Tap to pick a colour'}
                </p>
              </div>
            </div>
            {settings.themeId === 'custom' && (
              <span
                className="rounded-full px-2 py-1 text-[10px] uppercase tracking-wider"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                Active
              </span>
            )}
          </div>

          <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--line)' }}>
            <Switch
              checked={settings.pattern}
              onChange={(pattern) => update({ pattern })}
              label="Geometric accent"
              description="A faint Islamic star lattice behind the page."
            />
          </div>
        </Section>

        {/* Reciter */}
        <Section title="Recitation" description="Ayah-by-ayah audio from 20 renowned reciters.">
          <button
            type="button"
            onClick={() => setRecitersOpen((v) => !v)}
            aria-expanded={recitersOpen}
            className="flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
            style={{ borderColor: 'var(--line)', background: 'var(--surface-2)' }}
          >
            <span className="min-w-0 text-left">
              <span className="block truncate text-[12.5px] font-medium" style={{ color: 'var(--ink)' }}>
                {reciter.name}
              </span>
              <span className="mt-0.5 block text-[10.5px]" style={{ color: 'var(--muted)' }}>
                {reciter.surahOnly ? 'Full-surah audio' : 'Ayah-by-ayah'}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="arabic text-[13px]" style={{ color: 'var(--muted)' }}>
                {reciter.arabic}
              </span>
              <ChevronDown
                size={15}
                style={{
                  color: 'var(--muted)',
                  transform: recitersOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform .25s',
                }}
              />
            </span>
          </button>

          {recitersOpen && (
            <ul
              className="animate-fade mt-2 max-h-72 overflow-y-auto rounded-xl border"
              style={{ borderColor: 'var(--line)' }}
            >
              {RECITERS.map((item) => {
                const isActive = item.id === settings.reciterId
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        update({ reciterId: item.id })
                        setRecitersOpen(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-surface2"
                      style={{ background: isActive ? 'var(--accent-soft)' : 'transparent' }}
                    >
                      <span className="min-w-0 flex-1">
                        <span
                          className="block truncate text-[12.5px]"
                          style={{ color: isActive ? 'var(--accent)' : 'var(--ink)' }}
                        >
                          {item.name}
                        </span>
                        {item.surahOnly && (
                          <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                            full-surah audio
                          </span>
                        )}
                      </span>
                      <span className="arabic shrink-0 text-[13px]" style={{ color: 'var(--muted)' }}>
                        {item.arabic}
                      </span>
                      {isActive && <Check size={14} style={{ color: 'var(--accent)' }} />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--line)' }}>
            <p className="mb-2 text-[12.5px]" style={{ color: 'var(--ink)' }}>
              Default playback
            </p>
            <Segmented
              value={settings.playbackMode}
              onChange={(playbackMode) => update({ playbackMode })}
              options={[
                { id: 'single', label: 'One ayah' },
                { id: 'surah', label: 'Whole surah' },
              ]}
            />
            <div className="mt-3">
              <Switch
                checked={settings.repeatAyah}
                onChange={(repeatAyah) => update({ repeatAyah })}
                label="Repeat ayah"
                description="Loop the current ayah until you turn this off."
              />
            </div>
          </div>
        </Section>

        {/* About */}
        <Section title="About the text">
          <ul className="space-y-1.5 text-[11.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>
            <li>
              <span style={{ color: 'var(--ink)' }}>Arabic:</span> Uthmani script — Al-Quran Cloud API.
            </li>
            <li>
              <span style={{ color: 'var(--ink)' }}>Translation:</span> Saheeh International.
            </li>
            <li>
              <span style={{ color: 'var(--ink)' }}>Tafsir:</span> Al-Mukhtaṣar (Arabic) · Ibn Kathīr
              (English).
            </li>
            <li>
              <span style={{ color: 'var(--ink)' }}>Audio:</span> EveryAyah / QuranicAudio.
            </li>
            <li>
              <span style={{ color: 'var(--ink)' }}>Hadith:</span> Sahih al-Bukhari, Sahih Muslim,
              Riyad as-Salihin &amp; 40 Hadith Nawawi — sunnah.com numbering.
            </li>
            <li>
              <span style={{ color: 'var(--ink)' }}>Du‘as:</span> Hisn al-Muslim, the Qur'an, and
              the Sunnah collections (Tirmidhi, Abu Dawud, an-Nasa'i, Ibn Majah).
            </li>
          </ul>
          <p className="mt-3 text-[10.5px]" style={{ color: 'var(--muted)' }}>
            Preferences, bookmarks and the last-read position are stored in your browser.
          </p>
        </Section>
      </div>
    </div>
  )
}
