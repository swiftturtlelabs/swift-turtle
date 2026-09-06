import { ColorSwatch, PlayerLabel } from './PlayerColor.jsx'

export function ScoreBoard({ session, scores, compact = false }) {
  const p1 = session.players.player1
  const p2 = session.players.player2

  return (
    <div className={`flex justify-between items-stretch border border-[#463e34] rounded-sm overflow-hidden ${compact ? '' : ''}`}>
      <div
        className={`text-center flex-1 ${compact ? 'p-4' : 'p-5 md:p-6'}`}
        style={{ borderTop: `3px solid ${p1.color}`, backgroundColor: `${p1.color}11` }}
      >
        <div className="mb-2 flex justify-center">
          <PlayerLabel player={p1} />
        </div>
        <div className="font-display text-4xl md:text-5xl font-semibold" style={{ color: p1.color }}>
          {scores.player1}
        </div>
      </div>
      <div className="flex items-center px-3 md:px-5 text-2xl md:text-3xl font-semibold text-[#8c8071]">vs</div>
      <div
        className={`text-center flex-1 ${compact ? 'p-4' : 'p-5 md:p-6'}`}
        style={{ borderTop: `3px solid ${p2.color}`, backgroundColor: `${p2.color}11` }}
      >
        <div className="mb-2 flex justify-center">
          <PlayerLabel player={p2} />
        </div>
        <div className="font-display text-4xl md:text-5xl font-semibold" style={{ color: p2.color }}>
          {scores.player2}
        </div>
      </div>
    </div>
  )
}

export function ScorekeeperBanner({ session, isScorekeeper, onHandoff }) {
  const keeper = session.players[session.scorekeeper]
  return (
    <div className="mb-4 border border-[#463e34] rounded-sm p-3 text-sm text-[#c9beac] flex justify-between items-center gap-3">
      <span className="inline-flex items-center gap-2">
        {keeper && <ColorSwatch color={keeper.color} />}
        {isScorekeeper ? 'You are keeping score.' : `${keeper?.name} is keeping score.`}
      </span>
      <button
        onClick={onHandoff}
        className="text-xs uppercase tracking-wide text-[#8c8071] hover:text-[#c9beac]"
      >
        Hand off
      </button>
    </div>
  )
}

export function PlayerBadge({ player, session }) {
  const info = session.players[player]
  return <PlayerLabel player={info} />
}
