// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

import { locales, type Locale, defaultLocale } from "@/i18n.config";

export const isLocale = (v: string): v is Locale =>
  (locales as readonly string[]).includes(v as Locale);

function isValidLocaleFormat(v: string): boolean {
  return /^[a-z]{2,3}$/.test(v);
}

/**
 * Extract locale from pathname.
 * Accept any 2-3 lowercase letters so tenant dynamic locales can pass,
 * pages/layout will validate further.
 */
function pathLocale(pathname: string): string | null {
  const seg = pathname.split("/")[1] || "";

  if (isValidLocaleFormat(seg)) return seg;

  return null;
}

/**
 * If locale exists, return the path *after* the locale prefix.
 *   /en/products/a -> /products/a
 *   /en -> /
 */
function stripLocale(pathname: string, loc: string): string {
  const prefix = `/${loc}`;

  if (pathname === prefix) return "/";
  if (pathname.startsWith(prefix + "/")) return pathname.slice(prefix.length);

  return pathname;
}

/**
 * WP trash / legacy endpoints that should die fast (multi-tenant safe).
 * Return 410 so Google drops them sooner.
 */
function isWpTrashPath(pathNoLocale: string): boolean {
  // normalize
  const p = pathNoLocale;

  // WordPress core & common bot targets
  if (
    p === "/wp-login.php" ||
    p === "/xmlrpc.php" ||
    p.startsWith("/wp-admin") ||
    p.startsWith("/wp-content") ||
    p.startsWith("/wp-includes") ||
    p.startsWith("/wp-json") ||
    p.startsWith("/wp/") ||
    p.startsWith("/wordpress/") ||
    p.startsWith("/cgi-bin")
  ) {
    return true;
  }

  // Your observed legacy junk patterns (from your CSV)
  if (p.startsWith("/shopping/")) return true;
  if (p.startsWith("/item/")) return true;

  // Old .html style URLs (often WP/plugin or bot-generated)
  if (/\.html$/i.test(p)) return true;

  return false;
}

/**
 * OPTIONAL: only add redirects you are 100% sure about.
 * If you don't know the mapping, DON'T redirect (return 410/404 instead).
 */
function getWpRedirect(pathNoLocale: string): string | null {
  // Example mappings (edit to match YOUR new routes):
  // /product/slug/ -> /products/slug
  const m1 = pathNoLocale.match(/^\/product\/([^/]+)\/?$/i);

  if (m1) return `/products/${m1[1]}`;

  // /category/slug/ -> /categories/slug  (or /c/slug)
  const m2 = pathNoLocale.match(/^\/category\/([^/]+)\/?$/i);

  if (m2) return `/categories/${m2[1]}`;

  // Add more only if certain:
  // const m3 = pathNoLocale.match(/^\/tag\/([^/]+)\/?$/i);
  // if (m3) return `/tags/${m3[1]}`;

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1) Let static/media files bypass
  if (
    /\.(?:mp4|mp3|avi|png|ico|jpg|jpeg|gif|webp|svg|txt|xml|json|woff2?)$/i.test(
      pathname
    )
  ) {
    return NextResponse.next();
  }

  // 2) Let Next.js metadata routes bypass
  // (Keep these accessible; Google needs them)
  if (/^\/(?:manifest\.webmanifest|robots\.txt|sitemap\.xml)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // 3) Locale handling
  const locInPath = pathLocale(pathname);

  // If there is no locale, rewrite to defaultLocale (your existing behavior)
  if (!locInPath) {
    const url = request.nextUrl.clone();

    url.pathname = `/${defaultLocale}${pathname}`;

    const response = NextResponse.rewrite(url);

    response.headers.set("x-pathname", pathname);

    return response;
  }

  // 4) From here on, locale exists
  const pathNoLocale = stripLocale(pathname, locInPath);

  // 5) Kill WP trash fast (multi-tenant safe, no mapping required)
  if (isWpTrashPath(pathNoLocale)) {
    // 410 helps Google drop old junk faster than 404
    return new NextResponse("Gone", { status: 410 });
  }

  // 6) Optional: redirect only known-safe WP equivalents
  const redirectTo = getWpRedirect(pathNoLocale);

  if (redirectTo) {
    const url = request.nextUrl.clone();

    url.pathname = `/${locInPath}${redirectTo}`; // keep locale
    url.search = ""; // keep clean; avoid carrying WP params into new site

    return NextResponse.redirect(url, 301);
  }

  // 7) Keep your admin guard exactly as-is
  const adminToken = request.cookies.get("admin_token")?.value;
  const isAdminRoot = pathname === `/${locInPath}/admin`;
  const isAdminSubRoute = pathname.startsWith(`/${locInPath}/admin/`) && !isAdminRoot;

  if (!adminToken && isAdminSubRoute) {
    const url = new URL(`/${locInPath}/admin`, request.url);

    url.searchParams.set("next", `${pathname}${search || ""}`);

    return NextResponse.redirect(url);
  }

  // 8) Pass through
  const response = NextResponse.next();

  response.headers.set("x-pathname", pathname);

  return response;
}

export const config = {
  matcher: [
    // keep your existing matcher, it’s fine
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|mp4|mp3|avi|txt|xml|json|woff2?)).*)",
  ],
};
