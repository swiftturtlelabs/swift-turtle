import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CHALLENGES, CHALLENGE_COUNT } from '../challenges.js'
import { createLocalBackend } from './localBackend.js'
import { createFirestoreBackend, peekMultiplayerSession } from './firestoreBackend.js'
import {
  applyWinner,
  createInitialSession,
  deriveScores,
  getAutoJudgeWinner,
  getChallengeDescription,
  getGramMasterRoundCounts,
  getPlayerName,
  isPartnerConnected,
  loadStoredPlayerPrefs,
  loadStoredRole,
  saveStoredPlayerPrefs,
  saveStoredRole,
  shouldAutoJudge,
  undoCurrentGame,
} from './gameLogic.js'
import { isFirebaseConfigured, initFirebase, getFirebaseStorage } from '../firebase.js'
import { uploadSessionPhoto, deleteSessionStorage } from '../photos.js'

export function useGameSession() {
  const backendRef = useRef(null)
  const unsubscribeBackendRef = useRef(null)
  const [session, setSession] = useState(() => createInitialSession())
  const [myRole, setMyRole] = useState(() => loadStoredRole() || 'player1')
  const [photos, setPhotos] = useState([])
  const [clockOffsetMs, setClockOffsetMs] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const backend = createLocalBackend()
    backendRef.current = backend
    unsubscribeBackendRef.current = backend.subscribe((s) => setSession(s))
    return () => unsubscribeBackendRef.current?.()
  }, [])

  const detachLocalBackend = useCallback(() => {
    unsubscribeBackendRef.current?.()
    unsubscribeBackendRef.current = null
  }, [])

  const scores = useMemo(() => deriveScores(session.winners), [session.winners])
  const isScorekeeper = session.mode === 'local' || session.scorekeeper === myRole
  const partnerConnected = useMemo(() => isPartnerConnected(session), [session])
  const challenge = CHALLENGES[session.currentGame] ?? null

  const switchToMultiplayer = useCallback(async () => {
    setError(null)
    try {
      await initFirebase()
      const fb = await createFirestoreBackend()
      if (!fb) {
        const message = 'Firebase is not configured. Playing in single-device mode.'
        setError(message)
        return false
      }
      detachLocalBackend()
      backendRef.current = fb
      unsubscribeBackendRef.current = fb.subscribe((s, role) => {
        setSession(s)
        if (role) setMyRole(role)
      })
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }, [detachLocalBackend])

  const runMultiplayerAction = useCallback(async (action) => {
    setLoading(true)
    setError(null)
    try {
      const ok = await switchToMultiplayer()
      if (!ok) return false
      await action()
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [switchToMultiplayer])

  const startLocalGame = useCallback(async (setup) => {
    const prefs = loadStoredPlayerPrefs()
    const players = setup.players || prefs || session.players
    saveStoredPlayerPrefs(players)
    saveStoredRole(setup.scorekeeper || myRole)
    setMyRole(setup.myRole || 'player1')
    await backendRef.current?.createSession({
      ...setup,
      players,
      mode: 'local',
      phase: 'playing',
      currentGame: 0,
    })
  }, [myRole, session.players])

  const createMultiplayerGame = useCallback(async (setup) => {
    const prefs = loadStoredPlayerPrefs()
    const players = setup.players || prefs || session.players
    saveStoredPlayerPrefs(players)
    saveStoredRole(setup.myRole || 'player1')
    setMyRole(setup.myRole || 'player1')
    return runMultiplayerAction(async () => {
      await backendRef.current?.createSession({ ...setup, players, myRole: setup.myRole || 'player1' })
    })
  }, [runMultiplayerAction, session.players])

  const joinMultiplayerGame = useCallback(async (code, role) => {
    saveStoredRole(role)
    setMyRole(role)
    return runMultiplayerAction(async () => {
      await backendRef.current?.joinSession(code, role)
    })
  }, [runMultiplayerAction])

  const peekSessionCode = useCallback(async (code) => {
    if (!isFirebaseConfigured()) return null
    try {
      await initFirebase()
      return await peekMultiplayerSession(code)
    } catch {
      return null
    }
  }, [])

  const markPresent = useCallback(async () => {
    if (session.mode !== 'multiplayer' || !session.code || !myRole) return
    await backendRef.current?.markPresent?.(myRole)
  }, [myRole, session.code, session.mode])

  const beginFromLobby = useCallback(async () => {
    if (!isScorekeeper) return
    await backendRef.current?.startGameFromLobby?.()
  }, [isScorekeeper])

  const recordWinner = useCallback(async (player) => {
    if (!isScorekeeper) return
    const next = applyWinner(session, session.currentGame, player)
    await backendRef.current?.updateSession({
      winners: next.winners,
      gramMaster: next.gramMaster,
      phase: next.phase,
      currentGame: next.currentGame,
    })
  }, [isScorekeeper, session])

  const goBack = useCallback(async () => {
    if (!isScorekeeper) return
    if (session.phase === 'halftime' || session.currentGame === -1) {
      const next = undoCurrentGame(session, 4)
      await backendRef.current?.updateSession({
        winners: next.winners,
        gramMaster: next.gramMaster,
        phase: 'playing',
        currentGame: 4,
      })
      return
    }
    if (session.phase === 'results' || session.currentGame === CHALLENGE_COUNT) {
      const next = undoCurrentGame(session, CHALLENGE_COUNT - 1)
      await backendRef.current?.updateSession({
        winners: next.winners,
        gramMaster: next.gramMaster,
        phase: 'playing',
        currentGame: CHALLENGE_COUNT - 1,
      })
      return
    }
    if (session.currentGame > 0) {
      const next = undoCurrentGame(session, session.currentGame)
      await backendRef.current?.updateSession({
        winners: next.winners,
        gramMaster: next.gramMaster,
        phase: 'playing',
        currentGame: session.currentGame - 1,
      })
    }
  }, [isScorekeeper, session])

  const continueToSecondHalf = useCallback(async () => {
    if (!isScorekeeper) return
    await backendRef.current?.updateSession({ phase: 'playing', currentGame: 5 })
  }, [isScorekeeper])

  const resetGame = useCallback(async () => {
    await backendRef.current?.deleteSession?.()
    setSession(createInitialSession())
    setPhotos([])
  }, [])

  const handoffScorekeeper = useCallback(async () => {
    const next = session.scorekeeper === 'player1' ? 'player2' : 'player1'
    await backendRef.current?.updateSession({ scorekeeper: next })
  }, [session.scorekeeper])

  const setMeasurement = useCallback(async (key, player, value) => {
    const current = session.measurements[key] || {}
    await backendRef.current?.updateField(`measurements.${key}`, { ...current, [player]: value })

    const tempSession = {
      ...session,
      measurements: { ...session.measurements, [key]: { ...current, [player]: value } },
    }
    const gameIndex = session.currentGame
    const ch = CHALLENGES[gameIndex]
    if (shouldAutoJudge(ch, tempSession, gameIndex) && isScorekeeper) {
      const winner = getAutoJudgeWinner(ch, tempSession, gameIndex)
      if (winner) {
        if (ch.gramMaster) {
          const roundIndex = tempSession.gramMaster.roundWinners.length
          const next = applyWinner(tempSession, gameIndex, winner)
          await backendRef.current?.updateSession({
            winners: next.winners,
            gramMaster: next.gramMaster,
            phase: next.phase,
            currentGame: next.currentGame,
          })
        } else {
          const next = applyWinner(tempSession, gameIndex, winner)
          await backendRef.current?.updateSession({
            winners: next.winners,
            phase: next.phase,
            currentGame: next.currentGame,
          })
        }
      }
    }
  }, [isScorekeeper, session])

  const startTimer = useCallback(async (challengeId) => {
    if (!isScorekeeper) return
    const startedAt = Date.now() + clockOffsetMs
    await backendRef.current?.updateField(`timers.${challengeId}`, {
      ...(session.timers[challengeId] || {}),
      startedAt,
      stops: {},
    })
  }, [clockOffsetMs, isScorekeeper, session.timers])

  const stopTimer = useCallback(async (challengeId) => {
    const timer = session.timers[challengeId]
    if (!timer?.startedAt) return
    const elapsed = Date.now() + clockOffsetMs - timer.startedAt
    const stops = { ...(timer.stops || {}), [myRole]: elapsed }
    await backendRef.current?.updateField(`timers.${challengeId}`, { ...timer, stops })

    const tempSession = {
      ...session,
      timers: { ...session.timers, [challengeId]: { ...timer, stops } },
    }
    const ch = CHALLENGES[session.currentGame]
    if (ch?.timer?.mode === 'estimate' && stops.player1 != null && stops.player2 != null && isScorekeeper) {
      const winner = getAutoJudgeWinner(ch, tempSession, session.currentGame)
      if (winner) {
        const next = applyWinner(tempSession, session.currentGame, winner)
        await backendRef.current?.updateSession({
          winners: next.winners,
          phase: next.phase,
          currentGame: next.currentGame,
        })
      }
    }
  }, [clockOffsetMs, isScorekeeper, myRole, session])

  const uploadPhoto = useCallback(async (challengeId, file, slot = 0) => {
    let meta
    if (session.mode === 'multiplayer' && session.code && isFirebaseConfigured()) {
      await initFirebase()
      const storage = getFirebaseStorage()
      meta = await uploadSessionPhoto({
        storage,
        sessionCode: session.code,
        challengeId,
        playerKey: myRole,
        file,
        slot,
      })
      await backendRef.current?.addPhotoMeta(challengeId, myRole, meta)
    } else {
      const url = URL.createObjectURL(await (await import('../photos.js')).downscaleToJpeg(file))
      meta = { url, timestamp: Date.now(), slot, local: true }
      backendRef.current?.registerLocalPhotoUrl?.(`${challengeId}-${myRole}-${slot}`, url)
      await backendRef.current?.addPhotoMeta(challengeId, myRole, meta)
    }
  }, [myRole, session.code, session.mode])

  const deleteGameData = useCallback(async () => {
    if (session.code && isFirebaseConfigured()) {
      await initFirebase()
      const storage = getFirebaseStorage()
      await deleteSessionStorage(storage, session.code)
    }
    await resetGame()
  }, [resetGame, session.code])

  const mergedPhotoMeta = useMemo(() => {
    const meta = JSON.parse(JSON.stringify(session.photoMeta || {}))
    photos.forEach((p) => {
      const cid = String(p.challengeId)
      if (!meta[cid]) meta[cid] = { player1: [], player2: [] }
      const list = meta[cid][p.playerKey] || []
      if (!list.some((x) => x.url === p.url)) {
        meta[cid][p.playerKey] = [...list, { url: p.url, timestamp: p.timestamp, slot: p.slot ?? 0 }]
      }
    })
    return meta
  }, [session.photoMeta, photos])

  const displaySession = useMemo(
    () => ({ ...session, photoMeta: mergedPhotoMeta }),
    [session, mergedPhotoMeta]
  )

  useEffect(() => {
    if (session.mode !== 'multiplayer' || !session.code || !backendRef.current?.subscribePhotos) return
    const unsub = backendRef.current.subscribePhotos((items) => setPhotos(items))
    return () => unsub?.()
  }, [session.code, session.mode])

  useEffect(() => {
    if (session.mode === 'multiplayer' && isFirebaseConfigured()) {
      initFirebase().then(async () => {
        const { getServerTimeOffsetMs } = await import('../firebase.js')
        const offset = await getServerTimeOffsetMs()
        setClockOffsetMs(offset)
      })
    }
  }, [session.mode])

  useEffect(() => {
    if (session.mode !== 'multiplayer' || !session.code || !myRole) return
    markPresent()
  }, [session.mode, session.code, myRole, markPresent])

  // Auto-judge watcher for when partner submits measurement
  useEffect(() => {
    if (!isScorekeeper || session.phase !== 'playing') return
    const ch = CHALLENGES[session.currentGame]
    if (!ch || !shouldAutoJudge(ch, session, session.currentGame)) return
    const winner = getAutoJudgeWinner(ch, session, session.currentGame)
    if (!winner) return

    if (ch.gramMaster && session.gramMaster.roundWinners.length < 3) {
      const already = session.gramMaster.roundWinners.length
      const roundKey = `${ch.id}_r${already}`
      const m = session.measurements[roundKey]
      if (m?.player1 != null && m?.player2 != null) {
        recordWinner(winner)
      }
    } else if (!ch.gramMaster) {
      recordWinner(winner)
    }
  }, [session, isScorekeeper, recordWinner])

  const description = getChallengeDescription(challenge, session, session.currentGame)
  const gramCounts = getGramMasterRoundCounts(session.gramMaster?.roundWinners || [])

  return {
    session: displaySession,
    rawSession: session,
    scores,
    myRole,
    isScorekeeper,
    partnerConnected,
    challenge,
    description,
    gramCounts,
    photos,
    loading,
    error,
    isFirebaseConfigured: isFirebaseConfigured(),
    clockOffsetMs,
    actions: {
      startLocalGame,
      createMultiplayerGame,
      joinMultiplayerGame,
      peekSessionCode,
      beginFromLobby,
      recordWinner,
      goBack,
      continueToSecondHalf,
      resetGame,
      handoffScorekeeper,
      setMeasurement,
      startTimer,
      stopTimer,
      uploadPhoto,
      deleteGameData,
      getPlayerName: (key) => getPlayerName(session, key),
    },
  }
}
