import type { Tribute } from '../engine/types'
import { it } from '../i18n/it'
import ArenaPortrait from './arena/ArenaPortrait'

interface RosterSidebarProps {
  allTributes: Tribute[]
  alive: Tribute[]
}

export default function RosterSidebar({ allTributes, alive }: RosterSidebarProps) {
  const aliveSet = new Set(alive)

  return (
    <aside className="roster-sidebar">
      <h3>{it.rosterSidebar}</h3>
      {allTributes.map((tribute, i) => {
        const isDead = !aliveSet.has(tribute)
        return (
          <div key={i} className={`sidebar-tribute ${isDead ? 'dead' : ''}`}>
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
            <span className="sidebar-name">{tribute.raw_name}</span>
            {tribute.kills > 0 && <span className="sidebar-kills">{tribute.kills}</span>}
          </div>
        )
      })}
    </aside>
  )
}
