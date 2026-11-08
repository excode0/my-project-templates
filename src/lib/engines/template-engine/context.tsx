'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { TemplateConfig, TemplateManifest } from '@/types'

interface TemplateContextValue {
  config: TemplateConfig
  manifest: TemplateManifest
  instanceId: string
  isPreview: boolean
  updateSlot?: (slotId: string, value: any) => void
}

const TemplateContext = createContext<TemplateContextValue | null>(null)

export interface TemplateProviderProps {
  children: ReactNode
  config: TemplateConfig
  manifest: TemplateManifest
  instanceId: string
  isPreview?: boolean
  onSlotUpdate?: (slotId: string, value: any) => void
}

/**
 * Template Provider
 * Provides template config and manifest to all child components
 */
export function TemplateProvider({
  children,
  config,
  manifest,
  instanceId,
  isPreview = false,
  onSlotUpdate,
}: TemplateProviderProps) {
  const value: TemplateContextValue = {
    config,
    manifest,
    instanceId,
    isPreview,
    updateSlot: onSlotUpdate,
  }

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  )
}

/**
 * Hook to access template context
 */
export function useTemplateContext() {
  const context = useContext(TemplateContext)
  if (!context) {
    throw new Error('useTemplateContext must be used within TemplateProvider')
  }
  return context
}

/**
 * Hook to get template config
 */
export function useTemplateConfig() {
  const { config } = useTemplateContext()
  return config
}

/**
 * Hook to get specific slot value
 */
export function useSlotValue<T = any>(slotId: string, defaultValue?: T): T {
  const { config } = useTemplateContext()
  return config.slots?.[slotId] ?? defaultValue
}

/**
 * Hook to update slot value (in preview/editor mode)
 */
export function useUpdateSlot() {
  const { updateSlot, isPreview } = useTemplateContext()
  
  if (!isPreview || !updateSlot) {
    return () => {
      console.warn('Slot updates not available in production mode')
    }
  }

  return updateSlot
}

/**
 * Hook to get manifest
 */
export function useTemplateManifest() {
  const { manifest } = useTemplateContext()
  return manifest
}

/**
 * Hook to check if in preview mode
 */
export function useIsPreview() {
  const { isPreview } = useTemplateContext()
  return isPreview
}
