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
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
    unoptimized: false,
  },
  // Enable compression
  compress: true,
  // Enable React strict mode
  reactStrictMode: true,
  // Performance optimizations
  poweredByHeader: false,
  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@heroui/system',
      '@heroui/card',
      '@heroui/button',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-tabs',
      '@radix-ui/react-select',
      '@radix-ui/react-tooltip',
    ],
  },
  // Webpack optimizations for code splitting
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      // Better code splitting for heavy libraries
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Separate heavy carousel libraries
            carousel: {
              test: /[\\/]node_modules[\\/](embla-carousel|swiper)[\\/]/,
              name: 'carousel',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Separate UI libraries
            ui: {
              test: /[\\/]node_modules[\\/](@heroui|@radix-ui)[\\/]/,
              name: 'ui-libs',
              priority: 15,
              reuseExistingChunk: true,
            },
            // Separate icon libraries
            icons: {
              test: /[\\/]node_modules[\\/](lucide-react|@tabler)[\\/]/,
              name: 'icons',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
  // Add security and caching headers
  async headers() {
    const apiDomain = getApiDomain();
    const connectSrc = ["'self'", "https://*.amazonaws.com", apiDomain].filter(Boolean).join(" ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
              "img-src 'self' data: blob: https://*.amazonaws.com https://media.veli.store https://picsum.photos https://placehold.co https://extra.ge",
              "font-src 'self' data: https://cdnjs.cloudflare.com",
              `connect-src ${connectSrc} https://vercel.live wss://ws-us3.pusher.com`,
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
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
