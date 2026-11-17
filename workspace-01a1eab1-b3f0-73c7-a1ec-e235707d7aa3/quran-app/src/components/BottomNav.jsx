import { BookOpen, Bookmark, LayoutList, ScrollText, Settings as SettingsIcon } from 'lucide-react'

const TABS = [
  { id: 'surahs', label: 'Surahs', Icon: LayoutList },
  { id: 'mushaf', label: 'Mushaf', Icon: BookOpen },
  { id: 'extras', label: 'Hadiths', Icon: ScrollText },
  { id: 'saved', label: 'Saved', Icon: Bookmark },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 px-3 pt-2"
      style={{ paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom, 0px))' }}
      aria-label="Main navigation"
    >
      <div
        className="mx-auto flex max-w-md items-center gap-1 rounded-full border p-1.5 shadow-pill backdrop-blur-xl"
        style={{
          background: 'color-mix(in srgb, var(--surface) 82%, transparent)',
          borderColor: 'var(--line)',
        }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex min-h-[46px] flex-1 flex-col items-center justify-center gap-[3px] rounded-full px-0.5 py-1.5 transition-colors duration-300 ease-calm"
              style={{
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium tracking-tight xs:text-[10.5px]">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
