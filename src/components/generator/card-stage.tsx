import type { TextImageSettings, TextLayout } from '@/types'

import { usePreviewCanvas } from '@/hooks/use-preview-canvas'
import { resolveExportSize } from '@/lib/export-presets'
import { toExportPixels } from '@/lib/text-layout'

interface CardStageProps {
  layout: TextLayout
  onToggleFormat: () => void
  ready: boolean
  settings: TextImageSettings
}

/**
 * The card stage: one plate at the export's true aspect ratio, fitted to the
 * space the layout leaves it, so a laptop and a phone both show the whole card.
 * Every readout here describes the file, not the screen.
 */
export function CardStage({ layout, onToggleFormat, ready, settings }: CardStageProps) {
  const exportSize = resolveExportSize(settings.format, settings.lowRes)
  const ratio = exportSize.width / exportSize.height
  const { canvasRef, cardRef, plateRef } = usePreviewCanvas(
    layout,
    settings.invert,
    ready,
    ratio,
    settings.lowRes ? exportSize.width : undefined,
  )
  const exportedPx = toExportPixels(layout.fontSize, exportSize.width)
  const lines = layout.lines.length

  let status = 'Loading type'
  if (ready && lines > 0) status = `${lines} ${lines === 1 ? 'line' : 'lines'}`
  else if (ready) status = 'No text'

  return (
    <section
      aria-label="Card preview"
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-stage"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 pt-3 sm:px-6 sm:pt-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {settings.invert ? 'White on black' : 'Black on white'}
          </span>
          {layout.overflow ? (
            <span className="flex items-center gap-1 rounded-full bg-signal-soft px-2 py-0.5 text-[11px] font-medium text-signal">
              Overflow
            </span>
          ) : null}
        </div>
        <dl className="flex min-w-0 items-center gap-x-3 text-[11px] tabular-nums text-muted-foreground">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <dt className="sr-only">Export size</dt>
            <dd>
              {exportSize.width} × {exportSize.height}
            </dd>
          </div>
          <span aria-hidden="true" className="text-border">
            ·
          </span>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <dt className="sr-only">Type size in the export</dt>
            <dd>{exportedPx} px</dd>
          </div>
          <span aria-hidden="true" className="hidden text-border xs:inline">
            ·
          </span>
          <div className="hidden items-center gap-1.5 whitespace-nowrap xs:flex">
            <dt className="sr-only">Lines</dt>
            <dd>{status}</dd>
          </div>
        </dl>
      </div>

      <div className="stage-plate relative flex min-h-0 min-w-0 flex-1 p-4 sm:p-6">
        <div className="relative min-h-0 w-full min-w-0 flex-1" ref={plateRef}>
          <div
            className="stage-card absolute inset-0 m-auto overflow-hidden rounded-sm bg-white shadow-plate ring-1 ring-ink/10"
            ref={cardRef}
          >
            <canvas
              aria-label="Rendered text card"
              className="block size-full"
              ref={canvasRef}
              role="img"
            />
            {!ready ? (
              <div className="absolute inset-0 animate-pulse bg-[linear-gradient(105deg,transparent_35%,rgb(22_23_26/0.04)_50%,transparent_65%)] bg-size-[200%_100%]" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-ink/10 px-4 py-2.5 sm:px-6">
        <p
          className={`text-[11px] leading-snug ${layout.overflow ? 'text-signal' : 'text-muted-foreground'}`}
          role={layout.overflow ? 'alert' : undefined}
        >
          {layout.overflow
            ? 'The text is taller than the frame. Turn on auto size or lower the size.'
            : 'Preview and PNG come from one layout.'}
        </p>
        <button
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-ink/15 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-ink/30 hover:bg-white"
          onClick={onToggleFormat}
          type="button"
        >
          {settings.format}
          <span className="text-muted-foreground">{settings.format === '1:1' ? '→ 3:4' : '→ 1:1'}</span>
        </button>
      </div>
    </section>
  )
}
