import { useCallback, useEffect, useMemo, useState } from 'react'
import BottomNav from './components/BottomNav'
import SurahList from './components/SurahList'
import Mushaf from './components/Mushaf'
import SavedList from './components/SavedList'
import SettingsPanel from './components/SettingsPanel'
import PlayerBar from './components/PlayerBar'
import AyahSheet from './components/AyahSheet'
import ExtrasView from './components/ExtrasView'
import Credit from './components/Credit'
import { useLibrary } from './context/LibraryContext'
import { usePlayer } from './context/PlayerContext'
import { useSurahIndex } from './hooks/useQuran'

export default function App() {
  const { lastRead, setLastRead } = useLibrary()
  const { current } = usePlayer()
  const { index } = useSurahIndex()

  const [tab, setTab] = useState(() => (lastRead ? 'mushaf' : 'surahs'))
  const [surahNumber, setSurahNumber] = useState(() => lastRead?.surah ?? 1)
  const [restoreAyah, setRestoreAyah] = useState(null)
  const [sheet, setSheet] = useState(null)

  const surahMeta = useMemo(
    () => index.find((s) => s.number === surahNumber) || null,
    [index, surahNumber],
  )

  const openSurah = useCallback(
    (number, ayah = null) => {
      const meta = index.find((s) => s.number === number)
      setSurahNumber(number)
      setRestoreAyah(ayah)
      setTab('mushaf')
      setLastRead({
        surah: number,
        ayah: ayah ?? 1,
        surahName: meta?.englishName ?? lastRead?.surahName ?? `Surah ${number}`,
        surahArabicName: meta?.name ?? lastRead?.surahArabicName ?? '',
      })
    },
    [index, lastRead?.surahArabicName, lastRead?.surahName, setLastRead],
  )

  const openAyah = useCallback(
    (surah, ayah) => {
      const meta = index.find((s) => s.number === surah)
      setSheet({ surah, ayah })
      setLastRead({
        surah,
        ayah,
        surahName: meta?.englishName ?? `Surah ${surah}`,
        surahArabicName: meta?.name ?? '',
      })
    },
    [index, setLastRead],
  )

  const closeSheet = useCallback(() => setSheet(null), [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tab, surahNumber])

  const initialAyah =
    restoreAyah ?? (lastRead && lastRead.surah === surahNumber ? lastRead.ayah : null)

  const bottomSpace = current ? 178 : 104

  return (
    <div className="relative min-h-screen">
      <div id="pattern-layer" aria-hidden="true" />

      <main
        className="relative z-10"
        style={{ paddingBottom: `calc(${bottomSpace}px + env(safe-area-inset-bottom, 0px))` }}
      >
        {tab === 'surahs' && <SurahList onOpenSurah={openSurah} />}

        {tab === 'mushaf' && (
          <Mushaf
            surahNumber={surahNumber}
            initialAyah={initialAyah}
            onOpenAyah={(ayah) => openAyah(surahNumber, ayah)}
            onBack={() => setTab('surahs')}
            onGoToSurah={(number) => openSurah(number, null)}
            surahLabel={surahMeta?.englishName}
          />
        )}

        {tab === 'extras' && <ExtrasView />}

        {tab === 'saved' && (
          <SavedList
            onOpenAyah={(surah, ayah) => setSheet({ surah, ayah })}
            onBrowse={() => setTab('surahs')}
          />
        )}

        {tab === 'settings' && <SettingsPanel />}
      </main>

      <Credit />
      <PlayerBar />
      <BottomNav active={tab} onChange={setTab} />

      {sheet && (
        <AyahSheet
          key={`${sheet.surah}:${sheet.ayah}`}
          surah={sheet.surah}
          ayah={sheet.ayah}
          onClose={closeSheet}
        />
      )}
    </div>
  )
}
