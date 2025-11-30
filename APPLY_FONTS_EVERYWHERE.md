# Apply Tenant Fonts Everywhere - Complete Guide

## What We've Done So Far

✅ **ProductCard** - Added `font-heading` to titles, `font-primary` to prices and labels
✅ **ProductRail** - Added `font-heading` to section titles, `font-primary` to subtitles and links

## Font Class Rules

Use these font classes on ALL text elements (except admin pages):

### 1. **font-heading** - Use on:
- All `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>` tags
- Page titles
- Section headings
- Card titles
- Modal titles
- Any prominent heading text

### 2. **font-primary** - Use on:
- All `<p>` paragraphs
- All `<span>` text
- All `<div>` with text content
- Button text
- Link text
- Input labels
- Form labels
- Price displays
- Badge text
- Breadcrumb text
- Navigation links
- Footer text
- Any body text

### 3. **font-secondary** - Use on:
- `<code>` blocks
- `<pre>` blocks
- Technical/monospace text
- Developer tools
- JSON displays

## Batch Find & Replace Patterns

Use VS Code Find & Replace (Ctrl+Shift+H) with these patterns:

### Pattern 1: Add font-heading to h1-h6

**Find (Regex):**
```
<(h[1-6])\s+className="([^"]*?)(?<!font-heading)([^"]*)"
```

**Replace:**
```
<$1 className="font-heading $2$3"
```

**Files:** `components/**/*.tsx`
**Exclude:** `**/admin/**`

### Pattern 2: Add font-primary to paragraphs

**Find (Regex):**
```
<p\s+className="([^"]*?)(?<!font-primary)([^"]*)"
```

**Replace:**
```
<p className="font-primary $1$2"
```

**Files:** `components/**/*.tsx`
**Exclude:** `**/admin/**`

### Pattern 3: Add font-primary to spans

**Find (Regex):**
```
<span\s+className="([^"]*?)(?<!font-primary)([^"]*)"
```

**Replace:**
```
<span className="font-primary $1$2"
```

**Files:** `components/**/*.tsx`
**Exclude:** `**/admin/**`

## Manual Component Updates

For better control, manually update each component category:

### Navigation Components

Files to update:
- `components/Navbar/template1/NavbarTemplate1.tsx`
- `components/Categories/category-dropdown.tsx`
- `components/Categories/category-drawer.tsx`

Add to all text:
- Navigation links: `font-primary`
- Category names: `font-primary`
- Menu titles: `font-heading`

### Footer Components

Files to update:
- `components/footer.tsx`
- `components/new-footer.tsx`

Add to all text:
- Footer headings: `font-heading`
- Footer links: `font-primary`
- Copyright text: `font-primary`
- Company info: `font-primary`

### Cart Components

Files to update:
- `components/Cart/cart-drawer.tsx`
- `components/Cart/cart-dropdown.tsx`
- `components/Cart/CartPage/cart-page.tsx`
- `components/Cart/CartPage/CartHeader.tsx`
- `components/Cart/CartPage/CartItems.tsx`
- `components/Cart/CartPage/CartSummary.tsx`
- `components/Cart/CheckoutPage/checkout-page.tsx`
- `components/Cart/CheckoutPage/CheckoutForm.tsx`
- `components/Cart/CheckoutPage/OrderSummary.tsx`

Add to all text:
- Cart title: `font-heading`
- Product names: `font-primary`
- Prices: `font-primary`
- Quantity: `font-primary`
- Subtotal/Total labels: `font-primary`
- Button text: `font-primary`
- Form labels: `font-primary`

### Product Detail Page

Files to update:
- `components/Product/product-detail.tsx`
- `components/Product/product-info.tsx`
- `components/Product/product-info-bottom.tsx`

Add to all text:
- Product title: `font-heading`
- Description: `font-primary`
- Price: `font-primary`
- Specifications: `font-primary`
- Reviews: `font-primary`
- Tabs: `font-primary`

### Auth/Modal Components

Files to update:
- `components/AuthModal/login-modal.tsx`
- `components/AuthModal/register-modal.tsx`
- `components/AuthModal/forgot-password-modal.tsx`

