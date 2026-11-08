'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Upload, Send } from 'lucide-react'
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

interface EditTemplateFormProps {
  template: any
}

export function EditTemplateForm({ template }: EditTemplateFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin =
    session?.user?.role === 'admin' || session?.user?.role === 'super_admin'
  const backHref = isAdmin ? '/dashboard/templates' : '/dashboard'
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(template.preview_image || '')
  
  const [formData, setFormData] = useState({
    name: template.name || '',
    slug: template.slug || '',
    category: template.category || 'Wedding',
    price: template.price || 0,
    description: template.description || '',
    requires_custom_domain: template.requires_custom_domain || false,
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
      if (file.size > 10 * 1024 * 1024) {
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

  const handleSave = async (submitForReview = false) => {
    if (submitForReview) {
      setSubmitting(true)
    } else {
      setLoading(true)
    }
    setError('')
    setSuccess('')

    try {
      // Upload new preview image if changed
      let preview_image = previewUrl
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

      // Update template
      const status = submitForReview ? 'pending' : template.status
      
      const response = await fetch(`/api/templates/${template.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          preview_image,
          status,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update template')
      }

      setSuccess(
        submitForReview
          ? 'Template submitted for review! You will be notified once approved.'
          : 'Template updated successfully!'
      )
      
      setTimeout(() => {
        router.push(backHref as any)
        router.refresh()
      }, 1500)
    } catch (err: any) {
      console.error('Template update error:', err)
      setError(err.message || 'Failed to update template')
    } finally {
      setLoading(false)
      setSubmitting(false)
    }
  }

  const canSubmitForReview = template.status === 'draft' || template.status === 'rejected'

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }} className="space-y-6">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Status:</span>
        <span className={`inline-flex px-3 py-1 text-sm rounded-full ${
          template.status === 'draft' ? 'bg-slate-100 text-slate-700' :
          template.status === 'review' || template.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          template.status === 'published' || template.status === 'approved' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
        </span>
      </div>

      {/* Template Name */}
      <div>
        <Label htmlFor="name">Template Name *</Label>
        <Input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          disabled={loading || submitting}
          className="mt-1"
        />
      </div>

      {/* Slug */}
      <div>
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          type="text"
          required
          value={formData.slug}
          onChange={(e) =>
            setFormData({ ...formData, slug: slugify(e.target.value) })
          }
          disabled={loading || submitting}
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
          disabled={loading || submitting}
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
          disabled={loading || submitting}
          className="mt-1"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={4}
          placeholder="Describe your template..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          disabled={loading || submitting}
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
            </label>
          )}
          <input
            id="preview"
            type="file"
            accept="image/*"
            onChange={handlePreviewUpload}
            disabled={loading || submitting}
            className="hidden"
          />
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
          disabled={loading || submitting}
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

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading || submitting}
          className="flex-1"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        
        {canSubmitForReview && (
          <Button
            type="button"
            onClick={() => handleSave(true)}
            disabled={loading || submitting}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? 'Submitting...' : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit for Review
              </>
            )}
          </Button>
        )}
        
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(backHref as any)}
          disabled={loading || submitting}
        >
          Cancel
        </Button>
      </div>

      {(template.status === 'review' || template.status === 'pending') && (
        <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
          ⏳ Your template is currently under review. You&apos;ll be notified once it&apos;s approved or if changes are needed.
        </p>
      )}

      {(template.status === 'published' || template.status === 'approved') && (
        <p className="text-sm text-green-700 bg-green-50 p-3 rounded">
          ✅ Your template is live and available for purchase!
        </p>
      )}
    </form>
  )
}
