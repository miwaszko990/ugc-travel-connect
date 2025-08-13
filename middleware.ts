import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'pl'],
  defaultLocale: 'pl',
  localePrefix: 'always'
});

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|.*\\.).*)',
    // Include all API routes that need locale detection
    '/'
  ]
};
