import {
  Event,
  GameStage,
  RenderState,
  Tribute,
  titleCase,
  type EventList,
  type FormattedMessage,
  calculateTributesInvolved,
  type GameEventData,
  type GameRenderStateData,
  type GameRound,
  type PronounSetting,
  type StoredEvent,
  type TributeCharacterSelectOptions,
  type TributePronouns,
  resolvedKillerIndices,
} from './types'
import { builtinEvents } from './events'

/**
 * Simulation tracing: either
 * - `localStorage.setItem('DEBUG_HG_SIM','1')` then reload, or
 * - open the app with `?DEBUG_HG_SIM=1` in the URL.
 * Unset localStorage key or omit the query param to silence.
 */
function simTraceEnabled(): boolean {
  try {
    if (globalThis.localStorage?.getItem('DEBUG_HG_SIM') === '1') return true
  } catch {
    /* private / blocked storage */
  }
  try {
    if (typeof globalThis.location !== 'undefined') {
      return new URLSearchParams(globalThis.location.search).get('DEBUG_HG_SIM') === '1'
    }
  } catch {
    /* noop */
  }
  return false
}

function simDebug(...args: unknown[]) {
  if (simTraceEnabled()) console.log('[HG sim]', ...args)
}

function simWarn(...args: unknown[]) {
  if (simTraceEnabled()) console.warn('[HG sim]', ...args)
}

export interface KillLimitConfig {
  mode: 'random' | 'exact' | 'range'
  value: number
  min: number
  max: number
  /** When mode is random: hard cap on deaths this phase; 0 = no cap */
  randomModeDeathCap?: number
  /** Each phase ends after this many scenes (random between min and max inclusive). */
  eventsPerPhaseMin?: number
  eventsPerPhaseMax?: number
}

const char_zero = '0'.charCodeAt(0)

function isdigit(char: string): boolean {
  const c = char.charCodeAt(0)
  return c >= char_zero && c <= '9'.charCodeAt(0)
}

function random(from: number, to: number): number {
  return Math.floor(Math.random() * (to - from)) + from
}

function shuffle<T>(array: T[]): T[] {
  if (array.length < 2) return array
  for (let i = array.length - 1; i > 0; i--) {
    const j = random(0, i)
    const k = array[i]
    array[i] = array[j]
    array[j] = k
  }
  return array
}

function buildFallbackPhaseEvent(stage: GameStage): Event {
  switch (stage) {
    case GameStage.BLOODBATH:
      return new Event('%0 keeps away from the bloodbath and survives the opening chaos.', [], [], 'FILLER')
    case GameStage.DAY:
      return new Event('%0 spends the day searching the arena for supplies.', [], [], 'FILLER')
    case GameStage.NIGHT:
      return new Event('%0 stays alert and makes it through the night.', [], [], 'FILLER')
    case GameStage.FEAST:
      return new Event('%0 circles the feast from a safe distance and waits for an opening.', [], [], 'FILLER')
  }
  throw new Error(`Invalid fallback stage: ${String(stage)}`)
}

