import { it } from '../../i18n/it'

export interface KillCountBadgeProps {
  kills: number
}

export default function KillCountBadge({ kills }: KillCountBadgeProps) {
  return (
    <div
      className="absolute right-1.5 bottom-1.5 z-30 flex min-w-[54px] flex-col items-center justify-center gap-0 rounded-[35%_65%_42%_58%] border-4 border-comic-ink px-1.5 pb-1 pt-1 shadow-[4px_4px_0_var(--comic-ink),inset_0_-4px_0_rgba(0,0,0,0.28),0_0_0_2px_rgba(255,255,255,0.22)] ring-2 ring-[rgba(40,0,0,0.35)] [background:radial-gradient(circle_at_35%_28%,#ff6b4a_0%,#d62828_52%,#7a0a0a_100%)] max-[720px]:min-w-12 max-[720px]:px-1.5 max-[720px]:pb-1 max-[720px]:pt-0.5 -rotate-[7deg]"
      title={it.killCountTitle(kills)}
    >
      <span className="font-display text-[1.5rem] leading-none text-comic-paper max-[720px]:text-[1.35rem] [text-shadow:2px_2px_0_var(--comic-ink),-1px_-1px_0_var(--comic-ink)]">
        {kills}
      </span>
      <span className="font-display mt-0.5 text-[8px] uppercase tracking-[0.14em] text-[rgba(255,248,240,0.92)] [text-shadow:1px_1px_0_var(--comic-ink)]">
        {it.ccgKillBadgeLabel}
      </span>
    </div>
  )
}
