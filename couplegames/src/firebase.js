let firebaseApp = null
let firestore = null
let storage = null

export function isFirebaseConfigured() {
  return Boolean(import.meta.env.VITE_FIREBASE_API_KEY)
}

export async function initFirebase() {
  if (!isFirebaseConfigured()) {
    return { app: null, firestore: null, storage: null }
  }

  if (firebaseApp) {
    return { app: firebaseApp, firestore, storage }
  }

  const { initializeApp } = await import('firebase/app')
  const { getFirestore } = await import('firebase/firestore')
  const { getStorage } = await import('firebase/storage')

  firebaseApp = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: 'photoscavenger-b16e2.firebaseapp.com',
    projectId: 'photoscavenger-b16e2',
    storageBucket: 'photoscavenger-b16e2.firebasestorage.app',
    messagingSenderId: '881782611399',
    appId: '1:881782611399:web:58cea3183bb8995afd8de2',
    measurementId: 'G-SZ9ZKHW7SH',
  })

  firestore = getFirestore(firebaseApp)
  storage = getStorage(firebaseApp)

  return { app: firebaseApp, firestore, storage }
}

export function getFirebaseFirestore() {
  return firestore
}

export function getFirebaseStorage() {
  return storage
}

export async function getServerTimeOffsetMs() {
  if (!firestore) return 0
  const { doc, setDoc, getDoc, serverTimestamp, deleteDoc } = await import('firebase/firestore')
  const ref = doc(firestore, 'couplegamesSessions', '_timeProbe')
  const localBefore = Date.now()
  await setDoc(ref, { t: serverTimestamp() })
  const snap = await getDoc(ref)
  const localAfter = Date.now()
  const serverTime = snap.data()?.t?.toMillis?.() ?? localAfter
  await deleteDoc(ref).catch(() => {})
  const localMid = (localBefore + localAfter) / 2
  return serverTime - localMid
}
