import { builtinEvents } from './events'
import type { EventList, EventListKey, StoredEvent } from './types'

/** Keys shown in the event-pool editor (order in UI). */
export const EVENT_EDITOR_KEYS: EventListKey[] = ['bloodbath', 'day', 'night', 'feast', 'all']

export function cloneEventListDeep(source: EventList<StoredEvent>): EventList<StoredEvent> {
  const out: EventList<StoredEvent> = {}
  for (const k of EVENT_EDITOR_KEYS) {
    const arr = source[k]
    if (arr?.length) out[k] = arr.map((e) => ({ ...e }))
  }
  return out
}

/** Copy built-in events into a new editable list (starts customization). */
export function cloneBuiltinEventsForEditor(): EventList<StoredEvent> {
  return cloneEventListDeep(builtinEvents)
}
