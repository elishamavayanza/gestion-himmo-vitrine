import { useCallback, useSyncExternalStore } from 'react'
import { isClient, matchesQuery } from '../services/device'

/** Suit une media query sans installer de listener global de redimensionnement. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    if (!isClient || typeof window.matchMedia !== 'function') return () => undefined

    const mediaQueryList = window.matchMedia(query)
    const handler = () => onStoreChange()

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', handler)
      return () => mediaQueryList.removeEventListener('change', handler)
    }

    mediaQueryList.addListener(handler)
    return () => mediaQueryList.removeListener(handler)
  }, [query])

  const getSnapshot = useCallback(() => matchesQuery(query), [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
