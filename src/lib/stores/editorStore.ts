import { create } from 'zustand'
import { type TemplateManifest, type TemplateConfig } from '@/types'

export interface EditorState {
  // Template data
  manifest: TemplateManifest | null
  instanceId: string | null
  saveEndpoint: string | null

  // Config state
  config: TemplateConfig
  initialConfig: TemplateConfig

  // UI state
  isSaving: boolean
  hasChanges: boolean
  lastSavedAt: string | null
  saveError: string | null

  // Actions
  setManifest: (manifest: TemplateManifest) => void
  setInstanceId: (id: string) => void
  setSaveEndpoint: (endpoint: string) => void
  setConfig: (config: TemplateConfig) => void
  updateSlotValue: (slotId: string, value: any) => void
  saveConfig: () => Promise<void>
  resetConfig: () => void
  setIsSaving: (isSaving: boolean) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  manifest: null,
  instanceId: null,
  saveEndpoint: null,
  config: { slots: {}, pages: [] },
  initialConfig: { slots: {}, pages: [] },
  isSaving: false,
  hasChanges: false,
  lastSavedAt: null,
  saveError: null,

  setManifest: (manifest) => set({ manifest }),

  setInstanceId: (id) => set({ instanceId: id }),

  setSaveEndpoint: (endpoint) => set({ saveEndpoint: endpoint }),

  setConfig: (config) => {
    set({
      config,
      initialConfig: JSON.parse(JSON.stringify(config)),
      hasChanges: false,
      saveError: null,
    })
  },

  updateSlotValue: (slotId, value) => {
    const { config, initialConfig } = get()
    const newConfig = {
      ...config,
      slots: {
        ...config.slots,
        [slotId]: value,
      },
    }

    const hasChanges =
      JSON.stringify(newConfig) !== JSON.stringify(initialConfig)

    set({ config: newConfig, hasChanges })
  },

  saveConfig: async () => {
    const { saveEndpoint, config } = get()
    if (!saveEndpoint) {
      set({ saveError: 'No editor target selected.' })
      return
    }

    set({ isSaving: true, saveError: null })

    try {
      const response = await fetch(saveEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to save changes')
      }

      // Freeze the saved config as the new baseline. If the user changed
      // something while the request was in flight, keep the dirty flag so the
      // next autosave pass persists the newer edits.
      const current = get().config
      const stillDirty = JSON.stringify(current) !== JSON.stringify(config)

      set({
        initialConfig: JSON.parse(JSON.stringify(config)),
        hasChanges: stillDirty,
        lastSavedAt: new Date().toISOString(),
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save changes'
      set({ saveError: message })
      throw error
    } finally {
      set({ isSaving: false })
    }
  },

  resetConfig: () => {
    const { initialConfig } = get()
    set({
      config: JSON.parse(JSON.stringify(initialConfig)),
      hasChanges: false,
      saveError: null,
    })
  },

  setIsSaving: (isSaving) => set({ isSaving }),
}))
