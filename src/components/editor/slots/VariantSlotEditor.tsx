'use client'

import { type SlotEditorProps } from './SlotEditor'
import { cn } from '@/lib/utils'

export function VariantSlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const currentValue = value || slot.default

  if (!slot.options || slot.options.length === 0) {
    return <div className="text-sm text-red-500">No options defined</div>
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {slot.label}
      </label>

      <div className="grid grid-cols-2 gap-2">
        {slot.options.map((option) => {
          const isSelected = option.value === currentValue

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              disabled={disabled}
              className={cn(
                'px-4 py-3 border-2 rounded-lg text-sm font-medium transition-all',
                'hover:border-orange-400 disabled:cursor-not-allowed disabled:opacity-50',
                isSelected
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-slate-300 bg-white text-slate-700'
              )}
            >
              {option.preview && (
                <div className="mb-2">
                  <img
                    src={option.preview}
                    alt={option.label}
                    className="w-full h-20 object-cover rounded"
                  />
                </div>
              )}
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
