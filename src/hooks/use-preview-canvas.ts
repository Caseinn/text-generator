import type { RefObject } from 'react'

import { useEffect, useRef } from 'react'

import type { TextLayout } from '@/types'

import { drawTextImage } from '@/lib/render-text-image'

interface PreviewCanvasRefs {
  canvasRef: RefObject<HTMLCanvasElement | null>
  cardRef: RefObject<HTMLDivElement | null>
  plateRef: RefObject<HTMLDivElement | null>
}

/**
 * Fits the card into the stage at the export's aspect ratio and draws the shared
 * layout at device resolution. The card is absolutely positioned inside a
 * measured plate, so the size it receives can never feed back into the box that
 * measured it, and the box always matches the bitmap.
 */
export function usePreviewCanvas(
  layout: TextLayout,
  inverted: boolean,
  ready: boolean,
  ratio: number,
  bitmapWidth?: number,
): PreviewCanvasRefs {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const plateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const card = cardRef.current
    const plate = plateRef.current
    if (!canvas || !card || !plate) return undefined

    const draw = () => {
      const box = plate.getBoundingClientRect()
      if (box.width <= 0 || box.height <= 0) return

      const width = Math.floor(Math.min(box.width, box.height * ratio))
      const height = Math.floor(width / ratio)
      card.style.width = `${width}px`
      card.style.height = `${height}px`
      if (!ready) return

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      drawTextImage(canvas, layout, inverted, bitmapWidth ?? Math.round(width * pixelRatio))
    }

    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(plate)
    window.addEventListener('resize', draw)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', draw)
    }
  }, [bitmapWidth, inverted, layout, ratio, ready])

  return { canvasRef, cardRef, plateRef }
}
