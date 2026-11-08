'use client'

import { type SlotEditorProps } from './SlotEditor'
import { type EditableSlot } from '@/types'
import { SlotEditor } from './SlotEditor'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { useState } from 'react'

export function ArraySlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const items: any[] = Array.isArray(value) ? value : (slot.default || [])
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const handleAdd = () => {
    const newItem: any = {}
    
    // Initialize with default values from schema
    if (slot.validation && typeof slot.validation === 'object' && 'itemSchema' in slot.validation) {
      const itemSchema = (slot.validation as any).itemSchema
      Object.keys(itemSchema).forEach((key) => {
        newItem[key] = itemSchema[key].default || ''
      })
    }

    onChange([...items, newItem])
    setExpandedIndex(items.length)
  }

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
    if (expandedIndex === index) {
      setExpandedIndex(null)
    }
  }

  const handleItemChange = (index: number, field: string, fieldValue: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: fieldValue }
    onChange(newItems)
  }

  const maxItems = (slot.validation as any)?.maxItems || 50
  const minItems = (slot.validation as any)?.minItems || 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          {slot.label}
          {slot.validation?.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <span className="text-xs text-slate-500">
          {items.length} / {maxItems} items
        </span>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="border-2 border-slate-200 rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-200">
              <GripVertical className="w-4 h-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="flex-1 text-left text-sm font-medium text-slate-700"
              >
                Item {index + 1}
              </button>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled || items.length <= minItems}
                className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            {expandedIndex === index && (
              <div className="p-3 space-y-3">
                {slot.validation && typeof slot.validation === 'object' && 'itemSchema' in slot.validation && 
                  Object.entries((slot.validation as any).itemSchema).map(([field, fieldDef]: [string, any]) => {
                    const fieldSlot: EditableSlot = {
                      id: `${slot.id}-${index}-${field}`,
                      label: fieldDef.label || field,
                      type: fieldDef.type,
                      default: fieldDef.default,
                      options: fieldDef.options,
                      validation: fieldDef.validation,
                      maxLength: fieldDef.maxLength,
                      aspectRatio: fieldDef.aspectRatio,
                    }

                    return (
                      <SlotEditor
                        key={field}
                        slot={fieldSlot}
                        value={item[field]}
                        onChange={(val) => handleItemChange(index, field, val)}
                        disabled={disabled}
                      />
                    )
                  })
                }
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add button */}
      {items.length < maxItems && (
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="w-full py-2 px-4 border-2 border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add item
        </button>
      )}

      {minItems > 0 && items.length < minItems && (
        <p className="text-xs text-red-500">
          At least {minItems} items are required
        </p>
      )}
    </div>
  )
}
