import { it } from '../i18n/it'

interface ControlRailProps {
  onProceed: () => void
  onAbort: () => void
  isAutoPlaying: boolean
  autoPlaySpeed: number
  onToggleAutoPlay: () => void
  onSpeedChange: (speed: number) => void
  /** Shown on the primary button when not auto-playing */
  proceedLabel?: string
  /**
   * While watching round scenes, Prev / Next scene / Next phase live on the stage.
   * Hide this button so the bar is only Auto, speed, and Abort (Pause still shows during auto-play).
   */
  hidePrimaryProceed?: boolean
}

export default function ControlRail({
  onProceed,
  onAbort,
  isAutoPlaying,
  autoPlaySpeed,
  onToggleAutoPlay,
  onSpeedChange,
  proceedLabel = it.controlNext,
  hidePrimaryProceed = false,
}: ControlRailProps) {
  const showPrimary = isAutoPlaying || !hidePrimaryProceed

  return (
    <div className="control-rail">
      {showPrimary ? (
        <button type="button" className="btn btn-primary" onClick={onProceed}>
          {isAutoPlaying ? it.controlPause : proceedLabel}
        </button>
      ) : null}

      <button
        className="btn btn-secondary"
        onClick={onToggleAutoPlay}
      >
        {isAutoPlaying ? it.controlStopAuto : it.controlAutoPlay}
      </button>

      <div className="speed-control">
        <span>{it.controlSpeed}</span>
        <input
          type="range"
          min={500}
          max={5000}
          step={250}
          value={autoPlaySpeed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
        />
        <span>{(autoPlaySpeed / 1000).toFixed(1)}s</span>
      </div>

      <button className="btn btn-danger" onClick={onAbort}>
        {it.controlAbortGame}
      </button>
    </div>
  )
}
