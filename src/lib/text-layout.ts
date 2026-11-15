import type {
  PlacedLine,
  PlacedWord,
  TextAlign,
  TextImageSettings,
  TextLayout,
} from '@/types'

import { getExportPreset } from '@/lib/export-presets'
import { fontStack, getFont } from '@/lib/fonts'

/** Width of the design frame; every measurement is expressed in these units. */
export const DESIGN_WIDTH = 1000

/** Converts design units to pixels at a given export width. */
export function toExportPixels(value: number, exportWidth: number): number {
  return Math.round((value * exportWidth) / DESIGN_WIDTH)
}

const MEASURE_SIZE = 100
const MIN_FONT_SIZE = 12
const MAX_FONT_SIZE = DESIGN_WIDTH
const FIT_EPSILON = 0.5

let measureContext: CanvasRenderingContext2D | null = null

interface WordMetrics {
  space: number
  widths: Map<string, number>
}

interface WrappedLine {
  paragraphEnd: boolean
  width: number
  words: string[]
}

/**
 * Wraps, sizes and justifies the text inside the frame. Measurement happens at
 * 100px and scales linearly, so the result is identical at every export size.
 */
export function layoutText(settings: TextImageSettings): TextLayout {
  const font = getFont(settings.font)
  const paragraphs = splitParagraphs(settings.text, settings.uppercase)
  const preset = getExportPreset(settings.format)
  const frameHeight = (DESIGN_WIDTH * preset.height) / preset.width
  const paddingX = (settings.paddingX / 100) * DESIGN_WIDTH
  const paddingY = (settings.paddingY / 100) * frameHeight
  const contentWidth = Math.max(0, DESIGN_WIDTH - paddingX * 2)
  const contentHeight = Math.max(0, frameHeight - paddingY * 2)
  const lineHeight = Math.max(0.8, settings.lineHeight)
  const stack = fontStack(font)
  const emptyLayout: TextLayout = {
    contentHeight,
    contentWidth,
    fontSize: settings.fontSize,
    fontStack: stack,
    fontWeight: font.weight,
    frameHeight,
    lineHeightPx: settings.fontSize * lineHeight,
    lines: [],
    overflow: false,
  }

  if (paragraphs.length === 0 || contentWidth <= 0 || contentHeight <= 0) {
    return emptyLayout
  }

  const metrics = measureWords(paragraphs, stack, font.weight)
  const fontSize = settings.autoSize
    ? fitFontSize(paragraphs, metrics, contentWidth, contentHeight, lineHeight)
    : settings.fontSize
  const wrapped = wrapLines(paragraphs, metrics, fontSize, contentWidth)
  const lineHeightPx = fontSize * lineHeight
  const blockTop =
    paddingY + Math.max(0, (contentHeight - wrapped.length * lineHeightPx) / 2)

  const lines: PlacedLine[] = wrapped.map((line, index) => {
    const wordWidths = line.words.map(
      (word) => (metrics.widths.get(word) ?? 0) * fontSize,
    )
    const wordsWidth = wordWidths.reduce((sum, width) => sum + width, 0)
    const shouldJustify =
      settings.align === 'justify' &&
      !line.paragraphEnd &&
      line.words.length > 1
    const gap = shouldJustify
      ? Math.max(0, (contentWidth - wordsWidth) / (line.words.length - 1))
      : metrics.space * fontSize

    let cursorX = resolveStartX(
      settings.align,
      paddingX,
      contentWidth,
      line.width,
    )
    const words: PlacedWord[] = line.words.map((word, wordIndex) => {
      const width = wordWidths[wordIndex] ?? 0
      const placed = { text: word, width, x: cursorX }
      cursorX += width + gap
      return placed
    })

    return {
      top: blockTop + index * lineHeightPx,
      width: line.width,
      words,
    }
  })

  return {
    ...emptyLayout,
    fontSize,
    lineHeightPx,
    lines,
    overflow: !fitsFrame(
      wrapped,
      fontSize,
      lineHeight,
      contentWidth,
      contentHeight,
    ),
  }
}

function fitFontSize(
  paragraphs: string[][],
  metrics: WordMetrics,
  contentWidth: number,
  contentHeight: number,
  lineHeight: number,
): number {
  let best = MIN_FONT_SIZE
  let low = MIN_FONT_SIZE
  let high = MAX_FONT_SIZE

  while (low <= high) {
    const size = Math.floor((low + high) / 2)
    const lines = wrapLines(paragraphs, metrics, size, contentWidth)
    if (fitsFrame(lines, size, lineHeight, contentWidth, contentHeight)) {
      best = size
      low = size + 1
    } else {
      high = size - 1
    }
  }

  return best
}

function fitsFrame(
  lines: WrappedLine[],
  fontSize: number,
  lineHeight: number,
  contentWidth: number,
  contentHeight: number,
): boolean {
  if (lines.length === 0) return true
  if (lines.some((line) => line.width > contentWidth + FIT_EPSILON)) {
    return false
  }
  return lines.length * fontSize * lineHeight <= contentHeight + FIT_EPSILON
}

function getMeasureContext(): CanvasRenderingContext2D {
  measureContext ??= document.createElement('canvas').getContext('2d')
  if (!measureContext) {
    throw new Error('This browser does not expose a 2D canvas context.')
  }
  return measureContext
}

function measureWords(
  paragraphs: string[][],
  stack: string,
  weight: number,
): WordMetrics {
  const context = getMeasureContext()
  context.font = `${weight} ${MEASURE_SIZE}px ${stack}`

  const widths = new Map<string, number>()
  for (const words of paragraphs) {
    for (const word of words) {
      if (!widths.has(word)) {
        widths.set(word, context.measureText(word).width / MEASURE_SIZE)
      }
    }
  }

  return { space: context.measureText(' ').width / MEASURE_SIZE, widths }
}

function resolveStartX(
  align: TextAlign,
  paddingX: number,
  contentWidth: number,
  lineWidth: number,
): number {
  if (align !== 'center') return paddingX
  return paddingX + Math.max(0, (contentWidth - lineWidth) / 2)
}

function splitParagraphs(text: string, uppercase: boolean): string[][] {
  const paragraphs = text
    .split(/\r?\n/)
    .map((paragraph) => paragraph.trim().split(/\s+/).filter(Boolean))
    .filter((words) => words.length > 0)

  if (!uppercase) return paragraphs
  return paragraphs.map((words) => words.map((word) => word.toUpperCase()))
}

function wrapLines(
  paragraphs: string[][],
  metrics: WordMetrics,
  fontSize: number,
  contentWidth: number,
): WrappedLine[] {
  const lines: WrappedLine[] = []
  const spaceWidth = metrics.space * fontSize

  for (const paragraph of paragraphs) {
    let words: string[] = []
    let width = 0

    for (const word of paragraph) {
      const wordWidth = (metrics.widths.get(word) ?? 0) * fontSize

      if (words.length === 0) {
        words = [word]
        width = wordWidth
        continue
      }

      const nextWidth = width + spaceWidth + wordWidth
      if (nextWidth <= contentWidth) {
        words.push(word)
        width = nextWidth
      } else {
        lines.push({ paragraphEnd: false, width, words })
        words = [word]
        width = wordWidth
      }
    }

    lines.push({ paragraphEnd: true, width, words })
  }

  return lines
}
