# Database Repository Pattern

Sistem database menggunakan **Repository Pattern** untuk pemisahan yang jelas antara logika bisnis dan akses data. Ini membuat kode lebih modular, scalable, dan mudah di-maintain.

## 📁 Struktur Folder

```
src/lib/
├── db.ts                          # Database connection setup
└── database/
    ├── index.ts                   # Central export
    ├── types.ts                   # TypeScript types & interfaces
    └── repositories/
        ├── index.ts               # Repository exports
        ├── base.repository.ts     # Base repository class
        ├── template.repository.ts # Template operations
        ├── review.repository.ts   # Review operations
        └── user.repository.ts     # User operations
```

## 🎯 Keuntungan Repository Pattern

### 1. **Separation of Concerns**
- Business logic terpisah dari database queries
- Mudah untuk testing dengan mock repositories
- Perubahan database tidak affect business logic

### 2. **Type Safety**
- TypeScript types untuk semua entities
- Auto-completion di IDE
- Compile-time error detection

### 3. **Reusability**
- Query logic dapat digunakan di berbagai tempat
- Konsisten di seluruh aplikasi
- Mudah untuk refactor

### 4. **Maintainability**
- Satu tempat untuk semua database operations
- Mudah untuk debugging
- Clear API untuk developers

## 📝 Cara Penggunaan

### Import Repository

```typescript
import { templateRepository, reviewRepository, userRepository } from '@/lib/database'

// Atau import semua sekaligus
import { repositories } from '@/lib/database'
```

### Template Operations

```typescript
// Find template by slug with full details
const template = await templateRepository.findBySlugWithDetails('minimal-portfolio')

// Find all templates with filters and pagination
const result = await templateRepository.findAll(
  {
    category: 'portfolio',
    status: 'approved',
    featured: true,
    search: 'minimal'
  },
  {
    page: 1,
    limit: 12,
    sortBy: 'created_at',
    sortOrder: 'desc'
  }
)

// Find related templates
const related = await templateRepository.findRelated('minimal-portfolio', 'portfolio', 3)

// Find featured templates
const featured = await templateRepository.findFeatured(6)

// Create new template
const newTemplate = await templateRepository.create({
  name: 'My Template',
  slug: 'my-template',
  contributor_id: userId,
  category: 'portfolio',
  price: '29.99',
  status: 'draft',
  type: 'editor'
})

// Update template
await templateRepository.update(templateId, {
  name: 'Updated Name',
  price: '39.99',
  is_featured: true
})

// Check if slug exists
const exists = await templateRepository.slugExists('my-template')
```

### Review Operations

```typescript
// Find reviews for a template
const reviews = await reviewRepository.findByTemplateId(templateId, 10)

// Get average rating
const avgRating = await reviewRepository.getAverageRating(templateId)

// Get review count
const count = await reviewRepository.getReviewCount(templateId)

// Check if user has reviewed
const hasReviewed = await reviewRepository.hasUserReviewed(userId, templateId)

// Create review
const review = await reviewRepository.create({
  templateId,
  userId,
  rating: 5,
  comment: 'Great template!'
})

// Get rating distribution
const distribution = await reviewRepository.getRatingDistribution(templateId)
// Result: { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }
```

### User Operations

```typescript
// Find user by ID
const user = await userRepository.findById(userId)

// Find user by email
const user = await userRepository.findByEmail('user@example.com')

// Find with password (for authentication)
const userWithPassword = await userRepository.findByEmailWithPassword('user@example.com')

// Find all users with filters
const result = await userRepository.findAll(1, 20, {
  role: 'contributor',
  status: 'active',
  search: 'john'
})

// Create user
const newUser = await userRepository.create({
  username: 'johndoe',
  email: 'john@example.com',
  passwordHash: hashedPassword,
  role: 'user'
})

// Update user
await userRepository.update(userId, {
  role: 'contributor',
  status: 'active'
})

// Check if email exists
const exists = await userRepository.emailExists('john@example.com')

// Get user statistics
const stats = await userRepository.getStats(userId)
// Result: { purchaseCount, templateCount, reviewCount, totalEarnings }
```

## 🔧 Membuat Repository Baru

### 1. Definisikan Types di `types.ts`

```typescript
// Database Row Type (raw from database)
export interface MyEntityRow {
  id: string
  name: string
  created_at: Date
  updated_at: Date
}

// Application Model Type (transformed)
export interface MyEntity {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}
```

### 2. Buat Repository Class

