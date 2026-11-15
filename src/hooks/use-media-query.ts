import { useSyncExternalStore } from 'react'

/**
 * Tracks a media query so layout can mount one control surface instead of two
 * copies hidden by CSS, which would duplicate field ids across the page.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const list = window.matchMedia(query)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
