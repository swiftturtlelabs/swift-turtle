import { createInitialSession } from './gameLogic.js'

export function createLocalBackend() {
  let session = createInitialSession()
  const listeners = new Set()
  const photoUrls = new Map()

  const notify = () => {
    listeners.forEach((fn) => fn(session))
  }

  return {
    subscribe(callback) {
      listeners.add(callback)
      callback(session)
      return () => listeners.delete(callback)
    },

    getSession() {
      return session
    },

    async createSession(setup) {
      session = createInitialSession({
        ...setup,
        mode: 'local',
        code: null,
        phase: 'playing',
        currentGame: 0,
      })
      notify()
      return session
    },

    async updateSession(partial) {
      session = { ...session, ...partial }
      notify()
      return session
    },

    async updateField(path, value) {
      session = setNestedValue({ ...session }, path, value)
      notify()
      return session
    },

    async recordWinner(gameIndex, player) {
      // handled by useGameSession via gameLogic
      return session
    },

    async addPhotoMeta(challengeId, playerKey, meta) {
      const key = String(challengeId)
      const existing = session.photoMeta[key] || { player1: [], player2: [] }
      const list = [...(existing[playerKey] || []), meta]
      session = {
        ...session,
        photoMeta: {
          ...session.photoMeta,
          [key]: { ...existing, [playerKey]: list },
        },
      }
      notify()
      return meta
    },

    registerLocalPhotoUrl(id, url) {
      photoUrls.set(id, url)
    },

    getLocalPhotoUrl(id) {
      return photoUrls.get(id)
    },

    async deleteSession() {
      photoUrls.forEach((url) => URL.revokeObjectURL(url))
      photoUrls.clear()
      session = createInitialSession()
      notify()
    },
  }
}

function setNestedValue(obj, path, value) {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    cur[key] = { ...(cur[key] || {}) }
    cur = cur[key]
  }
  cur[parts[parts.length - 1]] = value
  return obj
}
