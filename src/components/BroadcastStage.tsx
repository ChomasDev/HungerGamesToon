import { useCallback, useEffect, useState } from 'react'
import { RenderState, titleCase, type GameRenderStateData } from '../engine/types'
import EventCard from './EventCard'

interface BroadcastStageProps {
  renderState: GameRenderStateData
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function BroadcastStage({ renderState }: BroadcastStageProps) {
  const { state, game_title, rounds, tributes_died, tributes_alive } = renderState
  const [eventIndex, setEventIndex] = useState(0)

  const currentRound = rounds[rounds.length - 1]
  const totalEvents = currentRound?.game_events.length ?? 0

  useEffect(() => {
    setEventIndex(0)
  }, [rounds.length, state])

  const goNext = useCallback(() => {
    setEventIndex((prev) => Math.min(prev + 1, totalEvents - 1))
  }, [totalEvents])

  const goPrev = useCallback(() => {
    setEventIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (state !== RenderState.ROUND_EVENTS) return
      if (e.key === 'ArrowRight' || e.key === 'd') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'a') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [state, goNext, goPrev])

  if (state === RenderState.ROUND_EVENTS) {
    const currentEvent = currentRound?.game_events[eventIndex]
    return (
      <div className="center-stage fullscreen-stage">
        <div className="round-banner round-banner-compact">
          <h2>{game_title}</h2>
          <div className="round-counter">
            {eventIndex + 1} / {totalEvents}
          </div>
        </div>

        <div className="fullscreen-card-viewport">
          {currentEvent && (
            <EventCard key={`${rounds.length}-${eventIndex}`} event={currentEvent} index={0} fullscreen />
          )}
        </div>

        <div className="event-nav">
          <button
            className="btn btn-secondary event-nav-btn"
            onClick={goPrev}
            disabled={eventIndex === 0}
          >
            &larr; Prev
          </button>
          <div className="event-nav-dots">
            {Array.from({ length: totalEvents }, (_, i) => (
              <button
                key={i}
                className={`event-dot ${i === eventIndex ? 'active' : ''} ${
                  currentRound.game_events[i].event.fatalities.length > 0 ? 'dot-death' : ''
                }`}
                onClick={() => setEventIndex(i)}
              />
            ))}
          </div>
          <button
            className="btn btn-secondary event-nav-btn"
            onClick={goNext}
            disabled={eventIndex >= totalEvents - 1}
          >
            Next &rarr;
          </button>
        </div>
      </div>
    )
  }

  if (state === RenderState.ROUND_DEATHS) {
    return (
      <div className="center-stage fullscreen-stage">
        <div className="death-summary">
          <h3>{game_title}</h3>
          {tributes_died.length > 0 ? (
            <>
              <div className="cannon-count">{tributes_died.length}</div>
              <div className="cannon-label">
                Cannon Shot{tributes_died.length !== 1 ? 's' : ''}
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
            <p className="no-deaths-msg">No cannon shots can be heard in the distance.</p>
          )}
        </div>
      </div>
    )
  }

  if (state === RenderState.WINNERS) {
    return (
      <div className="center-stage fullscreen-stage">
        <div className="winner-screen">
          <h2>
            {tributes_alive.length > 0
              ? 'The Games Have Ended'
              : 'No Victors Remain'}
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
                  {tribute.kills} Kill{tribute.kills !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (state === RenderState.GAME_DEATHS) {
    return (
      <div className="center-stage fullscreen-stage">
        <div className="round-banner">
          <h2>{game_title}</h2>
          <div className="round-divider" />
        </div>
        <div className="game-deaths-section">
          {rounds.map((round, i) => {
            const fatalEvents = round.game_events.filter((e) => e.event.fatalities.length > 0)
            if (fatalEvents.length === 0) return null
            return (
              <div key={i} className="round-death-group">
                <div className="round-death-header">
                  Round {i + 1}: {titleCase(round.stage)}
                </div>
                {fatalEvents.map((event, j) => (
                  <EventCard key={j} event={event} index={j} />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (state === RenderState.STATS) {
    const allTributes = [...tributes_alive, ...tributes_died]
    return (
      <div className="center-stage fullscreen-stage">
        <div className="round-banner">
          <h2>{game_title}</h2>
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
                        ? 'Victor'
                        : `Died Round ${(tribute.died_in_round?.index ?? 0) + 1}`}
                    </div>
                  </div>
                  <div className="stat-card-kills">{tribute.kills}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return null
}
