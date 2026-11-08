'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Route } from 'next'
import {
  type EditableSlot,
  type TemplateManifest,
  type TemplateConfig,
} from '@/types'
import { useEditorStore } from '@/lib/stores/editorStore'
import {
  EditorLayout,
  type EditorDevice,
} from '@/components/editor/EditorLayout'
import { EditorSidebar } from '@/components/editor/EditorSidebar'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'

interface EditorClientProps {
  resourceId: string
  saveEndpoint: string
  previewSrc: string
  previewHref: string
  previewLabel?: string
  templateSlug: string
  templateName: string
  siteLabel: string
  backHref: Route
  manifest: TemplateManifest
  initialConfig: TemplateConfig
}

export function EditorClient({
  resourceId,
  saveEndpoint,
  previewSrc,
  previewHref,
  previewLabel,
  templateName,
  siteLabel,
  backHref,
  manifest,
  initialConfig,
}: EditorClientProps) {
  const {
    config,
    hasChanges,
    isSaving,
    lastSavedAt,
    saveError,
    setManifest,
    setInstanceId,
    setSaveEndpoint,
    setConfig,
    updateSlotValue,
    saveConfig,
    resetConfig,
  } = useEditorStore()

  const [previewKey, setPreviewKey] = useState(0)
  const [device, setDevice] = useState<EditorDevice>('desktop')
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [liveMode, setLiveMode] = useState(true)
  const [previewExpanded, setPreviewExpanded] = useState(false)

  const refreshPreview = useCallback(() => {
    setPreviewKey((key) => key + 1)
  }, [])

  // Initialize the store once per instance.
  useEffect(() => {
    setManifest(manifest)
    setInstanceId(resourceId)
    setSaveEndpoint(saveEndpoint)
    setConfig(initialConfig)
  }, [
    resourceId,
    saveEndpoint,
    manifest,
    initialConfig,
    setManifest,
    setInstanceId,
    setSaveEndpoint,
    setConfig,
  ])

  // Live mode autosaves after a short pause, then refreshes the preview so it
  // reflects the saved content. Manual mode leaves changes pending until Save.
  useEffect(() => {
    if (!liveMode || !hasChanges || isSaving) return

    const timer = setTimeout(async () => {
      try {
        await saveConfig()
        refreshPreview()
      } catch {
        // The store exposes the error through `saveError`.
      }
    }, 700)

    return () => clearTimeout(timer)
  }, [config, hasChanges, isSaving, liveMode, saveConfig, refreshPreview])

  const handleSave = useCallback(async () => {
    if (!hasChanges || isSaving) return

    try {
      await saveConfig()
      refreshPreview()
    } catch {
      // Surfaced through `saveError`.
    }
  }, [hasChanges, isSaving, saveConfig, refreshPreview])

  // Ctrl/⌘ + S saves immediately instead of waiting for autosave.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void handleSave()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSave])

  const handlePreview = () => {
    window.open(previewHref, '_blank', 'noopener')
  }

  const handleReset = async () => {
    resetConfig()
    setShowResetDialog(false)
  }

  const editableSlots =
    manifest.capabilities?.editableSlots ||
    (manifest as unknown as { editableSlots?: EditableSlot[] }).editableSlots ||
    []

  return (
    <>
      <EditorLayout
        templateName={templateName}
        siteLabel={siteLabel}
        backHref={backHref}
        onSave={handleSave}
        onReset={() => setShowResetDialog(true)}
        onPreview={handlePreview}
        previewLabel={previewLabel}
        onRefresh={refreshPreview}
        isSaving={isSaving}
        hasChanges={hasChanges}
        device={device}
        onDeviceChange={setDevice}
        saveError={saveError}
        lastSavedAt={lastSavedAt}
        liveMode={liveMode}
        onLiveModeChange={() => setLiveMode((value) => !value)}
        previewExpanded={previewExpanded}
        onPreviewExpandedChange={() =>
          setPreviewExpanded((value) => !value)
        }
        sidebar={
          <EditorSidebar
            slots={editableSlots}
            values={config.slots}
            onChange={updateSlotValue}
            disabled={isSaving}
          />
        }
      >
        <iframe
          key={previewKey}
          src={previewSrc}
          className="h-full w-full border-0 bg-white"
          title={`${templateName} live preview`}
        />
      </EditorLayout>

      <ConfirmDialog
        open={showResetDialog}
        title="Discard unsaved changes?"
        description="Your published site keeps the last saved version. Any edits made since the last save will be lost."
        confirmLabel="Discard changes"
        destructive
        onConfirm={handleReset}
        onClose={() => setShowResetDialog(false)}
      />
    </>
  )
}
