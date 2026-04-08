import { useRef, useState } from 'react'
import {
  PronounSetting,
  type EventList,
  type StoredEvent,
  type TributeCharacterSelectOptions,
} from '../engine/types'
import { loadCharactersFromJson, loadEventsFromJson, saveCharactersToJson, saveEventsToJson, downloadJson, readJsonFile } from '../engine/serialization'
import { cloneBuiltinEventsForEditor } from '../engine/eventListUtils'
import { builtinEvents } from '../engine/events'
import { it } from '../i18n/it'
import { makeId } from '../store/gameStore'
import { isImageFile, titleFromImageFilename } from '../utils/imageRoster'
import EventPoolEditor from './EventPoolEditor'
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
  onAppendTributes: (tributes: TributeCharacterSelectOptions[]) => void
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
  onAppendTributes,
  onSetCustomEvents,
  onError,
}: RosterBuilderProps) {
  const charFileRef = useRef<HTMLInputElement>(null)
  const eventFileRef = useRef<HTMLInputElement>(null)
  const imagesFileRef = useRef<HTMLInputElement>(null)
  const [lobbyDragOver, setLobbyDragOver] = useState(false)

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

  function buildTributesFromImageFiles(files: Iterable<File>): TributeCharacterSelectOptions[] {
    const list = [...files].filter(isImageFile)
    return list.map((file) => ({
      id: makeId(),
      name: titleFromImageFilename(file.name),
      pronoun_option: PronounSetting.Common,
      image_url: URL.createObjectURL(file),
    }))
  }

  function appendImagesFromFiles(files: Iterable<File>) {
    const next = buildTributesFromImageFiles(files)
    if (next.length === 0) return
    onAppendTributes(next)
  }

  function handleLoadImages(e: React.ChangeEvent<HTMLInputElement>) {
    const fl = e.target.files
    if (fl && fl.length > 0) appendImagesFromFiles(fl)
    e.target.value = ''
  }

  function handleLobbyDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  function handleLobbyDragEnter(e: React.DragEvent) {
    if (e.dataTransfer.types.includes('Files')) setLobbyDragOver(true)
  }

  function handleLobbyDragLeave(e: React.DragEvent) {
    const related = e.relatedTarget as Node | null
    if (related && e.currentTarget.contains(related)) return
    setLobbyDragOver(false)
  }

  function handleLobbyDrop(e: React.DragEvent) {
    e.preventDefault()
    setLobbyDragOver(false)
    if (e.dataTransfer.files?.length) appendImagesFromFiles(e.dataTransfer.files)
  }

  const eventCount = customEvents
    ? Object.values(customEvents).reduce((sum, list) => sum + (list?.length ?? 0), 0)
    : null

  return (
    <div
      className={`lobby-screen${lobbyDragOver ? ' lobby-screen--drag-over' : ''}`}
      onDragOver={handleLobbyDragOver}
      onDragEnter={handleLobbyDragEnter}
      onDragLeave={handleLobbyDragLeave}
      onDrop={handleLobbyDrop}
    >
      <div className="lobby-hero">
        <h1>{it.appTitle}</h1>
        <p className="subtitle">{it.appSubtitle}</p>
        <p className="lobby-drop-hint">{it.lobbyDropImagesHint}</p>
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
            <button className="btn btn-ghost" onClick={() => imagesFileRef.current?.click()}>
              {it.uploadImages}
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
            <input
              ref={imagesFileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleLoadImages}
            />
          </div>
        </div>

        <div className="roster-grid-scroll">
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

        {customEvents === null ? (
          <div className="event-pool-builtin-banner">
            <p className="event-pool-builtin-text">{it.eventPoolBuiltinHint}</p>
            <button type="button" className="btn btn-secondary" onClick={() => onSetCustomEvents(cloneBuiltinEventsForEditor())}>
              {it.eventPoolCustomize}
            </button>
          </div>
        ) : (
          <EventPoolEditor events={customEvents} onChange={onSetCustomEvents} />
        )}
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
