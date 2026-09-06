import { useState, useEffect } from 'react'

const CHALLENGES = [
  {
    id: 1,
    title: "Perfect Cut",
    phase: "1st Half",
    description: "Cut a piece of paper into what you think is a perfect 4-inch square. Overlay them to see who is more accurate.",
  },
  {
    id: 2,
    title: "The Gram Master",
    phase: "1st Half",
    description: "This challenge has 3 rounds. Each round, a random target weight will be shown. Find one item in the house that weighs as close to that target as possible. (Use a kitchen scale to verify). The person who wins the most rounds out of 3 wins the challenge.",
    needsRandomWeight: true,
  },
  {
    id: 3,
    title: "Minute Estimator",
    phase: "1st Half",
    description: "Both start a stopwatch and put phones face down. Stop it when you think exactly 60 seconds have passed. Closest wins.",
  },
  {
    id: 4,
    title: "Water Pour",
    phase: "1st Half",
    description: "Without using a scale first, fill a glass with what you think is exactly 200g of water. Closest wins.",
  },
  {
    id: 5,
    title: "The Obscure Hunt",
    phase: "1st Half",
    description: "Each person has 60 seconds to find the most \"random\" or \"useless\" item in the house. Mutual agreement on the winner.",
  },
  {
    id: 6,
    title: "The $4.13 Challenge",
    phase: "2nd Half",
    description: "Find a single item with a price tag as close to $4.13 as possible. NOTE: Use the price BEFORE TAX as printed on the tag/sticker.",
  },
  {
    id: 7,
    title: "Q-Hunt",
    phase: "2nd Half",
    description: "First person to take a picture of a physical item (not a sign) that starts with the letter \"Q\".",
  },
  {
    id: 8,
    title: "Wordle in the Wild",
    phase: "2nd Half",
    description: "Open the Wordle archives link below and solve Wordles until you find a word you think you can find in the wild. Then go take a picture of it. First one back with a picture wins.",
    hasWordleLink: true,
  },
  {
    id: 9,
    title: "The Name Tag",
    phase: "2nd Half",
    description: "Find your own first name on a product or store sign.",
  },
  {
    id: 10,
    title: "Rainbow Sprint",
    phase: "2nd Half",
    description: "Take pictures of items for every color of the rainbow (Red, Orange, Yellow, Green, Blue, Indigo, Violet) in order.",
  },
]

