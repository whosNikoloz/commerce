// ===== Core i18n types =====
export type Locale = "ka" | "en";
export type LocalizedText = { ka: string; en: string };
export type LocalizedRich = { ka: string; en: string };

// ===== Theme types =====
export type ThemeVars = {
  mode: "light" | "dark";
  brand: {
    primary: string; // "37 99 235"
    primaryDark: string; // "44 109 238"
    surface: string; // "241 245 249"
    surfaceDark: string; // "2 6 23"
    muted: string; // "226 232 240"
    mutedDark: string; // "16 24 41"
    accent?: string; // optional extras
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

// ===== Template 1: Clean Sections =====
export type Template1SectionType =
  | "ProductRail"
  | "CommercialBanner"
  | "AboutUs"
  | "CategoryGrid"
  | "BrandCarousel";

export type HeroWithSearchData = {
  headline: LocalizedText;
  subheadline: LocalizedText;
  searchPlaceholder: LocalizedText;
  promoBadge?: LocalizedText;
  imageUrl?: string;
  cta?: { label: LocalizedText; href: string };
};

export type CategoryGridData = {
  title: LocalizedText;
  categories: Array<{
    name: LocalizedText;
    imageUrl: string;
    href: string;
    productCount?: number;
  }>;
};

export type BrandCarouselData = {
  title?: LocalizedText;
};

export type AboutUsData = {
  title: LocalizedText;
  description: LocalizedRich;
  imageUrl?: string;
  videoUrl?: string;
  stats?: Array<{
    value: string;
    label: LocalizedText;
  }>;
  cta?: { label: LocalizedText; href: string };
};

export type DealCountdownData = {
  title: LocalizedText;
  endsAtISO: string;
  dealItems: Array<{
    sku: string;
    title: LocalizedText;
    image: string;
    price: number;
    originalPrice?: number;
    href: string;
  }>;
};

export type ProductRailData = {
  customName?: string; // Optional custom name to identify this rail in admin (e.g., "Liquidated Laptops", "Premium Phones")
  title: LocalizedText;
  subtitle?: LocalizedText;
  layout: "carousel" | "grid"; // Display as carousel or grid
  columns?: 2 | 3 | 4; // Grid column count (only for grid layout)
  limit: number;
  viewAllHref: string;
  // Filter options - use any combination
  filterBy?: {
    categoryIds?: string[]; // Filter by category IDs
    brandIds?: string[]; // Filter by brand IDs
    condition?: number[]; // Filter by condition enum (0=New, 1=Used, 2=LikeNew)
    stockStatus?: number; // Filter by stock status enum (0=InStock, 1=OutOfStock)
    isNewArrival?: boolean; // Filter for new arrivals
    isLiquidated?: boolean; // Filter for liquidated items
    isComingSoon?: boolean; // Filter for coming soon items
    hasDiscount?: boolean; // Filter for items with discount
    minPrice?: number;
    maxPrice?: number;
  };
  sortBy?: "featured" | "newest" | "price-low" | "price-high" | "rating" | "name";
};

export type ComparisonBlockData = {
  title: LocalizedText;
  description?: LocalizedText;
  products: Array<{
    sku: string;
    name: LocalizedText;
    image: string;
    specs: Array<{ label: LocalizedText; value: string }>;
    price: number;
    href: string;
  }>;
};

export type ReviewsData = {
  title: LocalizedText;
  reviews: Array<{
    author: string;
    rating: number;
    text: LocalizedText;
    date: string;
    productName?: LocalizedText;
  }>;
};

export type TrustBadgesData = {
  badges: Array<{
    icon: string;
    title: LocalizedText;
    description: LocalizedText;
  }>;
};

export type NewsletterAppData = {
  title: LocalizedText;
  description: LocalizedText;
  emailPlaceholder: LocalizedText;
  ctaLabel: LocalizedText;
  appLinks?: {
    ios?: string;
    android?: string;
  };
};

// ===== Template 2: Home / Furniture =====
export type Template2SectionType =
  | "HeroLifestyle"
  | "CategoryGrid"
  | "ConfiguratorBlock"
  | "ProductRail"
  | "CustomerGallery"
  | "BrandStory"
  | "ReviewsWarranty"
  | "Newsletter";

export type HeroLifestyleData = {
  headline: LocalizedText;
  subheadline: LocalizedText;
  imageUrl: string;
  overlayOpacity?: number;
  cta?: { label: LocalizedText; href: string };
  secondaryCta?: { label: LocalizedText; href: string };
};

export type ConfiguratorBlockData = {
  title: LocalizedText;
  description?: LocalizedText;
  steps: Array<{
    label: LocalizedText;
    options: Array<LocalizedText>;
  }>;
  cta?: { label: LocalizedText; href: string };
};

export type CustomerGalleryData = {
  title: LocalizedText;
  subtitle?: LocalizedText;
  images: Array<{
    url: string;
    caption?: LocalizedText;
    author?: string;
  }>;
  hashtag?: LocalizedText;
};

export type BrandStoryData = {
  title: LocalizedText;
  story: LocalizedRich;
  imageUrl?: string;
  videoUrl?: string;
  stats?: Array<{
    value: string;
    label: LocalizedText;
  }>;
};

export type ReviewsWarrantyData = {
  title: LocalizedText;
  reviews: Array<{
    author: string;
    rating: number;
    text: LocalizedText;
    date: string;
  }>;
  warrantyInfo: {
    title: LocalizedText;
    details: LocalizedText[];
    icon?: string;
  };
};

export type NewsletterData = {
  title: LocalizedText;
  description: LocalizedText;
  emailPlaceholder: LocalizedText;
  ctaLabel: LocalizedText;
  privacyNote?: LocalizedText;
};

// ===== Template 3: Beauty / Health =====
export type Template3SectionType =
  | "HeroBanner"
  | "CategoryGrid"
  | "ReviewsWall"
  | "ProductRail"
  | "BundlePromo"
  | "InfluencerHighlight"
  | "NewsletterBeauty";

// ===== Template 4: Casual Ecommerce =====
export type Template4SectionType =
  | "HeroCategoryGrid"
  | "CommercialBanner"
  | "BrandStrip"
  | "CategoryCarousel"
  | "ProductRail";

export type HeroBannerData = {
  headline: LocalizedText;
  subheadline?: LocalizedText;
  backgroundImage: string;
  mobileBackgroundImage?: string;
  cta?: { label: LocalizedText; href: string };
  badge?: LocalizedText;
};

export type ReviewsWallData = {
  title: LocalizedText;
  reviews: Array<{
    author: string;
    avatar?: string;
    rating: number;
    text: LocalizedText;
    verified: boolean;
    productName?: LocalizedText;
  }>;
};

export type BundlePromoData = {
  title: LocalizedText;
  description: LocalizedText;
  bundles: Array<{
    name: LocalizedText;
    products: Array<{
      sku: string;
      name: LocalizedText;
      image: string;
    }>;
    price: number;
    originalPrice?: number;
    savings?: LocalizedText;
    href: string;
  }>;
};

export type InfluencerHighlightData = {
  title: LocalizedText;
  videoUrl?: string;
  images: string[];
  influencer?: {
    name: string;
    handle: string;
    avatar?: string;
  };
  captions?: LocalizedText[];
  cta?: { label: LocalizedText; href: string };
};

// ===== Template 4 Section Data Types =====
export type HeroCategoryGridData = {
  headline: LocalizedText;
  subheadline?: LocalizedText;
  description?: LocalizedText;
  badge?: LocalizedText;
  backgroundImage?: string;
  primaryCta?: { label: LocalizedText; href: string };
  stats?: Array<{
    value: string;
    label: LocalizedText;
  }>;
  features?: Array<LocalizedText>;
};

export type BrandStripData = {
  title?: LocalizedText;
};

export type CommercialBannerData = {
  layout: "carousel" | "grid";
  columns?: 1 | 2 | 3; // Grid column count (only for grid layout)
  banners: Array<{
    imageUrl: string;
    mobileImageUrl?: string;
    href: string;
    alt: LocalizedText;
    badge?: LocalizedText;
  }>;
};

export type CategoryCarouselData = {
  title: LocalizedText;
  categories: Array<{
    name: LocalizedText;
    imageUrl: string;
    href: string;
    productCount?: number;
  }>;
};

export type ProductGridData = {
  customName?: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  columns?: 2 | 3 | 4; // Grid column count
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

// ===== Section instances with discriminated unions =====
export type Template1SectionInstance =
  | { type: "ProductRail"; enabled: boolean; order: number; data: ProductRailData }
  | { type: "CommercialBanner"; enabled: boolean; order: number; data: CommercialBannerData }
  | { type: "AboutUs"; enabled: boolean; order: number; data: AboutUsData }
  | { type: "CategoryGrid"; enabled: boolean; order: number; data: CategoryGridData }
  | { type: "BrandCarousel"; enabled: boolean; order: number; data: BrandCarouselData };

export type Template2SectionInstance =
  | { type: "HeroLifestyle"; enabled: boolean; order: number; data: HeroLifestyleData }
  | { type: "CategoryGrid"; enabled: boolean; order: number; data: CategoryGridData }
  | { type: "ConfiguratorBlock"; enabled: boolean; order: number; data: ConfiguratorBlockData }
  | { type: "ProductRail"; enabled: boolean; order: number; data: ProductRailData }
  | { type: "CustomerGallery"; enabled: boolean; order: number; data: CustomerGalleryData }
  | { type: "BrandStory"; enabled: boolean; order: number; data: BrandStoryData }
  | { type: "ReviewsWarranty"; enabled: boolean; order: number; data: ReviewsWarrantyData }
  | { type: "Newsletter"; enabled: boolean; order: number; data: NewsletterData };

export type Template3SectionInstance =
  | { type: "HeroBanner"; enabled: boolean; order: number; data: HeroBannerData }
  | { type: "CategoryGrid"; enabled: boolean; order: number; data: CategoryGridData }
  | { type: "ReviewsWall"; enabled: boolean; order: number; data: ReviewsWallData }
  | { type: "ProductRail"; enabled: boolean; order: number; data: ProductRailData }
  | { type: "BundlePromo"; enabled: boolean; order: number; data: BundlePromoData }
  | { type: "InfluencerHighlight"; enabled: boolean; order: number; data: InfluencerHighlightData }
  | { type: "NewsletterBeauty"; enabled: boolean; order: number; data: NewsletterData };

export type Template4SectionInstance =
  | { type: "HeroCategoryGrid"; enabled: boolean; order: number; data: HeroCategoryGridData }
  | { type: "CommercialBanner"; enabled: boolean; order: number; data: CommercialBannerData }
  | { type: "BrandStrip"; enabled: boolean; order: number; data: BrandStripData }
  | { type: "CategoryCarousel"; enabled: boolean; order: number; data: CategoryCarouselData }
  | { type: "ProductRail"; enabled: boolean; order: number; data: ProductRailData };

// ===== Homepage config per template =====
export type Template1Homepage = {
  templateId: 1;
  sections: Template1SectionInstance[];
};

export type Template2Homepage = {
  templateId: 2;
  sections: Template2SectionInstance[];
};

export type Template3Homepage = {
  templateId: 3;
  sections: Template3SectionInstance[];
};

export type Template4Homepage = {
  templateId: 4;
  sections: Template4SectionInstance[];
};

export type Homepage = Template1Homepage | Template2Homepage | Template3Homepage | Template4Homepage;

// ===== Merchant Type =====
export type MerchantType = "FINA" | "CUSTOM";

// ===== Site Configuration (merged into tenant) =====
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
    facebook?: string;
    youtube?: string;
  };
};

// ===== Updated TenantConfig =====
export type TenantConfig =
  | {
    templateId: 1;
    themeColor: string;
    theme: ThemeVars;
    homepage: Template1Homepage;
    merchantType?: MerchantType; // FINA users can sync, CUSTOM users add products manually
    siteConfig: SiteConfig; // Site metadata and configuration
  }
  | {
    templateId: 2;
    themeColor: string;
    theme: ThemeVars;
    homepage: Template2Homepage;
    merchantType?: MerchantType;
    siteConfig: SiteConfig;
  }
  | {
    templateId: 3;
    themeColor: string;
    theme: ThemeVars;
    homepage: Template3Homepage;
    merchantType?: MerchantType;
    siteConfig: SiteConfig;
  }
  | {
    templateId: 4;
    themeColor: string;
    theme: ThemeVars;
    homepage: Template4Homepage;
    merchantType?: MerchantType;
    siteConfig: SiteConfig;
  };
