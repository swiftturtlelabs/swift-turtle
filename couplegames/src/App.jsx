import { useState } from 'react'
import { useGameSession } from './session/useGameSession.js'
import { CHALLENGE_COUNT } from './challenges.js'
import { LandingScreen } from './screens/LandingScreen.jsx'
import { SetupScreen, JoinScreen } from './screens/SetupScreen.jsx'
import { LobbyScreen } from './screens/LobbyScreen.jsx'
import { ChallengeScreen, HalftimeScreen } from './screens/ChallengeScreen.jsx'
import { ResultsScreen, ScrapbookScreen } from './screens/ResultsScreen.jsx'

function App() {
  const game = useGameSession()
  const { session, scores, isScorekeeper, actions, ui, setUi } = game
  const [flow, setFlow] = useState('landing')
  const [setupMode, setSetupMode] = useState('local')

  const handleSetupSubmit = async (setup) => {
    if (setupMode === 'local') {
      window.__pendingSetup = setup
      setUi({ showPrizeConfirm: true })
      setFlow('prize-confirm-local')
    } else {
      await actions.createMultiplayerGame(setup)
      setFlow('lobby')
    }
  }

  const confirmLocalStart = async () => {
    const setup = window.__pendingSetup
    if (setup) await actions.startLocalGame(setup)
    setFlow('game')
    setUi({ showPrizeConfirm: false, view: 'game' })
  }

  if (flow === 'landing') {
    return (
      <LandingScreen
        isFirebaseConfigured={game.isFirebaseConfigured}
        onSingleDevice={() => { setSetupMode('local'); setFlow('setup') }}
        onCreateGame={() => { setSetupMode('multiplayer'); setFlow('setup') }}
        onJoinGame={() => setFlow('join')}
      />
    )
  }

  if (flow === 'setup') {
    return (
      <SetupScreen
        mode={setupMode}
        onBack={() => setFlow('landing')}
        onSubmit={handleSetupSubmit}
      />
    )
  }

  if (flow === 'join') {
    return (
      <JoinScreen
        onBack={() => setFlow('landing')}
        onJoin={async (code, role) => {
          await actions.joinMultiplayerGame(code, role)
          setFlow('lobby')
        }}
      />
    )
  }

  if (flow === 'prize-confirm-local' && ui.showPrizeConfirm) {
    return (
      <div className="h-screen overflow-y-auto bg-[#221e1a] text-[#f3ead9] flex flex-col items-center justify-start pt-6 p-4">
        <div className="max-w-2xl w-full text-center">
          <h1 className="font-display text-4xl font-semibold mb-3">Couple's Challenge</h1>
          <p className="text-lg text-[#c9beac] mb-5">10 challenges. Two halves. One winner.</p>
          <div className="fixed inset-0 bg-[#221e1a]/85 flex items-center justify-center p-4">
            <div role="dialog" aria-modal="true" className="bg-[#2b2620] border border-[#463e34] rounded-sm p-6 max-w-sm w-full text-center">
              <h2 className="font-display text-xl font-semibold mb-2">Prize settled?</h2>
              <p className="text-sm text-[#c9beac] mb-5">Have you both agreed on what the winner gets?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setUi({ showPrizeConfirm: false }); setFlow('setup') }} className="border border-[#463e34] text-[#c9beac] px-4 py-2 rounded-sm">Not yet</button>
                <button onClick={confirmLocalStart} className="bg-[#c96a4d] text-[#221e1a] font-bold px-4 py-2 rounded-sm">Yes, let's go!</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (session.phase === 'lobby' || flow === 'lobby') {
    return (
      <LobbyScreen
        session={session}
        scores={scores}
        isScorekeeper={isScorekeeper}
        onBegin={async () => {
          await actions.beginFromLobby()
          setFlow('game')
        }}
      />
    )
  }

  if (session.phase === 'halftime' || session.currentGame === -1) {
    return (
      <HalftimeScreen
        session={session}
        scores={scores}
        isScorekeeper={isScorekeeper}
        onBack={actions.goBack}
        onContinue={actions.continueToSecondHalf}
      />
    )
  }

  if (session.phase === 'results' || session.currentGame === CHALLENGE_COUNT) {
    if (flow === 'scrapbook') {
      return (
        <ScrapbookScreen
          session={session}
          photos={game.photos}
          onBack={() => setFlow('results')}
        />
      )
    }
    return (
      <ResultsScreen
        session={session}
        scores={scores}
        isScorekeeper={isScorekeeper}
        onBack={actions.goBack}
        onPlayAgain={async () => {
          await actions.resetGame()
          setFlow('landing')
        }}
        onViewScrapbook={() => setFlow('scrapbook')}
        onDeleteGame={async () => {
          await actions.deleteGameData()
          setFlow('landing')
        }}
      />
    )
  }

  if (session.phase === 'playing' || flow === 'game') {
    return (
      <ChallengeScreen
        session={session}
        scores={scores}
        challenge={game.challenge}
        description={game.description}
        gramCounts={game.gramCounts}
        myRole={game.myRole}
        isScorekeeper={isScorekeeper}
        clockOffsetMs={game.clockOffsetMs}
        photos={game.photos}
        onBack={actions.goBack}
        onRecordWinner={actions.recordWinner}
        onHandoff={actions.handoffScorekeeper}
        onStartTimer={actions.startTimer}
        onStopTimer={actions.stopTimer}
        onSetMeasurement={actions.setMeasurement}
        onUploadPhoto={actions.uploadPhoto}
      />
    )
  }

  return (
    <LandingScreen
      isFirebaseConfigured={game.isFirebaseConfigured}
      onSingleDevice={() => { setSetupMode('local'); setFlow('setup') }}
      onCreateGame={() => { setSetupMode('multiplayer'); setFlow('setup') }}
      onJoinGame={() => setFlow('join')}
    />
  )
}

export default App