function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [currentGame, setCurrentGame] = useState(0)
  const [scores, setScores] = useState({ player1: 0, player2: 0 })
  const [winners, setWinners] = useState({})
  const [gramMasterTarget, setGramMasterTarget] = useState(null)
  const [gramMasterRounds, setGramMasterRounds] = useState({ player1: [], player2: [] })
  const [showScoreEdit, setShowScoreEdit] = useState(false)
  const [showPrizeConfirm, setShowPrizeConfirm] = useState(false)

  // Generate random weight for Gram Master challenge
  useEffect(() => {
    if (currentGame === 1 && gramMasterTarget === null) {
      const randomWeight = Math.floor(Math.random() * (1000 - 50 + 1)) + 50
      setGramMasterTarget(randomWeight)
    }
  }, [currentGame, gramMasterTarget])

  const handleWinner = (player) => {
    // Handle Gram Master best of 3 - don't add to winners until all rounds are done
    if (currentGame === 1) {
      const newRounds = { ...gramMasterRounds }
      if (player === 'player1') {
        newRounds.player1.push(1)
      } else {
        newRounds.player2.push(1)
      }
      setGramMasterRounds(newRounds)
      
      // Check if best of 3 is complete
      const totalRounds = newRounds.player1.length + newRounds.player2.length
      if (totalRounds < 3) {
        // Reset for next round - don't add to winners yet
        const newWeight = Math.floor(Math.random() * (1000 - 50 + 1)) + 50
        setGramMasterTarget(newWeight)
        return // Don't advance yet
      } else {
        // All 3 rounds complete - now add to winners and score
        const player1Wins = newRounds.player1.length
        const player2Wins = newRounds.player2.length
        const overallWinner = player1Wins > player2Wins ? 'player1' : 'player2'
        
        // Add to winners object
        const newWinners = { ...winners, [currentGame + 1]: overallWinner }
        setWinners(newWinners)
        
        // Update scores
        if (overallWinner === 'player1') {
          setScores(prev => ({ ...prev, player1: prev.player1 + 1 }))
        } else {
          setScores(prev => ({ ...prev, player2: prev.player2 + 1 }))
        }
      }
    } else {
      // Normal game - add to winners and score immediately
      const newWinners = { ...winners, [currentGame + 1]: player }
      setWinners(newWinners)
      
      // Normal scoring
      if (player === 'player1') {
        setScores(prev => ({ ...prev, player1: prev.player1 + 1 }))
      } else {
        setScores(prev => ({ ...prev, player2: prev.player2 + 1 }))
      }
    }

    // Auto-advance to next game (unless Gram Master needs more rounds)
    if (currentGame === 1 && gramMasterRounds.player1.length + gramMasterRounds.player2.length < 3) {
      return // Stay on this game for next round
    }

    // Check if we just finished the 5th game (1st half) - go to transition page
    if (currentGame === 4) {
      setTimeout(() => {
        setCurrentGame(-1) // Transition page
      }, 500)
      return
    }

    if (currentGame < CHALLENGES.length - 1) {
      setTimeout(() => {
        setCurrentGame(prev => prev + 1)
        // Reset Gram Master for next game if needed
        if (currentGame + 1 !== 1) {
          setGramMasterTarget(null)
          setGramMasterRounds({ player1: [], player2: [] })
        }
      }, 500)
    } else {
      // Last game completed, show results
      setTimeout(() => {
        setCurrentGame(CHALLENGES.length)
      }, 500)
    }
  }

  // Helper function to recalculate scores from winners object
  const recalculateScores = (winnersObj) => {
    let newScores = { player1: 0, player2: 0 }
    for (let i = 1; i <= CHALLENGES.length; i++) {
      if (winnersObj[i] === 'player1') {
        newScores.player1++
      } else if (winnersObj[i] === 'player2') {
        newScores.player2++
      }
    }
    return newScores
  }

  const goBack = () => {
    if (currentGame === -1) {
      // From transition page, go back to game 5
      const newWinners = { ...winners }
      const gameId = 5 // Game 5 is index 4, but stored as ID 5
      if (newWinners[gameId]) {
        delete newWinners[gameId]
        setWinners(newWinners)
        // Recalculate all scores from scratch
        setScores(recalculateScores(newWinners))
      }
      setCurrentGame(4)
    } else if (currentGame === CHALLENGES.length) {
      // From results, go back to last game
      const newWinners = { ...winners }
      const gameId = CHALLENGES.length
      if (newWinners[gameId]) {
        delete newWinners[gameId]
        setWinners(newWinners)
        // Recalculate all scores from scratch
        setScores(recalculateScores(newWinners))
      }
      setCurrentGame(CHALLENGES.length - 1)
    } else if (currentGame > 0) {
      // From a game, go back one
      const newWinners = { ...winners }
      const targetGameId = currentGame + 1 // Current game ID
      
      // Handle Gram Master special case
      if (currentGame === 1) {
        // Going back from Gram Master - need to handle rounds
        const totalRounds = gramMasterRounds.player1.length + gramMasterRounds.player2.length
        if (totalRounds > 0) {
          const newRounds = { ...gramMasterRounds }
          
          // If all 3 rounds are complete, remove the overall winner entry
          if (totalRounds === 3 && newWinners[targetGameId]) {
            delete newWinners[targetGameId]
          }
          
          // Remove the last round - heuristic: remove from the array with more entries
          // If equal, we can't know for sure, but we'll remove from player1 as default
          // This is a limitation, but works for most cases
          if (newRounds.player1.length > newRounds.player2.length) {
            newRounds.player1.pop()
          } else if (newRounds.player2.length > newRounds.player1.length) {
            newRounds.player2.pop()
          } else if (newRounds.player1.length > 0) {
            // Equal, remove from player1 (arbitrary but consistent)
            newRounds.player1.pop()
          }
          setGramMasterRounds(newRounds)
          
          // Generate new weight for the round we're going back to
          const remainingRounds = newRounds.player1.length + newRounds.player2.length
          if (remainingRounds > 0) {
            const newWeight = Math.floor(Math.random() * (1000 - 50 + 1)) + 50
            setGramMasterTarget(newWeight)
          } else {
            // Going back to first round, reset weight
            setGramMasterTarget(null)
          }
          
          // Recalculate all scores from scratch
          setWinners(newWinners)
          setScores(recalculateScores(newWinners))
        }
      } else {
        // Normal game - remove winner for current game and all subsequent games
        // Remove all winners from current game onwards
        for (let i = targetGameId; i <= CHALLENGES.length; i++) {
          if (newWinners[i]) {
            delete newWinners[i]
          }
        }
        setWinners(newWinners)
        
        // Recalculate all scores from scratch
        setScores(recalculateScores(newWinners))
      }
      
      const newCurrentGame = currentGame - 1
      
      // If going back to game 1 (index 0), clear all winners and reset scores
      if (newCurrentGame === 0) {
        setWinners({})
        setScores({ player1: 0, player2: 0 })
        // Also reset Gram Master state
        setGramMasterTarget(null)
        setGramMasterRounds({ player1: [], player2: [] })
      } else {
        // Otherwise, just update winners and recalculate scores
        setWinners(newWinners)
        setScores(recalculateScores(newWinners))
      }
      
      setCurrentGame(newCurrentGame)
    }
  }

  const continueToSecondHalf = () => {
    setCurrentGame(5) // Start 2nd half (game 6, index 5)
  }

  const resetGame = () => {
    setGameStarted(false)
    setCurrentGame(0)
    setScores({ player1: 0, player2: 0 })
    setWinners({})
    setGramMasterTarget(null)
    setGramMasterRounds({ player1: [], player2: [] })
    setShowPrizeConfirm(false)
  }

  const startGame = () => {
    setShowPrizeConfirm(false)
    setGameStarted(true)
    setCurrentGame(0)
  }

  // Intro screen
  if (!gameStarted) {
    return (
      <div className="h-screen overflow-y-auto bg-[#221e1a] text-[#f3ead9] flex flex-col items-center justify-start pt-6 md:pt-8 p-4 md:p-8 pb-10">
        <div className="max-w-2xl w-full text-center">
          {/* Back button - hidden on intro since there's nowhere to go back to */}
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3 md:mb-4 tracking-tight">Couple's Challenge</h1>
          <p className="text-lg md:text-xl text-[#c9beac] mb-5 md:mb-6 leading-relaxed">
            10 challenges. Two halves. One winner.
          </p>

          <div className="border border-[#463e34] rounded-sm p-5 md:p-6 mb-5 md:mb-6 text-left">
            <h2 className="font-display text-xl md:text-2xl font-semibold mb-3 md:mb-4">How It Works</h2>
            <div className="space-y-4 md:space-y-5">
              <div className="border-l-2 border-[#c96a4d] pl-4">
                <h3 className="text-base md:text-lg font-semibold text-[#e08a68] mb-1 md:mb-2">1st Half: At Home (5)</h3>
                <p className="text-sm md:text-base text-[#c9beac]">Precision, estimation, and creativity — no need to leave the house.</p>
              </div>
              <div className="border-l-2 border-[#4d9a94] pl-4">
                <h3 className="text-base md:text-lg font-semibold text-[#6bbdb6] mb-1 md:mb-2">2nd Half: Out on the Town (5)</h3>
                <p className="text-sm md:text-base text-[#c9beac]">Head out for hunting and searching around stores.</p>
              </div>
            </div>
          </div>

          <div className="border border-[#463e34] rounded-sm p-5 md:p-6 mb-5 md:mb-6">
            <h2 className="font-display text-xl md:text-2xl font-semibold mb-2 md:mb-3">Pick a Prize</h2>
            <p className="text-sm md:text-base text-[#c9beac]">
              Agree on the winner's prize now — who picks lunch, the next movie, a treat. Make it count. Make it fun!
            </p>
          </div>

          <button
            onClick={() => setShowPrizeConfirm(true)}
            className="bg-[#c96a4d] hover:bg-[#b85c40] text-[#221e1a] font-bold py-3 md:py-4 px-8 md:px-10 rounded-sm text-xl md:text-2xl transition-colors tracking-wide"
          >
            LET THE GAMES BEGIN!
          </button>
        </div>

        {showPrizeConfirm && (
          <div className="fixed inset-0 bg-[#221e1a]/85 flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="prize-confirm-title"
              className="bg-[#2b2620] border border-[#463e34] rounded-sm p-5 md:p-6 max-w-sm w-full text-center"
            >
              <h2 id="prize-confirm-title" className="font-display text-xl md:text-2xl font-semibold mb-2 md:mb-3">
                Prize settled?
              </h2>
              <p className="text-sm md:text-base text-[#c9beac] mb-5 md:mb-6">
                Have you both agreed on what the winner gets?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowPrizeConfirm(false)}
                  className="border border-[#463e34] hover:border-[#c9beac] text-[#c9beac] hover:text-[#f3ead9] font-semibold py-2 px-4 rounded-sm transition-colors text-sm md:text-base"
                >
                  Not yet
                </button>
                <button
                  onClick={startGame}
                  className="bg-[#c96a4d] hover:bg-[#b85c40] text-[#221e1a] font-bold py-2 px-4 rounded-sm transition-colors text-sm md:text-base"
                >
                  Yes, let's go!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Transition page between halves
  if (currentGame === -1) {
    return (
      <div className="h-screen overflow-y-auto bg-[#221e1a] text-[#f3ead9] flex flex-col items-center justify-start pt-6 md:pt-8 p-4 md:p-8 pb-10">
        <div className="max-w-2xl w-full text-center">
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-5 md:mb-6">1st Half Complete!</h1>
          <p className="text-xl md:text-2xl text-[#c9beac] mb-7 md:mb-8 leading-relaxed">
            Great job completing the first half! Now it's time to head over near the mall for the next challenges.
          </p>

          {/* Score Display */}
          <div className="flex justify-between items-center mb-7 md:mb-8 border border-[#463e34] rounded-sm p-5 md:p-6 max-w-md mx-auto">
            <div className="text-center flex-1">
              <div className="text-sm md:text-base text-[#8c8071] mb-2">Kenny</div>
              <div className="font-display text-4xl md:text-5xl font-semibold text-[#e08a68]">{scores.player1}</div>
            </div>
            <div className="text-2xl md:text-3xl font-semibold mx-3 md:mx-5 text-[#8c8071]">vs</div>
            <div className="text-center flex-1">
              <div className="text-sm md:text-base text-[#8c8071] mb-2">Katie</div>
              <div className="font-display text-4xl md:text-5xl font-semibold text-[#6bbdb6]">{scores.player2}</div>
            </div>
          </div>

          <div className="border border-[#463e34] rounded-sm p-5 md:p-6 mb-7 md:mb-8">
            <p className="text-lg md:text-xl text-[#c9beac]">
              Make sure you're ready to go out and explore! The 2nd half challenges will have you hunting, searching, and taking pictures around the mall area.
            </p>
          </div>

          <div className="flex gap-3 md:gap-4 justify-center">
            <button
              onClick={goBack}
              className="border border-[#463e34] hover:border-[#c9beac] text-[#c9beac] hover:text-[#f3ead9] font-semibold py-2 md:py-3 px-4 md:px-6 rounded-sm transition-colors text-sm md:text-base"
            >
              ← Back
            </button>
            <button
              onClick={continueToSecondHalf}
              className="bg-[#c96a4d] hover:bg-[#b85c40] text-[#221e1a] font-bold py-3 md:py-4 px-6 md:px-8 rounded-sm text-lg md:text-xl transition-colors"
            >
              Continue to 2nd Half →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Results screen
  if (currentGame === CHALLENGES.length) {
    const winner = scores.player1 > scores.player2 ? 'player1' : scores.player2 > scores.player1 ? 'player2' : 'tie'
    const winnerName = winner === 'player1' ? 'Kenny' : winner === 'player2' ? 'Katie' : null
    const winnerColor = winner === 'player1' ? 'blue' : winner === 'player2' ? 'pink' : null
    
    return (
      <div className="h-screen overflow-y-auto bg-[#221e1a] text-[#f3ead9] flex flex-col items-center justify-start pt-6 md:pt-8 p-4 md:p-8 pb-10">
        <div className="max-w-2xl w-full">
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-center mb-6 md:mb-8">Final Results</h1>

          {/* Winner Celebration */}
          {winner !== 'tie' && (
            <div className={`rounded-sm p-4 md:p-6 mb-4 md:mb-6 border-t-4 ${
              winner === 'player1'
                ? 'border-[#e08a68] bg-[#e08a68]/10'
                : 'border-[#6bbdb6] bg-[#6bbdb6]/10'
            }`}>
              <div className="text-center">
                <h2 className={`font-display text-2xl md:text-3xl font-semibold mb-2 ${
                  winner === 'player1' ? 'text-[#e08a68]' : 'text-[#6bbdb6]'
                }`}>
                  {winnerName} Wins!
                </h2>
                <p className="text-[#c9beac] text-base md:text-lg">
                  Congratulations on your victory!
                </p>
              </div>
            </div>
          )}

          {winner === 'tie' && (
            <div className="rounded-sm p-4 md:p-6 mb-4 md:mb-6 border-t-4 border-[#8c8071] bg-[#8c8071]/10">
              <div className="text-center">
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#f3ead9] mb-2">
                  It's a Tie!
                </h2>
                <p className="text-[#c9beac] text-base md:text-lg">
                  What an evenly matched competition!
                </p>
              </div>
            </div>
          )}

          <div className="border border-[#463e34] rounded-sm p-4 md:p-6 mb-4 md:mb-6">
            <div className={`flex justify-between items-center mb-3 md:mb-4 ${
              winner === 'player1' ? 'rounded-sm p-2 border border-[#e08a68]/40' : ''
            }`}>
              <div className="text-xl md:text-2xl font-semibold">Kenny</div>
              <div className={`font-display font-semibold text-[#e08a68] ${
                winner === 'player1' ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'
              }`}>
                {scores.player1}
              </div>
            </div>
            <div className={`flex justify-between items-center ${
              winner === 'player2' ? 'rounded-sm p-2 border border-[#6bbdb6]/40' : ''
            }`}>
              <div className="text-xl md:text-2xl font-semibold">Katie</div>
              <div className={`font-display font-semibold text-[#6bbdb6] ${
                winner === 'player2' ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'
              }`}>
                {scores.player2}
              </div>
            </div>
          </div>

          <div className="border border-[#463e34] rounded-sm p-4 md:p-6 max-h-80 md:max-h-96 overflow-y-auto mb-4 md:mb-6">
            <h2 className="font-display text-xl md:text-2xl font-semibold mb-3 md:mb-4">Game Summary</h2>
            <div className="space-y-2 md:space-y-3">
              {CHALLENGES.map((challenge, index) => {
                const winner = winners[index + 1]
                return (
                  <div key={challenge.id} className="border-b border-[#463e34] pb-2 md:pb-3 last:border-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-xs md:text-sm text-[#8c8071] mb-1">{challenge.phase}</div>
                        <div className="font-semibold text-sm md:text-base">Game {challenge.id}: {challenge.title}</div>
                      </div>
                      <div className={`ml-3 md:ml-4 px-2 md:px-3 py-1 rounded-sm text-xs md:text-sm ${
                        winner === 'player1'
                          ? 'bg-[#e08a68] text-[#221e1a]'
                          : winner === 'player2'
                          ? 'bg-[#6bbdb6] text-[#221e1a]'
                          : 'border border-[#463e34] text-[#8c8071]'
                      }`}>
                        {winner === 'player1' ? 'Kenny' : winner === 'player2' ? 'Katie' : 'Not played'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 md:gap-4 mt-4 md:mt-6">
            <button
              onClick={goBack}
              className="flex-1 border border-[#463e34] hover:border-[#c9beac] text-[#c9beac] hover:text-[#f3ead9] font-semibold py-2 md:py-3 px-4 md:px-6 rounded-sm transition-colors text-sm md:text-base"
            >
              ← Back
            </button>
            <button
              onClick={resetGame}
              className="flex-1 bg-[#c96a4d] hover:bg-[#b85c40] text-[#221e1a] font-bold py-2 md:py-3 px-4 md:px-6 rounded-sm transition-colors text-sm md:text-base"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Game screen
  const challenge = CHALLENGES[currentGame]
  // Completed games = current game number (0-indexed, so currentGame is games completed before this one)
  const completedGames = currentGame
  const progress = (completedGames / CHALLENGES.length) * 100
  const totalScore = scores.player1 + scores.player2
  // Count actual winners up to (but not including) the current game
  // This gives us the true number of completed games based on winners
  let actualCompletedGames = 0
  for (let i = 1; i <= currentGame; i++) {
    if (winners[i] !== undefined) {
      actualCompletedGames++
    }
  }
  // Check if current game has a winner (we just completed it but haven't advanced yet)
  const currentGameJustCompleted = winners[currentGame + 1] !== undefined
  // Show warning if score doesn't match actual completed games
  // Exception: during transition (just completed current game), allow score to be actualCompletedGames + 1
  const scoreMismatch = totalScore !== actualCompletedGames && !(currentGameJustCompleted && totalScore === actualCompletedGames + 1)
  const gramMasterRound = gramMasterRounds.player1.length + gramMasterRounds.player2.length + 1

  // Get description with dynamic content
  let description = challenge.description
  if (challenge.needsRandomWeight && gramMasterTarget) {
    // For Gram Master, show the current round's target weight
    const roundNum = gramMasterRounds.player1.length + gramMasterRounds.player2.length + 1
    description = `Round ${roundNum} of 3: Find an item that weighs as close to ${gramMasterTarget} grams as possible. (Use a kitchen scale to verify). The person who wins the most rounds out of 3 wins the challenge.`
  }

  return (
    <div className="h-screen overflow-y-auto bg-[#221e1a] text-[#f3ead9] flex flex-col items-center justify-start pt-6 md:pt-8 p-4 md:p-8 pb-10">
      <div className="max-w-2xl w-full">
        {/* Back Button */}
        {currentGame > 0 && (
          <button
            onClick={goBack}
            className="mb-3 md:mb-4 text-[#8c8071] hover:text-[#c9beac] transition-colors flex items-center gap-2 text-sm md:text-base"
          >
            ← Back
          </button>
        )}

        {/* Progress Bar */}
        <div className="mb-7 md:mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm md:text-base text-[#8c8071]">Game {currentGame + 1} of {CHALLENGES.length}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base text-[#8c8071]">{completedGames} completed</span>
              {scoreMismatch && (
                <span className="text-xs text-[#d9a441] border border-[#d9a441]/40 px-2 py-1 rounded-sm" title="Score total doesn't match completed games">
                  !
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-[#332c25] h-2">
            <div
              className="bg-[#c96a4d] h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {scoreMismatch && (
            <div className="mt-3 text-xs text-[#d9a441] border border-[#d9a441]/30 rounded-sm p-2">
              Warning: Score total ({totalScore}) doesn't match completed games ({actualCompletedGames}). Use the edit button to adjust scores.
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className="mb-7 md:mb-8 border border-[#463e34] rounded-sm p-5 md:p-6">
          <div className="flex justify-between items-center mb-3 relative">
            <div className="text-center flex-1">
              <div className="text-sm md:text-base text-[#8c8071] mb-2">Kenny</div>
              <div className="font-display text-4xl md:text-5xl font-semibold text-[#e08a68]">{scores.player1}</div>
            </div>
            <div className="text-2xl md:text-3xl font-semibold mx-3 md:mx-5 text-[#8c8071]">vs</div>
            <div className="text-center flex-1">
              <div className="text-sm md:text-base text-[#8c8071] mb-2">Katie</div>
              <div className="font-display text-4xl md:text-5xl font-semibold text-[#6bbdb6]">{scores.player2}</div>
            </div>
            {/* Edit Button */}
            <button
              onClick={() => setShowScoreEdit(!showScoreEdit)}
              className="absolute top-0 right-0 text-[#8c8071] hover:text-[#c9beac] text-xs px-2 py-1 uppercase tracking-wide"
              title="Edit scores"
            >
              Edit
            </button>
          </div>
          {/* Manual Score Adjustment - Hidden by default */}
          {showScoreEdit && (
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-[#463e34]">
              <div className="text-xs text-[#8c8071] mb-2 text-center">Score not right? Adjust manually:</div>
              <div className="flex gap-3 md:gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setScores(prev => ({ ...prev, player1: Math.max(0, prev.player1 - 1) }))}
                    className="border border-[#463e34] hover:border-[#c9beac] text-[#f3ead9] font-semibold py-1 px-3 rounded-sm text-sm"
                    title="Decrease Kenny's score"
                  >
                    −
                  </button>
                  <span className="text-xs md:text-sm text-[#8c8071]">Kenny</span>
                  <button
                    onClick={() => setScores(prev => ({ ...prev, player1: prev.player1 + 1 }))}
                    className="border border-[#463e34] hover:border-[#c9beac] text-[#f3ead9] font-semibold py-1 px-3 rounded-sm text-sm"
                    title="Increase Kenny's score"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setScores(prev => ({ ...prev, player2: Math.max(0, prev.player2 - 1) }))}
                    className="border border-[#463e34] hover:border-[#c9beac] text-[#f3ead9] font-semibold py-1 px-3 rounded-sm text-sm"
                    title="Decrease Katie's score"
                  >
                    −
                  </button>
                  <span className="text-xs md:text-sm text-[#8c8071]">Katie</span>
                  <button
                    onClick={() => setScores(prev => ({ ...prev, player2: prev.player2 + 1 }))}
                    className="border border-[#463e34] hover:border-[#c9beac] text-[#f3ead9] font-semibold py-1 px-3 rounded-sm text-sm"
                    title="Increase Katie's score"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Challenge Card */}
        <div className="border border-[#463e34] rounded-sm p-5 md:p-8 mb-7 md:mb-8">
          <div className="text-sm md:text-base text-[#8c8071] mb-3 uppercase tracking-wide">{challenge.phase}</div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-4 md:mb-5">
            {challenge.title}
          </h1>
          <p className="text-[#c9beac] text-lg md:text-xl leading-relaxed mb-4 md:mb-5">{description}</p>

          {/* Gram Master Round Scoreboard */}
          {currentGame === 1 && (
            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-[#463e34]">
              <div className="text-xs md:text-sm text-[#8c8071] mb-2 md:mb-3">Round Scoreboard (Best of 3)</div>
              <div className="bg-[#2b2620] rounded-sm p-3 md:p-4 mb-3 md:mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-base md:text-lg font-semibold text-[#e08a68]">Kenny</div>
                  <div className="font-display text-xl md:text-2xl font-semibold text-[#e08a68]">
                    {gramMasterRounds.player1.length} {gramMasterRounds.player1.length === 1 ? 'round' : 'rounds'}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-base md:text-lg font-semibold text-[#6bbdb6]">Katie</div>
                  <div className="font-display text-xl md:text-2xl font-semibold text-[#6bbdb6]">
                    {gramMasterRounds.player2.length} {gramMasterRounds.player2.length === 1 ? 'round' : 'rounds'}
                  </div>
                </div>
              </div>
              <div className="text-xs md:text-sm text-[#8c8071]">
                Round {gramMasterRounds.player1.length + gramMasterRounds.player2.length + 1} of 3
              </div>
            </div>
          )}

          {challenge.hasWordleLink && (
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-[#463e34]">
              <a
                href="https://garlicbread.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#c96a4d] hover:bg-[#b85c40] text-[#221e1a] font-semibold py-2 px-4 rounded-sm transition-colors text-sm md:text-base"
              >
                Open Wordle Archives (New Tab)
              </a>
            </div>
          )}
        </div>

        {/* Winner Buttons */}
        {currentGame === 1 ? (
          // Gram Master: Round winner buttons
          <div className="grid grid-cols-2 gap-4 md:gap-5">
            <button
              onClick={() => handleWinner('player1')}
              className="bg-[#e08a68] hover:bg-[#d47950] text-[#221e1a] font-semibold py-4 md:py-5 px-5 md:px-6 rounded-sm transition-colors text-lg md:text-xl"
            >
              Kenny Won This Round
            </button>
            <button
              onClick={() => handleWinner('player2')}
              className="bg-[#6bbdb6] hover:bg-[#57aba3] text-[#221e1a] font-semibold py-4 md:py-5 px-5 md:px-6 rounded-sm transition-colors text-lg md:text-xl"
            >
              Katie Won This Round
            </button>
          </div>
        ) : (
          // Normal challenge: Overall winner buttons
          <div className="grid grid-cols-2 gap-4 md:gap-5">
            <button
              onClick={() => handleWinner('player1')}
              className="bg-[#e08a68] hover:bg-[#d47950] text-[#221e1a] font-semibold py-4 md:py-5 px-5 md:px-6 rounded-sm transition-colors text-lg md:text-xl"
            >
              Kenny Won
            </button>
            <button
              onClick={() => handleWinner('player2')}
              className="bg-[#6bbdb6] hover:bg-[#57aba3] text-[#221e1a] font-semibold py-4 md:py-5 px-5 md:px-6 rounded-sm transition-colors text-lg md:text-xl"
            >
              Katie Won
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
