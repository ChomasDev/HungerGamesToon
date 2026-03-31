export interface CcgCardArtRaysProps {
  variant: 'killer' | 'victim'
}

export default function CcgCardArtRays({ variant }: CcgCardArtRaysProps) {
  const isKiller = variant === 'killer'
  return (
    <div
      className={`pointer-events-none absolute inset-0 mix-blend-screen opacity-60 ${
        isKiller
          ? '[background:repeating-conic-gradient(from_0deg_at_50%_115%,transparent_0deg_9deg,rgba(255,230,150,0.12)_9deg_10deg)]'
          : '[background:repeating-conic-gradient(from_0deg_at_50%_115%,transparent_0deg_9deg,rgba(255,255,255,0.07)_9deg_10deg)]'
      }`}
      aria-hidden
    />
  )
}
