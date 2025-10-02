# Product Rail Filter Configuration

The `ProductRailData` type now supports flexible filtering based on your actual `FilterModel` structure.

## Available Filter Options

### Filter By Product Properties

```typescript
filterBy?: {
  categoryIds?: string[];      // Filter by category IDs
  brandIds?: string[];         // Filter by brand IDs
  condition?: number[];        // Filter by Condition enum (0=New, 1=Used, 2=LikeNew)
  stockStatus?: number;        // Filter by StockStatus enum (0=InStock, 1=OutOfStock)
  isNewArrival?: boolean;      // Filter for new arrivals
  isLiquidated?: boolean;      // Filter for liquidated items
  isComingSoon?: boolean;      // Filter for coming soon items
  hasDiscount?: boolean;       // Filter for items with discount
  minPrice?: number;           // Minimum price filter
  maxPrice?: number;           // Maximum price filter
}
```

**Note:** All filters match the `FilterModel` structure from `types/filter.ts` for consistency with your API.

### Enum Values Reference

From `types/enums.ts`:

**Condition Enum:**
- `0` = New
- `1` = Used
- `2` = LikeNew

**StockStatus Enum:**
- `0` = InStock
- `1` = OutOfStock

### Sort Options

```typescript
sortBy?: "featured" | "newest" | "price-low" | "price-high" | "rating" | "name"
```

## Example Configurations

### Template 1: Electronics Store

```json
{
  "templateId": 1,
  "sections": [
    {
      "type": "ProductRailLaptops",
      "enabled": true,
      "order": 4,
      "data": {
        "title": { "ka": "ლეპტოპები", "en": "Laptops" },
        "subtitle": { "ka": "საუკეთესო შეთავაზებები", "en": "Best Deals" },
        "limit": 8,
        "viewAllHref": "/search?category=laptops",
        "filterBy": {
          "categoryIds": ["laptop-category-uuid"]
        },
        "sortBy": "featured"
      }
    },
    {
      "type": "ProductRailPhones",
      "enabled": true,
      "order": 5,
      "data": {
        "title": { "ka": "ახალი ტელეფონები", "en": "New Phones" },
        "limit": 8,
        "viewAllHref": "/search?category=phones",
        "filterBy": {
          "categoryIds": ["phone-category-uuid"],
          "isNewArrival": true
        },
        "sortBy": "newest"
      }
    }
  ]
}
```

### Template 2: Furniture Store

```json
{
  "type": "ProductRailNewArrivals",
  "enabled": true,
  "order": 3,
  "data": {
    "title": { "ka": "ახალი პროდუქტები", "en": "New Arrivals" },
    "limit": 8,
    "viewAllHref": "/search?new=true",
    "filterBy": {
      "isNewArrival": true
    },
    "sortBy": "newest"
  }
}
```

```json
{
  "type": "ProductRailBestSofas",
  "enabled": true,
  "order": 4,
  "data": {
    "title": { "ka": "საუკეთესო სოფები", "en": "Best Sofas" },
    "limit": 8,
    "viewAllHref": "/search?category=sofas",
    "filterBy": {
      "categoryIds": ["sofa-category-uuid"]
    },
    "sortBy": "rating"
  }
}
```

### Template 3: Beauty Store

```json
{
  "type": "ProductRailBestRated",
  "enabled": true,
  "order": 3,
  "data": {
    "title": { "ka": "ყველაზე რეიტინგული", "en": "Best Rated" },
    "subtitle": { "ka": "კლიენტების ფავორიტები", "en": "Customer Favorites" },
    "limit": 8,
    "viewAllHref": "/search?sort=rating",
    "sortBy": "rating"
  }
}
```

## Advanced Examples

### Liquidated Sale Items

```json
{
  "type": "ProductRailPhones",
  "enabled": true,
  "order": 6,
  "data": {
    "title": { "ka": "ლიკვიდაცია", "en": "Clearance Sale" },
    "subtitle": { "ka": "დიდი ფასდაკლებები", "en": "Huge Discounts" },
    "limit": 12,
    "viewAllHref": "/search?liquidated=true",
    "filterBy": {
      "isLiquidated": true,
      "hasDiscount": true
    },
    "sortBy": "price-low"
  }
}
```

