'use client'

import { type EditableSlot } from '@/types'
import { TextSlotEditor } from './TextSlotEditor'
import { ColorSlotEditor } from './ColorSlotEditor'
import { VariantSlotEditor } from './VariantSlotEditor'
import { NumberSlotEditor } from './NumberSlotEditor'
import { ToggleSlotEditor } from './ToggleSlotEditor'
import { ImageSlotEditor } from './ImageSlotEditor'
import { SelectSlotEditor } from './SelectSlotEditor'
import { GradientSlotEditor } from './GradientSlotEditor'
import { FontSlotEditor } from './FontSlotEditor'
import { ShadowSlotEditor } from './ShadowSlotEditor'
import { AnimationSlotEditor } from './AnimationSlotEditor'
import { MultiSelectSlotEditor } from './MultiSelectSlotEditor'
import { LinkSlotEditor } from './LinkSlotEditor'
import { ArraySlotEditor } from './ArraySlotEditor'
import { ObjectSlotEditor } from './ObjectSlotEditor'

export interface SlotEditorProps {
  slot: EditableSlot
  value: any
  onChange: (value: any) => void
  disabled?: boolean
}

/**
 * SlotEditor - Routes to appropriate editor based on slot type
 * Supports all 17+ slot types for full customization
 */
export function SlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  // Check visibleWhen condition
  // TODO: Implement conditional visibility based on other slot values

  switch (slot.type) {
    case 'text':
    case 'richtext':
      return <TextSlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    case 'image':
      return <ImageSlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    case 'color':
      return <ColorSlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    case 'gradient':
      return <GradientSlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    case 'variant':
      return <VariantSlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    case 'font':
      return <FontSlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    case 'number':
    case 'spacing':
      return <NumberSlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    case 'toggle':
      return <ToggleSlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    case 'shadow':
      return <ShadowSlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    case 'select':
      return <SelectSlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    case 'multiselect':
      return <MultiSelectSlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    case 'animation':
      return <AnimationSlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    case 'link':
      return <LinkSlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    case 'array':
      return <ArraySlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    case 'object':
      return <ObjectSlotEditor slot={slot} value={value} onChange={onChange} disabled={disabled} />

    default:
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">
            Unknown slot type: <strong>{slot.type}</strong>
          </p>
        </div>
      )
  }
}
