import { RenderState, type GameRenderStateData } from '../engine/types'
import { it } from '../i18n/it'

interface ControlRailProps {
  onProceed: () => void
  isAutoPlaying: boolean
  autoPlaySpeed: number
  onToggleAutoPlay: () => void
  onSpeedChange: (speed: number) => void
  /** Shown on the primary button when not auto-playing */
  proceedLabel?: string
  /**
   * Engine render state drives the scene-nav UI: during ROUND_EVENTS the rail shows Prev / dots / Next-scene-or-phase.
   * For other states it shows a single "continue" button.
   */
  renderState?: GameRenderStateData | null
  eventIndex?: number
  onEventIndexChange?: (index: number) => void
  onAdvance?: () => void
}

export default function ControlRail({
  onProceed,
  isAutoPlaying,
  autoPlaySpeed,
  onToggleAutoPlay,
  onSpeedChange,
  proceedLabel = it.controlNext,
  renderState,
  eventIndex = 0,
  onEventIndexChange,
  onAdvance,
}: ControlRailProps) {
  const isRoundEvents = renderState?.state === RenderState.ROUND_EVENTS
  const currentRound = renderState?.rounds[renderState.rounds.length - 1]
  const totalEvents = currentRound?.game_events.length ?? 0
  const hasNoEvents = totalEvents === 0
  const isLastEvent = totalEvents > 0 && eventIndex >= totalEvents - 1
  const phaseReady = isLastEvent || hasNoEvents

  const goPrev = () => onEventIndexChange?.(Math.max(eventIndex - 1, 0))
  const goNext = () =>
    onEventIndexChange?.(Math.min(eventIndex + 1, Math.max(0, totalEvents - 1)))
  const advance = onAdvance ?? onProceed

  return (
    <div className="control-rail">
      <div className="control-rail__panels">
        <div className="hud-panel hud-panel--playback control-rail-panel control-rail-panel--playback">
          <span className="hud-panel__label">{it.hudPanelRun}</span>
          <div className="hud-panel__body">
            <button
              className="btn btn-secondary control-rail-auto-btn"
              onClick={onToggleAutoPlay}
            >
              {isAutoPlaying ? it.controlStopAuto : it.controlAutoPlay}
            </button>
            <div className="speed-control">
              <span className="speed-control-label">{it.controlSpeed}</span>
              <input
                type="range"
                min={500}
                max={5000}
                step={250}
                value={autoPlaySpeed}
                onChange={(e) => onSpeedChange(Number(e.target.value))}
              />
              <span className="speed-control-value">{(autoPlaySpeed / 1000).toFixed(1)}s</span>
            </div>
          </div>
        </div>

        <div
          className={`hud-panel hud-panel--scene control-rail-panel control-rail-panel--scene${
            phaseReady ? ' control-rail-panel--phase-ready' : ''
          }`}
        >
          <span className="hud-panel__label">{it.hudPanelScene}</span>
          <div className="hud-panel__body control-rail-scene-body">
            {isRoundEvents ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary event-nav-btn"
                  onClick={goPrev}
                  disabled={eventIndex === 0 || hasNoEvents}
                >
                  {it.prevScene}
                </button>
                {!hasNoEvents && (
                  <div className="event-nav-dots">
                    {Array.from({ length: totalEvents }, (_, i) => (
                      <button
                        type="button"
                        key={i}
                        className={`event-dot ${i === eventIndex ? 'active' : ''} ${
                          currentRound!.game_events[i].event.fatalities.length > 0 ? 'dot-death' : ''
                        }`}
                        onClick={() => onEventIndexChange?.(i)}
                        aria-label={`Scena ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
                {phaseReady ? (
                  <button
                    type="button"
                    className="btn btn-primary event-nav-btn event-nav-btn-phase"
                    onClick={advance}
                    disabled={!advance}
                  >
                    {isAutoPlaying ? it.controlPause : it.nextPhase}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary event-nav-btn"
                    onClick={goNext}
                  >
                    {it.nextScene}
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary control-rail-proceed-btn"
                onClick={advance}
                disabled={!advance}
              >
                {isAutoPlaying ? it.controlPause : proceedLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
