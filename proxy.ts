import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["ja", "en"];
const defaultLocale = "ja";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // locale が含まれているかチェック
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // locale がない場合はデフォルトにリダイレクト
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
