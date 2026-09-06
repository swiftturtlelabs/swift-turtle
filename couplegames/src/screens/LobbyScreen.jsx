import { ScreenShell, Card, PrimaryButton } from '../components/Layout.jsx'
import { ScoreBoard, ScorekeeperBanner } from '../components/ScoreBoard.jsx'
import { PlayerConnectionStatus } from '../components/MultiplayerFooter.jsx'
import { getPartnerRole } from '../session/gameLogic.js'

export function LobbyScreen({ session, scores, myRole, isScorekeeper, partnerConnected, footer, onBegin }) {
  const partnerRole = getPartnerRole(myRole)
  const partnerName = session.players[partnerRole]?.name || 'your partner'
  const canStart = isScorekeeper && partnerConnected

  return (
    <ScreenShell footer={footer}>
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold mb-2">Lobby</h1>
        <p className="text-[#c9beac] mb-4">Share this code with your partner</p>

        <Card className="mb-4">
          <div className="font-display text-5xl tracking-[0.3em] text-[#c96a4d]">{session.code}</div>
        </Card>

        <PlayerConnectionStatus session={session} />

        <div className="mb-4">
          <ScoreBoard session={session} scores={scores} compact />
        </div>

        {session.prize && (
          <Card compact className="mb-4 text-left">
            <div className="text-xs text-[#8c8071] uppercase tracking-wide mb-1">Prize</div>
            <div className="text-[#c9beac]">{session.prize}</div>
          </Card>
        )}

        {partnerConnected && (
          <div className="mb-4">
            <ScorekeeperBanner session={session} isScorekeeper={isScorekeeper} showHandoff={false} />
          </div>
        )}

        {!partnerConnected && (
          <p className="text-sm text-[#8c8071] mb-4">Waiting for {partnerName} to join…</p>
        )}

        {partnerConnected && !isScorekeeper && (
          <p className="text-[#c9beac] mb-4">Waiting for the scorekeeper to start…</p>
        )}

        {isScorekeeper && (
          <PrimaryButton className="w-full text-lg" onClick={onBegin} disabled={!canStart}>
            Start the challenges
          </PrimaryButton>
        )}
      </div>
    </ScreenShell>
  )
}
