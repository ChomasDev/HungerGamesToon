import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const eventsFile = join(here, '..', 'src', 'engine', 'events.ts')
const source = readFileSync(eventsFile, 'utf8')

const runs = Number(process.env.RUNS ?? 10000)
const tributes = Number(process.env.TRIBUTES ?? 150)
const minScenes = Number(process.env.EVENTS_MIN ?? 40)
const maxScenes = Number(process.env.EVENTS_MAX ?? 40)
const lethalTarget = Number(process.env.LETHAL_TARGET ?? 3)

function random(from, to) {
  return Math.floor(Math.random() * (to - from)) + from
}

function calculatePlayersInvolved(message) {
  const matches = message.match(/%[NAGRsyih!w]?(\d)/g) ?? []
  if (!matches.length) return 1
  return Math.max(...matches.map((token) => Number(token.at(-1)))) + 1
}

function parseNumberList(raw) {
  if (!raw?.trim()) return []
  return raw.split(',').map((part) => Number(part.trim())).filter(Number.isFinite)
}

function eventGroupKey(event) {
  return [
    event.message.trim().replace(/\s+/g, ' '),
    event.playersInvolved,
    event.fatalities.join(','),
  ].join('\x1f')
}

function pickUniformEventGroup(events) {
  const groups = new Map()
  for (const event of events) {
    const key = eventGroupKey(event)
    const group = groups.get(key)
    if (group) group.push(event)
    else groups.set(key, [event])
  }
  const grouped = Array.from(groups.values())
  const group = grouped[random(0, grouped.length)]
  return group[random(0, group.length)]
}

function rollDistributedSlots(count, plannedSceneCount, tributeCount) {
  const slots = new Set()
  if (count <= 0 || plannedSceneCount <= 0) return slots
  const desiredSceneCount = tributeCount > count
    ? Math.max(plannedSceneCount, count + 1)
    : plannedSceneCount
  const reachableSceneCount = Math.max(count, Math.min(desiredSceneCount, tributeCount))
  const minimumWindow = reachableSceneCount > count ? count + 1 : count
  const nonTailWindow = Math.max(minimumWindow, Math.ceil(reachableSceneCount * 0.85))
  const candidates = Array.from({ length: nonTailWindow }, (_, i) => i)
  if (count / nonTailWindow >= 0.6 && count < nonTailWindow) {
    const gaps = new Set()
    const gapCount = nonTailWindow - count
    for (let i = 0; i < gapCount; i++) {
      const center = Math.floor(((i + 1) * nonTailWindow) / (gapCount + 1))
      const gap = Math.max(1, Math.min(nonTailWindow - 2, center))
      gaps.add(gap)
    }
    for (const slot of candidates) {
      if (!gaps.has(slot)) slots.add(slot)
    }
    return slots
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = random(0, i + 1)
    const tmp = candidates[i]
    candidates[i] = candidates[j]
    candidates[j] = tmp
  }
  for (let i = 0; i < Math.min(count, candidates.length); i++) {
    slots.add(candidates[i])
  }
  return slots
}

function estimatePlannedSceneCount(events, tributeCount, targetEventCount) {
  const averagePlayers = events.reduce((sum, event) => sum + event.playersInvolved, 0) / events.length
  return Math.max(targetEventCount, Math.ceil(tributeCount / Math.max(averagePlayers, 1)), 1)
}

function pickIntentForScene(sceneIndex, tributesLeft, target, plannedSceneCount, lethalSlots, lethalEventsSoFar) {
  const lethalLeft = target - lethalEventsSoFar
  if (lethalLeft <= 0) return 'nonlethal'
  if (lethalLeft >= tributesLeft) return 'lethal'
  if (sceneIndex >= plannedSceneCount) return 'lethal'
  if (lethalSlots.has(sceneIndex)) return 'lethal'

  let remainingScheduledSlots = 0
  for (const slot of lethalSlots) {
    if (slot > sceneIndex) remainingScheduledSlots++
  }
  return remainingScheduledSlots < lethalLeft ? 'lethal' : 'nonlethal'
}

