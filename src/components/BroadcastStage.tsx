import { useCallback, useEffect } from 'react'
import { RenderState, type GameRenderStateData } from '../engine/types'
import { formatRoundDeathHeader, it, translateGameTitle } from '../i18n/it'
import EventCard from './EventCard'

interface BroadcastStageProps {
  renderState: GameRenderStateData
  eventIndex: number
  onEventIndexChange: (index: number) => void
  onAdvanceGame?: () => void
  /** Jump to the next in-game morning (skips remaining advances until `days_passed` increments). */
  onSkipToNextDay?: () => void
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function StageNextButton({ onAdvance }: { onAdvance?: () => void }) {
  return (
    <div className="stage-continue-nav">
      <button type="button" className="btn btn-primary event-nav-btn" onClick={() => onAdvance?.()} disabled={!onAdvance}>
        {it.stageNext}
      </button>
    </div>
  )
}

export default function BroadcastStage({
  renderState,
  eventIndex,
  onEventIndexChange,
  onAdvanceGame,
  onSkipToNextDay,
}: BroadcastStageProps) {
  const { state, game_title, rounds, tributes_died, tributes_alive } = renderState

  const title = translateGameTitle(game_title)
  const currentRound = rounds[rounds.length - 1]
  const totalEvents = currentRound?.game_events.length ?? 0
  const isLastEvent = totalEvents > 0 && eventIndex >= totalEvents - 1
  const hasNoEvents = totalEvents === 0

  const goNextEvent = useCallback(() => {
    onEventIndexChange(Math.min(eventIndex + 1, Math.max(0, totalEvents - 1)))
  }, [eventIndex, totalEvents, onEventIndexChange])

  const goPrevEvent = useCallback(() => {
    onEventIndexChange(Math.max(eventIndex - 1, 0))
  }, [eventIndex, onEventIndexChange])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (state !== RenderState.ROUND_EVENTS || !onAdvanceGame) return
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return

      if (e.key === '[' || e.key === 'PageUp') {
        e.preventDefault()
        goPrevEvent()
        return
      }
      if (e.key === ']' || e.key === 'PageDown') {
        e.preventDefault()
        if (isLastEvent || hasNoEvents) onAdvanceGame()
        else goNextEvent()
        return
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (isLastEvent || hasNoEvents) onAdvanceGame()
        else goNextEvent()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [state, onAdvanceGame, goPrevEvent, goNextEvent, isLastEvent, hasNoEvents])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const skipStates = [
        RenderState.ROUND_DEATHS,
        RenderState.WINNERS,
        RenderState.GAME_DEATHS,
        RenderState.STATS,
      ]
      if (!skipStates.includes(state) || !onAdvanceGame) return
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onAdvanceGame()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [state, onAdvanceGame])

  if (state === RenderState.ROUND_EVENTS) {
    const currentEvent = currentRound?.game_events[eventIndex]

    return (
      <div className="center-stage fullscreen-stage">
        <div className="round-banner round-banner-compact">
          <h2>{title}</h2>
          <div className="round-counter">
            {hasNoEvents ? '—' : `${eventIndex + 1} / ${totalEvents}`}
          </div>
        </div>

        <div className="fullscreen-card-viewport">
          {currentEvent && (
            <EventCard key={`${rounds.length}-${eventIndex}`} event={currentEvent} index={0} fullscreen />
          )}
          {hasNoEvents && (
            <div className="arena-card arena-card-fullscreen arena-card-empty-round">
              <p className="arena-event-text arena-event-text-lg">{it.noEventsPhase}</p>
            </div>
          )}
        </div>

        <div
          className={`event-nav${isLastEvent || hasNoEvents ? ' event-nav-phase-ready' : ''}`}
        >
          <button
            type="button"
            className="btn btn-secondary event-nav-btn"
            onClick={goPrevEvent}
            disabled={eventIndex === 0 || hasNoEvents}
          >
            {it.prevScene}
          </button>
          <div className="event-nav-dots">
            {!hasNoEvents &&
              Array.from({ length: totalEvents }, (_, i) => (
                <button
                  type="button"
                  key={i}
                  className={`event-dot ${i === eventIndex ? 'active' : ''} ${
                    currentRound!.game_events[i].event.fatalities.length > 0 ? 'dot-death' : ''
                  }`}
                  onClick={() => onEventIndexChange(i)}
                />
              ))}
          </div>
          {isLastEvent || hasNoEvents ? (
            <div className="event-nav-end-actions">
              <button
                type="button"
                className="btn btn-primary event-nav-btn event-nav-btn-phase"
                onClick={() => onAdvanceGame?.()}
                disabled={!onAdvanceGame}
              >
                {it.nextPhase}
              </button>
              <button
                type="button"
                className="btn btn-secondary event-nav-btn"
                onClick={() => onSkipToNextDay?.()}
                disabled={!onSkipToNextDay}
                title={it.nextDayTitle}
              >
                {it.nextDay}
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-secondary event-nav-btn" onClick={goNextEvent}>
              {it.nextScene}
            </button>
          )}
        </div>

        <p className="event-nav-hint">
          {isLastEvent || hasNoEvents ? it.eventNavHintEnd : it.eventNavHintScenes}
        </p>
      </div>
    )
  }

