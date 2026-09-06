import { PlayerLabel } from '../components/PlayerColor.jsx'
import { ScreenShell, Card, PrimaryButton } from '../components/Layout.jsx'
import { ScoreBoard } from '../components/ScoreBoard.jsx'

export function LobbyScreen({ session, scores, isScorekeeper, onBegin }) {
  return (
    <ScreenShell>
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold mb-2">Lobby</h1>
        <p className="text-[#c9beac] mb-6">Share this code with your partner</p>

        <Card className="mb-6">
          <div className="font-display text-5xl tracking-[0.3em] text-[#c96a4d]">{session.code}</div>
        </Card>

        <div className="mb-6">
          <ScoreBoard session={session} scores={scores} compact />
        </div>

        {session.prize && (
          <Card className="mb-6 text-left">
            <div className="text-xs text-[#8c8071] uppercase tracking-wide mb-1">Prize</div>
            <div className="text-[#c9beac]">{session.prize}</div>
          </Card>
        )}

        <p className="text-sm text-[#8c8071] mb-4 flex justify-center">
          Scorekeeper: <PlayerLabel player={session.players[session.scorekeeper]} className="ml-2" />
        </p>

        {isScorekeeper ? (
          <PrimaryButton className="w-full text-lg" onClick={onBegin}>
            Start the challenges
          </PrimaryButton>
        ) : (
          <p className="text-[#c9beac]">Waiting for the scorekeeper to start...</p>
        )}
      </div>
    </ScreenShell>
  )
}
