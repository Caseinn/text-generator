import { SlidersHorizontalIcon } from '@phosphor-icons/react'
import { useCallback, useMemo, useState } from 'react'

import type { TextImageSettings } from '@/types'

import { CardStage } from '@/components/generator/card-stage'
import { ExportActions, Inspector } from '@/components/generator/inspector'
import { SocialLinks } from '@/components/generator/social-links'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'
import { useCardExport } from '@/hooks/use-card-export'
import { useFontReady } from '@/hooks/use-font-ready'
import { useMediaQuery } from '@/hooks/use-media-query'
import { getFont } from '@/lib/fonts'
import { layoutText } from '@/lib/text-layout'

const INITIAL_SETTINGS: TextImageSettings = {
  align: 'justify',
  autoSize: true,
  font: 'arial-narrow',
  fontSize: 96,
  format: '1:1',
  invert: false,
  lineHeight: 1,
  lowRes: false,
  paddingX: 1,
  paddingY: 3,
  text: 'atur aja bang, abang kan panitia',
  uppercase: false,
}

/**
 * The studio: one card stage and one inspector. Wide viewports dock the
 * inspector as a rail; narrow ones keep the stage visible and open the same
 * inspector as a bottom sheet, so a phone never scrolls past three screens of
 * sliders to reach the card.
 */
export default function App() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const wide = useMediaQuery('(min-width: 1024px)')
  const font = getFont(settings.font)
  const fontReady = useFontReady(font)
  const layout = useMemo(() => layoutText(settings), [settings])
  const { busy, canExport, copy, download } = useCardExport(settings, layout)

  const update = useCallback((patch: Partial<TextImageSettings>) => {
    setSettings((current) => ({ ...current, ...patch }))
  }, [])

  const reset = useCallback(() => {
    setSettings((current) => ({ ...INITIAL_SETTINGS, text: current.text }))
  }, [])

  const toggleFormat = useCallback(() => {
    setSettings((current) => ({
      ...current,
      format: current.format === '1:1' ? '3:4' : '1:1',
    }))
  }, [])

  const inspector = (
    <Inspector
      busy={busy}
      canExport={canExport}
      layout={layout}
      onChange={update}
      onClose={wide ? undefined : () => setSettingsOpen(false)}
      onCopy={copy}
      onDownload={download}
      onReset={reset}
      settings={settings}
    />
  )

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-4 py-2.5 sm:px-6 sm:py-3 lg:px-7">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-primary"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 14 14">
              <path
                d="M2 3.5h10M2 7h6.5M2 10.5h8.5"
                stroke="#fbfaf7"
                strokeLinecap="round"
                strokeWidth="1.6"
              />
            </svg>
          </span>
          <div className="flex min-w-0 items-baseline gap-2.5">
            <h1 className="truncate text-[13px] font-semibold tracking-tight">Text Image</h1>
            <span className="hidden truncate text-[11px] text-muted-foreground sm:inline">
              Text Card Generator
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-[11px] text-muted-foreground md:inline">
            Nothing leaves your browser
          </span>
          <SocialLinks />
          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            PNG
          </span>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_22rem]">
        <CardStage
          layout={layout}
          onToggleFormat={toggleFormat}
          ready={fontReady}
          settings={settings}
        />

        {wide ? (
          <aside
            aria-label="Card settings"
            className="flex min-h-0 flex-col border-l border-border bg-card"
          >
            {inspector}
          </aside>
        ) : (
          <div className="flex shrink-0 items-stretch gap-2 border-t border-border bg-card px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-3">
            <button
              className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-input bg-background px-3 text-[13px] font-medium transition-colors hover:border-line-strong hover:bg-muted"
              onClick={() => setSettingsOpen(true)}
              type="button"
            >
              <SlidersHorizontalIcon className="size-4" />
              <span className="hidden xs:inline">Settings</span>
              <span className="xs:hidden">Edit</span>
            </button>
            <ExportActions
              busy={busy}
              canExport={canExport}
              className="min-w-0 flex-1 border-t-0 bg-transparent px-0 py-0 sm:px-0"
              onCopy={copy}
              onDownload={download}
            />
          </div>
        )}
      </main>

      <Sheet onOpenChange={setSettingsOpen} open={settingsOpen && !wide}>
        <SheetContent
          className="h-[86svh] max-h-[86svh] gap-0 rounded-t-2xl border-t border-border bg-card p-0 pb-[env(safe-area-inset-bottom)] sm:max-w-none"
          showCloseButton={false}
          side="bottom"
        >
          <SheetTitle className="sr-only">Card settings</SheetTitle>
          <SheetDescription className="sr-only">
            Text, type, frame, and export options for the card.
          </SheetDescription>
          <div className="flex shrink-0 justify-center py-2.5">
            <span aria-hidden="true" className="h-1 w-9 rounded-full bg-line-strong" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col">{inspector}</div>
        </SheetContent>
      </Sheet>

      <Toaster mobileOffset={{ bottom: 84 }} position="bottom-center" theme="light" />
    </div>
  )
}
