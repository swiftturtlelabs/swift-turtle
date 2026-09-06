export function withTimeout(promise, ms, message = 'Request timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms)
    }),
  ])
}

export function getFriendlyFirestoreError(error) {
  const code = error?.code || ''
  const message = error?.message || String(error)

  if (code === 'permission-denied' || /insufficient permissions/i.test(message)) {
    return 'Could not reach the game server (permission denied). Firestore rules may need to be deployed.'
  }
  if (code === 'unavailable' || /offline/i.test(message)) {
    return 'Could not reach the game server. Check your connection and try again.'
  }
  if (/timed out/i.test(message)) {
    return 'Creating the game took too long. Check your connection and try again.'
  }
  if (/Firestore API has not been used/i.test(message)) {
    return 'Multiplayer is not set up yet on this Firebase project.'
  }

  return message || 'Something went wrong creating the game.'
}
