import type { ComponentType } from "react";
import type {
  Template1SectionType,
  Template2SectionType,
  Template3SectionType,
  Template4SectionType,
  Template1SectionInstance,
  Template2SectionInstance,
  Template3SectionInstance,
  Template4SectionInstance,
} from "@/types/tenant";

import { z } from "zod";

// ===== Zod schemas for localized types =====
const LocalizedTextSchema = z.object({
  ka: z.string(),
  en: z.string(),
});

const LocalizedRichSchema = z.object({
  ka: z.string(),
  en: z.string(),
});

// ===== Template 1 Zod Schemas =====
const HeroWithSearchDataSchema = z.object({
  headline: LocalizedTextSchema,
  subheadline: LocalizedTextSchema,
  searchPlaceholder: LocalizedTextSchema,
  promoBadge: LocalizedTextSchema.optional(),
  imageUrl: z.string().optional(),
  cta: z
    .object({
      label: LocalizedTextSchema,
      href: z.string(),
    })
    .optional(),
});

const CategoryGridDataSchema = z.object({
  title: LocalizedTextSchema,
  categories: z.array(
    z.object({
      name: LocalizedTextSchema,
      imageUrl: z.string(),
      href: z.string(),
      productCount: z.number().optional(),
    })
  ),
});

const BrandCarouselDataSchema = z.object({
  title: LocalizedTextSchema.optional(),
});

const AboutUsDataSchema = z.object({
  title: LocalizedTextSchema,
  description: LocalizedRichSchema,
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  stats: z
    .array(
      z.object({
        value: z.string(),
        label: LocalizedTextSchema,
      })
    )
    .optional(),
  cta: z
    .object({
      label: LocalizedTextSchema,
      href: z.string(),
    })
    .optional(),
});

const CommercialBannerDataSchema = z.object({
  layout: z.enum(["carousel", "grid"]),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  banners: z.array(
    z.object({
      imageUrl: z.string(),
      mobileImageUrl: z.string().optional(),
      href: z.string(),
      alt: LocalizedTextSchema,
      badge: LocalizedTextSchema.optional(),
    })
  ),
});

const DealCountdownDataSchema = z.object({
  title: LocalizedTextSchema,
  endsAtISO: z.string(),
  dealItems: z.array(
    z.object({
      sku: z.string(),
      title: LocalizedTextSchema,
      image: z.string(),
      price: z.number(),
      originalPrice: z.number().optional(),
      href: z.string(),
    })
  ),
});

const ProductRailDataSchema = z.object({
  customName: z.string().optional(),
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  layout: z.enum(["carousel", "grid"]),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  limit: z.number(),
  viewAllHref: z.string(),
  filterBy: z.object({
    categoryIds: z.array(z.string()).optional(),
    brandIds: z.array(z.string()).optional(),
    condition: z.array(z.number()).optional(), // Condition enum values: 0=New, 1=Used, 2=LikeNew
    stockStatus: z.number().optional(), // StockStatus enum values: 0=InStock, 1=OutOfStock
    isNewArrival: z.boolean().optional(),
    isLiquidated: z.boolean().optional(),
    isComingSoon: z.boolean().optional(),
    hasDiscount: z.boolean().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
  }).optional(),
  sortBy: z.enum(["featured", "newest", "price-low", "price-high", "rating", "name"]).optional(),
});

const ComparisonBlockDataSchema = z.object({
  title: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  products: z.array(
    z.object({
      sku: z.string(),
      name: LocalizedTextSchema,
      image: z.string(),
      specs: z.array(
        z.object({
          label: LocalizedTextSchema,
          value: z.string(),
        })
      ),
      price: z.number(),
      href: z.string(),
    })
  ),
});

const ReviewsDataSchema = z.object({
  title: LocalizedTextSchema,
  reviews: z.array(
    z.object({
      author: z.string(),
      rating: z.number().min(1).max(5),
      text: LocalizedTextSchema,
      date: z.string(),
      productName: LocalizedTextSchema.optional(),
    })
  ),
});

const TrustBadgesDataSchema = z.object({
  badges: z.array(
    z.object({
      icon: z.string(),
      title: LocalizedTextSchema,
      description: LocalizedTextSchema,
    })
  ),
});

