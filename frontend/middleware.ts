// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'fr'], // Your supported locales
  defaultLocale: 'en', // Fallback if no locale detected
  localePrefix: 'always', // Always prefix routes with locale (e.g., /en/)
});

export default function middleware(request: NextRequest) {
  // Get locale from path, headers, or cookie
  const pathname = request.nextUrl.pathname;
  const locale = pathname.split('/')[1]; // Extract from /en/...

  if (!locale) {
    // Redirect to default locale if missing
    return NextResponse.redirect(new URL(`/en${pathname}`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'], // Apply to all routes except API/static
};
