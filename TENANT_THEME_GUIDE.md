# Tenant Theme System Guide

## Overview

This project uses a comprehensive tenant-based theming system that allows each tenant to customize colors, fonts, and visual styles across the entire website (except admin pages).

## Available Theme Variables

### 1. Brand Colors

All tenant brand colors are available as CSS variables and Tailwind classes:

```typescript
brand: {
  primary: string;        // Main brand color
  primaryDark: string;    // Dark mode variant of primary
  surface: string;        // Background surface color
  surfaceDark: string;    // Dark mode surface
  muted: string;          // Muted/subtle backgrounds
  mutedDark: string;      // Dark mode muted
  accent?: string;        // Optional accent color
}
```

#### Usage in Components:

**CSS Variables:**
```css
background-color: rgb(var(--brand-primary));
background-color: rgb(var(--brand-surface));
```

**Tailwind Classes:**
```jsx
<div className="bg-brand-primary text-white">
<div className="bg-brand-surface dark:bg-brand-surfacedark">
<div className="bg-brand-muted dark:bg-brand-muteddark">
<div className="border-brand-primary">
```

**With Opacity:**
```jsx
<div className="bg-brand-primary/10">  {/* 10% opacity */}
<div className="bg-brand-primary/50">  {/* 50% opacity */}
```

**Predefined Opacity Variants:**
```jsx
<div className="bg-brand-50">   {/* 5% opacity */}
<div className="bg-brand-100">  {/* 10% opacity */}
<div className="bg-brand-200">  {/* 20% opacity */}
...
<div className="bg-brand-900">  {/* 90% opacity */}
```

### 2. Text Colors

```typescript
text: {
  light: string;          // Primary text color (light mode)
  subtle: string;         // Secondary/muted text (light mode)
  lightDark: string;      // Primary text color (dark mode)
  subtleDark: string;     // Secondary/muted text (dark mode)
}
```

#### Usage:

**Tailwind Classes:**
```jsx
<p className="text-text-light dark:text-text-lightdark">
<span className="text-text-subtle dark:text-text-subtledark">
```

### 3. Fonts

```typescript
globalFont?: string;    // Applied to entire website
fonts?: {
  primary?: string;     // Body text
  secondary?: string;   // Code/monospace
  heading?: string;     // Headings (h1-h6)
}
```

#### Usage:

**CSS Variables:**
```css
font-family: var(--font-primary);
font-family: var(--font-heading);
font-family: var(--font-secondary);
```

**Tailwind Classes:**
```jsx
<div className="font-sans">      {/* Uses --font-primary */}
<div className="font-primary">   {/* Explicit primary font */}
<h1 className="font-heading">    {/* Heading font */}
<code className="font-mono">     {/* Uses --font-secondary */}
```

**Note:** If `globalFont` is set, it applies to ALL fonts (primary, heading, secondary) unless specifically overridden.

## Best Practices

### ✅ DO USE Tenant Variables

```jsx
// ✅ Good - Uses tenant brand color
<button className="bg-brand-primary text-white hover:bg-brand-primary/90">
  Click Me
</button>

// ✅ Good - Responsive to dark mode
<div className="bg-brand-surface dark:bg-brand-surfacedark">
  <p className="text-text-light dark:text-text-lightdark">Content</p>
</div>

// ✅ Good - Uses brand colors with opacity
<div className="border border-brand-primary/20 bg-brand-primary/5">
  Subtle branded box
</div>
```

### ❌ DON'T USE Hardcoded Colors

```jsx
// ❌ Bad - Hardcoded Tailwind colors
<div className="bg-blue-500 text-gray-900">
  Don't do this!
</div>

// ❌ Bad - Hardcoded hex colors
<div style={{ backgroundColor: '#3b82f6' }}>
  Don't do this!
</div>

// ❌ Bad - Not respecting dark mode
<div className="bg-white text-black">
  Missing dark mode support
</div>
```

### Exceptions

