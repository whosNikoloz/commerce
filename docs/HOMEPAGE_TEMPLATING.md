# Homepage Templating System

A robust, type-safe, multi-tenant homepage templating system with strict per-template section validation and full i18n support.

## Overview

This system allows each tenant to select a `templateId` (1, 2, or 3) and configure their homepage with template-specific sections. All sections and content are controlled from the tenant configuration with multilingual support (Georgian and English).

## Architecture

### Key Components

1. **Type System** (`types/tenant.ts`)
   - Per-template section type unions
   - Discriminated union types for type safety
   - Localized content types

2. **Template Definitions** (`lib/templates.tsx`)
   - Zod schemas for validation
   - Component registries per template
   - Template-specific allowed sections

3. **HomeRenderer** (`app/(site)/_components/HomeRenderer.tsx`)
   - Validates homepage configuration
   - Dynamically renders sections based on template
   - Handles lazy loading with Suspense

4. **Section Components** (`app/(site)/_components/sections/`)
   - Template-specific components
   - Fully typed props with localized data
   - Modern UI with Tailwind + shadcn/ui

5. **Tenant Configuration** (`config/tenat.ts`)
   - Per-tenant homepage sections
   - Localized content for all text
   - Template-specific section instances

## Templates

### Template 1: Tech / Electronics
**Target:** Technology and electronics stores with search-driven discovery

**Allowed Sections:**
- `HeroWithSearch` - Hero with prominent search bar
- `CategoryGrid` - Product categories
- `BrandStrip` - Brand logos
- `DealCountdown` - Time-limited deals with countdown
- `ProductRailLaptops` - Laptop products
- `ProductRailPhones` - Phone products
- `ComparisonBlock` - Product comparison
- `Reviews` - Customer reviews
- `TrustBadges` - Trust indicators (secure payment, shipping, etc.)
- `NewsletterApp` - Newsletter signup with app download links

**Visual Style:** Blue theme, search-focused, data-driven

### Template 2: Home / Furniture
**Target:** Furniture and home decor with lifestyle imagery

**Allowed Sections:**
- `HeroLifestyle` - Full-screen lifestyle hero
- `CategoryGrid` - Product categories
- `ConfiguratorBlock` - Interactive product configurator
- `ProductRailNewArrivals` - New arrival products
- `ProductRailBestSofas` - Featured sofas
- `CustomerGallery` - User-generated content gallery
- `BrandStory` - Brand narrative with stats
- `ReviewsWarranty` - Combined reviews and warranty info
- `Newsletter` - Newsletter signup

**Visual Style:** Emerald/green theme, image-heavy, lifestyle-focused

### Template 3: Beauty / Health
**Target:** Beauty and health products with social proof

**Allowed Sections:**
- `HeroBanner` - Editorial-style hero banner
- `CategoryGrid` - Product categories
- `ReviewsWall` - Masonry-style review wall
- `ProductRailBestRated` - Best-rated products
- `BundlePromo` - Product bundle deals
- `InfluencerHighlight` - Influencer content showcase
- `NewsletterBeauty` - Beauty-themed newsletter signup

**Visual Style:** Purple/pink gradient theme, social-proof focused, editorial

## Usage

### Adding a New Tenant

1. Open `config/tenat.ts`
2. Add a new entry to the `TENANTS` object:

```typescript
"your-domain.com": {
  templateId: 1, // Choose 1, 2, or 3
  themeColor: "#2563eb",
  theme: { /* theme configuration */ },
  homepage: {
    templateId: 1, // Must match templateId above
    sections: [
      {
        type: "HeroWithSearch", // Must be allowed by template
        enabled: true,
        order: 1,
        data: {
          headline: {
            ka: "ქართული ტექსტი",
            en: "English text",
          },
          // ... other localized fields
        },
      },
      // ... more sections
    ],
  },
}
```

### Adding a New Section to an Existing Template

**Example:** Adding a "TestimonialVideo" section to Template 1

#### Step 1: Update Types (`types/tenant.ts`)

Add the section type to the template's union:

