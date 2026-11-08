'use client'

import { type SlotEditorProps } from './SlotEditor'
import { useState, useEffect } from 'react'

interface AnimationValue {
  type: string
  duration: number
  delay: number
  easing: string
}

export function AnimationSlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const defaultAnimation: AnimationValue = {
    type: 'fade',
    duration: 600,
    delay: 0,
    easing: 'ease-in-out',
  }

  const currentValue: AnimationValue = value || slot.default || defaultAnimation
  const [animation, setAnimation] = useState<AnimationValue>(currentValue)

  useEffect(() => {
    setAnimation(currentValue)
  }, [currentValue])

  const handleChange = (field: keyof AnimationValue, val: any) => {
    const updated = { ...animation, [field]: val }
    setAnimation(updated)
    onChange(updated)
  }

  const animationTypes = (slot.options || ['fade', 'slide', 'zoom', 'bounce', 'none']) as string[]
  const easingOptions = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        {slot.label}
      </label>

      {/* Animation Type */}
      <div className="space-y-1">
        <label className="text-xs text-slate-500">Tipe Animasi:</label>
        <select
          value={animation.type}
          onChange={(e) => handleChange('type', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-400 disabled:bg-slate-100"
        >
          {animationTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Duration */}
      <div className="space-y-1">
        <label className="text-xs text-slate-500">Durasi (ms):</label>
        <input
          type="number"
          value={animation.duration}
          onChange={(e) => handleChange('duration', Number(e.target.value))}
          disabled={disabled}
          min={0}
          max={5000}
          step={100}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-400 disabled:bg-slate-100"
        />
      </div>

      {/* Delay */}
      <div className="space-y-1">
        <label className="text-xs text-slate-500">Delay (ms):</label>
        <input
          type="number"
          value={animation.delay}
          onChange={(e) => handleChange('delay', Number(e.target.value))}
          disabled={disabled}
          min={0}
          max={5000}
          step={100}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-400 disabled:bg-slate-100"
        />
      </div>

      {/* Easing */}
      <div className="space-y-1">
        <label className="text-xs text-slate-500">Easing:</label>
        <select
          value={animation.easing}
          onChange={(e) => handleChange('easing', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-400 disabled:bg-slate-100"
        >
          {easingOptions.map((easing) => (
            <option key={easing} value={easing}>
              {easing}
            </option>
          ))}
        </select>
      </div>

      {/* Preview */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <p className="text-xs text-slate-500 mb-2">Preview:</p>
        <div className="text-xs font-mono text-slate-700">
          animation: {animation.type} {animation.duration}ms {animation.easing} {animation.delay}ms
        </div>
      </div>
    </div>
  )
}
