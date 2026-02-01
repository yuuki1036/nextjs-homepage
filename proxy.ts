import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["ja", "en"];
const defaultLocale = "ja";

function generateCspHeader(nonce: string): string {
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://www.google.com https://www.gstatic.com https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://yuuki1036.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://vitals.vercel-insights.com https://www.google.com;
    frame-src https://www.google.com;
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    const locale = pathname.startsWith("/en") ? "en" : "ja";
    const response = NextResponse.next();
    response.headers.set("x-locale", locale);
    response.headers.set("x-nonce", nonce);
    response.headers.set("Content-Security-Policy", generateCspHeader(nonce));
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: [
    // Skip static files and API routes
    "/((?!api|_next|favicon|images|favicons|.*\\..*).*)"
  ]
};