```typescript
export type Template1SectionType =
  | "HeroWithSearch"
  | "CategoryGrid"
  // ... existing types
  | "TestimonialVideo"; // Add new type

// Define data structure
export type TestimonialVideoData = {
  title: LocalizedText;
  videoUrl: string;
  author: string;
  testimonial: LocalizedText;
};

// Add to section instance union
export type Template1SectionInstance =
  | { type: "HeroWithSearch"; enabled: boolean; order: number; data: HeroWithSearchData }
  // ... existing types
  | { type: "TestimonialVideo"; enabled: boolean; order: number; data: TestimonialVideoData };
```

#### Step 2: Add Zod Schema (`lib/templates.tsx`)

```typescript
const TestimonialVideoDataSchema = z.object({
  title: LocalizedTextSchema,
  videoUrl: z.string(),
  author: z.string(),
  testimonial: LocalizedTextSchema,
});

// Add to Template1SectionSchema
const Template1SectionSchema = z.discriminatedUnion("type", [
  // ... existing schemas
  z.object({
    type: z.literal("TestimonialVideo"),
    enabled: z.boolean(),
    order: z.number(),
    data: TestimonialVideoDataSchema,
  }),
]);

// Update allowed sections
export const TEMPLATE_1_ALLOWED_SECTIONS = [
  // ... existing sections
  "TestimonialVideo",
] as const;
```

#### Step 3: Create Component

Create `app/(site)/_components/sections/template1/TestimonialVideo.tsx`:

```typescript
import type { TestimonialVideoData, Locale } from "@/types/tenant";
import { t } from "@/lib/i18n";

interface TestimonialVideoProps {
  data: TestimonialVideoData;
  locale: Locale;
}

export default function TestimonialVideo({ data, locale }: TestimonialVideoProps) {
  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">{t(data.title, locale)}</h2>
        <video src={data.videoUrl} controls className="w-full max-w-4xl mx-auto" />
        <p className="text-lg mt-6 italic">{t(data.testimonial, locale)}</p>
        <p className="mt-2 font-semibold">— {data.author}</p>
      </div>
    </section>
  );
}
```

#### Step 4: Register in Template Definition (`lib/templates.tsx`)

```typescript
import { lazy } from "react";

const TestimonialVideo = lazy(
  () => import("@/components/Home//sections/template1/TestimonialVideo")
);

export const template1Definition = {
  allowedSections: TEMPLATE_1_ALLOWED_SECTIONS,
  schema: Template1HomepageSchema,
  registry: {
    // ... existing components
    TestimonialVideo,
  },
};
```

#### Step 5: Use in Tenant Config

```typescript
{
  type: "TestimonialVideo",
  enabled: true,
  order: 8,
  data: {
    title: { ka: "მომხმარებლის შეფასება", en: "Customer Testimonial" },
    videoUrl: "/testimonials/john-doe.mp4",
    author: "John Doe",
    testimonial: {
      ka: "საუკეთესო პროდუქტი!",
      en: "Best product ever!",
    },
  },
}
```

### Adding a New Template

**Example:** Adding Template 4 for Fashion/Apparel

#### Step 1: Define Types

```typescript
// In types/tenant.ts
export type Template4SectionType =
  | "HeroLookbook"
  | "TrendingNow"
  | "ShopByStyle"
  | "Newsletter";

// Define all data types for sections
export type HeroLookbookData = { /* ... */ };
// ... other data types

// Define section instances
export type Template4SectionInstance =
  | { type: "HeroLookbook"; enabled: boolean; order: number; data: HeroLookbookData }
  // ... others

// Define homepage
export type Template4Homepage = {
  templateId: 4;
  sections: Template4SectionInstance[];
};

// Update Homepage union
export type Homepage =
  | Template1Homepage
  | Template2Homepage
  | Template3Homepage
  | Template4Homepage;

// Update TenantConfig union
export type TenantConfig =
  | { templateId: 1; /* ... */ }
  | { templateId: 2; /* ... */ }
  | { templateId: 3; /* ... */ }
  | { templateId: 4; themeColor: string; theme: ThemeVars; homepage: Template4Homepage; };
```

#### Step 2: Create Zod Schemas and Definition

