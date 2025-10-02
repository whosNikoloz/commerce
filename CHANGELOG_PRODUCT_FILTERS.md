# Product Rail Filter System - Migration Changelog

## Summary
Migrated from hardcoded category-based product rails to a flexible, filter-based system that supports all product model properties.

## Changes Made

### 1. Type Definitions (`types/tenant.ts`)
**Old Structure:**
```typescript
export type ProductRailData = {
  title: LocalizedText;
  subtitle?: LocalizedText;
  category: string;  // ❌ Hardcoded category string
  limit: number;
  viewAllHref: string;
};
```

**New Structure:**
```typescript
export type ProductRailData = {
  title: LocalizedText;
  subtitle?: LocalizedText;
  limit: number;
  viewAllHref: string;
  filterBy?: {
    categoryName?: string;
    brandIds?: string[];
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

### 2. Component Architecture

#### Created Generic Component (`components/Home/sections/ui/ProductRail.tsx`)
- Single reusable component for all product rails
- Dynamically builds filters from `data.filterBy`
- Supports all product properties:
  - Category filtering
  - Brand filtering
  - Product flags (isNewArrival, isLiquidated, isComingSoon)
  - Price ranges
  - Discount filtering
- Context-aware empty messages

#### Updated Template Components
All specific product rails now simply wrap the generic component:
- `ProductRailLaptops` → wrapper with custom className
- `ProductRailPhones` → wrapper with custom className
- `ProductRailNewArrivals` → wrapper with custom className
- `ProductRailBestSofas` → wrapper with custom className
- `ProductRailBestRated` → wrapper with custom className

### 3. Validation Schema (`lib/templates.tsx`)
Updated Zod schema to match new type structure:
```typescript
const ProductRailDataSchema = z.object({
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  limit: z.number(),
  viewAllHref: z.string(),
  filterBy: z.object({
    categoryName: z.string().optional(),
    brandIds: z.array(z.string()).optional(),
    isNewArrival: z.boolean().optional(),
    isLiquidated: z.boolean().optional(),
    isComingSoon: z.boolean().optional(),
    hasDiscount: z.boolean().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
  }).optional(),
  sortBy: z.enum(["featured", "newest", "price-low", "price-high", "rating", "name"]).optional(),
});
```

### 4. Tenant Configuration (`config/tenat.ts`)
Updated all three tenant configs to use new filter structure.

**Example - Before:**
```json
{
  "type": "ProductRailLaptops",
  "data": {
    "title": { "en": "Laptops" },
    "category": "laptops",
    "limit": 4,
    "viewAllHref": "/category/laptops"
  }
}
```

**Example - After:**
```json
{
  "type": "ProductRailLaptops",
  "data": {
    "title": { "en": "Laptops" },
    "limit": 4,
    "viewAllHref": "/category/laptops",
    "filterBy": {
      "categoryName": "Laptops"
    },
    "sortBy": "featured"
  }
}
```

### 5. Admin UI (`components/admin/tenant/section-content-editor.tsx`)
Enhanced the ProductRail editor with comprehensive filter controls:
- Category name input
- Checkboxes for product flags:
  - New Arrivals
  - Liquidated
  - Coming Soon
  - Has Discount
- Min/Max price inputs
- Sort by dropdown
- All filters are optional and can be combined

## Migration Guide

### For Existing Tenants
Replace:
```json
"category": "laptops"
```

With:
```json
"filterBy": {
  "categoryName": "Laptops"
},
"sortBy": "featured"
```

### Common Use Cases

#### 1. Category-based Rail
```json
{
  "filterBy": {
    "categoryName": "Smartphones"
  }
}
```

#### 2. New Arrivals
```json
{
  "filterBy": {
    "isNewArrival": true
  },
  "sortBy": "newest"
}
```

#### 3. Clearance Sale
```json
{
  "filterBy": {
    "isLiquidated": true,
    "hasDiscount": true
  },
  "sortBy": "price-low"
}
```

#### 4. Coming Soon Items
```json
{
  "filterBy": {
    "isComingSoon": true
  },
  "sortBy": "newest"
}
```

#### 5. Budget Products
```json
{
  "filterBy": {
    "categoryName": "Laptops",
    "maxPrice": 500
  },
  "sortBy": "price-low"
}
```

#### 6. Premium Deals
```json
{
  "filterBy": {
    "hasDiscount": true,
    "minPrice": 1000
  },
  "sortBy": "price-high"
}
```

## Files Modified

1. ✅ `types/tenant.ts` - Updated ProductRailData type
2. ✅ `components/Home/sections/ui/ProductRail.tsx` - NEW generic component
3. ✅ `components/Home/sections/template1/ProductRailLaptops.tsx` - Simplified to wrapper
4. ✅ `components/Home/sections/template1/ProductRailPhones.tsx` - Simplified to wrapper
5. ✅ `components/Home/sections/template2/ProductRailNewArrivals.tsx` - Simplified to wrapper
6. ✅ `components/Home/sections/template2/ProductRailBestSofas.tsx` - Simplified to wrapper
7. ✅ `components/Home/sections/template3/ProductRailBestRated.tsx` - Simplified to wrapper
8. ✅ `lib/templates.tsx` - Updated schema validation
9. ✅ `config/tenat.ts` - Updated all tenant configs
10. ✅ `components/admin/tenant/section-content-editor.tsx` - Enhanced UI editor

## Documentation Created

- `docs/PRODUCT_RAIL_FILTERS.md` - Complete guide with examples

## Benefits

1. ✅ **Flexible**: No longer tied to specific categories
2. ✅ **Product-model aligned**: Uses actual product properties from your API
3. ✅ **Combinable**: Mix and match multiple filters
4. ✅ **Template-agnostic**: Same system works for all templates
5. ✅ **Type-safe**: Full TypeScript support with validation
6. ✅ **Admin-friendly**: Easy-to-use UI in tenant editor

## Testing Checklist

- [ ] Test category filtering (e.g., "Laptops", "Phones")
- [ ] Test new arrivals filter
- [ ] Test liquidated items filter
- [ ] Test coming soon filter
- [ ] Test discount filter
- [ ] Test price range filters
- [ ] Test sort options
- [ ] Test combined filters
- [ ] Verify admin editor works
- [ ] Check all three templates