### Coming Soon Products

```json
{
  "type": "ProductRailLaptops",
  "enabled": true,
  "order": 7,
  "data": {
    "title": { "ka": "მალე", "en": "Coming Soon" },
    "subtitle": { "ka": "წინასწარი შეკვეთა", "en": "Pre-order Now" },
    "limit": 4,
    "viewAllHref": "/search?coming-soon=true",
    "filterBy": {
      "isComingSoon": true
    },
    "sortBy": "newest"
  }
}
```

### Price Range Filter

```json
{
  "type": "ProductRailPhones",
  "enabled": true,
  "order": 8,
  "data": {
    "title": { "ka": "ბიუჯეტური სმარტფონები", "en": "Budget Smartphones" },
    "limit": 8,
    "viewAllHref": "/search?max-price=500",
    "filterBy": {
      "categoryIds": ["phone-category-uuid"],
      "maxPrice": 500
    },
    "sortBy": "price-low"
  }
}
```

### Combine Multiple Filters

```json
{
  "type": "ProductRailLaptops",
  "enabled": true,
  "order": 9,
  "data": {
    "title": { "ka": "პრემიუმ ლეპტოპები", "en": "Premium Laptops on Sale" },
    "limit": 6,
    "viewAllHref": "/search?category=laptops&discount=true",
    "filterBy": {
      "categoryIds": ["laptop-category-uuid"],
      "brandIds": ["apple-uuid", "dell-uuid"],
      "condition": [0],
      "hasDiscount": true,
      "minPrice": 1000
    },
    "sortBy": "price-high"
  }
}
```

### Stock Status Filter

```json
{
  "type": "ProductRailPhones",
  "enabled": true,
  "order": 10,
  "data": {
    "title": { "ka": "ხელმისაწვდომი ახლავე", "en": "Available Now" },
    "limit": 8,
    "viewAllHref": "/search?in-stock=true",
    "filterBy": {
      "stockStatus": 0,
      "condition": [0, 2]
    },
    "sortBy": "featured"
  }
}
```

**Explanation:**
- `condition: [0]` = Only New items
- `condition: [0, 2]` = New and LikeNew items
- `stockStatus: 0` = Only InStock items

## Migration Guide

### Old Configuration (Category String)

```json
{
  "category": "laptops",
  "limit": 8
}
```

### New Configuration (Filter Object with IDs)

```json
{
  "limit": 8,
  "filterBy": {
    "categoryIds": ["laptop-category-uuid"]
  }
}
```

**Important:** You must use actual category/brand IDs from your database, not names.

## How to Get Category/Brand IDs

To use ID-based filtering, you need to get the actual IDs from your database:

### Option 1: From Admin Panel
- Go to category/brand management in your admin panel
- Copy the UUID from the URL or database

### Option 2: From API Response
```javascript
// Fetch categories
const categories = await getAllCategories()
console.log(categories) // Shows: [{ id: "uuid-123", name: "Laptops", ... }]

// Use the ID in your config
"categoryIds": ["uuid-123"]
```

### Option 3: Database Query
```sql
SELECT id, name FROM categories WHERE name = 'Laptops';
SELECT id, name FROM brands WHERE name = 'Apple';
```

## Notes

- **All filters match `FilterModel`** from `types/filter.ts` for API consistency
- All filter options are optional - you can use any combination
- Server-side filters: `categoryIds`, `brandIds`, `condition`, `stockStatus`, `minPrice`, `maxPrice`
- Client-side filters: `isNewArrival`, `isLiquidated`, `isComingSoon`, `hasDiscount`
- The component fetches 2x the limit to allow for client-side filtering
- Empty results show contextual messages based on the filters applied
- **Use IDs, not names** - the system uses actual database IDs for filtering
- **Use enum numbers** - `condition` and `stockStatus` use enum values (numbers), not strings
  - Condition: 0=New, 1=Used, 2=LikeNew
  - StockStatus: 0=InStock, 1=OutOfStock
