import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * Middleware for:
 * 1. Authentication protection
 * 2. Domain routing (custom domains and subdomains)
 */
export async function middleware(request: NextRequest) {
  const { pathname, hostname } = new URL(request.url)
  
  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/editor', '/preview']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  // Check authentication for protected routes
  if (isProtectedPath) {
    const session = await auth()
    
    if (!session) {
      // Redirect to login with callback URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Skip domain routing for:
  // - API routes
  // - Static files (_next, public)
  // - Auth routes (login, register)
  // - Editor, dashboard, preview routes (internal)
  // - Demo routes (public template previews)
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/editor/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/preview/') ||
    pathname.startsWith('/demo/') ||
    pathname.startsWith('/sites/') ||
    pathname === '/' ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if it's localhost (development)
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    return NextResponse.next()
  }

  // Parse hostname for custom domain or subdomain
  const parts = hostname.split('.')
  const isSubdomain = parts.length > 2 // e.g., user.platform.com

  try {
    let instanceId: string | null = null

    // Check if it's a custom domain
    // Query database for matching custom_domain
    const customDomainResponse = await fetch(
      `${request.nextUrl.origin}/api/internal/resolve-domain?domain=${hostname}`,
      { headers: { 'x-middleware-request': 'true' } }
    )

    if (customDomainResponse.ok) {
      const data = await customDomainResponse.json()
      instanceId = data.instanceId
    }

    // If not custom domain, check if it's a subdomain
    if (!instanceId && isSubdomain) {
      const subdomain = parts[0]
      const subdomainResponse = await fetch(
        `${request.nextUrl.origin}/api/internal/resolve-domain?subdomain=${subdomain}`,
        { headers: { 'x-middleware-request': 'true' } }
      )

      if (subdomainResponse.ok) {
        const data = await subdomainResponse.json()
        instanceId = data.instanceId
      }
    }

    // If instance found, rewrite to /sites/[instanceId]
    if (instanceId) {
      const url = request.nextUrl.clone()
      url.pathname = `/sites/${instanceId}${pathname}`
      return NextResponse.rewrite(url)
    }

    // No instance found, show 404
    return new NextResponse('Site not found', { status: 404 })
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

/**
 * Matcher configuration
 * Run middleware on all routes except explicitly excluded
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!api/|_next/static|_next/image|favicon.ico).*)',
  ],
}
