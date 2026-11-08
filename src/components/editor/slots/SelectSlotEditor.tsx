'use client'

import { type SlotEditorProps } from './SlotEditor'

export function SelectSlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const currentValue = value ?? slot.default

  return (
    <div className="space-y-2">
      <label htmlFor={slot.id} className="block text-sm font-medium text-slate-700">
        {slot.label}
        {slot.validation?.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        id={slot.id}
        value={currentValue}
        onChange={(e) => {
          const val = e.target.value
          // Try to parse as number if all options are numbers
          const parsed = !isNaN(Number(val)) ? Number(val) : val
          onChange(parsed)
        }}
        disabled={disabled}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
      >
        {!slot.validation?.required && (
          <option value="">Select {slot.label}</option>
        )}
        {slot.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
