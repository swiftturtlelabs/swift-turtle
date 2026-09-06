import { useCallback, useRef } from 'react'
import { promptClearCacheAndRefresh } from '../cacheReset.js'

const TAPS_NEEDED = 5
const TAP_WINDOW_MS = 3000

export function useCacheResetTap() {
  const tapCountRef = useRef(0)
  const timerRef = useRef(null)

  return useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    tapCountRef.current += 1
    if (tapCountRef.current >= TAPS_NEEDED) {
      tapCountRef.current = 0
      promptClearCacheAndRefresh()
      return
    }

    timerRef.current = setTimeout(() => {
      tapCountRef.current = 0
    }, TAP_WINDOW_MS)
  }, [])
}

export function AppTitle({ children, className = '' }) {
  const onTitleTap = useCacheResetTap()

  return (
    <h1
      className={className}
      onClick={onTitleTap}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onTitleTap()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Couple's Challenge"
    >
      {children}
    </h1>
  )
}
