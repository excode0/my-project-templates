'use client'

import { type SlotEditorProps } from './SlotEditor'

export function ColorSlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const currentColor = value || slot.default || '#000000'

  return (
    <div className="space-y-2">
      <label htmlFor={slot.id} className="block text-sm font-medium text-slate-700">
        {slot.label}
      </label>

      <div className="flex items-center gap-3">
        {/* Color preview */}
        <div
          className="w-12 h-12 rounded-lg border-2 border-slate-300 shadow-sm"
          style={{ backgroundColor: currentColor }}
        />

        {/* Color picker */}
        <input
          id={slot.id}
          type="color"
          value={currentColor}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-20 h-12 rounded-lg cursor-pointer disabled:cursor-not-allowed"
        />

        {/* Hex input */}
        <input
          type="text"
          value={currentColor}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          pattern="^#[0-9A-Fa-f]{6}$"
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-100"
          placeholder="#000000"
        />
      </div>

      {/* Presets */}
      {slot.presets && slot.presets.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Presets:</p>
          <div className="flex gap-2">
            {slot.presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                disabled={disabled}
                className="w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform disabled:cursor-not-allowed"
                style={{
                  backgroundColor: preset,
                  borderColor: preset === currentColor ? '#3B82F6' : '#D1D5DB',
                }}
                title={preset}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
