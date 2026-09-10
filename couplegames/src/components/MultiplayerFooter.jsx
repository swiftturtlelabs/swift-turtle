import { PlayerLabel } from './PlayerColor.jsx'

export function MultiplayerFooter({ session, myRole }) {
  if (session.mode !== 'multiplayer' || !myRole) return null

  const me = session.players[myRole]
  if (!me) return null

  return (
    <div className="w-full border-t border-[#463e34] bg-[#1a1613] px-4 py-2.5 text-xs sm:text-sm text-[#8c8071] flex justify-between items-center gap-3">
      <span>
        You are <PlayerLabel player={me} className="ml-1" />
      </span>
      {session.code && (
        <span className="text-right shrink-0">
          <span className="mr-1">Code</span>
          <span className="font-display tracking-[0.2em] text-[#c96a4d]">{session.code}</span>
        </span>
      )}
    </div>
  )
}

export function PlayerConnectionStatus({ session }) {
  const presence = session.presence || {}

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {(['player1', 'player2']).map((key) => {
        const connected = Boolean(presence[key])
        return (
          <div
            key={key}
            className={`rounded-sm border px-2 py-2 text-center text-xs ${connected ? 'border-[#4d9a94]/50 bg-[#4d9a94]/10' : 'border-[#463e34]'}`}
          >
            <PlayerLabel player={session.players[key]} />
            <div className={connected ? 'text-[#6bbdb6] mt-1' : 'text-[#8c8071] mt-1'}>
              {connected ? 'Connected' : 'Waiting…'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
