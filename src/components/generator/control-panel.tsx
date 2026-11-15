import type { ReactNode } from 'react'

import {
  CopyIcon,
  DownloadSimpleIcon,
  SpinnerIcon,
  TextAlignCenterIcon,
  TextAlignJustifyIcon,
  TextAlignLeftIcon,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'

import type {
  ExportFormat,
  FontId,
  TextAlign,
  TextImageSettings,
  TextLayout,
} from '@/types'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  copyImageBlob,
  createImageBlob,
  downloadBlob,
  exportFilename,
} from '@/lib/export-image'
import {
  EXPORT_PRESETS,
  LOW_RES_WIDTH,
  resolveExportSize,
} from '@/lib/export-presets'
import { FONT_OPTIONS, fontStack, getFont } from '@/lib/fonts'
import { DESIGN_WIDTH, toExportPixels } from '@/lib/text-layout'

interface ControlPanelProps {
  layout: TextLayout
  onChange: (patch: Partial<TextImageSettings>) => void
  settings: TextImageSettings
}

interface FieldProps {
  children: ReactNode
  hint?: string
  htmlFor?: string
  label: string
}

interface SliderFieldProps {
  disabled?: boolean
  hint: string
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step: number
  value: number
}

interface SwitchRowProps {
  checked: boolean
  description?: string
  id: string
  label: string
  onCheckedChange: (checked: boolean) => void
}

