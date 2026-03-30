import { NameSpan, type GameEventData } from '../engine/types'

interface EventCardProps {
  event: GameEventData
  index: number
  fullscreen?: boolean
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function Portrait({
  src,
  name,
  isDead,
  size = 56,
  className = '',
}: {
  src: string
  name: string
  isDead: boolean
  size?: number
  className?: string
}) {
  return (
    <div
      className={`arena-portrait ${isDead ? 'is-eliminated' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={name} />
      ) : (
        <span className="arena-portrait-initials">{getInitials(name)}</span>
      )}
      {isDead && <div className="arena-portrait-x">&#10005;</div>}
    </div>
  )
}

function MessageText({ message, large }: { message: (string | NameSpan)[]; large?: boolean }) {
  return (
    <p className={`arena-event-text ${large ? 'arena-event-text-lg' : ''}`}>
      {message.map((part, i) =>
        part instanceof NameSpan ? (
          <span key={i} className="tribute-name-highlight">{part.value}</span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  )
}

export default function EventCard({ event, index, fullscreen }: EventCardProps) {
  const hasDeath = event.event.fatalities.length > 0
  const deadIndices = new Set(event.event.fatalities)
  const killerIndices = new Set(event.event.killers)
  const players = event.players_involved

  const isVsBattle = hasDeath && players.length >= 2 && event.event.killers.length > 0
  const isSoloDeath = hasDeath && players.length === 1
  const isGroupEvent = !hasDeath && players.length >= 2

  const portraitSize = fullscreen ? 140 : 64
  const portraitSizeLg = fullscreen ? 180 : 72
  const portraitSizeSm = fullscreen ? 100 : 44
  const portraitSizeXs = fullscreen ? 60 : 32
  const wrapperClass = fullscreen ? 'arena-card-fullscreen' : ''

  if (isVsBattle) {
    const attackers = players.filter((_, i) => killerIndices.has(i))
    const victims = players.filter((_, i) => deadIndices.has(i))
    const bystanders = players.filter((_, i) => !killerIndices.has(i) && !deadIndices.has(i))

    return (
      <div
        className={`arena-card arena-card-battle ${wrapperClass}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="arena-battle-stage">
          <div className="arena-side arena-side-attacker">
            {attackers.map((t, i) => (
              <div key={i} className="arena-fighter">
                <Portrait src={t.image_src} name={t.raw_name} isDead={false} size={portraitSize} />
                <span className="arena-fighter-name">{t.raw_name}</span>
                <span className="arena-fighter-role">Killer</span>
              </div>
            ))}
          </div>

          <div className="arena-vs-badge">
            <span className="arena-vs-text">VS</span>
            <div className="arena-vs-slash" />
          </div>

          <div className="arena-side arena-side-victim">
            {victims.map((t, i) => (
              <div key={i} className="arena-fighter">
                <Portrait src={t.image_src} name={t.raw_name} isDead={true} size={portraitSize} />
                <span className="arena-fighter-name arena-fighter-dead">{t.raw_name}</span>
                <span className="arena-fighter-role arena-fighter-role-dead">Eliminated</span>
              </div>
            ))}
          </div>
        </div>

        {bystanders.length > 0 && (
          <div className="arena-bystanders">
            {bystanders.map((t, i) => (
              <Portrait key={i} src={t.image_src} name={t.raw_name} isDead={false} size={portraitSizeXs} />
            ))}
          </div>
        )}

        <div className="arena-event-body">
          <MessageText message={event.message} large={fullscreen} />
        </div>

        <div className="arena-card-stripe arena-card-stripe-death" />
      </div>
    )
  }

  if (isSoloDeath) {
    const tribute = players[0]
    return (
      <div
        className={`arena-card arena-card-solo-death ${wrapperClass}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="arena-solo-stage">
          <Portrait src={tribute.image_src} name={tribute.raw_name} isDead={true} size={portraitSizeLg} />
          <div className="arena-solo-info">
            <span className="arena-fighter-name arena-fighter-dead">{tribute.raw_name}</span>
            <span className="arena-fighter-role arena-fighter-role-dead">Eliminated</span>
          </div>
        </div>
        <div className="arena-event-body">
          <MessageText message={event.message} large={fullscreen} />
        </div>
        <div className="arena-card-stripe arena-card-stripe-death" />
      </div>
    )
  }

  if (isGroupEvent && players.length > 2) {
    return (
      <div
        className={`arena-card arena-card-group ${wrapperClass}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="arena-group-portraits">
          {players.map((t, i) => (
            <div key={i} className="arena-group-member">
              <Portrait src={t.image_src} name={t.raw_name} isDead={deadIndices.has(i)} size={portraitSizeSm} />
              <span className="arena-group-name">{t.raw_name}</span>
            </div>
          ))}
        </div>
        <div className="arena-event-body">
          <MessageText message={event.message} large={fullscreen} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`arena-card arena-card-standard ${hasDeath ? 'arena-card-has-death' : ''} ${wrapperClass}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="arena-standard-portraits">
        {players.map((t, i) => (
          <Portrait key={i} src={t.image_src} name={t.raw_name} isDead={deadIndices.has(i)} size={portraitSizeSm} />
        ))}
      </div>
      <div className="arena-event-body">
        <MessageText message={event.message} large={fullscreen} />
      </div>
      {hasDeath && <div className="arena-card-stripe arena-card-stripe-death" />}
    </div>
  )
}
