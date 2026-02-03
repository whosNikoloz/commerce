import { NextResponse, type NextRequest } from "next/server";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { locales, type Locale, defaultLocale } from "@/i18n.config";

export const isLocale = (v: string): v is Locale =>
  (locales as readonly string[]).includes(v as Locale);

export const toLocale = (v: string): Locale => (isLocale(v) ? v : defaultLocale);

/**
 * Check if a string looks like a valid locale code
 * Accepts 2-3 lowercase letters (e.g., "en", "ka", "de", "uz", "ru")
 * This allows dynamic locales from tenant config to pass through middleware
 */
function isValidLocaleFormat(v: string): boolean {
  // Match 2-3 lowercase letters (locale codes)
  return /^[a-z]{2,3}$/.test(v);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _getBestLocale(req: NextRequest): Locale {
  const headers: Record<string, string> = {};

  req.headers.forEach((v, k) => (headers[k] = v));
  const languages = new Negotiator({ headers }).languages();
  const matched = matchLocale(languages, locales as readonly string[], defaultLocale);

  return toLocale(matched);
}

/**
 * Extract locale from pathname
 * Returns the locale string if it looks like a valid locale format
 * This allows dynamic locales from tenant config to work
 */
function pathLocale(pathname: string): string | null {
  const seg = pathname.split("/")[1] || "";

  // Accept any valid locale format (2-3 lowercase letters)
  // Pages will validate against tenant config
  if (isValidLocaleFormat(seg)) {
    return seg;
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1) Let static/media files bypass
  if (/\.(?:mp4|mp3|avi|png|ico|jpg|jpeg|gif|webp|svg|txt|xml|json|woff2?)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // 2) Let Next.js metadata routes bypass (manifest, robots, sitemap, etc.)
  if (/^\/(?:manifest\.webmanifest|robots\.txt|sitemap\.xml)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // 3) Handle locale in path
  const locInPath = pathLocale(pathname);

  if (!locInPath) {
    // No locale in path - rewrite to static default locale without redirecting
    // The layout will detect the actual tenant default and handle redirects if needed
    const url = request.nextUrl.clone();

    url.pathname = `/${defaultLocale}${pathname}`;

    // Add original pathname as header for layout to use
    const response = NextResponse.rewrite(url);

    response.headers.set("x-pathname", pathname);

    return response;
  }

  // 4) Locale is in path - let it pass through
  // The layout will handle tenant-specific default locale logic and redirects
  // This allows dynamic tenant defaults to work properly

  const accessToken = request.cookies.get("accessToken")?.value;
  const isAdminRoot = pathname === `/${locInPath}/admin`;
  const isAdminSubRoute = pathname.startsWith(`/${locInPath}/admin/`) && !isAdminRoot;

  if (isAdminSubRoute || isAdminRoot) {
    if (!accessToken) {
      if (isAdminSubRoute) {
        const url = new URL(`/${locInPath}/admin`, request.url);
        url.searchParams.set("next", `${pathname}${search || ""}`);
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    try {
      // Basic JWT decoding (Base64) to check roles in middleware
      const base64Url = accessToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      console.log('Token Payload:', payload);

      // Check for role in various possible claim keys
      const roleValue = payload.role ||
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        payload["roles"];

      const roles = Array.isArray(roleValue) ? roleValue : [roleValue];
      const isAdmin = roles.some(r => typeof r === 'string' && r.toLowerCase() === 'admin');

      if (!isAdmin && isAdminSubRoute) {
        // Not an admin - redirect to home if trying to access sub-routes
        return NextResponse.redirect(new URL(`/${locInPath}`, request.url));
      }
      // If not an admin but on isAdminRoot, we let it pass so the login form can be shown/used
    } catch (e) {
      // Invalid token
      if (isAdminSubRoute) {
        return NextResponse.redirect(new URL(`/${locInPath}/admin`, request.url));
      }
    }
  }

  // Add pathname as header for layout to use
  const response = NextResponse.next();

  response.headers.set("x-pathname", pathname);

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|mp4|mp3|avi|txt|xml|json|woff2?)).*)",
  ],
};