  if (state === RenderState.ROUND_DEATHS) {
    return (
      <div className="center-stage fullscreen-stage">
        <div className="death-summary">
          <h3>{title}</h3>
          {tributes_died.length > 0 ? (
            <>
              <div className="cannon-count">{tributes_died.length}</div>
              <div className="cannon-label">
                {it.cannonShots(tributes_died.length)}
              </div>
              <div className="death-portraits">
                {tributes_died.map((tribute, i) => (
                  <div key={i} className="death-tribute" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="death-tribute-avatar">
                      {tribute.image_src ? (
                        <img src={tribute.image_src} alt={tribute.raw_name} />
                      ) : (
                        getInitials(tribute.raw_name)
                      )}
                    </div>
                    <span className="death-tribute-name">{tribute.raw_name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="no-deaths-msg">{it.noCannonHeard}</p>
          )}
        </div>
        <StageNextButton onAdvance={onAdvanceGame} />
      </div>
    )
  }

  if (state === RenderState.WINNERS) {
    return (
      <div className="center-stage fullscreen-stage">
        <div className="winner-screen">
          <h2>
            {tributes_alive.length > 0 ? it.gamesEnded : it.noVictorsRemain}
          </h2>
          <div className="winner-portraits">
            {tributes_alive.map((tribute, i) => (
              <div key={i} className="winner-tribute" style={{ animationDelay: `${i * 200}ms` }}>
                <div className="winner-avatar">
                  {tribute.image_src ? (
                    <img src={tribute.image_src} alt={tribute.raw_name} />
                  ) : (
                    getInitials(tribute.raw_name)
                  )}
                </div>
                <span className="winner-name">{tribute.raw_name}</span>
                <span className="winner-kills">
                  {it.kills(tribute.kills)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <StageNextButton onAdvance={onAdvanceGame} />
      </div>
    )
  }

  if (state === RenderState.GAME_DEATHS) {
    return (
      <div className="center-stage fullscreen-stage">
        <div className="round-banner">
          <h2>{title}</h2>
          <div className="round-divider" />
        </div>
        <div className="game-deaths-section">
          {rounds.map((round, i) => {
            const fatalEvents = round.game_events.filter((e) => e.event.fatalities.length > 0)
            if (fatalEvents.length === 0) return null
            return (
              <div key={i} className="round-death-group">
                <div className="round-death-header">
                  {formatRoundDeathHeader(i, round.stage)}
                </div>
                {fatalEvents.map((event, j) => (
                  <EventCard key={j} event={event} index={j} />
                ))}
              </div>
            )
          })}
        </div>
        <StageNextButton onAdvance={onAdvanceGame} />
      </div>
    )
  }

  if (state === RenderState.STATS) {
    const allTributes = [...tributes_alive, ...tributes_died]
    return (
      <div className="center-stage fullscreen-stage">
        <div className="round-banner">
          <h2>{title}</h2>
          <div className="round-divider" />
        </div>
        <div className="stats-section">
          <div className="stats-grid">
            {allTributes.map((tribute, i) => {
              const isWinner = tribute.died_in_round === undefined
              return (
                <div
                  key={i}
                  className={`stat-card ${isWinner ? 'is-winner' : 'is-dead'}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="stat-card-avatar">
                    {tribute.image_src ? (
                      <img src={tribute.image_src} alt={tribute.raw_name} />
                    ) : (
                      getInitials(tribute.raw_name)
                    )}
                  </div>
                  <div className="stat-card-info">
                    <div className="stat-card-name">{tribute.raw_name}</div>
                    <div className="stat-card-detail">
                      {isWinner
                        ? it.victor
                        : it.diedRound((tribute.died_in_round?.index ?? 0) + 1)}
                    </div>
                  </div>
                  <div className="stat-card-kills">{tribute.kills}</div>
                </div>
              )
            })}
          </div>
        </div>
        <StageNextButton onAdvance={onAdvanceGame} />
      </div>
    )
  }

  return null
}
