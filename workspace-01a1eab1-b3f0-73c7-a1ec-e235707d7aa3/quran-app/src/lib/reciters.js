/* ---------------------------------------------------------------
   The 20 reciters + their verse-by-verse audio sources.

   • Almost every reciter streams from EveryAyah
     (https://everyayah.com/data/<folder>/<SSS><AAA>.mp3)
   • Bandar Baleela has no verse-level CDN release, so his recitation
     streams as a full-surah file (his entry is flagged `surahOnly`).
--------------------------------------------------------------- */

const pad3 = (n) => String(n).padStart(3, '0')

const everyayah = (folder) => (surah, ayah) =>
  `https://everyayah.com/data/${folder}/${pad3(surah)}${pad3(ayah)}.mp3`

const quranicaudioSurah = (folder) => (surah) =>
  `https://download.quranicaudio.com/quran/${folder}/${pad3(surah)}.mp3`

export const RECITERS = [
  { id: 'alafasy', name: 'Mishary Rashid Alafasy', arabic: 'مشاري راشد العفاسي', url: everyayah('Alafasy_128kbps') },
  { id: 'sudais', name: 'Abdul Rahman Al-Sudais', arabic: 'عبد الرحمن السديس', url: everyayah('Abdurrahmaan_As-Sudais_192kbps') },
  { id: 'muaiqly', name: 'Maher Al-Muaiqly', arabic: 'ماهر المعيقلي', url: everyayah('MaherAlMuaiqly128kbps') },
  { id: 'ghamdi', name: 'Saad Al-Ghamdi', arabic: 'سعد الغامدي', url: everyayah('Ghamadi_40kbps') },
  { id: 'dosari', name: 'Yasser Al-Dosari', arabic: 'ياسر الدوسري', url: everyayah('Yasser_Ad-Dussary_128kbps') },
  { id: 'qatami', name: 'Nasser Al-Qatami', arabic: 'ناصر القطامي', url: everyayah('Nasser_Alqatami_128kbps') },
  { id: 'shuraim', name: 'Saud Al-Shuraim', arabic: 'سعود الشريم', url: everyayah('Saood_ash-Shuraym_128kbps') },
  { id: 'husary', name: 'Mahmoud Khalil Al-Husary', arabic: 'محمود خليل الحصري', url: everyayah('Husary_128kbps') },
  { id: 'minshawi', name: 'Mohamed Siddiq El-Minshawi', arabic: 'محمد صديق المنشاوي', url: everyayah('Minshawy_Murattal_128kbps') },
  { id: 'abdulbasit', name: "Abdul Basit 'Abd us-Samad", arabic: 'عبد الباسط عبد الصمد', url: everyayah('Abdul_Basit_Murattal_192kbps') },
  { id: 'basfar', name: 'Abdullah Basfar', arabic: 'عبد الله بصفر', url: everyayah('Abdullah_Basfar_192kbps') },
  { id: 'shatri', name: 'Abu Bakr Al-Shatri', arabic: 'أبو بكر الشاطري', url: everyayah('Abu_Bakr_Ash-Shaatree_128kbps') },
  { id: 'rifai', name: 'Hani Ar-Rifai', arabic: 'هاني الرفاعي', url: everyayah('Hani_Rifai_192kbps') },
  { id: 'jaber', name: 'Ali Jaber', arabic: 'علي جابر', url: everyayah('Ali_Jaber_64kbps') },
  { id: 'abbad', name: 'Fares Abbad', arabic: 'فارس عباد', url: everyayah('Fares_Abbad_64kbps') },
  { id: 'ajmi', name: 'Ahmed Al-Ajmi', arabic: 'أحمد العجمي', url: everyayah('Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net') },
  { id: 'jibreel', name: 'Muhammad Jibreel', arabic: 'محمد جبريل', url: everyayah('Muhammad_Jibreel_128kbps') },
  { id: 'bukhatir', name: 'Salah Bukhatir', arabic: 'صلاح بو خاطر', url: everyayah('Salaah_AbdulRahman_Bukhatir_128kbps') },
  {
    id: 'baleela',
    name: 'Bandar Baleela',
    arabic: 'بندر بليلة',
    surahOnly: true,
    url: quranicaudioSurah('bandar_baleela'),
  },
  { id: 'juhany', name: 'Abdullah Awad Al-Juhany', arabic: 'عبد الله عواد الجهني', url: everyayah('Abdullaah_3awwaad_Al-Juhaynee_128kbps') },
]

export const DEFAULT_RECITER_ID = 'alafasy'

export const getReciter = (id) =>
  RECITERS.find((r) => r.id === id) || RECITERS.find((r) => r.id === DEFAULT_RECITER_ID)

/** Absolute URL of a single ayah (or whole surah for `surahOnly` reciters). */
export function ayahAudioUrl(reciterId, surah, ayah) {
  const reciter = getReciter(reciterId)
  return reciter.surahOnly ? reciter.url(surah) : reciter.url(surah, ayah)
}

/** Ordinal numerals used for ayah medallions / player counters. */
const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
export const toArabicDigits = (value) =>
  String(value).replace(/\d/g, (d) => AR_DIGITS[Number(d)])
