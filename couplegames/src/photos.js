const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.8

export async function downscaleToJpeg(file, maxDimension = MAX_DIMENSION, quality = JPEG_QUALITY) {
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
    return resizeJpeg(file, maxDimension, quality)
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to encode image'))
            return
          }
          resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }))
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

function resizeJpeg(file, maxDimension, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      if (img.width <= maxDimension && img.height <= maxDimension) {
        resolve(file)
        return
      }
      const canvas = document.createElement('canvas')
      const scale = maxDimension / Math.max(img.width, img.height)
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to encode image'))
            return
          }
          resolve(new File([blob], file.name, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

export function createLocalPhotoUrl(file) {
  return URL.createObjectURL(file)
}

export async function uploadSessionPhoto({ storage, sessionCode, challengeId, playerKey, file, slot = 0 }) {
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
  const ts = Date.now()
  const path = `couplegames/${sessionCode}/${challengeId}/${playerKey}-${slot}-${ts}.jpg`
  const storageRef = ref(storage, path)
  const processed = await downscaleToJpeg(file)
  await uploadBytes(storageRef, processed)
  const url = await getDownloadURL(storageRef)
  return { url, path, timestamp: ts, slot }
}

export async function deleteSessionStorage(storage, sessionCode) {
  const { ref, listAll, deleteObject } = await import('firebase/storage')
  const folderRef = ref(storage, `couplegames/${sessionCode}`)
  try {
    const listing = await listAll(folderRef)
    await Promise.all(listing.items.map((item) => deleteObject(item)))
    await Promise.all(
      listing.prefixes.map(async (prefix) => {
        const nested = await listAll(prefix)
        await Promise.all(nested.items.map((item) => deleteObject(item)))
      })
    )
  } catch {
    // folder may not exist
  }
}
