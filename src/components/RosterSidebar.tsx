import type { Tribute } from '../engine/types'
import { it } from '../i18n/it'

interface RosterSidebarProps {
  allTributes: Tribute[]
  alive: Tribute[]
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
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
              {tribute.image_src ? (
                <img src={tribute.image_src} alt={tribute.raw_name} />
              ) : (
                getInitials(tribute.raw_name)
              )}
            </div>
            <span className="sidebar-name">{tribute.raw_name}</span>
            {tribute.kills > 0 && <span className="sidebar-kills">{tribute.kills}</span>}
          </div>
        )
      })}
    </aside>
  )
}