const NewsletterAppDataSchema = z.object({
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
  emailPlaceholder: LocalizedTextSchema,
  ctaLabel: LocalizedTextSchema,
  appLinks: z
    .object({
      ios: z.string().optional(),
      android: z.string().optional(),
    })
    .optional(),
});

const Template1SectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ProductRail"),
    enabled: z.boolean(),
    order: z.number(),
    data: ProductRailDataSchema,
  }),
  z.object({
    type: z.literal("CommercialBanner"),
    enabled: z.boolean(),
    order: z.number(),
    data: CommercialBannerDataSchema,
  }),
  z.object({
    type: z.literal("AboutUs"),
    enabled: z.boolean(),
    order: z.number(),
    data: AboutUsDataSchema,
  }),
  z.object({
    type: z.literal("CategoryGrid"),
    enabled: z.boolean(),
    order: z.number(),
    data: CategoryGridDataSchema,
  }),
  z.object({
    type: z.literal("BrandCarousel"),
    enabled: z.boolean(),
    order: z.number(),
    data: BrandCarouselDataSchema,
  }),
]);

const Template1HomepageSchema = z.object({
  templateId: z.literal(1),
  sections: z.array(Template1SectionSchema),
});

// ===== Template 2 Zod Schemas =====
const HeroLifestyleDataSchema = z.object({
  headline: LocalizedTextSchema,
  subheadline: LocalizedTextSchema,
  imageUrl: z.string(),
  overlayOpacity: z.number().optional(),
  cta: z
    .object({
      label: LocalizedTextSchema,
      href: z.string(),
    })
    .optional(),
  secondaryCta: z
    .object({
      label: LocalizedTextSchema,
      href: z.string(),
    })
    .optional(),
});

const ConfiguratorBlockDataSchema = z.object({
  title: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  steps: z.array(
    z.object({
      label: LocalizedTextSchema,
      options: z.array(LocalizedTextSchema),
    })
  ),
  cta: z
    .object({
      label: LocalizedTextSchema,
      href: z.string(),
    })
    .optional(),
});

const CustomerGalleryDataSchema = z.object({
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  images: z.array(
    z.object({
      url: z.string(),
      caption: LocalizedTextSchema.optional(),
      author: z.string().optional(),
    })
  ),
  hashtag: LocalizedTextSchema.optional(),
});

const BrandStoryDataSchema = z.object({
  title: LocalizedTextSchema,
  story: LocalizedRichSchema,
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  stats: z
    .array(
      z.object({
        value: z.string(),
        label: LocalizedTextSchema,
      })
    )
    .optional(),
});

const ReviewsWarrantyDataSchema = z.object({
  title: LocalizedTextSchema,
  reviews: z.array(
    z.object({
      author: z.string(),
      rating: z.number().min(1).max(5),
      text: LocalizedTextSchema,
      date: z.string(),
    })
  ),
  warrantyInfo: z.object({
    title: LocalizedTextSchema,
    details: z.array(LocalizedTextSchema),
    icon: z.string().optional(),
  }),
});

const NewsletterDataSchema = z.object({
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
  emailPlaceholder: LocalizedTextSchema,
  ctaLabel: LocalizedTextSchema,
  privacyNote: LocalizedTextSchema.optional(),
});

const Template2SectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("HeroLifestyle"),
    enabled: z.boolean(),
    order: z.number(),
    data: HeroLifestyleDataSchema,
  }),
  z.object({
    type: z.literal("CategoryGrid"),
    enabled: z.boolean(),
    order: z.number(),
    data: CategoryGridDataSchema,
  }),
  z.object({
    type: z.literal("ConfiguratorBlock"),
    enabled: z.boolean(),
    order: z.number(),
    data: ConfiguratorBlockDataSchema,
  }),
  z.object({
    type: z.literal("ProductRail"),
    enabled: z.boolean(),
    order: z.number(),
    data: ProductRailDataSchema,
  }),
  z.object({
    type: z.literal("CustomerGallery"),
    enabled: z.boolean(),
    order: z.number(),
    data: CustomerGalleryDataSchema,
  }),
  z.object({
    type: z.literal("BrandStory"),
    enabled: z.boolean(),
    order: z.number(),
    data: BrandStoryDataSchema,
  }),
  z.object({
    type: z.literal("ReviewsWarranty"),
    enabled: z.boolean(),
    order: z.number(),
    data: ReviewsWarrantyDataSchema,
  }),
  z.object({
    type: z.literal("Newsletter"),
    enabled: z.boolean(),
    order: z.number(),
    data: NewsletterDataSchema,
  }),
]);

