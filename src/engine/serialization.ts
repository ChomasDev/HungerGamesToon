import { PronounSetting, type EventList, type StoredEvent, type TributeCharacterSelectOptions } from './types'
import { makeId } from '../store/gameStore'

interface V1CharacterConfig {
  version: 1
  characters: {
    name: string
    gender_select: string
    pronoun_str: string
    image?: { url: string } | { data: string }
    tags: unknown[]
  }[]
}

interface LegacyCharacterConfig {
  characters: {
    name: string
    gender_select: string
    custom_pronouns: string
    image?: string
  }[]
}

interface V1EventConfig {
  version: 1
  events: EventList<StoredEvent & { tag_requirements?: unknown[] }>
  tags: unknown[]
}

type CharacterConfig = V1CharacterConfig | LegacyCharacterConfig
type EventConfig = V1EventConfig | EventList<StoredEvent>

function isV1CharConfig(data: unknown): data is V1CharacterConfig {
  return typeof data === 'object' && data !== null && 'version' in data && (data as V1CharacterConfig).version === 1 && 'characters' in data
}

function isV1EventConfig(data: unknown): data is V1EventConfig {
  return typeof data === 'object' && data !== null && 'version' in data && (data as V1EventConfig).version === 1 && 'events' in data
}

export async function loadCharactersFromJson(data: unknown): Promise<TributeCharacterSelectOptions[]> {
  if (isV1CharConfig(data)) {
    return Promise.all(data.characters.map(async (char) => {
      let image_url: string | undefined
      if (typeof char.image === 'object' && char.image) {
        if ('url' in char.image && !char.image.url.startsWith('blob:')) {
          image_url = char.image.url
        } else if ('data' in char.image) {
          const blob = await fetch(char.image.data).then(r => r.blob())
          image_url = URL.createObjectURL(blob)
        }
      }
      return {
        id: makeId(),
        name: char.name,
        pronoun_option: char.gender_select as PronounSetting,
        custom_pronouns: char.pronoun_str || undefined,
        image_url,
      }
    }))
  }

  const legacy = data as LegacyCharacterConfig
  if (legacy?.characters) {
    return legacy.characters.map((char) => ({
      id: makeId(),
      name: char.name,
      pronoun_option: char.gender_select as PronounSetting,
      custom_pronouns: char.custom_pronouns || undefined,
      image_url: char.image && !char.image.startsWith('blob:') ? char.image : undefined,
    }))
  }

  throw new Error('Formato file personaggi non valido')
}

export function saveCharactersToJson(tributes: TributeCharacterSelectOptions[]): V1CharacterConfig {
  return {
    version: 1,
    characters: tributes.map((t) => ({
      name: t.name,
      gender_select: t.pronoun_option,
      pronoun_str: t.custom_pronouns ?? '',
      tags: [],
    })),
  }
}

export function loadEventsFromJson(data: unknown): EventList<StoredEvent> {
  if (isV1EventConfig(data)) {
    const events: EventList<StoredEvent> = {}
    const keys = ['bloodbath', 'day', 'night', 'feast', 'all'] as const
    for (const key of keys) {
      const sourceList = data.events[key]
      if (sourceList) {
        events[key] = sourceList.map((e) => ({
          message: e.message,
          fatalities: e.fatalities,
          killers: e.killers,
          enabled: e.enabled,
          type: e.type,
        }))
      }
    }
    return events
  }

  const raw = data as EventList<StoredEvent>
  if (raw?.bloodbath || raw?.day || raw?.night || raw?.feast || raw?.all) {
    return raw
  }

  throw new Error('Formato file eventi non valido')
}

export function saveEventsToJson(events: EventList<StoredEvent>): V1EventConfig {
  const output: V1EventConfig = {
    version: 1,
    events: {},
    tags: [],
  }
  const keys = ['bloodbath', 'day', 'night', 'feast', 'all'] as const
  for (const key of keys) {
    const list = events[key]
    if (list) {
      output.events[key] = list.map((e) => ({
        message: e.message,
        fatalities: e.fatalities,
        killers: e.killers,
        enabled: e.enabled,
        type: e.type,
        tag_requirements: [],
      }))
    }
  }
  return output
}

export function downloadJson(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string))
      } catch {
        reject(new Error('File JSON non valido'))
      }
    }
    reader.onerror = () => reject(new Error('Lettura del file non riuscita'))
    reader.readAsText(file)
  })
}
