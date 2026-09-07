import { useEffect, useState } from 'react'
import { ScreenShell, Card, PrimaryButton } from '../components/Layout.jsx'
import { DEFAULT_PLAYERS, loadStoredPlayerPrefs } from '../session/gameLogic.js'
import { ColorPicker, PlayerOptionButton, PlayerLabel } from '../components/PlayerColor.jsx'

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
  const setupFooter = mode === 'multiplayer' ? (
    <div className="sticky bottom-0 w-full border-t border-[#463e34] bg-[#1a1613] px-3 py-2 text-xs sm:text-sm text-[#8c8071]">
      You are <span className="font-semibold ml-1" style={{ color: players[myRole].color }}>{players[myRole].name}</span>
    </div>
  ) : null

  return (
    <ScreenShell className="pt-4 p-3 pb-4" footer={setupFooter}>
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

export function JoinScreen({ onBack, onJoin, onPeekCode, loading = false, error = null }) {
  const [code, setCode] = useState('')
  const [role, setRole] = useState('player2')
  const [preview, setPreview] = useState(null)
  const [peekError, setPeekError] = useState('')

  useEffect(() => {
    if (!onPeekCode || code.length !== 4) {
      setPreview(null)
      setPeekError('')
      return undefined
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      const result = await onPeekCode(code)
      if (cancelled) return
      if (!result) {
        setPreview(null)
        setPeekError('No game found with that code.')
        return
      }
      setPeekError('')
      setPreview(result)
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [code, onPeekCode])

  useEffect(() => {
    if (!preview?.presence) return
    if (!preview.presence.player2) setRole('player2')
    else if (!preview.presence.player1) setRole('player1')
  }, [preview])

  const roleConnected = (key) => Boolean(preview?.presence?.[key])

  const handleJoin = () => {
    if (!preview) return
    const name = preview.players[role]?.name || 'this player'
    if (roleConnected(role)) {
      const ok = window.confirm(
        `${name} looks already connected from another device.\n\nJoin anyway? Use this if the other browser closed or got stuck.`
      )
      if (!ok) return
    }
    onJoin(code, role)
  }

  const joinFooter = preview?.players?.[role] ? (
    <div className="sticky bottom-0 w-full border-t border-[#463e34] bg-[#1a1613] px-3 py-2 text-xs sm:text-sm text-[#8c8071]">
      You are <PlayerLabel player={preview.players[role]} className="ml-1" />
    </div>
  ) : null

  return (
    <ScreenShell className="pt-4 p-3 pb-4" footer={joinFooter}>
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

        {preview && (
          <div className="rounded-sm border border-[#463e34] px-3 py-2 text-center">
            <div className="text-xs text-[#8c8071] mb-2">This game</div>
            <div className="flex justify-center items-center gap-2 text-sm">
              <PlayerLabel player={preview.players.player1} />
              <span className="text-[#8c8071]">vs</span>
              <PlayerLabel player={preview.players.player2} />
            </div>
            {preview.prize && (
              <div className="text-xs text-[#8c8071] mt-2">Prize: {preview.prize}</div>
            )}
          </div>
        )}

        {peekError && code.length === 4 && (
          <p className="text-xs text-[#e08a68]" role="alert">{peekError}</p>
        )}

        {preview && (
          <div>
            <label className="text-xs text-[#8c8071] block mb-1">I am...</label>
            <div className="grid grid-cols-2 gap-3">
              {(['player1', 'player2']).map((key) => (
                <div key={key} className="space-y-1">
                  <PlayerOptionButton
                    large
                    player={preview.players[key]}
                    selected={role === key}
                    onClick={() => setRole(key)}
                  />
                  {roleConnected(key) && (
                    <p className="text-xs text-[#e08a68] text-center leading-tight">Connected elsewhere</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-[#e08a68]" role="alert">{error}</p>}
        <PrimaryButton
          className="w-full py-3"
          onClick={handleJoin}
          disabled={loading || code.length < 4 || !preview}
        >
          {loading ? 'Joining…' : preview ? `Join as ${preview.players[role].name}` : 'Join'}
        </PrimaryButton>
      </Card>
    </ScreenShell>
  )
}
