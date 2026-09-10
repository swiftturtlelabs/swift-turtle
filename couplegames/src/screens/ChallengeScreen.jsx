import { ScreenShell, Card, PrimaryButton, SecondaryButton } from '../components/Layout.jsx'
import {
  ScoreBoard,
  ScorekeeperBanner,
  PendingChangeBanner,
  ScorekeeperWinnerPick,
  ScorekeeperScoreEditor,
} from '../components/ScoreBoard.jsx'
import { GameTimer } from '../components/GameTimer.jsx'
import { MeasurementEntry } from '../components/MeasurementEntry.jsx'
import { PhotoCapture } from '../components/PhotoCapture.jsx'
import { CHALLENGE_COUNT } from '../challenges.js'
import { GRAM_MASTER_INSTRUCTIONS } from '../session/gameLogic.js'

export function ChallengeScreen({
  session,
  scores,
  challenge,
  description,
  gramCounts,
  myRole,
  isScorekeeper,
  clockOffsetMs,
  photos,
  onBack,
  onProposeWinner,
  onProposeScoreEdit,
  onHandoff,
  onRespondHandoff,
  onApprovePending,
  onRejectPending,
  onStartTimer,
  onStopTimer,
  onSetMeasurement,
  onUploadPhoto,
  footer,
}) {
  if (!challenge) return null

  const currentGame = session.currentGame
  const completedGames = currentGame
  const progress = (completedGames / CHALLENGE_COUNT) * 100
  const p1 = session.players.player1
  const p2 = session.players.player2
  const gramRoundIndex = challenge.gramMaster ? session.gramMaster.roundWinners.length : null

  return (
    <ScreenShell footer={footer}>
      {currentGame > 0 && isScorekeeper && (
        <button type="button" onClick={onBack} className="mb-3 text-[#8c8071] hover:text-[#c9beac] text-sm">← Back</button>
      )}

      {session.mode === 'multiplayer' && (
        <>
          <ScorekeeperBanner
            session={session}
            isScorekeeper={isScorekeeper}
            myRole={myRole}
            onHandoff={onHandoff}
            onRespondHandoff={onRespondHandoff}
          />
          <PendingChangeBanner
            session={session}
            myRole={myRole}
            onApprove={onApprovePending}
            onReject={onRejectPending}
          />
        </>
      )}

      <div className="mb-6">
        <div className="flex justify-between text-sm text-[#8c8071] mb-2">
          <span>Game {currentGame + 1} of {CHALLENGE_COUNT}</span>
          <span>{completedGames} completed</span>
        </div>
        <div className="w-full bg-[#332c25] h-2">
          <div className="bg-[#c96a4d] h-2 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mb-6">
        <ScoreBoard session={session} scores={scores} compact />
      </div>

      <Card className="mb-6">
        <div className="text-sm text-[#8c8071] mb-2 uppercase tracking-wide">{challenge.phase}</div>
        <h1 className="font-display text-3xl font-semibold mb-3">{challenge.title}</h1>

        {challenge.gramMaster ? (
          <div className="space-y-4">
            <p className="text-[#c9beac] leading-relaxed text-sm whitespace-pre-line">{GRAM_MASTER_INSTRUCTIONS}</p>
            <div className="pt-4 border-t border-[#463e34]">
              <div className="text-xs text-[#8c8071] mb-2">Round scoreboard (best of 3)</div>
              <div className="flex justify-between text-sm">
                <span style={{ color: p1.color }}>{p1.name}: {gramCounts.player1 || 0}</span>
                <span style={{ color: p2.color }}>{p2.name}: {gramCounts.player2 || 0}</span>
              </div>
              <p className="text-[#c9beac] leading-relaxed mt-3">{description}</p>
            </div>
          </div>
        ) : (
          <p className="text-[#c9beac] leading-relaxed">{description}</p>
        )}

        {challenge.timer && (
          <GameTimer
            challenge={challenge}
            timerState={session.timers[challenge.id]}
            clockOffsetMs={clockOffsetMs}
            myRole={myRole}
            isScorekeeper={isScorekeeper}
            onStart={onStartTimer}
            onStop={onStopTimer}
          />
        )}

        {challenge.measure && (
          <MeasurementEntry
            challenge={challenge}
            session={session}
            myRole={myRole}
            onSubmit={onSetMeasurement}
            gramRoundIndex={gramRoundIndex}
          />
        )}

        {challenge.photo && (
          <PhotoCapture
            challenge={challenge}
            session={session}
            myRole={myRole}
            photos={photos}
            onUpload={onUploadPhoto}
            blindReveal={challenge.blindReveal}
          />
        )}

        {challenge.hasWordleLink && (
          <div className="mt-4 pt-4 border-t border-[#463e34]">
            <a
              href="https://garlicbread.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#c96a4d] hover:bg-[#b85c40] text-[#221e1a] font-semibold py-2 px-4 rounded-sm text-sm"
            >
              Open Wordle Archives
            </a>
          </div>
        )}
      </Card>

      {isScorekeeper && (
        <>
          <ScorekeeperWinnerPick
            session={session}
            challenge={challenge}
            onProposeWinner={onProposeWinner}
            pendingChange={session.pendingChange}
          />
          <ScorekeeperScoreEditor
            session={session}
            onProposeScoreEdit={onProposeScoreEdit}
            pendingChange={session.pendingChange}
          />
        </>
      )}
    </ScreenShell>
  )
}

export function HalftimeScreen({ session, scores, isScorekeeper, onBack, onContinue, footer }) {
  return (
    <ScreenShell footer={footer}>
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold mb-4">1st Half Complete!</h1>
        <p className="text-lg text-[#c9beac] mb-6">Time to head out for the next challenges.</p>
        <div className="mb-6"><ScoreBoard session={session} scores={scores} /></div>
        <div className="flex gap-3 justify-center">
          {isScorekeeper && <SecondaryButton onClick={onBack}>← Back</SecondaryButton>}
          {isScorekeeper && (
            <PrimaryButton onClick={onContinue}>Continue to 2nd Half →</PrimaryButton>
          )}
        </div>
      </div>
    </ScreenShell>
  )
}
