'use client'

import { type SlotEditorProps } from './SlotEditor'

export function ShadowSlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const currentShadow = value || slot.default || 'none'

  return (
    <div className="space-y-3">
      <label htmlFor={slot.id} className="block text-sm font-medium text-slate-700">
        {slot.label}
      </label>

      {/* Preview */}
      <div className="p-6 bg-slate-50 rounded-lg flex items-center justify-center">
        <div
          className="w-32 h-32 bg-white rounded-lg"
          style={{ boxShadow: currentShadow }}
        />
      </div>

      {/* Presets */}
      {slot.presets && slot.presets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Choose a shadow:</p>
          <div className="grid grid-cols-2 gap-2">
            {slot.presets.map((preset: any, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(preset.value)}
                disabled={disabled}
                className="p-4 border-2 rounded-lg hover:bg-slate-50 transition-colors disabled:cursor-not-allowed flex items-center justify-center"
                style={{
                  borderColor: preset.value === currentShadow ? '#3B82F6' : '#D1D5DB',
                }}
              >
                <div
                  className="w-16 h-16 bg-white rounded"
                  style={{ boxShadow: preset.value }}
                />
                <span className="ml-2 text-xs text-slate-600">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom input */}
      <div className="space-y-1">
        <label className="text-xs text-slate-500">Custom CSS Shadow:</label>
        <input
          id={slot.id}
          type="text"
          value={currentShadow}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-100"
          placeholder="0 4px 6px rgba(0,0,0,0.1)"
        />
      </div>
    </div>
  )
}
