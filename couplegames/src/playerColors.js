export const PLAYER_COLOR_OPTIONS = [
  '#e08a68',
  '#6bbdb6',
  '#c96a4d',
  '#d9a441',
  '#8b7ec8',
  '#7cb87c',
  '#e06b9a',
  '#5ba4d9',
]

export function normalizePlayer(player, fallback) {
  return {
    name: player?.name || fallback.name,
    color: player?.color || fallback.color,
  }
}

export function normalizePlayers(players) {
  return {
    player1: normalizePlayer(players?.player1, { name: 'Kenny', color: '#e08a68' }),
    player2: normalizePlayer(players?.player2, { name: 'Katie', color: '#6bbdb6' }),
  }
}
