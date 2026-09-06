import { describe, it, expect } from 'vitest'
import {
  deriveScores,
  closestPlayer,
  closestTimerPlayer,
  getGramMasterOverallWinner,
  applyWinner,
  createInitialSession,
  undoCurrentGame,
} from './gameLogic.js'

describe('gameLogic', () => {
  it('derives scores from winners only', () => {
    const scores = deriveScores({ 1: 'player1', 2: 'player2', 3: 'player1' })
    expect(scores).toEqual({ player1: 2, player2: 1 })
  })

  it('picks closest measurement player', () => {
    expect(closestPlayer({ player1: 4.2, player2: 3.9 }, 4)).toBe('player2')
    expect(closestPlayer({ player1: 200, player2: 195 }, 200)).toBe('player1')
  })

  it('picks closest timer stop', () => {
    expect(closestTimerPlayer({ player1: 61000, player2: 58000 }, 60000)).toBe('player1')
  })

  it('resolves gram master overall winner', () => {
    expect(getGramMasterOverallWinner(['player1', 'player1', 'player2'])).toBe('player1')
    expect(getGramMasterOverallWinner(['player1', 'player2'])).toBe('player2')
  })

  it('applies gram master round without advancing until round 3', () => {
    const session = createInitialSession({ phase: 'playing', currentGame: 1 })
    const r1 = applyWinner(session, 1, 'player1')
    expect(r1.advance).toBe(false)
    expect(r1.gramMaster.roundWinners).toEqual(['player1'])
    expect(r1.winners[2]).toBeUndefined()
  })

  it('advances to halftime after game 5', () => {
    let session = createInitialSession({ phase: 'playing', currentGame: 4 })
    session = applyWinner(session, 4, 'player1')
    expect(session.phase).toBe('halftime')
    expect(session.currentGame).toBe(-1)
  })

  it('undoes gram master round exactly', () => {
    let session = createInitialSession({ phase: 'playing', currentGame: 1 })
    session = { ...session, gramMaster: { targets: [100, 200, 300], roundWinners: ['player1', 'player2'] } }
    const undone = undoCurrentGame(session, 1)
    expect(undone.gramMaster.roundWinners).toEqual(['player1'])
  })
})
