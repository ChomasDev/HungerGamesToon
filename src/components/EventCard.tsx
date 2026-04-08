import { motion, useReducedMotion } from 'framer-motion'
import { resolvedKillerIndices, type GameEventData, type Tribute } from '../engine/types'
import { it } from '../i18n/it'
import ArenaPortrait from './arena/ArenaPortrait'
import CcgBattleDecorations from './arena/CcgBattleDecorations'
import CcgFighterCard from './arena/CcgFighterCard'
import EventNarrative from './arena/EventNarrative'
import FormattedEventMessage from './arena/FormattedEventMessage'
import TributeTradingCard, { TributeTradingCardDeck, TributeTradingVersusFight } from './arena/TributeTradingCard'
import VersusBadge from './arena/VersusBadge'

interface EventCardProps {
  event: GameEventData
  index: number
  fullscreen?: boolean
}

export default function EventCard({ event, index, fullscreen }: EventCardProps) {
  const reduceMotion = useReducedMotion()
  const hasDeath = event.event.fatalities.length > 0
  const deadIndices = new Set(event.event.fatalities)
  const killerIndices = new Set(resolvedKillerIndices(event.event))
  const players = event.players_involved

  const isVsBattle = hasDeath && players.length >= 2 && killerIndices.size > 0
  const isSoloDeath = hasDeath && players.length === 1
  const isGroupEvent = !hasDeath && players.length >= 2

  const portraitSize = fullscreen ? 220 : 64
  const portraitSizeLg = fullscreen ? 280 : 72
  const portraitSizeSm = fullscreen ? 140 : 44
  const portraitSizeXs = fullscreen ? 88 : 32
  const wrapperClass = fullscreen ? 'arena-card-fullscreen' : ''
  const sq = !!fullscreen

  if (isVsBattle) {
    const attackers = players.filter((_, i) => killerIndices.has(i))
    const victims = players.filter((_, i) => deadIndices.has(i))
    const bystanders = players.filter((_, i) => !killerIndices.has(i) && !deadIndices.has(i))

    const battleBody = (() => {
      if (!fullscreen) {
        return (
          <>
            <div className="arena-battle-stage">
              <div className="arena-battle-row">
                <div className="arena-side arena-side-attacker">
                  {attackers.map((t, i) => (
                    <div key={i} className="arena-fighter">
                      <ArenaPortrait src={t.image_src} name={t.raw_name} isDead={false} size={portraitSize} square={sq} />
                      <span className="arena-fighter-name">{t.raw_name}</span>
                      <span className="arena-fighter-role">{it.killer}</span>
                    </div>
                  ))}
                </div>
                <div className="arena-vs-badge">
                  <span className="arena-vs-text">VS</span>
                  <div className="arena-vs-slash" aria-hidden />
                </div>
                <div className="arena-side arena-side-victim">
                  {victims.map((t, i) => (
                    <div key={i} className="arena-fighter">
                      <ArenaPortrait src={t.image_src} name={t.raw_name} isDead size={portraitSize} square={sq} />
                      <span className="arena-fighter-name arena-fighter-dead">{t.raw_name}</span>
                      <span className="arena-fighter-role arena-fighter-role-dead">{it.eliminated}</span>
                    </div>
                  ))}
                </div>
              </div>
              {bystanders.length > 0 && (
                <div className="arena-bystanders">
                  {bystanders.map((t, i) => (
                    <div key={i} className="arena-bystander-chip">
                      <ArenaPortrait src={t.image_src} name={t.raw_name} isDead={false} size={portraitSizeXs} square={sq} />
                      <span className="arena-bystander-label">{t.raw_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="arena-event-body">
              <FormattedEventMessage message={event.message} large={fullscreen} />
            </div>
          </>
        )
      }

      const tradingVersusFullscreen = attackers.length === 1 && victims.length === 1

      if (tradingVersusFullscreen) {
        return (
          <>
            <TributeTradingVersusFight
              killer={attackers[0]}
              victim={victims[0]}
              message={event.message}
              animKey={`${index}-${attackers[0].raw_name}-${victims[0].raw_name}`}
            />
            {bystanders.length > 0 && (
              <div className="arena-bystanders ccg-bystanders relative z-2 mx-auto w-full max-w-[min(92vw,520px)] justify-center px-2 pt-1">
                {bystanders.map((t, i) => (
                  <div key={i} className="arena-bystander-chip">
                    <ArenaPortrait src={t.image_src} name={t.raw_name} isDead={false} size={portraitSizeXs} square={sq} />
                    <span className="arena-bystander-label">{t.raw_name}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      }

      const ccgFighterCount = attackers.length + victims.length
      const ccgPortraitSize = Math.max(96, Math.min(320, Math.round(960 / Math.max(ccgFighterCount, 2))))
      const ccgGapBudget = 96 + Math.max(0, ccgFighterCount - 1) * 18
      const ccgCardWidth = `clamp(148px, calc((100% - ${ccgGapBudget}px) / ${Math.max(ccgFighterCount, 1)}), 328px)`

      const renderCcgCard = (t: Tribute, role: 'killer' | 'victim', idx: number) => (
        <CcgFighterCard
          key={`ccg-${role}-${idx}-${t.raw_name}`}
          tribute={t}
          variant={role}
          portraitSize={ccgPortraitSize}
          cardWidth={ccgCardWidth}
          motionSide={role === 'killer' ? 'left' : 'right'}
          animKey={`${index}-${role}-${idx}-${t.raw_name}`}
        />
      )

      return (
        <>
          <div className="ccg-battle-frame relative z-1 w-full overflow-hidden">
            <CcgBattleDecorations />
            <div className="arena-battle-stage ccg-battle-stage relative z-1 gap-1.5 px-1.5 pb-1 pt-1">
              <div className="arena-battle-row ccg-battle-row flex min-w-0 flex-nowrap items-stretch justify-center gap-[clamp(4px,1.5vmin,14px)] max-[720px]:flex-nowrap max-[720px]:justify-center max-[720px]:overflow-x-auto max-[720px]:overflow-y-hidden max-[720px]:pb-1 max-[720px]:[-webkit-overflow-scrolling:touch]">
                <div className="arena-side arena-side-attacker ccg-side flex min-w-0 flex-nowrap justify-end gap-[clamp(4px,1.2vmin,14px)] max-[720px]:justify-center">
                  {attackers.map((t, i) => renderCcgCard(t, 'killer', i))}
                </div>
                <VersusBadge />
                <div className="arena-side arena-side-victim ccg-side flex min-w-0 flex-nowrap justify-start gap-[clamp(4px,1.2vmin,14px)] max-[720px]:justify-center">
                  {victims.map((t, i) => renderCcgCard(t, 'victim', i))}
                </div>
              </div>
              {bystanders.length > 0 && (
                <div className="arena-bystanders ccg-bystanders relative z-2 pt-1">
                  {bystanders.map((t, i) => (
                    <div key={i} className="arena-bystander-chip">
                      <ArenaPortrait src={t.image_src} name={t.raw_name} isDead={false} size={portraitSizeXs} square={sq} />
                      <span className="arena-bystander-label">{t.raw_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {reduceMotion ? (
            <EventNarrative message={event.message} large={fullscreen} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 22, rotateZ: -0.5 }}
              animate={{ opacity: 1, y: 0, rotateZ: 0 }}
              transition={{
                delay: 0.78,
                duration: 0.48,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <EventNarrative message={event.message} large={fullscreen} />
            </motion.div>
          )}
        </>
      )
    })()

    const tradingVersusFullscreen =
      fullscreen && attackers.length === 1 && victims.length === 1

    return (
      <div
        className={`arena-card arena-card-battle ${tradingVersusFullscreen ? 'arena-card-battle-trading' : ''} ${wrapperClass}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {battleBody}
        <div className="arena-card-stripe arena-card-stripe-death" />
      </div>
    )
  }

  if (isSoloDeath) {
    const tribute = players[0]
    const soloDead = deadIndices.has(0)

    if (fullscreen) {
      return (
        <div
          className={`arena-card arena-card-solo-death arena-card-solo-death-trading ${wrapperClass}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <TributeTradingCard tribute={tribute} isDead={soloDead} message={event.message} />
          <div className="arena-card-stripe arena-card-stripe-death" />
        </div>
      )
    }

    return (
      <div
        className={`arena-card arena-card-solo-death ${wrapperClass}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="arena-solo-stage">
          <ArenaPortrait src={tribute.image_src} name={tribute.raw_name} isDead size={portraitSizeLg} square={sq} />
          <div className="arena-solo-info">
            <span className="arena-fighter-name arena-fighter-dead">{tribute.raw_name}</span>
            <span className="arena-fighter-role arena-fighter-role-dead">{it.eliminated}</span>
          </div>
        </div>
        <div className="arena-event-body">
          <FormattedEventMessage message={event.message} large={fullscreen} />
        </div>
        <div className="arena-card-stripe arena-card-stripe-death" />
      </div>
    )
  }

  if (isGroupEvent && players.length > 2) {
    const groupTradingDeck = !!fullscreen
    return (
      <div
        className={`arena-card arena-card-group ${groupTradingDeck ? 'arena-card-group-trading' : ''} ${wrapperClass}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {groupTradingDeck ? (
          <TributeTradingCardDeck
            tributes={players}
            isDeadAtIndex={(i) => deadIndices.has(i)}
            message={event.message}
          />
        ) : (
          <>
            <div className="arena-group-portraits">
              {players.map((t, i) => (
                <div key={i} className="arena-group-member">
                  <ArenaPortrait
                    src={t.image_src}
                    name={t.raw_name}
                    isDead={deadIndices.has(i)}
                    size={portraitSizeSm}
                    square={sq}
                  />
                  <span className="arena-group-name">{t.raw_name}</span>
                </div>
              ))}
            </div>
            <div className="arena-event-body">
              <FormattedEventMessage message={event.message} large={fullscreen} />
            </div>
          </>
        )}
      </div>
    )
  }

  const tradingSingle = fullscreen && players.length === 1
  const tradingDeck = fullscreen && players.length >= 2

  return (
    <div
      className={`arena-card arena-card-standard ${hasDeath ? 'arena-card-has-death' : ''} ${tradingSingle || tradingDeck ? 'arena-card-standard-trading' : ''} ${wrapperClass}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {tradingSingle ? (
        <TributeTradingCard tribute={players[0]} isDead={deadIndices.has(0)} message={event.message} />
      ) : tradingDeck ? (
        <TributeTradingCardDeck
          tributes={players}
          isDeadAtIndex={(i) => deadIndices.has(i)}
          message={event.message}
        />
      ) : (
        <>
          <div className="arena-standard-portraits">
            {players.map((t, i) => (
              <ArenaPortrait
                key={i}
                src={t.image_src}
                name={t.raw_name}
                isDead={deadIndices.has(i)}
                size={portraitSizeSm}
                square={sq}
              />
            ))}
          </div>
          <div className="arena-event-body">
            <FormattedEventMessage message={event.message} large={fullscreen} />
          </div>
        </>
      )}
      {hasDeath && <div className="arena-card-stripe arena-card-stripe-death" />}
    </div>
  )
}