```typescript
import { BaseRepository } from './base.repository'
import type { MyEntity, MyEntityRow } from '../types'

export class MyEntityRepository extends BaseRepository {
  // Transform database row to application model
  private transformRow(row: any): MyEntity {
    return {
      id: row.id,
      name: row.name,
      createdAt: this.toISOString(row.created_at)!,
      updatedAt: this.toISOString(row.updated_at)!,
    }
  }

  // Find by ID
  async findById(id: string): Promise<MyEntity | null> {
    const result = await this.sql`
      SELECT * FROM my_entities
      WHERE id = ${id}
    `
    
    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  // Create
  async create(data: Partial<MyEntityRow>): Promise<MyEntity> {
    const result = await this.sql`
      INSERT INTO my_entities (name)
      VALUES (${data.name})
      RETURNING *
    `

    return this.transformRow(result[0])
  }

  // Update
  async update(id: string, data: Partial<MyEntityRow>): Promise<MyEntity | null> {
    const result = await this.sql`
      UPDATE my_entities
      SET name = ${data.name}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  // Delete
  async delete(id: string): Promise<boolean> {
    const result = await this.sql`
      DELETE FROM my_entities
      WHERE id = ${id}
    `

    return result.count > 0
  }
}

// Export singleton instance
export const myEntityRepository = new MyEntityRepository()
```

### 3. Export dari `repositories/index.ts`

```typescript
export { MyEntityRepository, myEntityRepository } from './myentity.repository'

export const repositories = {
  template: templateRepository,
  review: reviewRepository,
  user: userRepository,
  myEntity: myEntityRepository, // Add here
}
```

## 🛠️ Base Repository Helpers

Base repository menyediakan helper methods:

```typescript
// Execute query and get first result
protected async findOne<T>(query): Promise<T | null>

// Execute query and get all results
protected async findMany<T>(query): Promise<T[]>

// Execute query and get count
protected async count(query): Promise<number>

// Convert date to ISO string
protected toISOString(date: Date): string | null

// Parse decimal to number
protected parseDecimal(value: string | number): number

// Execute transaction
protected async transaction<T>(callback): Promise<T>
```

## ⚡ Best Practices

### 1. **Selalu Gunakan Repository**
❌ **Jangan:**
```typescript
const result = await db`SELECT * FROM templates WHERE id = ${id}`
```

✅ **Lakukan:**
```typescript
const template = await templateRepository.findById(id)
```

### 2. **Gunakan Types yang Tepat**
```typescript
// Return type yang jelas
async findById(id: string): Promise<Template | null>

// Parameter dengan type
async create(data: Partial<TemplateRow>): Promise<Template>
```

### 3. **Transform Data di Repository**
```typescript
// Transform database format ke application format
private transformRow(row: any): Template {
  return {
    id: row.id,
    createdAt: row.created_at.toISOString(), // Date to string
    price: parseFloat(row.price), // Decimal to number
    // ...
  }
}
```

### 4. **Handle Errors Gracefully**
```typescript
async findById(id: string): Promise<Template | null> {
  try {
    const result = await this.sql`SELECT * FROM templates WHERE id = ${id}`
    return result.length > 0 ? this.transformRow(result[0]) : null
  } catch (error) {
    console.error('Error finding template:', error)
    throw error
  }
}
```

### 5. **Use Transactions for Multiple Operations**
```typescript
async createTemplateWithInstances(data: any) {
  return await this.transaction(async (sql) => {
    // Create template
    const template = await sql`INSERT INTO templates ...`
    
    // Create instance
    const instance = await sql`INSERT INTO template_instances ...`
    
    return { template, instance }
  })
}
```

## 🔍 Query Examples

### Using postgres Template Literals

```typescript
// Simple query
const result = await this.sql`
  SELECT * FROM templates WHERE id = ${id}
`

// With multiple parameters
const result = await this.sql`
  SELECT * FROM templates 
  WHERE category = ${category} AND price <= ${maxPrice}
`

// With joins
const result = await this.sql`
  SELECT t.*, u.username
  FROM templates t
  JOIN users u ON t.contributor_id = u.id
  WHERE t.slug = ${slug}
`

// With aggregations
const result = await this.sql`
  SELECT 
    t.*,
    COUNT(tp.id) as purchase_count,
    AVG(tr.rating)::numeric(3,2) as avg_rating
  FROM templates t
  LEFT JOIN template_purchases tp ON t.id = tp.template_id
  LEFT JOIN template_reviews tr ON t.id = tr.template_id
  WHERE t.id = ${id}
  GROUP BY t.id
`
```

## 📚 Resources

- [postgres.js Documentation](https://github.com/porsager/postgres)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

## ⚠️ Migration Guide

### Before (Direct Database Queries)
```typescript
const result = await db.query(
  'SELECT * FROM templates WHERE slug = $1',
  [slug]
)
const template = result.rows[0]
```

### After (Repository Pattern)
```typescript
const template = await templateRepository.findBySlug(slug)
```

## 🎉 Kesimpulan

Repository Pattern membuat database operations:
- ✅ Lebih terorganisir dan modular
- ✅ Type-safe dengan TypeScript
- ✅ Mudah untuk testing dan maintenance
- ✅ Konsisten di seluruh aplikasi
- ✅ Scalable untuk pertumbuhan proyek

Gunakan repository pattern untuk semua database operations di aplikasi!
