import { motion, useReducedMotion } from 'framer-motion'
import type { Tribute } from '../../engine/types'
import { getInitials } from '../../utils/initials'
import ArenaPortrait from './ArenaPortrait'
import CcgCardArtRays from './CcgCardArtRays'
import FighterRolePill from './FighterRolePill'
import KillCountBadge from './KillCountBadge'

export interface CcgFighterCardProps {
  tribute: Tribute
  variant: 'killer' | 'victim'
  portraitSize: number
  cardWidth?: string
  /** Slide-in direction for versus reveal */
  motionSide: 'left' | 'right'
  animKey: string
}

export default function CcgFighterCard({
  tribute,
  variant,
  portraitSize,
  cardWidth,
  motionSide,
  animKey,
}: CcgFighterCardProps) {
  const reduceMotion = useReducedMotion()
  const isVictim = variant === 'victim'
  /** Off-screen entry; killer from left (−), victim from right (+). */
  const enterX = motionSide === 'left' ? -140 : 140

  return (
    <motion.article
      key={animKey}
      className={`relative flex max-w-full shrink-0 flex-col overflow-hidden rounded-[18px] border-[5px] border-comic-ink pb-1.5 ring-2 ring-black/25 ring-offset-0 ${
          isVictim
            ? 'bg-linear-to-br from-[#f0f7ff] from-0% via-[#d4e8ff] via-35% to-[#a8d4ff] to-100% [box-shadow:9px_9px_0_rgba(10,10,15,0.4),inset_0_2px_0_rgba(255,255,255,0.65),inset_0_-5px_0_rgba(30,90,180,0.14)]'
            : 'bg-linear-to-br from-[#fff8ed] from-0% via-[#ffecd4] via-40% to-[#ffd6a8] to-100% [box-shadow:9px_9px_0_rgba(10,10,15,0.4),inset_0_2px_0_rgba(255,255,255,0.85),inset_0_-5px_0_rgba(255,140,60,0.16)]'
        } `}
      style={{ width: cardWidth ?? 'min(88vw, 220px)' }}
      initial={
        reduceMotion
          ? { opacity: 0 }
          : isVictim
            ? { x: enterX, opacity: 0, rotateZ: 7, scale: 0.9 }
            : { x: enterX, opacity: 0, rotateZ: -7, scale: 0.88 }
      }
      animate={
        reduceMotion
          ? { opacity: 1, x: 0, rotateZ: 0, scale: 1 }
          : isVictim
            ? {
                x: [enterX, 8, -6, 0, 36, -14, 0],
                rotateZ: [7, 2, -2, 0, 15, -8, 0],
                opacity: [0, 1, 1, 1, 1, 1, 1],
                scale: [0.9, 1.02, 1, 1, 0.91, 1.03, 1],
              }
            : {
                x: [enterX, 0, 0, 22, -8, 0],
                rotateZ: [-7, 0, 0, 5, -2, 0],
                opacity: [0, 1, 1, 1, 1, 1],
                scale: [0.88, 1.06, 1, 1.03, 0.99, 1],
              }
      }
      transition={
        reduceMotion
          ? { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
          : isVictim
            ? {
                duration: 1.2,
                delay: 0.06,
                times: [0, 0.14, 0.28, 0.38, 0.48, 0.72, 1],
                ease: [0.22, 1, 0.36, 1],
              }
            : {
                duration: 1.12,
                times: [0, 0.22, 0.36, 0.46, 0.62, 1],
                ease: [0.22, 1, 0.36, 1],
              }
      }
    >
      <div
        className={`flex items-center gap-2.5 rounded-t-[12px] border-b-4 border-comic-ink px-3 py-2 ${
          isVictim
            ? 'bg-linear-to-r from-[#1a3a6e] to-[#2a5aa8]'
            : 'bg-linear-to-r from-[#8b3a1a] to-[#e06b2d]'
        } `}
      >
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-comic-ink bg-comic-paper font-display text-sm text-comic-ink shadow-[3px_3px_0_rgba(0,0,0,0.25)]">
          {getInitials(tribute.raw_name)}
        </span>
        <span
          className={`min-w-0 truncate font-display uppercase tracking-wide text-white text-[clamp(15px,2.2vw,20px)] [text-shadow:2px_2px_0_var(--comic-ink),-1px_-1px_0_var(--comic-ink)] ${
            isVictim ? 'opacity-85 line-through decoration-2' : ''
          } `}
        >
          {tribute.raw_name}
        </span>
      </div>

      <div
        className={`relative mb-1 mt-1.5 ml-2 mr-2 h-[min(26vh,188px)] min-h-[120px] w-auto overflow-hidden rounded-[14px] border-[3px] border-comic-ink bg-[#0a1628] [box-shadow:inset_0_0_0_2px_rgba(126,200,255,0.85),0_2px_0_rgba(255,255,255,0.12)] max-[720px]:h-[min(24vh,168px)]`}
      >
        <CcgCardArtRays variant={variant} />
        {isVictim && !reduceMotion && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-1 rounded-lg [background:radial-gradient(circle_at_50%_38%,rgba(255,240,200,0.55)_0%,rgba(120,0,24,0.35)_40%,transparent_68%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0, 0.95, 0.2, 0.38] }}
            transition={{
              duration: 1.15,
              times: [0, 0.34, 0.4, 0.45, 0.58, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        )}
        <motion.div
          className="absolute inset-0 z-2 h-full w-full"
          animate={
            reduceMotion || !isVictim
              ? undefined
              : {
                  x: [0, 0, 0, -6, 5, -3, 0],
                  y: [0, 0, 0, 4, -3, 2, 0],
                }
          }
          transition={
            reduceMotion || !isVictim
              ? undefined
              : {
                  duration: 1.2,
                  delay: 0.06,
                  times: [0, 0.35, 0.42, 0.48, 0.55, 0.68, 1],
                  ease: [0.22, 1, 0.36, 1],
                }
          }
        >
          <ArenaPortrait
            src={tribute.image_src}
            name={tribute.raw_name}
            isDead={isVictim}
            size={portraitSize}
            square
            embedInCcgArt
            embedTint={variant}
            fightEliminationOverlay={isVictim}
          />
        </motion.div>
        <KillCountBadge kills={tribute.kills} />
      </div>

      <FighterRolePill variant={variant} />
    </motion.article>
  )
}
