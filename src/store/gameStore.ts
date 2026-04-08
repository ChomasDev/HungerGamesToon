import { useReducer } from 'react'
import { it } from '../i18n/it'
import {
  Game,
  loadDefaultEvents,
  loadEventsFromStored,
  tryPatchGameEventNarrative,
  type KillLimitConfig,
} from '../engine/game'
import {
  PronounSetting,
  RenderState,
  type EventList,
  type GameRenderStateData,
  type StoredEvent,
  type TributeCharacterSelectOptions,
} from '../engine/types'

let nextId = 0
export function makeId(): string {
  return `tribute-${++nextId}-${Date.now()}`
}

export type AppScreen = 'lobby' | 'game' | 'results'

export interface ThemeConfig {
  preset: 'toon' | 'dark' | 'ember' | 'neon' | 'ice'
  accent: string
  motionLevel: 'full' | 'reduced'
  density: 'compact' | 'roomy'
}

export type KillsPerRoundMode = 'random' | 'exact' | 'range'

export interface GameSettings {
  killsPerRoundMode: KillsPerRoundMode
  killsPerRoundValue: number
  killsPerRoundMin: number
  killsPerRoundMax: number
  /** Fully Random only: max lethal events per phase; 0 = unlimited */
  randomRoundDeathCap: number
  /** Random inclusive bounds for base scene count per phase; more scenes may be added so everyone appears. */
  eventsPerPhaseMin: number
  eventsPerPhaseMax: number
}

export interface GameStore {
  screen: AppScreen
  tributes: TributeCharacterSelectOptions[]
  seasonTitle: string
  game: Game | null
  renderState: GameRenderStateData | null
  error: string | null
  theme: ThemeConfig
  autoPlaySpeed: number
  isAutoPlaying: boolean
  customEvents: EventList<StoredEvent> | null
  gameSettings: GameSettings
}

export type HydratePayload = Partial<
  Pick<
    GameStore,
    'tributes' | 'seasonTitle' | 'theme' | 'gameSettings' | 'customEvents' | 'autoPlaySpeed'
  >
>

