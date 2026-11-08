'use client'

import { type SlotEditorProps } from './SlotEditor'
import { type EditableSlot } from '@/types'
import { SlotEditor } from './SlotEditor'

export function ObjectSlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const objectValue = value || slot.default || {}

  const handleFieldChange = (field: string, fieldValue: any) => {
    onChange({ ...objectValue, [field]: fieldValue })
  }

  // Get fields from slot definition
  const fields = (slot as any).fields || {}

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        {slot.label}
      </label>

      <div className="space-y-4 pl-4 border-l-2 border-slate-200">
        {Object.entries(fields).map(([fieldKey, fieldDef]: [string, any]) => {
          const fieldSlot: EditableSlot = {
            id: `${slot.id}-${fieldKey}`,
            label: fieldDef.label || fieldKey,
            type: fieldDef.type,
            default: fieldDef.default,
            options: fieldDef.options,
            validation: fieldDef.validation,
            maxLength: fieldDef.maxLength,
            aspectRatio: fieldDef.aspectRatio,
            presets: fieldDef.presets,
          }

          return (
            <SlotEditor
              key={fieldKey}
              slot={fieldSlot}
              value={objectValue[fieldKey]}
              onChange={(val) => handleFieldChange(fieldKey, val)}
              disabled={disabled}
            />
          )
        })}
      </div>
    </div>
  )
}
