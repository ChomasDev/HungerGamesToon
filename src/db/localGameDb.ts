import type { EventList, StoredEvent, TributeCharacterSelectOptions } from '../engine/types'
import type { GameSettings, ThemeConfig } from '../store/gameStore'

const DB_NAME = 'hungergames-app'
const DB_VERSION = 1
const STORE_META = 'meta'
const STORE_IMAGES = 'tributeImages'

const SNAPSHOT_KEY = 'snapshot-v1'

export interface SerializableTribute extends Omit<TributeCharacterSelectOptions, 'image_url'> {
  image_url?: string
  hasLocalImage?: boolean
}

export interface PersistedSnapshotV1 {
  version: 1
  seasonTitle: string
  theme: ThemeConfig
  gameSettings: GameSettings
  autoPlaySpeed: number
  tributes: SerializableTribute[]
  customEvents: EventList<StoredEvent> | null
}

function canUseIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined'
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META)
      }
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES)
      }
    }
  })
}

export async function clearLocalGameDb(): Promise<void> {
  if (!canUseIndexedDb()) return
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error ?? new Error('IndexedDB delete failed'))
    req.onblocked = () => resolve()
  })
}

async function serializeTribute(t: TributeCharacterSelectOptions): Promise<{
  serial: SerializableTribute
  blob?: Blob
}> {
  const { image_url: url, ...rest } = t
  if (!url) {
    return { serial: { ...rest } }
  }
  if (url.startsWith('blob:')) {
    const blob = await fetch(url).then((r) => r.blob())
    return {
      serial: { ...rest, hasLocalImage: true },
      blob,
    }
  }
  return { serial: { ...rest, image_url: url } }
}

function deserializeTributes(
  list: SerializableTribute[],
  blobById: Map<string, Blob>,
): TributeCharacterSelectOptions[] {
  return list.map((row) => {
    const { hasLocalImage, image_url, ...rest } = row
    let resolvedUrl: string | undefined
    if (hasLocalImage) {
      const blob = blobById.get(rest.id)
      if (blob) resolvedUrl = URL.createObjectURL(blob)
    } else if (image_url) {
      resolvedUrl = image_url
    }
    return { ...rest, image_url: resolvedUrl }
  })
}

export interface SavePersistInput {
  seasonTitle: string
  theme: ThemeConfig
  gameSettings: GameSettings
  autoPlaySpeed: number
  tributes: TributeCharacterSelectOptions[]
  customEvents: EventList<StoredEvent> | null
}

export async function savePersistedAppState(input: SavePersistInput): Promise<void> {
  if (!canUseIndexedDb()) return

  const serialTributes: SerializableTribute[] = []
  const blobs = new Map<string, Blob>()

  for (const t of input.tributes) {
    const { serial, blob } = await serializeTribute(t)
    serialTributes.push(serial)
    if (blob) blobs.set(t.id, blob)
  }

  const wantImageIds = new Set(blobs.keys())

  const snapshot: PersistedSnapshotV1 = {
    version: 1,
    seasonTitle: input.seasonTitle,
    theme: input.theme,
    gameSettings: input.gameSettings,
    autoPlaySpeed: input.autoPlaySpeed,
    tributes: serialTributes,
    customEvents: input.customEvents,
  }

  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_META, STORE_IMAGES], 'readwrite')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'))
      tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'))

      tx.objectStore(STORE_META).put(snapshot, SNAPSHOT_KEY)

      const imgStore = tx.objectStore(STORE_IMAGES)
      const keysReq = imgStore.getAllKeys()
      keysReq.onsuccess = () => {
        const existing = keysReq.result as string[]
        for (const id of existing) {
          if (!wantImageIds.has(id)) {
            imgStore.delete(id)
          }
        }
        for (const [id, blob] of blobs) {
          imgStore.put(blob, id)
        }
      }
      keysReq.onerror = () => reject(keysReq.error)
    })
  } finally {
    db.close()
  }
}

export async function loadPersistedAppState(): Promise<Partial<SavePersistInput> | null> {
  if (!canUseIndexedDb()) return null

  const db = await openDb()
  try {
    const snapshot = await new Promise<PersistedSnapshotV1 | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_META, 'readonly')
      let value: PersistedSnapshotV1 | undefined
      const req = tx.objectStore(STORE_META).get(SNAPSHOT_KEY)
      req.onsuccess = () => {
        value = req.result as PersistedSnapshotV1 | undefined
      }
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => resolve(value)
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB read failed'))
    })

    if (!snapshot || snapshot.version !== 1) {
      return null
    }

    const neededIds = new Set(snapshot.tributes.filter((t) => t.hasLocalImage).map((t) => t.id))

    const blobById =
      neededIds.size === 0
        ? new Map<string, Blob>()
        : await new Promise<Map<string, Blob>>((resolve, reject) => {
            const map = new Map<string, Blob>()
            const tx = db.transaction(STORE_IMAGES, 'readonly')
            const req = tx.objectStore(STORE_IMAGES).openCursor()
            req.onsuccess = () => {
              const cursor = req.result
              if (cursor) {
                const key = cursor.key as string
                if (neededIds.has(key)) {
                  map.set(key, cursor.value as Blob)
                }
                cursor.continue()
              }
            }
            req.onerror = () => reject(req.error)
            tx.oncomplete = () => resolve(map)
            tx.onerror = () => reject(tx.error ?? new Error('IndexedDB read failed'))
          })

    const tributes = deserializeTributes(snapshot.tributes, blobById)

    return {
      seasonTitle: snapshot.seasonTitle,
      theme: snapshot.theme,
      gameSettings: snapshot.gameSettings,
      autoPlaySpeed: snapshot.autoPlaySpeed,
      tributes,
      customEvents: snapshot.customEvents,
    }
  } finally {
    db.close()
  }
}
