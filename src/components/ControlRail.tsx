interface ControlRailProps {
  onProceed: () => void
  onAbort: () => void
  isAutoPlaying: boolean
  autoPlaySpeed: number
  onToggleAutoPlay: () => void
  onSpeedChange: (speed: number) => void
}

export default function ControlRail({
  onProceed,
  onAbort,
  isAutoPlaying,
  autoPlaySpeed,
  onToggleAutoPlay,
  onSpeedChange,
}: ControlRailProps) {
  return (
    <div className="control-rail">
      <button className="btn btn-primary" onClick={onProceed}>
        {isAutoPlaying ? '⏸ Pause' : '▶ Next'}
      </button>

      <button
        className="btn btn-secondary"
        onClick={onToggleAutoPlay}
      >
        {isAutoPlaying ? 'Stop Auto' : 'Auto Play'}
      </button>

      <div className="speed-control">
        <span>Speed</span>
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
        Abort Game
      </button>
    </div>
  )
}
