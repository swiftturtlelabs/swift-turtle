import { CHALLENGES } from '../challenges.js'
import { PlayerLabel } from '../components/PlayerColor.jsx'
import { ScreenShell, Card, PrimaryButton, SecondaryButton } from '../components/Layout.jsx'

export function ResultsScreen({ session, scores, isScorekeeper, onBack, onPlayAgain, onViewScrapbook, onDeleteGame, footer }) {
  const winner = scores.player1 > scores.player2 ? 'player1' : scores.player2 > scores.player1 ? 'player2' : 'tie'
  const winnerInfo = winner !== 'tie' ? session.players[winner] : null

  return (
    <ScreenShell footer={footer}>
      <h1 className="font-display text-3xl font-semibold text-center mb-6">Final Results</h1>

      {winner !== 'tie' && winnerInfo && (
        <Card className="mb-4 text-center border-t-4" style={{ borderColor: winnerInfo.color }}>
          <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: winnerInfo.color }}>
            {winnerInfo.name} wins!
          </h2>
          {session.prize && (
            <p className="text-[#c9beac]">Prize: {session.prize}</p>
          )}
        </Card>
      )}

      {winner === 'tie' && (
        <Card className="mb-4 text-center">
          <h2 className="font-display text-2xl font-semibold">It's a tie!</h2>
        </Card>
      )}

      <Card className="mb-4">
        {(['player1', 'player2']).map((key) => (
          <div key={key} className="flex justify-between items-center mb-2 last:mb-0">
            <PlayerLabel player={session.players[key]} />
            <span className="font-display text-3xl" style={{ color: session.players[key].color }}>{scores[key]}</span>
          </div>
        ))}
      </Card>

      <Card className="mb-4 max-h-64 overflow-y-auto">
        <h2 className="font-display text-xl font-semibold mb-3">Game summary</h2>
        {CHALLENGES.map((c, i) => {
          const w = session.winners[i + 1]
          return (
            <div key={c.id} className="flex justify-between py-2 border-b border-[#463e34] last:border-0 text-sm">
              <span>Game {c.id}: {c.title}</span>
              <span style={{ color: w ? session.players[w].color : undefined }} className={w ? 'font-semibold' : 'text-[#8c8071]'}>
                {w ? session.players[w].name : 'Not played'}
              </span>
            </div>
          )
        })}
      </Card>

      <div className="flex flex-col gap-3">
        <PrimaryButton onClick={onViewScrapbook}>View scrapbook</PrimaryButton>
        <div className="flex gap-3">
          {isScorekeeper && <SecondaryButton className="flex-1" onClick={onBack}>← Back</SecondaryButton>}
          <SecondaryButton className="flex-1" onClick={onPlayAgain}>Play again</SecondaryButton>
        </div>
        {session.mode === 'multiplayer' && isScorekeeper && onDeleteGame && (
          <button onClick={onDeleteGame} className="text-xs text-[#8c8071] hover:text-[#e08a68] mt-2">
            Delete game data from cloud
          </button>
        )}
      </div>
    </ScreenShell>
  )
}

export function ScrapbookScreen({ session, photos, onBack, footer }) {
  const grouped = {}

  // From session photoMeta (local + synced metadata)
  Object.entries(session.photoMeta || {}).forEach(([challengeId, byPlayer]) => {
    grouped[challengeId] = grouped[challengeId] || []
    Object.entries(byPlayer).forEach(([playerKey, items]) => {
      items.forEach((p) => {
        grouped[challengeId].push({ ...p, playerKey })
      })
    })
  })

  // From firestore photos subcollection
  photos.forEach((p) => {
    const id = String(p.challengeId)
    grouped[id] = grouped[id] || []
    if (!grouped[id].find((x) => x.url === p.url)) {
      grouped[id].push(p)
    }
  })

  return (
    <ScreenShell footer={footer}>
      <button onClick={onBack} className="mb-4 text-[#8c8071] hover:text-[#c9beac] text-sm">← Back</button>
      <h1 className="font-display text-3xl font-semibold mb-6 text-center">Scrapbook</h1>

      {Object.keys(grouped).length === 0 && (
        <p className="text-center text-[#8c8071]">No photos yet.</p>
      )}

      {CHALLENGES.filter((c) => grouped[c.id]).map((c) => (
        <Card key={c.id} className="mb-4">
          <h2 className="font-display text-xl font-semibold mb-3">{c.title}</h2>
          <div className="grid grid-cols-2 gap-2">
            {grouped[c.id].map((photo, idx) => (
              <div key={idx}>
                <img src={photo.url} alt={c.title} className="w-full rounded-sm aspect-square object-cover" />
                <div className="text-xs text-[#8c8071] mt-1">
                  {session.players[photo.playerKey]?.name || photo.playerKey}
                  {photo.timestamp && ` · ${new Date(photo.timestamp).toLocaleTimeString()}`}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </ScreenShell>
  )
}
