import type { TemplateManifest, EditableSlot, TemplateConfig } from '@/types'

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Validate template manifest structure
 */
export function validateManifest(manifest: any): ValidationResult {
  const errors: ValidationError[] = []

  // Required fields
  const requiredFields = ['id', 'name', 'version', 'category', 'capabilities']
  
  for (const field of requiredFields) {
    if (!manifest[field]) {
      errors.push({
        field,
        message: `Missing required field: ${field}`,
        code: 'REQUIRED_FIELD',
      })
    }
  }

  // Validate capabilities
  if (manifest.capabilities) {
    if (!Array.isArray(manifest.capabilities.editableSlots)) {
      errors.push({
        field: 'capabilities.editableSlots',
        message: 'editableSlots must be an array',
        code: 'INVALID_TYPE',
      })
    } else if (manifest.capabilities.editableSlots.length < 10) {
      errors.push({
        field: 'capabilities.editableSlots',
        message: 'Template must have at least 10 editable slots',
        code: 'MIN_SLOTS_REQUIRED',
      })
    } else {
      // Validate each slot
      manifest.capabilities.editableSlots.forEach((slot: any, index: number) => {
        const slotErrors = validateSlot(slot, index)
        errors.push(...slotErrors)
      })
    }

    // Check for required slot types
    const slotTypes = manifest.capabilities.editableSlots.map((s: EditableSlot) => s.type)
    const requiredTypes = ['variant', 'font', 'spacing', 'animation']
    
    for (const type of requiredTypes) {
      if (!slotTypes.includes(type)) {
        errors.push({
          field: 'capabilities.editableSlots',
          message: `Template must include at least one ${type} slot for full customization`,
          code: 'MISSING_SLOT_TYPE',
        })
      }
    }
  }

  // Validate version format
  if (manifest.version && !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    errors.push({
      field: 'version',
      message: 'Version must follow semantic versioning (e.g., 1.0.0)',
      code: 'INVALID_VERSION_FORMAT',
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate individual slot definition
 */
export function validateSlot(slot: any, index: number): ValidationError[] {
  const errors: ValidationError[] = []
  const prefix = `capabilities.editableSlots[${index}]`

  // Required slot fields
  if (!slot.id) {
    errors.push({
      field: `${prefix}.id`,
      message: 'Slot must have an id',
      code: 'REQUIRED_FIELD',
    })
  }

  if (!slot.label) {
    errors.push({
      field: `${prefix}.label`,
      message: 'Slot must have a label',
      code: 'REQUIRED_FIELD',
    })
  }

  if (!slot.type) {
    errors.push({
      field: `${prefix}.type`,
      message: 'Slot must have a type',
      code: 'REQUIRED_FIELD',
    })
  } else {
    // Validate slot type
    const validTypes = [
      'text', 'richtext', 'image', 'color', 'gradient', 'variant',
      'font', 'spacing', 'number', 'toggle', 'shadow', 'select',
      'multiselect', 'animation', 'link', 'array', 'object'
    ]
    
    if (!validTypes.includes(slot.type)) {
      errors.push({
        field: `${prefix}.type`,
        message: `Invalid slot type: ${slot.type}`,
        code: 'INVALID_SLOT_TYPE',
      })
    }
  }

  // Type-specific validation
  if (slot.type === 'variant' || slot.type === 'select') {
    if (!slot.options || !Array.isArray(slot.options) || slot.options.length === 0) {
      errors.push({
        field: `${prefix}.options`,
        message: `${slot.type} slot must have options array`,
        code: 'MISSING_OPTIONS',
      })
    }
  }

  if (slot.type === 'number' || slot.type === 'spacing') {
    if (slot.min === undefined || slot.max === undefined) {
      errors.push({
        field: `${prefix}`,
        message: `${slot.type} slot must have min and max values`,
        code: 'MISSING_RANGE',
      })
    }
  }

  return errors
}

/**
 * Validate template config against manifest
 */
export function validateConfig(
  config: TemplateConfig,
  manifest: TemplateManifest
): ValidationResult {
  const errors: ValidationError[] = []

  // Validate each slot value
  for (const slot of manifest.capabilities.editableSlots) {
    const value = config.slots?.[slot.id]

    if (slot.validation?.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: `slots.${slot.id}`,
        message: `${slot.label} is required`,
        code: 'REQUIRED_SLOT',
      })
    }

    // Type-specific validation
    if (value !== undefined && value !== null) {
      const typeErrors = validateSlotValue(slot, value)
      errors.push(...typeErrors)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate slot value
 */
export function validateSlotValue(slot: EditableSlot, value: any): ValidationError[] {
  const errors: ValidationError[] = []

  switch (slot.type) {
    case 'text':
      if (typeof value !== 'string') {
        errors.push({
          field: `slots.${slot.id}`,
          message: 'Value must be a string',
          code: 'INVALID_TYPE',
        })
      } else if (slot.maxLength && value.length > slot.maxLength) {
        errors.push({
          field: `slots.${slot.id}`,
          message: `Value exceeds maximum length of ${slot.maxLength}`,
          code: 'MAX_LENGTH_EXCEEDED',
        })
      }
      
      if (slot.validation?.pattern) {
        const regex = new RegExp(slot.validation.pattern)
        if (!regex.test(value)) {
          errors.push({
            field: `slots.${slot.id}`,
            message: slot.validation.errorMessage || 'Value does not match required pattern',
            code: 'PATTERN_MISMATCH',
          })
        }
      }
      break

    case 'number':
    case 'spacing':
      if (typeof value !== 'number') {
        errors.push({
          field: `slots.${slot.id}`,
          message: 'Value must be a number',
          code: 'INVALID_TYPE',
        })
      } else {
        if (slot.min !== undefined && value < slot.min) {
          errors.push({
            field: `slots.${slot.id}`,
            message: `Value must be at least ${slot.min}`,
            code: 'MIN_VALUE',
          })
        }
        if (slot.max !== undefined && value > slot.max) {
          errors.push({
            field: `slots.${slot.id}`,
            message: `Value must be at most ${slot.max}`,
            code: 'MAX_VALUE',
          })
        }
      }
      break

    case 'toggle':
      if (typeof value !== 'boolean') {
        errors.push({
          field: `slots.${slot.id}`,
          message: 'Value must be a boolean',
          code: 'INVALID_TYPE',
        })
      }
      break

    case 'variant':
    case 'select':
      if (slot.options) {
        const validValues = slot.options.map(o => o.value)
        if (!validValues.includes(value)) {
          errors.push({
            field: `slots.${slot.id}`,
            message: `Value must be one of: ${validValues.join(', ')}`,
            code: 'INVALID_OPTION',
          })
        }
      }
      break

    case 'array':
      if (!Array.isArray(value)) {
        errors.push({
          field: `slots.${slot.id}`,
          message: 'Value must be an array',
          code: 'INVALID_TYPE',
        })
      }
      break

    case 'color':
      if (typeof value !== 'string' || !/^#[0-9A-F]{6}$/i.test(value)) {
        errors.push({
          field: `slots.${slot.id}`,
          message: 'Value must be a valid hex color',
          code: 'INVALID_COLOR',
        })
      }
      break
  }

  return errors
}

/**
 * Check if template has required folder structure
 */
export async function validateTemplateStructure(slug: string): Promise<ValidationResult> {
  const errors: ValidationError[] = []
  
  // This would check actual file system in a real implementation
  // For now, return a placeholder
  
  const requiredFiles = [
    'manifest.json',
    'layout.tsx',
    'page.tsx',
  ]

  // TODO: Implement actual file checks
  // For now, assume structure is valid if template can be loaded

  return {
    valid: errors.length === 0,
    errors,
  }
}
