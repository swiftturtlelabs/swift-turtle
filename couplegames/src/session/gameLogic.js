import { CHALLENGES, CHALLENGE_COUNT } from '../challenges.js'

export const DEFAULT_PLAYERS = {
  player1: { name: 'Kenny', color: '#e08a68', emoji: '🎯' },
  player2: { name: 'Katie', color: '#6bbdb6', emoji: '✨' },
}

export function createInitialSession(overrides = {}) {
  return {
    code: null,
    mode: 'local',
    players: { ...DEFAULT_PLAYERS },
    scorekeeper: 'player1',
    prize: '',
    phase: 'landing',
    currentGame: 0,
    winners: {},
    gramMaster: {
      targets: generateGramMasterTargets(),
      roundWinners: [],
    },
    timers: {},
    measurements: {},
    photoMeta: {},
    ...overrides,
  }
}

export function generateGramMasterTargets(count = 3) {
  return Array.from({ length: count }, () =>
    Math.floor(Math.random() * (1000 - 50 + 1)) + 50
  )
}

export function deriveScores(winners) {
  const scores = { player1: 0, player2: 0 }
  for (let i = 1; i <= CHALLENGE_COUNT; i++) {
    if (winners[i] === 'player1') scores.player1++
    else if (winners[i] === 'player2') scores.player2++
  }
  return scores
}

export function getGramMasterRoundCounts(roundWinners = []) {
  return roundWinners.reduce(
    (acc, winner) => {
      acc[winner] = (acc[winner] || 0) + 1
      return acc
    },
    { player1: 0, player2: 0 }
  )
}

export function getGramMasterOverallWinner(roundWinners) {
  const counts = getGramMasterRoundCounts(roundWinners)
  if (counts.player1 === counts.player2) return 'player2'
  return counts.player1 > counts.player2 ? 'player1' : 'player2'
}

export function getCompletedGameCount(winners, upToIndex = CHALLENGE_COUNT) {
  let count = 0
  for (let i = 1; i <= upToIndex; i++) {
    if (winners[i] !== undefined) count++
  }
  return count
}

export function closestPlayer(measurements, target) {
  const entries = Object.entries(measurements || {}).filter(([, v]) => v !== null && v !== undefined && v !== '')
  if (entries.length < 2) return null

  let bestPlayer = null
  let bestDiff = Infinity
  for (const [player, value] of entries) {
    const num = Number(value)
    if (Number.isNaN(num)) continue
    const diff = Math.abs(num - target)
    if (diff < bestDiff) {
      bestDiff = diff
      bestPlayer = player
    } else if (diff === bestDiff && bestPlayer) {
      // Tie goes to player2 for consistency with gram master
      bestPlayer = 'player2'
    }
  }
  return bestPlayer
}

export function closestTimerPlayer(stops, targetMs) {
  const entries = Object.entries(stops || {}).filter(([, v]) => v !== null && v !== undefined)
  if (entries.length < 2) return null

  let bestPlayer = null
  let bestDiff = Infinity
  for (const [player, elapsed] of entries) {
    const diff = Math.abs(elapsed - targetMs)
    if (diff < bestDiff) {
      bestDiff = diff
      bestPlayer = player
    } else if (diff === bestDiff && bestPlayer) {
      bestPlayer = 'player2'
    }
  }
  return bestPlayer
}

export function getChallengeDescription(challenge, session, gameIndex) {
  if (!challenge) return ''

  if (challenge.gramMaster) {
    const roundNum = session.gramMaster.roundWinners.length + 1
    const target = session.gramMaster.targets[session.gramMaster.roundWinners.length]
    if (target != null) {
      return `Round ${Math.min(roundNum, 3)} of 3: Find an item as close to ${target} grams as possible. Best of 3 wins.`
    }
  }

  return challenge.description
}

