import { useEffect, useState } from 'react'

import type { FontOption } from '@/types'

import { loadFont } from '@/lib/fonts'

/** True once the face is loaded, so layout never uses fallback metrics. */
export function useFontReady(font: FontOption): boolean {
  const key = `${font.weight} ${font.family}`
  const [loadedKey, setLoadedKey] = useState<null | string>(null)

  useEffect(() => {
    let active = true

    loadFont(font)
      .catch(() => undefined)
      .then(() => {
        if (active) setLoadedKey(key)
      })

    return () => {
      active = false
    }
  }, [font, key])

  return loadedKey === key
}
