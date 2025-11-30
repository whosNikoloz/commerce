export type Locale = "ka" | "en";

/**
 * Dynamic localized text that supports any locale from tenant config
 * Keys are locale codes (e.g., "en", "ka", "de", "uz", "ru")
 * At minimum should include "en" and "ka" for backward compatibility
 */
export type LocalizedText = Record<string, string> & {
  en: string; // English is required as fallback
  ka?: string; // Georgian is optional but commonly used
};

/**
 * Dynamic localized rich text (same structure as LocalizedText)
 * Supports any locale from tenant config
 */
export type LocalizedRich = Record<string, string> & {
  en: string; // English is required as fallback
  ka?: string; // Georgian is optional but commonly used
};

export type ThemeVars = {
  mode: "light" | "dark";
  brand: {
    primary: string;
    primaryDark: string;
    surface: string;
    surfaceDark: string;
    muted: string;
    mutedDark: string;
    accent?: string;
  };
  text: {
    light: string;
    subtle: string;
    lightDark: string;
    subtleDark: string;
  };
  fonts?: {
    primary?: string;
    secondary?: string;
    heading?: string;
    sizes?: Record<string, string | number>;
    weights?: Record<string, string | number>;
  };
};

export type ProductRailData = {
  customName?: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  layout: "carousel" | "grid";
  columns?: 2 | 3 | 4 | 5 | 6;
  limit: number;
  viewAllHref: string;
  filterBy?: {
    categoryIds?: string[];
    brandIds?: string[];
    condition?: number[];
    stockStatus?: number;
    isNewArrival?: boolean;
    isLiquidated?: boolean;
    isComingSoon?: boolean;
    hasDiscount?: boolean;
    minPrice?: number;
    maxPrice?: number;
  };
  sortBy?: "featured" | "newest" | "price-low" | "price-high" | "rating" | "name";
};

export type CommercialBannerData = {
  layout: "carousel" | "grid";
  columns?: 1 | 2 | 3 | 4 | 5;
  carouselStyle?: "full-width" | "grid";
  banners: Array<{
    imageUrl: string;
    mobileImageUrl?: string;
    href: string;
    alt: LocalizedText;
    badge?: LocalizedText;
  }>;
};

export type CustomHTMLData = {
  html: string;
  css?: string;
  padding?: "none" | "small" | "medium" | "large";
  fullWidth?: boolean;
  containerClass?: string;
};

export type CategoryCarouselData = {
  title?: LocalizedText;
  subtitle?: LocalizedText;
  showHeader?: boolean;
  showAllCard?: boolean;
  allCardText?: LocalizedText;
  allCardSubtext?: LocalizedText;
  allCategoriesHref?: string;
  categoryIds?: string[]; // If provided, show only these categories
  limit?: number; // Maximum number of categories to display
  slidesPerView?: number; // Number of slides visible at once
  showArrows?: boolean;
  showPagination?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number; // in milliseconds
  cardHeight?: string; // Tailwind class like "h-48", "h-56", etc.
  cardWidth?: string; // Tailwind class like "w-32", "w-40", etc.
};


export type CommonSectionType =
  | "CommercialBanner"
  | "ProductRail"
  | "CustomHTML"
  | "CategoryCarousel";

export type CommonSectionInstance =
  | { type: "CommercialBanner"; enabled: boolean; order: number; data: CommercialBannerData }
  | { type: "ProductRail"; enabled: boolean; order: number; data: ProductRailData }
  | { type: "CustomHTML"; enabled: boolean; order: number; data: CustomHTMLData }
  | { type: "CategoryCarousel"; enabled: boolean; order: number; data: CategoryCarouselData };

export const COMMON_ALLOWED = [
  "CommercialBanner",
  "ProductRail",
  "CustomHTML",
  "CategoryCarousel",
] as const;

export type HeroData = {
  categoriesTitle?: LocalizedText;
  maxCategories?: number;
  banners: Array<{
    imageUrl: string;
    mobileImageUrl?: string;
    href: string;
    alt: LocalizedText;
    badge?: LocalizedText;
    title?: LocalizedText;
    description?: LocalizedText;
  }>;
  bannerHeight?: string;
};


export type Template1SectionType = "Hero" | CommonSectionType;

export type Template1SectionInstance =
  | { type: "Hero"; enabled: boolean; order: number; data: HeroData }
  | CommonSectionInstance;

export const TEMPLATE_1_ALLOWED = ["Hero", ...COMMON_ALLOWED] as const;

export type Template1Homepage = {
  templateId: 1;
  sections: Template1SectionInstance[];
};

