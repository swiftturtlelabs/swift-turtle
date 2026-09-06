import { useState } from 'react'
import { ScreenShell, Card, PrimaryButton } from '../components/Layout.jsx'
import { DEFAULT_PLAYERS, loadStoredPlayerPrefs } from '../session/gameLogic.js'
import { ColorPicker, PlayerOptionButton } from '../components/PlayerColor.jsx'

export function SetupScreen({ mode, onBack, onSubmit, loading = false, error = null }) {
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
    <ScreenShell className="pt-4 p-3 pb-4">
      <button onClick={onBack} className="mb-2 text-[#8c8071] hover:text-[#c9beac] text-sm">← Back</button>
      <h1 className="font-display text-2xl font-semibold mb-3 text-center">Game setup</h1>

      <Card compact className="mb-3">
        <div className="grid grid-cols-2 gap-3">
          {(['player1', 'player2']).map((key) => (
            <div key={key} className="space-y-2">
              <label className="text-xs text-[#8c8071]">Player {key === 'player1' ? '1' : '2'}</label>
              <input
                value={players[key].name}
                onChange={(e) => updatePlayer(key, 'name', e.target.value)}
                className="w-full bg-[#2b2620] border border-[#463e34] rounded-sm px-2 py-1.5 text-sm"
                placeholder="Name"
              />
              <ColorPicker
                compact
                value={players[key].color}
                onChange={(color) => updatePlayer(key, 'color', color)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card compact className="mb-3 space-y-3">
        <div>
          <label className="text-xs text-[#8c8071] block mb-1" htmlFor="prize-input">
            Prize <span className="text-[#c96a4d]">*</span>
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
            className="w-full bg-[#2b2620] border border-[#463e34] rounded-sm px-2 py-1.5 text-sm"
            placeholder="Who picks lunch, next movie, a treat..."
          />
          {prizeError && (
            <p className="text-xs text-[#e08a68] mt-1" role="alert">{prizeError}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-[#8c8071] block mb-1">Scorekeeper</label>
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
        </div>

        {mode === 'multiplayer' && (
          <div>
            <label className="text-xs text-[#8c8071] block mb-1">I am...</label>
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
          </div>
        )}
      </Card>

      {error && (
        <p className="text-xs text-[#e08a68] mb-2 text-center" role="alert">{error}</p>
      )}

      <PrimaryButton className="w-full py-3 text-base" onClick={handleSubmit} disabled={!prizeValid || loading}>
        {loading ? 'Creating game…' : 'Continue'}
      </PrimaryButton>
    </ScreenShell>
  )
}

export function JoinScreen({ onBack, onJoin, loading = false, error = null }) {
  const [code, setCode] = useState('')
  const [role, setRole] = useState('player2')

  const handleJoin = () => {
    onJoin(code, role)
  }

  return (
    <ScreenShell className="pt-4 p-3 pb-4">
      <button onClick={onBack} className="mb-2 text-[#8c8071] hover:text-[#c9beac] text-sm">← Back</button>
      <h1 className="font-display text-2xl font-semibold mb-3 text-center">Join a game</h1>
      <Card compact className="space-y-3">
        <div>
          <label className="text-xs text-[#8c8071] block mb-1">Session code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={4}
            className="w-full bg-[#2b2620] border border-[#463e34] rounded-sm px-2 py-1.5 text-center text-xl tracking-widest"
            placeholder="ABCD"
          />
        </div>
        <div>
          <label className="text-xs text-[#8c8071] block mb-1">I am player...</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setRole('player1')} className={`py-1.5 text-sm rounded-sm border ${role === 'player1' ? 'border-[#c96a4d]' : 'border-[#463e34]'}`}>Player 1</button>
            <button type="button" onClick={() => setRole('player2')} className={`py-1.5 text-sm rounded-sm border ${role === 'player2' ? 'border-[#c96a4d]' : 'border-[#463e34]'}`}>Player 2</button>
          </div>
        </div>
        {error && <p className="text-xs text-[#e08a68]" role="alert">{error}</p>}
        <PrimaryButton className="w-full py-3" onClick={handleJoin} disabled={loading || code.length < 4}>
          {loading ? 'Joining…' : 'Join'}
        </PrimaryButton>
      </Card>
    </ScreenShell>
  )
}
