import { useEffect, useState, type CSSProperties } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { FormattedMessage, Tribute } from '../../engine/types'
import { it } from '../../i18n/it'
import ArenaPortrait from './ArenaPortrait'
import FormattedEventMessage from './FormattedEventMessage'
import VersusBadge from './VersusBadge'

export type TradingCardSize = 'full' | 'deck'

function useViewportInnerWidth(): number {
  const [w, setW] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  )
  useEffect(() => {
    const onResize = () => setW(window.innerWidth)
    onResize()
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return w
}

/** Counteracts `visualViewport` pinch-zoom so trading-card layout stays closer to "1×" CSS sizing. */
function useInverseVisualViewportZoomStyle(): CSSProperties {
  const [zoom, setZoom] = useState(() => {
    if (typeof window === 'undefined') return 1
    const s = window.visualViewport?.scale
    return s != null && s > 0 ? 1 / s : 1
  })
  useEffect(() => {
    const vv = window.visualViewport
    const update = () => {
      const s = vv?.scale
      setZoom(s != null && s > 0 ? 1 / s : 1)
    }
    update()
    if (!vv) return
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])
  return Math.abs(zoom - 1) > 0.001 ? { zoom } : {}
}

export interface TributeTradingCardFaceProps {
  tribute: Tribute
  isDead: boolean
  /** Full: single scene. Deck: smaller card in a hand fan / side-by-side duel. */
  size?: TradingCardSize
  /** When set, shows the yellow "move" panel. Omit for deck faces (shared narrative below). */
  message?: FormattedMessage
  className?: string
  /** Timed ✕ overlay for trading-style duel victim. */
  fightEliminationOverlay?: boolean
}

/**
 * Reusable Pokémon-style card chrome.
 *
 * Design principles:
 * - One visual language across all sizes (solo / deck / versus) — only padding,
 *   border and font sizes scale; structure and proportions are identical.
 * - A single art aspect ratio (5/4 landscape) at every size so the card keeps a
 *   natural trading-card silhouette — never elongated, never hollow.
 * - Narrative block (when present) lives *inside* the card; shared narrative
 *   (<TradingCardSharedNarrative/>) is used when multiple cards share a scene.
 */
export function TributeTradingCardFace({
  tribute,
  isDead,
  size = 'full',
  message,
  className = '',
  fightEliminationOverlay = false,
}: TributeTradingCardFaceProps) {
  const deck = size === 'deck'
  const portraitPx = deck ? 260 : 360

  return (
    <div
      className={`tribute-trading-card-face w-full ${
        deck ? 'max-w-full' : 'mx-auto max-w-[min(88vw,280px)]'
      } ${className}`.trim()}
    >
      <div
        className={`rounded-[18px] border-[3px] border-comic-ink bg-gradient-to-br from-[#fff8e7] via-[#f0d36a] to-[#c9a94a] shadow-[6px_6px_0_rgba(10,10,15,0.4)] ${
          deck ? 'p-1' : 'p-1.5'
        }`}
      >
        <div
          className={`overflow-hidden rounded-[14px] border-[3px] border-comic-ink bg-gradient-to-b from-[#f7ecda] to-[#e8dcc8] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] ${
            isDead ? 'opacity-90 saturate-[0.65]' : ''
          }`}
        >
          <div
            className={`flex items-center justify-between gap-2 border-b-[3px] border-comic-ink bg-gradient-to-r from-[#4a6fb5] via-[#3d5a9e] to-[#2e4785] ${
              deck ? 'px-2 py-1.5' : 'px-2.5 py-2'
            }`}
          >
            <div className="min-w-0 flex-1">
              <p
                className={`font-display uppercase leading-none tracking-[0.2em] text-white/80 ${
                  deck ? 'text-[7px]' : 'text-[9px]'
                }`}
              >
                {it.tradingCardKind}
              </p>
              <h2
                className={`mt-0.5 truncate font-display uppercase leading-tight tracking-wide text-white [text-shadow:2px_2px_0_var(--comic-ink)] ${
                  deck
                    ? 'text-[clamp(0.72rem,2.4vw,0.95rem)]'
                    : 'text-[clamp(0.95rem,3vw,1.15rem)]'
                }`}
              >
                {tribute.raw_name}
              </h2>
            </div>
            <div
              className={`shrink-0 rounded-md border-[2px] border-comic-ink bg-comic-paper text-center font-display font-bold leading-none text-comic-ink shadow-[2px_2px_0_var(--comic-ink)] ${
                deck ? 'px-1.5 py-0.5 text-[10px]' : 'px-1.5 py-1 text-[12px]'
              }`}
            >
              {it.tradingCardStars(tribute.kills)}
            </div>
          </div>

          <div className={deck ? 'p-1.5' : 'p-2'}>
            <div
              className={`relative aspect-[5/4] w-full overflow-hidden rounded-xl border-[3px] border-comic-ink bg-gradient-to-b from-[#b8cfe8] via-[#e8eef5] to-[#f0f4fa] shadow-[inset_0_3px_10px_rgba(10,10,15,0.12),0_2px_0_rgba(255,255,255,0.5)] ${
                isDead ? 'grayscale-[0.4]' : ''
              }`}
            >
              <ArenaPortrait
                src={tribute.image_src}
                name={tribute.raw_name}
                isDead={isDead}
                size={portraitPx}
                square
                embedInCcgArt
                embedTint="trading"
                eliminatedOverlay={isDead}
                fightEliminationOverlay={fightEliminationOverlay}
              />
            </div>
          </div>

          {message && (
            <div className="px-2 pb-2 pt-0.5">
              <div className="trading-card-narrative rounded-lg border-[3px] border-comic-ink bg-gradient-to-b from-[#fef9c3] via-[#fef08a] to-[#fde047] px-2.5 py-2 shadow-[inset_0_2px_0_rgba(255,255,255,0.55),3px_3px_0_rgba(10,10,15,0.12)]">
                <div className="mb-1 inline-block rounded border-[2px] border-comic-ink bg-comic-paper px-1.5 py-0.5 font-display text-[8px] uppercase tracking-[0.15em] text-comic-ink">
                  {it.ccgPower}
                </div>
                <FormattedEventMessage
                  message={message}
                  large={false}
                  className="trading-card-narrative-text !text-[clamp(0.82rem,2.4vw,0.98rem)] !font-semibold !italic !leading-snug !tracking-wide !text-[#1e1a14] ![font-family:var(--font-body)] ![text-transform:none]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export interface TributeTradingCardProps {
  tribute: Tribute
  isDead: boolean
  message: FormattedMessage
}

/** Single fullscreen scene: one card with entrance motion and narrative on-card. */
export default function TributeTradingCard({ tribute, isDead, message }: TributeTradingCardProps) {
  const reduceMotion = useReducedMotion()
  const inverseZoom = useInverseVisualViewportZoomStyle()

  return (
    <motion.div
      className="flex flex-col items-center px-2"
      style={inverseZoom}
      initial={reduceMotion ? undefined : { opacity: 0, y: 28, rotateZ: -2 }}
      animate={{ opacity: 1, y: 0, rotateZ: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <TributeTradingCardFace tribute={tribute} isDead={isDead} size="full" message={message} />
    </motion.div>
  )
}

export function TradingCardSharedNarrative({ message }: { message: FormattedMessage }) {
  return (
    <div className="trading-card-narrative-wrapper relative z-[24] mx-auto mt-2 w-full max-w-[min(92vw,36rem)] px-2">
      <div className="trading-card-narrative rounded-lg border-[3px] border-comic-ink bg-gradient-to-b from-[#fef9c3] via-[#fef08a] to-[#fde047] px-3 py-2 shadow-[inset_0_2px_0_rgba(255,255,255,0.55),3px_3px_0_rgba(10,10,15,0.12)]">
        <div className="mb-1 inline-block rounded border-[2px] border-comic-ink bg-comic-paper px-1.5 py-0.5 font-display text-[8px] uppercase tracking-[0.15em] text-comic-ink">
          {it.ccgPower}
        </div>
        <FormattedEventMessage
          message={message}
          large={false}
          className="trading-card-narrative-text !text-[clamp(0.78rem,2.2vw,0.95rem)] !font-semibold !italic !leading-snug !tracking-normal !text-[#1e1a14] ![font-family:var(--font-body)] ![text-transform:none]"
        />
      </div>
    </div>
  )
}

export interface TributeTradingCardDeckProps {
  tributes: Tribute[]
  isDeadAtIndex: (i: number) => boolean
  message: FormattedMessage
}

/**
 * Fan of trading cards (playing-hand style): rightmost card stacks on top.
 * Pivot at bottom-center; rotations spread from negative (left) to positive (right).
 */
export function TributeTradingCardDeck({ tributes, isDeadAtIndex, message }: TributeTradingCardDeckProps) {
  const reduceMotion = useReducedMotion()
  const inverseZoom = useInverseVisualViewportZoomStyle()
  const vw = useViewportInnerWidth()
  const n = tributes.length

  /** Max fan angle — gentle for pairs, wider for larger hands. */
  const maxRot = n <= 1 ? 0 : Math.min(10, 3 + (n - 1) * 2.2)

  /** Card width scales with viewport but clamps for big screens and readability. */
  const MAX_DECK_CARD_PX = 208
  const MIN_DECK_CARD_PX = 96
  const vwFrac = n >= 4 ? 0.13 : n === 3 ? 0.155 : n === 2 ? 0.17 : 0.2
  const deckCardWidth = Math.round(
    Math.min(MAX_DECK_CARD_PX, Math.max(MIN_DECK_CARD_PX, vw * vwFrac)),
  )

  /** Horizontal distance between card pivots; scaled so the fan stays visible on narrow viewports. */
  const layoutScale = Math.min(1, Math.max(0.4, (vw - 40) / 640))
  const spreadBase =
    n <= 1 ? 0 : Math.min(deckCardWidth * 1.1, deckCardWidth * 0.55 + (n - 1) * 42)
  const spreadX = spreadBase * layoutScale

  /** With aspect-[5/4] art + header + padding the card is ≈ 1.35× as tall as wide. */
  const approxCardHeight = Math.round(deckCardWidth * 1.35 + 40)
  const deckMinHeight = Math.min(360, Math.max(170, approxCardHeight + 12))

  return (
    <div className="tribute-trading-card-deck flex w-full flex-col items-center">
      <div
        className="relative z-[1] mx-auto w-full max-w-[min(100%,40rem)] px-2 sm:px-4"
        style={{ minHeight: deckMinHeight, ...inverseZoom }}
      >
        {tributes.map((tribute, i) => {
          const angle = n === 1 ? 0 : -maxRot + (maxRot * 2 * i) / (n - 1)
          const xOffset = n === 1 ? 0 : (i - (n - 1) / 2) * spreadX
          return (
            <motion.div
              key={`${tribute.raw_name}-${i}`}
              className="absolute bottom-0 left-1/2 max-w-full -translate-x-1/2"
              style={{
                transformOrigin: '50% 100%',
                zIndex: i + 1,
                width: deckCardWidth,
              }}
              initial={
                reduceMotion
                  ? undefined
                  : { opacity: 0, y: 32, rotate: angle * 0.5, x: xOffset * 0.3 }
              }
              animate={{ opacity: 1, y: 0, rotate: angle, x: xOffset }}
              transition={{
                duration: 0.5,
                delay: i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <TributeTradingCardFace tribute={tribute} isDead={isDeadAtIndex(i)} size="deck" />
            </motion.div>
          )
        })}
      </div>
      <TradingCardSharedNarrative message={message} />
    </div>
  )
}

export interface TributeTradingVersusFightProps {
  killer: Tribute
  victim: Tribute
  message: FormattedMessage
  /** Remount animations when the duel changes */
  animKey: string
}

/**
 * Fullscreen 1v1: trading-card chrome side-by-side with VS badge, plus duel
 * motion (dash-in, lunge / stagger / recoil, timed ✕).
 * Both cards use the exact same face component & size as the deck, so solo /
 * deck / versus always read as the same visual system.
 */
export function TributeTradingVersusFight({ killer, victim, message, animKey }: TributeTradingVersusFightProps) {
  const reduceMotion = useReducedMotion()
  const inverseZoom = useInverseVisualViewportZoomStyle()

  return (
    <div className="tribute-trading-versus flex w-full flex-col items-center px-1">
      <div
        className="mx-auto flex w-full max-w-[min(100%,52rem)] flex-nowrap items-center justify-center gap-[clamp(8px,2.4vmin,22px)] overflow-x-auto py-3 [-webkit-overflow-scrolling:touch]"
        style={inverseZoom}
      >
        <motion.div
          key={`${animKey}-killer`}
          className="w-[min(40vw,220px)] shrink-0"
          style={{ transformOrigin: '50% 65%' }}
          initial={reduceMotion ? { opacity: 0 } : { x: -120, y: 28, opacity: 0, rotateZ: -8, scale: 0.86 }}
          animate={
            reduceMotion
              ? { opacity: 1, x: 0, y: 0, rotateZ: 0, scale: 1 }
              : {
                  x: [-120, 0, 0, 36, -12, 0],
                  y: [28, 0, 0, -6, 2, 0],
                  rotateZ: [-8, 0, 0, 6, -3, 0],
                  opacity: [0, 1, 1, 1, 1, 1],
                  scale: [0.86, 1.05, 1, 1.07, 0.98, 1],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
              : {
                  duration: 1.1,
                  times: [0, 0.2, 0.34, 0.44, 0.6, 1],
                  ease: [0.22, 1, 0.36, 1],
                }
          }
        >
          <TributeTradingCardFace tribute={killer} isDead={false} size="deck" />
        </motion.div>

        <motion.div
          className="shrink-0 scale-[0.9] max-[420px]:scale-[0.8]"
          animate={
            reduceMotion ? undefined : { rotate: [0, 0, 0, -12, 9, 0], x: [0, 0, 0, -5, 4, 0] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 1.08, times: [0, 0.32, 0.4, 0.46, 0.58, 1], ease: [0.22, 1, 0.36, 1] }
          }
        >
          <VersusBadge />
        </motion.div>

        <motion.div
          key={`${animKey}-victim`}
          className="relative z-2 w-[min(40vw,220px)] shrink-0"
          style={{ transformOrigin: '50% 65%' }}
          initial={reduceMotion ? { opacity: 0 } : { x: 120, y: 28, opacity: 0, rotateZ: 8, scale: 0.88 }}
          animate={
            reduceMotion
              ? { opacity: 1, x: 0, y: 0, rotateZ: 0, scale: 1 }
              : {
                  x: [120, 14, -10, 0, 42, -18, 0],
                  y: [28, 12, 4, 0, 10, -4, 0],
                  rotateZ: [8, 3, -3, 0, 18, -9, 0],
                  opacity: [0, 1, 1, 1, 1, 1, 1],
                  scale: [0.88, 1.04, 1, 1, 0.9, 1.04, 1],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
              : {
                  duration: 1.18,
                  delay: 0.06,
                  times: [0, 0.14, 0.26, 0.36, 0.47, 0.72, 1],
                  ease: [0.22, 1, 0.36, 1],
                }
          }
        >
          <TributeTradingCardFace tribute={victim} isDead size="deck" fightEliminationOverlay />
        </motion.div>
      </div>
      {reduceMotion ? (
        <TradingCardSharedNarrative message={message} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <TradingCardSharedNarrative message={message} />
        </motion.div>
      )}
    </div>
  )
}