const eventPattern = /makeStoredEvent\(`([^`]*)`(?:,\s*\[([^\]]*)\])?/g
const events = []
for (const match of source.matchAll(eventPattern)) {
  const message = match[1]
  const fatalities = parseNumberList(match[2])
  events.push({
    message,
    fatalities,
    playersInvolved: calculatePlayersInvolved(message),
  })
}

if (!events.length) {
  throw new Error(`No events parsed from ${eventsFile}`)
}

const firstLethalIndex = new Map()
const victimsPerLethal = new Map()
const trailingLethalStreak = new Map()
const maxLethalStreak = new Map()
let phasesWithTargetMet = 0

for (let run = 0; run < runs; run++) {
  let tributesLeft = tributes
  let lethalEvents = 0
  let firstLethal = -1
  const lethalFlags = []
  const effectiveLethalTarget = Math.min(lethalTarget, Math.max(0, tributes - 1))
  const targetEventCount = random(minScenes, maxScenes + 1)
  const plannedSceneCount = estimatePlannedSceneCount(events, tributes, targetEventCount)
  const lethalSlots = rollDistributedSlots(effectiveLethalTarget, plannedSceneCount, tributes)

  for (let sceneIndex = 0; tributesLeft > 0; sceneIndex++) {
    const intent = pickIntentForScene(
      sceneIndex,
      tributesLeft,
      effectiveLethalTarget,
      plannedSceneCount,
      lethalSlots,
      lethalEvents,
    )
    let eligible = events.filter((event) => {
      if (event.playersInvolved > tributesLeft) return false
      const isLethal = event.fatalities.length > 0
      if (intent === 'lethal' && !isLethal) return false
      if (intent === 'nonlethal' && isLethal) return false
      if (isLethal && lethalEvents >= effectiveLethalTarget) return false
      return true
    })
    if (!eligible.length && intent === 'lethal') {
      eligible = events.filter((event) => event.playersInvolved <= tributesLeft)
    }
    if (intent === 'nonlethal') {
      const lethalLeft = effectiveLethalTarget - lethalEvents
      const maxPlayersWhileReservingLethalWindows = tributesLeft - lethalLeft
      const conservative = eligible.filter((event) =>
        event.playersInvolved <= maxPlayersWhileReservingLethalWindows,
      )
      if (conservative.length) {
        eligible = conservative
      } else if (lethalLeft > 0) {
        eligible = events.filter((event) =>
          event.playersInvolved <= tributesLeft
          && event.fatalities.length > 0
          && lethalEvents < effectiveLethalTarget,
        )
      }
    }
    if (intent === 'lethal') {
      const lethalLeft = effectiveLethalTarget - lethalEvents
      const maxPlayersToStillReachTarget = tributesLeft - lethalLeft + 1
      const conservative = eligible.filter((event) =>
        event.fatalities.length > 0 && event.playersInvolved <= maxPlayersToStillReachTarget,
      )
      if (conservative.length) eligible = conservative
      if (lethalLeft >= Math.ceil(tributesLeft / 2)) {
        const minPlayers = Math.min(...eligible.map((event) => event.playersInvolved))
        eligible = eligible.filter((event) => event.playersInvolved === minPlayers)
      }
    }
    if (!eligible.length) break

    const event = pickUniformEventGroup(eligible)
    tributesLeft -= event.playersInvolved
    lethalFlags.push(event.fatalities.length > 0)
    if (event.fatalities.length > 0) {
      lethalEvents++
      if (firstLethal === -1) firstLethal = sceneIndex
      victimsPerLethal.set(event.fatalities.length, (victimsPerLethal.get(event.fatalities.length) ?? 0) + 1)
    }
  }

  if (lethalEvents >= effectiveLethalTarget) phasesWithTargetMet++
  firstLethalIndex.set(firstLethal, (firstLethalIndex.get(firstLethal) ?? 0) + 1)

  let trailing = 0
  for (let i = lethalFlags.length - 1; i >= 0 && lethalFlags[i]; i--) trailing++
  trailingLethalStreak.set(trailing, (trailingLethalStreak.get(trailing) ?? 0) + 1)

  let currentRun = 0
  let maxRun = 0
  for (const isLethal of lethalFlags) {
    currentRun = isLethal ? currentRun + 1 : 0
    maxRun = Math.max(maxRun, currentRun)
  }
  maxLethalStreak.set(maxRun, (maxLethalStreak.get(maxRun) ?? 0) + 1)
}

function sortedEntries(map) {
  return Array.from(map.entries()).sort((a, b) => a[0] - b[0])
}

console.log({
  runs,
  tributes,
  minScenes,
  maxScenes,
  lethalTarget,
  parsedEvents: events.length,
  targetMetRate: phasesWithTargetMet / runs,
  firstLethalIndex: sortedEntries(firstLethalIndex).slice(0, 20),
  trailingLethalStreak: sortedEntries(trailingLethalStreak),
  maxLethalStreak: sortedEntries(maxLethalStreak),
  victimsPerLethal: sortedEntries(victimsPerLethal),
})