export function composeGameEventMessage(event: GameEventData): FormattedMessage {
  function check_bounds(ev: GameEventData, index: number) {
    if (index >= ev.event.players_involved)
      throw Error(`Index out of bounds in event '${ev.event.message}'`)
  }

  const m = event.event.message
  const composed: FormattedMessage = []
  let prev = 0
  let i = 0

  outer: for (;;) {
    while (i < m.length && m[i] !== '%') i++
    composed.push(m.slice(prev, i))
    prev = i
    if (i >= m.length) break
    i++
    if (i >= m.length) break

    switch (m[i]) {
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9': {
        check_bounds(event, m[i].charCodeAt(0) - char_zero)
        const name = event.players_involved[m[i].charCodeAt(0) - char_zero].name
        composed.push(name)
        i++
        if (i >= m.length) {
          prev = i
          break outer
        }
        break
      }
      case 'N': case 'A': case 'G': case 'R':
      case 's': case 'y': case 'i': case 'h':
      case 'e': case '!': case 'w': {
        const c = m[i++]
        if (i < m.length && isdigit(m[i])) {
          const index = m[i].charCodeAt(0) - char_zero
          check_bounds(event, index)
          const tribute = event.players_involved[index]
          let text: string
          switch (c) {
            case 'N': text = tribute.uses_pronouns ? tribute.pronouns!.nominative : tribute.raw_name; break
            case 'A': text = tribute.uses_pronouns ? tribute.pronouns!.accusative : tribute.raw_name; break
            case 'G': text = tribute.uses_pronouns ? tribute.pronouns!.genitive : tribute.raw_name + '\u2019s'; break
            case 'R': text = tribute.uses_pronouns ? tribute.pronouns!.reflexive : tribute.raw_name; break
            case 'e': text = tribute.plural ? '' : 'es'; break
            case 's': text = tribute.plural ? '' : 's'; break
            case 'y': text = tribute.plural ? 'y' : 'ies'; break
            case 'i': text = tribute.plural ? 'are' : 'is'; break
            case 'h': text = tribute.plural ? 'have' : 'has'; break
            case '!': text = tribute.plural ? 'aren\'t' : 'isn\'t'; break
            case 'w': text = tribute.plural ? 'were' : 'was'; break
            default: continue
          }
          composed.push(text)
          i++
        } else continue
        break
      }
      default:
        continue
    }
    prev = i
  }
  if (prev < m.length) composed.push(m.slice(prev))
  return composed
}

/** Preview composed narrative without mutating the live scene (uses a throwaway `Event` instance). */
export function formatNarrativePreview(ge: GameEventData, draftMessage: string): FormattedMessage | null {
  const trimmed = draftMessage.trim()
  try {
    const e = new Event(trimmed, [...ge.event.fatalities], [...ge.event.killers], ge.event.type)
    e.players_involved = Math.max(e.players_involved, ge.players_involved.length)
    const synthetic: GameEventData = { event: e, players_involved: ge.players_involved, message: [] }
    synthetic.message = composeGameEventMessage(synthetic)
    return synthetic.message
  } catch {
    return null
  }
}

/** Update scene template text and recompose the formatted message; rolls back on failure. */
export function tryPatchGameEventNarrative(ge: GameEventData, message: string): Error | null {
  const trimmed = message.trim()
  const prevMsg = ge.event.message
  const prevPI = ge.event.players_involved
  const prevFormatted = ge.message
  try {
    ge.event.message = trimmed
    const fromMsg = calculateTributesInvolved(trimmed)
    ge.event.players_involved = Math.max(fromMsg, ge.players_involved.length)
    ge.message = composeGameEventMessage(ge)
    return null
  } catch (e) {
    ge.event.message = prevMsg
    ge.event.players_involved = prevPI
    ge.message = prevFormatted
    return e instanceof Error ? e : new Error(String(e))
  }
}

function dummyTributesForPreviewCount(n: number): Tribute[] {
  const out: Tribute[] = []
  for (let i = 0; i < n; i++) {
    out.push(
      new Tribute(`Tributo ${i + 1}`, {
        uses_pronouns: true,
        pronouns: {
          nominative: 'egli',
          accusative: 'lui',
          genitive: 'suo',
          reflexive: 'sé stesso',
        },
        plural: false,
        image: '',
      }),
    )
  }
  return out
}

/** Preview a stored event template with placeholder tributi (lobby editor). */
export function previewStoredEventNarrative(
  stored: Pick<StoredEvent, 'message' | 'fatalities' | 'killers' | 'type'>,
): FormattedMessage | null {
  const trimmed = stored.message.trim()
  try {
    const type = stored.type?.trim() || 'CUSTOM'
    const e = new Event(trimmed, [...stored.fatalities], [...stored.killers], type)
    const n = Math.max(e.players_involved, 1)
    e.players_involved = n
    const players = dummyTributesForPreviewCount(n)
    const ge: GameEventData = { event: e, players_involved: players, message: [] }
    ge.message = composeGameEventMessage(ge)
    return ge.message
  } catch {
    return null
  }
}

