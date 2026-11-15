import type { ReactNode } from 'react'

import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react'
import { cn } from 'cn'
import { useId } from 'react'

import type { TextImageSettings } from '@/types'

import { EXPORT_PRESETS, LOW_RES_WIDTH, resolveExportSize } from '@/lib/export-presets'
import { FONT_OPTIONS, fontStack, getFont } from '@/lib/fonts'

interface ControlGroupProps {
  children: ReactNode
  hint?: ReactNode
  title: string
}

interface FieldProps {
  children: ReactNode
  hint?: ReactNode
  htmlFor?: string
  label: string
  live?: boolean
}

interface RangeFieldProps {
  disabled?: boolean
  hint: string
  id: string
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step: number
  value: number
}

interface SegmentedProps<T extends string> {
  label: string
  name: string
  onChange: (value: T) => void
  options: readonly {
    icon?: ReactNode
    label: string
    value: T
  }[]
  value: T
}

interface SwitchFieldProps {
  checked: boolean
  description?: string
  id: string
  label: string
  onCheckedChange: (checked: boolean) => void
}

/** A titled block of related controls, separated by a hairline rule. */
export function ControlGroup({ children, hint, title }: ControlGroupProps) {
  return (
    <section className="border-t border-border px-5 py-4 first:border-t-0 sm:px-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">{title}</h3>
        {hint ? <span className="text-[11px] tabular-nums text-muted-foreground">{hint}</span> : null}
      </div>
      <div className="mt-3 flex flex-col gap-3.5">{children}</div>
    </section>
  )
}

/** Export shape picker that prints the resulting pixels in the option itself. */
export function ExportField({
  format,
  lowRes,
  onChange,
}: {
  format: TextImageSettings['format']
  lowRes: boolean
  onChange: (value: TextImageSettings['format']) => void
}) {
  return (
    <Field htmlFor="export-shape" label="Shape">
      <SelectField
        id="export-shape"
        onChange={(next) => onChange(next as TextImageSettings['format'])}
        value={format}
      >
        {EXPORT_PRESETS.map((preset) => {
          const size = resolveExportSize(preset.format, lowRes)
          return (
            <option key={preset.format} value={preset.format}>
              {preset.format} · {size.width} × {size.height} px
            </option>
          )
        })}
      </SelectField>
    </Field>
  )
}

/** Label, live value, and one control in a consistent two-line row. */
export function Field({ children, hint, htmlFor, label, live }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label
          className={cn(
            'text-[13px] leading-none font-medium text-foreground',
            !htmlFor && 'cursor-default',
          )}
          htmlFor={htmlFor}
        >
          {label}
        </label>
        {hint ? (
          <span
            className={cn(
              'text-[11px] leading-none tabular-nums transition-colors',
              live ? 'text-signal' : 'text-muted-foreground',
            )}
          >
            {hint}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  )
}

/** Face picker with each family drawn in its own type. */
export function FontField({
  onChange,
  value,
}: {
  onChange: (value: TextImageSettings['font']) => void
  value: TextImageSettings['font']
}) {
  const selected = getFont(value)
  return (
    <Field htmlFor="font-face" label="Typeface">
      <SelectField
        id="font-face"
        onChange={(next) => onChange(next as TextImageSettings['font'])}
        style={{ fontFamily: fontStack(selected), fontWeight: selected.weight }}
        value={value}
      >
        {FONT_OPTIONS.map((font) => (
          <option
            key={font.id}
            style={{ fontFamily: fontStack(font), fontWeight: font.weight }}
            value={font.id}
          >
            {font.label}
          </option>
        ))}
      </SelectField>
    </Field>
  )
}

/** Range input with a filled track, sized for a finger on touch screens. */
export function RangeField({
  disabled,
  hint,
  id,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: RangeFieldProps) {
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100
  return (
    <Field hint={hint} htmlFor={id} label={label}>
      <input
        aria-describedby={undefined}
        aria-label={label}
        className={cn(
          'range-input h-6 w-full appearance-none bg-transparent',
          disabled && 'opacity-45',
        )}
        disabled={disabled}
        id={id}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        style={{ '--fill': `${percent}%` } as React.CSSProperties}
        type="range"
        value={value}
      />
    </Field>
  )
}

/** Export resolution choice, naming the real output width. */
export function ResolutionField({
  lowRes,
  onChange,
}: {
  lowRes: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <Field htmlFor="resolution" label="Resolution">
      <SelectField
        id="resolution"
        onChange={(next) => onChange(next === 'low')}
        value={lowRes ? 'low' : 'full'}
      >
        <option value="full">Full (1080 px wide)</option>
        <option value="low">Low ({LOW_RES_WIDTH} px wide)</option>
      </SelectField>
    </Field>
  )
}

/** Two-or-three-way choice drawn as one joined control; native radios keep arrow keys working. */
export function Segmented<T extends string>({
  label,
  name,
  onChange,
  options,
  value,
}: SegmentedProps<T>) {
  return (
    <fieldset className="flex min-w-0">
      <legend className="sr-only">{label}</legend>
      <div className="flex w-full rounded-md border border-input bg-background p-0.5">
        {options.map((option) => {
          const active = option.value === value
          return (
            <label
              className={cn(
                'flex h-7 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] text-[12px] font-medium transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring/45',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              key={option.value}
            >
              <input
                checked={active}
                className="sr-only"
                name={name}
                onChange={() => onChange(option.value)}
                type="radio"
                value={option.value}
              />
              {option.icon}
              {option.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Native select dressed in the shell's input language, with the face preview inline. */
export function SelectField({
  children,
  className,
  id,
  onChange,
  style,
  value,
}: {
  children: ReactNode
  className?: string
  id: string
  onChange: (value: string) => void
  style?: React.CSSProperties
  value: string
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        className="h-9 w-full appearance-none rounded-md border border-input bg-background pr-8 pl-2.5 text-[13px] text-foreground transition-colors outline-none hover:border-line-strong focus-visible:border-ring disabled:opacity-50"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        style={style}
        value={value}
      >
        {children}
      </select>
      <CaretDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

/** Checkbox drawn as a ruled row, for options that are on or off. */
export function SwitchField({
  checked,
  description,
  id,
  label,
  onCheckedChange,
}: SwitchFieldProps) {
  const fallbackId = useId()
  const inputId = id || fallbackId
  return (
    <label
      className="group flex cursor-pointer items-start gap-3 rounded-md py-0.5"
      htmlFor={inputId}
    >
      <span
        className={cn(
          'mt-px flex size-4 shrink-0 items-center justify-center rounded-lg border transition-colors',
          checked
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-input bg-background group-hover:border-line-strong',
        )}
      >
        {checked ? <CheckIcon className="size-3" weight="bold" /> : null}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[13px] leading-tight font-medium text-foreground">{label}</span>
        {description ? (
          <span className="text-[11px] leading-snug text-muted-foreground">{description}</span>
        ) : null}
      </span>
      <input
        checked={checked}
        className="sr-only"
        id={inputId}
        onChange={(event) => onCheckedChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  )
}
