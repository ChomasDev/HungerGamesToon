import type { GameSettings, KillsPerRoundMode, ThemeConfig } from '../store/gameStore'

interface CustomizationDrawerProps {
  isOpen: boolean
  onClose: () => void
  theme: ThemeConfig
  onThemeChange: (updates: Partial<ThemeConfig>) => void
  gameSettings: GameSettings
  onGameSettingsChange: (updates: Partial<GameSettings>) => void
}

const presets = ['dark', 'ember', 'neon', 'ice'] as const

export default function CustomizationDrawer({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  gameSettings,
  onGameSettingsChange,
}: CustomizationDrawerProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <h2>Customization</h2>

        <div className="drawer-section">
          <label>Theme Preset</label>
          <div className="theme-presets">
            {presets.map((preset) => (
              <button
                key={preset}
                className={`theme-preset ${theme.preset === preset ? 'active' : ''}`}
                data-preset={preset}
                onClick={() => onThemeChange({ preset })}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="drawer-section">
          <label>Accent Color</label>
          <input
            type="color"
            value={theme.accent}
            onChange={(e) => onThemeChange({ accent: e.target.value })}
            style={{ height: 40, width: '100%', padding: 2 }}
          />
        </div>

        <div className="drawer-section">
          <label>Motion Level</label>
          <select
            value={theme.motionLevel}
            onChange={(e) => onThemeChange({ motionLevel: e.target.value as 'full' | 'reduced' })}
          >
            <option value="full">Full Animations</option>
            <option value="reduced">Reduced Motion</option>
          </select>
        </div>

        <div className="drawer-section">
          <label>Density</label>
          <select
            value={theme.density}
            onChange={(e) => onThemeChange({ density: e.target.value as 'compact' | 'roomy' })}
          >
            <option value="roomy">Roomy</option>
            <option value="compact">Compact</option>
          </select>
        </div>

        <h3 style={{ marginTop: 24, marginBottom: 8 }}>Game Settings</h3>

        <div className="drawer-section">
          <label>Kills per Round</label>
          <select
            value={gameSettings.killsPerRoundMode}
            onChange={(e) => onGameSettingsChange({ killsPerRoundMode: e.target.value as KillsPerRoundMode })}
          >
            <option value="random">Fully Random</option>
            <option value="exact">Exact Number</option>
            <option value="range">Random in Range</option>
          </select>
          <span className="drawer-hint">
            {gameSettings.killsPerRoundMode === 'random'
              ? 'Caps below prevent entire rosters from dying in a single day/night. Use 0 for uncapped chaos.'
              : gameSettings.killsPerRoundMode === 'exact'
                ? 'Exactly this many deaths per round (0 = peaceful round possible).'
                : 'A random number of deaths between min and max each round.'}
          </span>
        </div>

        {gameSettings.killsPerRoundMode === 'random' && (
          <div className="drawer-section">
            <label>
              Max deaths per phase:{' '}
              {gameSettings.randomRoundDeathCap === 0 ? 'Unlimited' : gameSettings.randomRoundDeathCap}
            </label>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={gameSettings.randomRoundDeathCap}
              onChange={(e) => onGameSettingsChange({ randomRoundDeathCap: Number(e.target.value) })}
            />
            <div className="range-labels">
              <span>0 — off</span>
              <span>10</span>
              <span>20</span>
            </div>
          </div>
        )}

        {gameSettings.killsPerRoundMode === 'exact' && (
          <div className="drawer-section">
            <label>Deaths per Round: {gameSettings.killsPerRoundValue}</label>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={gameSettings.killsPerRoundValue}
              onChange={(e) => onGameSettingsChange({ killsPerRoundValue: Number(e.target.value) })}
            />
            <div className="range-labels">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        )}

        {gameSettings.killsPerRoundMode === 'range' && (
          <>
            <div className="drawer-section">
              <label>Min Deaths: {gameSettings.killsPerRoundMin}</label>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={gameSettings.killsPerRoundMin}
                onChange={(e) => {
                  const min = Number(e.target.value)
                  onGameSettingsChange({
                    killsPerRoundMin: min,
                    killsPerRoundMax: Math.max(min, gameSettings.killsPerRoundMax),
                  })
                }}
              />
            </div>
            <div className="drawer-section">
              <label>Max Deaths: {gameSettings.killsPerRoundMax}</label>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={gameSettings.killsPerRoundMax}
                onChange={(e) => {
                  const max = Number(e.target.value)
                  onGameSettingsChange({
                    killsPerRoundMax: max,
                    killsPerRoundMin: Math.min(max, gameSettings.killsPerRoundMin),
                  })
                }}
              />
            </div>
            <div className="range-labels">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </>
        )}

        <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%', marginTop: 16 }}>
          Close
        </button>
      </div>
    </>
  )
}
