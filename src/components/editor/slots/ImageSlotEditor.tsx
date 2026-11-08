'use client'

import { useState } from 'react'
import { type SlotEditorProps } from './SlotEditor'

export function ImageSlotEditor({ slot, value, onChange, disabled }: SlotEditorProps) {
  const [uploading, setUploading] = useState(false)
  const currentValue = value || slot.default

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    const allowedTypes = slot.allowedFormats || ['jpg', 'jpeg', 'png', 'webp']
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    
    if (fileExt && !allowedTypes.includes(fileExt)) {
      alert(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`)
      return
    }

    // Check file size (convert MB to bytes)
    const maxSize = (slot.maxSizeMB || 5) * 1024 * 1024
    if (file.size > maxSize) {
      alert(`File too large. Max size: ${slot.maxSizeMB || 5}MB`)
      return
    }

    setUploading(true)

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('file', file)

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        {slot.label}
      </label>

      {/* Current Image Preview */}
      {currentValue && (
        <div className="relative group">
          <img
            src={currentValue}
            alt={slot.label}
            className="w-full h-48 object-cover rounded-lg border border-slate-300"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled || uploading}
            className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
          >
            Remove
          </button>
        </div>
      )}

      {/* Upload Button */}
      <div>
        <input
          id={`${slot.id}-file`}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
        />
        <label
          htmlFor={`${slot.id}-file`}
          className={`
            inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg
            text-sm font-medium cursor-pointer
            hover:bg-slate-50 transition-colors
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {uploading ? (
            <>
              <span className="animate-spin">⏳</span>
              Uploading...
            </>
          ) : (
            <>
              <span>📁</span>
              {currentValue ? 'Replace image' : 'Upload image'}
            </>
          )}
        </label>
      </div>

      {/* URL Input (fallback) */}
      <div>
        <input
          type="url"
          value={currentValue || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
          placeholder="Or paste an image URL..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-slate-100"
        />
      </div>

      {/* Info */}
      <p className="text-xs text-slate-500">
        Format: {slot.allowedFormats?.join(', ') || 'jpg, png, webp'} • 
        Max: {slot.maxSizeMB || 5}MB
        {slot.aspectRatio && ` • Ratio: ${slot.aspectRatio}`}
      </p>
    </div>
  )
}
