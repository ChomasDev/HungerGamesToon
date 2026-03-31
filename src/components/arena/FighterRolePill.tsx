import { it } from '../../i18n/it'

export type FighterRolePillVariant = 'killer' | 'victim'

export interface FighterRolePillProps {
  variant: FighterRolePillVariant
}

export default function FighterRolePill({ variant }: FighterRolePillProps) {
  const isVictim = variant === 'victim'
  return (
    <span
      className={`mx-2.5 mb-1.5 mt-0.5 inline-block -skew-x-[10deg] self-center rounded-[10px] border-[3px] border-comic-ink px-3 py-1 font-display text-[10px] uppercase tracking-[0.14em] shadow-[4px_4px_0_var(--comic-ink)] ${
        isVictim
          ? 'bg-[#2a0a12] text-[#ff8a9a] ring-2 ring-[rgba(255,100,120,0.35)]'
          : 'bg-[#ffe566] text-comic-ink ring-2 ring-[rgba(255,255,255,0.45)]'
      }`}
    >
      <span className="inline-block skew-x-[10deg]">{isVictim ? it.eliminated : it.killer}</span>
    </span>
  )
}
