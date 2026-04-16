import { useEffect } from 'react'
import type { Tribute } from '../engine/types'
import { it } from '../i18n/it'
import ArenaPortrait from './arena/ArenaPortrait'

export type RosterSidebarVariant = 'full' | 'rail' | 'drawer'

interface RosterSidebarProps {
  allTributes: Tribute[]
  alive: Tribute[]
  /** Kill credits from same-phase scenes not yet reached (matches engine: +fatalities.length per resolved killer). */
  killCountSubtrahend?: Map<Tribute, number>
  variant?: RosterSidebarVariant
  isOpen?: boolean
  onClose?: () => void
}

export default function RosterSidebar({
  allTributes,
  alive,
  killCountSubtrahend,
  variant = 'full',
  isOpen = true,
  onClose,
}: RosterSidebarProps) {
  const aliveSet = new Set(alive)
  const aliveCount = aliveSet.size
  const isDrawer = variant === 'drawer'
  const isRail = variant === 'rail'

  useEffect(() => {
    if (!isDrawer || !isOpen || !onClose) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose!()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isDrawer, isOpen, onClose])

  if (isDrawer && !isOpen) return null

  const listItems = allTributes.map((tribute, i) => {
    const isDead = !aliveSet.has(tribute)
    const sub = killCountSubtrahend?.get(tribute) ?? 0
    const displayKills = Math.max(0, tribute.kills - sub)
    return (
      <div
        key={i}
        className={`sidebar-tribute ${isDead ? 'dead' : ''}`}
        title={isRail ? tribute.raw_name : undefined}
      >
        <div className="sidebar-avatar">
          <ArenaPortrait
            src={tribute.image_src}
            name={tribute.raw_name}
            isDead={isDead}
            eliminatedOverlay={false}
            size={32}
            className="!h-full !w-full !min-h-0 !min-w-0 !rounded-full !border-0 !shadow-none"
          />
        </div>
        {!isRail && <span className="sidebar-name">{tribute.raw_name}</span>}
        {!isRail && displayKills > 0 && (
          <span className="sidebar-kills">{displayKills}</span>
        )}
        {isRail && displayKills > 0 && (
          <span className="sidebar-rail-kills" aria-label={`${displayKills} kills`}>
            {displayKills}
          </span>
        )}
      </div>
    )
  })

  const header = !isRail && (
    <div className="sidebar-header">
      <span className="hud-panel__label sidebar-header-label">{it.rosterSidebar}</span>
      <span className="sidebar-alive-chip" aria-label={it.statAlive}>
        {it.rosterAliveCount(aliveCount, allTributes.length)}
      </span>
      {isDrawer && onClose && (
        <button
          type="button"
          className="sidebar-drawer-close"
          onClick={onClose}
          aria-label={it.sidebarClose}
        >
          ×
        </button>
      )}
    </div>
  )

  const body = (
    <aside
      className={`roster-sidebar roster-sidebar--${variant} hud-panel`}
      aria-label={it.rosterSidebar}
      data-variant={variant}
    >
      {header}
      <div className="sidebar-list hud-panel__body">{listItems}</div>
    </aside>
  )

  if (isDrawer) {
    return (
      <div className="roster-drawer-root" role="dialog" aria-modal="true">
        <div className="roster-drawer-overlay" onClick={onClose} aria-hidden />
        {body}
      </div>
    )
  }

  return body
}
