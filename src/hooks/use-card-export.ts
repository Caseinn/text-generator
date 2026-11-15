import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import type { TextImageSettings, TextLayout } from '@/types'

import {
  copyImageBlob,
  createImageBlob,
  downloadBlob,
  exportFilename,
} from '@/lib/export-image'

/** Which export action is in flight, so both action surfaces can agree. */
export type ExportKind = 'copy' | 'download'

interface CardExport {
  busy: ExportKind | null
  canExport: boolean
  copy: () => Promise<void>
  download: () => Promise<void>
}

/**
 * Download and clipboard export for the shared layout, with the busy flag and
 * user feedback kept in one place so the rail, the sheet, and the phone bar
 * never disagree about what is running.
 */
export function useCardExport(
  settings: TextImageSettings,
  layout: TextLayout,
): CardExport {
  const [busy, setBusy] = useState<ExportKind | null>(null)
  const canExport = settings.text.trim().length > 0

  const download = useCallback(async () => {
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
  }, [layout, settings])

  const copy = useCallback(async () => {
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
  }, [layout, settings])

  return { busy, canExport, copy, download }
}
