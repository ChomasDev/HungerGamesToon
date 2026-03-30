import type { Game } from '../engine/game'

interface ResultsScreenProps {
  game: Game
  seasonTitle: string
  onPlayAgain: () => void
  onBackToLobby: () => void
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function ResultsScreen({
  game,
  seasonTitle,
  onPlayAgain,
  onBackToLobby,
}: ResultsScreenProps) {
  const winners = game.tributes.filter((t) => t.died_in_round === undefined)
  const fallen = game.tributes
    .filter((t) => t.died_in_round !== undefined)
    .sort((a, b) => (b.died_in_round?.index ?? 0) - (a.died_in_round?.index ?? 0))

  return (
    <div className="results-screen">
      <h1>{winners.length > 0 ? 'Victory' : 'No Victors'}</h1>
      <p className="results-subtitle">{seasonTitle}</p>

      {winners.length > 0 && (
        <div className="results-winners">
          {winners.map((tribute, i) => (
            <div
              key={i}
              className="results-winner-card"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <div className="results-winner-avatar">
                {tribute.image_src ? (
                  <img src={tribute.image_src} alt={tribute.raw_name} />
                ) : (
                  getInitials(tribute.raw_name)
                )}
              </div>
              <span className="results-winner-name">{tribute.raw_name}</span>
              <span className="results-winner-stat">
                {tribute.kills} Kill{tribute.kills !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="stats-section" style={{ maxWidth: 800, width: '100%' }}>
        <div className="round-banner">
          <h2 style={{ fontSize: 20 }}>All Tributes</h2>
          <div className="round-divider" />
        </div>
        <div className="stats-grid" style={{ marginTop: 16 }}>
          {[...winners, ...fallen].map((tribute, i) => {
            const isWinner = tribute.died_in_round === undefined
            return (
              <div
                key={i}
                className={`stat-card ${isWinner ? 'is-winner' : 'is-dead'}`}
                style={{ animationDelay: `${i * 40}ms` }}
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
                      : `Eliminated Round ${(tribute.died_in_round?.index ?? 0) + 1}`}
                  </div>
                </div>
                <div className="stat-card-kills">{tribute.kills}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="results-actions">
        <button className="btn btn-primary btn-large" onClick={onPlayAgain}>
          Play Again
        </button>
        <button className="btn btn-secondary btn-large" onClick={onBackToLobby}>
          Back to Lobby
        </button>
      </div>
    </div>
  )
}