```typescript
// In lib/templates.tsx
const Template4SectionSchema = z.discriminatedUnion("type", [
  // ... section schemas
]);

const Template4HomepageSchema = z.object({
  templateId: z.literal(4),
  sections: z.array(Template4SectionSchema),
});

export const TEMPLATE_4_ALLOWED_SECTIONS = [
  "HeroLookbook",
  "TrendingNow",
  "ShopByStyle",
  "Newsletter",
] as const;

export const template4Definition = {
  allowedSections: TEMPLATE_4_ALLOWED_SECTIONS,
  schema: Template4HomepageSchema,
  registry: {
    HeroLookbook: lazy(() => import("@/components/Home/sections/template4/HeroLookbook")),
    // ... other components
  },
};

// Update getTemplateDefinition
export function getTemplateDefinition(templateId: 1 | 2 | 3 | 4) {
  switch (templateId) {
    case 1: return template1Definition;
    case 2: return template2Definition;
    case 3: return template3Definition;
    case 4: return template4Definition;
    default: throw new Error(`Unknown templateId: ${templateId}`);
  }
}
```

#### Step 3: Create Section Components

Create all section components in `app/(site)/_components/sections/template4/`

#### Step 4: Add to Tenant Config

```typescript
"fashion-store.com": {
  templateId: 4,
  themeColor: "#ec4899",
  theme: { /* theme config */ },
  homepage: {
    templateId: 4,
    sections: [
      // ... sections
    ],
  },
}
```

## Validation

### Compile-Time Safety

TypeScript ensures:
- Section types match the template
- Data structures are correct
- All required localized fields are present

### Runtime Validation

Zod schemas validate:
- Section types are allowed for the template
- Data shapes match expected structure
- Required fields are present

### Error Messages

When validation fails, you'll see clear error messages:

```
Template 1 homepage validation failed:
{
  "_errors": [],
  "sections": {
    "2": {
      "type": {
        "_errors": [
          "Invalid literal value, expected \"HeroWithSearch\" | \"CategoryGrid\" | ..."
        ]
      }
    }
  }
}
```

## Localization

### Translation Helper

Use the `t()` helper to extract localized text:

```typescript
import { t } from "@/lib/i18n";

// In component
<h1>{t(data.headline, locale)}</h1>
```

### Adding Localized Content

All user-facing text must be provided in both languages:

```typescript
headline: {
  ka: "ქართული ტექსტი",
  en: "English text",
}
```

## Best Practices

1. **Always validate:** Never skip Zod validation - it prevents runtime errors
2. **Type everything:** Use discriminated unions for section types
3. **Localize all text:** Every user-visible string needs ka + en
4. **Keep sections focused:** Each section should have a single, clear purpose
5. **Use lazy loading:** All section components use React.lazy for code splitting
6. **Order matters:** Use the `order` field to control section sequence
7. **Enable/disable:** Use `enabled: false` to temporarily hide sections without removing them

## Testing

To test a new template or section:

1. Update the tenant config in `config/tenat.ts`
2. Run the development server
3. The HomeRenderer will automatically validate and render your configuration
4. Check the browser console for validation errors

## Troubleshooting

### "Section type not allowed for template"

The section type you're trying to use doesn't exist in the template's allowed sections. Check the template definition in `lib/templates.tsx`.

### "Component not found for section type"

The component isn't registered in the template's component registry. Make sure you've:
1. Created the component file
2. Added it to the lazy imports
3. Registered it in the template definition

### "Validation failed"

Check the error message for specific field errors. Common issues:
- Missing required fields
- Wrong data type
- Missing localization (ka or en)

### Sections not rendering

1. Check that `enabled: true`
2. Verify the `order` field is set
3. Check browser console for errors
4. Ensure the component is properly exported

## File Structure

```
├── app/
│   ├── [lang]/
│   │   └── page.tsx                    # Main homepage entry
│   └── (site)/
│       └── _components/
│           ├── HomeRenderer.tsx         # Main renderer
│           └── sections/
│               ├── template1/           # Template 1 sections
│               ├── template2/           # Template 2 sections
│               └── template3/           # Template 3 sections
├── config/
│   └── tenat.ts                        # Tenant configurations
├── lib/
│   ├── templates.tsx                   # Template definitions & validation
│   └── i18n.ts                         # Localization helpers
└── types/
    └── tenant.ts                       # Type definitions
```

## Performance Considerations

- All section components are lazy-loaded
- Sections render with Suspense boundaries
- Homepage data is statically configured (no API calls)
- Validation happens once during render
- Components use Tailwind for optimal CSS delivery

## Future Enhancements

Potential additions:
- Visual template editor UI
- A/B testing support
- Dynamic content from CMS
- Section-level analytics
- Preview mode for staging changes
- Theme customization per section