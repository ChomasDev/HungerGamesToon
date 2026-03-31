import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './App.css'
import { RenderState } from './engine/types'
import { clearLocalGameDb, loadPersistedAppState, savePersistedAppState } from './db/localGameDb'
import { useGameStore, type GameSettings, type ThemeConfig } from './store/gameStore'
import TopBar from './components/TopBar'
import RosterBuilder from './components/RosterBuilder'
import RosterSidebar from './components/RosterSidebar'
import BroadcastStage from './components/BroadcastStage'
import ControlRail from './components/ControlRail'
import ResultsScreen from './components/ResultsScreen'
import CustomizationDrawer from './components/CustomizationDrawer'

function App() {
  const { state, dispatch } = useGameStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [persistReady, setPersistReady] = useState(false)
  const [roundEventIndex, setRoundEventIndex] = useState(0)
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

  const hideControlPrimaryDuringRound =
    state.renderState?.state === RenderState.ROUND_EVENTS && !state.isAutoPlaying

  return (
    <div
      className="app-shell"
      data-theme={themeAttr}
      data-motion={motionAttr}
      style={{ '--accent': state.theme.accent, '--accent-glow': `${state.theme.accent}4d` } as React.CSSProperties}
    >
      <TopBar
        seasonTitle={state.seasonTitle}
        renderState={state.renderState}
        totalTributes={state.game?.tributes.length ?? state.tributes.length}
        onSettingsClick={() => setDrawerOpen(true)}
        onAbort={handleAbort}
        showGameControls={state.screen === 'game'}
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
          onSetCustomEvents={(events) => dispatch({ type: 'SET_CUSTOM_EVENTS', events })}
          onError={(error) => dispatch({ type: 'SET_ERROR', error })}
        />
      )}

      {state.screen === 'game' && state.renderState && state.game && (
        <div className="game-layout">
          <RosterSidebar
            allTributes={state.game.tributes}
            alive={state.renderState.tributes_alive}
          />
          <BroadcastStage
            renderState={state.renderState}
            eventIndex={safeEventIndex}
            onEventIndexChange={setRoundEventIndex}
            onAdvanceGame={() => stepGameForward()}
          />
          <ControlRail
            onProceed={handleProceed}
            onAbort={handleAbort}
            isAutoPlaying={state.isAutoPlaying}
            autoPlaySpeed={state.autoPlaySpeed}
            onToggleAutoPlay={handleToggleAutoPlay}
            onSpeedChange={(speed) => dispatch({ type: 'SET_AUTO_PLAY', playing: state.isAutoPlaying, speed })}
            hidePrimaryProceed={hideControlPrimaryDuringRound}
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
