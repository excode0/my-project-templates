'use client'

import { type SlotEditorProps } from './SlotEditor'

export function ToggleSlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const currentValue = value !== undefined ? value : slot.default || false

  return (
    <div className="flex items-center justify-between">
      <label htmlFor={slot.id} className="text-sm font-medium text-slate-700">
        {slot.label}
      </label>

      <button
        id={slot.id}
        type="button"
        role="switch"
        aria-checked={currentValue}
        onClick={() => onChange(!currentValue)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${currentValue ? 'bg-orange-500' : 'bg-slate-200'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${currentValue ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}
