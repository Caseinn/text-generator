import type { ExportFormat, ExportPreset } from '@/types'

/** Width of low-res exports, close to the softest reference cards. */
export const LOW_RES_WIDTH = 240

/** Export shapes; both are 1080 wide, so type sizes can be compared directly. */
export const EXPORT_PRESETS: readonly ExportPreset[] = [
  { format: '1:1', height: 1080, width: 1080 },
  { format: '3:4', height: 1440, width: 1080 },
]

/** Resolves an export shape to its pixel dimensions. */
export function getExportPreset(format: ExportFormat): ExportPreset {
  return (
    EXPORT_PRESETS.find((preset) => preset.format === format) ??
    EXPORT_PRESETS[0]
  )
}

/** Pixel dimensions for a shape, adjusted for low-res. */
export function resolveExportSize(
  format: ExportFormat,
  lowRes: boolean,
): ExportPreset {
  const preset = getExportPreset(format)
  if (!lowRes) return preset
  return {
    format,
    height: Math.round((LOW_RES_WIDTH * preset.height) / preset.width),
    width: LOW_RES_WIDTH,
  }
}
