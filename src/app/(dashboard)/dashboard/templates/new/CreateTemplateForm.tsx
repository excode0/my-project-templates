'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Upload } from 'lucide-react'
import { slugify } from '@/lib/utils'

const CATEGORIES = [
  'Wedding',
  'Portfolio',
  'Business',
  'Blog',
  'Event',
  'Restaurant',
  'Education',
  'Other',
]

export function CreateTemplateForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin =
    session?.user?.role === 'admin' || session?.user?.role === 'super_admin'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'Wedding',
    price: 50000,
    description: '',
    type: 'hardcode' as 'hardcode' | 'editor',
    requires_custom_domain: false,
  })

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: slugify(name),
    })
  }

  const handlePreviewUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image must be less than 10MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setError('File must be an image')
        return
      }

      setPreviewFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Upload preview image first if provided
      let preview_image = ''
      if (previewFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', previewFile)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload preview image')
        }

        const uploadData = await uploadResponse.json()
        preview_image = uploadData.url
      }

      // Create template
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preview_image,
          status: 'draft',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create template')
      }

      const data = await response.json()
      
      // Continue editing the newly created template.
      router.push(`/dashboard/templates/${data.data.id}/edit` as any)
      router.refresh()
    } catch (err: any) {
      console.error('Template creation error:', err)
      setError(err.message || 'Failed to create template')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template Name */}
      <div>
        <Label htmlFor="name">Template Name *</Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g., Wedding Elegant"
          required
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          disabled={loading}
          className="mt-1"
        />
      </div>

      {/* Slug (auto-generated) */}
      <div>
        <Label htmlFor="slug">Slug (URL-friendly name) *</Label>
        <Input
          id="slug"
          type="text"
          placeholder="wedding-elegant"
          required
          value={formData.slug}
          onChange={(e) =>
            setFormData({ ...formData, slug: slugify(e.target.value) })
          }
          disabled={loading}
          className="mt-1"
        />
        <p className="text-xs text-slate-500 mt-1">
          Used in URLs: /templates/{formData.slug || 'your-template'}
        </p>
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">Category *</Label>
        <select
          id="category"
          required
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          disabled={loading}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div>
        <Label htmlFor="price">Price (IDR) *</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="1000"
          required
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
          }
          disabled={loading}
          className="mt-1"
        />
        <p className="text-xs text-slate-500 mt-1">
          Minimum: Rp 0 (free), Recommended: Rp 50.000+
        </p>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={4}
          placeholder="Describe your template, its features, and use cases..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          disabled={loading}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Preview Image */}
      <div>
        <Label htmlFor="preview">Preview Image</Label>
        <div className="mt-1">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-slate-300"
              />
              <button
                type="button"
                onClick={() => {
                  setPreviewFile(null)
                  setPreviewUrl('')
                }}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
          ) : (
            <label
              htmlFor="preview"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50"
            >
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm text-slate-600">Click to upload preview image</span>
              <span className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</span>
            </label>
          )}
          <input
            id="preview"
            type="file"
            accept="image/*"
            onChange={handlePreviewUpload}
            disabled={loading}
            className="hidden"
          />
        </div>
      </div>

      {/* Template Type */}
      <div>
        <Label>Template Type *</Label>
        <div className="mt-2 space-y-2">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="hardcode"
              checked={formData.type === 'hardcode'}
              onChange={() =>
                setFormData({ ...formData, type: 'hardcode' })
              }
              disabled={loading}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-sm">Hardcoded Template</p>
              <p className="text-xs text-slate-500">
                Pre-built React components with predefined slots
              </p>
            </div>
          </label>
          <label className="flex items-start space-x-3 cursor-pointer opacity-50">
            <input
              type="radio"
              name="type"
              value="editor"
              checked={formData.type === 'editor'}
              onChange={() =>
                setFormData({ ...formData, type: 'editor' })
              }
              disabled={true} // Disabled for now
              className="mt-1"
            />
            <div>
              <p className="font-medium text-sm">Visual Editor (Coming Soon)</p>
              <p className="text-xs text-slate-500">
                Build templates using drag-and-drop editor
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Requires Custom Domain */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="requires_custom_domain"
          checked={formData.requires_custom_domain}
          onChange={(e) =>
            setFormData({ ...formData, requires_custom_domain: e.target.checked })
          }
          disabled={loading}
          className="mt-1"
        />
        <div>
          <Label htmlFor="requires_custom_domain" className="cursor-pointer">
            Requires Custom Domain
          </Label>
          <p className="text-xs text-slate-500">
            Users must connect a custom domain to use this template
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Creating...' : 'Create Template'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push((isAdmin ? '/dashboard/templates' : '/dashboard') as any)
          }
          disabled={loading}
        >
          Cancel
        </Button>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Template will be created as &quot;Draft&quot;. You can define editable slots and submit for review later.
      </p>
    </form>
  )
}
