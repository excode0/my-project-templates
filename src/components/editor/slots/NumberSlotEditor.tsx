'use client'

import { type SlotEditorProps } from './SlotEditor'

export function NumberSlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const currentValue = value !== undefined ? value : slot.default || 0
  const min = slot.min !== undefined ? slot.min : 0
  const max = slot.max !== undefined ? slot.max : 100
  const step = slot.step || 1
  const unit = slot.unit || ''

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={slot.id} className="block text-sm font-medium text-slate-700">
          {slot.label}
        </label>
        <span className="text-sm font-mono text-slate-600">
          {currentValue}{unit}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Slider */}
        <input
          id={slot.id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((currentValue - min) / (max - min)) * 100}%, #E5E7EB ${((currentValue - min) / (max - min)) * 100}%, #E5E7EB 100%)`,
          }}
        />

        {/* Number input */}
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="w-20 px-2 py-1 border border-slate-300 rounded text-sm text-center disabled:bg-slate-100"
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}
