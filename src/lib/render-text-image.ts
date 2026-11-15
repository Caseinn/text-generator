import type { TextLayout } from '@/types'

import { DESIGN_WIDTH } from '@/lib/text-layout'

const PAPER = '#ffffff'
const INK = '#0b0b0c'

/**
 * Paints a layout onto a canvas at the requested pixel width; the height follows
 * the export shape. Ink and paper are fixed here so the file never changes with
 * the app theme.
 */
export function drawTextImage(
  canvas: HTMLCanvasElement,
  layout: TextLayout,
  inverted: boolean,
  pixelWidth: number,
): void {
  const width = Math.max(1, Math.round(pixelWidth))
  canvas.width = width
  canvas.height = Math.round((width * layout.frameHeight) / DESIGN_WIDTH)

  const context = canvas.getContext('2d')
  if (!context) return

  const scale = width / DESIGN_WIDTH
  context.setTransform(scale, 0, 0, scale, 0, 0)
  context.fillStyle = inverted ? INK : PAPER
  context.fillRect(0, 0, DESIGN_WIDTH, layout.frameHeight)
  if (layout.lines.length === 0) return

  context.fillStyle = inverted ? PAPER : INK
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.font = `${layout.fontWeight} ${layout.fontSize}px ${layout.fontStack}`

  for (const line of layout.lines) {
    const baseline = line.top + layout.lineHeightPx / 2
    for (const word of line.words) {
      context.fillText(word.text, word.x, baseline)
    }
  }
}
