import type { FontId, FontOption } from '@/types'

const DEFAULT_FONT: FontOption = {
  fallback: 'Archivo Narrow Variable',
  family: 'Arial Narrow',
  id: 'arial-narrow',
  label: 'Arial Narrow',
  weight: 400,
}

/**
 * One face per type category. Arial Narrow is the reference face and is used
 * when the platform ships it; Archivo Narrow is its fallback and is not offered
 * in the picker.
 */
export const FONT_OPTIONS: readonly FontOption[] = [
  DEFAULT_FONT,
  { family: 'Arimo', id: 'arimo', label: 'Arimo (Arial)', weight: 400 },
  {
    family: 'Space Grotesk Variable',
    id: 'space-grotesk',
    label: 'Space Grotesk',
    weight: 400,
  },
  { family: 'DM Sans Variable', id: 'dm-sans', label: 'DM Sans', weight: 400 },
  { family: 'Anton', id: 'anton', label: 'Anton', weight: 400 },
  {
    family: 'JetBrains Mono Variable',
    id: 'jetbrains-mono',
    label: 'JetBrains Mono',
    weight: 400,
  },
  {
    family: 'Instrument Serif',
    id: 'instrument-serif',
    label: 'Instrument Serif',
    weight: 400,
  },
]

/** CSS family list for canvas: the system face first, the bundled one behind it. */
export function fontStack(font: FontOption): string {
  const families =
    font.fallback && font.fallback !== font.family
      ? [font.family, font.fallback]
      : [font.family]
  return `${families.map((family) => `"${family}"`).join(', ')}, system-ui, sans-serif`
}

/** Resolves a font id, falling back to the default so rendering never fails. */
export function getFont(id: FontId): FontOption {
  return FONT_OPTIONS.find((font) => font.id === id) ?? DEFAULT_FONT
}

/**
 * Waits until the face the platform will use is ready, and skips the bundled
 * fallback when the system face exists.
 */
export async function loadFont(font: FontOption): Promise<void> {
  if (!document.fonts.check(`${font.weight} 100px "${font.family}"`)) {
    await document.fonts.load(
      `${font.weight} 100px "${font.fallback ?? font.family}"`,
    )
  }
  await document.fonts.ready
}
