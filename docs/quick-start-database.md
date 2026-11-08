# 🚀 Quick Start: Database Operations

Panduan cepat menggunakan database repositories di my-project-templates.

## 📦 Import

```typescript
// Import repositories yang dibutuhkan
import { 
  templateRepository, 
  reviewRepository, 
  userRepository,
  purchaseRepository,
  instanceRepository 
} from '@/lib/database'

// Atau import types
import type { Template, User, TemplateWithStats } from '@/lib/database'
```

## 🎯 Common Use Cases

### 1. Get Template Details
```typescript
// Untuk detail page
const template = await templateRepository.findBySlugWithDetails('minimal-portfolio')

// Template akan include:
// - Basic info (name, slug, price, category, etc)
// - Contributor info (username, email)
// - Stats (purchaseCount, avgRating, reviewCount)
```

### 2. List Templates with Filters
```typescript
const { data, pagination } = await templateRepository.findAll(
  {
    category: 'portfolio',
    status: 'approved',
    featured: true,
    minPrice: 0,
    maxPrice: 50,
    search: 'minimal'
  },
  {
    page: 1,
    limit: 12,
    sortBy: 'created_at',
    sortOrder: 'desc'
  }
)

// data: Template[]
// pagination: { page, limit, total, totalPages }
```

### 3. Check User Purchase
```typescript
// Simple check
const hasPurchased = await purchaseRepository.hasPurchased(userId, templateId)

if (hasPurchased) {
  // User already owns this template
}
```

### 4. Create Purchase Flow
```typescript
// 1. Verify template
const template = await templateRepository.findById(templateId)
if (!template || template.status !== 'approved') {
  throw new Error('Template not available')
}

// 2. Check if already purchased
const hasPurchased = await purchaseRepository.hasPurchased(userId, templateId)
if (hasPurchased) {
  throw new Error('Already purchased')
}

// 3. Create purchase
const purchase = await purchaseRepository.create({
  userId,
  templateId,
  pricePaid: template.price,
  paymentStatus: 'pending'
})

// 4. Create instance with unique subdomain
const subdomain = await instanceRepository.generateUniqueSubdomain(template.slug)
const instance = await instanceRepository.create({
  purchaseId: purchase.id,
  userId,
  templateId,
  subdomain,
  config: {}
})
```

### 5. Get User's Purchases
```typescript
// Get all purchases with template and instance info
const purchases = await purchaseRepository.findByUserId(userId)

// Each purchase includes:
// - Purchase info (id, pricePaid, paymentStatus, createdAt)
// - Template info (name, slug, previewImage)
// - Instance info (subdomain, customDomain, status) if created
```

### 6. Display Reviews
```typescript
// Get reviews for template
const reviews = await reviewRepository.findByTemplateId(templateId, 10)

// Get rating statistics
const avgRating = await reviewRepository.getAverageRating(templateId)
const reviewCount = await reviewRepository.getReviewCount(templateId)
const distribution = await reviewRepository.getRatingDistribution(templateId)
// distribution: { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }
```

### 7. User Authentication
```typescript
// Find user for login
const user = await userRepository.findByEmailWithPassword(email)

if (user && await bcrypt.compare(password, user.passwordHash)) {
  // Login successful
  // user includes: id, username, email, role, status
}
```

### 8. Check Subdomain Availability
```typescript
// Simple check
const available = await instanceRepository.isSubdomainAvailable('my-site')

// Or auto-generate unique subdomain
const subdomain = await instanceRepository.generateUniqueSubdomain('my-site')
// Result: 'my-site' or 'my-site-1' or 'my-site-2', etc.
```

## 🎨 Server Component Example

```typescript
// app/templates/page.tsx
import { templateRepository } from '@/lib/database'

export default async function TemplatesPage({
  searchParams
}: {
  searchParams: { category?: string; page?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  
  const { data: templates, pagination } = await templateRepository.findAll(
    { 
      category: searchParams.category,
      status: 'approved' 
    },
    { 
      page, 
      limit: 12 
    }
  )

  return (
    <div>
      <h1>Templates</h1>
      <div className="grid grid-cols-3 gap-4">
        {templates.map(template => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
      <Pagination {...pagination} />
    </div>
  )
}
```

