import type { RefObject } from 'react'

import { useEffect, useRef } from 'react'

import type { TextLayout } from '@/types'

import { drawTextImage } from '@/lib/render-text-image'

interface PreviewCanvasRefs {
  canvasRef: RefObject<HTMLCanvasElement | null>
  hostRef: RefObject<HTMLDivElement | null>
}

/**
 * Keeps a preview canvas at device resolution and redraws it whenever the layout
 * changes, waiting for the font so the preview matches the export.
 */
export function usePreviewCanvas(
  layout: TextLayout,
  inverted: boolean,
  ready: boolean,
  bitmapWidth?: number,
): PreviewCanvasRefs {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return undefined

    const render = () => {
      const cssSize = Math.floor(host.clientWidth)
      if (!ready || cssSize <= 0) return
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      drawTextImage(canvas, layout, inverted, bitmapWidth ?? cssSize * ratio)
    }

    render()
    const observer = new ResizeObserver(render)
    observer.observe(host)
    return () => observer.disconnect()
  }, [bitmapWidth, inverted, layout, ready])

  return { canvasRef, hostRef }
}
