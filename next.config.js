/** @type {import('next').NextConfig} */

// Extract API domain for CSP
const getApiDomain = () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    if (!apiUrl) return "";
    const url = new URL(apiUrl);
    return url.origin;
  } catch {
    return "";
  }
};

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "media.veli.store", pathname: "/**" },
      { protocol: "https", hostname: "extra.ge", pathname: "/**" },
      {
        protocol: "https",
        hostname: "finasyncecomm.s3.eu-central-1.amazonaws.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
    ],
    // ⚠️ Allowing SVGs is risky unless you sanitize them.
    dangerouslyAllowSVG: true,
    // Remove the 'attachment' (it makes images download instead of display)
    // contentDispositionType: "inline", // or just omit
    // Let Next manage image CSP headers; keep your global CSP below.
    // contentSecurityPolicy: undefined,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
    unoptimized: false,
  },

  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,

  experimental: {
    // Works with Turbopack – keeps bundles small by auto-modularizing imports
    optimizePackageImports: [
      "lucide-react",
      "@heroui/system",
      "@heroui/card",
      "@heroui/button",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-tabs",
      "@radix-ui/react-select",
      "@radix-ui/react-tooltip",
    ],
  },

  // ❌ Remove webpack() block – Turbopack ignores it and shows the warning.
  // If you MUST keep it for production builds, see the dual-config example below.

  async headers() {
    const apiDomain = getApiDomain();
    const connectSrcParts = [
      "'self'",
      "https://*.amazonaws.com",
      apiDomain,
      "https://vercel.live",
      "wss://ws-us3.pusher.com",
      // HMR / dev over your LAN + localhost
      "ws://localhost:3000",
      "ws://192.168.1.105:3000",
    ].filter(Boolean);

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Dev often needs 'unsafe-inline' and 'unsafe-eval' (source maps/HMR)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
              "img-src 'self' data: blob: https://*.amazonaws.com https://media.veli.store https://picsum.photos https://placehold.co https://extra.ge",
              "font-src 'self' data: https://cdnjs.cloudflare.com",
              `connect-src ${connectSrcParts.join(" ")}`,
              // Helpful for dev tools and HMR
              "worker-src 'self' blob:",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
