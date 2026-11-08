/**
 * Template Engine
 * Core system for loading, rendering, and managing templates
 */

export * from './types'
export * from './config'
export * from './loader'
export * from './context'
export * from './renderer'
export * from './validator'

// Re-export commonly used items
export {
  templateLoader,
  loadTemplate,
  getTemplateManifest,
} from './loader'

export {
  TemplateProvider,
  useTemplateContext,
  useTemplateConfig,
  useSlotValue,
  useUpdateSlot,
  useTemplateManifest,
  useIsPreview,
} from './context'

export { TemplateRenderer } from './renderer'

export {
  validateManifest,
  validateConfig,
  validateSlot,
  validateSlotValue,
  validateTemplateStructure,
} from './validator'
