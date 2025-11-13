import { NextResponse, type NextRequest } from "next/server";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { locales, type Locale, defaultLocale } from "@/i18n.config";

export const isLocale = (v: string): v is Locale =>
  (locales as readonly string[]).includes(v as Locale);

export const toLocale = (v: string): Locale => (isLocale(v) ? v : defaultLocale);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _getBestLocale(req: NextRequest): Locale {
  const headers: Record<string, string> = {};

  req.headers.forEach((v, k) => (headers[k] = v));
  const languages = new Negotiator({ headers }).languages();
  const matched = matchLocale(languages, locales as readonly string[], defaultLocale);

  return toLocale(matched);
}

function pathLocale(pathname: string): Locale | null {
  const seg = pathname.split("/")[1] || "";

  return isLocale(seg) ? seg : null;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1) Let static/media files bypass
  if (/\.(?:mp4|mp3|avi|png|ico|jpg|jpeg|gif|webp|svg|txt|xml|json|woff2?)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // 2) Handle locale in path
  const locInPath = pathLocale(pathname);

  if (!locInPath) {
    // No locale in path - rewrite to default locale (ka) without redirecting
    const url = request.nextUrl.clone();

    url.pathname = `/${defaultLocale}${pathname}`;

    return NextResponse.rewrite(url);
  }

  // 3) If default locale (ka) is explicitly in URL, redirect to hide it
  if (locInPath === defaultLocale) {
    const pathWithoutLocale = pathname.replace(`/${defaultLocale}`, '') || '/';

    return NextResponse.redirect(new URL(`${pathWithoutLocale}${search}`, request.url));
  }

  const adminToken = request.cookies.get("admin_token")?.value;
  const isAdminRoot = pathname === `/${locInPath}/admin`;
  const isAdminSubRoute = pathname.startsWith(`/${locInPath}/admin/`) && !isAdminRoot;

  if (!adminToken && isAdminSubRoute) {
    const url = new URL(`/${locInPath}/admin`, request.url);

    url.searchParams.set("next", `${pathname}${search || ""}`);

    return NextResponse.redirect(url);
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|mp4|mp3|avi|txt|xml|json|woff2?)).*)",
  ],
};
