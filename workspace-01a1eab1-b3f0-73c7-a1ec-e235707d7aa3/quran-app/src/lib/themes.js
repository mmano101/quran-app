/* ---------------------------------------------------------------
   Colour themes + typography defaults
--------------------------------------------------------------- */

export const THEMES = [
  {
    id: 'sepia',
    name: 'Warm Parchment',
    hint: 'Sepia',
    swatch: '#F4EAD8',
    tokens: {
      bg: '#F4EAD8',
      surface: '#FBF4E6',
      surface2: '#F7EEDA',
      ink: '#3A2E22',
      muted: '#8A7860',
      accent: '#A9763F',
      accentSoft: 'rgba(169,118,63,0.12)',
      line: '#E4D5BC',
      accentInk: '#FFF9EE',
      dark: false,
    },
  },
  {
    id: 'white',
    name: 'Pure White',
    hint: 'Daylight',
    swatch: '#FFFFFF',
    tokens: {
      bg: '#FFFFFF',
      surface: '#F8F8F6',
      surface2: '#F2F2EF',
      ink: '#1B1A18',
      muted: '#78736B',
      accent: '#0E7C66',
      accentSoft: 'rgba(14,124,102,0.10)',
      line: '#E8E6E1',
      accentInk: '#FFFFFF',
      dark: false,
    },
  },
  {
    id: 'sage',
    name: 'Soft Sage',
    hint: 'Calm green',
    swatch: '#EDF2E9',
    tokens: {
      bg: '#EDF2E9',
      surface: '#F7FAF4',
      surface2: '#E6EEDF',
      ink: '#23302A',
      muted: '#6D8074',
      accent: '#4C7A5D',
      accentSoft: 'rgba(76,122,93,0.12)',
      line: '#DCE6DA',
      accentInk: '#FFFFFF',
      dark: false,
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    hint: 'Low light',
    swatch: '#14181A',
    tokens: {
      bg: '#14181A',
      surface: '#1D2325',
      surface2: '#252C2E',
      ink: '#E9E4DA',
      muted: '#9AA39F',
      accent: '#D4AF62',
      accentSoft: 'rgba(212,175,98,0.16)',
      line: '#2C3436',
      accentInk: '#171A1B',
      dark: true,
    },
  },
  {
    id: 'oled',
    name: 'OLED Pitch Black',
    hint: 'True black',
    swatch: '#000000',
    tokens: {
      bg: '#000000',
      surface: '#0B0D0E',
      surface2: '#141819',
      ink: '#EFEFEF',
      muted: '#8E9492',
      accent: '#D4AF62',
      accentSoft: 'rgba(212,175,98,0.14)',
      line: '#1A1D1E',
      accentInk: '#000000',
      dark: true,
    },
  },
]

/* -------------------------- colour helpers ----------------------------- */

const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n))

const hexToRgb = (hex) => {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const int = parseInt(full, 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

const rgbToHex = ({ r, g, b }) =>
  '#' +
  [r, g, b]
    .map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0'))
    .join('')

const luminance = (hex) => {
  const { r, g, b } = hexToRgb(hex)
  const f = (v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

const mix = (hex, target, amount) => {
  const a = hexToRgb(hex)
  const b = hexToRgb(target)
  return rgbToHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  })
}

const rgbToHsl = (hex) => {
  const { r, g, b } = hexToRgb(hex)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
    else if (max === gn) h = ((bn - rn) / d + 2) / 6
    else h = ((rn - gn) / d + 4) / 6
  }
  return { h: h * 360, s, l }
}

const hslToHex = ({ h, s, l }) => {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  const seg = Math.floor(h / 60) % 6
  const table = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][seg]
  const [r, g, b] = table.map((v) => (v + m) * 255)
  return rgbToHex({ r, g, b })
}

/** Build a full token set from an arbitrary custom background colour. */
export function customTokens(bgHex) {
  const lum = luminance(bgHex)
  const dark = lum < 0.4
  const hsl = rgbToHsl(bgHex)
  const isNearGrey = hsl.s < 0.06
  const accentHue = isNearGrey ? 34 : hsl.h
  const accent = hslToHex({
    h: accentHue,
    s: isNearGrey ? 0.42 : clamp(hsl.s + 0.18, 0, 0.62),
    l: dark ? 0.66 : 0.36,
  })
  return {
    bg: bgHex,
    surface: mix(bgHex, dark ? '#FFFFFF' : '#FFFFFF', dark ? 0.07 : 0.55),
    surface2: mix(bgHex, dark ? '#FFFFFF' : '#000000', dark ? 0.12 : 0.05),
    ink: dark ? mix(bgHex, '#FFFFFF', 0.9) : mix(bgHex, '#000000', 0.8),
    muted: dark ? mix(bgHex, '#FFFFFF', 0.55) : mix(bgHex, '#000000', 0.5),
    accent,
    accentSoft: hexToRgba(accent, dark ? 0.18 : 0.12),
    line: mix(bgHex, dark ? '#FFFFFF' : '#000000', dark ? 0.16 : 0.1),
    accentInk: dark ? '#111111' : '#FFFFFF',
    dark,
  }
}

export function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

export function resolveTheme(themeId, customBg) {
  if (themeId === 'custom') {
    const base = customTokens(customBg || '#F4EAD8')
    return { id: 'custom', name: 'Custom', tokens: base }
  }
  return THEMES.find((t) => t.id === themeId) || THEMES[0]
}

/** Subtle 8-point star lattice used as the optional background accent. */
export function patternDataUri(color, alpha = 0.5) {
  const stroke = encodeURIComponent(hexToRgba(color, alpha))
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='148' height='148' viewBox='0 0 148 148'><g fill='none' stroke='${stroke}' stroke-width='1'><path d='M74 8 L86 34 L112 34 L100 60 L126 74 L100 88 L112 114 L86 114 L74 140 L62 114 L36 114 L48 88 L22 74 L48 60 L36 34 L62 34 Z'/><rect x='30' y='30' width='88' height='88' transform='rotate(45 74 74)'/><circle cx='74' cy='74' r='7'/></g></svg>`
  return `url("data:image/svg+xml,${svg}")`
}

/* --------------------------- other defaults ---------------------------- */

export const DEFAULT_SETTINGS = {
  themeId: 'sepia',
  customBg: '#EFE3CB',
  pattern: false,
  displayMode: 'both', // 'ar' | 'en' | 'both'
  arabicSize: 34,
  englishSize: 18,
  arabicFont: 'scheherazade', // 'scheherazade' | 'amiri'
  reciterId: 'alafasy',
  playbackMode: 'surah', // 'single' | 'surah'
  repeatAyah: false,
}
