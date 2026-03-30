import { useRef } from 'react'
import type { EventList, StoredEvent, TributeCharacterSelectOptions } from '../engine/types'
import { loadCharactersFromJson, loadEventsFromJson, saveCharactersToJson, saveEventsToJson, downloadJson, readJsonFile } from '../engine/serialization'
import { builtinEvents } from '../engine/events'
import { it } from '../i18n/it'
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
      onError(err instanceof Error ? err.message : it.errorLoadCharacters)
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
      onError(err instanceof Error ? err.message : it.errorLoadEvents)
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
        <h1>{it.appTitle}</h1>
        <p className="subtitle">{it.appSubtitle}</p>
        <input
          className="season-title-input"
          type="text"
          value={seasonTitle}
          onChange={(e) => onSeasonTitleChange(e.target.value)}
          placeholder={it.seasonPlaceholder}
        />
      </div>

      <section className="roster-section">
        <p className="roster-persist-hint">
          {it.persistHintLobby}
        </p>
        <div className="roster-toolbar">
          <h2>{it.tributesHeading(tributes.length)}</h2>
          <div className="roster-toolbar-actions">
            <button className="btn btn-secondary" onClick={onAddTribute}>
              {it.addTribute}
            </button>
            <button className="btn btn-ghost" onClick={() => charFileRef.current?.click()}>
              {it.loadJson}
            </button>
            <button className="btn btn-ghost" onClick={handleSaveCharacters}>
              {it.saveJson}
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
            <span className="label">{it.addTributeCard}</span>
          </button>
        </div>

        <div className="roster-toolbar" style={{ marginTop: 16 }}>
          <h2>
            {it.eventsHeading}
            {eventCount !== null && (
              <span style={{ color: 'var(--accent)', marginLeft: 8 }}>
                {it.eventsCustom(eventCount)}
              </span>
            )}
            {eventCount === null && (
              <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                {it.eventsDefault}
              </span>
            )}
          </h2>
          <div className="roster-toolbar-actions">
            <button className="btn btn-ghost" onClick={() => eventFileRef.current?.click()}>
              {it.loadEvents}
            </button>
            <button className="btn btn-ghost" onClick={handleSaveEvents}>
              {it.saveEvents}
            </button>
            {customEvents && (
              <button className="btn btn-danger" onClick={handleResetEvents} style={{ fontSize: 11 }}>
                {it.resetEventsDefault}
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
          {it.beginGames}
        </button>
        {tributes.length < 2 && (
          <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 13 }}>
            {it.needTwoTributes}
          </p>
        )}
      </div>
    </div>
  )
}
