import { useEffect, useState } from 'react'

export function GameTimer({ challenge, timerState, clockOffsetMs, myRole, isScorekeeper, onStart, onStop }) {
  const [now, setNow] = useState(Date.now())
  const challengeId = challenge.id
  const timer = timerState || {}
  const startedAt = timer.startedAt
  const mode = challenge.timer.mode
  const targetMs = challenge.timer.seconds * 1000

  useEffect(() => {
    if (!startedAt) return
    const id = setInterval(() => setNow(Date.now()), 50)
    return () => clearInterval(id)
  }, [startedAt])

  const elapsed = startedAt ? now + clockOffsetMs - startedAt : 0
  const myStop = timer.stops?.[myRole]
  const p1Stop = timer.stops?.player1
  const p2Stop = timer.stops?.player2

  const displayMs = mode === 'countdown'
    ? Math.max(0, targetMs - elapsed)
    : elapsed

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000)
    const msPart = Math.floor((ms % 1000) / 10)
    return `${totalSec}.${String(msPart).padStart(2, '0')}s`
  }

  return (
    <div className="mt-4 pt-4 border-t border-[#463e34]">
      <div className="text-xs text-[#8c8071] mb-2 uppercase tracking-wide">
        {mode === 'estimate' ? 'Synchronized stopwatch' : 'Countdown timer'}
      </div>
      <div className="font-display text-4xl text-center mb-4">
        {startedAt ? formatTime(displayMs) : '--'}
      </div>

      {!startedAt && isScorekeeper && (
        <button
          onClick={() => onStart(challengeId)}
          className="w-full bg-[#c96a4d] hover:bg-[#b85c40] text-[#221e1a] font-bold py-3 rounded-sm"
        >
          Start timer
        </button>
      )}

      {startedAt && myStop == null && (
        <button
          onClick={() => onStop(challengeId)}
          className="w-full bg-[#4d9a94] hover:bg-[#3d8a84] text-[#221e1a] font-bold py-3 rounded-sm"
        >
          Stop
        </button>
      )}

      {myStop != null && (
        <p className="text-sm text-[#c9beac] text-center">Your time: {formatTime(myStop)}</p>
      )}

      {(p1Stop != null || p2Stop != null) && (
        <div className="mt-3 text-xs text-[#8c8071] space-y-1">
          {p1Stop != null && <div>Player 1: {formatTime(p1Stop)}</div>}
          {p2Stop != null && <div>Player 2: {formatTime(p2Stop)}</div>}
        </div>
      )}
    </div>
  )
}