const Template2HomepageSchema = z.object({
  templateId: z.literal(2),
  sections: z.array(Template2SectionSchema),
});

// ===== Template 3 Zod Schemas =====
const HeroBannerDataSchema = z.object({
  headline: LocalizedTextSchema,
  subheadline: LocalizedTextSchema.optional(),
  backgroundImage: z.string(),
  mobileBackgroundImage: z.string().optional(),
  cta: z
    .object({
      label: LocalizedTextSchema,
      href: z.string(),
    })
    .optional(),
  badge: LocalizedTextSchema.optional(),
});

const ReviewsWallDataSchema = z.object({
  title: LocalizedTextSchema,
  reviews: z.array(
    z.object({
      author: z.string(),
      avatar: z.string().optional(),
      rating: z.number().min(1).max(5),
      text: LocalizedTextSchema,
      verified: z.boolean(),
      productName: LocalizedTextSchema.optional(),
    })
  ),
});

const BundlePromoDataSchema = z.object({
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
  bundles: z.array(
    z.object({
      name: LocalizedTextSchema,
      products: z.array(
        z.object({
          sku: z.string(),
          name: LocalizedTextSchema,
          image: z.string(),
        })
      ),
      price: z.number(),
      originalPrice: z.number().optional(),
      savings: LocalizedTextSchema.optional(),
      href: z.string(),
    })
  ),
});

const InfluencerHighlightDataSchema = z.object({
  title: LocalizedTextSchema,
  videoUrl: z.string().optional(),
  images: z.array(z.string()),
  influencer: z
    .object({
      name: z.string(),
      handle: z.string(),
      avatar: z.string().optional(),
    })
    .optional(),
  captions: z.array(LocalizedTextSchema).optional(),
  cta: z
    .object({
      label: LocalizedTextSchema,
      href: z.string(),
    })
    .optional(),
});

const Template3SectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("HeroBanner"),
    enabled: z.boolean(),
    order: z.number(),
    data: HeroBannerDataSchema,
  }),
  z.object({
    type: z.literal("CategoryGrid"),
    enabled: z.boolean(),
    order: z.number(),
    data: CategoryGridDataSchema,
  }),
  z.object({
    type: z.literal("ReviewsWall"),
    enabled: z.boolean(),
    order: z.number(),
    data: ReviewsWallDataSchema,
  }),
  z.object({
    type: z.literal("ProductRail"),
    enabled: z.boolean(),
    order: z.number(),
    data: ProductRailDataSchema,
  }),
  z.object({
    type: z.literal("BundlePromo"),
    enabled: z.boolean(),
    order: z.number(),
    data: BundlePromoDataSchema,
  }),
  z.object({
    type: z.literal("InfluencerHighlight"),
    enabled: z.boolean(),
    order: z.number(),
    data: InfluencerHighlightDataSchema,
  }),
  z.object({
    type: z.literal("NewsletterBeauty"),
    enabled: z.boolean(),
    order: z.number(),
    data: NewsletterDataSchema,
  }),
]);

const Template3HomepageSchema = z.object({
  templateId: z.literal(3),
  sections: z.array(Template3SectionSchema),
});

// ===== Template 4 Zod Schemas =====
const HeroCategoryGridDataSchema = z.object({
  headline: LocalizedTextSchema,
  subheadline: LocalizedTextSchema.optional(),
  description: LocalizedTextSchema.optional(),
  badge: LocalizedTextSchema.optional(),
  backgroundImage: z.string().optional(),
  primaryCta: z
    .object({
      label: LocalizedTextSchema,
      href: z.string(),
    })
    .optional(),
  stats: z
    .array(
      z.object({
        value: z.string(),
        label: LocalizedTextSchema,
      })
    )
    .optional(),
  features: z.array(LocalizedTextSchema).optional(),
});

const BrandStripDataSchema = z.object({
  title: LocalizedTextSchema.optional(),
});

const CategoryCarouselDataSchema = z.object({
  title: LocalizedTextSchema,
  categories: z.array(
    z.object({
      name: LocalizedTextSchema,
      imageUrl: z.string(),
      href: z.string(),
      productCount: z.number().optional(),
    })
  ),
});

