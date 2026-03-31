import { motion, useReducedMotion } from 'framer-motion'

export default function VersusBadge() {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className="relative z-[2] flex h-[clamp(56px,9vmin,118px)] w-[clamp(56px,9vmin,118px)] shrink-0 flex-col items-center justify-center [filter:drop-shadow(0_8px_0_rgba(10,10,15,0.22))]"
      aria-label="VS"
      initial={
        reduceMotion ? { opacity: 0 } : { scale: 0.28, opacity: 0, rotate: -14 }
      }
      animate={
        reduceMotion
          ? { opacity: 1, scale: 1, rotate: 0 }
          : {
              scale: [0.28, 1.38, 0.82, 1.12, 1, 1, 1.18, 1],
              rotate: [-14, 10, -6, 4, -2, 0, 0, 0],
              opacity: [0, 1, 1, 1, 1, 1, 1, 1],
            }
      }
      transition={
        reduceMotion
          ? { duration: 0.25 }
          : {
              delay: 0.16,
              duration: 1.05,
              times: [0, 0.28, 0.42, 0.55, 0.68, 0.74, 0.88, 1],
              ease: [0.34, 1.56, 0.36, 1],
            }
      }
    >
      <div
        className="absolute left-1/2 top-1/2 z-0 h-[142%] w-[142%] -translate-x-1/2 -translate-y-1/2 [filter:drop-shadow(-3px_-3px_0_var(--comic-ink))_drop-shadow(3px_-3px_0_var(--comic-ink))_drop-shadow(3px_3px_0_var(--comic-ink))_drop-shadow(-3px_3px_0_var(--comic-ink))_drop-shadow(6px_6px_0_rgba(10,10,15,0.3))]"
        aria-hidden
      >
        <div
          className="h-full w-full [clip-path:polygon(10%_0%,90%_0%,100%_32%,92%_68%,50%_100%,8%_68%,0%_32%)] [background:radial-gradient(circle_at_38%_28%,rgba(255,255,255,0.65)_0%,transparent_38%),radial-gradient(circle_at_70%_75%,rgba(255,230,100,0.25)_0%,transparent_45%),linear-gradient(158deg,#7ec8ff_0%,#3d8ef5_38%,#1e5cb8_72%,#0f3470_100%)]"
        />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[155%] w-[155%] -translate-x-1/2 -translate-y-1/2 [clip-path:polygon(8%_0%,92%_0%,100%_30%,94%_72%,50%_100%,6%_72%,0%_30%)] [background:linear-gradient(160deg,transparent_40%,rgba(255,217,61,0.35)_50%,transparent_60%)]"
        aria-hidden
      />
      <span className="relative z-[1] font-display text-[clamp(2rem,6.5vw,3.25rem)] leading-none text-[#fffefb] [letter-spacing:0.02em] [text-shadow:4px_4px_0_var(--comic-ink),-2px_-2px_0_var(--comic-ink),0_0_18px_rgba(255,230,120,0.55),2px_6px_0_rgba(10,10,15,0.35)]">
        VS
      </span>
    </motion.div>
  )
}
