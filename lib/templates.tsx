import type { ComponentType } from "react";
import type {
  Template1SectionType,
  Template2SectionType,
  Template3SectionType,
  Template1SectionInstance,
  Template2SectionInstance,
  Template3SectionInstance,
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

const BrandStripDataSchema = z.object({
  title: LocalizedTextSchema.optional(),
  brands: z.array(
    z.object({
      name: z.string(),
      logoUrl: z.string(),
      href: z.string().optional(),
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
    type: z.literal("HeroWithSearch"),
    enabled: z.boolean(),
    order: z.number(),
    data: HeroWithSearchDataSchema,
  }),
  z.object({
    type: z.literal("CategoryGrid"),
    enabled: z.boolean(),
    order: z.number(),
    data: CategoryGridDataSchema,
  }),
  z.object({
    type: z.literal("BrandStrip"),
    enabled: z.boolean(),
    order: z.number(),
    data: BrandStripDataSchema,
  }),
  z.object({
    type: z.literal("DealCountdown"),
    enabled: z.boolean(),
    order: z.number(),
    data: DealCountdownDataSchema,
  }),
  z.object({
    type: z.literal("ProductRail"),
    enabled: z.boolean(),
    order: z.number(),
    data: ProductRailDataSchema,
  }),
  z.object({
    type: z.literal("ComparisonBlock"),
    enabled: z.boolean(),
    order: z.number(),
    data: ComparisonBlockDataSchema,
  }),
  z.object({
    type: z.literal("Reviews"),
    enabled: z.boolean(),
    order: z.number(),
    data: ReviewsDataSchema,
  }),
  z.object({
    type: z.literal("TrustBadges"),
    enabled: z.boolean(),
    order: z.number(),
    data: TrustBadgesDataSchema,
  }),
  z.object({
    type: z.literal("NewsletterApp"),
    enabled: z.boolean(),
    order: z.number(),
    data: NewsletterAppDataSchema,
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

const HeroWithSearch = lazy(
  () => import("@/components/Home/sections/template1/HeroWithSearch")
);
const CategoryGridT1 = lazy(
  () => import("@/components/Home/sections/template1/CategoryGrid")
);
const BrandStrip = lazy(
  () => import("@/components/Home/sections/template1/BrandStrip")
);
const DealCountdown = lazy(
  () => import("@/components/Home/sections/template1/DealCountdownWrapper")
);
const ProductRail = lazy(
  () => import("@/components/Home/sections/ui/ProductRail")
);
const ComparisonBlock = lazy(
  () => import("@/components/Home/sections/template1/ComparisonBlock")
);
const Reviews = lazy(
  () => import("@/components/Home/sections/template1/Reviews")
);
const TrustBadges = lazy(
  () => import("@/components/Home/sections/template1/TrustBadges")
);
const NewsletterApp = lazy(
  () => import("@/components/Home/sections/template1/NewsletterApp")
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

// ===== Template 1 Definition =====
export const TEMPLATE_1_ALLOWED_SECTIONS = [
  "HeroWithSearch",
  "CategoryGrid",
  "BrandStrip",
  "DealCountdown",
  "ProductRail",
  "ComparisonBlock",
  "Reviews",
  "TrustBadges",
  "NewsletterApp",
] as const;

export const template1Definition: TemplateDefinition<
  Template1SectionType,
  Template1SectionInstance
> = {
  allowedSections: TEMPLATE_1_ALLOWED_SECTIONS,
  schema: Template1HomepageSchema,
  registry: {
    HeroWithSearch,
    CategoryGrid: CategoryGridT1,
    BrandStrip,
    DealCountdown,
    ProductRail,
    ComparisonBlock,
    Reviews,
    TrustBadges,
    NewsletterApp,
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

// ===== Main template getter =====
export function getTemplateDefinition(
  templateId: 1 | 2 | 3
): TemplateDefinition {
  switch (templateId) {
    case 1:
      return template1Definition;
    case 2:
      return template2Definition;
    case 3:
      return template3Definition;
    default:
      throw new Error(`Unknown templateId: ${templateId}`);
  }
}

// ===== Validation helper =====
export function validateHomepage(homepage: any, templateId: 1 | 2 | 3) {
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