function parsePronounSetting(option: PronounSetting, customStr?: string): {
  pronouns?: TributePronouns
  uses_pronouns: boolean
  plural: boolean
} {
  switch (option) {
    case 'm': return {
      pronouns: { nominative: 'he', accusative: 'him', genitive: 'his', reflexive: 'himself' },
      uses_pronouns: true, plural: false,
    }
    case 'f': return {
      pronouns: { nominative: 'she', accusative: 'her', genitive: 'her', reflexive: 'herself' },
      uses_pronouns: true, plural: false,
    }
    case 'c': return {
      pronouns: { nominative: 'they', accusative: 'them', genitive: 'their', reflexive: 'themself' },
      uses_pronouns: true, plural: true,
    }
    case 'n': return { uses_pronouns: false, plural: false }
    case 'other': {
      const str = (customStr ?? '').replaceAll('//', '\x1f')
      const parts = str.split('/').map((x) => x.replaceAll('\x1f', '//').trim())
      if (parts.length < 4)
        throw new Error('Pronomi personalizzati: usa nom/acc/gen/riflessivo separati da /')
      return {
        pronouns: { nominative: parts[0], accusative: parts[1], genitive: parts[2], reflexive: parts[3] },
        uses_pronouns: true, plural: false,
      }
    }
  }
  return { uses_pronouns: false, plural: false }
}

const enum GameState {
  DEAD,
  NEW_ROUND,
  IN_ROUND,
  THE_FALLEN,
  END_RESULTS,
  END_WINNER,
  END_SUMMARY_FATALITIES,
  END_SUMMARY_STATS,
  END,
}

interface GameEventList {
  bloodbath: Event[]
  day: Event[]
  night: Event[]
  feast: Event[]
}

export function loadDefaultEvents(): EventList<Event> {
  const result: EventList<Event> = {}
  const keys = ['bloodbath', 'day', 'night', 'feast', 'all'] as const
  for (const key of keys) {
    const stored = builtinEvents[key]
    if (stored) {
      result[key] = stored
        .filter((e) => e.enabled)
        .map((e) => new Event(e.message, e.fatalities, e.killers, e.type))
    }
  }
  return result
}

export function loadEventsFromStored(storedEvents: EventList<StoredEvent>): EventList<Event> {
  const result: EventList<Event> = {}
  const keys = ['bloodbath', 'day', 'night', 'feast', 'all'] as const
  for (const key of keys) {
    const stored = storedEvents[key]
    if (stored) {
      result[key] = stored
        .filter((e) => e.enabled)
        .map((e) => new Event(e.message, e.fatalities, e.killers, e.type))
    }
  }
  return result
}

export class Game {
  readonly tributes: Tribute[]
  tributes_alive: Tribute[]
  private tributes_died: Tribute[] = []
  private state: GameState = GameState.NEW_ROUND
  private game_title: string = ''
  last_feast: number = 0
  stage: GameStage = GameStage.BLOODBATH
  readonly fatality_reroll_rate: number
  all_won: boolean = false
  rounds: GameRound[] = []
  days_passed: number = 0
  nights_passed: number = 0
  readonly event_list: GameEventList
  readonly killLimit: KillLimitConfig
  readonly randomModeDeathCap: number
  readonly eventsPerPhaseMin: number
  readonly eventsPerPhaseMax: number

  /** Night phase is resolved in the engine but the UI may still be stepping scenes; next step should open the cannon (caduti). */
  isAwaitingFallenInterstitial(): boolean {
    return this.state === GameState.THE_FALLEN
  }

