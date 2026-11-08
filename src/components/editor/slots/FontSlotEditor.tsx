'use client'

import { type SlotEditorProps } from './SlotEditor'

export function FontSlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const currentFont = value || slot.default
  const previewText = 'The Quick Brown Fox Jumps Over The Lazy Dog'

  return (
    <div className="space-y-3">
      <label htmlFor={slot.id} className="block text-sm font-medium text-slate-700">
        {slot.label}
      </label>

      {/* Font selector */}
      <select
        id={slot.id}
        value={currentFont}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
      >
        {slot.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Preview */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <p
          className="text-lg"
          style={{ fontFamily: currentFont }}
        >
          {previewText}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Font: {slot.options?.find((o) => o.value === currentFont)?.label || currentFont}
        </p>
      </div>
    </div>
  )
}
