export type SiteConfig = {
  name: string;
  shortName: string;
  description: string;
  favicon: string;
  url: string;
  ogImage: string;
  logo: string;
  currency: string;
  localeDefault: string;
  locales: string[];
  links: {
    twitter?: string;
    instagram?: string;
  };
};

export const SITES: Record<string, SiteConfig> = {
  "localhost:3000": {
    name: "ShopX Loca",
    shortName: "ShopX",
    description: "Local testing environment for ShopX.",
    url: "http://localhost:3000",
    ogImage: "/ogtest.jpg",
    logo: "/svg/local.svg",
    favicon: "/favicons/local.ico",
    currency: "GEL",
    localeDefault: "en",
    locales: ["en", "ka"],
    links: {
      twitter: "https://twitter.com/yourbrand",
      instagram: "https://instagram.com/yourbrand",
    },
  },
  "commerce-sxvadomain.vercel.app": {
    name: "Commerce SXVA",
    shortName: "SXVA",
    description: "Commerce SXVA — sustainable fashion and accessories.",
    url: "https://commerce-sxvadomain.vercel.app",
    ogImage: "/ogtest.jpg",
    logo: "/svg/sxva.svg",
    favicon: "/favicons/sxva.ico",
    currency: "USD",
    localeDefault: "en",
    locales: ["en"],
    links: {
      twitter: "https://twitter.com/sxvabrand",
      instagram: "https://instagram.com/sxvabrand",
    },
  },
  "commerce-topaz-sigma-62.vercel.app": {
    name: "Topaz Sigma",
    shortName: "Topaz",
    description: "Topaz Sigma 62 — electronics and smart gadgets.",
    url: "https://commerce-topaz-sigma-62.vercel.app",
    ogImage: "/ogtest.jpg",
    logo: "/svg/sigma.svg",
    currency: "EUR",
    favicon: "/favicons/sigma.ico",
    localeDefault: "en",
    locales: ["en", "ka"],
    links: {
      twitter: "https://twitter.com/topazsigma",
      instagram: "https://instagram.com/topazsigma",
    },
  },
  "nika.ge": {
    name: "Nika Shop",
    shortName: "Nika",
    description: "Nika.ge — Georgian marketplace with unique products.",
    url: "https://nika.ge",
    ogImage: "/ogtest.jpg",
    favicon: "/favicons/nika.ico",
    logo: "/logos/dev.svg",
    currency: "GEL",
    localeDefault: "ka",
    locales: ["ka", "en"],
    links: {
      twitter: "https://twitter.com/nika",
      instagram: "https://instagram.com/nika",
    },
  },
};

export const DEFAULT_SITE: SiteConfig = SITES["localhost:3000"];