export type HeroBrandData = {
  backgroundImage?: string;
  slides?: Array<{
    imageUrl: string;
    mobileImageUrl?: string;
    href?: string;
    alt: LocalizedText;
    badge?: LocalizedText;
    title?: LocalizedText;
    description?: LocalizedText;
  }>;

  headline: LocalizedText;
  subheadline?: LocalizedText;
  badge?: LocalizedText;

  primaryCta?: { label: LocalizedText; href: string };
  secondaryCta?: { label: LocalizedText; href: string };

  tiles?: Array<{
    imageUrl: string;
    href: string;
    title: LocalizedText;
    subtitle?: LocalizedText;
  }>;
};

export type Template2SectionType = "HeroBrand" | CommonSectionType;

export type Template2SectionInstance =
  | { type: "HeroBrand"; enabled: boolean; order: number; data: HeroBrandData }
  | CommonSectionInstance;

export const TEMPLATE_2_ALLOWED = ["HeroBrand", ...COMMON_ALLOWED] as const;

export type Template2Homepage = {
  templateId: 2;
  sections: Template2SectionInstance[];
};

export type Homepage = Template1Homepage | Template2Homepage;



// ===== Info Pages Configuration =====
export type InfoPageSlug =
  | "delivery"
  | "faq"
  | "guarantee"
  | "privacy-policy"
  | "return-policy"
  | "stores"
  | "terms-and-conditions"
  | "about";

export type InfoPageSection = {
  enabled: boolean;
  order: number;
  type: "CustomHTML";
  data: CustomHTMLData;
};

export type InfoPageConfig = {
  sections: InfoPageSection[];
};

export type InfoPageMetadata = {
  title: LocalizedText;
  description: LocalizedText;
  ogImage?: string;
  index?: boolean; // Whether to allow search engines to index this page
};

export type InfoPage = {
  slug: InfoPageSlug;
  metadata: InfoPageMetadata;
  config: InfoPageConfig;
};

export type InfoPagesConfig = {
  pages: InfoPage[];
};

export type DynamicPageSectionInstance =
  | {
    type: "ProductRail";
    enabled: boolean;
    order: number;
    data: ProductRailData;
  }
  | {
    type: "CommercialBanner";
    enabled: boolean;
    order: number;
    data: CommercialBannerData;
  }
  | {
    type: "CustomHTML";
    enabled: boolean;
    order: number;
    data: CustomHTMLData;
  }
  | {
    type: "CategoryCarousel";
    enabled: boolean;
    order: number;
    data: CategoryCarouselData;
  };

export type DynamicPageMetadata = {
  title: LocalizedText;
  description: LocalizedText;
  ogImage?: string;
  index?: boolean;
};

export type DynamicPageConfig = {
  slug: string;
  active: boolean;
  metadata: DynamicPageMetadata;
  sections: DynamicPageSectionInstance[];
};

export type DynamicPagesConfig = {
  pages: DynamicPageConfig[];
};



// ===== Merchant Type =====
export type MerchantType = "FINA" | "CUSTOM";

// ===== SEO & Analytics Configuration =====
export type SEOConfig = {
  // Meta Tags
  keywords?: LocalizedText; // SEO keywords for meta tags
  author?: string; // Site author/company name
  robots?: string; // Default robots meta (e.g., "index, follow")

  // Open Graph (detailed)
  ogType?: string; // og:type (default: "website")
  ogSiteName?: LocalizedText; // Can differ from site name
  ogLocale?: string; // og:locale (e.g., "ka_GE", "en_US")

  // Twitter Card
  twitterCard?: "summary" | "summary_large_image" | "app" | "player"; // Default: "summary_large_image"
  twitterSite?: string; // @username for the site
  twitterCreator?: string; // @username for content creator

  // Verification Tags
  googleSiteVerification?: string; // Google Search Console verification
  bingSiteVerification?: string; // Bing Webmaster verification
  pinterestVerification?: string; // Pinterest domain verification
  yandexVerification?: string; // Yandex Webmaster verification

  // Analytics & Tracking
  googleAnalyticsId?: string; // GA4 Measurement ID (G-XXXXXXXXXX)
  googleTagManagerId?: string; // GTM Container ID (GTM-XXXXXXX)
  facebookPixelId?: string; // Facebook Pixel ID
  hotjarId?: string; // Hotjar Site ID
  clarityId?: string; // Microsoft Clarity Project ID

  // Schema.org / JSON-LD
  organizationType?: "Organization" | "LocalBusiness" | "Store" | "OnlineStore";
  foundingDate?: string; // ISO date (e.g., "2020-01-15")
  areaServed?: string; // Country/region (e.g., "Georgia", "GE")
  priceRange?: string; // Price range indicator (e.g., "₾₾", "$-$$$")

  // Canonical & Indexing
  canonicalBaseUrl?: string; // Override for canonical URLs (if different from url)
  defaultNoIndex?: boolean; // Default noindex for entire site (emergency switch)

  // Additional Features
  enableBreadcrumbs?: boolean; // Enable breadcrumb JSON-LD
  enableSearchAction?: boolean; // Enable WebSite search action JSON-LD
};

