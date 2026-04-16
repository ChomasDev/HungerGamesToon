import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { RenderState, resolvedKillerIndices, type Tribute } from './engine/types'
import { clearLocalGameDb, loadPersistedAppState, savePersistedAppState } from './db/localGameDb'
import { translateGameTitle } from './i18n/it'
import { useGameStore, type GameSettings, type ThemeConfig } from './store/gameStore'
import TopBar from './components/TopBar'
import RosterBuilder from './components/RosterBuilder'
import RosterSidebar from './components/RosterSidebar'
import BroadcastStage from './components/BroadcastStage'
import ControlRail from './components/ControlRail'
import ResultsScreen from './components/ResultsScreen'
import CustomizationDrawer from './components/CustomizationDrawer'

const SIDEBAR_OPEN_KEY = 'hg.sidebarOpen'
const WIDE_VIEWPORT_QUERY = '(min-width: 1100px)'
const NARROW_VIEWPORT_QUERY = '(max-width: 699px)'

function readInitialSidebarOpen(): boolean {
  if (typeof window === 'undefined') return true
  const stored = window.localStorage.getItem(SIDEBAR_OPEN_KEY)
  if (stored === '1') return true
  if (stored === '0') return false
  return window.matchMedia(WIDE_VIEWPORT_QUERY).matches
}

