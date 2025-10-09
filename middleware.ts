import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'pl'],
  defaultLocale: 'pl',
  localePrefix: 'as-needed', // Critical: no forced redirects to /pl for default locale
  localeDetection: false // Critical: disable cookie/UA-based detection for IG webview
});

export const config = {
  matcher: [
    // Skip all internal paths (_next), API routes, and static files
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|.*\\..*).*)'
  ]
};
