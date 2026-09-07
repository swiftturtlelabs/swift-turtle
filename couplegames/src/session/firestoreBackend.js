import { createInitialSession, normalizePresence } from './gameLogic.js'
import { generateSessionCode, normalizeSessionCode } from './sessionCode.js'
import { initFirebase } from '../firebase.js'
import { getFriendlyFirestoreError, withTimeout } from '../asyncUtils.js'

const COLLECTION = 'couplegamesSessions'
const FIRESTORE_TIMEOUT_MS = 15000

export async function peekMultiplayerSession(codeInput) {
  const { firestore } = await initFirebase()
  if (!firestore) return null

  const { doc, getDoc } = await import('firebase/firestore')
  const code = normalizeSessionCode(codeInput)
  if (code.length !== 4) return null

  try {
    const snap = await withTimeout(
      getDoc(doc(firestore, COLLECTION, code)),
      FIRESTORE_TIMEOUT_MS,
      'Timed out while looking up the game code'
    )
    if (!snap.exists()) return null
    const data = snap.data()
    return {
      code,
      players: data.players,
      scorekeeper: data.scorekeeper,
      prize: data.prize,
      phase: data.phase,
      presence: normalizePresence(data.presence),
    }
  } catch {
    return null
  }
}

export async function createFirestoreBackend() {
  const { firestore } = await initFirebase()
  if (!firestore) return null

  const {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot,
    deleteDoc,
    serverTimestamp,
    collection,
    addDoc,
    getDocs,
    query,
    where,
  } = await import('firebase/firestore')

  let session = createInitialSession({ mode: 'multiplayer' })
  let myRole = null
  const listeners = new Set()
  let unsubscribe = null

  const notify = () => listeners.forEach((fn) => fn(session, myRole))

  const subscribeToCode = (code) => {
    if (unsubscribe) unsubscribe()
    const ref = doc(firestore, COLLECTION, code)
    unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        session = normalizeFirestoreSession(snap.data(), code)
        notify()
      }
    })
  }

  return {
    subscribe(callback) {
      listeners.add(callback)
      callback(session, myRole)
      return () => listeners.delete(callback)
    },

    getSession() {
      return session
    },

    getMyRole() {
      return myRole
    },

    setMyRole(role) {
      myRole = role
      notify()
    },

    async createSession(setup) {
      let code = generateSessionCode()
      let attempts = 0
      while (attempts < 10) {
        const ref = doc(firestore, COLLECTION, code)
        const existing = await withTimeout(
          getDoc(ref),
          FIRESTORE_TIMEOUT_MS,
          'Timed out while reserving a session code'
        )
        if (!existing.exists()) break
        code = generateSessionCode()
        attempts++
      }

      const role = setup.myRole || 'player1'
      const data = {
        ...createInitialSession({
          ...setup,
          mode: 'multiplayer',
          code,
          phase: 'lobby',
          currentGame: 0,
          presence: {
            player1: role === 'player1',
            player2: role === 'player2',
          },
        }),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      try {
        await withTimeout(
          setDoc(doc(firestore, COLLECTION, code), stripLocalFields(data)),
          FIRESTORE_TIMEOUT_MS,
          'Timed out while creating the game session'
        )
      } catch (error) {
        throw new Error(getFriendlyFirestoreError(error))
      }

      myRole = setup.myRole || 'player1'
      subscribeToCode(code)
      session = { ...data, code }
      notify()
      return session
    },

    async markPresent(role) {
      if (!session.code || !role) return
      await this.updateField(`presence.${role}`, true)
    },

    async joinSession(codeInput, role) {
      const code = normalizeSessionCode(codeInput)
      const ref = doc(firestore, COLLECTION, code)
      let snap
      try {
        snap = await withTimeout(
          getDoc(ref),
          FIRESTORE_TIMEOUT_MS,
          'Timed out while joining the game'
        )
      } catch (error) {
        throw new Error(getFriendlyFirestoreError(error))
      }
      if (!snap.exists()) throw new Error('Session not found')

      const data = snap.data()
      const joinRole = role === 'player1' ? 'player1' : 'player2'

      myRole = joinRole
      try {
        await withTimeout(
          updateDoc(ref, { [`presence.${joinRole}`]: true, updatedAt: serverTimestamp() }),
          FIRESTORE_TIMEOUT_MS,
          'Timed out while joining the game'
        )
      } catch (error) {
        throw new Error(getFriendlyFirestoreError(error))
      }

      subscribeToCode(code)
      session = normalizeFirestoreSession(snap.data(), code)
      notify()
      return session
    },

    async updateSession(partial) {
      if (!session.code) return session
      const ref = doc(firestore, COLLECTION, session.code)
      await updateDoc(ref, { ...stripLocalFields(partial), updatedAt: serverTimestamp() })
      return session
    },

    async updateField(path, value) {
      if (!session.code) return session
      const ref = doc(firestore, COLLECTION, session.code)
      await updateDoc(ref, { [path]: value, updatedAt: serverTimestamp() })
      return session
    },

    async startGameFromLobby() {
      return this.updateSession({ phase: 'playing', currentGame: 0 })
    },

    async addPhotoMeta(challengeId, playerKey, meta) {
      if (!session.code) return meta
      const photosRef = collection(firestore, COLLECTION, session.code, 'photos')
      await addDoc(photosRef, {
        challengeId,
        playerKey,
        ...meta,
        createdAt: serverTimestamp(),
      })
      return meta
    },

    subscribePhotos(callback) {
      if (!session.code) return () => {}
      const photosRef = collection(firestore, COLLECTION, session.code, 'photos')
      return onSnapshot(photosRef, (snap) => {
        const items = []
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }))
        callback(items)
      })
    },

    async deleteSession() {
      if (!session.code) return
      const code = session.code
      const photosRef = collection(firestore, COLLECTION, code, 'photos')
      const photosSnap = await getDocs(photosRef)
      await Promise.all(photosSnap.docs.map((d) => deleteDoc(d.ref)))
      await deleteDoc(doc(firestore, COLLECTION, code))
      if (unsubscribe) unsubscribe()
      session = createInitialSession({ mode: 'multiplayer' })
      myRole = null
      notify()
    },
  }
}

function stripLocalFields(data) {
  const { myRole, ...rest } = data
  return rest
}

function normalizeFirestoreSession(data, code) {
  return {
    ...createInitialSession(),
    ...data,
    code,
    gramMaster: data.gramMaster || { targets: [], roundWinners: [] },
    winners: data.winners || {},
    timers: data.timers || {},
    measurements: data.measurements || {},
    photoMeta: data.photoMeta || {},
    presence: normalizePresence(data.presence),
  }
}