const ProductGridDataSchema = z.object({
  customName: z.string().optional(),
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  limit: z.number(),
  viewAllHref: z.string(),
  filterBy: z.object({
    categoryIds: z.array(z.string()).optional(),
    brandIds: z.array(z.string()).optional(),
    condition: z.array(z.number()).optional(),
    stockStatus: z.number().optional(),
    isNewArrival: z.boolean().optional(),
    isLiquidated: z.boolean().optional(),
    isComingSoon: z.boolean().optional(),
    hasDiscount: z.boolean().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
  }).optional(),
  sortBy: z.enum(["featured", "newest", "price-low", "price-high", "rating", "name"]).optional(),
});

const Template4SectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("HeroCategoryGrid"),
    enabled: z.boolean(),
    order: z.number(),
    data: HeroCategoryGridDataSchema,
  }),
  z.object({
    type: z.literal("CommercialBanner"),
    enabled: z.boolean(),
    order: z.number(),
    data: CommercialBannerDataSchema,
  }),
  z.object({
    type: z.literal("BrandStrip"),
    enabled: z.boolean(),
    order: z.number(),
    data: BrandStripDataSchema,
  }),
  z.object({
    type: z.literal("CategoryCarousel"),
    enabled: z.boolean(),
    order: z.number(),
    data: CategoryCarouselDataSchema,
  }),
  z.object({
    type: z.literal("ProductRail"),
    enabled: z.boolean(),
    order: z.number(),
    data: ProductRailDataSchema,
  }),
]);

const Template4HomepageSchema = z.object({
  templateId: z.literal(4),
  sections: z.array(Template4SectionSchema),
});

// ===== Template Registry Type =====
export type SectionComponent<T = any> = ComponentType<{
  data: T;
  locale: "ka" | "en";
}>;

export type TemplateDefinition<
  TSectionType extends string = string,
  TSectionInstance = any
> = {
  allowedSections: readonly TSectionType[];
  schema: z.ZodType;
  registry: Record<TSectionType, SectionComponent>;
};

// ===== Lazy imports for section components =====
// Template 1
import { lazy } from "react";

const ProductRail = lazy(
  () => import("@/components/Home/sections/ui/ProductRail")
);
const CategoryGridT1 = lazy(
  () => import("@/components/Home/sections/template1/CategoryGrid")
);
const BrandCarousel = lazy(
  () => import("@/components/Home/sections/template1/BrandCarousel")
);
const AboutUs = lazy(
  () => import("@/components/Home/sections/template1/AboutUs")
);

// Template 2
const HeroLifestyle = lazy(
  () => import("@/components/Home/sections/template2/HeroLifestyle")
);
const CategoryGridT2 = lazy(
  () => import("@/components/Home/sections/template2/CategoryGrid")
);
const ConfiguratorBlock = lazy(
  () => import("@/components/Home/sections/template2/ConfiguratorBlock")
);
const CustomerGallery = lazy(
  () => import("@/components/Home/sections/template2/CustomerGallery")
);
const BrandStory = lazy(
  () => import("@/components/Home/sections/template2/BrandStory")
);
const ReviewsWarranty = lazy(
  () => import("@/components/Home/sections/template2/ReviewsWarranty")
);
const Newsletter = lazy(
  () => import("@/components/Home/sections/template2/Newsletter")
);

// Template 3
const HeroBanner = lazy(
  () => import("@/components/Home/sections/template3/HeroBanner")
);
const CategoryGridT3 = lazy(
  () => import("@/components/Home/sections/template3/CategoryGrid")
);
const ReviewsWall = lazy(
  () => import("@/components/Home/sections/template3/ReviewsWall")
);
const BundlePromo = lazy(
  () => import("@/components/Home/sections/template3/BundlePromo")
);
const InfluencerHighlight = lazy(
  () => import("@/components/Home/sections/template3/InfluencerHighlight")
);
const NewsletterBeauty = lazy(
  () => import("@/components/Home/sections/template3/NewsletterBeauty")
);

// Template 4
const HeroCategoryGrid = lazy(
  () => import("@/components/Home/sections/template4/HeroCategoryGrid")
);
const CommercialBannerT4 = lazy(
  () => import("@/components/Home/sections/template4/CommercialBanner")
);
const BrandStripT4 = lazy(
  () => import("@/components/Home/sections/template4/BrandStrip")
);
const CategoryCarousel = lazy(
  () => import("@/components/Home/sections/template4/CategoryCarousel")
);

