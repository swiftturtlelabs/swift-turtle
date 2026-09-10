import { useState } from 'react'
import { useGameSession } from './session/useGameSession.js'
import { CHALLENGE_COUNT } from './challenges.js'
import { MultiplayerFooter } from './components/MultiplayerFooter.jsx'
import { LandingScreen } from './screens/LandingScreen.jsx'
import { SetupScreen, JoinScreen } from './screens/SetupScreen.jsx'
import { LobbyScreen } from './screens/LobbyScreen.jsx'
import { ChallengeScreen, HalftimeScreen } from './screens/ChallengeScreen.jsx'
import { ResultsScreen, ScrapbookScreen } from './screens/ResultsScreen.jsx'

function App() {
  const game = useGameSession()
  const { session, scores, isScorekeeper, partnerConnected, myRole, actions } = game
  const [flow, setFlow] = useState('landing')
  const [setupMode, setSetupMode] = useState('local')
  const mpFooter = session.mode === 'multiplayer' && myRole
    ? <MultiplayerFooter session={session} myRole={myRole} />
    : null

  const handleSetupSubmit = async (setup) => {
    if (setupMode === 'local') {
      await actions.startLocalGame(setup)
      setFlow('game')
      return
    }
    const ok = await actions.createMultiplayerGame(setup)
    if (ok) setFlow('lobby')
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
        loading={game.loading}
        error={game.error}
        onBack={() => setFlow('landing')}
        onSubmit={handleSetupSubmit}
      />
    )
  }

  if (flow === 'join') {
    return (
      <JoinScreen
        loading={game.loading}
        error={game.error}
        onPeekCode={actions.peekSessionCode}
        onBack={() => setFlow('landing')}
        onJoin={async (code, role) => {
          const ok = await actions.joinMultiplayerGame(code, role)
          if (ok) setFlow('lobby')
        }}
      />
    )
  }

  if (session.phase === 'lobby' && session.code) {
    return (
      <LobbyScreen
        session={session}
        scores={scores}
        myRole={myRole}
        isScorekeeper={isScorekeeper}
        partnerConnected={partnerConnected}
        footer={mpFooter}
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
        footer={mpFooter}
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
          footer={mpFooter}
          onBack={() => setFlow('results')}
        />
      )
    }
    return (
      <ResultsScreen
        session={session}
        scores={scores}
        isScorekeeper={isScorekeeper}
        footer={mpFooter}
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
        myRole={myRole}
        isScorekeeper={isScorekeeper}
        clockOffsetMs={game.clockOffsetMs}
        photos={game.photos}
        footer={mpFooter}
        onBack={actions.goBack}
        onProposeWinner={actions.proposeWinner}
        onProposeScoreEdit={actions.proposeScoreEdit}
        onHandoff={actions.handoffScorekeeper}
        onRespondHandoff={actions.respondHandoff}
        onApprovePending={actions.approvePendingChange}
        onRejectPending={actions.rejectPendingChange}
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
