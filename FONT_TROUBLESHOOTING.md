# Font Troubleshooting Guide

## Your Configuration

You have set: `"globalFont": "Source Sans Pro"`

## How It Works Now

1. **Google Fonts Loading**: The layout automatically loads "Source Sans Pro" from Google Fonts
2. **CSS Variables**: Sets `--font-primary`, `--font-heading`, `--font-secondary` to "Source Sans Pro"
3. **Global Application**: All text on the website uses these CSS variables

## Verify It's Working

### Step 1: Check the HTML Source

1. Open your website in the browser
2. Right-click → "View Page Source"
3. Look for this in the `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

### Step 2: Check CSS Variables

1. Open DevTools (F12)
2. Go to "Elements" tab
3. Click on the `<html>` tag
4. Look at the "Styles" panel
5. You should see:

```css
html {
  --font-primary: Source Sans Pro, system-ui, -apple-system, sans-serif;
  --font-heading: Source Sans Pro, system-ui, -apple-system, sans-serif;
  --font-secondary: Source Sans Pro, system-ui, -apple-system, sans-serif;
}
```

### Step 3: Check Computed Font

1. Still in DevTools, inspect any text element (like a `<p>` or `<h1>`)
2. Go to "Computed" tab
3. Search for "font-family"
4. It should show: `"Source Sans Pro", system-ui, -apple-system, sans-serif`

### Step 4: Verify Font is Loaded

1. In DevTools, go to "Network" tab
2. Reload the page (Ctrl+R)
3. Filter by "Font" or search for "Source+Sans+Pro"
4. You should see the font files loaded from fonts.gstatic.com

## Common Issues & Solutions

### Issue 1: Font Not Loading

**Symptom**: Text still looks like system font

**Solutions**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Do a hard refresh (Ctrl+Shift+R)
3. Check internet connection
4. Verify the font name is spelled correctly

### Issue 2: Font Name Has Quotes

**Your config might be**:
```json
"globalFont": "'Source Sans Pro'"
```

**Should be**:
```json
"globalFont": "Source Sans Pro"
```

(No quotes around the font name in the JSON value)

### Issue 3: CSS Variables Not Applied

**Check**:
1. Open DevTools → Console
2. Look for any JavaScript errors
3. Make sure the page loaded completely

### Issue 4: Admin Pages Still Using Default Font

**This is expected!** Admin pages (`/admin/*`) are excluded from tenant theming and will use default fonts.

## Testing Different Fonts

Want to try different Google Fonts? Update your tenant config:

```json
{
  "theme": {
    "globalFont": "Roboto"
  }
}
```

```json
{
  "theme": {
    "globalFont": "Open Sans"
  }
}
```

```json
{
  "theme": {
    "globalFont": "Poppins"
  }
}
```

```json
{
  "theme": {
    "globalFont": "Inter"
  }
}
```

## Quick Test Component

Create this component to test if fonts are working:

```tsx
// components/FontTest.tsx
export function FontTest() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-4xl font-heading">
        This uses font-heading: {typeof window !== 'undefined' &&
          window.getComputedStyle(document.querySelector('h1')!).fontFamily}
      </h1>

      <p className="text-lg font-primary">
        This uses font-primary (should be Source Sans Pro)
      </p>

      <code className="font-mono">
        This uses font-mono
      </code>

      <div className="border p-4 bg-gray-100">
        <p className="text-xs">CSS Variable Test:</p>
        <pre className="text-xs">
          --font-primary: {typeof window !== 'undefined' &&
            getComputedStyle(document.documentElement).getPropertyValue('--font-primary')}
        </pre>
      </div>
    </div>
  );
}
```

Add it to any page:
```tsx
import { FontTest } from '@/components/FontTest';

export default function Page() {
  return (
    <div>
      <FontTest />
      {/* rest of your page */}
    </div>
  );
}
```

## Expected Behavior

After implementing the changes:

✅ **All text** on your website should use "Source Sans Pro"
✅ **Headings, paragraphs, buttons, inputs** - everything uses the global font
✅ **Dark mode** works the same way
✅ **Different tenants** can have different fonts

## Still Not Working?

If the font still doesn't show:

1. **Check the tenant configuration**:
   - Open your tenant config file
   - Verify `"globalFont": "Source Sans Pro"` is present
   - Check for typos

2. **Verify the server is restarted**:
   - Stop the dev server (Ctrl+C)
   - Start again: `npm run dev`
   - Tenant configs are loaded at build time

3. **Check browser compatibility**:
   - Try a different browser
   - Some browsers cache fonts aggressively

4. **Manual CSS Override (temporary test)**:
   Add this to `styles/globals.css`:
   ```css
   * {
     font-family: 'Source Sans Pro', sans-serif !important;
   }
   ```

   If this works, the font loading is fine, but CSS variables aren't being applied correctly.

## Need More Fonts?

To load multiple font weights or styles:

```json
{
  "theme": {
    "globalFont": "Source Sans Pro",
    "fonts": {
      "weights": {
        "light": 300,
        "normal": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      }
    }
  }
}
```

The system already loads weights 300, 400, 500, 600, 700 by default.

## Debug Checklist

- [ ] Verified font name spelling in tenant config
- [ ] Checked browser DevTools → Network → Font files loading
- [ ] Checked DevTools → Elements → `<html>` → CSS variables present
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Cleared browser cache
- [ ] Restarted dev server
- [ ] Tested in incognito/private mode
- [ ] Checked for JavaScript console errors
- [ ] Verified not on an admin page