// ===== Template 1 Definition =====
export const TEMPLATE_1_ALLOWED_SECTIONS = [
  "ProductRail",
  "CommercialBanner",
  "AboutUs",
  "CategoryGrid",
  "BrandCarousel",
] as const;

export const template1Definition: TemplateDefinition<
  Template1SectionType,
  Template1SectionInstance
> = {
  allowedSections: TEMPLATE_1_ALLOWED_SECTIONS,
  schema: Template1HomepageSchema,
  registry: {
    ProductRail,
    CommercialBanner: CommercialBannerT4,
    AboutUs,
    CategoryGrid: CategoryGridT1,
    BrandCarousel,
  },
};

// ===== Template 2 Definition =====
export const TEMPLATE_2_ALLOWED_SECTIONS = [
  "HeroLifestyle",
  "CategoryGrid",
  "ConfiguratorBlock",
  "ProductRail",
  "CustomerGallery",
  "BrandStory",
  "ReviewsWarranty",
  "Newsletter",
] as const;

export const template2Definition: TemplateDefinition<
  Template2SectionType,
  Template2SectionInstance
> = {
  allowedSections: TEMPLATE_2_ALLOWED_SECTIONS,
  schema: Template2HomepageSchema,
  registry: {
    HeroLifestyle,
    CategoryGrid: CategoryGridT2,
    ConfiguratorBlock,
    ProductRail,
    CustomerGallery,
    BrandStory,
    ReviewsWarranty,
    Newsletter,
  },
};

// ===== Template 3 Definition =====
export const TEMPLATE_3_ALLOWED_SECTIONS = [
  "HeroBanner",
  "CategoryGrid",
  "ReviewsWall",
  "ProductRail",
  "BundlePromo",
  "InfluencerHighlight",
  "NewsletterBeauty",
] as const;

export const template3Definition: TemplateDefinition<
  Template3SectionType,
  Template3SectionInstance
> = {
  allowedSections: TEMPLATE_3_ALLOWED_SECTIONS,
  schema: Template3HomepageSchema,
  registry: {
    HeroBanner,
    CategoryGrid: CategoryGridT3,
    ReviewsWall,
    ProductRail,
    BundlePromo,
    InfluencerHighlight,
    NewsletterBeauty,
  },
};

// ===== Template 4 Definition =====
export const TEMPLATE_4_ALLOWED_SECTIONS = [
  "HeroCategoryGrid",
  "CommercialBanner",
  "BrandStrip",
  "CategoryCarousel",
  "ProductRail",
] as const;

export const template4Definition: TemplateDefinition<
  Template4SectionType,
  Template4SectionInstance
> = {
  allowedSections: TEMPLATE_4_ALLOWED_SECTIONS,
  schema: Template4HomepageSchema,
  registry: {
    HeroCategoryGrid,
    CommercialBanner: CommercialBannerT4,
    BrandStrip: BrandStripT4,
    CategoryCarousel,
    ProductRail,
  },
};

// ===== Main template getter =====
export function getTemplateDefinition(
  templateId: 1 | 2 | 3 | 4
): TemplateDefinition {
  switch (templateId) {
    case 1:
      return template1Definition;
    case 2:
      return template2Definition;
    case 3:
      return template3Definition;
    case 4:
      return template4Definition;
    default:
      throw new Error(`Unknown templateId: ${templateId}`);
  }
}

// ===== Validation helper =====
export function validateHomepage(homepage: any, templateId: 1 | 2 | 3 | 4) {
  const definition = getTemplateDefinition(templateId);
  const result = definition.schema.safeParse(homepage);

  if (!result.success) {
    const errors = result.error.format();

    throw new Error(
      `Template ${templateId} homepage validation failed:\n${JSON.stringify(errors, null, 2)}`
    );
  }

  return result.data;
}