function App() {
  const { state, dispatch } = useGameStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [persistReady, setPersistReady] = useState(false)
  const [roundEventIndex, setRoundEventIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(readInitialSidebarOpen)
  const [isNarrowViewport, setIsNarrowViewport] = useState<boolean>(() =>
    typeof window === 'undefined' ? false : window.matchMedia(NARROW_VIEWPORT_QUERY).matches,
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_OPEN_KEY, sidebarOpen ? '1' : '0')
    } catch {
      /* ignore quota / privacy errors */
    }
  }, [sidebarOpen])

  useEffect(() => {
    const mq = window.matchMedia(NARROW_VIEWPORT_QUERY)
    const onChange = (e: MediaQueryListEvent) => setIsNarrowViewport(e.matches)
    setIsNarrowViewport(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const roundEventIndexRef = useRef(0)
  roundEventIndexRef.current = roundEventIndex

  /** Engine round identity; when this changes, scene index must reset before paint to avoid an extra ADVANCE_GAME. */
  const currentRoundIndex = state.renderState?.rounds[state.renderState.rounds.length - 1]?.index ?? -1
  useLayoutEffect(() => {
    setRoundEventIndex(0)
  }, [currentRoundIndex])

  useEffect(() => {
    let cancelled = false
    loadPersistedAppState()
      .then((data) => {
        if (cancelled || !data) return
        dispatch({ type: 'HYDRATE', payload: data })
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setPersistReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [dispatch])

  useEffect(() => {
    if (!persistReady) return
    const t = window.setTimeout(() => {
      savePersistedAppState({
        seasonTitle: state.seasonTitle,
        theme: state.theme,
        gameSettings: state.gameSettings,
        autoPlaySpeed: state.autoPlaySpeed,
        tributes: state.tributes,
        customEvents: state.customEvents,
      }).catch(() => {})
    }, 480)
    return () => window.clearTimeout(t)
  }, [
    persistReady,
    state.tributes,
    state.seasonTitle,
    state.theme,
    state.gameSettings,
    state.autoPlaySpeed,
    state.customEvents,
  ])

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }
    dispatch({ type: 'SET_AUTO_PLAY', playing: false })
  }, [dispatch])

  const startAutoPlay = useCallback(() => {
    stopAutoPlay()
    dispatch({ type: 'SET_AUTO_PLAY', playing: true })
    autoPlayRef.current = setInterval(() => {
      stepGameForwardRef.current()
    }, state.autoPlaySpeed)
  }, [dispatch, state.autoPlaySpeed, stopAutoPlay])

  useEffect(() => {
    if (state.screen !== 'game') {
      stopAutoPlay()
    }
  }, [state.screen, stopAutoPlay])

  useEffect(() => {
    if (state.isAutoPlaying && state.screen === 'game') {
      stopAutoPlay()
      dispatch({ type: 'SET_AUTO_PLAY', playing: true })
      autoPlayRef.current = setInterval(() => {
        stepGameForwardRef.current()
      }, state.autoPlaySpeed)
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [state.autoPlaySpeed])

  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [])

  const stepGameForward = useCallback(() => {
    const rs = state.renderState
    const game = state.game
    if (!rs) return
    if (rs.state === RenderState.ROUND_EVENTS) {
      const cur = rs.rounds[rs.rounds.length - 1]
      const n = cur?.game_events.length ?? 0
      if (n === 0) {
        dispatch({ type: 'ADVANCE_GAME' })
        return
      }
      let idx = roundEventIndexRef.current
      const fallenPending = game?.isAwaitingFallenInterstitial?.() ?? false
      if (idx >= n) {
        if (fallenPending) {
          dispatch({ type: 'ADVANCE_GAME' })
          return
        }
        setRoundEventIndex(0)
        return
      }
      if (idx < n - 1) {
        setRoundEventIndex((i) => i + 1)
        return
      }
    }
    dispatch({ type: 'ADVANCE_GAME' })
  }, [state.renderState, state.game, dispatch])

  const stepGameForwardRef = useRef(stepGameForward)
  stepGameForwardRef.current = stepGameForward

  const handleProceed = useCallback(() => {
    if (state.isAutoPlaying) {
      stopAutoPlay()
      return
    }
    stepGameForward()
  }, [state.isAutoPlaying, stopAutoPlay, stepGameForward])

  function handleToggleAutoPlay() {
    if (state.isAutoPlaying) {
      stopAutoPlay()
    } else {
      startAutoPlay()
    }
  }

  function handleAbort() {
    stopAutoPlay()
    dispatch({ type: 'ABORT_GAME' })
  }

  function handleThemeChange(updates: Partial<ThemeConfig>) {
    dispatch({ type: 'SET_THEME', theme: updates })
  }

  const themeAttr = state.theme.preset
  const motionAttr = state.theme.motionLevel

  const lastRound = state.renderState?.rounds[state.renderState.rounds.length - 1]
  const lastRoundEventCount = lastRound?.game_events.length ?? 0
  const safeEventIndex =
    state.renderState?.state === RenderState.ROUND_EVENTS && lastRoundEventCount > 0
      ? Math.min(roundEventIndex, lastRoundEventCount - 1)
      : roundEventIndex

  /**
   * During phase playback: roster “alive” and kill badges stay in sync with scenes already reached
   * (deaths and kill credit from later scenes in the same phase are hidden).
   */
  const { rosterAlive, rosterKillSubtrahend } = useMemo(() => {
    const emptySub = new Map<Tribute, number>()
    const rs = state.renderState
    if (!rs) return { rosterAlive: [] as Tribute[], rosterKillSubtrahend: emptySub }

    if (rs.state !== RenderState.ROUND_EVENTS) {
      return { rosterAlive: rs.tributes_alive, rosterKillSubtrahend: emptySub }
    }

    const round = rs.rounds[rs.rounds.length - 1]
    if (!round || round.game_events.length === 0) {
      return { rosterAlive: rs.tributes_alive, rosterKillSubtrahend: emptySub }
    }

    const idx = Math.min(roundEventIndex, round.game_events.length - 1)
    const revealedDead = new Set<Tribute>()
    for (let i = 0; i <= idx; i++) {
      const ge = round.game_events[i]!
      const n = ge.event.players_involved
      for (const f of ge.event.fatalities) {
        if (f >= 0 && f < n && f < ge.players_involved.length) {
          revealedDead.add(ge.players_involved[f]!)
        }
      }
    }
    const notYetRevealed = round.died_this_round.filter((t) => !revealedDead.has(t))
    const alive = [...rs.tributes_alive, ...notYetRevealed]

    const rosterKillSubtrahend = new Map<Tribute, number>()
    for (let j = idx + 1; j < round.game_events.length; j++) {
      const ge = round.game_events[j]!
      const add = ge.event.fatalities.length
      if (add === 0) continue
      const n = ge.event.players_involved
      for (const k of resolvedKillerIndices(ge.event)) {
        if (k < 0 || k >= n || k >= ge.players_involved.length) continue
        const killer = ge.players_involved[k]!
        rosterKillSubtrahend.set(killer, (rosterKillSubtrahend.get(killer) ?? 0) + add)
      }
    }

    return { rosterAlive: alive, rosterKillSubtrahend }
  }, [state.renderState, roundEventIndex])

  /** Top-bar phase title + counter (ROUND_EVENTS only); moved out of the stage so the center shows just the card. */
  const phaseTitle =
    state.screen === 'game' && state.renderState?.state === RenderState.ROUND_EVENTS
      ? translateGameTitle(state.renderState.game_title)
      : undefined
  const phaseCounterLabel = (() => {
    if (state.screen !== 'game') return undefined
    if (state.renderState?.state !== RenderState.ROUND_EVENTS) return undefined
    const curr = state.renderState.rounds[state.renderState.rounds.length - 1]
    const n = curr?.game_events.length ?? 0
    return n === 0 ? '—' : `${Math.min(roundEventIndex, n - 1) + 1} / ${n}`
  })()

  return (
    <div
      className="app-shell"
      data-theme={themeAttr}
      data-motion={motionAttr}
      data-screen={state.screen}
      style={{ '--accent': state.theme.accent, '--accent-glow': `${state.theme.accent}4d` } as React.CSSProperties}
    >
      <TopBar
        seasonTitle={state.seasonTitle}
        renderState={state.renderState}
        totalTributes={state.game?.tributes.length ?? state.tributes.length}
        displayAliveCount={state.screen === 'game' && state.renderState ? rosterAlive.length : undefined}
        onSettingsClick={() => setDrawerOpen(true)}
        onAbort={handleAbort}
        showGameControls={state.screen === 'game'}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        phaseTitle={phaseTitle}
        phaseCounterLabel={phaseCounterLabel}
      />

      {state.screen === 'lobby' && (
        <RosterBuilder
          tributes={state.tributes}
          seasonTitle={state.seasonTitle}
          customEvents={state.customEvents}
          onSeasonTitleChange={(title) => dispatch({ type: 'SET_SEASON_TITLE', title })}
          onAddTribute={() => dispatch({ type: 'ADD_TRIBUTE' })}
          onRemoveTribute={(id) => dispatch({ type: 'REMOVE_TRIBUTE', id })}
          onUpdateTribute={(id, updates) => dispatch({ type: 'UPDATE_TRIBUTE', id, updates })}
          onStartGame={() => dispatch({ type: 'START_GAME' })}
          onSetTributes={(tributes) => dispatch({ type: 'SET_TRIBUTES', tributes })}
          onAppendTributes={(tributes) => dispatch({ type: 'APPEND_TRIBUTES', tributes })}
          onSetCustomEvents={(events) => dispatch({ type: 'SET_CUSTOM_EVENTS', events })}
          onError={(error) => dispatch({ type: 'SET_ERROR', error })}
        />
      )}

      {state.screen === 'game' && state.renderState && state.game && (
        <div
          className="game-layout"
          data-sidebar={sidebarOpen ? 'open' : 'closed'}
          data-viewport={isNarrowViewport ? 'narrow' : 'wide'}
        >
          {isNarrowViewport ? (
            <RosterSidebar
              allTributes={state.game.tributes}
              alive={rosterAlive}
              killCountSubtrahend={rosterKillSubtrahend}
              variant="drawer"
              isOpen={sidebarOpen}
              onClose={closeSidebar}
            />
          ) : (
            <RosterSidebar
              allTributes={state.game.tributes}
              alive={rosterAlive}
              killCountSubtrahend={rosterKillSubtrahend}
              variant={sidebarOpen ? 'full' : 'rail'}
              isOpen
              onClose={closeSidebar}
            />
          )}
          <BroadcastStage
            renderState={state.renderState}
            eventIndex={safeEventIndex}
            onEventIndexChange={setRoundEventIndex}
            onAdvanceGame={() => stepGameForward()}
            onUpdateSceneNarrative={(payload) => dispatch({ type: 'UPDATE_SCENE_NARRATIVE', payload })}
          />
          <ControlRail
            onProceed={handleProceed}
            isAutoPlaying={state.isAutoPlaying}
            autoPlaySpeed={state.autoPlaySpeed}
            onToggleAutoPlay={handleToggleAutoPlay}
            onSpeedChange={(speed) => dispatch({ type: 'SET_AUTO_PLAY', playing: state.isAutoPlaying, speed })}
            renderState={state.renderState}
            eventIndex={safeEventIndex}
            onEventIndexChange={setRoundEventIndex}
            onAdvance={() => stepGameForward()}
          />
        </div>
      )}

      {state.screen === 'results' && state.game && (
        <ResultsScreen
          game={state.game}
          seasonTitle={state.seasonTitle}
          onPlayAgain={() => dispatch({ type: 'START_GAME' })}
          onBackToLobby={() => dispatch({ type: 'ABORT_GAME' })}
        />
      )}

      <CustomizationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        theme={state.theme}
        onThemeChange={handleThemeChange}
        gameSettings={state.gameSettings}
        onGameSettingsChange={(s: Partial<GameSettings>) => dispatch({ type: 'SET_GAME_SETTINGS', settings: s })}
        onEraseLocalData={async () => {
          await clearLocalGameDb()
          dispatch({ type: 'RESET_TO_DEFAULTS' })
        }}
      />

      {state.error && (
        <div className="error-toast" onClick={() => dispatch({ type: 'SET_ERROR', error: null })}>
          {state.error}
        </div>
      )}
    </div>
  )
}

export default App