Hardcoded colors are acceptable for:
1. **Admin pages** (inside `/admin/` routes)
2. **Semantic colors** (red for errors, green for success)
3. **Fixed UI elements** (like shadows, borders that don't need branding)

```jsx
// ✅ Acceptable - Semantic colors
<div className="text-red-500">Error message</div>
<div className="text-green-500">Success message</div>

// ✅ Acceptable - Neutral borders/shadows
<div className="border border-gray-200 shadow-sm">
```

## Component Examples

### Example 1: Product Card

```tsx
export function ProductCard({ product }: Props) {
  return (
    <div className="bg-brand-surface dark:bg-brand-surfacedark rounded-lg border border-brand-primary/10">
      <img src={product.image} alt={product.name} />
      <div className="p-4">
        <h3 className="font-heading text-text-light dark:text-text-lightdark">
          {product.name}
        </h3>
        <p className="text-text-subtle dark:text-text-subtledark">
          {product.description}
        </p>
        <button className="bg-brand-primary text-white hover:bg-brand-primary/90">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
```

### Example 2: Navigation

```tsx
export function Navigation() {
  return (
    <nav className="bg-brand-surface dark:bg-brand-surfacedark border-b border-brand-primary/10">
      <div className="container mx-auto">
        <ul className="flex gap-4">
          <li>
            <a
              href="/"
              className="text-text-light dark:text-text-lightdark hover:text-brand-primary"
            >
              Home
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
```

### Example 3: Button Component

```tsx
export function Button({ children, variant = 'primary' }: Props) {
  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary/90',
    secondary: 'bg-brand-muted dark:bg-brand-muteddark text-text-light dark:text-text-lightdark',
    outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/10',
  };

  return (
    <button className={cn('px-4 py-2 rounded-lg font-primary', variants[variant])}>
      {children}
    </button>
  );
}
```

## Current Implementation Status

### ✅ Already Using Tenant Variables

The following are already implemented:
- **Tailwind Config** (`tailwind.config.js`): All brand colors, text colors, and fonts configured
- **Global CSS** (`styles/globals.css`): Font variables applied to all elements
- **Theme Application** (`lib/applyTheme.ts`): Converts tenant theme to CSS variables
- **Root Layout** (`app/[lang]/layout.tsx`): Applies theme variables to `<html>` tag

### 📋 How It Works

1. **Tenant Configuration**: Each tenant has a `theme` object in their config
2. **Server-Side**: `getTenantByHost()` loads tenant config based on domain
3. **Theme Conversion**: `themeToStyle()` converts theme to CSS variables
4. **HTML Injection**: Variables injected into `<html>` style attribute
5. **Tailwind Classes**: Use `bg-brand-primary`, `text-text-light`, etc.
6. **Dark Mode**: Automatically handled with `dark:` prefix

## Migration Guide

If you find components using hardcoded colors (except admin), update them:

### Before:
```jsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <button className="bg-blue-500 text-white">Click</button>
</div>
```

### After:
```jsx
<div className="bg-brand-surface dark:bg-brand-surfacedark text-text-light dark:text-text-lightdark">
  <button className="bg-brand-primary text-white">Click</button>
</div>
```

## Testing

To test theme variables:

1. **Check CSS Variables**: Open DevTools → Elements → Inspect `<html>` tag → Styles
2. **Verify in Browser**: Look for `--brand-primary`, `--font-primary`, etc.
3. **Test Dark Mode**: Toggle dark mode to ensure colors switch properly
4. **Multi-Tenant**: Test different domains to see different themes

## Common Patterns

### Cards
```jsx
className="bg-brand-surface dark:bg-brand-surfacedark border border-brand-primary/10"
```

### Buttons (Primary)
```jsx
className="bg-brand-primary text-white hover:bg-brand-primary/90"
```

### Buttons (Secondary)
```jsx
className="bg-brand-muted dark:bg-brand-muteddark text-text-light dark:text-text-lightdark"
```

### Text Headings
```jsx
className="font-heading text-text-light dark:text-text-lightdark"
```

### Text Body
```jsx
className="font-primary text-text-light dark:text-text-lightdark"
```

### Text Muted/Secondary
```jsx
className="text-text-subtle dark:text-text-subtledark"
```

### Borders
```jsx
className="border border-brand-primary/20"
```

### Backgrounds with Opacity
```jsx
className="bg-brand-primary/5"  // Very subtle
className="bg-brand-primary/10" // Subtle
className="bg-brand-primary/20" // Light
```

## FAQ

**Q: Can I use `bg-white` or `bg-gray-100`?**
A: Only in admin pages or for truly neutral elements. For customer-facing pages, use `bg-brand-surface`.

**Q: How do I add opacity to brand colors?**
A: Use `/` syntax: `bg-brand-primary/50` or use predefined `bg-brand-500`.

**Q: What about semantic colors (errors, success)?**
A: Use standard colors: `text-red-500`, `text-green-500`, `text-yellow-500`.

**Q: How do I test with different tenant themes?**
A: Update the tenant config and reload. The theme variables will automatically update.

**Q: Do I need to import anything?**
A: No! The CSS variables are globally available. Just use the Tailwind classes.

## Summary

**For all non-admin components:**
- Use `bg-brand-*` for backgrounds
- Use `text-text-*` for text colors
- Use `font-primary` or `font-heading` for fonts
- Always include dark mode variants with `dark:`
- Never hardcode colors with `bg-blue-500` or hex values
