export const site = {
  name: "ShopX",
  shortName: "ShopX",
  description: "ShopX — smart prices, fast delivery, and great support.",
  url: "https://www.shopx.example",
  ogImage: "/og.jpg",
  logo: "/logo.png",
  currency: "GEL",
  localeDefault: "en",
  locales: ["en", "ka"],
  links: {
    twitter: "https://twitter.com/yourbrand",
    instagram: "https://instagram.com/yourbrand",
  },
} as const;
export type SiteConfig = typeof site;
