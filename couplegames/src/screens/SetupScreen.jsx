import { useState } from 'react'
import { ScreenShell, Card, PrimaryButton } from '../components/Layout.jsx'
import { DEFAULT_PLAYERS, loadStoredPlayerPrefs } from '../session/gameLogic.js'
import { ColorPicker, PlayerOptionButton } from '../components/PlayerColor.jsx'

export function SetupScreen({ mode, onBack, onSubmit }) {
  const stored = loadStoredPlayerPrefs()
  const [players, setPlayers] = useState(stored || DEFAULT_PLAYERS)
  const [scorekeeper, setScorekeeper] = useState('player1')
  const [myRole, setMyRole] = useState('player1')
  const [prize, setPrize] = useState('')
  const [prizeError, setPrizeError] = useState('')

  const updatePlayer = (key, field, value) => {
    setPlayers((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  const handleSubmit = () => {
    const trimmedPrize = prize.trim()
    if (!trimmedPrize) {
      setPrizeError('Agree on a prize before you start.')
      return
    }
    setPrizeError('')
    onSubmit({ players, scorekeeper, prize: trimmedPrize, myRole: mode === 'multiplayer' ? myRole : 'player1' })
  }

  const prizeValid = prize.trim().length > 0

  return (
    <ScreenShell>
      <button onClick={onBack} className="mb-4 text-[#8c8071] hover:text-[#c9beac] text-sm">← Back</button>
      <h1 className="font-display text-3xl font-semibold mb-4 text-center">Game setup</h1>

      <Card className="mb-4 space-y-5">
        {(['player1', 'player2']).map((key) => (
          <div key={key} className="space-y-3 pb-4 last:pb-0 border-b border-[#463e34] last:border-0">
            <label className="text-sm text-[#8c8071]">Player {key === 'player1' ? '1' : '2'}</label>
            <input
              value={players[key].name}
              onChange={(e) => updatePlayer(key, 'name', e.target.value)}
              className="w-full bg-[#2b2620] border border-[#463e34] rounded-sm px-3 py-2"
              placeholder="Name"
            />
            <ColorPicker
              label="Color"
              value={players[key].color}
              onChange={(color) => updatePlayer(key, 'color', color)}
            />
          </div>
        ))}
      </Card>

      <Card className="mb-4">
        <label className="text-sm text-[#8c8071] block mb-2" htmlFor="prize-input">
          Prize for the winner <span className="text-[#c96a4d]">*</span>
        </label>
        <input
          id="prize-input"
          value={prize}
          onChange={(e) => {
            setPrize(e.target.value)
            if (prizeError && e.target.value.trim()) setPrizeError('')
          }}
          required
          aria-required="true"
          aria-invalid={prizeError ? 'true' : 'false'}
          className="w-full bg-[#2b2620] border border-[#463e34] rounded-sm px-3 py-2"
          placeholder="Who picks lunch, the next movie, a treat..."
        />
        {prizeError && (
          <p className="text-sm text-[#e08a68] mt-2" role="alert">{prizeError}</p>
        )}
      </Card>

      <Card className="mb-4">
        <label className="text-sm text-[#8c8071] block mb-2">Scorekeeper</label>
        <div className="grid grid-cols-2 gap-2">
          {(['player1', 'player2']).map((key) => (
            <PlayerOptionButton
              key={key}
              player={players[key]}
              selected={scorekeeper === key}
              onClick={() => setScorekeeper(key)}
            />
          ))}
        </div>
      </Card>

      {mode === 'multiplayer' && (
        <Card className="mb-4">
          <label className="text-sm text-[#8c8071] block mb-2">I am...</label>
          <div className="grid grid-cols-2 gap-2">
            {(['player1', 'player2']).map((key) => (
              <PlayerOptionButton
                key={key}
                player={players[key]}
                selected={myRole === key}
                onClick={() => setMyRole(key)}
              />
            ))}
          </div>
        </Card>
      )}

      <PrimaryButton className="w-full text-lg" onClick={handleSubmit} disabled={!prizeValid}>
        Continue
      </PrimaryButton>
    </ScreenShell>
  )
}

export function JoinScreen({ onBack, onJoin }) {
  const [code, setCode] = useState('')
  const [role, setRole] = useState('player2')
  const [error, setError] = useState('')

  const handleJoin = async () => {
    try {
      setError('')
      await onJoin(code, role)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <ScreenShell>
      <button onClick={onBack} className="mb-4 text-[#8c8071] hover:text-[#c9beac] text-sm">← Back</button>
      <h1 className="font-display text-3xl font-semibold mb-4 text-center">Join a game</h1>
      <Card className="mb-4 space-y-4">
        <div>
          <label className="text-sm text-[#8c8071] block mb-2">Session code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={4}
            className="w-full bg-[#2b2620] border border-[#463e34] rounded-sm px-3 py-2 text-center text-2xl tracking-widest"
            placeholder="ABCD"
          />
        </div>
        <div>
          <label className="text-sm text-[#8c8071] block mb-2">I am player...</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setRole('player1')} className={`py-2 rounded-sm border ${role === 'player1' ? 'border-[#c96a4d]' : 'border-[#463e34]'}`}>Player 1</button>
            <button type="button" onClick={() => setRole('player2')} className={`py-2 rounded-sm border ${role === 'player2' ? 'border-[#c96a4d]' : 'border-[#463e34]'}`}>Player 2</button>
          </div>
        </div>
        {error && <p className="text-sm text-[#e08a68]">{error}</p>}
        <PrimaryButton className="w-full" onClick={handleJoin}>Join</PrimaryButton>
      </Card>
    </ScreenShell>
  )
}
