import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow access to static files and API routes
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/api') ||
      request.nextUrl.pathname.startsWith('/static') ||
      request.nextUrl.pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  // Only restrict in production AND if we're on the main branch deployment
  // This allows full development on other branches
  if (process.env.NODE_ENV === 'production' && 
      process.env.VERCEL_GIT_COMMIT_REF === 'main') {
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/lumo', request.url))
    }
    if (request.nextUrl.pathname !== '/lumo') {
      return NextResponse.redirect(new URL('/lumo', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
} 