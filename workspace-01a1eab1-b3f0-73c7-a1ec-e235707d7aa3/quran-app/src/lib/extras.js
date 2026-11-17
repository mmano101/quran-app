import { normalizeArabic } from './api'

/* ---------------------------------------------------------------
   Hadiths & Du'as dataset access (built by scripts/build-data.py)
   The du'a corpus is shipped as three shards and loaded in parallel;
   both corpora are memoised for the lifetime of the page.
--------------------------------------------------------------- */

export const DUA_CATEGORIES = [
  'All',
  'Quranic Duas',
  'Morning & Evening',
  'Forgiveness & Repentance',
  'Protection & Refuge',
  'Anxiety & Grief',
  'Family & Children',
  'Health & Illness',
  'Travel',
  'Sleep & Night',
  'Prayer & Worship',
  'Knowledge & Guidance',
  'Gratitude & Praise',
  'Provision & Rizq',
  'Food & Daily Life',
  'Hereafter & Death',
  'Sunnah Supplications',
]

export const HADITH_CATEGORIES = [
  'All',
  'Faith & Belief',
  'Worship',
  "Du'a & Dhikr",
  'Character & Manners',
  'Knowledge',
  'Charity & Wealth',
  'Patience & Trials',
  'Family & Community',
  'Repentance',
  'Hereafter',
  'Daily Life',
]

const cache = { duas: null, hadiths: null }
let duasPromise = null
let hadithsPromise = null

const byId = (a, b) => a.id.localeCompare(b.id, 'en', { numeric: true })

export function getDuas() {
  if (cache.duas) return Promise.resolve(cache.duas)
  if (!duasPromise) {
    duasPromise = Promise.all(
      [0, 1, 2].map((i) =>
        fetch(`/data/duas-${i}.json`)
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => []),
      ),
    ).then((shards) => {
      cache.duas = shards.flat().sort(byId)
      return cache.duas
    })
  }
  return duasPromise
}

export function getHadiths() {
  if (cache.hadiths) return Promise.resolve(cache.hadiths)
  if (!hadithsPromise) {
    hadithsPromise = fetch('/data/hadiths.json')
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => {
        cache.hadiths = list
        return list
      })
  }
  return hadithsPromise
}

/** Diacritic-insensitive, token-based search across Arabic, English and references.
 *  Every whitespace-separated token must match somewhere in the entry. */
export function filterExtras(items, { query, category }) {
  const raw = query.trim()
  const tokens = raw ? raw.toLowerCase().split(/\s+/).filter(Boolean) : []
  const arTokens = raw ? normalizeArabic(raw).split(/\s+/).filter((t) => t.length > 1) : []

  return items.filter((item) => {
    if (category !== 'All' && item.cat !== category) return false
    if (!tokens.length) return true

    const hay = `${item.en} ${item.ref} ${item.src || ''} ${item.purpose || ''} ${item.det || ''} ${
      item.cat || ''
    }`.toLowerCase()
    const hayAr = normalizeArabic(`${item.arb} ${item.purpose || ''}`)

    return tokens.every((token) => {
      if (hay.includes(token)) return true
      const ar = normalizeArabic(token)
      return ar.length > 1 && hayAr.includes(ar)
    }) && arTokens.every((token) => hayAr.includes(token) || hay.includes(token))
  })
}
