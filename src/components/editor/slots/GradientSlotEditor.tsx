'use client'

import { type SlotEditorProps } from './SlotEditor'
import { useState } from 'react'

export function GradientSlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const currentGradient = value || slot.default || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  const [customGradient, setCustomGradient] = useState(currentGradient)

  const handlePresetClick = (gradient: string) => {
    setCustomGradient(gradient)
    onChange(gradient)
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomGradient(e.target.value)
  }

  const handleCustomBlur = () => {
    onChange(customGradient)
  }

  return (
    <div className="space-y-3">
      <label htmlFor={slot.id} className="block text-sm font-medium text-slate-700">
        {slot.label}
      </label>

      {/* Preview */}
      <div
        className="w-full h-24 rounded-lg border-2 border-slate-300 shadow-sm"
        style={{ background: currentGradient }}
      />

      {/* Custom gradient input */}
      <div className="space-y-1">
        <label className="text-xs text-slate-500">CSS Gradient:</label>
        <input
          id={slot.id}
          type="text"
          value={customGradient}
          onChange={handleCustomChange}
          onBlur={handleCustomBlur}
          disabled={disabled}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-100"
          placeholder="linear-gradient(...)"
        />
      </div>

      {/* Presets */}
      {slot.presets && slot.presets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Preset Gradients:</p>
          <div className="grid grid-cols-3 gap-2">
            {slot.presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetClick(preset)}
                disabled={disabled}
                className="h-12 rounded-lg border-2 hover:scale-105 transition-transform disabled:cursor-not-allowed"
                style={{
                  background: preset,
                  borderColor: preset === currentGradient ? '#3B82F6' : '#D1D5DB',
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
