/** Subtle app credit — pinned to the top-left corner, themed with the app. */
export default function Credit() {
  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[45] mt-[5px] flex h-[44px] items-center gap-1.5 pl-3.5 sm:pl-5"
      aria-label="Made by Ali Ihab"
    >
      <span
        className="h-1 w-1 rounded-full"
        style={{ background: 'var(--accent)', opacity: 0.85 }}
        aria-hidden="true"
      />
      <span
        className="text-[9.5px] font-medium uppercase tracking-[0.16em] sm:text-[10px]"
        style={{ color: 'var(--muted)' }}
      >
        Made by Ali Ihab
      </span>
    </div>
  )
}
