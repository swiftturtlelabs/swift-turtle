const APP_STORAGE_KEYS = ['couplegames_players', 'couplegames_role']

export async function clearAppCacheAndRefresh() {
  try {
    APP_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  } catch {
    // ignore
  }

  if ('caches' in window) {
    try {
      const names = await caches.keys()
      await Promise.all(names.map((name) => caches.delete(name)))
    } catch {
      // ignore
    }
  }

  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))
    } catch {
      // ignore
    }
  }

  const url = new URL(window.location.href)
  url.searchParams.set('fresh', Date.now().toString())
  window.location.replace(url.toString())
}

export function promptClearCacheAndRefresh() {
  const ok = window.confirm(
    'Clear saved player settings and reload the latest version?\n\nUse this if the app looks outdated or stuck.'
  )
  if (ok) clearAppCacheAndRefresh()
}