  constructor(
    tributes: Tribute[],
    events: EventList<Event>,
    fatality_reroll_rate: number = 0.6,
    killLimit?: KillLimitConfig,
  ) {
    this.tributes = [...tributes]
    this.tributes_alive = [...tributes]
    this.fatality_reroll_rate = fatality_reroll_rate
    this.killLimit = killLimit ?? { mode: 'random', value: 1, min: 0, max: 3 }
    this.randomModeDeathCap = killLimit?.randomModeDeathCap ?? 0
    let eMin = killLimit?.eventsPerPhaseMin ?? 4
    let eMax = killLimit?.eventsPerPhaseMax ?? 10
    eMin = Math.max(1, Math.min(eMin, 80))
    eMax = Math.max(1, Math.min(eMax, 80))
    if (eMin > eMax) [eMin, eMax] = [eMax, eMin]
    this.eventsPerPhaseMin = eMin
    this.eventsPerPhaseMax = eMax
    this.event_list = { bloodbath: [], day: [], night: [], feast: [] }
    this.addEvents(events)
    if (simTraceEnabled()) {
      console.info('[HG sim] Tracing on — localStorage DEBUG_HG_SIM=1 and/or ?DEBUG_HG_SIM=1')
    }
  }

  private addEvents(eventOptionList: EventList<Event>) {
    if (eventOptionList.all) {
      for (const list of [this.event_list.bloodbath, this.event_list.day, this.event_list.night, this.event_list.feast]) {
        list.push(...eventOptionList.all.filter((e) => e.enabled))
      }
    }
    for (const property of [GameStage.BLOODBATH, GameStage.DAY, GameStage.NIGHT, GameStage.FEAST]) {
      const events = eventOptionList[property]
      if (events) this.event_list[property].push(...events.filter((e) => e.enabled))
    }
  }

  private tickRenderState(): RenderState {
    switch (this.state) {
      case GameState.NEW_ROUND:
      case GameState.IN_ROUND:
        return RenderState.ROUND_EVENTS
      case GameState.THE_FALLEN:
      case GameState.END_RESULTS:
        return RenderState.ROUND_DEATHS
      case GameState.END_WINNER:
        return RenderState.WINNERS
      case GameState.END_SUMMARY_FATALITIES:
        return RenderState.GAME_DEATHS
      case GameState.END_SUMMARY_STATS:
        return RenderState.STATS
      case GameState.DEAD:
      case GameState.END:
        return RenderState.GAME_OVER
    }
  }

  private advanceGameStage(): GameStage {
    if (this.rounds.length === 0) return GameStage.BLOODBATH
    if (this.stage === GameStage.FEAST || this.stage === GameStage.BLOODBATH) {
      this.days_passed++
      return GameStage.DAY
    }
    if (this.stage === GameStage.NIGHT) {
      const roundsSinceFeast = this.rounds.length - this.last_feast
      if (roundsSinceFeast >= 5) {
        let chance = 0
        if (roundsSinceFeast >= 7) chance = 0.5 * (roundsSinceFeast - 4)
        else if (roundsSinceFeast >= 6) chance = 0.33 * (roundsSinceFeast - 4)
        else chance = 0.25 * (roundsSinceFeast - 4)
        if (Math.random() <= chance) {
          this.last_feast = this.rounds.length
          return GameStage.FEAST
        }
      }
      this.days_passed++
      return GameStage.DAY
    }
    this.nights_passed++
    return GameStage.NIGHT
  }

  private checkGameShouldEnd(): boolean {
    if (this.tributes_alive.length < 2 || this.all_won) {
      this.state = GameState.END_RESULTS
      return true
    }
    return false
  }

  private computeKillTarget(): number {
    const { mode, value, min, max } = this.killLimit
    switch (mode) {
      case 'exact':
        return value
      case 'range':
        return random(min, max + 1)
      case 'random':
      default:
        return -1
    }
  }

  /** Lethal events allowed this phase: exact/range target, or random-mode cap; -1 = unlimited */
  private getDeathCapForRound(): number {
    const kt = this.computeKillTarget()
    if (kt >= 0) return kt
    if (this.randomModeDeathCap > 0) return this.randomModeDeathCap
    return -1
  }

