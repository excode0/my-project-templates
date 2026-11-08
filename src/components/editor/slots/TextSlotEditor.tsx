'use client'

import { type SlotEditorProps } from './SlotEditor'

export function TextSlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const isMultiline = slot.type === 'richtext' || (slot.maxLength && slot.maxLength > 200)

  return (
    <div className="space-y-2">
      <label htmlFor={slot.id} className="block text-sm font-medium text-slate-700">
        {slot.label}
        {slot.validation?.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {isMultiline ? (
        <textarea
          id={slot.id}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={slot.maxLength}
          rows={5}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
          placeholder={`Enter ${slot.label.toLowerCase()}...`}
        />
      ) : (
        <input
          id={slot.id}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={slot.maxLength}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
          placeholder={`Enter ${slot.label.toLowerCase()}...`}
        />
      )}

      {slot.maxLength && (
        <p className="text-xs text-slate-500">
          {value?.length || 0} / {slot.maxLength} characters
        </p>
      )}
    </div>
  )
}
