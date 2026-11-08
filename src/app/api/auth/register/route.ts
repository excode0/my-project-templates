import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'contributor']).optional().default('user'),
})

/**
 * POST /api/auth/register
 * Register new user account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { email, password, role } = validation.data

    // Check if user already exists
    const existingUser = await db`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await db`
      INSERT INTO users (
        email,
        password_hash,
        role,
        status
      ) VALUES (
        ${email},
        ${passwordHash},
        ${role},
        'active'
      )
      RETURNING id, email, role, created_at
    `.then((rows: any[]) => rows[0])

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
