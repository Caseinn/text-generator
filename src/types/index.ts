/** Card shape exported by the tool. */
export type ExportFormat = '1:1' | '3:4'

/** Pixel dimensions for one export shape. */
export interface ExportPreset {
  format: ExportFormat
  height: number
  width: number
}

/** A typeface bundled with the app. */
export type FontId =
  | 'anton'
  | 'arial-narrow'
  | 'arimo'
  | 'dm-sans'
  | 'instrument-serif'
  | 'jetbrains-mono'
  | 'space-grotesk'

/**
 * A bundled font and the CSS family name canvas draws it with. `fallback` is
 * set only on system faces, naming the bundled face to use when the platform
 * lacks the primary one.
 */
export interface FontOption {
  fallback?: string
  family: string
  id: FontId
  label: string
  weight: number
}

/** One line of placed words. */
export interface PlacedLine {
  top: number
  width: number
  words: PlacedWord[]
}

/** One word placed in the design frame. */
export interface PlacedWord {
  text: string
  width: number
  x: number
}

/** How words sit inside a line; `justify` stretches every line but the last. */
export type TextAlign = 'center' | 'justify' | 'left'

/** Everything needed to lay out and draw one text card. */
export interface TextImageSettings {
  align: TextAlign
  autoSize: boolean
  font: FontId
  fontSize: number
  format: ExportFormat
  invert: boolean
  lineHeight: number
  lowRes: boolean
  paddingX: number
  paddingY: number
  text: string
  uppercase: boolean
}

/**
 * Resolution-independent result of fitting the text into the frame, shared by
 * the preview and the export so both stay pixel-identical at any size.
 */
export interface TextLayout {
  contentHeight: number
  contentWidth: number
  fontSize: number
  fontStack: string
  fontWeight: number
  frameHeight: number
  lineHeightPx: number
  lines: PlacedLine[]
  overflow: boolean
}