type GameAction =
  | { type: 'HYDRATE'; payload: HydratePayload }
  | { type: 'RESET_TO_DEFAULTS' }
  | { type: 'SET_TRIBUTES'; tributes: TributeCharacterSelectOptions[] }
  | { type: 'APPEND_TRIBUTES'; tributes: TributeCharacterSelectOptions[] }
  | { type: 'ADD_TRIBUTE' }
  | { type: 'REMOVE_TRIBUTE'; id: string }
  | { type: 'UPDATE_TRIBUTE'; id: string; updates: Partial<TributeCharacterSelectOptions> }
  | { type: 'REORDER_TRIBUTES'; from: number; to: number }
  | { type: 'SET_SEASON_TITLE'; title: string }
  | { type: 'START_GAME' }
  | { type: 'ADVANCE_GAME' }
  | { type: 'ABORT_GAME' }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_THEME'; theme: Partial<ThemeConfig> }
  | { type: 'SET_SCREEN'; screen: AppScreen }
  | { type: 'SET_AUTO_PLAY'; playing: boolean; speed?: number }
  | { type: 'SET_CUSTOM_EVENTS'; events: EventList<StoredEvent> | null }
  | { type: 'SET_GAME_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'UPDATE_SCENE_NARRATIVE'; payload: { roundIndex: number; sceneIndex: number; message: string } }

export function createInitialGameStore(): GameStore {
  return {
    screen: 'lobby',
    tributes: [
      { id: makeId(), name: 'Distretto 1', pronoun_option: PronounSetting.Masculine },
      { id: makeId(), name: 'Distretto 2', pronoun_option: PronounSetting.Feminine },
      { id: makeId(), name: 'Distretto 3', pronoun_option: PronounSetting.Common },
      { id: makeId(), name: 'Distretto 4', pronoun_option: PronounSetting.Masculine },
      { id: makeId(), name: 'Distretto 5', pronoun_option: PronounSetting.Feminine },
      { id: makeId(), name: 'Distretto 6', pronoun_option: PronounSetting.Common },
      { id: makeId(), name: 'Distretto 7', pronoun_option: PronounSetting.Masculine },
      { id: makeId(), name: 'Distretto 8', pronoun_option: PronounSetting.Feminine },
    ],
    seasonTitle: '74ª Edizione degli Hunger Games',
    game: null,
    renderState: null,
    error: null,
    theme: {
      preset: 'toon',
      accent: '#ff3d5c',
      motionLevel: 'full',
      density: 'roomy',
    },
    autoPlaySpeed: 2000,
    isAutoPlaying: false,
    customEvents: null,
    gameSettings: {
      killsPerRoundMode: 'random',
      killsPerRoundValue: 1,
      killsPerRoundMin: 0,
      killsPerRoundMax: 3,
      randomRoundDeathCap: 5,
      eventsPerPhaseMin: 4,
      eventsPerPhaseMax: 10,
    },
  }
}

const initialState: GameStore = createInitialGameStore()

function gameReducer(state: GameStore, action: GameAction): GameStore {
  switch (action.type) {
    case 'HYDRATE': {
      const p = action.payload
      if (p.tributes) {
        for (const t of state.tributes) {
          if (t.image_url?.startsWith('blob:')) {
            URL.revokeObjectURL(t.image_url)
          }
        }
      }
      return {
        ...state,
        tributes: p.tributes ?? state.tributes,
        seasonTitle: p.seasonTitle ?? state.seasonTitle,
        theme: p.theme ? { ...state.theme, ...p.theme } : state.theme,
        gameSettings: p.gameSettings ? { ...state.gameSettings, ...p.gameSettings } : state.gameSettings,
        customEvents: p.customEvents !== undefined ? p.customEvents : state.customEvents,
        autoPlaySpeed: p.autoPlaySpeed ?? state.autoPlaySpeed,
      }
    }

    case 'RESET_TO_DEFAULTS':
      for (const t of state.tributes) {
        if (t.image_url?.startsWith('blob:')) {
          URL.revokeObjectURL(t.image_url)
        }
      }
      return createInitialGameStore()

    case 'SET_TRIBUTES':
      for (const t of state.tributes) {
        if (t.image_url?.startsWith('blob:')) {
          URL.revokeObjectURL(t.image_url)
        }
      }
      return { ...state, tributes: action.tributes }

    case 'APPEND_TRIBUTES':
      return { ...state, tributes: [...state.tributes, ...action.tributes] }

    case 'ADD_TRIBUTE':
      return {
        ...state,
        tributes: [
          ...state.tributes,
          {
            id: makeId(),
            name: `Giocatore ${state.tributes.length + 1}`,
            pronoun_option: PronounSetting.Common,
          },
        ],
      }

    case 'REMOVE_TRIBUTE': {
      const removed = state.tributes.find((t) => t.id === action.id)
      if (removed?.image_url?.startsWith('blob:')) {
        URL.revokeObjectURL(removed.image_url)
      }
      return {
        ...state,
        tributes: state.tributes.filter((t) => t.id !== action.id),
      }
    }

    case 'UPDATE_TRIBUTE': {
      const prev = state.tributes.find((t) => t.id === action.id)
      if (!prev) return state
      const merged = { ...prev, ...action.updates }
      if (prev.image_url?.startsWith('blob:') && merged.image_url !== prev.image_url) {
        URL.revokeObjectURL(prev.image_url)
      }
      return {
        ...state,
        tributes: state.tributes.map((t) => (t.id === action.id ? merged : t)),
      }
    }

    case 'REORDER_TRIBUTES': {
      const tributes = [...state.tributes]
      const [moved] = tributes.splice(action.from, 1)
      tributes.splice(action.to, 0, moved)
      return { ...state, tributes }
    }

    case 'SET_SEASON_TITLE':
      return { ...state, seasonTitle: action.title }

    case 'START_GAME': {
      if (state.tributes.length < 2) {
        return { ...state, error: it.errorNeedTwoTributes }
      }
      const eventList = state.customEvents
        ? loadEventsFromStored(state.customEvents)
        : loadDefaultEvents()
      const tributeResult = Game.createTributes(state.tributes)
      if (tributeResult instanceof Error) {
        return { ...state, error: tributeResult.message }
      }
      const killLimit: KillLimitConfig = {
        mode: state.gameSettings.killsPerRoundMode,
        value: state.gameSettings.killsPerRoundValue,
        min: state.gameSettings.killsPerRoundMin,
        max: state.gameSettings.killsPerRoundMax,
        randomModeDeathCap: state.gameSettings.randomRoundDeathCap,
        eventsPerPhaseMin: state.gameSettings.eventsPerPhaseMin,
        eventsPerPhaseMax: state.gameSettings.eventsPerPhaseMax,
      }
      const game = new Game(tributeResult, eventList, undefined, killLimit)
      const renderState = game.advanceGame()
      if (renderState instanceof Error) {
        return { ...state, error: renderState.message }
      }
      return {
        ...state,
        game,
        renderState,
        screen: 'game',
        error: null,
        isAutoPlaying: false,
      }
    }

    case 'ADVANCE_GAME': {
      if (!state.game) return state
      const renderState = state.game.advanceGame()
      if (renderState instanceof Error) {
        return { ...state, error: renderState.message }
      }
      if (renderState.state === RenderState.GAME_OVER) {
        return {
          ...state,
          renderState,
          screen: 'results',
          isAutoPlaying: false,
        }
      }
      return { ...state, renderState }
    }

    case 'ABORT_GAME':
      return {
        ...state,
        game: null,
        renderState: null,
        screen: 'lobby',
        isAutoPlaying: false,
      }

    case 'SET_ERROR':
      return { ...state, error: action.error }

    case 'SET_THEME':
      return { ...state, theme: { ...state.theme, ...action.theme } }

    case 'SET_SCREEN':
      return { ...state, screen: action.screen }

    case 'SET_AUTO_PLAY':
      return {
        ...state,
        isAutoPlaying: action.playing,
        autoPlaySpeed: action.speed ?? state.autoPlaySpeed,
      }

    case 'SET_CUSTOM_EVENTS':
      return { ...state, customEvents: action.events }

    case 'SET_GAME_SETTINGS':
      return { ...state, gameSettings: { ...state.gameSettings, ...action.settings } }

    case 'UPDATE_SCENE_NARRATIVE': {
      const { game, renderState } = state
      if (!game || !renderState) return state
      const { roundIndex, sceneIndex, message } = action.payload
      const round = renderState.rounds[roundIndex]
      const ge = round?.game_events[sceneIndex]
      if (!ge) return state
      const err = tryPatchGameEventNarrative(ge, message)
      if (err) return { ...state, error: err.message }
      return { ...state, renderState: { ...renderState, rounds: [...renderState.rounds] } }
    }

    default:
      return state
  }
}

export function useGameStore() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  return { state, dispatch }
}
