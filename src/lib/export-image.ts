import type { TextImageSettings, TextLayout } from '@/types'

import { resolveExportSize } from '@/lib/export-presets'
import { getFont, loadFont } from '@/lib/fonts'
import { drawTextImage } from '@/lib/render-text-image'

/** Copies a PNG to the clipboard; false means the browser refused. */
export async function copyImageBlob(blob: Blob): Promise<boolean> {
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return true
  } catch {
    return false
  }
}

/** Rasterizes the shared layout at the configured export shape. */
export async function createImageBlob(
  settings: TextImageSettings,
  layout: TextLayout,
): Promise<Blob> {
  await loadFont(getFont(settings.font))

  const preset = resolveExportSize(settings.format, settings.lowRes)
  const canvas = document.createElement('canvas')
  drawTextImage(canvas, layout, settings.invert, preset.width)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('The browser could not encode the image.'))
    }, 'image/png')
  })
}

/** Saves a blob through a temporary link, then releases the object URL. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Timestamped file name so repeated exports never overwrite each other. */
export function exportFilename(date: Date = new Date()): string {
  const stamp = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
    pad(date.getMilliseconds(), 3),
  ].join('')
  return `text-${stamp}.png`
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0')
}
