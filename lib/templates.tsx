import type { ComponentType } from "react";
import type {
  Template1SectionType,
  Template2SectionType,
  Template1SectionInstance,
  Template2SectionInstance,
} from "@/types/tenant";

import { z } from "zod";
import { lazy } from "react";

/* ================= Shared localized schema ================= */
const LocalizedTextSchema = z.object({ ka: z.string(), en: z.string() });

/* ================= Common block schemas ================= */
const CommercialBannerDataSchema = z.object({
  layout: z.enum(["carousel", "grid"]),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  carouselStyle: z.enum(["full-width", "grid"]).optional(),
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

const CustomHTMLDataSchema = z.object({
  html: z.string(),
  css: z.string().optional(),
  padding: z.enum(["none", "small", "medium", "large"]).optional(),
  fullWidth: z.boolean().optional(),
  containerClass: z.string().optional(),
});

const ProductRailDataSchema = z.object({
  customName: z.string().optional(),
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  layout: z.enum(["carousel", "grid"]),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]).optional(),
  limit: z.number(),
  viewAllHref: z.string(),
  filterBy: z
    .object({
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
    })
    .optional(),
  sortBy: z.enum(["featured", "newest", "price-low", "price-high", "rating", "name"]).optional(),
});

/* ================= COMMON SECTIONS (single source of truth) ================= */
export const COMMON_ALLOWED_SECTIONS = ["CommercialBanner", "ProductRail", "CustomHTML"] as const;
export type CommonSectionType = (typeof COMMON_ALLOWED_SECTIONS)[number];

const CommonSectionVariants = [
  z.object({
    type: z.literal("CommercialBanner"),
    enabled: z.boolean(),
    order: z.number(),
    data: CommercialBannerDataSchema,
  }),
  z.object({
    type: z.literal("ProductRail"),
    enabled: z.boolean(),
    order: z.number(),
    data: ProductRailDataSchema,
  }),
  z.object({
    type: z.literal("CustomHTML"),
    enabled: z.boolean(),
    order: z.number(),
    data: CustomHTMLDataSchema,
  }),
] as const;

const HeroDataSchema = z.object({
  categoriesTitle: LocalizedTextSchema.optional(),
  maxCategories: z.number().optional(),
  banners: z.array(
    z.object({
      imageUrl: z.string(),
      mobileImageUrl: z.string().optional(),
      href: z.string(),
      alt: LocalizedTextSchema,
      badge: LocalizedTextSchema.optional(),
      title: LocalizedTextSchema.optional(),
      description: LocalizedTextSchema.optional(),
    })
  ),
  bannerHeight: z.string().optional(),
});

const Template1SectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("Hero"),
    enabled: z.boolean(),
    order: z.number(),
    data: HeroDataSchema,
  }),
  ...CommonSectionVariants,
]);

const Template1HomepageSchema = z.object({
  templateId: z.literal(1),
  sections: z.array(Template1SectionSchema),
});

const HeroBrandDataSchema = z.object({
  backgroundImage: z.string().optional(),
  slides: z
    .array(
      z.object({
        imageUrl: z.string(),
        mobileImageUrl: z.string().optional(),
        href: z.string().optional(),
        alt: LocalizedTextSchema,
        badge: LocalizedTextSchema.optional(),
        title: LocalizedTextSchema.optional(),
        description: LocalizedTextSchema.optional(),
      })
    )
    .optional(),
  headline: LocalizedTextSchema,
  subheadline: LocalizedTextSchema.optional(),
  badge: LocalizedTextSchema.optional(),
  primaryCta: z
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
  tiles: z
    .array(
      z.object({
        imageUrl: z.string(),
        href: z.string(),
        title: LocalizedTextSchema,
        subtitle: LocalizedTextSchema.optional(),
      })
    )
    .optional(),
});

const Template2SectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("HeroBrand"),
    enabled: z.boolean(),
    order: z.number(),
    data: HeroBrandDataSchema,
  }),
  ...CommonSectionVariants,
]);

const Template2HomepageSchema = z.object({
  templateId: z.literal(2),
  sections: z.array(Template2SectionSchema),
});

export type SectionComponent<T = any> = ComponentType<{ data: T; locale: "ka" | "en" }>;

export type TemplateDefinition<TSectionType extends string = string, TSectionInstance = any> = {
  allowedSections: readonly TSectionType[];
  schema: z.ZodType;
  registry: Record<TSectionType, SectionComponent>;
};

/* Lazy components */
const ProductRail = lazy(() => import("@/components/Home/sections/ui/ProductRail"));
const CommercialBanner = lazy(() => import("@/components/Home/sections/ui/CommercialBanner"));
const CustomHTML = lazy(() => import("@/components/Home/sections/ui/CustomHTML"));

const Hero = lazy(() => import("@/components/Home/sections/template1/Hero/Hero"));
const HeroBrand = lazy(() => import("@/components/Home/sections/template2/HeroBrand"));

const commonRegistry: Record<CommonSectionType, SectionComponent> = {
  CommercialBanner,
  ProductRail,
  CustomHTML,
};

export const TEMPLATE_1_ALLOWED_SECTIONS = (["Hero", ...COMMON_ALLOWED_SECTIONS] as const) satisfies readonly Template1SectionType[];

export const template1Definition: TemplateDefinition<Template1SectionType, Template1SectionInstance> = {
  allowedSections: TEMPLATE_1_ALLOWED_SECTIONS,
  schema: Template1HomepageSchema,
  registry: {
    Hero,
    ...commonRegistry,
  } as Record<Template1SectionType, SectionComponent>,
};

export const TEMPLATE_2_ALLOWED_SECTIONS = (["HeroBrand", ...COMMON_ALLOWED_SECTIONS] as const) satisfies readonly Template2SectionType[];

export const template2Definition: TemplateDefinition<Template2SectionType, Template2SectionInstance> = {
  allowedSections: TEMPLATE_2_ALLOWED_SECTIONS,
  schema: Template2HomepageSchema,
  registry: {
    HeroBrand,
    ...commonRegistry,
  } as Record<Template2SectionType, SectionComponent>,
};

export function getTemplateDefinition(templateId: 1 | 2): TemplateDefinition {
  switch (templateId) {
    case 1:
      return template1Definition;
    case 2:
      return template2Definition;
    default:
      throw new Error(`Unknown templateId: ${templateId}`);
  }
}

export function validateHomepage(homepage: unknown, templateId: 1 | 2) {
  const definition = getTemplateDefinition(templateId);
  const result = definition.schema.safeParse(homepage);

  if (!result.success) {
    const errors = result.error.format();

    throw new Error(`Template ${templateId} homepage validation failed:\n${JSON.stringify(errors, null, 2)}`);
  }

  return result.data;
}
