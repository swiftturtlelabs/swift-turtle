export function ScoreBoard({ session, scores, compact = false }) {
  const p1 = session.players.player1
  const p2 = session.players.player2

  return (
    <div className={`flex justify-between items-center border border-[#463e34] rounded-sm ${compact ? 'p-4' : 'p-5 md:p-6'}`}>
      <div className="text-center flex-1">
        <div className="text-sm md:text-base text-[#8c8071] mb-2">
          {p1.emoji} {p1.name}
        </div>
        <div className="font-display text-4xl md:text-5xl font-semibold" style={{ color: p1.color }}>
          {scores.player1}
        </div>
      </div>
      <div className="text-2xl md:text-3xl font-semibold mx-3 md:mx-5 text-[#8c8071]">vs</div>
      <div className="text-center flex-1">
        <div className="text-sm md:text-base text-[#8c8071] mb-2">
          {p2.emoji} {p2.name}
        </div>
        <div className="font-display text-4xl md:text-5xl font-semibold" style={{ color: p2.color }}>
          {scores.player2}
        </div>
      </div>
    </div>
  )
}

export function ScorekeeperBanner({ session, isScorekeeper, onHandoff }) {
  const keeperName = session.players[session.scorekeeper]?.name
  return (
    <div className="mb-4 border border-[#463e34] rounded-sm p-3 text-sm text-[#c9beac] flex justify-between items-center gap-3">
      <span>
        {isScorekeeper ? 'You are keeping score.' : `${keeperName} is keeping score.`}
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
  return (
    <span className="font-semibold" style={{ color: info.color }}>
      {info.emoji} {info.name}
    </span>
  )
}