// ===== Default sections for each template =====
export function getDefaultSectionsForTemplate(templateId: 1 | 2 | 3 | 4): any[] {
  switch (templateId) {
    case 1:
      return [
        {
          type: "HeroWithSearch",
          enabled: true,
          order: 1,
          data: {
            headline: { ka: "ახალი კოლექცია", en: "New Collection" },
            subheadline: { ka: "საუკეთესო ფასებით", en: "Best prices" },
            searchPlaceholder: { ka: "ძიება...", en: "Search..." },
            promoBadge: { ka: "🔥 ახალი", en: "🔥 New" },
            imageUrl: "/hero/hero-tech.jpg",
          },
        },
        {
          type: "CategoryGrid",
          enabled: true,
          order: 2,
          data: {
            title: { ka: "კატეგორიები", en: "Categories" },
            categories: [
              {
                name: { ka: "ლეპტოპები", en: "Laptops" },
                imageUrl: "/cat-laptops.jpg",
                href: "/category/laptops",
                productCount: 150,
              },
              {
                name: { ka: "სმარტფონები", en: "Smartphones" },
                imageUrl: "/cat-phones.jpg",
                href: "/category/phones",
                productCount: 230,
              },
            ],
          },
        },
        {
          type: "BrandStrip",
          enabled: true,
          order: 3,
          data: {
            title: { ka: "ბრენდები", en: "Brands" },
          },
        },
        {
          type: "DealCountdown",
          enabled: true,
          order: 4,
          data: {
            title: { ka: "დღის შეთავაზება", en: "Deal of the Day" },
            endsAtISO: new Date(Date.now() + 86400000).toISOString(),
            dealItems: [],
          },
        },
        {
          type: "ProductRail",
          enabled: true,
          order: 5,
          data: {
            title: { ka: "პოპულარული", en: "Popular" },
            subtitle: { ka: "ტოპ პროდუქტები", en: "Top products" },
            limit: 4,
            viewAllHref: "/products",
            filterBy: {},
            sortBy: "featured",
          },
        },
        {
          type: "ComparisonBlock",
          enabled: true,
          order: 6,
          data: {
            title: { ka: "შეადარე", en: "Compare" },
            description: { ka: "იპოვე სწორი არჩევანი", en: "Find the right choice" },
            products: [],
          },
        },
        {
          type: "Reviews",
          enabled: true,
          order: 7,
          data: {
            title: { ka: "შეფასებები", en: "Reviews" },
            reviews: [],
          },
        },
        {
          type: "TrustBadges",
          enabled: true,
          order: 8,
          data: {
            badges: [
              {
                icon: "shield",
                title: { ka: "უსაფრთხო გადახდა", en: "Secure Payment" },
                description: { ka: "SSL დაცვა", en: "SSL Protection" },
              },
            ],
          },
        },
        {
          type: "NewsletterApp",
          enabled: true,
          order: 9,
          data: {
            title: { ka: "გამოწერა", en: "Subscribe" },
            description: { ka: "სიახლეები და შეთავაზებები", en: "News & Offers" },
            emailPlaceholder: { ka: "ელფოსტა", en: "Email" },
            ctaLabel: { ka: "გამოწერა", en: "Subscribe" },
          },
        },
      ];
    case 2:
      return [
        {
          type: "HeroLifestyle",
          enabled: true,
          order: 1,
          data: {
            headline: { ka: "თბილი სახლი", en: "Warm Home" },
            subheadline: { ka: "კომფორტი და სტილი", en: "Comfort & Style" },
            imageUrl: "/hero-furniture.jpg",
            overlayOpacity: 0.3,
          },
        },
        {
          type: "CategoryGrid",
          enabled: true,
          order: 2,
          data: {
            title: { ka: "კატეგორიები", en: "Categories" },
            categories: [
              {
                name: { ka: "სალონი", en: "Living Room" },
                imageUrl: "/cat-living.jpg",
                href: "/category/living-room",
                productCount: 100,
              },
              {
                name: { ka: "საძინებელი", en: "Bedroom" },
                imageUrl: "/cat-bedroom.jpg",
                href: "/category/bedroom",
                productCount: 80,
              },
            ],
          },
        },
        {
          type: "ConfiguratorBlock",
          enabled: true,
          order: 3,
          data: {
            title: { ka: "შექმენი შენი დივანი", en: "Build Your Sofa" },
            description: { ka: "აირჩიე ზომა, მასალა და ფერი", en: "Choose size, material & color" },
            steps: [
              {
                label: { ka: "ზომა", en: "Size" },
                options: [
                  { ka: "2 ადგილიანი", en: "2-Seater" },
                  { ka: "3 ადგილიანი", en: "3-Seater" },
                ],
              },
              {
                label: { ka: "მასალა", en: "Material" },
                options: [
                  { ka: "ტყავი", en: "Leather" },
                  { ka: "ქსოვილი", en: "Fabric" },
                ],
              },
            ],
          },
        },
        {
          type: "ProductRail",
          enabled: true,
          order: 4,
          data: {
            title: { ka: "ახალი ჩამოსვლები", en: "New Arrivals" },
            subtitle: { ka: "უახლესი კოლექცია", en: "Latest collection" },
            limit: 4,
            viewAllHref: "/products",
            filterBy: { isNewArrival: true },
            sortBy: "newest",
          },
        },
        {
          type: "CustomerGallery",
          enabled: true,
          order: 5,
          data: {
            title: { ka: "გალერეა", en: "Gallery" },
            subtitle: { ka: "თქვენი სივრცე", en: "Your space" },
            images: [
              {
                url: "/gallery-1.jpg",
                caption: { ka: "თანამედროვე სალონი", en: "Modern living room" },
                author: "@user1",
              },
            ],
          },
        },
        {
          type: "BrandStory",
          enabled: true,
          order: 6,
          data: {
            title: { ka: "ჩვენი ისტორია", en: "Our Story" },
            story: { ka: "<p>ჩვენი ისტორია</p>", en: "<p>Our story</p>" },
            imageUrl: "/brand-story.jpg",
          },
        },
        {
          type: "ReviewsWarranty",
          enabled: true,
          order: 7,
          data: {
            title: { ka: "შეფასებები", en: "Reviews" },
            reviews: [],
            warrantyInfo: {
              title: { ka: "გარანტია", en: "Warranty" },
              details: [
                { ka: "5 წლიანი გარანტია", en: "5-Year Warranty" },
              ],
            },
          },
        },
        {
          type: "Newsletter",
          enabled: true,
          order: 8,
          data: {
            title: { ka: "გამოწერა", en: "Subscribe" },
            description: { ka: "სიახლეები", en: "Latest news" },
            emailPlaceholder: { ka: "ელფოსტა", en: "Email" },
            ctaLabel: { ka: "გამოწერა", en: "Subscribe" },
          },
        },
      ];
    case 3:
      return [
        {
          type: "HeroBanner",
          enabled: true,
          order: 1,
          data: {
            headline: { ka: "სილამაზე", en: "Beauty" },
            subheadline: { ka: "ბუნებრივი კოსმეტიკა", en: "Natural cosmetics" },
            backgroundImage: "/hero-beauty.jpg",
          },
        },
        {
          type: "CategoryGrid",
          enabled: true,
          order: 2,
          data: {
            title: { ka: "კატეგორიები", en: "Categories" },
            categories: [
              {
                name: { ka: "კოსმეტიკა", en: "Cosmetics" },
                imageUrl: "/cat-cosmetics.jpg",
                href: "/category/cosmetics",
                productCount: 200,
              },
              {
                name: { ka: "მოვლა", en: "Skincare" },
                imageUrl: "/cat-skincare.jpg",
                href: "/category/skincare",
                productCount: 150,
              },
            ],
          },
        },
        {
          type: "ReviewsWall",
          enabled: true,
          order: 3,
          data: {
            title: { ka: "შეფასებები", en: "Reviews" },
            reviews: [],
          },
        },
        {
          type: "ProductRail",
          enabled: true,
          order: 4,
          data: {
            title: { ka: "პოპულარული", en: "Popular" },
            subtitle: { ka: "ბესტსელერები", en: "Bestsellers" },
            limit: 4,
            viewAllHref: "/products",
            filterBy: {},
            sortBy: "featured",
          },
        },
        {
          type: "BundlePromo",
          enabled: true,
          order: 5,
          data: {
            title: { ka: "ბანდლები", en: "Bundles" },
            description: { ka: "შეინახე მეტი", en: "Save more" },
            bundles: [],
          },
        },
        {
          type: "InfluencerHighlight",
          enabled: true,
          order: 6,
          data: {
            title: { ka: "ინფლუენსერები", en: "Influencers" },
            images: [],
          },
        },
        {
          type: "NewsletterBeauty",
          enabled: true,
          order: 7,
          data: {
            title: { ka: "გამოწერა", en: "Subscribe" },
            description: { ka: "სილამაზის რჩევები", en: "Beauty tips" },
            emailPlaceholder: { ka: "ელფოსტა", en: "Email" },
            ctaLabel: { ka: "გამოწერა", en: "Subscribe" },
          },
        },
      ];
    case 4:
      return [
        {
          type: "HeroCategoryGrid",
          enabled: true,
          order: 1,
          data: {
            headline: { ka: "შეიძინეთ ონლაინ", en: "Shop Online" },
            subheadline: { ka: "აღმოაჩინეთ საუკეთესო პროდუქტები", en: "Discover the Best Products" },
            description: { ka: "ათასობით პროდუქტი, სწრაფი მიწოდება და უმაღლესი ხარისხი", en: "Thousands of products, fast delivery and premium quality" },
            badge: { ka: "🔥 ახალი კოლექცია", en: "🔥 New Collection" },
            backgroundImage: "/hero-bg.jpg",
            primaryCta: { label: { ka: "იყიდე ახლა", en: "Shop Now" }, href: "/category" },
            stats: [
              { value: "10,000+", label: { ka: "პროდუქტი", en: "Products" } },
              { value: "50,000+", label: { ka: "კმაყოფილი მომხმარებელი", en: "Happy Customers" } },
              { value: "24/7", label: { ka: "მხარდაჭერა", en: "Support" } },
            ],
            features: [
              { ka: "✓ უფასო მიწოდება 100₾+ შენაძენზე", en: "✓ Free shipping on orders 100₾+" },
              { ka: "✓ 30 დღიანი დაბრუნების გარანტია", en: "✓ 30-day return guarantee" },
              { ka: "✓ უსაფრთხო გადახდა", en: "✓ Secure payment" },
            ],
          },
        },
        {
          type: "CommercialBanner",
          enabled: true,
          order: 2,
          data: {
            imageUrl: "/banners/promo-1.jpg",
            mobileImageUrl: "/banners/promo-1-mobile.jpg",
            href: "/category/deals",
            alt: { ka: "სპეციალური შეთავაზება", en: "Special Offer" },
            badge: { ka: "🔥 ახალი", en: "🔥 New" },
          },
        },
        {
          type: "BrandStrip",
          enabled: true,
          order: 3,
          data: {
            title: { ka: "ცნობილი ბრენდები", en: "Featured Brands" },
          },
        },
        {
          type: "ProductRail",
          enabled: true,
          order: 4,
          data: {
            title: { ka: "ახალი ჩამოსვლები", en: "New Arrivals" },
            subtitle: { ka: "უახლესი კოლექცია", en: "Latest collection" },
            limit: 4,
            viewAllHref: "/products",
            filterBy: { isNewArrival: true },
            sortBy: "newest",
          },
        },
        {
          type: "CommercialBanner",
          enabled: true,
          order: 4,
          data: {
            imageUrl: "/banners/promo-2.jpg",
            mobileImageUrl: "/banners/promo-2-mobile.jpg",
            href: "/category/new-arrivals",
            alt: { ka: "ახალი ჩამოსვლები", en: "New Arrivals" },
          },
        },
        {
          type: "CategoryCarousel",
          enabled: true,
          order: 5,
          data: {
            title: { ka: "პოპულარული კატეგორიები", en: "Popular Categories" },
            categories: [
              {
                name: { ka: "ტელეფონები", en: "Phones" },
                imageUrl: "/cat-phones.jpg",
                href: "/category/phones",
                productCount: 150,
              },
              {
                name: { ka: "ლეპტოპები", en: "Laptops" },
                imageUrl: "/cat-laptops.jpg",
                href: "/category/laptops",
                productCount: 80,
              },
              {
                name: { ka: "აქსესუარები", en: "Accessories" },
                imageUrl: "/cat-accessories.jpg",
                href: "/category/accessories",
                productCount: 200,
              },
            ],
          },
        },
        {
          type: "ProductRail",
          enabled: true,
          order: 4,
          data: {
            title: { ka: "ახალი ჩამოსვლები", en: "New Arrivals" },
            subtitle: { ka: "უახლესი კოლექცია", en: "Latest collection" },
            limit: 4,
            viewAllHref: "/products",
            filterBy: { isNewArrival: true },
            sortBy: "newest",
          },
        },
      ];
    default:
      return [];
  }
}