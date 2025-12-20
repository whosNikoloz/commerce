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
      {
        protocol: "https",
        hostname: "finasyncecomm.s3.eu-central-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ecommerce-outdoor.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
    unoptimized: false, // Default is optimized; components will selectively use unoptimized for S3
  },

  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  experimental: {
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
      "framer-motion",
      "recharts",
    ],
  },

  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: "vendor",
              chunks: "all",
              test: /node_modules/,
              priority: 20,
            },
            common: {
              name: "common",
              minChunks: 2,
              chunks: "async",
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: "lib",
              priority: 30,
            },
          },
        },
      };
    }
    return config;
  },

  async headers() {
    const apiDomain = getApiDomain();
    const connectSrcParts = [
      "'self'",
      "https://*.amazonaws.com",
      apiDomain,
      "https://vercel.live",
      "wss://ws-us3.pusher.com",
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
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://*.amazonaws.com https://picsum.photos https://placehold.co https://via.placeholder.com https://maps.googleapis.com https://maps.gstatic.com",
              "font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com",
              `connect-src ${connectSrcParts.join(" ")}`,
              "worker-src 'self' blob:",
              "frame-ancestors 'self'",
              "frame-src 'self' https://vercel.live https://www.google.com https://maps.google.com",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
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
            value:
              "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