export type StoreLocation = {
  id: string; // Unique identifier (e.g., "us", "uk", "de")
  name: LocalizedText; // Store name
  address: LocalizedText; // Full address
  phone: LocalizedText; // Phone number
  hours: LocalizedText; // Business hours
  email?: string; // Store-specific email
  geo?: {
    latitude: number;
    longitude: number;
  };
  mapsEmbed?: string; // Google Maps embed URL
  country?: string; // Country code (e.g., "US", "UK", "DE")
  flagEmoji?: string; // Flag emoji (e.g., "🇺🇸", "🇬🇧")
};

export type BusinessInfo = {
  // Contact Information
  email?: string; // Business email
  phone?: LocalizedText; // Business phone (can vary by locale)
  address?: {
    street?: string;
    city?: string;
    region?: string; // State/Region
    postalCode?: string;
    country?: string; // ISO code (e.g., "GE", "US")
  };

  // Location
  geo?: {
    latitude?: number;
    longitude?: number;
  };

  // Business Hours (for schema.org)
  openingHours?: Array<{
    dayOfWeek: string; // "Monday", "Tuesday", etc.
    opens: string; // "09:00"
    closes: string; // "18:00"
  }>;

  // Legal
  vatNumber?: string; // Tax/VAT number
  registrationNumber?: string; // Company registration number
  legalName?: string; // Official legal name

  // Footer & Multiple Store Locations
  stores?: StoreLocation[]; // Multiple store locations for footer
  companyName?: LocalizedText; // Company display name
  companyTagline?: LocalizedText; // Tagline/slogan
  logoText?: string; // Logo abbreviation (e.g., "PS")
  copyright?: LocalizedText; // Custom copyright text
  mapsEmbed?: string; // Main location Google Maps embed URL
};

export type PWAConfig = {
  enabled?: boolean; // Enable PWA features
  themeColor?: string; // PWA theme color (hex)
  backgroundColor?: string; // PWA background color (hex)
  display?: "standalone" | "fullscreen" | "minimal-ui" | "browser";
  orientation?: "portrait" | "landscape" | "any";
  startUrl?: string; // PWA start URL (default: "/")
  scope?: string; // PWA scope (default: "/")
  categories?: string[]; // App categories (e.g., ["shopping", "business"])
  shortcuts?: Array<{
    name: string;
    url: string;
    description?: string;
  }>;
};

// ===== Site Configuration (merged into tenant) =====
export type SiteConfig = {
  // Basic Identity
  name: string;
  shortName: string;
  description: string;
  slogan?: LocalizedText; // Optional tagline/slogan

  // URLs & Assets
  url: string; // Primary site URL
  logo: string; // Main logo URL
  logoLight?: string; // Light mode logo (if different)
  logoDark?: string; // Dark mode logo (if different)
  favicon: string; // Legacy favicon.ico
  ogImage: string; // Default Open Graph image

  // Localization
  currency: string; // Default currency code (GEL, USD, EUR)
  currencySymbol?: string; // Currency symbol (₾, $, €)
  localeDefault: string;
  locales: string[];

  // Social Media
  links: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
    pinterest?: string;
  };

  // SEO & Analytics
  seo?: SEOConfig;

  // Business Information
  business?: BusinessInfo;

  // PWA Configuration
  pwa?: PWAConfig;
};

export type NavbarVariant = 1 | 2;

export type CartVariant = "dropdown" | "drawer";

export type UIConfig = {
  navbarVariant?: NavbarVariant;
  cartVariant?: CartVariant;
  enableFlyToCart?: boolean;
  enableSmoothScrolling?: boolean;
};


// Dictionary type - matches the structure of en.json/ka.json
export type Dictionary = Record<string, any>;

export type TenantConfig =
  | {
      templateId: 1;
      themeColor: string;
      theme: ThemeVars;
      homepage: Template1Homepage;
      infoPages?: InfoPagesConfig;
      dynamicPages?: DynamicPagesConfig;
      merchantType?: MerchantType;
      siteConfig: SiteConfig;
      ui?: UIConfig;
      dictionaries?: Record<string, Dictionary>; // Dynamic dictionaries from tenant config
    }
  | {
      templateId: 2;
      themeColor: string;
      theme: ThemeVars;
      homepage: Template2Homepage;
      infoPages?: InfoPagesConfig;
      dynamicPages?: DynamicPagesConfig;
      merchantType?: MerchantType;
      siteConfig: SiteConfig;
      ui?: UIConfig;
      dictionaries?: Record<string, Dictionary>; // Dynamic dictionaries from tenant config
    };
