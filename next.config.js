/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "media.veli.store", pathname: "/**" },
      {
        protocol: "https",
        hostname: "ecommerce-outdoor.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "finasyncecomm.s3.eu-central-1.amazonaws.com",
        pathname: "/**",
      },

      // If any of these ever serve over HTTP in dev, add HTTP entries too:
      // { protocol: "http", hostname: "media.veli.store", pathname: "/**" },
    ],
  },
};

module.exports = nextConfig;
