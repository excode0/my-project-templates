# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### 1. TypeError: Cannot read properties of undefined (reading 'call')

**Error:**
```
TypeError: Cannot read properties of undefined (reading 'call')
at Object.c [as require] (webpack-runtime.js:1:143)
```

**Penyebab:**
- Circular dependency dalam module imports
- Webpack module resolution issue
- Cache issue dari build sebelumnya

**Solusi:**

#### A. Clean Build (Recommended First)
```bash
# Windows PowerShell
Remove-Item -Recurse -Force .next
npm run build

# Linux/Mac
rm -rf .next
npm run build
```

#### B. Check Import Structure
Pastikan import menggunakan structure yang benar:

✅ **CORRECT:**
```typescript
import { templateRepository, reviewRepository } from '@/lib/database'
```

❌ **WRONG:**
```typescript
import templateRepository from '@/lib/database/repositories/template.repository'
```

#### C. Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

### 2. db.query is not a function

**Error:**
```
_lib_db__WEBPACK_IMPORTED_MODULE_1__.db.query is not a function
```

**Penyebab:**
- Menggunakan `.query()` method dengan library `postgres` yang tidak support
- `postgres` library menggunakan tagged template literals

**Solusi:**

✅ **Use Repository Pattern:**
```typescript
import { templateRepository } from '@/lib/database'

const template = await templateRepository.findBySlug(slug)
```

❌ **Don't use db.query():**
```typescript
const result = await db.query('SELECT * FROM templates WHERE slug = $1', [slug])
```

**Lihat dokumentasi:**
- [Database Repository Pattern](./docs/database-repository-pattern.md)
- [Migration Examples](./docs/database-migration-examples.md)

---

### 3. Module Not Found: Can't resolve '@/lib/database'

**Error:**
```
Module not found: Can't resolve '@/lib/database'
```

**Penyebab:**
- Path alias tidak dikonfigurasi dengan benar
- File tidak ada di lokasi yang benar

**Solusi:**

#### Check tsconfig.json:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### Check file structure:
```
src/lib/database/
├── index.ts          ← Must exist
├── types.ts
└── repositories/
    ├── index.ts
    └── ...
```

---

### 4. Type Errors with Repository Returns

**Error:**
```
Type 'Template | null' is not assignable to type 'Template'
```

**Penyebab:**
- Repository methods return nullable types
- Proper null checking needed

**Solusi:**

✅ **Handle null properly:**
```typescript
const template = await templateRepository.findBySlug(slug)

if (!template) {
  notFound() // or return error
}

// Now template is Template, not Template | null
return <div>{template.name}</div>
```

❌ **Don't assume it exists:**
```typescript
const template = await templateRepository.findBySlug(slug)
return <div>{template.name}</div> // Error: template might be null
```

---

### 5. Database Connection Issues

**Error:**
```
DATABASE_URL environment variable is not set
```

**Penyebab:**
- Environment variables tidak di-load
- .env file tidak ada atau salah lokasi

**Solusi:**

#### Check .env files exist:
```
.env
.env.local
```

#### Check DATABASE_URL is set:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

#### Restart server after changing .env:
```bash
npm run dev
```

---

### 6. Build Succeeds but Runtime Error

**Error:**
```
Error: Database connection not initialized
```

**Penyebab:**
- Database not connecting at runtime
- Environment variables not available at runtime

**Solusi:**

#### Test database connection:
```typescript
import { testDbConnection } from '@/lib/db'

await testDbConnection()
```

#### Check environment:
```bash
# Print DATABASE_URL (be careful with secrets!)
echo $env:DATABASE_URL  # Windows PowerShell
echo $DATABASE_URL      # Linux/Mac
```

---

### 7. Import Order Issues

**Error:**
```
Cannot access 'templateRepository' before initialization
```

**Penyebab:**
- Circular dependency
- Wrong import order

**Solusi:**

✅ **Import from main entry point:**
```typescript
import { templateRepository } from '@/lib/database'
```

❌ **Don't import directly:**
```typescript
import { templateRepository } from '@/lib/database/repositories/template.repository'
```

---

### 8. TypeScript Strict Mode Errors

**Error:**
```
Property 'X' does not exist on type 'any'
```

**Penyebab:**
- Missing type definitions
- Using `any` type

**Solusi:**

✅ **Use provided types:**
```typescript
import type { Template, User } from '@/lib/database'

const template: Template = await templateRepository.findById(id)
```

✅ **Type guard for nullables:**
```typescript
const template = await templateRepository.findById(id)

if (!template) {
  return { error: 'Not found' }
}

// template is now Template (not null)
```

---

### 9. JSON/JSONB Issues

**Error:**
```
invalid input syntax for type json
```

**Penyebab:**
- Invalid JSON being passed to database
- JSONB field receiving wrong type

**Solusi:**

✅ **Use sql.json() helper:**
```typescript
const sql = this.sql
await sql`
  INSERT INTO templates (manifest)
  VALUES (${sql.json(manifestData)})
`
```

❌ **Don't stringify manually:**
```typescript
await sql`
  INSERT INTO templates (manifest)
  VALUES (${JSON.stringify(manifestData)})  // Wrong!
`
```

---

### 10. Development Server Won't Start

**Error:**
```
Port 3000 is already in use
```

**Solusi:**

#### Find and kill process:

**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:3000 | xargs kill -9
```

#### Or use different port:
```bash
PORT=3001 npm run dev
```

---

## 🚑 Quick Fixes Checklist

When encountering errors, try these in order:

1. ✅ Clean build
   ```bash
   Remove-Item -Recurse -Force .next
   npm run build
   ```

2. ✅ Check imports are using `@/lib/database`

3. ✅ Restart dev server

4. ✅ Check DATABASE_URL is set

5. ✅ Check file structure matches expected

6. ✅ Review TypeScript errors carefully

7. ✅ Check documentation for correct usage

---

## 📚 Resources

- [Database Repository Pattern](./docs/database-repository-pattern.md)
- [Migration Guide](./docs/database-migration-examples.md)
- [Quick Start](./docs/quick-start-database.md)
- [Next.js Docs](https://nextjs.org/docs)
- [postgres.js Docs](https://github.com/porsager/postgres)

---

## 🆘 Still Having Issues?

1. Check the error message carefully
2. Search the error in this guide
3. Review the documentation
4. Check GitHub issues
5. Ask the team

**Common debugging steps:**
```typescript
// Add logging
console.log('Repository called with:', params)

// Test connection
import { testDbConnection } from '@/lib/db'
await testDbConnection()

// Check return values
const result = await templateRepository.findById(id)
console.log('Result:', result)
```

---

**Last Updated:** 2024
