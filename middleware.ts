import { NextResponse, type NextRequest } from "next/server";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { i18n } from "@/i18n.config";

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};

  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const locales: readonly string[] = i18n.locales;
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  const locale = matchLocale(languages, locales, i18n.defaultLocale);

  return locale || i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow media files (mp4, mp3, png, avi, ico) to bypass middleware
  if (/\.(mp4|mp3|avi|png|ico|jpg|jpeg|gif|webp)$/i.test(pathname)) {
    return NextResponse.next();
  }

  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|music/.*).*)"],
};