  private requirementsSatisfied(
    event: Event,
    tributesLeft: number,
    lethalEventsThisRound: number,
    deathCap: number,
  ): boolean {
    if (event.players_involved > tributesLeft) return false
    if (deathCap >= 0 && event.fatalities.length > 0) {
      if (lethalEventsThisRound >= deathCap) return false
    }
    if (event.fatalities.length && Math.random() < this.fatality_reroll_rate) return false
    return true
  }

  private pickEventForWindow(
    eventList: Event[],
    tributesLeft: number,
    lethalEventsThisRound: number,
    deathCap: number,
  ): Event | null {
    const eligible = eventList.filter((event) =>
      this.requirementsSatisfied(event, tributesLeft, lethalEventsThisRound, deathCap),
    )
    if (!eligible.length) return null
    return eligible[random(0, eligible.length)]
  }

  private doRoundImpl() {
    let tributesLeft = this.tributes_alive.length
    let tributesAlive = tributesLeft
    let currentTribute = 0

    if (this.stage === GameStage.DAY) this.game_title = `Day ${this.days_passed}`
    else if (this.stage === GameStage.NIGHT) this.game_title = `Night ${this.nights_passed}`
    else this.game_title = titleCase(this.stage)

    const round: GameRound = {
      game_events: [],
      died_this_round: [],
      index: this.rounds.length,
      stage: this.stage,
    }
    this.rounds.push(round)
    shuffle(this.tributes_alive)

    let eventList: Event[]
    switch (this.stage) {
      case GameStage.BLOODBATH: eventList = this.event_list.bloodbath; break
      case GameStage.DAY: eventList = this.event_list.day; break
      case GameStage.NIGHT: eventList = this.event_list.night; break
      case GameStage.FEAST: eventList = this.event_list.feast; break
      default: throw Error(`Invalid game stage`)
    }

    if (!eventList.length) simDebug('phase using fallback scenes — no events for stage', this.stage, 'round#', round.index)
    let fatalitiesThisRound = 0
    let lethalEventsThisRound = 0
    const deathCap = this.getDeathCapForRound()
    const targetEventCount = random(this.eventsPerPhaseMin, this.eventsPerPhaseMax + 1)
    simDebug(`phase ${this.stage} round#${round.index}`, 'shuffle:', this.tributes_alive.map((t) => t.raw_name), {
      deathCap,
      targetEventCount,
    })

    while (tributesLeft) {
      const tributes_involved: Tribute[] = []
      const event =
        this.pickEventForWindow(eventList, tributesLeft, lethalEventsThisRound, deathCap)
        ?? buildFallbackPhaseEvent(this.stage)
      tributesLeft -= event.players_involved

      const windowNames: string[] = []
      for (let i = 0; i < event.players_involved; i++) {
        const t = this.tributes_alive[currentTribute + i]
        windowNames.push(t ? t.raw_name : `<?@${currentTribute + i}>`)
      }

      let eventHadFatality = false
      for (const f of event.fatalities) {
        const abs = currentTribute + f
        if (f < 0 || f >= event.players_involved) {
          simWarn('fatality index outside window', { f, players_involved: event.players_involved, msg: event.message })
        }
        if (abs < 0 || abs >= this.tributes_alive.length) {
          simWarn('fatality OOB', { abs, len: this.tributes_alive.length, msg: event.message })
          continue
        }
        const victim = this.tributes_alive[abs]
        if (victim.died_in_round !== undefined) {
          simWarn('fatality on already-eliminated tribute', { name: victim.raw_name, msg: event.message })
        }
        simDebug('KILL', {
          victim: victim.raw_name,
          windowIndex: f,
          arrayIndex: abs,
          window: windowNames,
          eventSnippet: event.message.slice(0, 100),
        })
        victim.died_in_round = round
        round.died_this_round.push(victim)
        tributesAlive--
        fatalitiesThisRound++
        eventHadFatality = true
      }
      if (eventHadFatality) lethalEventsThisRound++

      for (const k of resolvedKillerIndices(event)) {
        if (k < 0 || k >= event.players_involved) {
          simWarn('killer index outside window', { k, players_involved: event.players_involved, msg: event.message })
        }
        const abs = currentTribute + k
        if (abs >= 0 && abs < this.tributes_alive.length) {
          this.tributes_alive[abs].kills += event.fatalities.length
        }
      }

      const lastSlot = currentTribute + event.players_involved
      for (; currentTribute < lastSlot; currentTribute++) {
        tributes_involved.push(this.tributes_alive[currentTribute])
      }

      const gameEvent: GameEventData = {
        event,
        players_involved: tributes_involved,
        message: [],
      }
      gameEvent.message = composeGameEventMessage(gameEvent)
      round.game_events.push(gameEvent)
      simDebug(
        `scene ${round.game_events.length}/${targetEventCount}`,
        'text:',
        gameEvent.message.map((p) => (typeof p === 'string' ? p : p.value)).join(''),
      )
      if (tributesAlive < 2) break
    }

    simDebug('phase end', round.stage, 'eliminated:', round.died_this_round.map((t) => t.raw_name), {
      scenes: round.game_events.length,
      fatalitiesThisRound,
      lethalEventsThisRound,
    })
    this.tributes_alive = this.tributes_alive.filter((t) => t.died_in_round === undefined)
    this.tributes_died.push(...round.died_this_round)
  }

