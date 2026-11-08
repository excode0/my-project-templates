# Database Migration Examples

Panduan migrasi dari direct database queries ke Repository Pattern.

## 📋 Template Queries

### ❌ Before (Old Way)
```typescript
import { db } from '@/lib/db'

// Find template by slug
const result = await db.query(
  'SELECT * FROM templates WHERE slug = $1',
  [slug]
)
const template = result.rows[0]

// Find with stats
const result = await db.query(
  `SELECT 
    t.*,
    u.username as contributor_username,
    (SELECT COUNT(*) FROM template_purchases WHERE template_id = t.id) as purchase_count,
    (SELECT AVG(rating)::numeric(3,2) FROM template_reviews WHERE template_id = t.id) as avg_rating
  FROM templates t
  JOIN users u ON t.contributor_id = u.id
  WHERE t.slug = $1 AND t.status = 'approved'`,
  [slug]
)
const template = result.rows[0]

// Transform manually
const transformedTemplate = {
  id: template.id,
  name: template.name,
  price: parseFloat(template.price),
  createdAt: template.created_at.toISOString(),
  // ... manual transformation
}
```

### ✅ After (Repository Way)
```typescript
import { templateRepository } from '@/lib/database'

// Find template by slug
const template = await templateRepository.findBySlug(slug)

// Find with stats
const template = await templateRepository.findBySlugWithDetails(slug)

// Already transformed with proper types!
```

## 📋 Review Queries

### ❌ Before
```typescript
// Find reviews for template
const result = await db.query(
  `SELECT 
    r.*,
    u.username,
    u.email
  FROM template_reviews r
  JOIN users u ON r.user_id = u.id
  WHERE r.template_id = $1
  ORDER BY r.created_at DESC
  LIMIT 10`,
  [templateId]
)

const reviews = result.rows.map(row => ({
  id: row.id,
  rating: row.rating,
  comment: row.comment,
  createdAt: row.created_at.toISOString(),
  username: row.username,
  email: row.email,
}))
```

### ✅ After
```typescript
import { reviewRepository } from '@/lib/database'

const reviews = await reviewRepository.findByTemplateId(templateId, 10)
```

## 📋 User Queries

### ❌ Before
```typescript
// Find user
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
)
const user = result.rows[0]

// Check if exists
const result = await db.query(
  'SELECT COUNT(*) FROM users WHERE email = $1',
  [email]
)
const exists = result.rows[0].count > 0
```

### ✅ After
```typescript
import { userRepository } from '@/lib/database'

// Find user
const user = await userRepository.findByEmail(email)

// Check if exists
const exists = await userRepository.emailExists(email)
```

## 📋 Purchase Queries

### ❌ Before
```typescript
// Create purchase
const result = await db.query(
  `INSERT INTO template_purchases (
    user_id, template_id, price_paid, payment_status
  )
  VALUES ($1, $2, $3, $4)
  RETURNING *`,
  [userId, templateId, price, 'pending']
)
const purchase = result.rows[0]

// Check if purchased
const result = await db.query(
  'SELECT id FROM template_purchases WHERE user_id = $1 AND template_id = $2',
  [userId, templateId]
)
const hasPurchased = result.rows.length > 0

// Get user purchases
const result = await db.query(
  `SELECT 
    tp.*,
    t.name as template_name,
    ti.subdomain
  FROM template_purchases tp
  JOIN templates t ON tp.template_id = t.id
  LEFT JOIN template_instances ti ON tp.id = ti.purchase_id
  WHERE tp.user_id = $1
  ORDER BY tp.created_at DESC`,
  [userId]
)
```

### ✅ After
```typescript
import { purchaseRepository } from '@/lib/database'

// Create purchase
const purchase = await purchaseRepository.create({
  userId,
  templateId,
  pricePaid: price,
  paymentStatus: 'pending'
})

// Check if purchased
const hasPurchased = await purchaseRepository.hasPurchased(userId, templateId)

// Get user purchases (automatically includes template and instance info)
const purchases = await purchaseRepository.findByUserId(userId)
```

## 📋 Instance Queries

### ❌ Before
```typescript
// Check subdomain availability
const result = await db.query(
  'SELECT id FROM template_instances WHERE subdomain = $1',
  [subdomain]
)
const available = result.rows.length === 0

// Create instance
const result = await db.query(
  `INSERT INTO template_instances (
    purchase_id, user_id, template_id, subdomain, config
  )
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *`,
  [purchaseId, userId, templateId, subdomain, JSON.stringify(config)]
)

// Generate unique subdomain
let subdomain = baseName
let counter = 0
let available = false
while (!available) {
  const result = await db.query(
    'SELECT id FROM template_instances WHERE subdomain = $1',
    [subdomain]
  )
  if (result.rows.length === 0) {
    available = true
  } else {
    counter++
    subdomain = `${baseName}-${counter}`
  }
}
```

### ✅ After
```typescript
import { instanceRepository } from '@/lib/database'

// Check subdomain availability
const available = await instanceRepository.isSubdomainAvailable(subdomain)

// Create instance
const instance = await instanceRepository.create({
  purchaseId,
  userId,
  templateId,
  subdomain,
  config
})

// Generate unique subdomain (built-in!)
const subdomain = await instanceRepository.generateUniqueSubdomain(baseName)
```

## 📋 Complete API Route Example

