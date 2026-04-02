import { useCallback, useMemo, useState } from 'react'
import { EVENT_EDITOR_KEYS } from '../engine/eventListUtils'
import type { EventList, EventListKey, StoredEvent } from '../engine/types'
import { it, translateGameStage } from '../i18n/it'
import EditStoredEventModal, { createBlankStoredEvent } from './EditStoredEventModal'

function tabLabel(key: EventListKey): string {
  if (key === 'all') return it.eventPoolTabAll
  return translateGameStage(key)
}

function truncate(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

interface EventPoolEditorProps {
  events: EventList<StoredEvent>
  onChange: (next: EventList<StoredEvent>) => void
}

type EditTarget = { key: EventListKey; index: number } | null

export default function EventPoolEditor({ events, onChange }: EventPoolEditorProps) {
  const [activeTab, setActiveTab] = useState<EventListKey>(() => {
    for (const k of EVENT_EDITOR_KEYS) {
      if (events[k]?.length) return k
    }
    return 'day'
  })

  const [editTarget, setEditTarget] = useState<EditTarget>(null)

  const list = events[activeTab] ?? []

  const initialForModal = useMemo((): StoredEvent | null => {
    if (!editTarget) return null
    const row = events[editTarget.key]?.[editTarget.index]
    return row ? { ...row } : null
  }, [editTarget, events])

  const updateList = useCallback(
    (key: EventListKey, updater: (prev: StoredEvent[]) => StoredEvent[]) => {
      const prev = [...(events[key] ?? [])]
      const nextList = updater(prev)
      onChange({ ...events, [key]: nextList })
    },
    [events, onChange],
  )

  const handleSaveEdited = useCallback(
    (updated: StoredEvent) => {
      if (!editTarget) return
      const { key, index } = editTarget
      updateList(key, (arr) => {
        const copy = [...arr]
        copy[index] = updated
        return copy
      })
    },
    [editTarget, updateList],
  )

  const addEvent = useCallback(() => {
    const newIndex = list.length
    updateList(activeTab, (arr) => [...arr, createBlankStoredEvent()])
    setEditTarget({ key: activeTab, index: newIndex })
  }, [activeTab, list.length, updateList])

  return (
    <div className="event-pool-panel">
      <h3 className="event-pool-heading">{it.eventPoolListTitle}</h3>

      <div className="event-pool-tabs" role="tablist">
        {EVENT_EDITOR_KEYS.map((key) => {
          const count = events[key]?.length ?? 0
          const active = key === activeTab
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              className={`event-pool-tab ${active ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {tabLabel(key)}
              <span className="event-pool-tab-count">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="event-pool-toolbar">
        <button type="button" className="btn btn-secondary" onClick={addEvent}>
          {it.eventPoolAddEvent}
        </button>
      </div>

      <div className="event-pool-table-wrap">
        <table className="event-pool-table">
          <thead>
            <tr>
              <th className="event-pool-col-on" aria-label={it.eventPoolFieldEnabled} />
              <th>{it.eventPoolColText}</th>
              <th className="event-pool-col-meta">{it.eventPoolColMeta}</th>
              <th className="event-pool-col-actions" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={4} className="event-pool-empty">
                  {it.eventPoolEmptyCategory}
                </td>
              </tr>
            ) : (
              list.map((row, index) => (
                <tr key={`${activeTab}-${index}`}>
                  <td className="event-pool-col-on">
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      aria-label={it.eventPoolFieldEnabled}
                      onChange={() =>
                        updateList(activeTab, (arr) => {
                          const copy = [...arr]
                          copy[index] = { ...copy[index]!, enabled: !copy[index]!.enabled }
                          return copy
                        })
                      }
                    />
                  </td>
                  <td className="event-pool-snippet">{truncate(row.message, 140)}</td>
                  <td className="event-pool-col-meta event-pool-meta-cell">
                    {row.fatalities.length > 0 && (
                      <span className="event-pool-badge event-pool-badge-death">
                        {it.eventPoolBadgeDeath}:{row.fatalities.join(',')}
                      </span>
                    )}
                    {row.killers.length > 0 && (
                      <span className="event-pool-badge">{it.eventPoolBadgeKill}:{row.killers.join(',')}</span>
                    )}
                  </td>
                  <td className="event-pool-col-actions">
                    <button type="button" className="btn btn-ghost btn-tiny" onClick={() => setEditTarget({ key: activeTab, index })}>
                      {it.eventPoolEdit}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-tiny event-pool-btn-danger"
                      onClick={() =>
                        updateList(activeTab, (arr) => arr.filter((_, i) => i !== index))
                      }
                    >
                      {it.eventPoolDelete}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditStoredEventModal
        isOpen={editTarget !== null}
        initial={initialForModal}
        onClose={() => setEditTarget(null)}
        onSave={handleSaveEdited}
      />
    </div>
  )
}
