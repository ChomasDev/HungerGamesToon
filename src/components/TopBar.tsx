import type { GameRenderStateData } from '../engine/types'
import { it } from '../i18n/it'

interface TopBarProps {
  seasonTitle: string
  renderState: GameRenderStateData | null
  totalTributes: number
  /** When set (e.g. spoiler-safe roster during phase playback), overrides `tributes_alive.length` for stats. */
  displayAliveCount?: number
  onSettingsClick: () => void
  onAbort: () => void
  showGameControls: boolean
}

export default function TopBar({
  seasonTitle,
  renderState,
  totalTributes,
  displayAliveCount,
  onSettingsClick,
  onAbort,
  showGameControls,
}: TopBarProps) {
  const alive = displayAliveCount ?? renderState?.tributes_alive.length ?? 0
  const dead = totalTributes - alive

  return (
    <header className="top-bar">
      <div className="top-bar-logo">
        <div className="top-bar-logo-icon-wrapper">
          <span className="top-bar-logo-icon" />
        </div>
        {it.topBarLogo}
      </div>

      {showGameControls && renderState ? (
        <>
          <div className="top-bar-stats">
            <div className="stat-item">
              <span className="stat-label">{it.statAlive}</span>
              <span className="stat-value alive">{alive}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{it.statFallen}</span>
              <span className="stat-value dead">{dead}</span>
            </div>
          </div>
          <span className="top-bar-title">{seasonTitle}</span>
          <div className="top-bar-actions">
            <div className="top-bar-btn-wrapper">
              <button className="btn-icon" onClick={onSettingsClick} title={it.settingsTitle}>
                &#9881;
              </button>
            </div>
            <div className="top-bar-btn-wrapper">
              <button className="btn btn-danger" onClick={onAbort}>
                {it.abort}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="top-bar-actions">
          <button className="btn-icon" onClick={onSettingsClick} title={it.settingsTitle}>
            &#9881;
          </button>
        </div>
      )}
    </header>
  )
}
