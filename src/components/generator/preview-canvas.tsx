import type { TextImageSettings, TextLayout } from '@/types'

import { usePreviewCanvas } from '@/hooks/use-preview-canvas'
import { resolveExportSize } from '@/lib/export-presets'
import { toExportPixels } from '@/lib/text-layout'

interface PreviewCanvasProps {
  layout: TextLayout
  ready: boolean
  settings: TextImageSettings
}

/** The live card preview, drawn from the same layout the export uses. */
export function PreviewCanvas({ layout, ready, settings }: PreviewCanvasProps) {
  const exportSize = resolveExportSize(settings.format, settings.lowRes)
  const { canvasRef, hostRef } = usePreviewCanvas(
    layout,
    settings.invert,
    ready,
    settings.lowRes ? exportSize.width : undefined,
  )
  const exportedPx = toExportPixels(layout.fontSize, exportSize.width)
  const hasLines = layout.lines.length > 0

  let typeReadout = 'no type'
  if (!ready) typeReadout = 'loading type…'
  else if (hasLines) typeReadout = `${exportedPx} px type`

  return (
    <section className="flex flex-col gap-3 self-start">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          Preview
        </h2>
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground tabular-nums">
          <span>
            {exportSize.width} × {exportSize.height}
          </span>
          <span aria-hidden="true" className="text-border">
            /
          </span>
          <span>{typeReadout}</span>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-xl border bg-muted shadow-sm"
        ref={hostRef}
      >
        <canvas
          aria-label="Rendered text card preview"
          className="block w-full"
          ref={canvasRef}
          role="img"
          style={{ aspectRatio: `${exportSize.width} / ${exportSize.height}` }}
        />
      </div>

      {layout.overflow ? (
        <p className="text-xs text-destructive">
          The text doesn't fit the frame. Turn on auto size or lower the type
          size.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Justified lines fill the width. The last line stays left.
        </p>
      )}
    </section>
  )
}