### ❌ Before (src/app/api/purchases/route.ts)
```typescript
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await db.query(
    `SELECT 
      tp.id,
      tp.template_id,
      tp.price_paid,
      tp.payment_status,
      tp.created_at,
      t.name as template_name,
      t.slug as template_slug,
      t.preview_image,
      ti.subdomain,
      ti.custom_domain
    FROM template_purchases tp
    JOIN templates t ON tp.template_id = t.id
    LEFT JOIN template_instances ti ON tp.id = ti.purchase_id
    WHERE tp.user_id = $1
    ORDER BY tp.created_at DESC`,
    [session.user.id]
  )

  const purchases = result.rows.map(row => ({
    id: row.id,
    templateId: row.template_id,
    pricePaid: parseFloat(row.price_paid),
    paymentStatus: row.payment_status,
    createdAt: row.created_at.toISOString(),
    template: {
      name: row.template_name,
      slug: row.template_slug,
      previewImage: row.preview_image
    },
    instance: row.subdomain ? {
      subdomain: row.subdomain,
      customDomain: row.custom_domain
    } : null
  }))

  return NextResponse.json({ purchases })
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  // Check if template exists
  const templateResult = await db.query(
    'SELECT * FROM templates WHERE id = $1 AND status = $2',
    [body.templateId, 'approved']
  )

  if (templateResult.rows.length === 0) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  const template = templateResult.rows[0]

  // Check if already purchased
  const existingResult = await db.query(
    'SELECT id FROM template_purchases WHERE user_id = $1 AND template_id = $2',
    [session.user.id, body.templateId]
  )

  if (existingResult.rows.length > 0) {
    return NextResponse.json({ error: 'Already purchased' }, { status: 400 })
  }

  // Create purchase
  const purchaseResult = await db.query(
    `INSERT INTO template_purchases (user_id, template_id, price_paid, payment_status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [session.user.id, body.templateId, template.price, 'pending']
  )

  const purchase = purchaseResult.rows[0]

  // Generate subdomain
  let subdomain = template.slug
  let counter = 0
  let available = false
  
  while (!available) {
    const checkResult = await db.query(
      'SELECT id FROM template_instances WHERE subdomain = $1',
      [subdomain]
    )
    
    if (checkResult.rows.length === 0) {
      available = true
    } else {
      counter++
      subdomain = `${template.slug}-${counter}`
    }
  }

  // Create instance
  const instanceResult = await db.query(
    `INSERT INTO template_instances (purchase_id, user_id, template_id, subdomain, config)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [purchase.id, session.user.id, body.templateId, subdomain, JSON.stringify({})]
  )

  return NextResponse.json({ 
    success: true,
    purchase: {
      id: purchase.id,
      subdomain: instanceResult.rows[0].subdomain
    }
  })
}
```

### ✅ After (Cleaner with Repositories)
```typescript
import { getServerSession } from 'next-auth'
import { 
  templateRepository, 
  purchaseRepository, 
  instanceRepository 
} from '@/lib/database'

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Single call, already includes all related data
  const purchases = await purchaseRepository.findByUserId(session.user.id)

  return NextResponse.json({ purchases })
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  // Verify template exists
  const template = await templateRepository.findById(body.templateId)
  if (!template || template.status !== 'approved') {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  // Check if already purchased
  const hasPurchased = await purchaseRepository.hasPurchased(
    session.user.id, 
    body.templateId
  )
  
  if (hasPurchased) {
    return NextResponse.json({ error: 'Already purchased' }, { status: 400 })
  }

  // Create purchase
  const purchase = await purchaseRepository.create({
    userId: session.user.id,
    templateId: body.templateId,
    pricePaid: template.price,
    paymentStatus: 'pending'
  })

  // Generate unique subdomain automatically
  const subdomain = await instanceRepository.generateUniqueSubdomain(template.slug)

  // Create instance
  const instance = await instanceRepository.create({
    purchaseId: purchase.id,
    userId: session.user.id,
    templateId: body.templateId,
    subdomain,
    config: {}
  })

  return NextResponse.json({ 
    success: true,
    purchase: {
      id: purchase.id,
      subdomain: instance.subdomain
    }
  })
}
```

## 🎯 Benefits Comparison

| Aspect | Before | After |
|--------|--------|-------|
| **Lines of Code** | 150+ lines | 50 lines |
| **Type Safety** | ❌ Manual casting | ✅ Automatic |
| **Reusability** | ❌ Copy-paste queries | ✅ Single source |
| **Maintainability** | ❌ Scattered queries | ✅ Centralized |
| **Testing** | ❌ Hard to mock | ✅ Easy to mock |
| **Error Handling** | ❌ Inconsistent | ✅ Consistent |
| **Data Transform** | ❌ Manual every time | ✅ Automatic |

## 🔄 Step-by-Step Migration Process

1. **Identify** direct database queries in your file
2. **Find** the appropriate repository method (or create one)
3. **Replace** db.query() with repository call
4. **Remove** manual data transformation code
5. **Update** types to use repository return types
6. **Test** the functionality
7. **Remove** unused imports

## ✅ Final Checklist

- [ ] All `db.query()` replaced with repositories
- [ ] Manual transformations removed
- [ ] Proper types imported from `@/lib/database`
- [ ] Error handling maintained
- [ ] Functionality tested
- [ ] Code is cleaner and shorter

## 📚 Next Steps

After migrating, consider:
1. Adding more specific repository methods for your use cases
2. Implementing caching in repositories
3. Adding comprehensive error handling
4. Writing tests for repositories
5. Creating custom queries for complex operations

---

**Happy Migration! 🚀**