Add to all text:
- Modal titles: `font-heading`
- Form labels: `font-primary`
- Input placeholders: (already inherit)
- Button text: `font-primary`
- Error messages: `font-primary`

### Search Components

Files to update:
- `components/Search/search-dropdown.tsx`
- `components/Search/search-for-mobile.tsx`

Add to all text:
- Search placeholder: (already inherits)
- Result titles: `font-primary`
- Categories: `font-primary`

### Category/Filter Components

Files to update:
- `components/Categories/CategoriesPage/ProductFilters.tsx`
- `components/Categories/SearchPage/SideBarCategories.tsx`

Add to all text:
- Filter headings: `font-heading`
- Filter labels: `font-primary`
- Filter values: `font-primary`

### Home Page Components

Files to update:
- `components/Home/sections/ui/CategoryCarousel.tsx`
- `components/Home/sections/ui/CommercialBanner.tsx`

Add to all text:
- Section titles: `font-heading`
- Category names: `font-primary`
- Banner text: `font-primary`

### UI Components

Files to update:
- `components/ui/Pagination.tsx`
- Any custom button components
- Any custom input components

Add to all text:
- Button labels: `font-primary`
- Pagination numbers: `font-primary`

## Quick Reference Table

| Element | Font Class | Example |
|---------|-----------|---------|
| `<h1>` - `<h6>` | `font-heading` | `<h1 className="font-heading text-2xl">` |
| `<p>` | `font-primary` | `<p className="font-primary text-sm">` |
| `<span>` | `font-primary` | `<span className="font-primary">` |
| `<button>` text | `font-primary` | `<button className="font-primary">` |
| `<a>` links | `font-primary` | `<a className="font-primary">` |
| `<label>` | `font-primary` | `<label className="font-primary">` |
| `<code>` | `font-secondary` | `<code className="font-secondary">` |

## Testing Checklist

After applying fonts, test these pages:

- [ ] Homepage
- [ ] Product listing page
- [ ] Product detail page
- [ ] Cart page
- [ ] Checkout page
- [ ] Search results
- [ ] Category pages
- [ ] User login/register
- [ ] Footer
- [ ] Navigation
- [ ] Mobile menu

## Verification

Check that fonts are applied correctly:

1. **Open DevTools** (F12)
2. **Inspect any text element**
3. **Check Computed styles**
4. **Look for font-family**:
   - Headings should show your `fonts.heading` value
   - Body text should show your `fonts.primary` value

## Common Mistakes to Avoid

❌ **DON'T** add font classes to:
- Admin components (`components/admin/**`)
- Empty `<div>` containers
- Icon components
- Image elements

❌ **DON'T** override with hardcoded fonts:
```tsx
// Bad
<p style={{ fontFamily: 'Arial' }}>Text</p>
```

✅ **DO** use tenant font classes:
```tsx
// Good
<p className="font-primary">Text</p>
```

## Priority Order

Update components in this order for best impact:

1. ✅ ProductCard (DONE)
2. ✅ ProductRail (DONE)
3. Navigation/Header
4. Footer
5. Product Detail Page
6. Cart/Checkout
7. Homepage sections
8. Auth modals
9. Search components
10. Filter components

## Automated Script (Optional)

If you want to automate this, create a script:

```bash
# Find all TSX files (excluding admin)
find components -name "*.tsx" -not -path "*/admin/*" | while read file; do
  # Add font-heading to h1-h6
  sed -i 's/<h\([1-6]\) className="\([^"]*\)"/<h\1 className="font-heading \2"/g' "$file"

  # Add font-primary to p
  sed -i 's/<p className="\([^"]*\)"/<p className="font-primary \1"/g' "$file"

  # Add font-primary to span
  sed -i 's/<span className="\([^"]*\)"/<span className="font-primary \1"/g' "$file"
done
```

**WARNING:** Always backup your files before running automated scripts!

## Final Notes

- This is a large task - do it incrementally
- Test after each major component update
- Use version control (git) to track changes
- Focus on customer-facing pages first
- Admin pages can keep their current fonts
