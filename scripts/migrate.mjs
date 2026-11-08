#!/usr/bin/env node
import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import postgres from 'postgres'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:admin@localhost:5432/template_marketplace'

async function migrate() {
  console.log('🚀 Starting database migration...')
  
  const sql = postgres(DATABASE_URL, {
    max: 1,
    onnotice: () => {}, // Suppress notices
  })

  try {
    // Create migrations tracking table
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Get executed migrations
    const executed = await sql`SELECT filename FROM migrations`
    const executedSet = new Set(executed.map(row => row.filename))

    // Read migration files
    const migrationsDir = join(__dirname, 'migrations')
    const files = await readdir(migrationsDir)
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort()

    console.log(`📁 Found ${sqlFiles.length} migration files`)

    // Execute pending migrations
    for (const file of sqlFiles) {
      if (executedSet.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`)
        continue
      }

      console.log(`▶️  Executing ${file}...`)
      const filePath = join(migrationsDir, file)
      const content = await readFile(filePath, 'utf-8')

      // Execute migration
      await sql.unsafe(content)

      // Record execution
      await sql`INSERT INTO migrations (filename) VALUES (${file})`
      
      console.log(`✅ Completed ${file}`)
    }

    console.log('🎉 Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

migrate()