/** The renderer's settings, in one inspector next to the preview. */
export function ControlPanel({ layout, onChange, settings }: ControlPanelProps) {
  const [busy, setBusy] = useState<'copy' | 'download' | null>(null)
  const hasText = settings.text.trim().length > 0
  const wordCount = countWords(settings.text)
  const exportSize = resolveExportSize(settings.format, settings.lowRes)
  const exportedPx = toExportPixels(layout.fontSize, exportSize.width)
  const selectedFont = getFont(settings.font)

  const handleDownload = async () => {
    setBusy('download')
    try {
      const blob = await createImageBlob(settings, layout)
      downloadBlob(blob, exportFilename())
      toast.success('PNG downloaded')
    } catch {
      toast.error("Couldn't export the image")
    } finally {
      setBusy(null)
    }
  }

  const handleCopy = async () => {
    setBusy('copy')
    try {
      const blob = await createImageBlob(settings, layout)
      const copied = await copyImageBlob(blob)
      if (copied) toast.success('Image copied')
      else toast.error("This browser can't copy images")
    } catch {
      toast.error("Couldn't copy the image")
    } finally {
      setBusy(null)
    }
  }

  return (
    <aside className="flex flex-col gap-6">
      <h2 className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        Settings
      </h2>

      <Field
        hint={`${wordCount} ${wordCount === 1 ? 'word' : 'words'}`}
        htmlFor="card-text"
        label="Text"
      >
        <Textarea
          className="min-h-36 resize-y text-sm leading-relaxed"
          id="card-text"
          onChange={(event) => onChange({ text: event.target.value })}
          placeholder="Type or paste your text."
          value={settings.text}
        />
      </Field>

      <Field label="Typeface">
        <Select
          onValueChange={(value) => onChange({ font: value as FontId })}
          value={settings.font}
        >
          <SelectTrigger
            aria-label="Typeface"
            className="w-full"
            style={{
              fontFamily: fontStack(selectedFont),
              fontWeight: selectedFont.weight,
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((font) => (
              <SelectItem
                key={font.id}
                style={{ fontFamily: fontStack(font), fontWeight: font.weight }}
                value={font.id}
              >
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Alignment">
        <ToggleGroup
          className="w-full"
          onValueChange={(value) => {
            if (value) onChange({ align: value as TextAlign })
          }}
          spacing={0}
          type="single"
          value={settings.align}
          variant="outline"
        >
          <ToggleGroupItem aria-label="Justify" className="flex-1" value="justify">
            <TextAlignJustifyIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Align left" className="flex-1" value="left">
            <TextAlignLeftIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Align center" className="flex-1" value="center">
            <TextAlignCenterIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </Field>

      <SwitchRow
        checked={settings.autoSize}
        description="Picks the largest type that fits."
        id="auto-size"
        label="Auto size"
        onCheckedChange={(checked) => onChange({ autoSize: checked })}
      />

      <SliderField
        disabled={settings.autoSize}
        hint={settings.autoSize ? `auto · ${exportedPx} px` : `${exportedPx} px`}
        label="Type size"
        max={DESIGN_WIDTH}
        min={16}
        onChange={(value) => onChange({ fontSize: value })}
        step={1}
        value={Math.min(
          DESIGN_WIDTH,
          Math.max(16, settings.autoSize ? layout.fontSize : settings.fontSize),
        )}
      />

      <SliderField
        hint={settings.lineHeight.toFixed(2)}
        label="Line height"
        max={1.8}
        min={0.9}
        onChange={(value) => onChange({ lineHeight: value })}
        step={0.05}
        value={settings.lineHeight}
      />

      <SliderField
        hint={`${settings.paddingX}%`}
        label="Padding X"
        max={18}
        min={0}
        onChange={(value) => onChange({ paddingX: value })}
        step={1}
        value={settings.paddingX}
      />

      <SliderField
        hint={`${settings.paddingY}%`}
        label="Padding Y"
        max={18}
        min={0}
        onChange={(value) => onChange({ paddingY: value })}
        step={1}
        value={settings.paddingY}
      />

      <div className="flex flex-col gap-3">
        <SwitchRow
          checked={settings.uppercase}
          id="uppercase"
          label="Uppercase"
          onCheckedChange={(checked) => onChange({ uppercase: checked })}
        />
        <SwitchRow
          checked={settings.invert}
          id="invert"
          label="Invert"
          onCheckedChange={(checked) => onChange({ invert: checked })}
        />
      </div>

      <Separator />

      <Field label="Export">
        <Select
          onValueChange={(value) =>
            onChange({ format: value as ExportFormat })
          }
          value={settings.format}
        >
          <SelectTrigger aria-label="Export format" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPORT_PRESETS.map((option) => {
              const size = resolveExportSize(option.format, settings.lowRes)
              return (
                <SelectItem key={option.format} value={option.format}>
                  {size.width} × {size.height} ({option.format})
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </Field>

      <SwitchRow
        checked={settings.lowRes}
        description={`Exports ${LOW_RES_WIDTH} px wide, like the reference cards.`}
        id="low-res"
        label="Low res"
        onCheckedChange={(checked) => onChange({ lowRes: checked })}
      />

      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          disabled={!hasText || busy !== null}
          onClick={handleDownload}
        >
          {busy === 'download' ? (
            <SpinnerIcon className="animate-spin" />
          ) : (
            <DownloadSimpleIcon />
          )}
          Download PNG
        </Button>
        <Button
          className="w-full"
          disabled={!hasText || busy !== null}
          onClick={handleCopy}
          variant="outline"
        >
          {busy === 'copy' ? (
            <SpinnerIcon className="animate-spin" />
          ) : (
            <CopyIcon />
          )}
          Copy image
        </Button>
      </div>
    </aside>
  )
}

function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

function Field({ children, hint, htmlFor, label }: FieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        {htmlFor ? (
          <Label
            className="text-xs font-medium text-muted-foreground"
            htmlFor={htmlFor}
          >
            {label}
          </Label>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
        )}
        {hint ? (
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {hint}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  )
}

function SliderField({
  disabled,
  hint,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: SliderFieldProps) {
  return (
    <Field hint={hint} label={label}>
      <Slider
        aria-label={label}
        disabled={disabled}
        max={max}
        min={min}
        onValueChange={([next]) => {
          if (typeof next === 'number') onChange(next)
        }}
        step={step}
        value={[value]}
      />
    </Field>
  )
}

function SwitchRow({
  checked,
  description,
  id,
  label,
  onCheckedChange,
}: SwitchRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <Label className="text-sm font-normal" htmlFor={id}>
          {label}
        </Label>
        {description ? (
          <p className="text-[11px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Switch checked={checked} id={id} onCheckedChange={onCheckedChange} />
    </div>
  )
}
