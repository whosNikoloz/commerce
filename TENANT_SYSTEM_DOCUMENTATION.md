# Tenant Configuration System - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Data Flow Architecture](#data-flow-architecture)
3. [Core Type Definitions](#core-type-definitions)
4. [Templates & Sections](#templates--sections)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Implementation Guide](#implementation-guide)

---

## System Overview

### Purpose
Multi-tenant e-commerce platform where each domain/subdomain gets its own customizable storefront with unique:
- Visual theme (colors, fonts, mode)
- Homepage layout (sections, content)
- Merchant type (FINA sync vs CUSTOM manual)
- Localized content (Georgian/English)

### Key Concepts
- **Tenant**: A unique domain with isolated configuration
- **Template**: Pre-built homepage layout (1=Tech, 2=Furniture, 3=Beauty, 4=Casual)
- **Section**: Reusable UI component (Hero, ProductRail, CategoryGrid, etc.)
- **Theme**: Visual styling variables (colors, fonts, spacing)
- **Locale**: Language support (ka=Georgian, en=English)

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. REQUEST ARRIVES                                               │
│    User visits: commerce-topaz-sigma-62.vercel.app              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. SERVER-SIDE (Next.js Middleware/Layout)                       │
│    • Extract host from headers: req.headers.host                 │
│    • Call getTenantByHost(host) → Returns TenantConfig          │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. TENANT RESOLUTION                                             │
│                                                                  │
│   CURRENT (Hardcoded):                                          │
│   • lib/getTenantByHost.ts                                      │
│   • Reads from config/tenat.ts TENANTS object                   │
│   • Returns TENANTS[host] ?? DEFAULT_TENANT                     │
│                                                                  │
│   FUTURE (Database-driven):                                     │
│   • Server calls: GET /api/tenant-config?host={domain}         │
│   • API queries database: TenantConfigs table                   │
│   • Returns JSON matching TenantConfig type                     │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. THEME APPLICATION                                             │
│    • TenantProvider receives config                              │
│    • Calls applyThemeOnDocument(config.theme)                    │
│    • Sets CSS variables on document root:                        │
│      --color-brand-primary: rgb(37 99 235)                       │
│      --font-primary: "Inter, system-ui, FiraGO"                  │
│    • Stores in localStorage for client hydration                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. HOMEPAGE RENDERING                                            │
│    • HomeRenderer component reads config.homepage.sections      │
│    • Filters by .enabled === true                               │
│    • Sorts by .order ascending                                  │
│    • Dynamically imports section component based on .type       │
│    • Passes .data to component with current locale              │
└─────────────────────────────────────────────────────────────────┘
```

### Domain Resolution Flow

```typescript
// Example: localhost:3000 → TenantConfig
const host = "localhost:3000";
const tenant = TENANTS[host] ?? DEFAULT_TENANT;

// Result:
{
  templateId: 4,
  themeColor: "#22c55e",
  merchantType: "CUSTOM",
  theme: { ... },
  homepage: {
    templateId: 4,
    sections: [ ... ]
  }
}
```

---

## Core Type Definitions

### Location: `types/tenant.ts`

### 1. Internationalization Types

```typescript
export type Locale = "ka" | "en";

export type LocalizedText = {
  ka: string;  // Georgian text
  en: string;  // English text
};

export type LocalizedRich = {
  ka: string;  // Georgian HTML/markdown
  en: string;  // English HTML/markdown
};
```

**Usage Example:**
```typescript
const headline: LocalizedText = {
  ka: "ტექნოლოგია, რომელიც ზუსტად გჭირდება",
  en: "The Tech You Actually Need"
};

// In component:
<h1>{headline[locale]}</h1>
```

---

### 2. Theme Configuration

```typescript
export type ThemeVars = {
  mode: "light" | "dark";  // Default theme mode

  brand: {
    primary: string;      // RGB values: "37 99 235"
    primaryDark: string;  // Dark mode variant
    surface: string;      // Background surfaces
    surfaceDark: string;  // Dark mode surfaces
    muted: string;        // Muted elements
    mutedDark: string;    // Dark muted elements
    accent?: string;      // Optional accent color
  };

  text: {
    light: string;        // Light mode text
    subtle: string;       // Subtle text (captions)
    lightDark: string;    // Dark mode main text
    subtleDark: string;   // Dark mode subtle text
  };

  fonts?: {
    primary?: string;     // Body font stack
    secondary?: string;   // Alternative font
    heading?: string;     // Heading font stack
    sizes?: Record<string, string | number>;
    weights?: Record<string, string | number>;
  };
};
```

**Color Format**: RGB space-separated values for use with `rgb()` or `rgba()`
```css
/* Applied as: */
--color-brand-primary: rgb(37 99 235);
/* Used with opacity: */
background: rgb(var(--color-brand-primary) / 0.5);
```

**Font Stack Format**: CSS font-family string with fallbacks
```typescript
fonts: {
  primary: "Inter, system-ui, -apple-system, Segoe UI, Roboto, FiraGO, sans-serif",
  heading: "Sora, Inter, FiraGO, system-ui, sans-serif"
}
```

---

### 3. Merchant Type

```typescript
export type MerchantType = "FINA" | "CUSTOM";
```

**FINA**: Can sync products from FINA backend system (bulk import)
**CUSTOM**: Manually adds products through admin panel

---

### 4. Main Tenant Configuration

```typescript
export type TenantConfig =
  | {
      templateId: 1;
      themeColor: string;      // Hex color for meta tags
      theme: ThemeVars;
      homepage: Template1Homepage;
      merchantType?: MerchantType;
    }
  | {
      templateId: 2;
      themeColor: string;
      theme: ThemeVars;
      homepage: Template2Homepage;
      merchantType?: MerchantType;
    }
  | {
      templateId: 3;
      themeColor: string;
      theme: ThemeVars;
      homepage: Template3Homepage;
      merchantType?: MerchantType;
    }
  | {
      templateId: 4;
      themeColor: string;
      theme: ThemeVars;
      homepage: Template4Homepage;
      merchantType?: MerchantType;
    };
```

**Discriminated Union**: TypeScript automatically narrows types based on `templateId`

---

## Templates & Sections

### Template 1: Tech/Electronics Store

**Target**: Tech retailers, electronics shops
**Style**: Modern, clean, search-focused
**File**: `components/Home/sections/template1/*`

#### Available Sections

##### 1. HeroWithSearch
```typescript
type HeroWithSearchData = {
  headline: LocalizedText;           // Main heading
  subheadline: LocalizedText;        // Secondary text
  searchPlaceholder: LocalizedText;  // Search input placeholder
  promoBadge?: LocalizedText;        // Optional promo badge "🔥 -50%"
  imageUrl?: string;                 // Background image path
  cta?: {
    label: LocalizedText;
    href: string;
  };
};
```

**Example:**
```typescript
{
  type: "HeroWithSearch",
  enabled: true,
  order: 1,
  data: {
    headline: {
      ka: "ტექნოლოგია, რომელიც ზუსტად გჭირდება",
      en: "The Tech You Actually Need"
    },
    subheadline: {
      ka: "გააკეთე ჭკვიანი არჩევანი — საუკეთესო ფასად",
      en: "Make the smart choice — best prices"
    },
    searchPlaceholder: {
      ka: "პროდუქტის ძებნა…",
      en: "Search products…"
    },
    promoBadge: {
      ka: "🔥 -50% შერჩეულზე",
      en: "🔥 Up to 50% off"
    },
    imageUrl: "/hero/hero-tech.jpg"
  }
}
```

##### 2. CategoryGrid
```typescript
type CategoryGridData = {
  title: LocalizedText;
  categories: Array<{
    name: LocalizedText;
    imageUrl: string;        // Category thumbnail
    href: string;            // Link to category page
    productCount?: number;   // Number of products
  }>;
};
```

##### 3. BrandStrip
```typescript
type BrandStripData = {
  title?: LocalizedText;  // Optional section title
  // Brands fetched dynamically from database
};
```

##### 4. DealCountdown
```typescript
type DealCountdownData = {
  title: LocalizedText;
  endsAtISO: string;  // ISO 8601 date: "2025-10-05T16:00:00.000Z"
  dealItems: Array<{
    sku: string;            // Product SKU
    title: LocalizedText;
    image: string;
    price: number;          // Current price
    originalPrice?: number; // Strikethrough price
    href: string;           // Product page link
  }>;
};
```

##### 5. ProductRail
```typescript
type ProductRailData = {
  customName?: string;    // Admin label: "Liquidated Laptops"
  title: LocalizedText;
  subtitle?: LocalizedText;
  limit: number;          // Max products to show
  viewAllHref: string;    // "View All" link

  filterBy?: {
    categoryIds?: string[];      // ["cat-123", "cat-456"]
    brandIds?: string[];         // ["brand-789"]
    condition?: number[];        // [0=New, 1=Used, 2=LikeNew]
    stockStatus?: number;        // 0=InStock, 1=OutOfStock
    isNewArrival?: boolean;
    isLiquidated?: boolean;
    isComingSoon?: boolean;
    hasDiscount?: boolean;
    minPrice?: number;
    maxPrice?: number;
  };

  sortBy?: "featured" | "newest" | "price-low" | "price-high" | "rating" | "name";
};
```

**Filter Examples:**
```typescript
// New arrivals
filterBy: { isNewArrival: true }, sortBy: "newest"

// Budget laptops
filterBy: {
  categoryIds: ["laptops"],
  maxPrice: 1000,
  condition: [0, 2]  // New or Like New
},
sortBy: "price-low"

// Premium phones with discount
filterBy: {
  categoryIds: ["phones"],
  minPrice: 800,
  hasDiscount: true
},
sortBy: "featured"
```

##### 6. ComparisonBlock
```typescript
type ComparisonBlockData = {
  title: LocalizedText;
  description?: LocalizedText;
  products: Array<{
    sku: string;
    name: LocalizedText;
    image: string;
    specs: Array<{
      label: LocalizedText;  // "Processor"
      value: string;         // "M3 Pro"
    }>;
    price: number;
    href: string;
  }>;
};
```

##### 7. Reviews
```typescript
type ReviewsData = {
  title: LocalizedText;
  reviews: Array<{
    author: string;           // Customer name
    rating: number;           // 1-5 stars
    text: LocalizedText;
    date: string;             // "2025-01-15"
    productName?: LocalizedText;
  }>;
};
```

##### 8. TrustBadges
```typescript
type TrustBadgesData = {
  badges: Array<{
    icon: string;  // Icon name: "shield", "truck", "creditCard", "headphones"
    title: LocalizedText;
    description: LocalizedText;
  }>;
};
```

##### 9. NewsletterApp
```typescript
type NewsletterAppData = {
  title: LocalizedText;
  description: LocalizedText;
  emailPlaceholder: LocalizedText;
  ctaLabel: LocalizedText;
  appLinks?: {
    ios?: string;      // App Store URL
    android?: string;  // Play Store URL
  };
};
```

#### Template 1 Section Type Union
```typescript
export type Template1SectionInstance =
  | { type: "HeroWithSearch"; enabled: boolean; order: number; data: HeroWithSearchData }
  | { type: "CategoryGrid"; enabled: boolean; order: number; data: CategoryGridData }
  | { type: "BrandStrip"; enabled: boolean; order: number; data: BrandStripData }
  | { type: "DealCountdown"; enabled: boolean; order: number; data: DealCountdownData }
  | { type: "ProductRail"; enabled: boolean; order: number; data: ProductRailData }
  | { type: "ComparisonBlock"; enabled: boolean; order: number; data: ComparisonBlockData }
  | { type: "Reviews"; enabled: boolean; order: number; data: ReviewsData }
  | { type: "TrustBadges"; enabled: boolean; order: number; data: TrustBadgesData }
  | { type: "NewsletterApp"; enabled: boolean; order: number; data: NewsletterAppData };

export type Template1Homepage = {
  templateId: 1;
  sections: Template1SectionInstance[];
};
```

---

### Template 2: Home/Furniture Store

**Target**: Furniture retailers, home decor
**Style**: Lifestyle imagery, room visualizers
**File**: `components/Home/sections/template2/*`

#### Available Sections

##### 1. HeroLifestyle
```typescript
type HeroLifestyleData = {
  headline: LocalizedText;
  subheadline: LocalizedText;
  imageUrl: string;
  overlayOpacity?: number;  // 0-1 for image overlay
  cta?: { label: LocalizedText; href: string };
  secondaryCta?: { label: LocalizedText; href: string };
};
```

##### 2. ConfiguratorBlock
```typescript
type ConfiguratorBlockData = {
  title: LocalizedText;
  description?: LocalizedText;
  steps: Array<{
    label: LocalizedText;  // "Choose Size"
    options: Array<LocalizedText>;  // ["Small", "Medium", "Large"]
  }>;
  cta?: { label: LocalizedText; href: string };
};
```

##### 3. CustomerGallery
```typescript
type CustomerGalleryData = {
  title: LocalizedText;
  subtitle?: LocalizedText;
  images: Array<{
    url: string;
    caption?: LocalizedText;
    author?: string;  // Instagram handle
  }>;
  hashtag?: LocalizedText;  // "#MyHomeStyle"
};
```

##### 4. BrandStory
```typescript
type BrandStoryData = {
  title: LocalizedText;
  story: LocalizedRich;  // HTML content
  imageUrl?: string;
  videoUrl?: string;     // YouTube/Vimeo embed
  stats?: Array<{
    value: string;       // "25+"
    label: LocalizedText;  // "Years in Business"
  }>;
};
```

##### 5. ReviewsWarranty
```typescript
type ReviewsWarrantyData = {
  title: LocalizedText;
  reviews: Array<{
    author: string;
    rating: number;
    text: LocalizedText;
    date: string;
  }>;
  warrantyInfo: {
    title: LocalizedText;
    details: LocalizedText[];  // Bullet points
    icon?: string;
  };
};
```

##### 6. Newsletter
```typescript
type NewsletterData = {
  title: LocalizedText;
  description: LocalizedText;
  emailPlaceholder: LocalizedText;
  ctaLabel: LocalizedText;
  privacyNote?: LocalizedText;
};
```

#### Template 2 Section Type Union
```typescript
export type Template2SectionInstance =
  | { type: "HeroLifestyle"; enabled: boolean; order: number; data: HeroLifestyleData }
  | { type: "CategoryGrid"; enabled: boolean; order: number; data: CategoryGridData }
  | { type: "ConfiguratorBlock"; enabled: boolean; order: number; data: ConfiguratorBlockData }
  | { type: "ProductRail"; enabled: boolean; order: number; data: ProductRailData }
  | { type: "CustomerGallery"; enabled: boolean; order: number; data: CustomerGalleryData }
  | { type: "BrandStory"; enabled: boolean; order: number; data: BrandStoryData }
  | { type: "ReviewsWarranty"; enabled: boolean; order: number; data: ReviewsWarrantyData }
  | { type: "Newsletter"; enabled: boolean; order: number; data: NewsletterData };

export type Template2Homepage = {
  templateId: 2;
  sections: Template2SectionInstance[];
};
```

---

### Template 3: Beauty/Health Store

**Target**: Cosmetics, skincare, wellness
**Style**: Elegant, influencer-focused
**File**: `components/Home/sections/template3/*`

#### Available Sections

##### 1. HeroBanner
```typescript
type HeroBannerData = {
  headline: LocalizedText;
  subheadline?: LocalizedText;
  backgroundImage: string;
  mobileBackgroundImage?: string;  // Responsive image
  cta?: { label: LocalizedText; href: string };
  badge?: LocalizedText;
};
```

##### 2. ReviewsWall
```typescript
type ReviewsWallData = {
  title: LocalizedText;
  reviews: Array<{
    author: string;
    avatar?: string;  // Profile image URL
    rating: number;
    text: LocalizedText;
    verified: boolean;  // Verified purchase badge
    productName?: LocalizedText;
  }>;
};
```

##### 3. BundlePromo
```typescript
type BundlePromoData = {
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
    savings?: LocalizedText;  // "Save $50"
    href: string;
  }>;
};
```

##### 4. InfluencerHighlight
```typescript
type InfluencerHighlightData = {
  title: LocalizedText;
  videoUrl?: string;
  images: string[];
  influencer?: {
    name: string;
    handle: string;  // "@beautyguru"
    avatar?: string;
  };
  captions?: LocalizedText[];
  cta?: { label: LocalizedText; href: string };
};
```

##### 5. NewsletterBeauty
Same as `NewsletterData` (Template 2)

#### Template 3 Section Type Union
```typescript
export type Template3SectionInstance =
  | { type: "HeroBanner"; enabled: boolean; order: number; data: HeroBannerData }
  | { type: "CategoryGrid"; enabled: boolean; order: number; data: CategoryGridData }
  | { type: "ReviewsWall"; enabled: boolean; order: number; data: ReviewsWallData }
  | { type: "ProductRail"; enabled: boolean; order: number; data: ProductRailData }
  | { type: "BundlePromo"; enabled: boolean; order: number; data: BundlePromoData }
  | { type: "InfluencerHighlight"; enabled: boolean; order: number; data: InfluencerHighlightData }
  | { type: "NewsletterBeauty"; enabled: boolean; order: number; data: NewsletterData };

export type Template3Homepage = {
  templateId: 3;
  sections: Template3SectionInstance[];
};
```

---

### Template 4: Casual Ecommerce

**Target**: General retail, multi-category stores
**Style**: Flexible, banner-heavy, commerce-first
**File**: `components/Home/sections/template4/*`

#### Available Sections

##### 1. HeroCategoryGrid
```typescript
type HeroCategoryGridData = {
  headline: LocalizedText;
  subheadline?: LocalizedText;
  description?: LocalizedText;
  badge?: LocalizedText;
  backgroundImage?: string;
  primaryCta?: { label: LocalizedText; href: string };
  stats?: Array<{
    value: string;       // "10,000+"
    label: LocalizedText;  // "Products"
  }>;
  features?: Array<LocalizedText>;  // Checkmark features
};
```

##### 2. CommercialBanner
```typescript
type CommercialBannerData = {
  imageUrl: string;
  mobileImageUrl?: string;
  href: string;          // Click destination
  alt: LocalizedText;    // Image alt text
  badge?: LocalizedText; // "🔥 New"
};
```

##### 3. CategoryCarousel
```typescript
type CategoryCarouselData = {
  title: LocalizedText;
  categories: Array<{
    name: LocalizedText;
    imageUrl: string;
    href: string;
    productCount?: number;
  }>;
};
```

#### Template 4 Section Type Union
```typescript
export type Template4SectionInstance =
  | { type: "HeroCategoryGrid"; enabled: boolean; order: number; data: HeroCategoryGridData }
  | { type: "CommercialBanner"; enabled: boolean; order: number; data: CommercialBannerData }
  | { type: "BrandStrip"; enabled: boolean; order: number; data: BrandStripData }
  | { type: "CategoryCarousel"; enabled: boolean; order: number; data: CategoryCarouselData }
  | { type: "ProductRail"; enabled: boolean; order: number; data: ProductRailData };

export type Template4Homepage = {
  templateId: 4;
  sections: Template4SectionInstance[];
};
```

---

## API Endpoints

### Current Endpoints (Backend Integration)

#### 1. Get Tenant Settings (Simple Key-Value)
```
GET /api/admin/tenants/get-settings?domain={domain}
```

**Purpose**: Fetch simple string settings from backend
**Backend**: `GET ${NEXT_PUBLIC_API_URL}Tenant/get-tenant-settings/{domain}`
**Response**:
```json
{
  "success": true,
  "settings": {
    "brandName": "My Shop",
    "contactEmail": "support@example.com",
    "maintenanceMode": "false"
  }
}
```

**Limitation**: Only supports flat string key-value pairs, not complex TenantConfig

#### 2. Update Tenant Settings
```
POST /api/admin/tenants/update-settings/{domain}
```

**Body**:
```json
{
  "brandName": "Updated Shop Name",
  "contactEmail": "new@example.com"
}
```

**Backend**: `POST ${NEXT_PUBLIC_API_URL}Tenant/update-tenant-settings/{domain}`
**Limitation**: Cannot store nested theme objects or section arrays

---

### Required New Endpoints (For Full TenantConfig)

#### 1. Get Full Tenant Configuration
```
GET /api/tenant-config?host={domain}
```

**Purpose**: Fetch complete TenantConfig JSON from database
**Implementation Needed**:
```typescript
// app/api/tenant-config/route.ts
export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host");

  // Query database
  const config = await db.tenantConfigs.findByDomain(host);

  if (!config) {
    return NextResponse.json(DEFAULT_TENANT);
  }

  return NextResponse.json(config);
}
```

**Response**:
```json
{
  "templateId": 4,
  "themeColor": "#22c55e",
  "merchantType": "CUSTOM",
  "theme": {
    "mode": "dark",
    "brand": { "primary": "34 197 94", ... },
    "text": { "light": "30 41 59", ... },
    "fonts": { "primary": "Lato, sans-serif", ... }
  },
  "homepage": {
    "templateId": 4,
    "sections": [
      {
        "type": "HeroCategoryGrid",
        "enabled": true,
        "order": 1,
        "data": { ... }
      }
    ]
  }
}
```

#### 2. Update Full Tenant Configuration
```
POST /api/tenant-config
```

**Body**: Complete TenantConfig JSON
**Purpose**: Admin panel saves entire config to database
**Implementation Needed**:
```typescript
export async function POST(req: NextRequest) {
  const { domain, config } = await req.json();

  // Validate against TenantConfig type
  const validated = TenantConfigSchema.parse(config);

  // Save to database
  await db.tenantConfigs.upsert(domain, validated);

  return NextResponse.json({ success: true });
}
```

#### 3. Migration Endpoint
```
POST /api/admin/tenants/migrate-hardcoded
```

**Purpose**: One-time migration of hardcoded configs to database
**Implementation**:
```typescript
import { TENANTS } from "@/config/tenat";

export async function POST() {
  for (const [domain, config] of Object.entries(TENANTS)) {
    await db.tenantConfigs.insert(domain, config);
  }

  return NextResponse.json({
    success: true,
    migrated: Object.keys(TENANTS).length
  });
}
```

---

## Database Schema

### Option 1: Single JSON Column (Recommended for flexibility)

```sql
CREATE TABLE TenantConfigs (
  Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  Domain NVARCHAR(255) UNIQUE NOT NULL,
  Config NVARCHAR(MAX) NOT NULL,  -- JSON string
  CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
  UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),

  INDEX IX_TenantConfigs_Domain (Domain)
);
```

**Example Row**:
```sql
Domain: "localhost:3000"
Config: "{\"templateId\":4,\"themeColor\":\"#22c55e\",\"merchantType\":\"CUSTOM\",\"theme\":{...},\"homepage\":{...}}"
```

**Benefits**:
- Schema-less flexibility
- Easy to update without migrations
- Version control friendly (JSON diff)

**Querying**:
```csharp
// C# Backend
var config = await _context.TenantConfigs
    .Where(t => t.Domain == domain)
    .Select(t => t.Config)
    .FirstOrDefaultAsync();

return JsonSerializer.Deserialize<TenantConfig>(config);
```

---

### Option 2: Normalized Tables (Recommended for querying)

```sql
CREATE TABLE Tenants (
  Id UNIQUEIDENTIFIER PRIMARY KEY,
  Domain NVARCHAR(255) UNIQUE NOT NULL,
  TemplateId INT NOT NULL,
  ThemeColor NVARCHAR(7),  -- "#22c55e"
  MerchantType NVARCHAR(10),  -- "FINA" or "CUSTOM"
  CreatedAt DATETIME2,
  UpdatedAt DATETIME2
);

CREATE TABLE TenantThemes (
  Id UNIQUEIDENTIFIER PRIMARY KEY,
  TenantId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Tenants(Id),
  Mode NVARCHAR(10),  -- "light" or "dark"
  BrandPrimary NVARCHAR(20),
  BrandPrimaryDark NVARCHAR(20),
  BrandSurface NVARCHAR(20),
  BrandSurfaceDark NVARCHAR(20),
  -- ... all theme fields
  FontPrimary NVARCHAR(500),
  FontSecondary NVARCHAR(500),
  FontHeading NVARCHAR(500)
);

CREATE TABLE TenantSections (
  Id UNIQUEIDENTIFIER PRIMARY KEY,
  TenantId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Tenants(Id),
  Type NVARCHAR(50) NOT NULL,  -- "HeroWithSearch", "ProductRail", etc.
  Enabled BIT DEFAULT 1,
  OrderIndex INT NOT NULL,
  Data NVARCHAR(MAX) NOT NULL,  -- JSON string for section data

  INDEX IX_TenantSections_TenantId_Order (TenantId, OrderIndex)
);
```

**Benefits**:
- Easier filtering (e.g., find all tenants using Template 4)
- Relational integrity
- Better for analytics

**Drawbacks**:
- Schema changes require migrations
- More complex inserts/updates

---

## Implementation Guide

### Phase 1: Create API Layer

1. **Create tenant-config endpoint**
```typescript
// app/api/tenant-config/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTenantConfigFromDB } from "@/lib/database";
import { DEFAULT_TENANT } from "@/config/tenat";

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host");

  if (!host) {
    return NextResponse.json(DEFAULT_TENANT);
  }

  try {
    const config = await getTenantConfigFromDB(host);
    return NextResponse.json(config || DEFAULT_TENANT);
  } catch (error) {
    console.error("Failed to fetch tenant config:", error);
    return NextResponse.json(DEFAULT_TENANT);
  }
}
```

2. **Create database helper**
```typescript
// lib/database.ts
import { TenantConfig } from "@/types/tenant";

export async function getTenantConfigFromDB(domain: string): Promise<TenantConfig | null> {
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}Tenant/get-full-config/${domain}`;

  const response = await fetch(backendUrl, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });

  if (!response.ok) return null;

  return response.json();
}

export async function saveTenantConfigToDB(domain: string, config: TenantConfig): Promise<boolean> {
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}Tenant/save-full-config/${domain}`;

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "MAIN": "1"
    },
    body: JSON.stringify(config)
  });

  return response.ok;
}
```

### Phase 2: Enable Dynamic Loading

1. **Update TenantContext**
```typescript
// app/context/tenantContext.tsx (lines 76-86)
// UNCOMMENT THIS BLOCK:
try {
  const host = window.location.host;
  const res = await fetch(`/api/tenant-config?host=${encodeURIComponent(host)}`, {
    cache: "no-store"
  });
  if (res.ok) {
    const fresh = (await res.json()) as TenantConfig;
    if (mounted.current) setConfig(fresh);
  }
} catch (error) {
  console.error("Failed to load tenant config:", error);
}
finally {
  if (mounted.current) setIsLoading(false);
}
```

2. **Update server-side fetching**
```typescript
// app/[lang]/layout.tsx
import { getTenantConfigFromDB } from "@/lib/database";
import { DEFAULT_TENANT } from "@/config/tenat";

export default async function RootLayout({ children }) {
  const host = headers().get("host") || "localhost:3000";
  const tenant = await getTenantConfigFromDB(host) || DEFAULT_TENANT;

  return (
    <html>
      <body>
        <TenantProvider initialConfig={tenant}>
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}
```

### Phase 3: Backend Implementation (C# Example)

1. **Add Entity Models**
```csharp
// Models/TenantConfig.cs
public class TenantConfigEntity
{
    public Guid Id { get; set; }
    public string Domain { get; set; } = string.Empty;
    public string ConfigJson { get; set; } = string.Empty;  // Stores entire TenantConfig as JSON
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

2. **Add Controller Endpoint**
```csharp
// Controllers/TenantController.cs
[ApiController]
[Route("api/[controller]")]
public class TenantController : ControllerBase
{
    private readonly AppDbContext _context;

    [HttpGet("get-full-config/{domain}")]
    public async Task<IActionResult> GetFullConfig(string domain)
    {
        var entity = await _context.TenantConfigs
            .FirstOrDefaultAsync(t => t.Domain == domain);

        if (entity == null)
        {
            return NotFound();
        }

        return Content(entity.ConfigJson, "application/json");
    }

    [HttpPost("save-full-config/{domain}")]
    public async Task<IActionResult> SaveFullConfig(string domain, [FromBody] JsonElement config)
    {
        var json = config.GetRawText();

        var entity = await _context.TenantConfigs
            .FirstOrDefaultAsync(t => t.Domain == domain);

        if (entity == null)
        {
            entity = new TenantConfigEntity
            {
                Id = Guid.NewGuid(),
                Domain = domain,
                ConfigJson = json,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.TenantConfigs.Add(entity);
        }
        else
        {
            entity.ConfigJson = json;
            entity.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }
}
```

### Phase 4: Migration Script

```typescript
// scripts/migrate-tenants.ts
import { TENANTS } from "@/config/tenat";

async function migrateTenants() {
  for (const [domain, config] of Object.entries(TENANTS)) {
    console.log(`Migrating ${domain}...`);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}Tenant/save-full-config/${domain}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "MAIN": "1"
        },
        body: JSON.stringify(config)
      }
    );

    if (response.ok) {
      console.log(`✓ ${domain} migrated`);
    } else {
      console.error(`✗ ${domain} failed:`, await response.text());
    }
  }
}

migrateTenants();
```

---

## Admin Panel Integration

### Section Editor Component
```typescript
// components/admin/tenant/section-content-editor.tsx
import { useState } from "react";
import { Template4SectionInstance } from "@/types/tenant";

export function SectionEditor({
  section,
  onChange
}: {
  section: Template4SectionInstance;
  onChange: (updated: Template4SectionInstance) => void;
}) {
  const [enabled, setEnabled] = useState(section.enabled);

  // Type-safe editing based on section.type
  if (section.type === "HeroCategoryGrid") {
    return (
      <div>
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => {
              const updated = { ...section, enabled: e.target.checked };
              setEnabled(e.target.checked);
              onChange(updated);
            }}
          />
          Enable Section
        </label>

        <input
          value={section.data.headline.en}
          onChange={(e) => {
            onChange({
              ...section,
              data: {
                ...section.data,
                headline: {
                  ...section.data.headline,
                  en: e.target.value
                }
              }
            });
          }}
        />
      </div>
    );
  }

  // ... other section types
}
```

### Save Flow
```typescript
async function saveTenantConfig(domain: string, config: TenantConfig) {
  const response = await fetch(`/api/tenant-config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain, config })
  });

  if (response.ok) {
    // Trigger refresh in TenantContext
    await tenantContext.refresh();
    toast.success("Configuration updated!");
  }
}
```

---

## Testing Strategy

### 1. Type Validation
```typescript
import { TenantConfig } from "@/types/tenant";
import { z } from "zod";

const TenantConfigSchema = z.discriminatedUnion("templateId", [
  z.object({
    templateId: z.literal(1),
    themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    theme: ThemeVarsSchema,
    homepage: Template1HomepageSchema,
    merchantType: z.enum(["FINA", "CUSTOM"]).optional()
  }),
  // ... other templates
]);

export function validateTenantConfig(config: unknown): TenantConfig {
  return TenantConfigSchema.parse(config);
}
```

### 2. Unit Tests
```typescript
describe("getTenantByHost", () => {
  it("returns correct config for known domain", async () => {
    const config = await getTenantConfigFromDB("localhost:3000");
    expect(config?.templateId).toBe(4);
  });

  it("returns default for unknown domain", async () => {
    const config = await getTenantConfigFromDB("unknown.com");
    expect(config).toEqual(DEFAULT_TENANT);
  });
});
```

### 3. Integration Tests
```typescript
describe("Tenant Config API", () => {
  it("fetches and applies theme correctly", async () => {
    const response = await fetch("/api/tenant-config?host=localhost:3000");
    const config = await response.json();

    applyThemeOnDocument(config.theme);

    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-brand-primary");

    expect(primaryColor).toBe("rgb(34 197 94)");
  });
});
```

---

## Common Pitfalls & Solutions

### 1. Type Safety Issues
**Problem**: Section data doesn't match component expectations
**Solution**: Use discriminated unions and TypeScript's narrowing
```typescript
function renderSection(section: Template4SectionInstance) {
  switch (section.type) {
    case "HeroCategoryGrid":
      // TypeScript knows section.data is HeroCategoryGridData
      return <HeroCategoryGrid data={section.data} />;
    case "ProductRail":
      // TypeScript knows section.data is ProductRailData
      return <ProductRail data={section.data} />;
  }
}
```

### 2. Cache Invalidation
**Problem**: Updated config doesn't reflect immediately
**Solution**: Implement cache-busting and refresh mechanism
```typescript
// Add version to cache key
const CACHE_KEY = `tenantConfig_v${Date.now()}`;

// Force refresh on admin save
await fetch("/api/tenant-config?host=example.com", {
  cache: "reload",
  headers: { "Cache-Control": "no-cache" }
});
```

### 3. Large Config Size
**Problem**: 887-line config files are slow to parse
**Solution**:
- Lazy load sections
- Compress JSON in database
- Use CDN caching
```typescript
// Lazy section loading
const HeroComponent = lazy(() => import(`./sections/${section.type}`));
```

### 4. Multi-Language Fallbacks
**Problem**: Missing translations break UI
**Solution**: Add fallback logic
```typescript
function getLocalizedText(text: LocalizedText, locale: Locale): string {
  return text[locale] || text.en || Object.values(text)[0] || "";
}
```

---

## Performance Optimization

### 1. Server-Side Caching
```typescript
import { unstable_cache } from "next/cache";

export const getCachedTenantConfig = unstable_cache(
  async (host: string) => {
    return getTenantConfigFromDB(host);
  },
  ["tenant-config"],
  { revalidate: 60 } // Cache for 60 seconds
);
```

### 2. Client-Side Memoization
```typescript
const memoizedTheme = useMemo(() => {
  return applyThemeTransforms(tenant.theme);
}, [tenant.theme]);
```

### 3. Section Virtualization
```typescript
// For long section lists
import { useVirtualizer } from "@tanstack/react-virtual";

const virtualizer = useVirtualizer({
  count: sections.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 400, // Average section height
});
```

---

## Future Enhancements

1. **Version Control**: Store config history for rollback
2. **A/B Testing**: Support multiple config variants per tenant
3. **Preview Mode**: Test changes before publishing
4. **Import/Export**: JSON/YAML config file support
5. **Template Marketplace**: Pre-built section combinations
6. **Analytics Integration**: Track section performance
7. **AI-Powered Suggestions**: Recommend optimal layouts

---

## Quick Reference

### File Structure
```
types/tenant.ts           → Type definitions
config/tenat.ts           → Hardcoded configs (to be migrated)
lib/getTenantByHost.ts    → Tenant resolution logic
lib/database.ts           → Database access layer
app/context/tenantContext.tsx → Client-side state management
app/api/tenant-config/    → API endpoints
components/Home/sections/ → Section implementations
```

### Key Functions
- `getTenantByHost(domain)` → Fetch tenant config
- `applyThemeOnDocument(theme)` → Apply CSS variables
- `useTenant()` → React hook for accessing config
- `validateTenantConfig(json)` → Type validation

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.backend.com/
```

---

## Support & Troubleshooting

### Debug Mode
Enable detailed logging:
```typescript
// app/context/tenantContext.tsx
const DEBUG = process.env.NODE_ENV === "development";

if (DEBUG) {
  console.log("Tenant Config:", config);
  console.log("Applied Theme:", config.theme);
}
```

### Common Errors

**Error**: `Cannot read property 'homepage' of null`
**Cause**: Tenant config failed to load
**Fix**: Check API endpoint, verify domain exists in database

**Error**: `Type 'ProductRailData' is not assignable to type 'HeroData'`
**Cause**: Section type mismatch
**Fix**: Ensure section.type matches section.data structure

**Error**: `localStorage is not defined`
**Cause**: SSR trying to access browser API
**Fix**: Wrap in `typeof window !== "undefined"` check

---

## Glossary

- **Tenant**: Isolated customer instance with unique domain
- **Template**: Pre-designed homepage layout blueprint
- **Section**: Modular UI component (Hero, ProductRail, etc.)
- **LocalizedText**: Object with `ka` (Georgian) and `en` (English) keys
- **ThemeVars**: CSS variable definitions for colors/fonts
- **Discriminated Union**: TypeScript pattern for type-safe polymorphism
- **SSR**: Server-Side Rendering (Next.js initial page load)
- **Hydration**: Client-side React activation after SSR

---

**Document Version**: 1.0
**Last Updated**: 2025-01-16
**Maintainer**: Development Team
