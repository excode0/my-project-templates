import { NextResponse } from 'next/server'
import { testDbConnection } from '@/lib/db'

/**
 * GET /api/health
 * Health check endpoint
 */
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'unknown',
  }

  try {
    // Test database connection
    const dbOk = await testDbConnection()
    health.database = dbOk ? 'connected' : 'disconnected'
    
    return NextResponse.json(health, {
      status: dbOk ? 200 : 503,
    })
  } catch (error) {
    health.database = 'error'
    health.status = 'degraded'
    
    return NextResponse.json(health, {
      status: 503,
    })
  }
}
