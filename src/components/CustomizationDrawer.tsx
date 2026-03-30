import type { GameSettings, KillsPerRoundMode, ThemeConfig } from '../store/gameStore'
import { it } from '../i18n/it'

interface CustomizationDrawerProps {
  isOpen: boolean
  onClose: () => void
  theme: ThemeConfig
  onThemeChange: (updates: Partial<ThemeConfig>) => void
  gameSettings: GameSettings
  onGameSettingsChange: (updates: Partial<GameSettings>) => void
  /** Clears IndexedDB and resets roster/settings to defaults */
  onEraseLocalData: () => void | Promise<void>
}

const presets = ['toon', 'dark', 'ember', 'neon', 'ice'] as const

export default function CustomizationDrawer({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  gameSettings,
  onGameSettingsChange,
  onEraseLocalData,
}: CustomizationDrawerProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <h2>{it.customization}</h2>

        <div className="drawer-section">
          <label>{it.themePreset}</label>
          <div className="theme-presets">
            {presets.map((preset) => (
              <button
                key={preset}
                className={`theme-preset ${theme.preset === preset ? 'active' : ''}`}
                data-preset={preset}
                onClick={() => onThemeChange({ preset })}
                type="button"
              >
                {it.themePresetLabels[preset]}
              </button>
            ))}
          </div>
        </div>

        <div className="drawer-section">
          <label>{it.accentColor}</label>
          <input
            type="color"
            value={theme.accent}
            onChange={(e) => onThemeChange({ accent: e.target.value })}
            style={{ height: 40, width: '100%', padding: 2 }}
          />
        </div>

        <div className="drawer-section">
          <label>{it.motionLevel}</label>
          <select
            value={theme.motionLevel}
            onChange={(e) => onThemeChange({ motionLevel: e.target.value as 'full' | 'reduced' })}
          >
            <option value="full">{it.motionFull}</option>
            <option value="reduced">{it.motionReduced}</option>
          </select>
        </div>

        <div className="drawer-section">
          <label>{it.density}</label>
          <select
            value={theme.density}
            onChange={(e) => onThemeChange({ density: e.target.value as 'compact' | 'roomy' })}
          >
            <option value="roomy">{it.densityRoomy}</option>
            <option value="compact">{it.densityCompact}</option>
          </select>
        </div>

        <h3 style={{ marginTop: 24, marginBottom: 8 }}>{it.gameSettings}</h3>

        <div className="drawer-section">
          <label>{it.eventsPerPhaseTitle}</label>
          <span className="drawer-hint">{it.eventsPerPhaseHint}</span>
          <label style={{ marginTop: 12, display: 'block' }}>
            {it.eventsPerPhaseMin(gameSettings.eventsPerPhaseMin)}
          </label>
          <input
            type="range"
            min={1}
            max={40}
            step={1}
            value={gameSettings.eventsPerPhaseMin}
            onChange={(e) => {
              const min = Number(e.target.value)
              onGameSettingsChange({
                eventsPerPhaseMin: min,
                eventsPerPhaseMax: Math.max(min, gameSettings.eventsPerPhaseMax),
              })
            }}
          />
          <label style={{ marginTop: 12, display: 'block' }}>
            {it.eventsPerPhaseMax(gameSettings.eventsPerPhaseMax)}
          </label>
          <input
            type="range"
            min={1}
            max={40}
            step={1}
            value={gameSettings.eventsPerPhaseMax}
            onChange={(e) => {
              const max = Number(e.target.value)
              onGameSettingsChange({
                eventsPerPhaseMax: max,
                eventsPerPhaseMin: Math.min(max, gameSettings.eventsPerPhaseMin),
              })
            }}
          />
        </div>

        <div className="drawer-section">
          <label>{it.killsPerRound}</label>
          <select
            value={gameSettings.killsPerRoundMode}
            onChange={(e) => onGameSettingsChange({ killsPerRoundMode: e.target.value as KillsPerRoundMode })}
          >
            <option value="random">{it.killModeRandom}</option>
            <option value="exact">{it.killModeExact}</option>
            <option value="range">{it.killModeRange}</option>
          </select>
          <span className="drawer-hint">
            {gameSettings.killsPerRoundMode === 'random'
              ? it.killHintRandom
              : gameSettings.killsPerRoundMode === 'exact'
                ? it.killHintExact
                : it.killHintRange}
          </span>
        </div>

        {gameSettings.killsPerRoundMode === 'random' && (
          <div className="drawer-section">
            <label>
              {it.maxDeathsPerPhase}:{' '}
              {gameSettings.randomRoundDeathCap === 0 ? it.unlimited : gameSettings.randomRoundDeathCap}
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
              <span>{it.range0off}</span>
              <span>10</span>
              <span>20</span>
            </div>
          </div>
        )}

        {gameSettings.killsPerRoundMode === 'exact' && (
          <div className="drawer-section">
            <label>{it.deathsPerRound(gameSettings.killsPerRoundValue)}</label>
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
              <label>{it.minDeaths(gameSettings.killsPerRoundMin)}</label>
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
              <label>{it.maxDeaths(gameSettings.killsPerRoundMax)}</label>
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

        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ width: '100%', marginTop: 16 }}>
          {it.close}
        </button>

        <p className="drawer-hint" style={{ marginTop: 20 }}>
          {it.drawerPersistHint}
        </p>
        <button
          type="button"
          className="btn btn-danger"
          style={{ width: '100%', marginTop: 8 }}
          onClick={() => {
            if (!confirm(it.eraseLocalConfirm)) {
              return
            }
            void Promise.resolve(onEraseLocalData()).then(() => onClose())
          }}
        >
          {it.eraseLocalButton}
        </button>
      </div>
    </>
  )
}
