import { motion, useReducedMotion } from 'framer-motion'
import type { Tribute } from '../../engine/types'
import { it } from '../../i18n/it'
import ArenaPortrait from './ArenaPortrait'
import CcgCardArtRays from './CcgCardArtRays'
import FighterRolePill from './FighterRolePill'

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
      className="ccg-fighter-card relative flex max-w-full shrink-0 flex-col"
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
      {/* Outer frame — matches `TributeTradingCardFace` deck chrome */}
      <div className="rounded-[18px] border-[3px] border-comic-ink bg-gradient-to-br from-[#fff8e7] via-[#f0d36a] to-[#c9a94a] p-1 shadow-[6px_6px_0_rgba(10,10,15,0.4)]">
        <div
          className={`flex flex-col overflow-hidden rounded-[14px] border-[3px] border-comic-ink bg-gradient-to-b from-[#f7ecda] to-[#e8dcc8] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${
            isVictim ? 'opacity-90 saturate-[0.68]' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b-[3px] border-comic-ink bg-gradient-to-r from-[#4a6fb5] via-[#3d5a9e] to-[#2e4785] px-2 py-1.5">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[7px] uppercase leading-none tracking-[0.2em] text-white/80">
                {it.tradingCardKind}
              </p>
              <h2
                className={`mt-0.5 truncate font-display uppercase leading-tight tracking-wide text-white [text-shadow:2px_2px_0_var(--comic-ink)] text-[clamp(0.7rem,2.4vw,0.92rem)] ${
                  isVictim ? 'opacity-85 line-through decoration-2' : ''
                }`}
              >
                {tribute.raw_name}
              </h2>
            </div>
            <div className="shrink-0 rounded-md border-[2px] border-comic-ink bg-comic-paper px-1.5 py-0.5 text-center font-display text-[10px] font-bold leading-none text-comic-ink shadow-[2px_2px_0_var(--comic-ink)]">
              {it.tradingCardStars(tribute.kills)}
            </div>
          </div>

          <div className="relative p-1.5">
            <div
              className={`relative aspect-[5/4] w-full overflow-hidden rounded-xl border-[3px] border-comic-ink bg-gradient-to-b from-[#b8cfe8] via-[#e8eef5] to-[#f0f4fa] shadow-[inset_0_3px_10px_rgba(10,10,15,0.12),0_2px_0_rgba(255,255,255,0.5)] ${
                isVictim ? 'grayscale-[0.4]' : ''
              }`}
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
            </div>
          </div>

          <div className="flex justify-center px-1 pb-1.5 pt-0.5">
            <FighterRolePill variant={variant} />
          </div>
        </div>
      </div>
    </motion.article>
  )
}
