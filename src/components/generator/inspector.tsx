import {
  ArrowCounterClockwiseIcon,
  CopyIcon,
  DownloadSimpleIcon,
  SpinnerGapIcon,
  TextAlignCenterIcon,
  TextAlignJustifyIcon,
  TextAlignLeftIcon,
  XIcon,
} from '@phosphor-icons/react'
import { cn } from 'cn'

import type { ExportKind } from '@/hooks/use-card-export'
import type { TextAlign, TextImageSettings, TextLayout } from '@/types'

import {
  ControlGroup,
  ExportField,
  FontField,
  RangeField,
  ResolutionField,
  Segmented,
  SwitchField,
} from '@/components/generator/controls'
import { Button } from '@/components/ui/button'
import { resolveExportSize } from '@/lib/export-presets'
import { DESIGN_WIDTH, toExportPixels } from '@/lib/text-layout'

const ALIGN_OPTIONS = [
  { icon: <TextAlignJustifyIcon className="size-4" />, label: 'Justify', value: 'justify' },
  { icon: <TextAlignLeftIcon className="size-4" />, label: 'Left', value: 'left' },
  { icon: <TextAlignCenterIcon className="size-4" />, label: 'Center', value: 'center' },
] as const

const DEFAULT_PADDING_X = 1
const DEFAULT_PADDING_Y = 3

interface InspectorProps {
  busy: ExportKind | null
  canExport: boolean
  layout: TextLayout
  onChange: (patch: Partial<TextImageSettings>) => void
  onClose?: () => void
  onCopy: () => void
  onDownload: () => void
  onReset: () => void
  settings: TextImageSettings
}

/** Download and copy, pinned to the foot of the rail and to the phone tray. */
export function ExportActions({
  busy,
  canExport,
  className,
  onCopy,
  onDownload,
}: {
  busy: ExportKind | null
  canExport: boolean
  className?: string
  onCopy: () => void
  onDownload: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 border-t border-border bg-card px-5 py-3 sm:px-6',
        className,
      )}
    >
      <Button
        className="h-10 flex-1 text-[13px] font-medium"
        disabled={!canExport || busy !== null}
        onClick={onDownload}
        size="lg"
      >
        {busy === 'download' ? (
          <SpinnerGapIcon className="size-4 animate-spin" />
        ) : (
          <DownloadSimpleIcon className="size-4" weight="bold" />
        )}
        Download PNG
      </Button>
      <Button
        aria-label="Copy image"
        className="size-10 shrink-0 border-input"
        disabled={!canExport || busy !== null}
        onClick={onCopy}
        size="icon-lg"
        variant="outline"
      >
        {busy === 'copy' ? (
          <SpinnerGapIcon className="size-4 animate-spin" />
        ) : (
          <CopyIcon className="size-4" />
        )}
      </Button>
    </div>
  )
}

/**
 * The settings rail. Groups follow the order the card is built in: what it says,
 * how it is set, then where it goes. Export actions stay pinned at the foot on
 * wide screens so they never scroll away.
 */
export function Inspector({
  busy,
  canExport,
  layout,
  onChange,
  onClose,
  onCopy,
  onDownload,
  onReset,
  settings,
}: InspectorProps) {
  const words = countWords(settings.text)
  const exportSize = resolveExportSize(settings.format, settings.lowRes)
  const exportedPx = toExportPixels(
    settings.autoSize ? layout.fontSize : settings.fontSize,
    exportSize.width,
  )
  const density = settings.lineHeight.toFixed(2)
  const adjusted =
    settings.paddingX !== DEFAULT_PADDING_X ||
    settings.paddingY !== DEFAULT_PADDING_Y ||
    settings.uppercase ||
    settings.invert ||
    !settings.autoSize

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 sm:px-6">
        <h2 className="text-[13px] font-semibold tracking-tight">Settings</h2>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-1 rounded text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground"
            disabled={!adjusted}
            onClick={onReset}
            type="button"
          >
            <ArrowCounterClockwiseIcon className="size-3" />
            Reset
          </button>
          {onClose ? (
            <button
              aria-label="Close settings"
              className="-mr-1.5 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={onClose}
              type="button"
            >
              <XIcon className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <ControlGroup hint={`${words} ${words === 1 ? 'word' : 'words'}`} title="Text">
          <textarea
            aria-label="Card text"
            className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 text-[13px] leading-relaxed transition-colors outline-none placeholder:text-muted-foreground hover:border-line-strong focus-visible:border-ring"
            id="card-text"
            onChange={(event) => onChange({ text: event.target.value })}
            placeholder="Type or paste your text."
            spellCheck={false}
            value={settings.text}
          />
          <Segmented<TextAlign>
            label="Alignment"
            name="card-align"
            onChange={(align) => onChange({ align })}
            options={ALIGN_OPTIONS}
            value={settings.align}
          />
        </ControlGroup>

        <ControlGroup title="Type">
          <FontField onChange={(font) => onChange({ font })} value={settings.font} />
          <SwitchField
            checked={settings.autoSize}
            description="Fits the largest type the frame allows."
            id="auto-size"
            label="Auto Size"
            onCheckedChange={(autoSize) => onChange({ autoSize })}
          />
          <RangeField
            disabled={settings.autoSize}
            hint={settings.autoSize ? `auto · ${exportedPx} px` : `${exportedPx} px`}
            id="type-size"
            label="Size"
            max={DESIGN_WIDTH}
            min={16}
            onChange={(fontSize) => onChange({ fontSize })}
            step={1}
            value={Math.min(
              DESIGN_WIDTH,
              Math.max(16, settings.autoSize ? layout.fontSize : settings.fontSize),
            )}
          />
          <RangeField
            hint={`${density}×`}
            id="line-height"
            label="Line Height"
            max={1.8}
            min={0.9}
            onChange={(lineHeight) => onChange({ lineHeight })}
            step={0.05}
            value={settings.lineHeight}
          />
          <div className="flex gap-3">
            <SwitchField
              checked={settings.uppercase}
              id="uppercase"
              label="Uppercase"
              onCheckedChange={(uppercase) => onChange({ uppercase })}
            />
            <SwitchField
              checked={settings.invert}
              id="invert"
              label="Invert"
              onCheckedChange={(invert) => onChange({ invert })}
            />
          </div>
        </ControlGroup>

        <ControlGroup title="Frame">
          <RangeField
            hint={`${settings.paddingX}%`}
            id="padding-x"
            label="Side Padding"
            max={18}
            min={0}
            onChange={(paddingX) => onChange({ paddingX })}
            step={1}
            value={settings.paddingX}
          />
          <RangeField
            hint={`${settings.paddingY}%`}
            id="padding-y"
            label="Top and Bottom Padding"
            max={18}
            min={0}
            onChange={(paddingY) => onChange({ paddingY })}
            step={1}
            value={settings.paddingY}
          />
        </ControlGroup>

        <ControlGroup title="Export">
          <ExportField
            format={settings.format}
            lowRes={settings.lowRes}
            onChange={(format) => onChange({ format })}
          />
          <ResolutionField
            lowRes={settings.lowRes}
            onChange={(lowRes) => onChange({ lowRes })}
          />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-md bg-muted/70 px-3 py-2.5 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Pixels</dt>
              <dd className="tabular-nums">
                {exportSize.width} × {exportSize.height}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="tabular-nums">{exportedPx} px</dd>
            </div>
          </dl>
        </ControlGroup>
      </div>

      <ExportActions
        busy={busy}
        canExport={canExport}
        onCopy={onCopy}
        onDownload={onDownload}
      />
    </div>
  )
}

function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export type { InspectorProps }