## 🔌 API Route Example

```typescript
// app/api/templates/route.ts
import { NextResponse } from 'next/server'
import { templateRepository } from '@/lib/database'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || undefined
    const featured = searchParams.get('featured') === 'true'

    const { data, pagination } = await templateRepository.findAll(
      { category, featured, status: 'approved' },
      { page: 1, limit: 20 }
    )

    return NextResponse.json({ success: true, data, pagination })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate slug
    const exists = await templateRepository.slugExists(body.slug)
    if (exists) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // Create template
    const template = await templateRepository.create(body)

    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
```

## 🔒 Server Action Example

```typescript
// app/actions/templates.ts
'use server'

import { templateRepository } from '@/lib/database'
import { revalidatePath } from 'next/cache'

export async function updateTemplateAction(
  templateId: string,
  data: { name?: string; price?: number; description?: string }
) {
  try {
    const template = await templateRepository.update(templateId, {
      name: data.name,
      price: data.price?.toString(),
      description: data.description
    })

    if (!template) {
      return { success: false, error: 'Template not found' }
    }

    // Revalidate pages that show this template
    revalidatePath(`/marketplace/${template.slug}`)
    revalidatePath('/marketplace')

    return { success: true, data: template }
  } catch (error) {
    console.error('Error updating template:', error)
    return { success: false, error: 'Failed to update template' }
  }
}
```

## 💾 Complex Query Example

```typescript
// Get user dashboard data
async function getUserDashboard(userId: string) {
  const [user, stats, purchases, templates] = await Promise.all([
    userRepository.findById(userId),
    userRepository.getStats(userId),
    purchaseRepository.findByUserId(userId),
    templateRepository.findAll(
      { contributorId: userId },
      { page: 1, limit: 10 }
    )
  ])

  return {
    user,
    stats, // { purchaseCount, templateCount, reviewCount, totalEarnings }
    purchases,
    templates: templates.data
  }
}
```

## ⚡ Performance Tips

### 1. Use Parallel Queries
```typescript
// ✅ Good - Run in parallel
const [template, reviews, related] = await Promise.all([
  templateRepository.findBySlugWithDetails(slug),
  reviewRepository.findByTemplateId(templateId, 10),
  templateRepository.findRelated(slug, category, 3)
])

// ❌ Bad - Sequential
const template = await templateRepository.findBySlugWithDetails(slug)
const reviews = await reviewRepository.findByTemplateId(templateId, 10)
const related = await templateRepository.findRelated(slug, category, 3)
```

### 2. Use Specific Methods
```typescript
// ✅ Good - Use specific method
const exists = await userRepository.emailExists(email)

// ❌ Bad - Fetch then check
const user = await userRepository.findByEmail(email)
const exists = !!user
```

### 3. Limit Results
```typescript
// ✅ Good - Limit what you need
const reviews = await reviewRepository.findByTemplateId(templateId, 5)

// ❌ Bad - Fetch all then slice
const allReviews = await reviewRepository.findByTemplateId(templateId, 1000)
const reviews = allReviews.slice(0, 5)
```

## 🐛 Error Handling

```typescript
try {
  const template = await templateRepository.findById(id)
  
  if (!template) {
    return { error: 'Template not found', status: 404 }
  }

  // Process template
} catch (error) {
  console.error('Database error:', error)
  return { error: 'Internal server error', status: 500 }
}
```

## 🧪 Testing (Mock Example)

```typescript
// __tests__/template.test.ts
import { templateRepository } from '@/lib/database'

// Mock repository
jest.mock('@/lib/database', () => ({
  templateRepository: {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn()
  }
}))

test('should get template', async () => {
  const mockTemplate = { id: '1', name: 'Test' }
  
  ;(templateRepository.findById as jest.Mock).mockResolvedValue(mockTemplate)
  
  const result = await templateRepository.findById('1')
  
  expect(result).toEqual(mockTemplate)
  expect(templateRepository.findById).toHaveBeenCalledWith('1')
})
```

## 📚 More Examples

Lihat dokumentasi lengkap:
- [Database Repository Pattern](./database-repository-pattern.md) - Full documentation
- [Migration Examples](./database-migration-examples.md) - Before/After comparisons

---

**Happy Coding! 🚀**