export function shouldAutoJudge(challenge, session, gameIndex) {
  if (!challenge) return false
  const challengeId = challenge.id

  if (challenge.measure?.closest) {
    const m = session.measurements[challengeId]
    if (challenge.gramMaster) {
      const roundIndex = session.gramMaster.roundWinners.length
      const roundKey = `${challengeId}_r${roundIndex}`
      const roundMeasures = session.measurements[roundKey]
      return roundMeasures && roundMeasures.player1 != null && roundMeasures.player2 != null
    }
    return m && m.player1 != null && m.player2 != null
  }

  if (challenge.timer?.mode === 'estimate') {
    const t = session.timers[challengeId]
    return t?.stops?.player1 != null && t?.stops?.player2 != null
  }

  return false
}

export function getAutoJudgeWinner(challenge, session, gameIndex) {
  if (!challenge) return null
  const challengeId = challenge.id

  if (challenge.measure?.closest) {
    if (challenge.gramMaster) {
      const roundIndex = session.gramMaster.roundWinners.length
      const roundKey = `${challengeId}_r${roundIndex}`
      const target = session.gramMaster.targets[roundIndex]
      return closestPlayer(session.measurements[roundKey], target)
    }
    return closestPlayer(session.measurements[challengeId], challenge.measure.target)
  }

  if (challenge.timer?.mode === 'estimate') {
    const t = session.timers[challengeId]
    return closestTimerPlayer(t?.stops, challenge.timer.seconds * 1000)
  }

  return null
}

export function applyWinner(session, gameIndex, player) {
  const challenge = CHALLENGES[gameIndex]
  const challengeId = gameIndex + 1
  let next = { ...session, winners: { ...session.winners } }
  const gramMaster = {
    targets: [...session.gramMaster.targets],
    roundWinners: [...session.gramMaster.roundWinners],
  }

  if (challenge?.gramMaster) {
    gramMaster.roundWinners.push(player)
    next.gramMaster = gramMaster

    if (gramMaster.roundWinners.length < 3) {
      return { ...next, advance: false }
    }

    const overallWinner = getGramMasterOverallWinner(gramMaster.roundWinners)
    next.winners[challengeId] = overallWinner
  } else {
    next.winners[challengeId] = player
  }

  return advanceAfterWin(next, gameIndex)
}

function advanceAfterWin(session, gameIndex) {
  if (gameIndex === 4) {
    return { ...session, phase: 'halftime', currentGame: -1, advance: true }
  }
  if (gameIndex >= CHALLENGE_COUNT - 1) {
    return { ...session, phase: 'results', currentGame: CHALLENGE_COUNT, advance: true }
  }
  return {
    ...session,
    phase: 'playing',
    currentGame: gameIndex + 1,
    advance: true,
  }
}

export function undoCurrentGame(session, gameIndex) {
  let next = {
    ...session,
    winners: { ...session.winners },
    gramMaster: {
      targets: [...session.gramMaster.targets],
      roundWinners: [...session.gramMaster.roundWinners],
    },
  }

  const challengeId = gameIndex + 1
  const challenge = CHALLENGES[gameIndex]

  if (challenge?.gramMaster && next.gramMaster.roundWinners.length > 0) {
    if (next.winners[challengeId]) delete next.winners[challengeId]
    next.gramMaster.roundWinners.pop()
    return next
  }

  for (let i = challengeId; i <= CHALLENGE_COUNT; i++) {
    delete next.winners[i]
  }

  if (gameIndex === 0) {
    next.winners = {}
    next.gramMaster = { targets: generateGramMasterTargets(), roundWinners: [] }
  }

  return next
}

export function getPlayerName(session, playerKey) {
  return session.players[playerKey]?.name || playerKey
}

export function loadStoredPlayerPrefs() {
  try {
    const raw = localStorage.getItem('couplegames_players')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveStoredPlayerPrefs(players) {
  try {
    localStorage.setItem('couplegames_players', JSON.stringify(players))
  } catch {
    // ignore
  }
}

export function loadStoredRole() {
  try {
    return localStorage.getItem('couplegames_role')
  } catch {
    return null
  }
}

export function saveStoredRole(role) {
  try {
    if (role) localStorage.setItem('couplegames_role', role)
  } catch {
    // ignore
  }
}
