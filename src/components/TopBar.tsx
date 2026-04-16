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
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
  /** Optional phase title + counter rendered next to the season title (ROUND_EVENTS). */
  phaseTitle?: string
  phaseCounterLabel?: string
}

export default function TopBar({
  seasonTitle,
  renderState,
  totalTributes,
  displayAliveCount,
  onSettingsClick,
  onAbort,
  showGameControls,
  sidebarOpen,
  onToggleSidebar,
  phaseTitle,
  phaseCounterLabel,
}: TopBarProps) {
  const alive = displayAliveCount ?? renderState?.tributes_alive.length ?? 0
  const dead = totalTributes - alive
  const showToggle = showGameControls && !!onToggleSidebar

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        {showToggle && (
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? it.sidebarToggleHide : it.sidebarToggleShow}
            aria-pressed={!!sidebarOpen}
            title={sidebarOpen ? it.sidebarToggleHide : it.sidebarToggleShow}
          >
            <span className="sidebar-toggle-bars" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
        )}
        <div className="top-bar-logo">
          <div className="top-bar-logo-icon-wrapper">
            <span className="top-bar-logo-icon" />
          </div>
          {it.topBarLogo}
        </div>
      </div>

      {showGameControls && renderState ? (
        <>
          <div className="hud-panel hud-panel--status top-bar-status">
            <span className="hud-panel__label">{it.hudPanelStatus}</span>
            <div className="hud-panel__body top-bar-stats">
              <div className="stat-item">
                <span className="stat-label">{it.statAlive}</span>
                <span className="stat-value alive">{alive}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{it.statFallen}</span>
                <span className="stat-value dead">{dead}</span>
              </div>
            </div>
          </div>
          <div className="top-bar-title-group">
            <span className="top-bar-title">{seasonTitle}</span>
            {phaseTitle && (
              <span className="top-bar-phase">
                <span className="top-bar-phase-name">{phaseTitle}</span>
                {phaseCounterLabel && (
                  <span className="top-bar-phase-counter">{phaseCounterLabel}</span>
                )}
              </span>
            )}
          </div>
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
