import { useRef } from 'react'
import type { EventList, StoredEvent, TributeCharacterSelectOptions } from '../engine/types'
import { loadCharactersFromJson, loadEventsFromJson, saveCharactersToJson, saveEventsToJson, downloadJson, readJsonFile } from '../engine/serialization'
import { builtinEvents } from '../engine/events'
import TributeCard from './TributeCard'

interface RosterBuilderProps {
  tributes: TributeCharacterSelectOptions[]
  seasonTitle: string
  customEvents: EventList<StoredEvent> | null
  onSeasonTitleChange: (title: string) => void
  onAddTribute: () => void
  onRemoveTribute: (id: string) => void
  onUpdateTribute: (id: string, updates: Partial<TributeCharacterSelectOptions>) => void
  onStartGame: () => void
  onSetTributes: (tributes: TributeCharacterSelectOptions[]) => void
  onSetCustomEvents: (events: EventList<StoredEvent> | null) => void
  onError: (msg: string) => void
}

export default function RosterBuilder({
  tributes,
  seasonTitle,
  customEvents,
  onSeasonTitleChange,
  onAddTribute,
  onRemoveTribute,
  onUpdateTribute,
  onStartGame,
  onSetTributes,
  onSetCustomEvents,
  onError,
}: RosterBuilderProps) {
  const charFileRef = useRef<HTMLInputElement>(null)
  const eventFileRef = useRef<HTMLInputElement>(null)

  async function handleLoadCharacters(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await readJsonFile(file)
      const loaded = await loadCharactersFromJson(data)
      onSetTributes(loaded)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to load characters')
    }
    e.target.value = ''
  }

  function handleSaveCharacters() {
    const data = saveCharactersToJson(tributes)
    downloadJson(data, 'characters.json')
  }

  async function handleLoadEvents(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await readJsonFile(file)
      const loaded = loadEventsFromJson(data)
      onSetCustomEvents(loaded)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to load events')
    }
    e.target.value = ''
  }

  function handleSaveEvents() {
    const events = customEvents ?? builtinEvents
    const data = saveEventsToJson(events)
    downloadJson(data, 'hgs-events.json')
  }

  function handleResetEvents() {
    onSetCustomEvents(null)
  }

  const eventCount = customEvents
    ? Object.values(customEvents).reduce((sum, list) => sum + (list?.length ?? 0), 0)
    : null

  return (
    <div className="lobby-screen">
      <div className="lobby-hero">
        <h1>Hunger Games</h1>
        <p className="subtitle">Simulator</p>
        <input
          className="season-title-input"
          type="text"
          value={seasonTitle}
          onChange={(e) => onSeasonTitleChange(e.target.value)}
          placeholder="Season Title..."
        />
      </div>

      <section className="roster-section">
        <div className="roster-toolbar">
          <h2>Tributes ({tributes.length})</h2>
          <div className="roster-toolbar-actions">
            <button className="btn btn-secondary" onClick={onAddTribute}>
              + Add
            </button>
            <button className="btn btn-ghost" onClick={() => charFileRef.current?.click()}>
              Load JSON
            </button>
            <button className="btn btn-ghost" onClick={handleSaveCharacters}>
              Save JSON
            </button>
            <input
              ref={charFileRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleLoadCharacters}
            />
          </div>
        </div>

        <div className="roster-grid">
          {tributes.map((tribute, i) => (
            <TributeCard
              key={tribute.id}
              tribute={tribute}
              index={i}
              onUpdate={onUpdateTribute}
              onRemove={onRemoveTribute}
            />
          ))}
          <button className="add-tribute-card" onClick={onAddTribute}>
            <span className="plus">+</span>
            <span className="label">Add Tribute</span>
          </button>
        </div>

        <div className="roster-toolbar" style={{ marginTop: 16 }}>
          <h2>
            Events
            {eventCount !== null && (
              <span style={{ color: 'var(--accent)', marginLeft: 8 }}>
                (Custom: {eventCount})
              </span>
            )}
            {eventCount === null && (
              <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                (Default)
              </span>
            )}
          </h2>
          <div className="roster-toolbar-actions">
            <button className="btn btn-ghost" onClick={() => eventFileRef.current?.click()}>
              Load Events
            </button>
            <button className="btn btn-ghost" onClick={handleSaveEvents}>
              Save Events
            </button>
            {customEvents && (
              <button className="btn btn-danger" onClick={handleResetEvents} style={{ fontSize: 11 }}>
                Reset to Default
              </button>
            )}
            <input
              ref={eventFileRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleLoadEvents}
            />
          </div>
        </div>
      </section>

      <div className="lobby-footer">
        <button
          className="btn btn-primary btn-large"
          onClick={onStartGame}
          disabled={tributes.length < 2}
        >
          Begin The Games
        </button>
        {tributes.length < 2 && (
          <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 13 }}>
            Need at least 2 tributes
          </p>
        )}
      </div>
    </div>
  )
}
