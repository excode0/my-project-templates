'use client'

import { type SlotEditorProps } from './SlotEditor'

export function MultiSelectSlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const selectedValues: any[] = Array.isArray(value) ? value : (slot.default || [])

  const handleToggle = (optionValue: any) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue]
    onChange(newValues)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {slot.label}
        {slot.validation?.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="space-y-2">
        {slot.options?.map((option) => {
          const isSelected = selectedValues.includes(option.value)
          return (
            <label
              key={option.value}
              className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
              style={{
                borderColor: isSelected ? '#3B82F6' : '#D1D5DB',
                backgroundColor: isSelected ? '#EFF6FF' : 'white',
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(option.value)}
                disabled={disabled}
                className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-400 disabled:cursor-not-allowed"
              />
              <span className="text-sm font-medium text-slate-700">{option.label}</span>
            </label>
          )
        })}
      </div>

      <p className="text-xs text-slate-500">
        {selectedValues.length} item dipilih
      </p>
    </div>
  )
}
