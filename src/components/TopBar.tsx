import type { GameRenderStateData } from '../engine/types'

interface TopBarProps {
  seasonTitle: string
  renderState: GameRenderStateData | null
  totalTributes: number
  onSettingsClick: () => void
  onAbort: () => void
  showGameControls: boolean
}

export default function TopBar({
  seasonTitle,
  renderState,
  totalTributes,
  onSettingsClick,
  onAbort,
  showGameControls,
}: TopBarProps) {
  const alive = renderState?.tributes_alive.length ?? 0
  const dead = totalTributes - alive

  return (
    <header className="top-bar">
      <div className="top-bar-logo">Hunger Games</div>

      {showGameControls && renderState ? (
        <>
          <div className="top-bar-stats">
            <div className="stat-item">
              <span className="stat-label">Alive</span>
              <span className="stat-value alive">{alive}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Fallen</span>
              <span className="stat-value dead">{dead}</span>
            </div>
          </div>
          <span className="top-bar-title">{seasonTitle}</span>
          <div className="top-bar-actions">
            <button className="btn-icon" onClick={onSettingsClick} title="Settings">
              &#9881;
            </button>
            <button className="btn btn-danger" onClick={onAbort}>
              Abort
            </button>
          </div>
        </>
      ) : (
        <div className="top-bar-actions">
          <button className="btn-icon" onClick={onSettingsClick} title="Settings">
            &#9881;
          </button>
        </div>
      )}
    </header>
  )
}
