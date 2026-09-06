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
  const { session, scores, isScorekeeper, actions } = game
  const [flow, setFlow] = useState('landing')
  const [setupMode, setSetupMode] = useState('local')

  const handleSetupSubmit = async (setup) => {
    if (setupMode === 'local') {
      await actions.startLocalGame(setup)
      setFlow('game')
    } else {
      await actions.createMultiplayerGame(setup)
      setFlow('lobby')
    }
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
