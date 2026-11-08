import postgres from 'postgres'

// Database connection singleton
let sql: ReturnType<typeof postgres> | null = null

/**
 * Get database connection
 * Uses connection pooling for optimal performance
 */
export function getDb() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      // During build time, DATABASE_URL might not be set
      // Return a mock that throws at runtime only
      if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
        throw new Error('DATABASE_URL environment variable is not set')
      }
      
      // During build, return a mock
      console.warn('⚠️ DATABASE_URL not set, using mock connection')
      return null as any
    }

    sql = postgres(connectionString, {
      max: 10, // Maximum connections in pool
      idle_timeout: 20, // Close idle connections after 20s
      connect_timeout: 10, // Connection timeout
      onnotice: () => {}, // Suppress notices in production
    })
  }

  return sql
}

// Export db as default export
export const db = getDb()

/**
 * Close database connection
 * Should be called on application shutdown
 */
export async function closeDb() {
  if (sql) {
    await sql.end()
    sql = null
  }
}

/**
 * Test database connection
 */
export async function testDbConnection() {
  try {
    const connection = getDb()
    if (!connection) {
      console.warn('⚠️ No database connection available')
      return false
    }
    await connection`SELECT 1 as test`
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}
