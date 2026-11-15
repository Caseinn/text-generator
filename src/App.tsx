import { useCallback, useState } from 'react'

import type { TextImageSettings } from '@/types'

import { ControlPanel } from '@/components/generator/control-panel'
import { PreviewCanvas } from '@/components/generator/preview-canvas'
import { Toaster } from '@/components/ui/sonner'
import { useFontReady } from '@/hooks/use-font-ready'
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

/** Single-page studio: the card preview next to its settings. */
export default function App() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS)
  const font = getFont(settings.font)
  const fontReady = useFontReady(font)
  const layout = layoutText(settings)

  const update = useCallback((patch: Partial<TextImageSettings>) => {
    setSettings((current) => ({ ...current, ...patch }))
  }, [])

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-baseline gap-3">
            <h1 className="text-sm font-semibold tracking-tight">Text Image</h1>
            <span className="hidden font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase sm:inline">
              text card generator
            </span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            PNG
          </span>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12 lg:px-8">
        <PreviewCanvas
          layout={layout}
          ready={fontReady}
          settings={settings}
        />
        <ControlPanel layout={layout} onChange={update} settings={settings} />
      </main>

      <Toaster position="bottom-center" theme="light" />
    </div>
  )
}
