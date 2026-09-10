import { useState } from 'react'
import { CHALLENGES } from '../challenges.js'
import { PlayerLabel } from './PlayerColor.jsx'
import { getPlayerName } from '../session/gameLogic.js'

export function ScoreBoard({ session, scores, compact = false }) {
  const p1 = session.players.player1
  const p2 = session.players.player2

  return (
    <div className="flex justify-between items-stretch border border-[#463e34] rounded-sm overflow-hidden">
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

export function ScorekeeperBanner({
  session,
  isScorekeeper,
  myRole,
  onHandoff,
  onRespondHandoff,
  showHandoff = true,
}) {
  const keeper = session.players[session.scorekeeper]
  const handoff = session.handoffRequest

  if (handoff?.to === myRole) {
    const fromName = getPlayerName(session, handoff.from)
    return (
      <div className="mb-4 border border-[#c96a4d]/50 rounded-sm p-3 text-sm bg-[#c96a4d]/10">
        <p className="text-[#c9beac] mb-3">{fromName} wants you to take over scorekeeping.</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onRespondHandoff(true)}
            className="flex-1 bg-[#c96a4d] hover:bg-[#b85c40] text-[#221e1a] font-semibold py-2 rounded-sm text-sm"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => onRespondHandoff(false)}
            className="flex-1 border border-[#463e34] text-[#c9beac] py-2 rounded-sm text-sm"
          >
            Decline
          </button>
        </div>
      </div>
    )
  }

  if (handoff?.from === myRole) {
    const toName = getPlayerName(session, handoff.to)
    return (
      <div className="mb-4 border border-[#463e34] rounded-sm p-3 text-sm text-[#8c8071]">
        Waiting for {toName} to accept scorekeeping…
      </div>
    )
  }

  return (
    <div className="mb-4 border border-[#463e34] rounded-sm p-3 text-sm text-[#c9beac] flex justify-between items-center gap-3">
      <span>
        {isScorekeeper ? 'You are keeping score.' : `${keeper?.name} is keeping score.`}
      </span>
      {showHandoff && isScorekeeper && (
        <button
          type="button"
          onClick={onHandoff}
          className="text-xs uppercase tracking-wide text-[#8c8071] hover:text-[#c9beac]"
        >
          Hand off
        </button>
      )}
    </div>
  )
}

export function PendingChangeBanner({ session, myRole, onApprove, onReject }) {
  const pending = session.pendingChange
  if (!pending || pending.proposedBy === myRole) return null

  const proposerName = getPlayerName(session, pending.proposedBy)
  let message = `${proposerName} proposed a score change.`

  if (pending.type === 'winner') {
    const winnerName = getPlayerName(session, pending.player)
    const challenge = CHALLENGES[pending.gameIndex]
    const label = challenge?.gramMaster ? 'round winner' : 'winner'
    message = `${proposerName} says ${winnerName} won${challenge ? ` (${challenge.title})` : ''} — approve this ${label}?`
  }

  return (
    <div className="mb-4 border border-[#c96a4d]/50 rounded-sm p-3 text-sm bg-[#c96a4d]/10">
      <p className="text-[#c9beac] mb-3">{message}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onApprove}
          className="flex-1 bg-[#c96a4d] hover:bg-[#b85c40] text-[#221e1a] font-semibold py-2 rounded-sm text-sm"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={onReject}
          className="flex-1 border border-[#463e34] text-[#c9beac] py-2 rounded-sm text-sm"
        >
          Reject
        </button>
      </div>
    </div>
  )
}

export function ScorekeeperWinnerPick({ session, challenge, onProposeWinner, pendingChange }) {
  const p1 = session.players.player1
  const p2 = session.players.player2
  const isGramRound = challenge?.gramMaster
  const waitingApproval = pendingChange?.type === 'winner' && pendingChange.gameIndex === session.currentGame

  return (
    <div className="space-y-2">
      {waitingApproval && (
        <p className="text-xs text-[#8c8071] text-center">Waiting for your partner to approve…</p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onProposeWinner('player1')}
          disabled={waitingApproval}
          className="font-semibold py-4 rounded-sm text-[#221e1a] disabled:opacity-40"
          style={{ backgroundColor: p1.color }}
        >
          {p1.name} won{isGramRound ? ' this round' : ''}
        </button>
        <button
          type="button"
          onClick={() => onProposeWinner('player2')}
          disabled={waitingApproval}
          className="font-semibold py-4 rounded-sm text-[#221e1a] disabled:opacity-40"
          style={{ backgroundColor: p2.color }}
        >
          {p2.name} won{isGramRound ? ' this round' : ''}
        </button>
      </div>
    </div>
  )
}

export function ScorekeeperScoreEditor({ session, onProposeScoreEdit, pendingChange }) {
  const [open, setOpen] = useState(false)
  const [draftWinners, setDraftWinners] = useState({ ...session.winners })
  const waitingApproval = pendingChange?.type === 'scores'

  const completed = CHALLENGES.map((c) => ({
    challenge: c,
    winner: draftWinners[c.id],
  })).filter((item) => item.winner)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraftWinners({ ...session.winners })
          setOpen(true)
        }}
        className="w-full mt-3 border border-[#463e34] text-[#c9beac] py-2 rounded-sm text-sm hover:border-[#c9beac]"
      >
        Edit score
      </button>
    )
  }

  const setWinner = (challengeId, player) => {
    setDraftWinners((prev) => ({ ...prev, [challengeId]: player }))
  }

  const submit = () => {
    onProposeScoreEdit({
      winners: draftWinners,
      gramMaster: session.gramMaster,
      currentGame: session.currentGame,
      phase: session.phase,
    })
    setOpen(false)
  }

  return (
    <div className="mt-3 border border-[#463e34] rounded-sm p-3 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-[#c9beac]">Adjust winners</span>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-[#8c8071]">Close</button>
      </div>
      {completed.length === 0 && (
        <p className="text-xs text-[#8c8071]">No completed games to edit yet.</p>
      )}
      {completed.map(({ challenge, winner }) => (
        <div key={challenge.id} className="flex items-center justify-between gap-2 text-sm">
          <span className="text-[#8c8071] shrink-0">Game {challenge.id}</span>
          <div className="flex gap-1">
            {(['player1', 'player2']).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setWinner(challenge.id, key)}
                className={`px-2 py-1 rounded-sm border text-xs ${winner === key ? '' : 'border-[#463e34]'}`}
                style={winner === key ? { borderColor: session.players[key].color, color: session.players[key].color } : undefined}
              >
                {session.players[key].name}
              </button>
            ))}
          </div>
        </div>
      ))}
      {waitingApproval && (
        <p className="text-xs text-[#8c8071]">Waiting for your partner to approve…</p>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={waitingApproval}
        className="w-full bg-[#463e34] hover:bg-[#5a5045] text-[#f3ead9] py-2 rounded-sm text-sm disabled:opacity-40"
      >
        {session.mode === 'local' ? 'Save score' : 'Submit for approval'}
      </button>
    </div>
  )
}

export function PlayerBadge({ player, session }) {
  const info = session.players[player]
  return <PlayerLabel player={info} />
}
