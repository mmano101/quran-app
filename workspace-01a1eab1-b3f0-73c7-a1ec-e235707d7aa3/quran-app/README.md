# Qur’ān — Read &amp; Listen

A calm, minimal Qur’an reader: Uthmani script, Saheeh International translation, tap-to-reveal
ayah meanings, ayah-by-ayah recitation from 20 renowned reciters — plus a searchable library of
**159 authentic hadiths** and **1,313 du‘as & adhkar**, every card carrying its real reference.

Built with **React + Vite + Tailwind CSS + Lucide icons**. Everything the reader does — theme,
display mode, reciter, font sizes, playback mode, last-read position, bookmarks — is persisted in
`localStorage`, and fetched scripture is cached so re-opening a surah is instant.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
```

No API keys, no environment variables, no backend.

---

## The five tabs (nothing more)

| Tab | What it is |
| --- | --- |
| **Surahs** | Clean list of all 114 surahs (Arabic + English names, meaning, ayah count, Makki/Madani) with a single “Continue reading” card for your last position. Hovering a row prefetches it. |
| **Mushaf** | The distraction-free reading view. Tap any ayah to open its meaning sheet. No toolbars, no search bar, no settings icons. |
| **Hadiths** | *Hadiths & Duas* library — a **Duas ↔ Hadiths** toggle, live search (English or Arabic, diacritic-insensitive) and category chips. |
| **Saved** | Your bookmarked ayahs **and** hadiths/du‘as, newest first, each with copy and remove actions. |
| **Settings** | Every customisation control lives here — and only here. |

A single subtle credit — *Made by Ali Ihab* — sits in the top-left corner, tinted with the active
theme's accent; it is passive and never overlaps controls.

---

## Reading screen behaviour

- **Tap an ayah → bottom sheet** (centred modal on desktop) with:
  - the Arabic ayah and its Saheeh International meaning,
  - an optional **Brief Tafsir** toggle (English · Ibn Kathīr / العربية · الميسّر),
  - a **split Play button**: main button plays using your default mode, the arrow offers
    **Play this ayah** (stops automatically when it ends) or **Play whole surah** (continues from
    that ayah to the end of the surah),
  - **Save** (bookmark) and **Copy** (Arabic + translation + reference).
- **Active ayah highlighting** with a soft accent panel while audio plays, plus smooth
  auto-scroll that follows the recitation. Manual scrolling pauses the auto-follow briefly so the
  page never fights your finger.
- **Minimal player bar** above the navigation pill: seek bar, previous/next ayah, play/pause,
  ayah-repeat toggle, one-ayah/whole-surah dropdown, stop. Lock-screen controls are wired through
  the Media Session API.

---

## Customisation (Settings tab)

- **Text display** — Arabic only · English only · Both.
- **Typography** — Arabic size (24–56 px), English size (14–26 px), and a choice of
  **Scheherazade New** (default) or **Amiri** script, with a live preview.
- **Appearance** — Warm Parchment (sepia), Pure White, Soft Sage, Dark Mode, OLED Pitch Black, plus
  a **custom background colour picker** (foreground/accent colours are derived automatically from
  the picked colour) and an optional faint **Islamic geometric accent** layer.
- **Recitation** — the 20 reciters below, default playback mode, and an ayah-repeat switch.

---

## Hadiths &amp; Du‘as

- **Hadiths — 159 entries**, verbatim from *Sahih al-Bukhari* (28), *Sahih Muslim* (30),
  *Riyad as-Salihin* (59) and the complete *40 Hadith Nawawi* (42). Each card shows the Arabic,
  the English with its narrator, the book and hadith number, the grade (Ṣaḥīḥ / as graded by the
  collectors) and the chapter it comes from.
- **Du‘as — 1,313 entries**, verbatim from *Hisn al-Muslim* (Fortress of the Muslim, 132 chapters),
  the **Qur'an** (115 supplication verses), *Riyad as-Salihin* (92) and the Sunnah collections
  (Tirmidhi, Abu Dawud, an-Nasa'i, Ibn Majah — 848). Each card carries what it is for, the Arabic
  with full tashkeel, the English meaning, the reference (*Qur'an 2:201*, *Sahih Muslim #2723*,
  *Hisn al-Muslim*) and a save/copy pair.
- Categories: Quranic Duas · Morning & Evening · Forgiveness & Repentance · Protection & Refuge ·
  Anxiety & Grief · Family & Children · Health & Illness · Travel · Sleep & Night · Prayer &
  Worship · Knowledge & Guidance · Gratitude & Praise · Provision & Rizq · Food & Daily Life ·
  Hereafter & Death · Sunnah Supplications.
- Nothing is written, paraphrased or "cleaned up" by hand: the JSON is generated once from the
  published collections by `scripts/build-data.py` and shipped in `public/data/` (the UI never
  calls a third-party API for these texts).

## Data &amp; accuracy

| Source | Used for |
| --- | --- |
| [Al-Quran Cloud API](https://alquran.cloud/api) `quran-uthmani` | Uthmani Arabic text (no client-side editing — text is used as delivered) |
| Al-Quran Cloud `en.sahih` | Saheeh International English meaning |
| Al-Quran Cloud `ar.muyassar` + Ibn Kathīr (jsDelivr) | Brief tafsir |
| [EveryAyah](https://everyayah.com) | Verse-by-verse recitation audio (19 of the 20 reciters) |
| [AhmedBaset/hadith-json](https://github.com/AhmedBaset/hadith-json) | Riyad as-Salihin Arabic + English + chapters (sunnah.com scrape) |
| [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api) | Bukhari · Muslim · Nawawi 40 · Tirmidhi · Abu Dawud · an-Nasa'i · Ibn Majah (sunnah.com numbering, grades) |
| [Hisn-Muslim-Json](https://github.com/wafaaelmaandy/Hisn-Muslim-Json) | Hisn al-Muslim / Fortress of the Muslim — 132 chapters of adhkar |
| QuranicAudio | Bandar Baleela — released as full-surah audio only |

The Uthmani edition prefixes the basmala to the first ayah of most surahs; the reader strips it from
the ayah data and renders it as the traditional decorative bismillah above the surah instead
(surah 1 and surah 9 are handled by the text itself).

**Reciters:** Mishary Rashid Alafasy · Abdul Rahman Al-Sudais · Maher Al-Muaiqly · Saad Al-Ghamdi ·
Yasser Al-Dosari · Nasser Al-Qatami · Saud Al-Shuraim · Mahmoud Khalil Al-Husary ·
Mohamed Siddiq El-Minshawi · Abdul Basit ‘Abd us-Samad · Abdullah Basfar · Abu Bakr Al-Shatri ·
Hani Ar-Rifai · Ali Jaber · Fares Abbad · Ahmed Al-Ajmi · Muhammad Jibreel · Salah Bukhatir ·
Bandar Baleela · Abdullah Awad Al-Juhany.

> Bandar Baleela has no verse-level CDN release, so his entry is flagged *full-surah audio*: the
> player and the ayah sheet say so, and single-ayah / repeat / skip controls are disabled for him.
> Audio is streamed from public CDNs, so recitation needs a network connection.

---

## Caching

- `localStorage` “surah index” (~30 KB) → the Surahs tab renders instantly and offline-ish.
- Each fetched surah (Arabic + English) is memoised in memory **and** `localStorage`; the writer
  degrades gracefully if the browser quota is hit.
- Tafsir is cached per ayah; the next ayah’s audio is preloaded for gapless advance.
- Cache namespace: `quran.cache.v1:*` (safe to clear at any time).
- The hadith/du'a JSON is served as static files: the three du'a shards (~0.4 MB + 0.7 MB + 0.7 MB)
  load in parallel and are memoised for the session.
- Bookmark namespaces: `quran.bookmarks.v1` (ayahs) and `quran.bookmarks.extras.v1` (hadiths/du'as).

## Regenerating the hadith & du'a data

```bash
python3 scripts/build-data.py     # writes public/data/*.json, downloads are cached in scripts/.cache
```

---

## Project layout

```
src/
  App.jsx                    tab shell, sheet state, last-read wiring
  index.css                  theme tokens, self-hosted fonts, base styles
  lib/
    api.js                   Al-Quran Cloud / tafsir fetch + cache + basmala handling
    reciters.js              the 20 reciters, audio URL builders, Arabic numerals
    themes.js                colour themes, custom-colour derivation, pattern SVG, defaults
    storage.js               usePersistentState helper
    extras.js                hadith/du'a data loading, categories, search
  context/
    SettingsContext.jsx      preferences + CSS variable theming
    LibraryContext.jsx       bookmarks + last-read position
    PlayerContext.jsx        single <audio> engine: queue, repeat, advance, preload
  hooks/useQuran.js          surah index / surah text hooks
  components/
    BottomNav.jsx            the five-tab pill
    SurahList.jsx            tab 1
    Mushaf.jsx               tab 2 (reading + auto-scroll + highlight)
    ExtrasView.jsx           tab 3 — hadiths & du'as (toggle, search, chips, cards)
    SavedList.jsx            tab 4
    SettingsPanel.jsx        tab 5 (all customisation)
    Credit.jsx               the top-left "Made by Ali Ihab" credit
    AyahSheet.jsx            ayah meaning sheet with tafsir + play/save/copy
    PlayerBar.jsx            mini audio bar
    Ornaments.jsx            medallions, bismillah, divider
    Toast.jsx                tiny confirmation toast
public/fonts/                self-hosted Scheherazade New, Amiri, Lora (woff2)
public/data/                 hadiths.json (159) + duas-0..2.json (1,313) — generated, not hand-edited
scripts/build-data.py        reproducible builder for public/data (cached downloads in scripts/.cache)
```

Fonts are self-hosted (no third-party font requests); Arabic text uses `dir="rtl"`,
`font-feature-settings: liga/calt` and generous line-height for crisp Uthmani rendering.
