import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { RenderState } from './engine/types'
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
  const [roundEventIndex, setRoundEventIndex] = useState(0)
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const roundEventIndexRef = useRef(0)
  roundEventIndexRef.current = roundEventIndex

  const roundsLen = state.renderState?.rounds.length ?? 0
  useEffect(() => {
    setRoundEventIndex(0)
  }, [roundsLen])

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
    if (!rs) return
    if (rs.state === RenderState.ROUND_EVENTS) {
      const cur = rs.rounds[rs.rounds.length - 1]
      const n = cur?.game_events.length ?? 0
      if (n === 0) {
        dispatch({ type: 'ADVANCE_GAME' })
        return
      }
      if (roundEventIndexRef.current < n - 1) {
        setRoundEventIndex((i) => i + 1)
        return
      }
    }
    dispatch({ type: 'ADVANCE_GAME' })
  }, [state.renderState, dispatch])

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
            eventIndex={roundEventIndex}
            onEventIndexChange={setRoundEventIndex}
            onAdvanceGame={() => dispatch({ type: 'ADVANCE_GAME' })}
          />
          <ControlRail
            onProceed={handleProceed}
            onAbort={handleAbort}
            isAutoPlaying={state.isAutoPlaying}
            autoPlaySpeed={state.autoPlaySpeed}
            onToggleAutoPlay={handleToggleAutoPlay}
            onSpeedChange={(speed) => dispatch({ type: 'SET_AUTO_PLAY', playing: state.isAutoPlaying, speed })}
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
