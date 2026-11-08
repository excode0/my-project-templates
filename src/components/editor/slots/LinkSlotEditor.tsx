'use client'

import { type SlotEditorProps } from './SlotEditor'
import { useState } from 'react'

export function LinkSlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const [url, setUrl] = useState(value || slot.default || '')
  const [isValid, setIsValid] = useState(true)

  const validateUrl = (input: string) => {
    if (!input) return true
    
    // Check if it's internal link (starts with /)
    if (input.startsWith('/')) return true
    
    // Check if it's valid URL
    try {
      new URL(input)
      return true
    } catch {
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    setIsValid(validateUrl(newUrl))
  }

  const handleBlur = () => {
    if (isValid) {
      onChange(url)
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={slot.id} className="block text-sm font-medium text-slate-700">
        {slot.label}
        {slot.validation?.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        id={slot.id}
        type="text"
        value={url}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
        placeholder="/halaman atau https://example.com"
      />

      {!isValid && (
        <p className="text-xs text-red-500">
          URL tidak valid. Gunakan / untuk internal link atau URL lengkap.
        </p>
      )}

      <p className="text-xs text-slate-500">
        Internal link: /contact, /about<br />
        External link: https://example.com
      </p>
    </div>
  )
}
