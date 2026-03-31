export const enum PronounSetting {
  Masculine = 'm',
  Feminine = 'f',
  Common = 'c',
  None = 'n',
  Custom = 'other',
}

export interface TributePronouns {
  nominative: string
  accusative: string
  genitive: string
  reflexive: string
}

export interface TributeCharacterSelectOptions {
  id: string
  name: string
  custom_pronouns?: string
  pronoun_option: PronounSetting
  image_url?: string
  subtitle?: string
}

export interface TributeOptions {
  uses_pronouns: boolean
  pronouns?: TributePronouns
  plural: boolean
  image: string
}

export const enum RenderState {
  GAME_OVER,
  ROUND_EVENTS,
  ROUND_DEATHS,
  WINNERS,
  GAME_DEATHS,
  STATS,
}

export const enum GameStage {
  BLOODBATH = 'bloodbath',
  DAY = 'day',
  NIGHT = 'night',
  FEAST = 'feast',
}

export type FormattedMessage = (string | NameSpan)[]

export class NameSpan {
  readonly value: string
  constructor(value: string) {
    this.value = value
  }
}

export type EventListKey = 'bloodbath' | 'day' | 'night' | 'feast' | 'all'

export interface EventList<T = StoredEvent> {
  bloodbath?: T[]
  day?: T[]
  night?: T[]
  feast?: T[]
  all?: T[]
}

export interface StoredEvent {
  message: string
  fatalities: number[]
  killers: number[]
  enabled: boolean
  type: string
}

export interface GameRound {
  game_events: GameEventData[]
  died_this_round: Tribute[]
  index: number
  stage: GameStage
}

export interface GameEventData {
  event: Event
  players_involved: Tribute[]
  message: FormattedMessage
}

export interface GameRenderStateData {
  state: RenderState
  game_title: string
  rounds: GameRound[]
  tributes_died: Tribute[]
  tributes_alive: Tribute[]
}

export class Tribute {
  readonly raw_name: string
  readonly name: NameSpan
  readonly pronouns?: TributePronouns
  readonly uses_pronouns: boolean
  readonly image_src: string
  readonly plural: boolean
  kills: number
  died_in_round: GameRound | undefined

  constructor(name: string, options: TributeOptions) {
    this.raw_name = name
    this.name = new NameSpan(name)
    this.uses_pronouns = options.uses_pronouns
    if (this.uses_pronouns) this.pronouns = { ...options.pronouns! }
    this.image_src = options.image ?? ''
    this.plural = options.plural
    this.kills = 0
  }
}

export class Event {
  static __last_id = -1
  static readonly list_keys: EventListKey[] = ['day', 'all', 'feast', 'night', 'bloodbath']

  message: string
  players_involved: number
  fatalities: number[]
  killers: number[]
  enabled: boolean = true
  id: number
  type: string

  constructor(
    message: string,
    fatalities: number[] = [],
    killers: number[] = [],
    type = 'BUILTIN',
  ) {
    this.message = message.trim()
    this.players_involved = Math.max(calculateTributesInvolved(message))
    this.fatalities = fatalities
    this.killers = killers
    this.id = ++Event.__last_id
    this.type = type
  }
}

const validSlot = (idx: number, n: number) => Number.isInteger(idx) && idx >= 0 && idx < n

/**
 * Uses valid `killers` entries when present. If none remain (empty or only out-of-range indices),
 * infers killers when there is exactly **one** distinct victim slot in `fatalities` (handles
 * duplicate fatality indices in JSON and omitted `killers`). Every other scene slot is a killer.
 */
export function resolvedKillerIndices(event: Pick<Event, 'killers' | 'fatalities' | 'players_involved'>): number[] {
  const n = event.players_involved
  const explicit = event.killers.filter((k) => validSlot(k, n))
  if (explicit.length > 0) return explicit

  const victims = new Set<number>()
  for (const f of event.fatalities) {
    if (validSlot(f, n)) victims.add(f)
  }
  if (victims.size !== 1) return []
  const victim = Array.from(victims)[0]!
  const killers: number[] = []
  for (let i = 0; i < n; i++) {
    if (i !== victim) killers.push(i)
  }
  return killers
}

function calculateTributesInvolved(raw_message: string): number {
  const v_raw = raw_message
    .match(/%[NAGRsyih!w]?(\d)/g)
    ?.map((x) => +x.slice(-1))
    ?.reduce((prev, curr) => Math.max(prev, curr), 0)
  const value = typeof v_raw === 'undefined' ? 0 : v_raw + 1
  return Number.isFinite(value) ? value : 0
}

export function makeStoredEvent(
  message: string,
  fatalities: number[] = [],
  killers: number[] = [],
  type: string = 'BUILTIN',
): StoredEvent {
  return { message, fatalities, killers, type, enabled: true }
}

export function titleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())
}
