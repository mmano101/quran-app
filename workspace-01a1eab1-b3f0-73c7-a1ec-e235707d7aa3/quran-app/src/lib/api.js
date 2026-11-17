/* ---------------------------------------------------------------
   Verified Qur'an data layer
   Text  : Al-Quran Cloud API — Uthmani script + Saheeh International
   Tafsir: Al-Mukhtaṣar (ar.muyassar) & Ibn Kathīr (English, via jsDelivr)
   Every response is memoised in memory and (when it fits) localStorage.
--------------------------------------------------------------- */

const API = 'https://api.alquran.cloud/v1'
const TAFSIR_EN = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-tafisr-ibn-kathir'
const CACHE_PREFIX = 'quran.cache.v1:'

const memory = new Map()

const cacheGet = (key) => {
  if (memory.has(key)) return memory.get(key)
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (raw) {
      const value = JSON.parse(raw)
      memory.set(key, value)
      return value
    }
  } catch {
    /* ignore corrupt cache */
  }
  return null
}

const cacheSet = (key, value, { persist = true } = {}) => {
  memory.set(key, value)
  if (!persist) return
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value))
  } catch {
    // Quota reached — drop the persisted copy, the in-memory cache still works.
    try {
      localStorage.removeItem(CACHE_PREFIX + key)
    } catch {
      /* ignore */
    }
  }
}

const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF\u0640\u200E\u200F\uFEFF]/g

export const normalizeArabic = (text = '') =>
  text.replace(DIACRITICS, '').replace(/\s+/g, ' ').trim()

const BASMALA = normalizeArabic('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ')

/** The Uthmani edition prefixes the basmala to ayah 1 of most surahs — the
 *  reader shows it as a decorative header instead, so strip it here. */
const stripBasmala = (text, surahNumber) => {
  const clean = text.replace(/\uFEFF/g, '').trim()
  if (surahNumber === 1 || surahNumber === 9) return clean
  const words = clean.split(/\s+/)
  if (words.length > 4 && normalizeArabic(words.slice(0, 4).join(' ')) === BASMALA) {
    return words.slice(4).join(' ')
  }
  return clean
}

const stripHtml = (text = '') =>
  text
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

/* ------------------------------ Surah index ----------------------------- */

export async function fetchSurahIndex() {
  const cached = cacheGet('index')
  if (cached) return cached
  const res = await fetch(`${API}/surah`)
  if (!res.ok) throw new Error(`Could not load the surah list (${res.status})`)
  const json = await res.json()
  if (json.code !== 200) throw new Error(json.status || 'Unexpected API response')
  const index = json.data.map((s) => ({
    number: s.number,
    name: s.name,
    englishName: s.englishName,
    englishNameTranslation: s.englishNameTranslation,
    revelationType: s.revelationType,
    numberOfAyahs: s.numberOfAyahs,
  }))
  cacheSet('index', index)
  return index
}

/* ------------------------------ Single surah ---------------------------- */

export async function fetchSurah(surahNumber) {
  const key = `surah:${surahNumber}`
  const cached = cacheGet(key)
  if (cached) return cached

  const res = await fetch(
    `${API}/surah/${surahNumber}/editions/quran-uthmani,en.sahih`,
  )
  if (!res.ok) throw new Error(`Could not load this surah (${res.status})`)
  const json = await res.json()
  if (json.code !== 200) throw new Error(json.status || 'Unexpected API response')

  const [ar, en] = json.data
  const ayahs = ar.ayahs.map((ayah, i) => ({
    number: ayah.numberInSurah,
    arabic: stripBasmala(ayah.text, surahNumber),
    english: stripHtml(en.ayahs[i]?.text ?? ''),
    sajda: Boolean(ayah.sajda),
  }))

  const data = {
    meta: {
      number: ar.number,
      name: ar.name,
      englishName: ar.englishName,
      englishNameTranslation: ar.englishNameTranslation,
      revelationType: ar.revelationType,
      numberOfAyahs: ar.numberOfAyahs,
    },
    ayahs,
  }
  cacheSet(key, data)
  return data
}

/* -------------------------------- Tafsir -------------------------------- */

export async function fetchTafsir(surahNumber, ayahNumber, lang = 'en') {
  const key = `tafsir:${lang}:${surahNumber}:${ayahNumber}`
  const cached = cacheGet(key)
  if (cached) return cached

  let text = ''
  if (lang === 'ar') {
    const res = await fetch(`${API}/ayah/${surahNumber}:${ayahNumber}/ar.muyassar`)
    if (!res.ok) throw new Error('Tafsir unavailable right now')
    const json = await res.json()
    text = stripHtml(json?.data?.text || '')
  } else {
    const res = await fetch(`${TAFSIR_EN}/${surahNumber}/${ayahNumber}.json`)
    if (!res.ok) throw new Error('Tafsir unavailable right now')
    const json = await res.json()
    text = stripHtml(json?.text || '')
  }
  if (!text) throw new Error('Tafsir unavailable right now')
  cacheSet(key, text)
  return text
}

/* ------------------------- Prefetch (nice-to-have) ---------------------- */

export function prefetchSurah(surahNumber) {
  fetchSurah(surahNumber).catch(() => {})
}
