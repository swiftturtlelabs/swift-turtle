import { useState } from 'react'
import { ScreenShell, Card, PrimaryButton, SecondaryButton } from '../components/Layout.jsx'
import { DEFAULT_PLAYERS, loadStoredPlayerPrefs } from '../session/gameLogic.js'

const EMOJI_OPTIONS = ['🎯', '✨', '🔥', '💫', '🌟', '⚡', '🎨', '🏆']

export function SetupScreen({ mode, onBack, onSubmit }) {
  const stored = loadStoredPlayerPrefs()
  const [players, setPlayers] = useState(stored || DEFAULT_PLAYERS)
  const [scorekeeper, setScorekeeper] = useState('player1')
  const [myRole, setMyRole] = useState('player1')
  const [prize, setPrize] = useState('')

  const updatePlayer = (key, field, value) => {
    setPlayers((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  const handleSubmit = () => {
    onSubmit({ players, scorekeeper, prize, myRole: mode === 'multiplayer' ? myRole : 'player1' })
  }

  return (
    <ScreenShell>
      <button onClick={onBack} className="mb-4 text-[#8c8071] hover:text-[#c9beac] text-sm">← Back</button>
      <h1 className="font-display text-3xl font-semibold mb-4 text-center">Game setup</h1>

      <Card className="mb-4 space-y-4">
        {(['player1', 'player2']).map((key) => (
          <div key={key} className="space-y-2">
            <label className="text-sm text-[#8c8071]">Player {key === 'player1' ? '1' : '2'}</label>
            <div className="flex gap-2">
              <select
                value={players[key].emoji}
                onChange={(e) => updatePlayer(key, 'emoji', e.target.value)}
                className="bg-[#2b2620] border border-[#463e34] rounded-sm px-2"
              >
                {EMOJI_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <input
                value={players[key].name}
                onChange={(e) => updatePlayer(key, 'name', e.target.value)}
                className="flex-1 bg-[#2b2620] border border-[#463e34] rounded-sm px-3 py-2"
                placeholder="Name"
              />
            </div>
          </div>
        ))}
      </Card>

      <Card className="mb-4">
        <label className="text-sm text-[#8c8071] block mb-2">Prize for the winner</label>
        <input
          value={prize}
          onChange={(e) => setPrize(e.target.value)}
          className="w-full bg-[#2b2620] border border-[#463e34] rounded-sm px-3 py-2"
          placeholder="Who picks lunch, next movie, a treat..."
        />
      </Card>

      <Card className="mb-4">
        <label className="text-sm text-[#8c8071] block mb-2">Scorekeeper</label>
        <div className="grid grid-cols-2 gap-2">
          {(['player1', 'player2']).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setScorekeeper(key)}
              className={`py-2 rounded-sm border ${scorekeeper === key ? 'border-[#c96a4d] bg-[#c96a4d]/20' : 'border-[#463e34]'}`}
            >
              {players[key].emoji} {players[key].name}
            </button>
          ))}
        </div>
      </Card>

      {mode === 'multiplayer' && (
        <Card className="mb-4">
          <label className="text-sm text-[#8c8071] block mb-2">I am...</label>
          <div className="grid grid-cols-2 gap-2">
            {(['player1', 'player2']).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setMyRole(key)}
                className={`py-2 rounded-sm border ${myRole === key ? 'border-[#c96a4d] bg-[#c96a4d]/20' : 'border-[#463e34]'}`}
              >
                {players[key].emoji} {players[key].name}
              </button>
            ))}
          </div>
        </Card>
      )}

      <PrimaryButton className="w-full text-lg" onClick={handleSubmit}>
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
