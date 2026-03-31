import { it } from '../../i18n/it'
import { getInitials } from '../../utils/initials'

export type ComicEmbedTint = 'killer' | 'victim' | 'trading'

export interface ComicEmbedPlaceholderProps {
  name: string
  tint: ComicEmbedTint
}

export default function ComicEmbedPlaceholder({ name, tint }: ComicEmbedPlaceholderProps) {
  if (tint === 'trading') {
    return (
      <div
        className="relative flex h-full min-h-[120px] w-full flex-col items-center justify-center overflow-hidden rounded-md"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4dce8] via-[#e8e0f4] to-[#c5dde8]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.9) 0%, transparent 55%), radial-gradient(circle at 80% 90%, rgba(147,112,219,0.25) 0%, transparent 40%), radial-gradient(circle at 10% 80%, rgba(56,189,248,0.2) 0%, transparent 35%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 1.5px)',
            backgroundSize: '8px 8px',
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-3 px-5 text-center">
          <span className="font-display leading-none tracking-wide text-comic-ink [font-size:clamp(2.25rem,12vmin,5rem)] [text-shadow:2px_2px_0_rgba(255,255,255,0.8),-1px_-1px_0_rgba(100,80,140,0.35)]">
            {getInitials(name)}
          </span>
          <span className="-rotate-2 border-[3px] border-comic-ink bg-gradient-to-b from-white to-[#e8e4f0] px-3 py-1 font-display text-[9px] uppercase tracking-[0.18em] text-comic-ink shadow-[3px_3px_0_var(--comic-ink)]">
            {it.comicPortraitEmpty}
          </span>
        </div>
        <span className="pointer-events-none absolute left-2 top-2 h-5 w-5 border-l-[3px] border-t-[3px] border-white/90 opacity-95" />
        <span className="pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b-[3px] border-r-[3px] border-white/90 opacity-95" />
      </div>
    )
  }

  const warm = tint === 'killer'
  return (
    <div
      className="relative flex h-full min-h-[120px] w-full flex-col items-center justify-center overflow-hidden rounded-md"
      aria-hidden
    >
      <div
        className={`absolute inset-0 bg-gradient-to-b ${warm ? 'from-[#3d2818] via-[#5c3d28] to-[#1f120c]' : 'from-[#0d1b2e] via-[#1b3352] to-[#070f18]'}`}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light"
        style={{
          backgroundImage: warm
            ? 'radial-gradient(circle at 18% 22%, rgba(255,200,120,0.55) 0%, transparent 42%), radial-gradient(circle at 82% 78%, rgba(255,120,60,0.35) 0%, transparent 38%)'
            : 'radial-gradient(circle at 20% 25%, rgba(120,200,255,0.45) 0%, transparent 45%), radial-gradient(circle at 78% 72%, rgba(80,140,255,0.3) 0%, transparent 40%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.42]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${warm ? 'rgba(255,235,200,0.55)' : 'rgba(190,225,255,0.5)'} 1px, transparent 1.5px)`,
          backgroundSize: '9px 9px',
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-3 px-5 text-center">
        <span
          className={`font-display leading-none tracking-wide text-comic-paper [font-size:clamp(2.25rem,12vmin,5rem)] [text-shadow:4px_4px_0_var(--comic-ink),-1px_-1px_0_var(--comic-ink),0_0_24px_rgba(0,0,0,0.35)]`}
        >
          {getInitials(name)}
        </span>
        <span className="-rotate-2 border-[3px] border-comic-ink bg-gradient-to-b from-accent-secondary to-[#ffb703] px-3 py-1 font-display text-[9px] uppercase tracking-[0.18em] text-comic-ink shadow-[3px_3px_0_var(--comic-ink)]">
          {it.comicPortraitEmpty}
        </span>
      </div>
      <span className="pointer-events-none absolute left-2 top-2 h-5 w-5 border-l-[3px] border-t-[3px] border-accent-secondary opacity-90" />
      <span className="pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b-[3px] border-r-[3px] border-accent-secondary opacity-90" />
    </div>
  )
}