  private doRound() {
    this.stage = this.advanceGameStage()
    this.doRoundImpl()
    if (!this.checkGameShouldEnd()) {
      this.state = GameState.THE_FALLEN
    }
  }

  private startNewRound() {
    this.tributes_died = []
  }

  advanceGame(): GameRenderStateData | Error {
    try {
      const renderState = this.tickRenderState()

      switch (this.state) {
        case GameState.NEW_ROUND:
          this.state = GameState.IN_ROUND
          this.startNewRound()
          this.doRound()
          break
        case GameState.IN_ROUND:
          this.doRound()
          break
        case GameState.THE_FALLEN:
          this.game_title = 'The Fallen'
          this.state = GameState.NEW_ROUND
          break
        case GameState.END_RESULTS:
          this.game_title = 'The Fallen'
          this.state = GameState.END_WINNER
          break
        case GameState.END_WINNER:
          this.game_title = 'The Games Have Ended'
          this.state = GameState.END_SUMMARY_FATALITIES
          break
        case GameState.END_SUMMARY_FATALITIES:
          this.game_title = 'Deaths'
          this.state = GameState.END_SUMMARY_STATS
          break
        case GameState.END_SUMMARY_STATS:
          this.game_title = this.tributes_alive.length ? 'Winners' : 'The Fallen'
          this.state = GameState.END
          break
        case GameState.END:
          break
        default:
          this.state = GameState.DEAD
          throw new Error('Internal error: invalid game state')
      }

      return {
        state: renderState,
        game_title: this.game_title,
        rounds: this.rounds,
        tributes_died:
          this.state === GameState.END
            ? this.tributes.filter((t) => t.died_in_round !== undefined)
            : this.tributes_died,
        tributes_alive: this.tributes_alive,
      }
    } catch (e) {
      return e as Error
    }
  }

  static createTributes(options: TributeCharacterSelectOptions[]): Tribute[] | Error {
    try {
      return options.map((character) => {
        if (character.name === '') throw Error('Il nome del personaggio non può essere vuoto!')
        const pronouns = parsePronounSetting(character.pronoun_option, character.custom_pronouns)
        return new Tribute(character.name, {
          pronouns: pronouns.pronouns,
          uses_pronouns: pronouns.uses_pronouns,
          plural: pronouns.plural,
          image: character.image_url ?? '',
        })
      })
    } catch (e) {
      return e as Error
    }
  }
}
