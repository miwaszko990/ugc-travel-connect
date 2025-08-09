import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['en', 'pl'],
  defaultLocale: 'en'
});

export function middleware(request: NextRequest) {
  // Allow access to static files and API routes
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/api') ||
      request.nextUrl.pathname.startsWith('/static') ||
      request.nextUrl.pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  // Redirect root paths to landing page
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/en' || request.nextUrl.pathname === '/pl') {
    return NextResponse.redirect(new URL('/lumo', request.url))
  }

  // Handle internationalization
  return intlMiddleware(request);
}

// Configure which paths the middleware runs on
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
} // review trigger
