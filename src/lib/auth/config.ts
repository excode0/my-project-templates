import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const validated = loginSchema.safeParse(credentials)
          if (!validated.success) {
            return null
          }

          const { email, password } = validated.data

          // Find user by email
          const user = await db`
            SELECT 
              id, 
              email, 
              password_hash, 
              role, 
              status
            FROM users
            WHERE email = ${email}
            LIMIT 1
          `.then((rows: any[]) => rows[0])

          if (!user) {
            return null
          }

          // Check if user is active
          if (user.status !== 'active') {
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            password,
            user.password_hash
          )

          if (!isValidPassword) {
            return null
          }

          // Return user data (excluding password_hash)
          return {
            id: user.id,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to token on sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      // Add token data to session
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.role = token.role as
          | 'user'
          | 'contributor'
          | 'admin'
          | 'super_admin'
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
