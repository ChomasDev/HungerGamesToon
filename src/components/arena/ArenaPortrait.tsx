import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { shouldLoadPortraitImage } from '../../utils/imageUrl'
import { getInitials } from '../../utils/initials'
import ComicEmbedPlaceholder from './ComicEmbedPlaceholder'

export interface ArenaPortraitProps {
  src: string
  name: string
  isDead: boolean
  size?: number
  square?: boolean
  className?: string
  /** Portrait fills CCG trading-card art panel */
  embedInCcgArt?: boolean
  /** Halftone panel when there is no image (CCG embed only) */
  embedTint?: 'killer' | 'victim' | 'trading'
  /** When false, no ✕ overlay even if `isDead` (e.g. death summary / stats). Default: same as `isDead`. */
  eliminatedOverlay?: boolean
  /** CCG duel: time ✕ overlay to the fight “hit” (Framer Motion). */
  fightEliminationOverlay?: boolean
}

/** Resets image error state when `src` changes (keyed by trimmed URL). */
export default function ArenaPortrait(props: ArenaPortraitProps) {
  const k = props.src?.trim() ?? ''
  return <ArenaPortraitInner key={k} {...props} />
}

function ArenaPortraitInner({
  src,
  name,
  isDead,
  size = 56,
  square = false,
  className = '',
  embedInCcgArt = false,
  embedTint = 'killer',
  eliminatedOverlay,
  fightEliminationOverlay = false,
}: ArenaPortraitProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const reduceMotion = useReducedMotion()
  const trimmed = src?.trim() ?? ''
  const loadSrc = shouldLoadPortraitImage(trimmed) ? trimmed : ''
  const showImg = Boolean(loadSrc) && !imgFailed
  const showStrike = isDead && (eliminatedOverlay ?? true)

  if (embedInCcgArt) {
    const frame =
      `relative flex shrink-0 items-center justify-center overflow-hidden rounded-md !h-full !min-h-0 !w-full !max-h-none border-0 !shadow-none !outline-none ` +
      (isDead ? 'opacity-90 grayscale-[0.85] brightness-[0.85] ' : '')

    return (
      <div className={`${frame}${className}`.trim()}>
        {showImg ? (
          <img
            src={loadSrc}
            alt={name}
            className="relative z-[1] block h-full w-full object-cover object-center"
            onError={() => setImgFailed(true)}
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ) : (
          <ComicEmbedPlaceholder name={name} tint={embedTint} />
        )}
        {showStrike &&
          (fightEliminationOverlay && !reduceMotion ? (
            <motion.div
              className="absolute inset-0 z-[2] flex items-center justify-center bg-[rgba(230,57,70,0.36)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0, 1, 1, 1] }}
              transition={{ duration: 1.15, times: [0, 0.32, 0.38, 0.44, 1, 1] }}
            >
              <motion.span
                className="inline-block text-[clamp(2.5rem,18vmin,6rem)] font-black leading-none text-dead [text-shadow:3px_3px_0_var(--comic-ink),0_0_22px_rgba(255,80,100,0.9)]"
                initial={{ scale: 0, rotate: -38 }}
                animate={{
                  scale: [0, 0, 0, 1.5, 1.06, 1],
                  rotate: [0, 0, 0, 11, -4, 0],
                }}
                transition={{
                  duration: 1.15,
                  times: [0, 0.32, 0.38, 0.44, 0.58, 1],
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                aria-hidden
              >
                &#10005;
              </motion.span>
            </motion.div>
          ) : (
            <div
              className="absolute inset-0 z-[2] flex items-center justify-center bg-[rgba(230,57,70,0.35)] text-[clamp(2.5rem,18vmin,6rem)] font-black leading-none text-dead [text-shadow:3px_3px_0_var(--comic-ink)]"
              style={{ animation: 'scaleIn 0.3s ease both' }}
            >
              &#10005;
            </div>
          ))}
      </div>
    )
  }

  const legacy = [
    'arena-portrait',
    square ? 'arena-portrait-square' : '',
    isDead ? 'is-eliminated' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={legacy} style={{ width: size, height: size }}>
      {showImg ? (
        <img
          src={loadSrc}
          alt={name}
          onError={() => setImgFailed(true)}
          decoding="async"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="arena-portrait-initials">{getInitials(name)}</span>
      )}
      {showStrike && <div className="arena-portrait-x">&#10005;</div>}
    </div>
  )
}
