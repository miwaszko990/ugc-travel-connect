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

  // In production, redirect everything to /lumo except /lumo itself
  if (process.env.NODE_ENV === 'production') {
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
} // review trigger
